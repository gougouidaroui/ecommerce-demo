from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'carts', views.CartViewSet)
router.register(r'orders', views.OrderViewSet)
router.register(r'auth', views.AuthViewSet, basename='auth')
router.register(r'cartitems', views.CartItemViewSet)
router.register(r'admin', views.AdminViewSet, basename='admin')

admin_router = DefaultRouter()
admin_router.register(r'products', views.AdminProductViewSet)
admin_router.register(r'categories', views.CategoryViewSet)  # Reuse for admin

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', include(admin_router.urls)),
]
