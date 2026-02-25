'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  parentId: string | null;
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
  const [isSuccess, setIsSuccess] = useState(false);

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
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/products');
        }, 2500);
      } else {
        setError(data.message || 'Error al crear el producto');
        setLoading(false);
      }
    } catch (err) {
      setError('Algo salió mal. Por favor, inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 mb-20 relative">
      {isSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f8f7f6]/95 dark:bg-[#121212]/95 backdrop-blur-sm animate-fade-in-up">
          <div className="flex flex-col items-center text-center p-6 sm:p-8 w-full max-w-sm">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#d4af35]/10 rounded-full flex items-center justify-center text-[#d4af35] mb-6 ring-4 ring-[#d4af35]/10 animate-bounce">
              <span className="material-symbols-outlined text-4xl sm:text-5xl">inventory_2</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black dark:text-white uppercase tracking-tight mb-2">¡Pieza Registrada!</h2>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em]">
              La gema ha sido guardada en la Bóveda de Afizionados.
            </p>
            <div className="mt-8 w-16 h-1 bg-gray-100 dark:bg-[#302c1c] rounded-full overflow-hidden">
              <div className="h-full bg-[#d4af35] animate-loading"></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/dashboard/products" className="p-2 bg-white dark:bg-[#1a170e] rounded-xl border border-gray-200 dark:border-[#433d28] text-gray-400 hover:text-[#d4af35] transition-colors">
          <span className="material-symbols-outlined text-lg sm:text-2xl">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-xl sm:text-3xl font-black dark:text-white uppercase tracking-tight leading-none">Nueva Pieza</h1>
          <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase font-bold tracking-widest sm:normal-case sm:font-normal">Detalla cada aspecto de esta gema.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <div className="bg-white dark:bg-[#1a170e] p-5 sm:p-8 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm space-y-6">
            <h3 className="font-bold dark:text-white uppercase text-[10px] sm:text-xs tracking-widest text-[#d4af35]">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Título de la Pieza</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-1 focus:ring-[#d4af35] outline-none font-medium"
                  placeholder="Ej. Guantes firmados por Canelo"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</label>
                  <Link href="/dashboard/categories" className="text-[9px] font-bold text-[#d4af35] hover:underline uppercase tracking-widest">
                    + Nueva
                  </Link>
                </div>
                <select 
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-[#d4af35] outline-none font-bold"
                >
                  <option value="">Seleccionar colección...</option>
                  {categories.filter(c => !c.parentId).map(root => (
                    <optgroup key={root.id} label={root.name.toUpperCase()}>
                      <option value={root.id}>{root.name} (Principal)</option>
                      {categories.filter(sub => sub.parentId === root.id).map(sub => (
                        <option key={sub.id} value={sub.id}>&nbsp;&nbsp;• {sub.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descripción de la Pieza</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-1 focus:ring-[#d4af35] outline-none"
              />
            </div>
          </div>

          {/* Multimedia */}
          <div className="bg-white dark:bg-[#1a170e] p-5 sm:p-8 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm space-y-6">
            <h3 className="font-bold dark:text-white uppercase text-[10px] sm:text-xs tracking-widest text-[#d4af35]">Multimedia</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">URL Imagen Principal</label>
                <input 
                  type="text" 
                  value={formData.mainImageUrl}
                  onChange={(e) => setFormData({...formData, mainImageUrl: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-1 focus:ring-[#d4af35] outline-none"
                  placeholder="https://..."
                />
              </div>
              {formData.mainImageUrl && (
                <img src={formData.mainImageUrl} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-[#d4af35]/30 shadow-lg" alt="Preview" />
              )}
            </div>
          </div>

          {/* Detalles Técnicos */}
          <div className="bg-white dark:bg-[#1a170e] p-5 sm:p-8 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm space-y-6">
            <h3 className="font-bold dark:text-white uppercase text-[10px] sm:text-xs tracking-widest text-[#d4af35]">Detalles y Conservación</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ficha Técnica</label>
                  <textarea 
                    value={formData.details.fichaTecnica}
                    onChange={(e) => setFormData({...formData, details: {...formData.details, fichaTecnica: e.target.value}})}
                    placeholder="Materiales, dimensiones..."
                    className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Información Coleccionista</label>
                  <textarea 
                    value={formData.details.infoColeccionista}
                    onChange={(e) => setFormData({...formData, details: {...formData.details, infoColeccionista: e.target.value}})}
                    placeholder="Origen, dueños anteriores..."
                    className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#d4af35] uppercase tracking-widest mb-2">Instrucciones de Cuidado</label>
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
          <div className="bg-white dark:bg-[#1a170e] p-5 sm:p-8 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm space-y-6">
            <div className="flex justify-between items-center gap-2">
              <h3 className="font-bold dark:text-white uppercase text-[10px] sm:text-xs tracking-widest text-[#d4af35]">Autenticidad</h3>
              <button 
                type="button" 
                onClick={addCertificate}
                className="text-[9px] font-black text-[#d4af35] hover:underline uppercase tracking-widest"
              >
                + Añadir
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.certificates.map((cert, index) => (
                <div key={index} className="p-4 sm:p-6 bg-gray-50 dark:bg-[#302c1c]/50 rounded-xl border border-dashed border-gray-200 dark:border-[#433d28] space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Título</label>
                      <input 
                        type="text" 
                        value={cert.title}
                        onChange={(e) => updateCertificate(index, 'title', e.target.value)}
                        className="w-full bg-transparent border-b border-gray-200 dark:border-[#433d28] py-1 text-sm dark:text-white outline-none focus:border-[#d4af35] font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Emisor / URL Vídeo</label>
                      <input 
                        type="text" 
                        value={cert.issuedBy}
                        onChange={(e) => updateCertificate(index, 'issuedBy', e.target.value)}
                        placeholder="Ej. PSA/DNA o URL"
                        className="w-full bg-transparent border-b border-gray-200 dark:border-[#433d28] py-1 text-sm dark:text-white outline-none focus:border-[#d4af35]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Garantía</label>
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
          <div className="bg-white dark:bg-[#1a170e] p-5 sm:p-8 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm space-y-6">
            <h3 className="font-bold dark:text-white uppercase text-[10px] sm:text-xs tracking-widest text-[#d4af35]">Gestión</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Precio (MXN)</label>
                <input 
                  type="number" 
                  value={formData.priceCents || ''}
                  onChange={(e) => setFormData({...formData, priceCents: parseFloat(e.target.value)})}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white font-black"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock</label>
                <input 
                  type="number" 
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white font-bold"
                />
              </div>
            </div>
            
            <div 
              onClick={() => setFormData({...formData, isAuction: !formData.isAuction})}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                formData.isAuction ? 'border-[#d4af35] bg-[#d4af35]/10' : 'border-gray-100 dark:border-[#433d28]'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <span className={`material-symbols-outlined ${formData.isAuction ? 'text-[#d4af35]' : 'text-gray-400'}`}>gavel</span>
                <span className={`font-black text-[10px] uppercase ${formData.isAuction ? 'text-white' : 'text-gray-500'}`}>Habilitar Subasta</span>
              </div>
              <p className="text-[8px] text-gray-400 uppercase tracking-tighter leading-tight">Esta pieza se venderá mediante pujas si el modo está activo.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a170e] p-5 sm:p-8 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm sticky bottom-4 lg:relative lg:bottom-0 z-10 sm:z-0">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#d4af35] text-[#201d13] font-black py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-[10px] sm:text-xs disabled:opacity-50 shadow-lg shadow-[#d4af35]/20"
            >
              {loading ? 'Sincronizando...' : 'Publicar en la Arena'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
