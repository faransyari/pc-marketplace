from django.contrib import admin
from .models import Product, Category, ComponentType, PCBuild, PCBuildComponent

admin.site.register(Product)
admin.site.register(Category)
admin.site.register(ComponentType)
admin.site.register(PCBuild)
admin.site.register(PCBuildComponent)
