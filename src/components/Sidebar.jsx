import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBusinessType } from '../hooks/useBusinessType';
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  X,
  Store,
  Grid3X3,
  ChefHat,
  Bell,
  Calendar,
  UserCheck,
  Monitor
} from 'lucide-react';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { businessType } = useBusinessType();
  const location = useLocation();

  const isRestaurant = businessType?.code === 'restaurant';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: BarChart3 },
    { name: 'Sales', path: '/sales', icon: ShoppingCart },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'CRM', path: '/crm', icon: Users },
    { name: 'Reports', path: '/reports', icon: ClipboardList },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Restaurant-specific navigation items
  const restaurantNavItems = [
    { name: 'Table Management', path: '/restaurant/tables', icon: Grid3X3 },
    { name: 'Kitchen Display', path: '/restaurant/kitchen', icon: ChefHat },
    { name: 'Order Pickup', path: '/restaurant/pickup', icon: Bell },
    { name: 'Reservations', path: '/restaurant/reservations', icon: Calendar },
    { name: 'Staff Management', path: '/restaurant/staff', icon: UserCheck },
    { name: 'Terminal Management', path: '/restaurant/terminals', icon: Monitor },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      onClose();
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-white/20">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Essen POS</h2>
                <p className="text-sm text-blue-100">Point of Sale System</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              {getUserInitials(user?.name)}
            </div>
            <div>
              <div className="font-medium text-gray-900">{user?.name || 'User'}</div>
              <div className="text-sm text-gray-500 capitalize">{user?.role || 'Role'}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col">
          {/* Scrollable Navigation Container */}
          <div className="flex-1 max-h-[calc(100vh-280px)] overflow-y-scroll scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 p-4">
            <div className="text-sm text-gray-600 font-medium mb-4">Navigation</div>
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-blue-100 text-blue-700 shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Restaurant-Specific Navigation */}
              {isRestaurant && (
                <>
                  <div className="pt-4 pb-2">
                    <div className="px-4 py-2">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Restaurant Tools
                      </h3>
                    </div>
                  </div>
                  {restaurantNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        location.pathname === item.path
                          ? 'bg-orange-100 text-orange-700 shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            © 2025 Essen POS System
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
