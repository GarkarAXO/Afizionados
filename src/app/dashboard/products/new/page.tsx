'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  subcategories?: Category[];
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    priceCents: 0,
    description: '',
    stock: 1,
    isAuction: false,
    categoryId: '',
    mainImageUrl: '',
    images: [] as string[],
    details: {
      fichaTecnica: '',
      infoColeccionista: '',
      cuidadosProduct: ''
    },
    certificates: [{ 
      title: 'Certificado de Autenticidad Garantizada', 
      description: 'Este artículo incluye el certificado indicado en la ficha técnica junto con el video del momento de la firma, que respalda la firma del jugador. Agrega esta pieza exclusiva a tu colección y lleva un momento inolvidable del deporte a tu espacio.',
      issuedBy: '', 
      fileUrl: '' 
    }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error('Error loading categories');
    }
  };

  const addCertificate = () => {
    setFormData({
      ...formData,
      certificates: [...formData.certificates, { 
        title: 'Certificado de Autenticidad', 
        description: 'Este artículo incluye el certificado indicado junto con el video de la firma...',
        issuedBy: '', 
        fileUrl: '' 
      }]
    });
  };

  const updateCertificate = (index: number, field: string, value: string) => {
    const newCerts = [...formData.certificates];
    newCerts[index] = { ...newCerts[index], [field]: value };
    setFormData({ ...formData, certificates: newCerts });
  };

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
          priceCents: Math.round(Number(formData.priceCents) * 100)
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
    <div className="max-w-6xl mx-auto space-y-8 mb-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products" className="p-2 bg-white dark:bg-[#1a170e] rounded-xl border border-gray-200 dark:border-[#433d28] text-gray-400 hover:text-[#d4af35] transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Nueva Pieza de Colección</h1>
          <p className="text-gray-500 dark:text-gray-400">Detalla cada aspecto de esta gema histórica.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-bold uppercase tracking-wider">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <div className="bg-white dark:bg-[#1a170e] p-8 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm space-y-6">
            <h3 className="font-bold dark:text-white uppercase text-xs tracking-widest text-[#d4af35]">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Título de la Pieza</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-1 focus:ring-[#d4af35] outline-none"
                  placeholder="Ej. Guantes firmados por Canelo"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Categoría</label>
                  <Link href="/dashboard/categories" className="text-[10px] font-bold text-[#d4af35] hover:underline uppercase tracking-widest">
                    + Nueva Categoría
                  </Link>
                </div>
                <select 
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-1 focus:ring-[#d4af35] outline-none"
                >
                  <option value="">Seleccionar categoría...</option>
                  {categories.map(cat => (
                    <optgroup key={cat.id} label={cat.name}>
                      <option value={cat.id}>{cat.name} (Principal)</option>
                      {cat.subcategories?.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Descripción de la Pieza</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-1 focus:ring-[#d4af35] outline-none"
              />
            </div>
          </div>

          {/* Multimedia */}
          <div className="bg-white dark:bg-[#1a170e] p-8 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm space-y-6">
            <h3 className="font-bold dark:text-white uppercase text-xs tracking-widest text-[#d4af35]">Multimedia</h3>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">URL Imagen Principal</label>
                <input 
                  type="text" 
                  value={formData.mainImageUrl}
                  onChange={(e) => setFormData({...formData, mainImageUrl: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-1 focus:ring-[#d4af35] outline-none"
                  placeholder="https://..."
                />
              </div>
              {formData.mainImageUrl && (
                <img src={formData.mainImageUrl} className="w-20 h-20 object-cover rounded-xl border border-[#d4af35]/30" alt="Preview" />
              )}
            </div>
          </div>

          {/* Detalles Técnicos */}
          <div className="bg-white dark:bg-[#1a170e] p-8 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm space-y-6">
            <h3 className="font-bold dark:text-white uppercase text-xs tracking-widest text-[#d4af35]">Detalles y Conservación</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Ficha Técnica</label>
                  <textarea 
                    value={formData.details.fichaTecnica}
                    onChange={(e) => setFormData({...formData, details: {...formData.details, fichaTecnica: e.target.value}})}
                    placeholder="Materiales, dimensiones..."
                    className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Información Coleccionista</label>
                  <textarea 
                    value={formData.details.infoColeccionista}
                    onChange={(e) => setFormData({...formData, details: {...formData.details, infoColeccionista: e.target.value}})}
                    placeholder="Origen, dueños anteriores..."
                    className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 text-[#d4af35]">Instrucciones de Cuidado</label>
                <textarea 
                  value={formData.details.cuidadosProduct}
                  onChange={(e) => setFormData({...formData, details: {...formData.details, cuidadosProduct: e.target.value}})}
                  placeholder="¿Cómo mantener la pieza en perfecto estado?"
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35]"
                />
              </div>
            </div>
          </div>

          {/* Autenticidad Garantizada */}
          <div className="bg-white dark:bg-[#1a170e] p-8 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold dark:text-white uppercase text-xs tracking-widest text-[#d4af35]">Autenticidad Garantizada</h3>
              <button 
                type="button" 
                onClick={addCertificate}
                className="text-[10px] font-bold text-[#d4af35] hover:underline uppercase tracking-widest"
              >
                + Añadir Certificado
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.certificates.map((cert, index) => (
                <div key={index} className="p-6 bg-gray-50 dark:bg-[#302c1c]/50 rounded-xl border border-dashed border-gray-200 dark:border-[#433d28] space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Título Certificado</label>
                      <input 
                        type="text" 
                        value={cert.title}
                        onChange={(e) => updateCertificate(index, 'title', e.target.value)}
                        className="w-full bg-transparent border-b border-gray-200 dark:border-[#433d28] py-1 text-sm dark:text-white outline-none focus:border-[#d4af35]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Emitido por / Vídeo de la Firma (URL)</label>
                      <input 
                        type="text" 
                        value={cert.issuedBy}
                        onChange={(e) => updateCertificate(index, 'issuedBy', e.target.value)}
                        placeholder="Ej. PSA/DNA o URL del Vídeo"
                        className="w-full bg-transparent border-b border-gray-200 dark:border-[#433d28] py-1 text-sm dark:text-white outline-none focus:border-[#d4af35]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Descripción de la Garantía</label>
                    <textarea 
                      value={cert.description}
                      onChange={(e) => updateCertificate(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full bg-transparent border border-gray-200 dark:border-[#433d28] p-2 rounded-lg text-xs dark:text-gray-300 outline-none focus:border-[#d4af35]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1a170e] p-8 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm space-y-6">
            <h3 className="font-bold dark:text-white uppercase text-xs tracking-widest text-[#d4af35]">Gestión y Valores</h3>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Precio (MXN)</label>
              <input 
                type="number" 
                value={formData.priceCents || ''}
                onChange={(e) => setFormData({...formData, priceCents: parseFloat(e.target.value)})}
                className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Stock Disponible</label>
              <input 
                type="number" 
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white"
              />
            </div>
            
            <div 
              onClick={() => setFormData({...formData, isAuction: !formData.isAuction})}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                formData.isAuction ? 'border-[#d4af35] bg-[#d4af35]/10' : 'border-gray-100 dark:border-[#433d28]'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="material-symbols-outlined text-[#d4af35]">gavel</span>
                <span className={`font-bold text-sm ${formData.isAuction ? 'text-white' : 'text-gray-500'}`}>Habilitar Subasta</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Esta pieza se venderá mediante pujas si está activo.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a170e] p-8 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#d4af35] text-[#201d13] font-black py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? 'Sincronizando...' : 'Publicar en la Arena'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
