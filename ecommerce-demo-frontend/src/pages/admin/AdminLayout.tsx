import { Outlet, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminLayout = () => {
  const { isAdmin, loading, adminChecked } = useAuth();


  if (loading || !adminChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-nord-2">
      <div className="w-64 admin-sidebar">
        <h2 className="text-xl font-bold text-nord-6 mb-6 p-4">Admin Panel</h2>
        <nav className="space-y-2 px-2">
          <Link to="/admin/products" className="block p-2 rounded-nord text-nord-4 hover:text-nord-6 admin-sidebar-link">Products</Link>
          <Link to="/admin/categories" className="block p-2 rounded-nord text-nord-4 hover:text-nord-6 admin-sidebar-link">Categories</Link>
          <Link to="/admin/orders" className="block p-2 rounded-nord text-nord-4 hover:text-nord-6 admin-sidebar-link">Orders</Link>
        </nav>
      </div>
      <div className="flex-1 p-6 bg-nord-2">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
