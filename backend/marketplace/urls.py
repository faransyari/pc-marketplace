from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    ComponentTypeViewSet,
    ProductViewSet,
    PCBuildViewSet,
    PCBuildComponentViewSet,
    UserViewSet,
    MessageViewSet,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'components', ComponentTypeViewSet)
router.register(r'products', ProductViewSet)
router.register(r'builds', PCBuildViewSet)
router.register(r'build-components', PCBuildComponentViewSet)
router.register(r'users', UserViewSet)
router.register(r'messages', MessageViewSet)


urlpatterns = [
    path('', include(router.urls)),

]
