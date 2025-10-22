import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, LoginResponse } from '../types/index';
import { RegisterResponse,AdminResponse } from '../types/index';
import { api } from '../utils/api';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [adminChecked, setAdminChecked] = useState<boolean>(false);

  const checkAdminStatus = async (): Promise<void> => {
    if (!token) {
      setIsAdmin(false);
      setAdminChecked(true);
      return;
    }

    try {
      const response = await api.get<AdminResponse>('admin/me/');
      setIsAdmin(true);
      setAdminChecked(true);
    } catch (error: any) {
      setIsAdmin(false);
      setAdminChecked(true);
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await api.post<LoginResponse>('auth/login/', { 
        username, 
        password 
      });
      
      const userData: User = {
        id: response.data.user_id,
        username: response.data.username,
        is_staff: false
      };
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(response.data.token);
      setUser(userData);
      await checkAdminStatus();
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    try {
      const response = await api.post<RegisterResponse>('auth/register/', { 
        username, 
        email, 
        password 
      });
      
      const userData: User = {
        id: response.data.user_id,
        username: response.data.username,
        is_staff: false
      };
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(response.data.token);
      setUser(userData);
      await checkAdminStatus();
    } catch (error) {
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAdmin(false);
  };

  useEffect(() => {
    if (token) {
      checkAdminStatus();
    }
  }, [token]);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      const userData: User = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAdmin,
    isAuthenticated: !!token,
    adminChecked,
    loading,
    login,
    register,
    logout,
    checkAdminStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
