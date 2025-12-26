import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './common/Header';
import AdminSidebar from './common/AdminSidbar';

const Layout = ({ onLogout }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setIsMobileOpen(true)} 
          onLogout={onLogout}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;