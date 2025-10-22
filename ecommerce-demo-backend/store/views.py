from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.contrib.auth.models import User
from .models import Category, Product, Cart, CartItem, Order, OrderItem
from .serializers import (
    CategorySerializer, ProductSerializer, OrderSerializer,
    CartSerializer, CartItemSerializer, LoginSerializer,
    RegisterSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_available=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.GET.get('q', '')
        products = self.queryset.filter(name__icontains=query)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('category')
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    
    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current user's cart WITH ITEMS"""
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart = Cart.objects.prefetch_related('cartitem_set__product').get(id=cart.id)
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add item to user's cart"""
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product = Product.objects.get(id=product_id)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += int(quantity)
            cart_item.save()
        
        return Response({
            'message': 'Item added/updated',
            'cart_item_id': cart_item.id,
            'total_items': cart.cartitem_set.count()
        })
    
    @action(detail=False, methods=['post'])
    def update_item(self, request):
        """Update item quantity"""
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        cart = Cart.objects.get(user=request.user)
        cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
        cart_item.quantity = max(1, quantity)
        cart_item.save()
        
        return Response({'message': 'Quantity updated'})
    
    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        """Remove item from cart"""
        product_id = request.data.get('product_id')
        
        cart = Cart.objects.get(user=request.user)
        CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        
        return Response({'message': 'Item removed'})

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.all()
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def create_order(self, request):
        """Create order from cart"""
        cart = Cart.objects.filter(user=request.user).first()
        if not cart or not cart.cartitem_set.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        total_amount = sum(
            item.product.price * item.quantity 
            for item in cart.cartitem_set.all()
        )

        # Create order
        order = Order.objects.create(
            user=request.user,
            total_amount=total_amount,
            status='confirmed'
        )

        # Create order items
        for item in cart.cartitem_set.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )

        cart.cartitem_set.all().delete()

        serializer = OrderSerializer(order)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def listorders(self, request):
        """List user's orders"""
        orders = self.get_queryset()
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

class AuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.id,
                'username': user.username
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.id,
                'username': user.username
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        request.user.auth_token.delete()
        return Response({'message': 'Logged out'})

class CartItemViewSet(viewsets.ModelViewSet):  # ✅ NEW
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user if self.request.user.is_authenticated else None
        if user:
            cart = Cart.objects.filter(user=user).first()
            return CartItem.objects.filter(cart=cart)
        return CartItem.objects.none()
    
    def get_serializer_class(self):
        if self.action in ['update_quantity', 'remove_item']:
            return CartItemSerializer

class AdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]
    queryset = Order.objects.all()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Test if user is admin"""
        return Response({
            'is_admin': True,
            'username': request.user.username,
            'permissions': 'full'
        })

    @action(detail=False, methods=['get'])
    def orders(self, request):
        """Admin: Get ALL orders"""
        orders = Order.objects.select_related('user').prefetch_related(
            'orderitem_set__product'
        ).all()
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def delete_order(self, request):
        """Admin: Delete order"""
        try:
            order_id = request.data.get('order_id')
            order = Order.objects.get(id=order_id)
            order.delete()
            return Response({'message': 'Order deleted'})
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
