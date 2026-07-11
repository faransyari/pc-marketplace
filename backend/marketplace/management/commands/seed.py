from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from marketplace.models import (
    Category,
    ComponentType,
    Product,
    SiteSetting,
    HomepageSection,
)


COMPONENT_TYPES = [
    ('CPU', 'cpu'),
    ('Motherboard', 'mobo'),
    ('Memory', 'ram'),
    ('Graphics Card', 'gpu'),
    ('Power Supply', 'psu'),
    ('Storage', 'storage'),
    ('Case', 'case'),
    ('Cooler', 'cooler'),
    ('Monitor', ''),
    ('Keyboard', ''),
    ('Mouse', ''),
    ('Headset', ''),
]

CATEGORIES = ['Components', 'Peripherals', 'Full PCs', 'Accessories']

PRODUCTS = [
    ('AMD Ryzen 7 7800X3D', 'AMD', 'CPU', 'Components', 6499000, 25, 120, 'AM5', '', '', 'official', 'new'),
    ('AMD Ryzen 5 7600X', 'AMD', 'CPU', 'Components', 3699000, 40, 105, 'AM5', '', '', 'official', 'new'),
    ('Intel Core i5-13600K', 'Intel', 'CPU', 'Components', 4699000, 30, 125, 'LGA1700', '', '', 'official', 'new'),
    ('ASUS ROG STRIX B650-E', 'ASUS', 'Motherboard', 'Components', 4199000, 15, 0, 'AM5', 'DDR5', 'ATX', 'official', 'new'),
    ('MSI PRO Z790-P', 'MSI', 'Motherboard', 'Components', 3599000, 18, 0, 'LGA1700', 'DDR5', 'ATX', 'official', 'new'),
    ('Gigabyte B650M DS3H', 'Gigabyte', 'Motherboard', 'Components', 2599000, 22, 0, 'AM5', 'DDR5', 'Micro-ATX', 'official', 'new'),
    ('Corsair Vengeance 32GB DDR5', 'Corsair', 'Memory', 'Components', 1799000, 50, 10, '', 'DDR5', '', 'official', 'new'),
    ('G.Skill Trident Z5 16GB DDR5', 'G.Skill', 'Memory', 'Components', 1199000, 60, 8, '', 'DDR5', '', 'official', 'new'),
    ('Corsair Vengeance 32GB DDR4', 'Corsair', 'Memory', 'Components', 1299000, 45, 10, '', 'DDR4', '', 'official', 'new'),
    ('NVIDIA GeForce RTX 4070', 'NVIDIA', 'Graphics Card', 'Components', 8999000, 20, 200, '', '', '', 'official', 'new'),
    ('NVIDIA GeForce RTX 4090', 'NVIDIA', 'Graphics Card', 'Components', 25999000, 8, 450, '', '', '', 'official', 'new'),
    ('AMD Radeon RX 7800 XT', 'AMD', 'Graphics Card', 'Components', 7999000, 16, 263, '', '', '', 'official', 'new'),
    ('Corsair RM750e 750W', 'Corsair', 'Power Supply', 'Components', 1599000, 40, 750, '', '', '', 'official', 'new'),
    ('Corsair RM1000x 1000W', 'Corsair', 'Power Supply', 'Components', 2899000, 25, 1000, '', '', '', 'official', 'new'),
    ('EVGA 500 BR 500W', 'EVGA', 'Power Supply', 'Components', 799000, 35, 500, '', '', '', 'official', 'new'),
    ('Samsung 990 Pro 2TB NVMe', 'Samsung', 'Storage', 'Components', 2799000, 30, 8, '', '', '', 'official', 'new'),
    ('WD Black SN770 1TB NVMe', 'Western Digital', 'Storage', 'Components', 1399000, 45, 7, '', '', '', 'official', 'new'),
    ('NZXT H7 Flow', 'NZXT', 'Case', 'Components', 2099000, 20, 0, '', '', 'ATX,Micro-ATX,Mini-ITX', 'official', 'new'),
    ('Fractal Design Meshify 2', 'Fractal', 'Case', 'Components', 2399000, 14, 0, '', '', 'ATX,Micro-ATX', 'official', 'new'),
    ('Noctua NH-D15', 'Noctua', 'Cooler', 'Components', 1799000, 25, 0, '', '', '', 'official', 'new'),
    ('Corsair iCUE H100i', 'Corsair', 'Cooler', 'Components', 2099000, 18, 5, '', '', '', 'official', 'new'),
    ('LG UltraGear 27" 144Hz', 'LG', 'Monitor', 'Peripherals', 4799000, 20, 0, '', '', '', 'official', 'new'),
    ('Keychron K2 Wireless', 'Keychron', 'Keyboard', 'Peripherals', 1499000, 40, 0, '', '', '', 'official', 'new'),
    ('Logitech G502 Hero', 'Logitech', 'Mouse', 'Peripherals', 799000, 60, 0, '', '', '', 'official', 'new'),
    ('HyperX Cloud II', 'HyperX', 'Headset', 'Peripherals', 1599000, 35, 0, '', '', '', 'official', 'new'),
    ('Prebuilt Gaming PC RTX 4070', 'PCM Custom', 'Graphics Card', 'Full PCs', 22999000, 10, 500, '', '', '', 'official', 'new'),
]

