'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface Product {
  id: string;
  title: string;
  priceCents: number;
  isAuction: boolean;
  categoryId: string | null;
  images: { url: string }[];
  category?: { name: string, parentId: string | null };
}

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  subcategories?: Category[];
}

export default function ArenaAllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      const subCatIds = categories
        .filter(c => c.parentId === selectedCategory)
        .map(s => s.id);
      
      const idsToFilter = [selectedCategory, ...subCatIds];
      setFilteredProducts(products.filter(p => p.categoryId && idsToFilter.includes(p.categoryId)));
    }
  }, [selectedCategory, products, categories]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      if (prodData.success) setProducts(prodData.data);
      if (catData.success) setCategories(catData.data);
    } catch (error) {
      console.error('Error fetching catalog data');
    } finally {
      setLoading(false);
    }
  };

  const rootCategories = categories.filter(c => !c.parentId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 transition-colors duration-300">
      
      <div className="mb-12 text-left">
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4 text-gray-900 dark:text-white leading-tight">Catálogo de Gemas</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
          Explora nuestra colección completa de memorabilia deportiva. Navega por las bibliotecas de la Arena para encontrar la próxima gema de tu colección.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* FILTROS */}
        <aside className="w-full lg:w-64 space-y-8">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4af35] mb-6 text-left">Explorar Colecciones</h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              <button 
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border text-left ${
                  selectedCategory === 'all' 
                  ? 'bg-[#d4af35] text-[#201d13] border-[#d4af35] shadow-lg shadow-[#d4af35]/20' 
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:border-[#d4af35]/30'
                }`}
              >
                Todas las Piezas
              </button>

              {rootCategories.map(root => {
                const subcats = categories.filter(c => c.parentId === root.id);
                const isSelected = selectedCategory === root.id;
                
                return (
                  <div key={root.id} className="w-full space-y-1">
                    <button 
                      onClick={() => setSelectedCategory(root.id)}
                      className={`w-full px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border text-left ${
                        isSelected 
                        ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white border-[#d4af35]' 
                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:border-[#d4af35]/30'
                      }`}
                    >
                      {root.name}
                    </button>
                    
                    {subcats.length > 0 && (
                      <div className="pl-4 flex flex-wrap lg:flex-col gap-1 mt-1">
                        {subcats.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedCategory(sub.id)}
                            className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-tighter transition-all border text-left ${
                              selectedCategory === sub.id
                              ? 'text-[#d4af35] border-[#d4af35]/50 bg-[#d4af35]/5'
                              : 'text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
                            }`}
                          >
                            • {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* LISTADO DE PRODUCTOS */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[4/5] bg-gray-100 dark:bg-white/5 rounded-[2rem] animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group flex flex-col bg-gray-50 dark:bg-[#1a170e] rounded-[2rem] border border-gray-200 dark:border-white/5 overflow-hidden transition-all duration-500 hover:border-[#d4af35]/30 shadow-sm hover:shadow-xl">
                  {/* Imagen */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-200 dark:bg-black/20">
                    {product.isAuction && (
                      <div className="absolute top-4 left-4 z-10 bg-[#d4af35] text-[#201d13] text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">Subasta</div>
                    )}
                    {product.images?.[0] ? (
                      <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><span className="material-symbols-outlined text-5xl">image</span></div>
                    )}
                    
                    {/* Overlay Desktop */}
                    <div className="hidden lg:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-3 p-6 text-white">
                      <Link href={`/arena/product/${product.id}`} className="w-full py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl text-center hover:bg-[#d4af35]">Ver Detalles</Link>
                      {!product.isAuction && (
                        <button onClick={() => addToCart(product)} className="w-full py-3 bg-[#d4af35] text-[#201d13] font-black uppercase text-[10px] tracking-widest rounded-xl">Añadir a Bóveda</button>
                      )}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                    <div className="space-y-1">
                      <p className="text-[9px] text-[#d4af35] font-black uppercase tracking-widest">{product.category?.name || 'Pieza Única'}</p>
                      <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white group-hover:text-[#d4af35] transition-colors line-clamp-2 min-h-[2.5rem] leading-tight">{product.title}</h3>
                      <p className="text-base font-black text-gray-700 dark:text-gray-300">${(product.priceCents / 100).toLocaleString('es-MX')}</p>
                    </div>

                    {/* Botones Móvil */}
                    <div className="flex lg:hidden flex-col gap-2 pt-2">
                      <Link href={`/arena/product/${product.id}`} className="w-full py-3 bg-gray-200 dark:bg-white/5 text-gray-900 dark:text-white font-black uppercase text-[9px] tracking-widest rounded-xl text-center border border-gray-300 dark:border-white/5">
                        Ver Detalles
                      </Link>
                      {!product.isAuction && (
                        <button onClick={() => addToCart(product)} className="w-full py-3 bg-[#d4af35] text-[#201d13] font-black uppercase text-[9px] tracking-widest rounded-xl">
                          Añadir a Bóveda
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
