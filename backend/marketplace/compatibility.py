import math

SINGLE_SLOT_LABELS = {
    'cpu': 'CPU',
    'mobo': 'motherboard',
    'gpu': 'graphics card',
    'psu': 'power supply',
    'case': 'case',
    'cooler': 'CPU cooler',
}


def _normalise(entries):
    """Accept products or (product, quantity) pairs and merge duplicates."""
    merged = {}
    for entry in entries:
        product, qty = entry if isinstance(entry, tuple) else (entry, 1)
        qty = max(int(qty or 0), 0)
        if not qty:
            continue
        if product.pk in merged:
            merged[product.pk][1] += qty
        else:
            merged[product.pk] = [product, qty]
    return [(p, q) for p, q in merged.values()]


def _by_slot(items):
    grouped = {}
    for product, qty in items:
        slot = product.component_type.slot_key if product.component_type else ''
        if slot:
            grouped.setdefault(slot, []).append((product, qty))
    return grouped


def _sizes(value):
    return {s.strip().lower().replace('mm', '') for s in (value or '').split(',') if s.strip()}


def _plural(n, word):
    return f"{n} {word}{'' if n == 1 else 's'}"


def analyze(entries):
    items = _normalise(entries)
    grouped = _by_slot(items)
    warnings = []
    notices = []

    def first(slot):
        return grouped.get(slot, [(None, 0)])[0][0]

    cpu, mobo, case, psu = first('cpu'), first('mobo'), first('case'), first('psu')
    rams = grouped.get('ram', [])
    drives = grouped.get('storage', [])
    fans = grouped.get('fan', [])

    # One-per-build parts.
    for slot, label in SINGLE_SLOT_LABELS.items():
        count = sum(q for _, q in grouped.get(slot, []))
        if count > 1:
            warnings.append(f"A build takes one {label}, but this one has {count}.")

    # Socket.
    if cpu and mobo and cpu.socket and mobo.socket and cpu.socket != mobo.socket:
        warnings.append(f"CPU socket {cpu.socket} does not match motherboard socket {mobo.socket}.")

    # Memory type, sticks, capacity.
    for ram, _ in rams:
        if mobo and ram.memory_type and mobo.memory_type and ram.memory_type != mobo.memory_type:
            warnings.append(f"{ram.title} is {ram.memory_type}, but the motherboard takes {mobo.memory_type}.")

    sticks = sum((r.memory_modules or 1) * q for r, q in rams)
    memory_gb = sum((r.memory_capacity_gb or 0) * q for r, q in rams)
    if mobo and mobo.memory_slots and sticks > mobo.memory_slots:
        warnings.append(
            f"{_plural(sticks, 'memory stick')} won't fit: the motherboard has {_plural(mobo.memory_slots, 'slot')}."
        )
    if mobo and mobo.max_memory_gb and memory_gb > mobo.max_memory_gb:
        warnings.append(f"{memory_gb} GB of memory is over the motherboard's {mobo.max_memory_gb} GB limit.")
    if len({r.pk for r, _ in rams}) > 1:
        notices.append("Mixing memory kits can force every stick down to the slowest kit's speed.")
    elif rams and sticks == 3:
        notices.append("Three sticks can't run in dual channel. Two or four is the sweet spot.")

    # Storage ports.
    m2_drives = sum(q for d, q in drives if d.storage_interface == 'M.2')
    sata_drives = sum(q for d, q in drives if d.storage_interface == 'SATA')
    if mobo and mobo.m2_slots is not None and m2_drives > mobo.m2_slots:
        warnings.append(f"{_plural(m2_drives, 'M.2 drive')} but the motherboard has {_plural(mobo.m2_slots, 'M.2 slot')}.")
    if mobo and mobo.sata_ports is not None and sata_drives > mobo.sata_ports:
        warnings.append(f"{_plural(sata_drives, 'SATA drive')} but the motherboard has {_plural(mobo.sata_ports, 'SATA port')}.")

    # Fans: case mounts, size, headers.
    fan_count = sum(q for _, q in fans)
    if case and case.fan_mounts is not None and fan_count > case.fan_mounts:
        warnings.append(f"{_plural(fan_count, 'fan')} but the case only has {_plural(case.fan_mounts, 'fan mount')}.")
    case_sizes = _sizes(case.fan_size) if case else set()
    for fan, _ in fans:
        size = next(iter(_sizes(fan.fan_size)), '')
        if case_sizes and size and size not in case_sizes:
            supported = ' or '.join(f'{s}mm' for s in sorted(case_sizes))
            warnings.append(f"{fan.title} is {size}mm, but the case takes {supported} fans.")
    if mobo and mobo.fan_headers and fan_count > mobo.fan_headers:
        notices.append(
            f"{_plural(fan_count, 'fan')} and {_plural(mobo.fan_headers, 'fan header')}: plan on a fan hub or splitter."
        )

    # Form factor.
    if case and mobo and case.form_factor and mobo.form_factor:
        supported = [f.strip().lower() for f in case.form_factor.split(',')]
        if mobo.form_factor.strip().lower() not in supported:
            warnings.append(f"Motherboard form factor {mobo.form_factor} may not fit the case ({case.form_factor}).")

    # Power.
    total_draw = 0
    for slot, slot_items in grouped.items():
        if slot == 'psu':
            continue
        for item, qty in slot_items:
            if item.wattage:
                total_draw += item.wattage * qty

    recommended = int(math.ceil((total_draw * 1.2) / 50.0) * 50) if total_draw else 0
    psu_capacity = psu.wattage if psu and psu.wattage else 0
    if psu and psu_capacity and recommended and psu_capacity < recommended:
        warnings.append(f"Power supply is {psu_capacity}W but the build needs about {recommended}W.")

    for required, label in (('cpu', 'CPU'), ('mobo', 'motherboard'), ('ram', 'memory')):
        if required not in grouped:
            notices.append(f"No {label} picked yet.")

    total_price = sum(float(p.price) * q for p, q in items)

    def meter(used, total):
        return {'used': used, 'total': total}

    capacity = {
        'memory_slots': meter(sticks, mobo.memory_slots if mobo else None),
        'memory_gb': meter(memory_gb, mobo.max_memory_gb if mobo else None),
        'm2_slots': meter(m2_drives, mobo.m2_slots if mobo else None),
        'sata_ports': meter(sata_drives, mobo.sata_ports if mobo else None),
        'fan_mounts': meter(fan_count, case.fan_mounts if case else None),
        'fan_headers': meter(fan_count, mobo.fan_headers if mobo else None),
    }

    return {
        'compatible': len(warnings) == 0,
        'warnings': warnings,
        'notices': notices,
        'estimated_wattage': total_draw,
        'recommended_psu_wattage': recommended,
        'total_price': round(total_price, 2),
        'part_count': sum(q for _, q in items),
        'capacity': capacity,
    }
