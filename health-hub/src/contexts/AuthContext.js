import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    }
  }, [user]);

  // Check if user is still authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && !user) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    };

    checkAuth();
  }, [user]);

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authAPI.register(userData);
      const { user: newUser, token, refreshToken } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(newUser);
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authAPI.login(credentials);
      const { user: userData, token, refreshToken } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(userData);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateUser = async (updates) => {
    try {
      const response = await authAPI.updateProfile(updates);
      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (passwords) => {
    try {
      await authAPI.changePassword(passwords);
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    updateUser,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
