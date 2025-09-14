import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const LoginScreen = () => {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please enter both email and password');
      return;
    }

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      toast.error(result.error || 'Login failed');
    }
  };

  const fillTestCredentials = (role) => {
    switch (role) {
      case 'admin':
        setFormData({ email: 'admin@essen.com', password: 'Admin123!' });
        break;
      case 'manager':
        setFormData({ email: 'manager@essen.com', password: 'Manager123!' });
        break;
      case 'cashier':
        setFormData({ email: 'cashier1@essen.com', password: 'Cashier123!' });
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Essen POS</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your POS system</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                placeholder="Email address"
                disabled={loading}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                placeholder="Password"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading || !formData.email || !formData.password
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="mt-6">
            <p className="text-center text-sm text-gray-600 mb-2">Test accounts (click to auto-fill):</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                type="button"
                onClick={() => fillTestCredentials('admin')}
                className="py-2 px-4 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                disabled={loading}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillTestCredentials('manager')}
                className="py-2 px-4 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                disabled={loading}
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => fillTestCredentials('cashier')}
                className="py-2 px-4 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                disabled={loading}
              >
                Cashier
              </button>
            </div>
            <div className="text-center text-xs text-gray-500">
              <p><strong>Admin:</strong> admin@essen.com / Admin123!</p>
              <p><strong>Manager:</strong> manager@essen.com / Manager123!</p>
              <p><strong>Cashier:</strong> cashier1@essen.com / Cashier123!</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
