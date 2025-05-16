from marketplace.models import Category, ComponentType

def run():
    categories = [
        "Component",
        "Peripheral",
        "Full PC",
        "Accessory",
        "Monitor",
        "Keyboard",
        "Mouse",
        "Headset"
    ]

    component_types = [
        "CPU",
        "GPU",
        "Motherboard",
        "RAM",
        "SSD",
        "HDD",
        "Power Supply",
        "Case",
        "Cooler",
        "Monitor",
        "Keyboard",
        "Mouse",
        "Headset"
    ]

    for name in categories:
        obj, created = Category.objects.get_or_create(name=name)
        if created:
            print(f"Created category: {obj.name}")

    for name in component_types:
        obj, created = ComponentType.objects.get_or_create(name=name)
        if created:
            print(f"Created component type: {obj.name}")

    print("✅ Seeding complete.")
