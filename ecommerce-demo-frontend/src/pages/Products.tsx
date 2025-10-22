import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {api} from '../utils/api';
import axios from 'axios';
import { Search, Filter } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image?: string;
}

const Products = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/products/')
      .then(res => setProducts(res.data));
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = async (productId: number) => {
    try {
      await api.post('carts/add_item/', { product_id: productId });
      alert('Added to cart!');
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert('Please login first!');
      }
    }
  };

return (
    <div className="space-y-8">
      <motion.div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nord-3" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-nord-5 border border-nord-3 rounded-nord focus:ring-2 focus:ring-nord-9 text-nord-0"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product, i) => (
          <motion.div
            key={product.id}
            className="bg-nord-5 rounded-nord shadow-nord overflow-hidden group"
          >
            <div className="h-48 bg-gradient-to-br from-nord-4 to-nord-3 flex items-center justify-center">
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
              <h3 className="font-semibold text-nord-0 mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-nord-3 text-sm mb-4 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-nord-9">${product.price}</span>
                <button 
                  onClick={() => addToCart(product.id)}
                  className="px-4 py-2 btn-primary rounded-nord"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Products;
