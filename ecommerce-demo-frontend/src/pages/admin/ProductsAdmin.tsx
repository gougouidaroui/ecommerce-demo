import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {api} from '../../utils/api';
import { Plus, Edit, Trash2, Image } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  is_available: boolean;
  image: string | null;
  category: Category;
}

const ProductsAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    is_available: true,
    image: null as File | null,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = () => {
    api.get('products/').then(res => setProducts(res.data));
  };

  const fetchCategories = () => {
    api.get('categories/').then(res => setCategories(res.data));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('category_id', formData.category_id);
    data.append('is_available', formData.is_available.toString());
    if (formData.image) data.append('image', formData.image);

    try {
      if (editingId) {
        await api.put(`products/${editingId}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('products/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchProducts();
      setShowForm(false);
      setFormData({
        name: '', description: '', price: '', stock: '', category_id: '',
        is_available: true, image: null
      });
      setEditingId(null);
    } catch (error) {
      alert('Error saving product');
    }
  };

  const deleteProduct = (id: number) => {
    if (window.confirm('Delete this product?')) {
      api.delete(`products/${id}/`).then(fetchProducts);
    }
  };

  const startEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock.toString(),
      category_id: product.category.id.toString(),
      is_available: product.is_available,
      image: null
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <motion.div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: '', description: '', price: '', stock: '', category_id: '',
              is_available: true, image: null
            });
          }}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded"
        >
          <Plus className="mr-2" />
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </motion.div>

      {showForm && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text" placeholder="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border rounded-lg"
              rows={3}
            />
            <input
              type="number" placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            />
            <input
              type="number" placeholder="Stock"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            />
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
              className="w-full p-3 border rounded-lg"
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              />
              <span>Available</span>
            </label>
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded">
              {editingId ? 'Update Product' : 'Create Product'}
            </button>
          </form>
        </motion.div>
      )}

      <motion.div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {product.image ? (
                    <img src={`http://localhost:8000${product.image}`} alt={product.name} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Image size={16} />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">{product.name}</td>
                <td className="px-6 py-4">${product.price}</td>
                <td className="px-6 py-4">{product.stock}</td>
                <td className="px-6 py-4">{product.category.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.is_available ? 'Available' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => startEdit(product)} className="text-blue-600">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => deleteProduct(product.id)} className="text-red-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default ProductsAdmin;
