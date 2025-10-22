import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../utils/api';
import { Trash2, Package, User, Clock, Edit2 } from 'lucide-react';

interface Order {
  id: number;
  user: { username: string };
  total_amount: string;
  status: string;
  created_at: string;
  items: Array<{
    product: { name: string; price: string };
    quantity: number;
  }>;
}

const OrdersAdmin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('admin/orders/');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId: number) => {
    if (window.confirm('Delete this order? This cannot be undone!')) {
      try {
        await api.post('admin/delete_order/', { order_id: orderId });
        fetchOrders();
      } catch (error) {
        alert('Failed to delete order');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nord-9 mx-auto mb-4"></div>
          <p className="text-nord-4">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <motion.div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Package className="text-2xl text-nord-9" />
          <h1 className="text-3xl font-bold text-nord-6">Orders Management</h1>
        </div>
        <span className="bg-nord-9 text-nord-0 px-3 py-1 rounded-full text-sm">
          {orders.length} orders
        </span>
      </motion.div>

      {/* Orders Table */}
      <motion.div className="bg-nord-5 rounded-nord shadow-nord overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-nord-4">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-nord-1 uppercase">Order #</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-nord-1 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-nord-1 uppercase">Total</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-nord-1 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-nord-1 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-nord-1 uppercase">Items</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-nord-1 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nord-3">
              {orders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-nord-4"
                >
                  <td className="px-6 py-4 text-nord-6">#{order.id}</td>
                  <td className="px-6 py-4 text-nord-6">{order.user.username}</td>
                  <td className="px-6 py-4 font-semibold text-nord-9">${order.total_amount}</td>
                  
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'delivered' ? 'bg-nord-13 text-nord-0' :
                      order.status === 'pending' ? 'bg-nord-12 text-nord-0' :
                      'bg-nord-10 text-nord-6'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 text-nord-3">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  
                  <td className="px-6 py-4 text-nord-6">
                    {order.items.length} items
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="text-nord-10 hover:text-red-600 p-1 rounded-nord hover:bg-nord-3 transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Empty State */}
      {orders.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <Package className="mx-auto h-16 w-16 text-nord-3 mb-4" />
          <h3 className="text-xl font-medium text-nord-4 mb-2">No orders yet</h3>
          <p className="text-nord-3 mb-4">Customers haven't placed any orders.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OrdersAdmin;
