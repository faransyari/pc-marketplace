from django.db import models
from django.contrib.auth.models import User

# Category of the product: Components, Full PCs, Accessories, etc.
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


# Type of component: CPU, GPU, RAM, etc.
class ComponentType(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


# Product: Both official store & user-listed items
class Product(models.Model):
    SELLER_TYPE_CHOICES = [
        ('official', 'Official Store'),
        ('user', 'User Listed'),
    ]
    
    CONDITION_CHOICES = [
        ('new', 'New'),
        ('used', 'Used'),
        ('refurbished', 'Refurbished'),
    ]

    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    seller_type = models.CharField(max_length=10, choices=SELLER_TYPE_CHOICES, default='user')

    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    component_type = models.ForeignKey(ComponentType, on_delete=models.SET_NULL, null=True, blank=True)

    specs = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='product_images/', blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def is_official(self):
        return self.seller_type == 'official'

    def __str__(self):
        return f"[{'OFFICIAL' if self.is_official() else 'USER'}] {self.title}"

# A build made by a user using multiple compatible products
class PCBuild(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pc_builds')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    components = models.ManyToManyField(Product, through='PCBuildComponent')

    def __str__(self):
        return f"{self.name} by {self.user.username}"


# Intermediate table to track which components are in which build
class PCBuildComponent(models.Model):
    build = models.ForeignKey(PCBuild, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    component_type = models.ForeignKey(ComponentType, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.component_type} - {self.product.title} in {self.build.name}"
