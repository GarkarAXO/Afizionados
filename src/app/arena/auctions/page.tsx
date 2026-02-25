'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Auction {
  id: string;
  productId: string;
  product: { 
    title: string;
    images: { url: string }[];
    category?: { name: string };
  };
  startingPriceCents: number;
  currentPriceCents: number;
  endTime: string;
  _count: { bids: number };
}

export default function ArenaAuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const response = await fetch('/api/auctions');
      const data = await response.json();
      if (data.success) setAuctions(data.data);
    } catch (error) {
      console.error('Error fetching arena auctions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 transition-colors duration-300">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
        <div className="max-w-2xl text-left">
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight mb-4 text-gray-900 dark:text-white leading-none">La Arena de Pujas</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-lg font-medium leading-relaxed">
            Piezas legendarias buscando un nuevo guardián. Participa en las subastas más exclusivas del coleccionismo deportivo.
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-[#d4af35]/10 rounded-full border border-[#d4af35]/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af35] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af35]"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4af35]">{auctions.length} Subastas en Vivo</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(i => (
            <div key={i} className="h-96 bg-gray-100 dark:bg-white/5 rounded-[2rem] animate-pulse border border-gray-200 dark:border-white/5"></div>
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <div className="py-32 text-center bg-gray-50 dark:bg-white/5 rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10">
          <span className="material-symbols-outlined text-6xl text-gray-400 mb-6">gavel</span>
          <h3 className="text-2xl font-black uppercase text-gray-900 dark:text-white mb-2 text-center">La Arena está en silencio</h3>
          <p className="text-gray-500 font-medium uppercase text-[10px] tracking-[0.3em] text-center">Nuevas subastas serán anunciadas pronto</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          {auctions.map((auction) => (
            <div key={auction.id} className="group relative bg-gray-50 dark:bg-[#1a170e] rounded-[2.5rem] overflow-hidden border border-gray-200 dark:border-white/5 hover:border-[#d4af35]/30 transition-all duration-500 shadow-xl">
              
              <div className="relative h-64 sm:h-80 overflow-hidden">
                {auction.product.images?.[0] ? (
                  <img src={auction.product.images[0].url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={auction.product.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-900 text-gray-400">
                    <span className="material-symbols-outlined text-6xl">image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#1a170e] via-transparent to-transparent"></div>
                
                <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#d4af35] text-sm animate-pulse">timer</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white">Termina: {new Date(auction.endTime).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="p-8 sm:p-10 space-y-8 relative -mt-12 bg-gradient-to-b from-transparent to-gray-50 dark:to-[#1a170e]">
                <div className="space-y-2">
                  <p className="text-[10px] text-[#d4af35] font-black uppercase tracking-[0.3em]">Colección Élite</p>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none text-gray-900 dark:text-white group-hover:text-[#d4af35] transition-colors line-clamp-2">
                    {auction.product.title}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-8 py-6 border-y border-gray-200 dark:border-white/5 text-left">
                  <div className="space-y-1">
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Oferta Actual</p>
                    <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                      <span className="text-xs sm:text-sm mr-1 text-[#d4af35]">$</span>
                      {(auction.currentPriceCents / 100).toLocaleString('es-MX')}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Pujas</p>
                    <div className="flex items-center justify-end gap-2 text-2xl sm:text-3xl font-black text-[#d4af35]">
                      <span>{auction._count.bids}</span>
                      <span className="material-symbols-outlined text-lg">trending_up</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link 
                    href={`/arena/auctions/${auction.id}`}
                    className="flex-1 py-4 bg-[#d4af35] text-[#201d13] font-black rounded-2xl uppercase text-[10px] tracking-[0.2em] text-center hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
                  >
                    Entrar a la Puja
                  </Link>
                  <button className="px-6 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl flex items-center justify-center hover:border-[#d4af35]/50 text-gray-400 hover:text-[#d4af35] transition-all">
                    <span className="material-symbols-outlined">favorite</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
