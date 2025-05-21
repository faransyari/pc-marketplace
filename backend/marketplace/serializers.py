from rest_framework import serializers
from .models import Category, ComponentType, Product, PCBuild, PCBuildComponent, Message
from django.contrib.auth.models import User

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
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ComponentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentType
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    component_type = serializers.PrimaryKeyRelatedField(queryset=ComponentType.objects.all(), required=False, allow_null=True)
    seller = serializers.PrimaryKeyRelatedField(read_only=True)  # Set in view using request.user

    class Meta:
        model = Product
        fields = [
            'id', 'seller', 'seller_type', 'title', 'description', 'price',
            'condition', 'category', 'component_type', 'specs',
            'image', 'location', 'created_at'
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['seller'] = request.user
        return super().create(validated_data)



class PCBuildComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PCBuildComponent
        fields = ['id', 'build', 'product', 'component_type']


class PCBuildSerializer(serializers.ModelSerializer):
    components = PCBuildComponentSerializer(source='pcbuildcomponent_set', many=True, read_only=True)

    class Meta:
        model = PCBuild
        fields = ['id', 'user', 'name', 'description', 'created_at', 'components']
        read_only_fields = ['user']

class MessageSerializer(serializers.ModelSerializer):
    sender_first_name = serializers.CharField(source='sender.first_name', read_only=True)
    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'product', 'content', 'timestamp', 'sender_first_name']
        read_only_fields = ['sender', 'timestamp']