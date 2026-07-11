from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.db.models import Q

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
from .serializers import (
    CategorySerializer,
    ComponentTypeSerializer,
    ProductSerializer,
    PCBuildSerializer,
    PCBuildComponentSerializer,
    UserSerializer,
    MessageSerializer,
    SiteSettingSerializer,
    HomepageSectionSerializer,
)
from .permissions import IsOwnerOrReadOnly
from .compatibility import analyze


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        return Response(UserSerializer(request.user).data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser | permissions.IsAuthenticatedOrReadOnly]


class ComponentTypeViewSet(viewsets.ModelViewSet):
    queryset = ComponentType.objects.all()
    serializer_class = ComponentTypeSerializer
    permission_classes = [permissions.IsAdminUser | permissions.IsAuthenticatedOrReadOnly]


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    owner_field = 'seller'
    lookup_field = 'slug'

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).select_related('category', 'component_type', 'seller')
        params = self.request.query_params

        category = params.get('category')
        if category:
            if category.isdigit():
                qs = qs.filter(category_id=category)
            else:
                qs = qs.filter(category__slug=category)

        component_type = params.get('component_type')
        if component_type and component_type.isdigit():
            qs = qs.filter(component_type_id=component_type)

        slot = params.get('slot')
        if slot:
            qs = qs.filter(component_type__slot_key=slot)

        seller_type = params.get('seller_type')
        if seller_type:
            qs = qs.filter(seller_type=seller_type)

        mine = params.get('mine')
        if mine and self.request.user.is_authenticated:
            qs = Product.objects.filter(seller=self.request.user).select_related('category', 'component_type', 'seller')

        search = params.get('search')
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(brand__icontains=search) | Q(description__icontains=search))

        min_price = params.get('min_price')
        if min_price:
            qs = qs.filter(price__gte=min_price)

        max_price = params.get('max_price')
        if max_price:
            qs = qs.filter(price__lte=max_price)

        ordering = params.get('ordering')
        if ordering in ('price', '-price', 'created_at', '-created_at', 'title', '-title'):
            qs = qs.order_by(ordering)

        return qs

    def get_serializer_context(self):
        return {'request': self.request}


class PCBuildViewSet(viewsets.ModelViewSet):
    serializer_class = PCBuildSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    owner_field = 'user'

    def get_queryset(self):
        return PCBuild.objects.filter(user=self.request.user).prefetch_related('items__product')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def validate(self, request):
        product_ids = request.data.get('products', [])
        products = list(Product.objects.filter(id__in=product_ids).select_related('component_type'))
        return Response(analyze(products))


class PCBuildComponentViewSet(viewsets.ModelViewSet):
    queryset = PCBuildComponent.objects.all()
    serializer_class = PCBuildComponentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PCBuildComponent.objects.filter(build__user=self.request.user)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Message.objects.filter(Q(sender=user) | Q(recipient=user))
        product_id = self.request.query_params.get('product')
        if product_id:
            qs = qs.filter(product_id=product_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


class SiteSettingView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(SiteSettingSerializer(SiteSetting.load()).data)


class HomepageSectionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HomepageSectionSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return HomepageSection.objects.filter(is_active=True)
