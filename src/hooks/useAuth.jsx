import { useState, useEffect, useContext, createContext } from 'react';
import api from '../services/api';
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Load token from storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('pos_token');
    const storedUser = localStorage.getItem('pos_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        // Ensure API client has the token
        api.setToken(storedToken);
        console.log('Loaded authentication token from localStorage');
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('pos_token');
        localStorage.removeItem('pos_user');
        api.clearToken();
      }
    } else {
      console.log('No stored authentication found');
      api.clearToken();
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.login({ email, password });

      // API returns { accessToken, refreshToken, user }
      const { user, accessToken } = response;

      if (!user || !accessToken) {
        throw new Error('Invalid login response from server');
      }

      setUser(user);
      setToken(accessToken);
      // Note: api.setToken() is already called in api.login()

      // Store in localStorage
      localStorage.setItem('pos_token', accessToken);
      localStorage.setItem('pos_user', JSON.stringify(user));

      toast.success(`Welcome back, ${user.name}!`);

      // Log login action (only if user is authenticated)
      try {
        await api.logAction('LOGIN', 'user', user.id, `User ${user.name} logged in`);
      } catch (logError) {
        console.warn('Failed to log login action:', logError);
        // Don't fail login if logging fails
      }

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);

      // Clear any partial state
      setUser(null);
      setToken(null);
      api.clearToken();

      // Clear localStorage
      localStorage.removeItem('pos_token');
      localStorage.removeItem('pos_user');

      const errorMessage = error.message || 'Login failed';
      toast.error('Login failed: ' + errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      setUser(null);
      setToken(null);
      api.clearToken();

      // Clear localStorage
      localStorage.removeItem('pos_token');
      localStorage.removeItem('pos_user');

      // Clear business type cache to prevent stale data
      localStorage.removeItem('businessType');
      localStorage.removeItem('storeSettings');

      toast.success('Logged out successfully');
    }
  };

  // Check authentication status
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  // Get user role
  const hasRole = (requiredRole) => {
    if (!user) return false;

    const roleHierarchy = {
      'admin': 3,
      'manager': 2,
      'cashier': 1
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  // Check if user is admin
  const isAdmin = () => hasRole('admin');

  // Check if user is manager or admin
  const isManager = () => hasRole('manager');

  // Check if user is cashier, manager, or admin
  const isCashier = () => hasRole('cashier');

  // Update user data
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('pos_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    isAdmin,
    isManager,
    isCashier,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
