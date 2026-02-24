'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { name: 'Productos', href: '/dashboard/products', icon: 'inventory_2' },
  { name: 'Órdenes', href: '/dashboard/orders', icon: 'shopping_cart' },
  { name: 'Clientes', href: '/dashboard/customers', icon: 'group' },
  { name: 'Subastas', href: '/dashboard/auctions', icon: 'gavel' },
  { name: 'Administradores', href: '/dashboard/admins', icon: 'admin_panel_settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay para cerrar en móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        ></div>
      )}

      <aside className={`
        fixed left-0 top-0 h-screen z-50 transition-all duration-300 border-r border-gray-200 dark:border-[#433d28] bg-white dark:bg-[#1a170e]
        w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-200 dark:border-[#433d28] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <img 
              src="/img/afizionadosW.png" 
              alt="Afizionados Logo" 
              className="h-12 w-auto object-contain dark:hidden"
            />
            <img 
              src="/img/afizionadosB.png" 
              alt="Afizionados Logo" 
              className="h-12 w-auto object-contain hidden dark:block"
            />
          </Link>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-[#d4af35]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <nav className="p-4 space-y-2 mt-4 overflow-y-auto h-[calc(100vh-180px)]">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Menú Principal</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  isActive 
                    ? 'bg-[#d4af35] text-[#201d13] font-bold shadow-lg shadow-[#d4af35]/20' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#302c1c] hover:text-[#d4af35]'
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${isActive ? 'text-[#201d13]' : 'group-hover:text-[#d4af35]'}`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-gray-200 dark:border-[#433d28] bg-white dark:bg-[#1a170e]">
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/auth/login'; }}
            className="flex items-center gap-3 text-red-500 hover:text-red-600 font-bold text-xs uppercase tracking-widest transition-all"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
