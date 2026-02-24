'use client';

import React, { useState, useEffect } from 'react';

interface Order {
  id: string;
  totalCents: number;
  status: 'PENDING' | 'PAID' | 'CANCELED' | 'REFUNDED';
  currency: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: {
    id: string;
    quantity: number;
    priceAtPurchaseCents: number;
    product: {
      title: string;
    };
  }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setOrders(data.data);
    } catch (error) {
      console.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Estado de transacción actualizado' });
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as any });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar estado' });
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'CANCELED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'REFUNDED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Historial de Transacciones</h1>
        <p className="text-gray-500 dark:text-gray-400">Rastrea todas las adquisiciones de piezas realizadas en la arena.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center gap-3 animate-bounce shadow-lg ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-500' 
            : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          <span className="material-symbols-outlined text-sm">
            {message.type === 'success' ? 'check_circle' : 'warning'}
          </span>
          {message.text}
        </div>
      )}

      <div className="bg-white dark:bg-[#1a170e] rounded-2xl border border-gray-200 dark:border-[#433d28] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-[#433d28]">
          <h3 className="font-bold dark:text-white uppercase text-sm tracking-widest">Órdenes Realizadas</h3>
        </div>

        {/* VISTA DESKTOP: TABLA */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#302c1c]/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">ID Orden</th>
                <th className="px-6 py-4">Coleccionista</th>
                <th className="px-6 py-4">Inversión Total</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#433d28]">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 animate-pulse uppercase text-[10px] tracking-widest">Sincronizando bóveda de pagos...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 uppercase text-[10px] tracking-widest">No hay transacciones registradas</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-[#302c1c]/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-black dark:text-white uppercase">#ORD-{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold dark:text-white text-sm uppercase">{order.user?.name || 'Usuario Anónimo'}</p>
                      <p className="text-[10px] text-gray-500 lowercase">{order.user?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-[#d4af35]">${(order.totalCents / 100).toLocaleString('es-MX')} {order.currency}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">{order.items.length} piezas</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => setSelectedOrder(order)} className="p-2 text-gray-400 hover:text-[#d4af35] transition-colors"><span className="material-symbols-outlined text-lg">visibility</span></button>
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="bg-transparent text-[10px] font-black uppercase text-gray-400 outline-none border-b border-transparent focus:border-[#d4af35] cursor-pointer"
                        >
                          <option value="PENDING">Pendiente</option>
                          <option value="PAID">Pagado</option>
                          <option value="CANCELED">Cancelado</option>
                          <option value="REFUNDED">Reembolsado</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* VISTA MÓVIL: TARJETAS */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-[#433d28]">
          {loading ? (
            <div className="p-12 text-center text-gray-500 animate-pulse uppercase text-[10px] tracking-widest">Sincronizando bóveda de pagos...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500 uppercase text-[10px] tracking-widest">No hay transacciones registradas</div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] text-[#d4af35] font-black uppercase tracking-widest">Orden ID</p>
                    <p className="text-xs font-black dark:text-white uppercase leading-tight">#ORD-{order.id.slice(-6).toUpperCase()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase border ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-[#302c1c]/30 p-3 rounded-xl border border-gray-100 dark:border-[#433d28]">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Coleccionista</p>
                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Fecha</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="min-w-0 pr-4">
                      <p className="text-[10px] font-bold dark:text-white uppercase truncate leading-tight">{order.user?.name || 'Invitado'}</p>
                      <p className="text-[9px] text-gray-500 truncate leading-tight mt-0.5">{order.user?.email}</p>
                    </div>
                    <p className="text-[10px] dark:text-gray-300 font-black flex-shrink-0">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Inversión Total</p>
                    <p className="text-sm font-black text-[#d4af35]">${(order.totalCents / 100).toLocaleString('es-MX')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedOrder(order)} className="px-4 py-2 bg-[#d4af35] text-[#201d13] rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                      Detalles
                    </button>
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="bg-transparent text-[9px] font-black uppercase text-gray-400 outline-none border-b border-gray-200 dark:border-[#433d28] py-1 cursor-pointer"
                    >
                      <option value="PENDING">Pend.</option>
                      <option value="PAID">Pag.</option>
                      <option value="CANCELED">Canc.</option>
                      <option value="REFUNDED">Reem.</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL DETALLE DE ORDEN */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1a170e] w-full max-w-2xl rounded-3xl border border-gray-200 dark:border-[#433d28] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-[#433d28] flex justify-between items-center bg-gray-50 dark:bg-[#302c1c]/30">
              <div>
                <h3 className="font-black dark:text-white uppercase tracking-widest text-sm text-[#d4af35]">Manifiesto de Transacción</h3>
                <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Orden ID: {selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-[#d4af35] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Info Cliente */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Comprador</label>
                  <p className="text-sm font-black dark:text-white uppercase">{selectedOrder.user.name}</p>
                  <p className="text-xs text-gray-500 lowercase">{selectedOrder.user.email}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Fecha de Adquisición</label>
                  <p className="text-sm font-black dark:text-white uppercase">{new Date(selectedOrder.createdAt).toLocaleString('es-MX')}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-[#d4af35] uppercase tracking-widest">Piezas Adquiridas</label>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#302c1c]/30 rounded-2xl border border-gray-100 dark:border-[#433d28]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#d4af35]/10 rounded-lg flex items-center justify-center text-[#d4af35]">
                          <span className="material-symbols-outlined">token</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold dark:text-white uppercase">{item.product?.title || 'Pieza Desconocida'}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Cantidad: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-black dark:text-white">${((item.priceAtPurchaseCents * item.quantity) / 100).toLocaleString('es-MX')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total y Estado */}
              <div className="pt-6 border-t border-gray-100 dark:border-[#302c1c] flex justify-between items-end">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Estado Actual</label>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="text-right">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inversión Total</label>
                  <p className="text-4xl font-black text-[#d4af35] tracking-tighter">
                    <span className="text-lg mr-1">$</span>
                    {(selectedOrder.totalCents / 100).toLocaleString('es-MX')}
                    <span className="text-xs ml-2 text-gray-500 font-bold">{selectedOrder.currency}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-[#302c1c]/30 border-t border-gray-200 dark:border-[#433d28] flex gap-4">
              <button onClick={() => setSelectedOrder(null)} className="flex-1 py-4 border border-gray-200 dark:border-[#433d28] rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-[#302c1c] transition-all">Cerrar Manifiesto</button>
              {selectedOrder.status === 'PENDING' && (
                <button onClick={() => updateOrderStatus(selectedOrder.id, 'PAID')} className="flex-1 py-4 bg-[#d4af35] text-[#201d13] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-[#d4af35]/20 transition-all">Confirmar Pago</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
