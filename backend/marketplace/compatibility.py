import math


def _by_slot(products):
    grouped = {}
    for product in products:
        slot = product.component_type.slot_key if product.component_type else ''
        if slot:
            grouped.setdefault(slot, []).append(product)
    return grouped


def analyze(products):
    grouped = _by_slot(products)
    warnings = []
    notices = []

    cpu = grouped.get('cpu', [None])[0]
    mobo = grouped.get('mobo', [None])[0]
    ram = grouped.get('ram', [None])[0]
    case = grouped.get('case', [None])[0]
    psu = grouped.get('psu', [None])[0]

    if cpu and mobo and cpu.socket and mobo.socket and cpu.socket != mobo.socket:
        warnings.append(
            f"CPU socket {cpu.socket} does not match motherboard socket {mobo.socket}."
        )

    if ram and mobo and ram.memory_type and mobo.memory_type and ram.memory_type != mobo.memory_type:
        warnings.append(
            f"RAM {ram.memory_type} is not supported by the motherboard ({mobo.memory_type})."
        )

    if case and mobo and case.form_factor and mobo.form_factor:
        supported = [f.strip().lower() for f in case.form_factor.split(',')]
        if mobo.form_factor.strip().lower() not in supported:
            warnings.append(
                f"Motherboard form factor {mobo.form_factor} may not fit the case ({case.form_factor})."
            )

    total_draw = 0
    for slot, items in grouped.items():
        if slot == 'psu':
            continue
        for item in items:
            if item.wattage:
                total_draw += item.wattage

    recommended = int(math.ceil((total_draw * 1.2) / 50.0) * 50) if total_draw else 0

    psu_capacity = psu.wattage if psu and psu.wattage else 0
    if psu and psu_capacity and recommended and psu_capacity < recommended:
        warnings.append(
            f"Power supply is {psu_capacity}W but the build needs about {recommended}W."
        )

    for required in ('cpu', 'mobo', 'ram'):
        if required not in grouped:
            notices.append(f"No {required.upper()} selected yet.")

    total_price = sum(float(p.price) for p in products)

    return {
        'compatible': len(warnings) == 0,
        'warnings': warnings,
        'notices': notices,
        'estimated_wattage': total_draw,
        'recommended_psu_wattage': recommended,
        'total_price': round(total_price, 2),
    }
