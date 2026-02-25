'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

export default function ArenaCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error('Error fetching arena categories');
    } finally {
      setLoading(false);
    }
  };

  const rootCategories = categories.filter(c => !c.parentId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 transition-colors duration-300">
      
      <div className="max-w-3xl mb-16 animate-fade-in-up text-left">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight mb-4 text-gray-900 dark:text-white leading-none">Bibliotecas de la Arena</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-lg font-medium leading-relaxed">
          Navega por nuestras colecciones seleccionadas. Desde el fútbol clásico hasta el automovilismo de élite, cada categoría es un portal a la historia.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-100 dark:bg-white/5 rounded-[2rem] animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {rootCategories.map((root) => {
            const subcats = categories.filter(c => c.parentId === root.id);
            return (
              <div key={root.id} className="group relative">
                <div className="bg-gray-50 dark:bg-[#1a170e] rounded-[2.5rem] p-8 border border-gray-200 dark:border-white/5 group-hover:border-[#d4af35]/30 transition-all duration-500 h-full flex flex-col shadow-xl">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-[#d4af35]/10 rounded-2xl flex items-center justify-center text-[#d4af35]">
                      <span className="material-symbols-outlined text-3xl">auto_awesome_motion</span>
                    </div>
                    <Link href={`/arena/all?category=${root.id}`} className="p-2 bg-gray-200 dark:bg-white/5 rounded-full text-gray-500 hover:text-[#d4af35] transition-colors">
                      <span className="material-symbols-outlined text-center">arrow_forward</span>
                    </Link>
                  </div>

                  <h3 className="text-2xl font-black uppercase tracking-tight mb-4 text-gray-900 dark:text-white group-hover:text-[#d4af35] transition-colors">{root.name}</h3>
                  
                  <div className="flex-1 space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 dark:border-white/5 pb-2">Especialidades</p>
                    <div className="flex flex-wrap gap-2 text-left">
                      {subcats.map(sub => (
                        <Link key={sub.id} href={`/arena/all?category=${sub.id}`} className="px-3 py-1.5 bg-gray-200 dark:bg-white/5 hover:bg-[#d4af35]/10 border border-gray-300 dark:border-white/5 rounded-full text-[10px] font-bold text-gray-600 dark:text-gray-400 hover:text-[#d4af35] transition-all uppercase tracking-tighter">
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/5">
                    <Link href={`/arena/all?category=${root.id}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4af35] hover:underline">Ver catálogo</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Banner VIP */}
      <div className="mt-24 p-8 sm:p-16 rounded-[3rem] bg-gradient-to-r from-gray-100 to-gray-200 dark:from-[#0a0a0a] dark:to-[#1a170e] border border-gray-200 dark:border-white/5 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative text-center lg:text-left transition-colors">
        <div className="relative z-10 space-y-6 max-w-xl">
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none text-gray-900 dark:text-white">
            Curaduría <br/><span className="text-[#d4af35] italic text-outline-gold">Personalizada</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-lg font-medium leading-relaxed">¿Buscas algo específico? Nuestros peritos pueden ayudarte.</p>
          <button className="px-8 py-4 bg-[#d4af35] text-[#201d13] font-black rounded-xl uppercase text-xs tracking-widest hover:brightness-110 shadow-lg transition-all">Solicitar Búsqueda VIP</button>
        </div>
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
          <span className="material-symbols-outlined text-[100px] sm:text-[150px] text-[#d4af35] opacity-20">search_check</span>
        </div>
      </div>
    </div>
  );
}
