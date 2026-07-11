from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ComponentType(models.Model):
    SLOT_CHOICES = [
        ('cpu', 'CPU'),
        ('mobo', 'Motherboard'),
        ('ram', 'Memory'),
        ('gpu', 'Graphics Card'),
        ('psu', 'Power Supply'),
        ('storage', 'Storage'),
        ('case', 'Case'),
        ('cooler', 'Cooler'),
    ]

    name = models.CharField(max_length=100, unique=True)
    slot_key = models.CharField(max_length=20, choices=SLOT_CHOICES, blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


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
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    brand = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=14, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='new')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    component_type = models.ForeignKey(ComponentType, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')

    wattage = models.PositiveIntegerField(null=True, blank=True)
    socket = models.CharField(max_length=60, blank=True)
    memory_type = models.CharField(max_length=30, blank=True)
    form_factor = models.CharField(max_length=40, blank=True)

    specs = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='product_images/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True)
    location = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:250]
            slug = base
            counter = 1
            while Product.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                slug = f"{base}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def is_official(self):
        return self.seller_type == 'official'

    @property
    def image_src(self):
        if self.image:
            return self.image.url
        return self.image_url

    def __str__(self):
        return f"[{'OFFICIAL' if self.is_official() else 'USER'}] {self.title}"


class PCBuild(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pc_builds')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    components = models.ManyToManyField(Product, through='PCBuildComponent')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} by {self.user.username}"


class PCBuildComponent(models.Model):
    build = models.ForeignKey(PCBuild, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    component_type = models.ForeignKey(ComponentType, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.component_type} - {self.product.title} in {self.build.name}"


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"Message from {self.sender.username} to {self.recipient.username} about {self.product.title}"


class SiteSetting(models.Model):
    logo_text = models.CharField(max_length=80, default='PC Marketplace')
    contact_email = models.EmailField(default='hello@pcmarketplace.test')
    primary_color = models.CharField(max_length=20, default='#7c3aed')
    hero_title = models.CharField(max_length=120, default='Everything PCs')
    hero_subtitle = models.CharField(max_length=200, default='Buy, sell, and build your dream machine.')
    hero_cta_label = models.CharField(max_length=60, default='Shop Now')
    hero_cta_link = models.CharField(max_length=200, default='/products')
    footer_about = models.TextField(default='Your marketplace for buying, selling, and building PCs.')
    footer_contact = models.CharField(max_length=200, blank=True)

    class Meta:
        verbose_name = "Site Setting"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Site Settings"


class HomepageSection(models.Model):
    order = models.PositiveIntegerField(default=0)
    title = models.CharField(max_length=160)
    subtitle = models.CharField(max_length=240, blank=True)
    image = models.ImageField(upload_to='homepage/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True)
    button_label = models.CharField(max_length=60, blank=True)
    button_link = models.CharField(max_length=200, blank=True)
    background = models.CharField(max_length=60, default='#f3f4f6')
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    @property
    def image_src(self):
        if self.image:
            return self.image.url
        return self.image_url

    def __str__(self):
        return f"{self.order}. {self.title}"
