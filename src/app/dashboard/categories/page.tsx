'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  subcategories?: Category[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategoriesFlat, setAllCategoriesFlat] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Estados para el Modal de Edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editParentId, setEditParentId] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setAllCategoriesFlat(data.data);
        const roots = data.data.filter((cat: Category) => !cat.parentId);
        setCategories(roots);
      }
    } catch (err) {
      console.error('Error loading categories');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (category: Category) => {
    setCategoryToEdit(category);
    setEditName(category.name);
    setEditParentId(category.parentId || '');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCategoryToEdit(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToEdit) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/categories/${categoryToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: editName, 
          parentId: editParentId || null 
        })
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Cambios guardados correctamente' });
        closeEditModal();
        fetchCategories();
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al actualizar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría? Se desvincularán los productos asociados.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Categoría eliminada con éxito' });
        fetchCategories();
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al eliminar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: newName, 
          parentId: selectedParentId || null 
        }),
      });
      const data = await response.json();
      if (data.success) {
        setNewName('');
        setSelectedParentId('');
        setMessage({ type: 'success', text: 'Nueva categoría registrada' });
        fetchCategories();
      }
    } catch (err) {
      console.error('Error creating category');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 relative">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/dashboard/products" className="p-2 bg-white dark:bg-[#1a170e] rounded-xl border border-gray-200 dark:border-[#433d28] text-gray-400 hover:text-[#d4af35] transition-colors">
          <span className="material-symbols-outlined text-lg sm:text-2xl">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-xl sm:text-3xl font-black dark:text-white uppercase tracking-tight">Taxonomía</h1>
          <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 font-bold sm:font-normal uppercase sm:normal-case tracking-widest sm:tracking-normal mt-0.5">Organiza tus piezas por categorías.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] transition-all flex items-center gap-3 animate-bounce shadow-lg ${
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Formulario Lateral */}
        <div className="bg-white dark:bg-[#1a170e] p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm h-fit order-2 lg:order-1">
          <h3 className="font-black dark:text-white uppercase text-[10px] sm:text-xs tracking-widest text-[#d4af35] mb-6">Nueva Entrada</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nombre</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35] font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Dependencia</label>
              <select 
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35] font-bold"
              >
                <option value="">Categoría Principal</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={isCreating} className="w-full bg-[#d4af35] text-[#201d13] font-black py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest text-[10px] sm:text-xs disabled:opacity-50 shadow-lg shadow-[#d4af35]/10 mt-2">
              {isCreating ? 'Guardando...' : 'Crear'}
            </button>
          </form>
        </div>

        {/* Listado Principal */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1a170e] rounded-2xl border border-gray-200 dark:border-[#433d28] overflow-hidden shadow-sm order-1 lg:order-2">
          <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-[#433d28] bg-gray-50/50 dark:bg-[#302c1c]/30">
            <h3 className="font-black dark:text-white uppercase text-[10px] sm:text-sm tracking-widest">Estructura de la Bóveda</h3>
          </div>
          <div className="p-5 sm:p-8 space-y-4">
            {loading ? (
              <p className="text-gray-500 animate-pulse text-center py-20 uppercase text-[10px] tracking-widest font-black">Sincronizando...</p>
            ) : categories.length === 0 ? (
              <div className="py-20 text-center text-gray-500 uppercase text-[10px] font-black tracking-widest">No hay categorías registradas</div>
            ) : categories.map(cat => (
              <div key={cat.id} className="p-4 sm:p-5 bg-gray-50 dark:bg-[#302c1c]/30 rounded-2xl border border-gray-100 dark:border-[#433d28]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#d4af35] text-xl sm:text-2xl">folder</span>
                    <span className="font-black dark:text-white uppercase tracking-tight text-xs sm:text-base">{cat.name}</span>
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    <button onClick={() => openEditModal(cat)} className="p-2 text-gray-400 hover:text-[#d4af35] transition-colors"><span className="material-symbols-outlined text-lg sm:text-xl">edit</span></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-lg sm:text-xl">delete</span></button>
                  </div>
                </div>
                
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="mt-4 ml-4 sm:ml-8 space-y-3 border-l-2 border-[#d4af35]/20 pl-4 sm:pl-6">
                    {cat.subcategories.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 font-bold uppercase">
                          <span className="material-symbols-outlined text-[10px] sm:text-xs">subdirectory_arrow_right</span>
                          <span>{sub.name}</span>
                        </div>
                        <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                          <button onClick={() => openEditModal(sub)} className="p-1.5 text-gray-400 hover:text-[#d4af35]"><span className="material-symbols-outlined text-base sm:text-lg">edit</span></button>
                          <button onClick={() => handleDelete(sub.id)} className="p-1.5 text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-base sm:text-lg">delete</span></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL DE EDICIÓN */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1a170e] w-full max-w-md rounded-3xl border border-gray-200 dark:border-[#433d28] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-[#433d28] flex justify-between items-center bg-gray-50 dark:bg-[#302c1c]/30">
              <h3 className="font-black dark:text-white uppercase tracking-widest text-[10px] sm:text-sm">Editar Categoría</h3>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-[#d4af35] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 sm:p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nombre de la Pieza</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35] font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ubicación / Padre</label>
                <select 
                  value={editParentId}
                  onChange={(e) => setEditParentId(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35] font-bold"
                >
                  <option value="">Categoría Principal</option>
                  {allCategoriesFlat
                    .filter(c => c.id !== categoryToEdit?.id && !c.parentId)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                  }
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="button" onClick={closeEditModal} className="w-full sm:flex-1 px-4 py-4 border border-gray-200 dark:border-[#433d28] rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-[#302c1c] transition-all">Cancelar</button>
                <button type="submit" className="w-full sm:flex-1 px-4 py-4 bg-[#d4af35] text-[#201d13] rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-[#d4af35]/20 transition-all">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
