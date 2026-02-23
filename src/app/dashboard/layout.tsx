'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard adminOnly={true}>
      <div className="flex bg-[#f8f7f6] dark:bg-[#121212] min-h-screen font-display antialiased">
        {/* Sidebar persistente */}
        <Sidebar />
        
        {/* Área principal de contenido */}
        <main className="flex-1 ml-64 flex flex-col transition-all">
          <Navbar />
          <div className="p-8 lg:p-12 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
