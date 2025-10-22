import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types/index';  // ✅ IMPORT TYPES

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ✅ TYPED RESPONSE INTERFACES
interface AuthResponse {
  token: string;
  user_id: number;
  username: string;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState<{
    username: string;
    email: string;
    password: string;
  }>({
    username: '',
    email: '',
    password: ''
  });
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    try {
      const endpoint = isLogin ? 'auth/login/' : 'auth/register/';
      const data = isLogin 
        ? { username: formData.username, password: formData.password }
        : formData;
      
      const response = await api.post<AuthResponse>(endpoint, data);
      
      // ✅ TYPED USER OBJECT
      const user: User = {
        id: response.data.user_id,
        username: response.data.username,
        is_staff: false  // Will be checked by AuthContext
      };
      
      // ✅ NEW TYPED LOGIN FUNCTION
      await login(formData.username, formData.password);
      onClose();
    } catch (error) {
      alert('Error! Check credentials.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isLogin ? 'Login' : 'Register'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({...formData, email: e.target.value})
                  }
                  className="w-full p-3 border rounded-lg"
                  required
                />
              )}
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({...formData, username: e.target.value})
                }
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({...formData, password: e.target.value})
                }
                className="w-full p-3 border rounded-lg"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                {isLogin ? 'Login' : 'Register'}
              </button>
            </form>
            
            <p className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:underline"
              >
                {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
