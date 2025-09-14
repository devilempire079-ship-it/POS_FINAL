import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Menu, Store } from 'lucide-react';

const Header = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Side - Hamburger Menu */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-100">
              <Store className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Essen POS</span>
          </div>
        </div>

        {/* Right Side - User Info */}
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
            <div className="text-xs text-gray-500 capitalize">{user?.role || 'Role'}</div>
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            {getUserInitials(user?.name)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
