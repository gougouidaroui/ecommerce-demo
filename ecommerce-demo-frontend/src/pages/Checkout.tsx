import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {api} from '../utils/api';
import { CreditCard, CheckCircle, ShoppingCart, User, MapPin, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface CartItem {
  id: number;
  product: { id: number; name: string; price: string };
  quantity: number;
}

const Checkout = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    payment_method: 'card'
  });

  // Fetch cart on load
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('carts/current/');
      setCartItems(response.data.items || []);
    } catch (error) {
      navigate('/');
    }
  };

  const total = cartItems.reduce((sum, item) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (total === 0) return;

    setLoading(true);
    try {
      // Create order
      const response = await api.post('orders/create_order/', {});
      
      // Success!
      setSuccess(true);
      
      // Confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Clear cart (already done in backend)
      setCartItems([]);
      
      // Show success 3 seconds then redirect
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
      
    } catch (error) {
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

if (success) {
    return (
      <motion.div className="text-center py-12">
        <CheckCircle className="mx-auto h-24 w-24 text-nord-13 mb-4" />
        <h1 className="text-4xl font-bold text-nord-13 mb-4">Order Confirmed!</h1>
        <p className="text-lg text-nord-3 mb-8">Order #{Math.floor(Math.random() * 1000)} placed successfully</p>
        <div className="bg-nord-13 bg-opacity-10 p-6 rounded-nord inline-block">
          <p className="font-semibold text-nord-0">Total: ${total.toFixed(2)}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="max-w-4xl mx-auto py-8 space-y-8">
      <motion.div className="flex items-center space-x-2">
        <ShoppingCart className="text-2xl text-nord-9" />
        <h1 className="text-3xl font-bold text-nord-0">Checkout</h1>
        <span className="bg-nord-9 text-nord-0 px-3 py-1 rounded-full text-sm">
          ${total.toFixed(2)}
        </span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <motion.div className="bg-nord-5 rounded-nord shadow-nord p-6 space-y-4">
          <h2 className="font-semibold text-lg text-nord-0 flex items-center">
            <Package className="mr-2 text-nord-9" />
            Order Summary
          </h2>
          {/* ... existing items ... */}
          <div className="border-t border-nord-3 pt-4">
            <div className="flex justify-between text-xl font-bold text-nord-0">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div className="bg-nord-5 rounded-nord shadow-nord p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3 text-nord-0 flex items-center">
                <User className="mr-2 text-nord-9" />
                Customer Information
              </h3>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-3 bg-nord-6 border border-nord-3 rounded-nord text-nord-0 focus:ring-2 focus:ring-nord-9"
                required
              />
              {/* ... other inputs with same classes ... */}
            </div>
            {/* ... rest of form ... */}
            <button
              type="submit"
              className="w-full btn-primary py-3 rounded-nord font-semibold"
            >
              {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Checkout;
