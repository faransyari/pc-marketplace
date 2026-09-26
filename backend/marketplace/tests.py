from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .compatibility import analyze
from .models import ComponentType, Product


class CompatibilityTests(TestCase):
    def setUp(self):
        self.seller = User.objects.create(username='store')
        self.types = {
            slot: ComponentType.objects.create(name=name, slot_key=slot)
            for slot, name in [
                ('cpu', 'CPU'), ('mobo', 'Motherboard'), ('ram', 'Memory'), ('storage', 'Storage'),
                ('case', 'Case'), ('fan', 'Case Fan'), ('psu', 'Power Supply'), ('gpu', 'Graphics Card'),
            ]
        }
        self.mobo = self.part('mobo', 'Board', socket='AM5', memory_type='DDR5', form_factor='ATX',
                              memory_slots=4, max_memory_gb=128, m2_slots=2, sata_ports=2, fan_headers=3)
        self.kit = self.part('ram', 'Kit 2x16', memory_type='DDR5', memory_modules=2, memory_capacity_gb=32, wattage=10)
        self.m2 = self.part('storage', 'NVMe', storage_interface='M.2', wattage=7)
        self.sata = self.part('storage', 'SATA SSD', storage_interface='SATA', wattage=4)
        self.case = self.part('case', 'Case', form_factor='ATX,Micro-ATX', fan_mounts=4, fan_size='120,140')
        self.fan = self.part('fan', 'Fan 120', fan_size='120', wattage=2)

    def part(self, slot, title, **specs):
        return Product.objects.create(
            seller=self.seller, title=title, price=Decimal('100'), component_type=self.types[slot], **specs
        )

    def test_two_kits_fill_four_slots_cleanly(self):
        result = analyze([self.mobo, (self.kit, 2)])
        self.assertEqual(result['warnings'], [])
        self.assertEqual(result['capacity']['memory_slots'], {'used': 4, 'total': 4})
        self.assertEqual(result['capacity']['memory_gb'], {'used': 64, 'total': 128})

    def test_too_many_sticks_for_the_board(self):
        result = analyze([self.mobo, (self.kit, 3)])
        self.assertTrue(any('6 memory sticks' in w for w in result['warnings']))

    def test_memory_over_board_limit(self):
        big = self.part('ram', 'Kit 2x96', memory_type='DDR5', memory_modules=2, memory_capacity_gb=192)
        result = analyze([self.mobo, big])
        self.assertTrue(any('128 GB limit' in w for w in result['warnings']))

    def test_mixed_kits_get_a_notice(self):
        other = self.part('ram', 'Other kit', memory_type='DDR5', memory_modules=2, memory_capacity_gb=32)
        result = analyze([self.mobo, self.kit, other])
        self.assertTrue(any('Mixing memory kits' in n for n in result['notices']))

    def test_storage_ports_counted_by_interface(self):
        ok = analyze([self.mobo, (self.m2, 2), (self.sata, 2)])
        self.assertEqual(ok['warnings'], [])
        bad = analyze([self.mobo, (self.m2, 3), (self.sata, 3)])
        self.assertTrue(any('3 M.2 drives' in w for w in bad['warnings']))
        self.assertTrue(any('3 SATA drives' in w for w in bad['warnings']))

    def test_fans_against_case_mounts_size_and_headers(self):
        result = analyze([self.mobo, self.case, (self.fan, 5)])
        self.assertTrue(any('only has 4 fan mounts' in w for w in result['warnings']))
        self.assertTrue(any('fan hub' in n for n in result['notices']))

        big = self.part('fan', 'Fan 200', fan_size='200')
        result = analyze([self.case, big])
        self.assertTrue(any('200mm' in w for w in result['warnings']))

    def test_single_slot_parts_only_once(self):
        result = analyze([(self.mobo, 2)])
        self.assertTrue(any('one motherboard' in w for w in result['warnings']))

    def test_power_scales_with_quantity(self):
        result = analyze([(self.fan, 4), (self.kit, 2)])
        self.assertEqual(result['estimated_wattage'], 4 * 2 + 2 * 10)

    def test_validate_endpoint_accepts_quantities(self):
        client = APIClient()
        res = client.post('/api/builds/validate/', {
            'items': [{'product': self.mobo.id, 'quantity': 1}, {'product': self.kit.id, 'quantity': 3}],
        }, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['capacity']['memory_slots']['used'], 6)
        self.assertEqual(res.data['part_count'], 4)

    def test_validate_endpoint_still_accepts_product_ids(self):
        client = APIClient()
        res = client.post('/api/builds/validate/', {'products': [self.kit.id, self.kit.id]}, format='json')
        self.assertEqual(res.data['capacity']['memory_slots']['used'], 4)
