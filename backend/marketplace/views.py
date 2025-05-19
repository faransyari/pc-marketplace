from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Category, ComponentType, Product, PCBuild, PCBuildComponent, Message
from .serializers import (
    CategorySerializer,
    ComponentTypeSerializer,
    ProductSerializer,
    PCBuildSerializer,
    PCBuildComponentSerializer,
    UserSerializer,
    MessageSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ComponentTypeViewSet(viewsets.ModelViewSet):
    queryset = ComponentType.objects.all()
    serializer_class = ComponentTypeSerializer


# views.py
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer

    def get_serializer_context(self):
        return {'request': self.request}



class PCBuildViewSet(viewsets.ModelViewSet):
    queryset = PCBuild.objects.all()
    serializer_class = PCBuildSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PCBuildComponentViewSet(viewsets.ModelViewSet):
    queryset = PCBuildComponent.objects.all()
    serializer_class = PCBuildComponentSerializer

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()  # ✅ Required by router
    serializer_class = MessageSerializer

    def get_queryset(self):
        product_id = self.request.query_params.get('product')
        if product_id:
            return Message.objects.filter(product_id=product_id)
        return Message.objects.all()

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

