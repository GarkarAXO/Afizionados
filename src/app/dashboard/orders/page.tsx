'use client';

import React, { useState, useEffect } from 'react';

interface Order {
  id: string;
  totalCents: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación de carga (sustituir con API real /api/orders si se desea)
    setOrders([
      { id: '12345', totalCents: 1250000, status: 'PAID', createdAt: '2024-02-22' },
      { id: '12346', totalCents: 85000, status: 'PENDING', createdAt: '2024-02-21' },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Historial de Transacciones</h1>
        <p className="text-gray-500 dark:text-gray-400">Rastrea todas las adquisiciones de piezas realizadas en la arena.</p>
      </div>

      <div className="bg-white dark:bg-[#1a170e] rounded-2xl border border-gray-200 dark:border-[#433d28] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-[#433d28]">
          <h3 className="font-bold dark:text-white uppercase text-sm tracking-widest">Órdenes Realizadas</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#302c1c]/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">ID Orden</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Total (MXN)</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-center">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#433d28]">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 animate-pulse">Cargando órdenes...</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-[#302c1c]/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-black dark:text-white">#ORD-{order.id}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold dark:text-white">
                      ${(order.totalCents / 100).toLocaleString('es-MX')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        order.status === 'PAID' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 text-gray-400 hover:text-[#d4af35] transition-colors"><span className="material-symbols-outlined text-lg">visibility</span></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
