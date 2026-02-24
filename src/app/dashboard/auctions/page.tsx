'use client';

import React, { useState, useEffect } from 'react';
import { apiResponse } from '@/lib/api-response';

interface Auction {
  id: string;
  productId: string;
  product: { 
    title: string;
    priceCents: number;
    images: { url: string }[];
  };
  startingPriceCents: number;
  currentPriceCents: number;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'ACTIVE' | 'ENDED' | 'CANCELED';
  _count: { bids: number };
}

interface Product {
  id: string;
  title: string;
  isAuction: boolean;
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Estados para Modal de Nueva Subasta
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    startingPriceCents: 0,
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    fetchAuctions();
    fetchAuctionableProducts();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchAuctions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auctions?admin=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setAuctions(data.data);
    } catch (error) {
      console.error('Error loading auctions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuctionableProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        // Solo productos que sean para subasta y NO tengan una subasta activa
        const available = data.data.filter((p: any) => p.isAuction);
        setProducts(available);
      }
    } catch (err) {
      console.error('Error loading products');
    }
  };

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          startingPriceCents: Math.round(formData.startingPriceCents * 100)
        })
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Subasta iniciada en la arena' });
        setIsModalOpen(false);
        fetchAuctions();
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al iniciar subasta' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de cancelar esta subasta permanentemente?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/auctions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Subasta retirada de la arena' });
        fetchAuctions();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cancelar subasta' });
    }
  };

  const getStatusStyle = (status: string, endTime: string) => {
    const isPast = new Date() > new Date(endTime);
    if (status === 'ACTIVE' && !isPast) return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (status === 'ENDED' || isPast) return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    if (status === 'CANCELED') return 'bg-red-500/10 text-red-500 border-red-500/20';
    return 'bg-[#d4af35]/10 text-[#d4af35] border-[#d4af35]/20';
  };

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Centro de Pujas</h1>
          <p className="text-gray-500 dark:text-gray-400">Supervisa las subastas en curso y la actividad de los pujadores.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#d4af35] text-[#201d13] font-black px-6 py-3 rounded-lg hover:brightness-110 transition-all flex items-center gap-2 uppercase text-xs tracking-widest shadow-lg shadow-[#d4af35]/20"
        >
          <span className="material-symbols-outlined">gavel</span> Nueva Subasta
        </button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-500 animate-pulse uppercase text-[10px] tracking-widest">Monitoreando arena...</div>
        ) : auctions.length === 0 ? (
          <div className="col-span-full py-20 bg-white dark:bg-[#1a170e] rounded-2xl border border-dashed border-gray-200 dark:border-[#433d28] text-center">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-4">gavel</span>
            <p className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">No hay subastas activas en este momento</p>
          </div>
        ) : (
          auctions.map((auction) => {
            const isEnded = new Date() > new Date(auction.endTime);
            return (
              <div key={auction.id} className="bg-white dark:bg-[#1a170e] p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm relative group hover:border-[#d4af35]/50 transition-all overflow-hidden">
                <div className={`absolute top-4 right-4 px-2 py-1 rounded border text-[8px] font-black uppercase tracking-widest z-10 ${getStatusStyle(auction.status, auction.endTime)}`}>
                  {isEnded ? 'Terminada' : auction.status === 'ACTIVE' ? 'En Vivo' : auction.status}
                </div>
                
                <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-[#302c1c] rounded-xl overflow-hidden border border-gray-100 dark:border-[#433d28] flex-shrink-0">
                    {auction.product.images?.[0] ? (
                      <img src={auction.product.images[0].url} className="w-full h-full object-cover" alt={auction.product.title} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined text-xl">image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-black dark:text-white uppercase leading-tight mb-1 line-clamp-2">{auction.product.title}</h3>
                    <p className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Base: ${(auction.startingPriceCents / 100).toLocaleString('es-MX')}</p>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-4 sm:mb-6">
                  <div>
                    <p className="text-gray-500 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest mb-1">Precio Actual</p>
                    <p className="text-xl sm:text-2xl font-black text-[#d4af35] tracking-tight">${(auction.currentPriceCents / 100).toLocaleString('es-MX')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest mb-1">Pujas</p>
                    <p className="text-lg sm:text-xl font-black dark:text-white">{auction._count.bids}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-[#302c1c] flex justify-between items-center gap-2">
                  <div className="flex items-center gap-1.5 text-gray-400 min-w-0">
                    <span className="material-symbols-outlined text-sm flex-shrink-0">schedule</span>
                    <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest truncate">
                      {isEnded ? 'F: ' : 'Fin: '} 
                      {new Date(auction.endTime).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleDelete(auction.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                    <button className="bg-[#302c1c] text-[#d4af35] font-black px-3 sm:px-4 py-2 rounded-lg text-[8px] sm:text-[10px] uppercase tracking-widest hover:bg-[#d4af35] hover:text-[#201d13] transition-all border border-[#433d28]">
                      Detalles
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* MODAL NUEVA SUBASTA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1a170e] w-full max-w-md rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-[#433d28] flex justify-between items-center bg-gray-50 dark:bg-[#302c1c]/30">
              <h3 className="font-black dark:text-white uppercase tracking-widest text-sm">Iniciar Subasta</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[#d4af35] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateAuction} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Seleccionar Gema de la Bóveda</label>
                <select 
                  value={formData.productId}
                  onChange={(e) => setFormData({...formData, productId: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35]"
                  required
                >
                  <option value="">Selecciona un producto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Precio de Salida (MXN)</label>
                <input 
                  type="number" 
                  value={formData.startingPriceCents || ''}
                  onChange={(e) => setFormData({...formData, startingPriceCents: parseFloat(e.target.value)})}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35] font-black"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Apertura</label>
                  <input 
                    type="datetime-local" 
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-2 py-3 text-[10px] dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Cierre</label>
                  <input 
                    type="datetime-local" 
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-2 py-3 text-[10px] dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35]"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-gray-200 dark:border-[#433d28] rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-[#302c1c] transition-all">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-[#d4af35] text-[#201d13] rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-[#d4af35]/20 transition-all">Iniciar Puja</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
