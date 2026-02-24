'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardData {
  stats: {
    totalSales: number;
    totalProducts: number;
    totalClients: number;
    activeAuctions: number;
  };
  recentOrders: any[];
  topCollectors: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      if (resData.success) setData(resData.data);
    } catch (error) {
      console.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="h-20 bg-gray-100 dark:bg-[#1a170e] rounded-2xl w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-[#1a170e] rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-64 bg-gray-100 dark:bg-[#1a170e] rounded-2xl"></div>
          <div className="h-64 bg-gray-100 dark:bg-[#1a170e] rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Ventas Totales', value: `$${((data?.stats.totalSales || 0) / 100).toLocaleString('es-MX')}`, icon: 'payments', trend: 'Histórico', color: 'text-green-500' },
    { label: 'Piezas Únicas', value: data?.stats.totalProducts || '0', icon: 'workspace_premium', trend: 'En Bóveda', color: 'text-blue-500' },
    { label: 'Coleccionistas', value: data?.stats.totalClients || '0', icon: 'group', trend: 'Registrados', color: 'text-[#d4af35]' },
    { label: 'Subastas Activas', value: data?.stats.activeAuctions || '0', icon: 'gavel', trend: 'En curso', color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white uppercase tracking-tight">Resumen</h1>
        <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 font-bold sm:font-normal uppercase sm:normal-case tracking-widest sm:tracking-normal mt-1">Bienvenido de nuevo, Administrador.</p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-[#1a170e] p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm hover:border-[#d4af35]/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 sm:p-3 bg-gray-50 dark:bg-[#302c1c] rounded-xl text-gray-400 group-hover:text-[#d4af35] transition-colors">
                <span className="material-symbols-outlined text-xl sm:text-2xl">{stat.icon}</span>
              </div>
              <span className={`text-[8px] sm:text-[10px] font-black ${stat.color} bg-opacity-10 px-2 py-1 rounded-full uppercase tracking-tighter sm:tracking-normal`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</h3>
            <p className="text-2xl sm:text-3xl font-black dark:text-white truncate">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Actividad Reciente */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1a170e] rounded-2xl border border-gray-200 dark:border-[#433d28] overflow-hidden shadow-sm">
          <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-[#433d28] flex justify-between items-center bg-gray-50/50 dark:bg-[#302c1c]/30">
            <h3 className="font-black dark:text-white uppercase text-[10px] sm:text-sm tracking-widest">Órdenes Recientes</h3>
            <Link href="/dashboard/orders" className="text-[9px] sm:text-[10px] font-black text-[#d4af35] uppercase hover:underline tracking-widest">Ver todas</Link>
          </div>
          <div className="p-0">
            {data?.recentOrders.length === 0 ? (
              <div className="p-16 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-4">history</span>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">No hay transacciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-[#302c1c]">
                {data?.recentOrders.map((order) => (
                  <div key={order.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#302c1c]/30 transition-colors">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${order.status === 'PAID' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]'}`}></div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-black dark:text-white uppercase truncate">{order.user.name}</p>
                        <p className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-black text-[#d4af35] flex-shrink-0 ml-4">${(order.totalCents / 100).toLocaleString('es-MX')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mejores Clientes */}
        <div className="bg-white dark:bg-[#1a170e] rounded-2xl border border-gray-200 dark:border-[#433d28] overflow-hidden shadow-sm">
          <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-[#433d28] flex justify-between items-center bg-gray-50/50 dark:bg-[#302c1c]/30">
            <h3 className="font-black dark:text-white uppercase text-[10px] sm:text-sm tracking-widest">Top Fans</h3>
            <Link href="/dashboard/customers" className="text-[9px] sm:text-[10px] font-black text-[#d4af35] uppercase hover:underline tracking-widest">Gestionar</Link>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {data?.topCollectors.length === 0 ? (
              <p className="text-center text-gray-500 text-[10px] uppercase py-10 font-bold tracking-widest">Sin actividad...</p>
            ) : (
              data?.topCollectors.map((collector, i) => (
                <div key={collector.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#302c1c]/30 transition-colors border border-transparent hover:border-[#d4af35]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#d4af35]/10 rounded-full flex items-center justify-center text-[#d4af35] font-black text-xs border border-[#d4af35]/20">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-sm font-black dark:text-white uppercase truncate">{collector.name}</p>
                      <p className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Coleccionista</p>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs font-black text-[#d4af35] ml-2 flex-shrink-0">${(collector.totalSpent / 100).toLocaleString('es-MX')}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
