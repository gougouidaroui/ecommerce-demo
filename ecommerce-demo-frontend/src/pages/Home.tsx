import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: string;
  image?: string;
}

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    // Fetch first 3 available products from backend
    api.get('products/?limit=3')
      .then((res) => {
        setFeaturedProducts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addToCart = async (productId: number) => {
    if (!token) {
      alert('Please login to add to cart!');
      return;
    }
    try {
      await api.post('carts/add_item/', { product_id: productId });
      alert('Added to cart!');
    } catch (error) {
      alert('Error adding to cart');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nord-9 mx-auto mb-4"></div>
        <p className="text-nord-3">Loading featured products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 bg-gradient-to-r from-nord-8 to-nord-9 rounded-nord"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl font-bold text-nord-0 mb-4">
            Welcome to E-Shop
          </h1>
          <p className="text-xl text-nord-3 mb-8">
            Discover amazing products with smooth animations
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-3 btn-primary rounded-nord text-nord-0"
          >
            <ShoppingBag className="mr-2" />
            Shop Now
          </Link>
        </motion.div>
      </motion.section>

      {/* Featured Products Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <h2 className="text-2xl font-bold text-nord-0 mb-6 text-center">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-nord-5 rounded-nord shadow-nord overflow-hidden group"
              >
                <div className="h-48 bg-gradient-to-br from-nord-4 to-nord-3 flex items-center justify-center relative overflow-hidden">
                  {product.image ? (
                    <img
                      src={`${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-nord-2 text-lg">No Image</span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-nord-0 mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-nord-3 mb-4">${product.price}</p>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="w-full btn-primary py-2 rounded-nord text-nord-0 hover:shadow-nord"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-nord-3 col-span-full">
              No featured products yet.{' '}
              <Link to="/admin/products" className="text-nord-9 hover:underline">
                Add some in admin!
              </Link>
            </p>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
