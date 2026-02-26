'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CartProvider, useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';

function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cart, removeFromCart, totalPrice, totalItems } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    onClose();
    if (!token) {
      router.push('/auth/login?redirect=/arena/checkout');
    } else {
      router.push('/arena/checkout');
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] animate-in fade-in" onClick={onClose}></div>
      )}

      <div className={`fixed right-0 top-0 h-screen w-full max-w-md bg-white dark:bg-[#0a0a0a] border-l border-gray-200 dark:border-white/10 z-[101] shadow-2xl transition-transform duration-500 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-[#1a170e]/30">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Tu Bóveda</h3>
            <p className="text-[10px] text-[#d4af35] font-black uppercase tracking-[0.2em] mt-1">{totalItems} piezas</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-32 sm:pb-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <span className="material-symbols-outlined text-6xl text-gray-400">shopping_bag</span>
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">Tu bóveda está vacía.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="w-20 h-20 bg-gray-100 dark:bg-[#1a170e] rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 flex-shrink-0">
                  <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="text-xs font-black uppercase text-gray-900 dark:text-white truncate mb-1">{item.title}</h4>
                  <p className="text-sm font-black text-[#d4af35]">${(item.priceCents / 100).toLocaleString('es-MX')}</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-[9px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest mt-2 flex items-center gap-1 transition-colors w-fit">
                    <span className="material-symbols-outlined text-xs">delete</span> Retirar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#050505] space-y-6 mb-16 sm:mb-0">
            <div className="flex justify-between items-end">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                <span className="text-sm mr-1 text-[#d4af35]">$</span>
                {(totalPrice / 100).toLocaleString('es-MX')}
              </p>
            </div>
            <button onClick={handleCheckout} className="w-full py-5 bg-[#d4af35] text-[#201d13] font-black rounded-2xl uppercase text-xs tracking-[0.2em] hover:brightness-110 shadow-xl transition-all active:scale-[0.98]">
              Finalizar Adquisición
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function Navbar() {
  const pathname = usePathname();
  const { totalItems, notification } = useCart();
  const { theme, setTheme } = useTheme();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, [pathname]); // Se actualiza al cambiar de ruta

  return (
    <>
      <nav className="h-20 border-b border-gray-200 dark:border-white/5 sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl px-3 sm:px-8 flex items-center justify-between transition-colors">
        <Link href="/arena" className="flex items-center gap-2">
          <img src="/img/afizionadosW.png" alt="Logo" className="h-8 sm:h-12 w-auto object-contain dark:hidden" />
          <img src="/img/afizionadosB.png" alt="Logo" className="h-8 sm:h-12 w-auto object-contain hidden dark:block" />
        </Link>

        {/* Links Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { name: 'Bóveda', href: '/arena' },
            { name: 'Catálogo', href: '/arena/all' },
            { name: 'Subastas', href: '/arena/auctions' },
            { name: 'Colecciones', href: '/arena/categories' },
          ].map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all pb-1 border-b-2 ${
                pathname === link.href 
                ? 'text-[#d4af35] border-[#d4af35]' 
                : 'text-gray-400 hover:text-gray-900 dark:hover:text-white border-transparent'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-6">
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 text-gray-400 hover:text-[#d4af35] transition-all" title="Cambiar Tema">
            <span className="material-symbols-outlined text-xl sm:text-2xl">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
          </button>
          
          <button onClick={() => setIsCartOpen(true)} className="p-2 text-gray-400 hover:text-[#d4af35] transition-colors relative group">
            <span className="material-symbols-outlined text-2xl sm:text-3xl">shopping_bag</span>
            {totalItems > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-[#d4af35] text-[#201d13] text-[9px] font-black rounded-full flex items-center justify-center shadow-lg">{totalItems}</span>}
          </button>

          {user ? (
            <Link href={user.role === 'ADMIN' ? '/dashboard' : '/arena/profile'} className="flex items-center gap-2 sm:gap-3 group ml-1">
              <div className="hidden sm:block text-right">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#d4af35] transition-colors">Coleccionista</p>
                <p className="text-[10px] font-black uppercase text-gray-900 dark:text-white truncate max-w-[100px]">{user.name.split(' ')[0]}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-[#d4af35] to-[#f8f7f6] rounded-full flex items-center justify-center text-[#201d13] font-black text-xs border-2 border-[#d4af35]/20 shadow-lg">
                {user.name[0].toUpperCase()}
              </div>
            </Link>
          ) : (
            <Link href="/auth/login" className="px-3 py-2 sm:px-6 bg-[#d4af35] text-[#201d13] font-black rounded-lg text-[9px] sm:text-[10px] uppercase tracking-widest hover:brightness-110 ml-1">
              Login
            </Link>
          )}
        </div>
      </nav>

      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4">
          <div className="bg-[#d4af35] text-[#201d13] px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-sm">inventory_2</span>
            {notification}
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-2xl border-t border-gray-200 dark:border-white/5 z-50 px-2 pb-safe transition-colors">
        <div className="flex justify-around items-center h-16">
          {[
            { name: 'Bóveda', href: '/arena', icon: 'account_balance' },
            { name: 'Catálogo', href: '/arena/all', icon: 'auto_awesome_motion' },
            { name: 'Subastas', href: '/arena/auctions', icon: 'gavel' },
            { name: 'Colecciones', href: '/arena/categories', icon: 'collections_bookmark' },
          ].map((link) => (
            <Link key={link.href} href={link.href} className={`flex flex-col items-center gap-1 transition-all ${pathname === link.href ? 'text-[#d4af35]' : 'text-gray-400 dark:text-gray-500'}`}>
              <span className={`material-symbols-outlined text-xl ${pathname === link.href ? 'fill-[1]' : ''}`}>{link.icon}</span>
              <span className="text-[8px] font-black uppercase tracking-tighter">{link.name}</span>
            </Link>
          ))}
        </div>
      </nav>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default function ArenaLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="bg-white dark:bg-[#0a0a0a] min-h-screen text-gray-900 dark:text-white font-sans selection:bg-[#d4af35] selection:text-[#201d13] transition-colors">
        <Navbar />
        <main className="pb-20 md:pb-0">{children}</main>
        <footer className="bg-gray-50 dark:bg-[#050505] border-t border-gray-200 dark:border-white/5 py-16 px-8 mt-20 mb-16 md:mb-0 text-center md:text-left transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
            <div className="space-y-6 max-w-sm mx-auto md:mx-0">
              <img src="/img/afizionadosW.png" alt="Logo" className="h-10 opacity-80 mx-auto md:mx-0 dark:hidden" />
              <img src="/img/afizionadosB.png" alt="Logo" className="h-10 opacity-80 mx-auto md:mx-0 hidden dark:block" />
              <p className="text-gray-500 text-sm leading-relaxed font-medium">La plataforma definitiva para coleccionistas reales.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 text-left">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#d4af35]">Arena</h4>
                <ul className="space-y-2 text-xs text-gray-500 font-bold uppercase tracking-tighter">
                  <li><Link href="/arena" className="hover:text-gray-900 dark:hover:text-white">Bóveda</Link></li>
                  <li><Link href="/arena/auctions" className="hover:text-gray-900 dark:hover:text-white">Subastas</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#d4af35]">Legal</h4>
                <ul className="space-y-2 text-xs text-gray-500 font-bold uppercase tracking-tighter">
                  <li>Privacidad</li>
                  <li>Garantía</li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
