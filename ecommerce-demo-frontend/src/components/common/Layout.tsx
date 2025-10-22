import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from './LoginModal';

interface LayoutProps {
  children: ReactNode;
  isAdmin?: boolean;
}

export const Layout = ({ children, isAdmin = false }: LayoutProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

return (
    <div className="min-h-screen bg-nord-6">
      {/* Header */}
      <motion.header className="bg-nord-5 border-b border-nord-3 shadow-nord">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={isAdmin ? "/admin" : "/"} className="text-2xl font-bold text-nord-0">
              E-Shop
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              {!isAdmin ? (
                <>
                  <Link to="/" className="text-nord-1 hover:text-nord-0">Home</Link>
                  <Link to="/products" className="text-nord-1 hover:text-nord-0">Products</Link>
                  {isAuthenticated && <Link to="/cart" className="text-nord-1 hover:text-nord-0">Cart</Link>}
                  {isAuthenticated && <Link to="/orders" className="text-nord-1 hover:text-nord-0">Orders</Link>}
                </>
              ) : (
                <>
                  <Link to="/admin/products" className="text-nord-4 hover:text-nord-6">Products</Link>
                  <Link to="/admin/categories" className="text-nord-4 hover:text-nord-6">Categories</Link>
                  <Link to="/admin/orders" className="text-nord-4 hover:text-nord-6">Orders</Link>
                </>
              )}
            </nav>

            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  <span className="hidden md:block text-sm text-nord-1">Hi, {user?.username}</span>
                  <button onClick={logout} className="btn-danger px-3 py-1 text-sm">
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="btn-primary px-4 py-2 text-sm rounded-nord"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
};
