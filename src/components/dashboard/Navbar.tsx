'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults(null);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.length >= 2) {
        setIsSearching(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/dashboard/search?q=${search}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) setSearchResults(data.data);
        } catch (err) {
          console.error('Search error');
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/dashboard/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setNotifications(data.data);
    } catch (err) {
      console.error('Notif error');
    }
  };

  const hasUnread = notifications.length > 0;

  return (
    <header className="h-16 bg-white/80 dark:bg-[#1a170e]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#433d28] sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between gap-4">
      
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        {/* Botón de Menú Móvil */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-[#d4af35] transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* BUSCADOR */}
        <div className="flex items-center gap-2 sm:gap-4 relative w-full max-w-md" ref={searchRef}>
          <span className={`material-symbols-outlined text-gray-400 hidden xs:block ${isSearching ? 'animate-spin text-[#d4af35]' : ''}`}>
            {isSearching ? 'sync' : 'search'}
          </span>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..." 
            className="bg-transparent border-none outline-none text-xs sm:text-sm w-full dark:text-white placeholder:text-gray-500 font-medium"
          />

          {searchResults && (
            <div className="absolute top-full left-0 w-[calc(100vw-2rem)] sm:w-full max-w-md mt-2 bg-white dark:bg-[#1a170e] border border-gray-200 dark:border-[#433d28] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="max-h-96 overflow-y-auto">
                {['products', 'users', 'orders'].map((category) => {
                  const results = searchResults[category] || [];
                  if (results.length === 0) return null;
                  return (
                    <div key={category} className="p-2">
                      <p className="px-3 py-1 text-[10px] font-black text-[#d4af35] uppercase tracking-widest">{category === 'products' ? 'Piezas' : category === 'users' ? 'Coleccionistas' : 'Órdenes'}</p>
                      {results.map((item: any) => (
                        <Link 
                          key={item.id} 
                          href={item.href}
                          onClick={() => setSearch('')}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-[#302c1c] transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm text-gray-400">
                            {category === 'products' ? 'token' : category === 'users' ? 'person' : 'receipt_long'}
                          </span>
                          <span className="text-[10px] dark:text-gray-200 font-bold uppercase truncate">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-6">
        {/* NOTIFICACIONES */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-2 rounded-xl transition-all ${isNotifOpen ? 'bg-[#d4af35]/10 text-[#d4af35]' : 'text-gray-500 hover:text-[#d4af35]'}`}
          >
            <span className="material-symbols-outlined text-xl sm:text-2xl">notifications</span>
            {hasUnread && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#d4af35] rounded-full border border-white dark:border-[#1a170e]"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute top-full right-[-60px] sm:right-0 w-[280px] sm:w-80 mt-2 bg-white dark:bg-[#1a170e] border border-gray-200 dark:border-[#433d28] rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100 dark:border-[#302c1c] flex justify-between items-center bg-gray-50 dark:bg-[#302c1c]/30">
                <h3 className="font-black text-[10px] uppercase tracking-widest dark:text-white">Arena Notif</h3>
                <span className="text-[8px] font-bold text-[#d4af35] uppercase">Reciente</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-[#302c1c]">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-3 hover:bg-gray-50 dark:hover:bg-[#302c1c]/50 transition-colors cursor-pointer">
                    <div className="flex gap-3">
                      <div className={`mt-1 material-symbols-outlined text-base ${notif.color}`}>{notif.icon}</div>
                      <div>
                        <p className="text-[9px] font-black dark:text-white uppercase leading-tight">{notif.title}</p>
                        <p className="text-[9px] text-gray-500 font-medium leading-tight mt-0.5">{notif.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Perfil */}
        <div className="flex items-center gap-2 pl-2 sm:pl-6 border-l border-gray-200 dark:border-[#433d28]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-[#d4af35] to-[#f8f7f6] rounded-full flex items-center justify-center font-black text-[#201d13] text-xs shadow-lg">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
