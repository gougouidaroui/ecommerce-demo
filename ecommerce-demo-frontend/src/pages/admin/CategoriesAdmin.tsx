import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {api} from '../../utils/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

const CategoriesAdmin = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    api.get('categories/').then(res => setCategories(res.data));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      api.put(`categories/${editingId}/`, formData).then(() => {
        setEditingId(null);
        fetchCategories();
        setShowForm(false);
      });
    } else {
      api.post('categories/', formData).then(() => {
        fetchCategories();
        setShowForm(false);
      });
    }
    setFormData({ name: '' , slug: ''});
  };

  const deleteCategory = (id: number) => {
    if (window.confirm('Delete category?')) {
      api.delete(`categories/${id}/`).then(fetchCategories);
    }
  };

  const startEdit = (category: Category) => {
    setFormData({ name: category.name , slug: category.slug});
    setEditingId(category.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <motion.div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categories Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', slug: '' });
          }}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded"
        >
          <Plus className="mr-2" />
          {showForm ? 'Cancel' : 'Add Category'}
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
              type="text"
              placeholder="Category Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Category Slug"
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded">
              {editingId ? 'Update Category' : 'Create Category'}
            </button>
          </form>
        </motion.div>
      )}

      <motion.div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{category.name}</td>
                <td className="px-6 py-4">{category.slug}</td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => startEdit(category)} className="text-blue-600">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => deleteCategory(category.id)} className="text-red-600">
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

export default CategoriesAdmin;
