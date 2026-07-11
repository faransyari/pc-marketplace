from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Category,
    ComponentType,
    Product,
    PCBuild,
    PCBuildComponent,
    Message,
    SiteSetting,
    HomepageSection,
)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class ComponentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentType
        fields = ['id', 'name', 'slot_key']


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=False, allow_null=True)
    component_type = serializers.PrimaryKeyRelatedField(queryset=ComponentType.objects.all(), required=False, allow_null=True)
    seller = serializers.PrimaryKeyRelatedField(read_only=True)
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    component_type_name = serializers.CharField(source='component_type.name', read_only=True)
    slot_key = serializers.CharField(source='component_type.slot_key', read_only=True)
    image_src = serializers.CharField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'seller', 'seller_username', 'seller_type', 'title', 'slug', 'brand',
            'description', 'price', 'stock', 'is_active', 'condition',
            'category', 'category_name', 'component_type', 'component_type_name', 'slot_key',
            'wattage', 'socket', 'memory_type', 'form_factor',
            'specs', 'image', 'image_url', 'image_src', 'location', 'created_at',
        ]
        read_only_fields = ['seller', 'slug', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['seller'] = request.user
        return super().create(validated_data)


class PCBuildComponentSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = PCBuildComponent
        fields = ['id', 'build', 'product', 'product_detail', 'component_type']


class PCBuildSerializer(serializers.ModelSerializer):
    items = PCBuildComponentSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = PCBuild
        fields = ['id', 'user', 'name', 'description', 'created_at', 'items', 'total_price']
        read_only_fields = ['user']

    def get_total_price(self, obj):
        return sum(float(item.product.price) for item in obj.items.all())


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_username', 'recipient', 'product', 'content', 'timestamp']
        read_only_fields = ['sender', 'timestamp']


class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = [
            'logo_text', 'contact_email', 'primary_color',
            'hero_title', 'hero_subtitle', 'hero_cta_label', 'hero_cta_link',
            'footer_about', 'footer_contact',
        ]


class HomepageSectionSerializer(serializers.ModelSerializer):
    image_src = serializers.CharField(read_only=True)

    class Meta:
        model = HomepageSection
        fields = [
            'id', 'order', 'title', 'subtitle', 'image_src',
            'button_label', 'button_link', 'background', 'is_active',
        ]
