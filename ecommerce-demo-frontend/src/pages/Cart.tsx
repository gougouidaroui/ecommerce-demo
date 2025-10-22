import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: string;
    image?: string;  // ✅ Added for images
  };
  quantity: number;
}

const Cart = () => {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);

  const fetchCart = async () => {
    try {
      const response = await api.get('carts/current/');
      setCartItems(response.data.items || []);
    } catch (error: any) {
      if (error.response?.status === 403) {
        window.location.href = '/';
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: MATCHES YOUR BACKEND - USES PRODUCT_ID!
  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) return; // Prevent negative
    
    try {
      await api.post('carts/update_item/', { 
        product_id: productId, 
        quantity 
      });
      fetchCart(); // Refresh cart
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  // ✅ FIXED: MATCHES YOUR BACKEND - USES PRODUCT_ID!
  const removeItem = async (productId: number) => {
    try {
      await api.delete('carts/remove_item/', { 
        data: { product_id: productId }  // DELETE with body
      });
      fetchCart(); // Refresh cart
    } catch (error) {
      console.error('Remove failed:', error);
    }
  };

  const total = cartItems.reduce((sum, item) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  );

  if (loading) {
    return <div className="text-center py-12 text-nord-3">Loading cart...</div>;
  }

  return (
    <motion.div className="space-y-8">
      <motion.div className="flex items-center space-x-2">
        <ShoppingCart className="text-2xl text-nord-9" />
        <h1 className="text-3xl font-bold text-nord-0">Shopping Cart</h1>
        <span className="bg-nord-9 text-nord-0 px-3 py-1 rounded-full text-sm">
          {cartItems.length} items
        </span>
      </motion.div>

      {cartItems.length === 0 ? (
        <motion.div className="text-center py-12">
          <ShoppingCart className="mx-auto h-16 w-16 text-nord-3 mb-4" />
          <h3 className="text-lg font-medium text-nord-0 mb-2">Your cart is empty</h3>
          <Link to="/products" className="inline-flex items-center px-4 py-2 btn-primary rounded-nord">
            Continue Shopping
          </Link>
        </motion.div>
      ) : (
        <>
          <div className="bg-nord-5 rounded-nord shadow-nord overflow-hidden">
            {cartItems.map((item, index) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 border-b border-nord-3 last:border-b-0"
              >
                <div className="flex items-center space-x-4">
                  {/* ✅ PRODUCT IMAGE */}
                  <div className="w-20 h-20 bg-nord-4 rounded-nord overflow-hidden">
                    {item.product.image ? (
                      <img 
                        src={`http://localhost:8000${item.product.image}`} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-nord-3">{item.product.name.slice(0, 2)}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-nord-0 text-lg truncate">{item.product.name}</h3>
                    <p className="text-nord-3">${item.product.price}</p>
                  </div>
                  
                  {/* ✅ FIXED BUTTONS - USE PRODUCT_ID! */}
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 text-nord-3 hover:bg-nord-4 rounded-nord transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium text-nord-0">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 text-nord-3 hover:bg-nord-4 rounded-nord transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeItem(item.product.id)}
                    className="text-nord-10 hover:text-red-600 p-2 hover:bg-nord-4 rounded-nord transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-nord-5 p-6 rounded-nord shadow-nord"
          >
            <div className="flex justify-between items-center text-xl font-semibold text-nord-0">
              <span>Total: ${total.toFixed(2)}</span>
              <Link to="/checkout" className="px-6 py-3 btn-primary rounded-nord">
                Proceed to Checkout
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default Cart;