USER_PRODUCTS = [
    ('Used RTX 3080 Founders', 'NVIDIA', 'Graphics Card', 'Components', 5499000, 1, 320, '', '', '', 'Jakarta', 'used'),
    ('Ryzen 5 5600X (barely used)', 'AMD', 'CPU', 'Components', 1899000, 1, 65, 'AM4', '', '', 'Bandung', 'used'),
]

HOMEPAGE_SECTIONS = [
    (1, 'Gaming Computers', 'Built for performance, ready out of the box.', '/images/gaming-pc.png', 'Shop Now', '/products', '#f3f4f6'),
    (2, 'Build Your Dream PC', 'Pick your parts and we check compatibility as you go.', '/images/home-pc.png', 'Build Your Own', '/builder', '#ede9fe'),
    (3, 'Buy & Sell Parts', 'A marketplace for new and used components from real sellers.', '', 'Browse Marketplace', '/products?seller_type=user', '#f3f4f6'),
]


class Command(BaseCommand):
    help = 'Seed the marketplace with catalog, homepage, and site settings.'

    def handle(self, *args, **options):
        store, _ = User.objects.get_or_create(
            username='pcm_store',
            defaults={'first_name': 'PC Marketplace', 'email': 'store@pcmarketplace.test'},
        )
        seller, created_seller = User.objects.get_or_create(
            username='demo_seller',
            defaults={'first_name': 'Demo', 'email': 'seller@pcmarketplace.test'},
        )
        if created_seller:
            seller.set_password('demopass123')
            seller.save()

        categories = {}
        for name in CATEGORIES:
            categories[name] = Category.objects.get_or_create(name=name)[0]

        types = {}
        for name, slot in COMPONENT_TYPES:
            obj, _ = ComponentType.objects.get_or_create(name=name)
            if obj.slot_key != slot:
                obj.slot_key = slot
                obj.save()
            types[name] = obj

        self._seed_products(PRODUCTS, categories, types, store, 'official')
        self._seed_products(USER_PRODUCTS, categories, types, seller, 'user', location_col=True)

        SiteSetting.load()

        for order, title, subtitle, image_url, label, link, bg in HOMEPAGE_SECTIONS:
            HomepageSection.objects.get_or_create(
                order=order,
                defaults={
                    'title': title,
                    'subtitle': subtitle,
                    'image_url': image_url,
                    'button_label': label,
                    'button_link': link,
                    'background': bg,
                },
            )

        self.stdout.write(self.style.SUCCESS('Seed complete.'))

    def _seed_products(self, rows, categories, types, seller, seller_type, location_col=False):
        for row in rows:
            if location_col:
                title, brand, ctype, cat, price, stock, watt, socket, mem, form, location, condition = row
            else:
                title, brand, ctype, cat, price, stock, watt, socket, mem, form, _seller_type, condition = row
                location = ''
            Product.objects.get_or_create(
                title=title,
                defaults={
                    'seller': seller,
                    'seller_type': seller_type,
                    'brand': brand,
                    'description': f'{brand} {title}. High quality {ctype.lower()} for your build.',
                    'price': Decimal(str(price)),
                    'stock': stock,
                    'condition': condition,
                    'category': categories[cat],
                    'component_type': types[ctype],
                    'wattage': watt or None,
                    'socket': socket,
                    'memory_type': mem,
                    'form_factor': form,
                    'location': location,
                },
            )
