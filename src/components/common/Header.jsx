import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';

const Header = ({ onMenuClick, onLogout }) => {
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

  return (
    <header className="bg-white shadow-md sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-gray-100 rounded-lg">
            <User size={20} className="text-gray-600" />
            <div>
              <p className="text-sm font-semibold text-gray-800">{user.email || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;