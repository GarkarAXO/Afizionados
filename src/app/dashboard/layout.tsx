'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthGuard adminOnly={true}>
      <div className="flex bg-[#f8f7f6] dark:bg-[#121212] min-h-screen font-display antialiased transition-colors duration-300">
        {/* Sidebar persistente con control de estado */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        {/* Área principal de contenido */}
        <main className="flex-1 lg:ml-64 flex flex-col min-w-0 transition-all">
          <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
          <div className="p-4 sm:p-8 lg:p-12 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
