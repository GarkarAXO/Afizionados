'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface Product {
  id: string;
  title: string;
  priceCents: number;
  stock: number;
  isAuction: boolean;
  images: { url: string }[];
  category?: { name: string };
}

export default function ArenaHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) setProducts(data.data.slice(0, 8));
    } catch (error) {
      console.error('Error fetching gallery products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 transition-colors duration-300">
      
      {/* HERO BANNER */}
      <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center scale-105 blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-white dark:to-[#0a0a0a]"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl animate-fade-in-up">
          <p className="text-[#d4af35] font-black uppercase text-[10px] sm:text-xs tracking-[0.5em] mb-4 drop-shadow-lg">Temporada 2026 • Colección Élite</p>
          <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tight leading-none mb-6 text-white text-balance">
            Adquiere una Pieza <br/>
            <span className="text-outline-gold italic">de la Historia</span>
          </h1>
          <p className="text-gray-200 text-xs sm:text-lg max-w-xl mx-auto font-medium leading-relaxed mb-8 drop-shadow-md">
            Memorabilia deportiva autenticada por los guardianes de la Arena. Gemas únicas firmadas y certificadas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/arena/all" className="w-full sm:w-auto px-8 py-4 bg-[#d4af35] text-[#201d13] font-black rounded-xl uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#d4af35]/20 text-center">
              Explorar Bóveda
            </Link>
            <Link href="/arena/auctions" className="w-full sm:w-auto px-8 py-4 bg-black/20 dark:bg-white/5 backdrop-blur-md border border-white/20 text-white font-black rounded-xl uppercase text-xs tracking-widest hover:bg-white/10 transition-all text-center">
              Ver Subastas
            </Link>
          </div>
        </div>
      </section>

      {/* GALERÍA DE PIEZAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 mb-12 border-b border-gray-200 dark:border-white/5 pb-8">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Recién Llegadas</h2>
            <p className="text-[#d4af35] text-[10px] sm:text-xs font-black uppercase tracking-widest mt-2">Nuevas gemas en la bóveda</p>
          </div>
          <Link href="/arena/all" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Ver catálogo completo</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[4/5] bg-gray-100 dark:bg-white/5 rounded-[2rem] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product) => (
              <div key={product.id} className="group flex flex-col bg-gray-50 dark:bg-[#1a170e] rounded-[2rem] border border-gray-200 dark:border-white/5 overflow-hidden transition-all duration-500 hover:border-[#d4af35]/30 shadow-sm hover:shadow-xl">
                {/* Imagen */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-200 dark:bg-black/20">
                  {product.isAuction && (
                    <div className="absolute top-4 left-4 z-10 bg-[#d4af35] text-[#201d13] text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest animate-pulse">
                      Subasta
                    </div>
                  )}
                  {product.images?.[0] ? (
                    <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined text-5xl">image</span>
                    </div>
                  )}
                  
                  {/* Overlay Desktop */}
                  <div className="hidden lg:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-3 p-6 text-white">
                    <Link href={`/arena/product/${product.id}`} className="w-full py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl text-center hover:bg-[#d4af35] transition-colors">
                      Ver Detalles
                    </Link>
                    {!product.isAuction && (
                      <button onClick={() => addToCart(product)} className="w-full py-3 bg-[#d4af35] text-[#201d13] font-black uppercase text-[10px] tracking-widest rounded-xl hover:brightness-110 transition-all">
                        Añadir a Bóveda
                      </button>
                    )}
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                  <div className="space-y-1">
                    <p className="text-[9px] text-[#d4af35] font-black uppercase tracking-widest">{product.category?.name || 'Pieza Única'}</p>
                    <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white group-hover:text-[#d4af35] transition-colors line-clamp-2 min-h-[2.5rem] leading-tight">{product.title}</h3>
                    <p className="text-base font-black text-gray-700 dark:text-gray-300">
                      {product.isAuction ? 'Base: ' : ''}${(product.priceCents / 100).toLocaleString('es-MX')}
                    </p>
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
      </section>

      {/* CALL TO ACTION SECUNDARIO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1a170e] dark:to-[#0a0a0a] rounded-[2rem] border border-gray-200 dark:border-[#d4af35]/20 p-8 sm:p-16 relative overflow-hidden text-center sm:text-left transition-colors">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[#d4af35]/10 rounded-full blur-[100px]"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none text-gray-900 dark:text-white text-balance">
                ¿Tienes una pieza <br/>
                <span className="text-[#d4af35] italic">legendaria?</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-lg max-w-md font-medium leading-relaxed">
                Nuestros expertos autentican y valúan tu memorabilia. Conviértete en un Guardian de la Arena.
              </p>
              <button className="px-8 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-black rounded-xl uppercase text-xs tracking-widest hover:border-[#d4af35]/50 transition-all shadow-sm">
                Contactar Perito
              </button>
            </div>
            <div className="w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
              <span className="material-symbols-outlined text-[120px] sm:text-[180px] text-[#d4af35]/20 animate-pulse">workspace_premium</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
