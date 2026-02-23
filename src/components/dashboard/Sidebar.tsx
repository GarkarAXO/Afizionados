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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-[#1a170e] border-r border-gray-200 dark:border-[#433d28] h-screen fixed left-0 top-0 z-20 transition-all">
      <div className="p-6 border-b border-gray-200 dark:border-[#433d28]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#d4af35] rounded-lg flex items-center justify-center text-[#201d13] font-black">A</div>
          <span className="font-black tracking-widest text-lg dark:text-white uppercase">Afizionados</span>
        </Link>
      </div>
      
      <nav className="p-4 space-y-2 mt-4">
        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Menú Principal</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
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

      <div className="absolute bottom-0 w-full p-6 border-t border-gray-200 dark:border-[#433d28]">
        <button 
          onClick={() => { localStorage.clear(); window.location.href = '/auth/login'; }}
          className="flex items-center gap-3 text-red-500 hover:text-red-600 font-medium text-sm transition-all"
        >
          <span className="material-symbols-outlined">logout</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
