from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from .models import (
    Product,
    Category,
    ComponentType,
    PCBuild,
    PCBuildComponent,
    Message,
    SiteSetting,
    HomepageSection,
)


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(ComponentType)
class ComponentTypeAdmin(ModelAdmin):
    list_display = ('name', 'slot_key')
    list_filter = ('slot_key',)
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = ('title', 'brand', 'seller_type', 'category', 'component_type', 'price', 'stock', 'is_active')
    list_filter = ('seller_type', 'is_active', 'condition', 'category', 'component_type')
    list_editable = ('price', 'stock', 'is_active')
    search_fields = ('title', 'brand', 'description')
    prepopulated_fields = {'slug': ('title',)}
    autocomplete_fields = ('category', 'component_type')
    fieldsets = (
        (None, {'fields': ('title', 'slug', 'brand', 'description', 'seller', 'seller_type', 'condition', 'is_active')}),
        ('Price and stock', {'fields': ('price', 'stock', 'location')}),
        ('Catalog', {'fields': ('category', 'component_type', 'image', 'image_url')}),
        ('Compatibility', {'fields': ('socket', 'memory_type', 'form_factor', 'wattage', 'specs')}),
        ('Capacity (for quantity checks)', {
            'description': 'Fill in the ones that apply to this part type. Leave the rest blank.',
            'fields': (
                ('memory_slots', 'max_memory_gb'),
                ('m2_slots', 'sata_ports', 'fan_headers'),
                ('memory_modules', 'memory_capacity_gb'),
                'storage_interface',
                ('fan_mounts', 'fan_size'),
            ),
        }),
    )


class PCBuildComponentInline(TabularInline):
    model = PCBuildComponent
    extra = 0


@admin.register(PCBuild)
class PCBuildAdmin(ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    search_fields = ('name', 'user__username')
    inlines = [PCBuildComponentInline]


@admin.register(Message)
class MessageAdmin(ModelAdmin):
    list_display = ('sender', 'recipient', 'product', 'timestamp')
    search_fields = ('sender__username', 'recipient__username', 'content')


@admin.register(SiteSetting)
class SiteSettingAdmin(ModelAdmin):
    list_display = ('logo_text', 'contact_email', 'primary_color')

    def has_add_permission(self, request):
        return not SiteSetting.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(HomepageSection)
class HomepageSectionAdmin(ModelAdmin):
    list_display = ('order', 'title', 'button_label', 'is_active')
    list_editable = ('title', 'button_label', 'is_active')
    list_filter = ('is_active',)
