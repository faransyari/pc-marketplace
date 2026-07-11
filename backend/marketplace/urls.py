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
    SiteSettingView,
    HomepageSectionViewSet,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'components', ComponentTypeViewSet)
router.register(r'products', ProductViewSet, basename='product')
router.register(r'builds', PCBuildViewSet, basename='build')
router.register(r'build-components', PCBuildComponentViewSet, basename='build-component')
router.register(r'users', UserViewSet)
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'homepage-sections', HomepageSectionViewSet, basename='homepage-section')

urlpatterns = [
    path('site-settings/', SiteSettingView.as_view(), name='site-settings'),
    path('', include(router.urls)),
]
