'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    priceCents: 0,
    description: '',
    stock: 1,
    isAuction: false,
    categoryId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          priceCents: Math.round(formData.priceCents * 100) // Convertir a centavos
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.push('/dashboard/products');
      } else {
        setError(data.message || 'Error al crear el producto');
      }
    } catch (err) {
      setError('Algo salió mal. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products" className="p-2 bg-white dark:bg-[#1a170e] rounded-xl border border-gray-200 dark:border-[#433d28] text-gray-400 hover:text-[#d4af35] transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Nueva Pieza de Colección</h1>
          <p className="text-gray-500 dark:text-gray-400">Completa los detalles para añadir una nueva gema a la arena.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-bold uppercase tracking-wider">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Principal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1a170e] p-8 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm space-y-6">
            <h3 className="font-bold dark:text-white uppercase text-xs tracking-widest text-[#d4af35]">Información Principal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Título de la Pieza</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-1 focus:ring-[#d4af35] outline-none"
                  placeholder="Ej. Balón Final Champions 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Descripción Detallada</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={6}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-1 focus:ring-[#d4af35] outline-none"
                  placeholder="Describe la historia y el estado de la pieza..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a170e] p-8 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm">
            <h3 className="font-bold dark:text-white uppercase text-xs tracking-widest text-[#d4af35] mb-6">Precio y Disponibilidad</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Precio (MXN)</label>
                <input 
                  type="number" 
                  value={formData.priceCents || ''}
                  onChange={(e) => setFormData({...formData, priceCents: parseFloat(e.target.value)})}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-1 focus:ring-[#d4af35] outline-none font-bold"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Stock Inicial</label>
                <input 
                  type="number" 
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-1 focus:ring-[#d4af35] outline-none font-bold"
                  placeholder="1"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lado Lateral (Configuraciones) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1a170e] p-8 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm">
            <h3 className="font-bold dark:text-white uppercase text-xs tracking-widest text-[#d4af35] mb-6">Tipo de Venta</h3>
            
            <div 
              onClick={() => setFormData({...formData, isAuction: !formData.isAuction})}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                formData.isAuction ? 'border-[#d4af35] bg-[#d4af35]/10' : 'border-gray-100 dark:border-[#433d28]'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`material-symbols-outlined ${formData.isAuction ? 'text-[#d4af35]' : 'text-gray-400'}`}>gavel</span>
                <span className={`font-bold text-sm ${formData.isAuction ? 'text-white' : 'text-gray-500'}`}>Subasta</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed uppercase">Si activas esto, la pieza se venderá al mejor postor mediante pujas.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a170e] p-8 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#d4af35] text-[#201d13] font-black py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest disabled:opacity-50 shadow-xl shadow-[#d4af35]/20"
            >
              {loading ? 'Guardando...' : 'Publicar en la Arena'}
            </button>
            <Link href="/dashboard/products" className="block text-center mt-4 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">
              Cancelar y volver
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
