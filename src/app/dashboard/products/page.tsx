'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  priceCents: number;
  stock: number;
  isActive: boolean;
  isAuction: boolean;
  categoryId: string | null;
  description: string | null;
  category?: { name: string };
  images: { url: string, type: string }[];
  details?: {
    fichaTecnica: string | null;
    infoColeccionista: string | null;
    cuidadosProduct: string | null;
    videoUrl: string | null;
  };
  certificates?: {
    id?: string;
    title: string;
    description: string | null;
    issuedBy: string | null;
    fileUrl: string | null;
  }[];
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTab, setEditTab] = useState<'basic' | 'details' | 'certs'>('basic');
  const [editFormData, setEditFormData] = useState({
    title: '',
    priceCents: 0,
    stock: 0,
    categoryId: '',
    description: '',
    isAuction: false,
    mainImageUrl: '',
    details: {
      fichaTecnica: '',
      infoColeccionista: '',
      cuidadosProduct: '',
      videoUrl: ''
    },
    certificates: [] as any[]
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) setProducts(data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error('Error loading categories');
    }
  };

  const openEditModal = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`);
      if (!res.ok) throw new Error('Error al obtener datos del servidor');
      
      const data = await res.json();
      const fullProduct = data.data;

      if (!fullProduct) throw new Error('No se encontraron datos');

      setEditingProduct(fullProduct);
      setEditFormData({
        title: fullProduct.title || '',
        priceCents: (fullProduct.priceCents || 0) / 100,
        stock: fullProduct.stock || 0,
        categoryId: fullProduct.categoryId || '',
        description: fullProduct.description || '',
        isAuction: !!fullProduct.isAuction,
        mainImageUrl: fullProduct.images?.find((img: any) => img.type === 'MAIN')?.url || '',
        details: {
          fichaTecnica: fullProduct.details?.fichaTecnica || '',
          infoColeccionista: fullProduct.details?.infoColeccionista || '',
          cuidadosProduct: fullProduct.details?.cuidadosProduct || '',
          videoUrl: fullProduct.details?.videoUrl || ''
        },
        certificates: fullProduct.certificates?.map((c: any) => ({
          title: c.title || '',
          description: c.description || '',
          issuedBy: c.issuedBy || '',
          fileUrl: c.fileUrl || ''
        })) || []
      });
      setEditTab('basic');
      setIsEditModalOpen(true);
    } catch (error: any) {
      alert(error.message || 'Error al cargar datos completos del producto. ¿Ejecutaste npx prisma db push?');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Pieza actualizada correctamente en la bóveda' });
        setIsEditModalOpen(false);
        fetchProducts();
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al actualizar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión al actualizar el producto' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta pieza de la colección?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Pieza retirada de la colección con éxito' });
        fetchProducts();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar la pieza' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Bóveda de Inventario</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestión total de piezas únicas y autenticadas.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/categories" className="bg-white dark:bg-[#1a170e] text-gray-500 dark:text-gray-400 font-bold px-6 py-3 rounded-lg border border-gray-200 dark:border-[#433d28] hover:border-[#d4af35] transition-all flex items-center gap-2 uppercase text-xs tracking-widest">
            <span className="material-symbols-outlined text-lg">category</span> Categorías
          </Link>
          <Link href="/dashboard/products/new" className="bg-[#d4af35] text-[#201d13] font-black px-6 py-3 rounded-lg hover:brightness-110 transition-all flex items-center gap-2 uppercase text-xs tracking-widest shadow-lg shadow-[#d4af35]/20">
            <span className="material-symbols-outlined">add</span> Nueva Pieza
          </Link>
        </div>
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

      <div className="bg-white dark:bg-[#1a170e] rounded-2xl border border-gray-200 dark:border-[#433d28] overflow-hidden shadow-sm transition-colors duration-300">
        {/* VISTA DESKTOP: TABLA */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#302c1c]/50 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100 dark:border-[#433d28]">
                <th className="px-6 py-4">Pieza</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4">Inversión</th>
                <th className="px-6 py-4 text-center">Tipo</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#433d28]">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 animate-pulse uppercase text-[10px] tracking-widest">Sincronizando...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 uppercase text-[10px] tracking-widest">No hay piezas registradas</td></tr>
              ) : products.map((product) => {
                const mainImage = product.images?.find(img => img.type === 'MAIN')?.url || product.images?.[0]?.url;
                return (
                  <tr key={product.id} className="hover:bg-gray-50/80 dark:hover:bg-[#302c1c]/30 transition-colors group text-gray-900 dark:text-white">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div onClick={() => mainImage && setSelectedImage(mainImage)} className="w-12 h-12 bg-gray-100 dark:bg-[#302c1c] rounded-lg overflow-hidden flex items-center justify-center cursor-zoom-in border border-gray-200 dark:border-transparent group-hover:border-[#d4af35]/50 transition-all shadow-sm">
                          {mainImage ? <img src={mainImage} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-gray-400">image</span>}
                        </div>
                        <div>
                          <p className="font-bold text-sm uppercase">{product.title}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">{product.category?.name || 'Gema suelta'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full font-black text-[10px] uppercase ${product.stock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {product.stock} disp.
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black dark:text-white">${(product.priceCents / 100).toLocaleString('es-MX')}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`material-symbols-outlined text-sm ${product.isAuction ? 'text-[#d4af35]' : 'text-gray-600'}`}>{product.isAuction ? 'gavel' : 'shopping_bag'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEditModal(product)} className="p-2 text-gray-400 hover:text-[#d4af35] transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* VISTA MÓVIL: TARJETAS (360px) */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-[#433d28]">
          {loading ? (
            <div className="p-12 text-center text-gray-500 animate-pulse uppercase text-[10px] tracking-widest">Sincronizando...</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-gray-500 uppercase text-[10px] tracking-widest">No hay piezas registradas</div>
          ) : products.map((product) => {
            const mainImage = product.images?.find(img => img.type === 'MAIN')?.url || product.images?.[0]?.url;
            return (
              <div key={product.id} className="p-4 space-y-4">
                <div className="flex gap-4">
                  <div onClick={() => mainImage && setSelectedImage(mainImage)} className="w-20 h-20 bg-gray-100 dark:bg-[#302c1c] rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-[#433d28]">
                    {mainImage ? <img src={mainImage} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-gray-400 text-3xl flex items-center justify-center h-full">image</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-black dark:text-white text-xs uppercase truncate leading-tight">{product.title}</p>
                      <span className={`material-symbols-outlined text-xs flex-shrink-0 ${product.isAuction ? 'text-[#d4af35]' : 'text-gray-400'}`}>
                        {product.isAuction ? 'gavel' : 'shopping_bag'}
                      </span>
                    </div>
                    <p className="text-[9px] text-[#d4af35] font-black uppercase tracking-widest mt-1">{product.category?.name || 'Gema suelta'}</p>
                    <p className="text-sm font-black dark:text-white mt-2">${(product.priceCents / 100).toLocaleString('es-MX')}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className={`px-2 py-1 rounded-full font-black text-[8px] uppercase ${product.stock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {product.stock} disponibles
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(product)} className="flex items-center gap-1 px-3 py-2 bg-gray-50 dark:bg-[#302c1c] rounded-lg text-gray-400 hover:text-[#d4af35] transition-colors">
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span className="text-[8px] font-black uppercase">Editar</span>
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="flex items-center gap-1 px-3 py-2 bg-red-500/5 rounded-lg text-red-500/50 hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-sm">delete</span>
                      <span className="text-[8px] font-black uppercase">Borrar</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* MODAL DE EDICIÓN PROFUNDO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a170e] w-full max-w-4xl rounded-3xl border border-gray-200 dark:border-[#433d28] shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-gray-200 dark:border-[#433d28] flex justify-between items-center bg-gray-50 dark:bg-[#302c1c]/30">
              <div>
                <h3 className="font-black dark:text-white uppercase tracking-[0.2em] text-sm">Refinar Pieza Histórica</h3>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">ID: {editingProduct?.id}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-[#d4af35] transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>

            <div className="flex bg-gray-50 dark:bg-[#1a170e] border-b border-gray-200 dark:border-[#433d28]">
              <button type="button" onClick={() => setEditTab('basic')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${editTab === 'basic' ? 'text-[#d4af35] border-b-2 border-[#d4af35] bg-[#d4af35]/5' : 'text-gray-500'}`}>Datos Básicos</button>
              <button type="button" onClick={() => setEditTab('details')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${editTab === 'details' ? 'text-[#d4af35] border-b-2 border-[#d4af35] bg-[#d4af35]/5' : 'text-gray-500'}`}>Detalles Técnicos</button>
              <button type="button" onClick={() => setEditTab('certs')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${editTab === 'certs' ? 'text-[#d4af35] border-b-2 border-[#d4af35] bg-[#d4af35]/5' : 'text-gray-500'}`}>Autenticidad</button>
            </div>

            <form onSubmit={handleUpdate} className="p-8">
              <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                {editTab === 'basic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Título de la Obra</label>
                      <input type="text" value={editFormData.title || ''} onChange={e => setEditFormData({...editFormData, title: e.target.value})} className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35]" required />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción Principal</label>
                      <textarea value={editFormData.description || ''} onChange={e => setEditFormData({...editFormData, description: e.target.value})} rows={3} className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35]" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Inversión (MXN)</label>
                      <input type="number" value={editFormData.priceCents || 0} onChange={e => setEditFormData({...editFormData, priceCents: parseFloat(e.target.value)})} className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none font-black" required />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</label>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setEditFormData({...editFormData, stock: Math.max(0, editFormData.stock - 1)})} className="w-10 h-10 rounded-lg bg-[#302c1c] text-[#d4af35] border border-[#433d28] hover:bg-[#d4af35] hover:text-[#201d13] font-bold">-</button>
                        <input type="number" value={editFormData.stock || 0} onChange={e => setEditFormData({...editFormData, stock: parseInt(e.target.value) || 0})} className="flex-1 bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-center text-sm dark:text-white font-black outline-none" />
                        <button type="button" onClick={() => setEditFormData({...editFormData, stock: editFormData.stock + 1})} className="w-10 h-10 rounded-lg bg-[#302c1c] text-[#d4af35] border border-[#433d28] hover:bg-[#d4af35] hover:text-[#201d13] font-bold">+</button>
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</label>
                      <select 
                        value={editFormData.categoryId || ''} 
                        onChange={e => setEditFormData({...editFormData, categoryId: e.target.value})} 
                        className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35] font-bold"
                      >
                        <option value="">Sin categoría</option>
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
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">URL Imagen Principal</label>
                      <input type="text" value={editFormData.mainImageUrl || ''} onChange={e => setEditFormData({...editFormData, mainImageUrl: e.target.value})} className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none" />
                    </div>
                    <div 
                      onClick={() => setEditFormData({...editFormData, isAuction: !editFormData.isAuction})}
                      className={`md:col-span-2 p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${editFormData.isAuction ? 'border-[#d4af35] bg-[#d4af35]/10' : 'border-gray-100 dark:border-[#433d28]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined ${editFormData.isAuction ? 'text-[#d4af35]' : 'text-gray-400'}`}>gavel</span>
                        <span className={`font-bold text-xs uppercase ${editFormData.isAuction ? 'text-white' : 'text-gray-500'}`}>Modo Subasta Habilitado</span>
                      </div>
                      <div className={`w-10 h-5 rounded-full relative transition-all ${editFormData.isAuction ? 'bg-[#d4af35]' : 'bg-gray-600'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${editFormData.isAuction ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                  </div>
                )}

                {editTab === 'details' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Ficha Técnica</label>
                        <textarea value={editFormData.details.fichaTecnica || ''} onChange={e => setEditFormData({...editFormData, details: {...editFormData.details, fichaTecnica: e.target.value}})} rows={4} className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Info Coleccionista</label>
                        <textarea value={editFormData.details.infoColeccionista || ''} onChange={e => setEditFormData({...editFormData, details: {...editFormData.details, infoColeccionista: e.target.value}})} rows={4} className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-[#d4af35] uppercase tracking-widest">Cuidados del Producto</label>
                      <textarea value={editFormData.details.cuidadosProduct || ''} onChange={e => setEditFormData({...editFormData, details: {...editFormData.details, cuidadosProduct: e.target.value}})} rows={3} className="w-full bg-gray-50 dark:bg-[#302c1c] border border-[#d4af35]/30 border-dashed rounded-xl px-4 py-3 text-sm dark:text-white outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Video del momento de la firma (URL)</label>
                      <input type="text" value={editFormData.details.videoUrl || ''} onChange={e => setEditFormData({...editFormData, details: {...editFormData.details, videoUrl: e.target.value}})} className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none" />
                    </div>
                  </div>
                )}

                {editTab === 'certs' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-black text-[#d4af35] uppercase tracking-[0.2em]">Certificados de Autenticidad</h4>
                      <button type="button" onClick={() => setEditFormData({...editFormData, certificates: [...editFormData.certificates, { title: 'Nuevo Certificado', description: '', issuedBy: '', fileUrl: '' }]})} className="text-[10px] font-black text-white bg-[#302c1c] px-3 py-1 rounded-lg border border-[#433d28] hover:border-[#d4af35] transition-all uppercase">+ Añadir</button>
                    </div>
                    <div className="space-y-4">
                      {editFormData.certificates.map((cert, index) => (
                        <div key={index} className="p-6 bg-gray-50 dark:bg-[#302c1c]/50 rounded-2xl border border-gray-200 dark:border-[#433d28] relative">
                          <button type="button" onClick={() => setEditFormData({...editFormData, certificates: editFormData.certificates.filter((_, i) => i !== index)})} className="absolute top-4 right-4 text-red-500/50 hover:text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input type="text" value={cert.title || ''} onChange={e => {
                              const newCerts = [...editFormData.certificates];
                              newCerts[index].title = e.target.value;
                              setEditFormData({...editFormData, certificates: newCerts});
                            }} placeholder="Título del Certificado" className="bg-transparent border-b border-gray-200 dark:border-[#433d28] py-1 text-sm dark:text-white outline-none focus:border-[#d4af35]" />
                            <input type="text" value={cert.issuedBy || ''} onChange={e => {
                              const newCerts = [...editFormData.certificates];
                              newCerts[index].issuedBy = e.target.value;
                              setEditFormData({...editFormData, certificates: newCerts});
                            }} placeholder="Emitido por" className="bg-transparent border-b border-gray-200 dark:border-[#433d28] py-1 text-sm dark:text-white outline-none focus:border-[#d4af35]" />
                          </div>
                          <textarea value={cert.description || ''} onChange={e => {
                            const newCerts = [...editFormData.certificates];
                            newCerts[index].description = e.target.value;
                            setEditFormData({...editFormData, certificates: newCerts});
                          }} rows={2} placeholder="Descripción de la garantía..." className="w-full bg-transparent border border-gray-200 dark:border-[#433d28] p-2 rounded-lg text-xs dark:text-gray-400 outline-none" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-8 mt-4 border-t border-gray-100 dark:border-[#302c1c]">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 border border-gray-200 dark:border-[#433d28] rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-[#302c1c] transition-all">Descartar</button>
                <button type="submit" className="flex-1 py-4 bg-[#d4af35] text-[#201d13] rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-[#d4af35]/20 transition-all">Guardar Cambios en la Bóveda</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE IMAGEN */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full flex items-center justify-center animate-in zoom-in-95">
            <img src={selectedImage} alt="Preview" className="max-h-[80vh] w-auto rounded-2xl shadow-2xl border-2 border-white/10" />
          </div>
        </div>
      )}
    </div>
  );
}
