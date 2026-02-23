'use client';

import React, { useState, useEffect } from 'react';

interface Auction {
  id: string;
  product: { title: string };
  currentPriceCents: number;
  endTime: string;
  status: string;
  _count: { bids: number };
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación de carga (sustituir con API real /api/auctions si se desea)
    setAuctions([
      { id: '1', product: { title: 'Camiseta Messi Final 2022' }, currentPriceCents: 550000, endTime: '2024-03-01', status: 'ACTIVE', _count: { bids: 12 } },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Centro de Pujas</h1>
        <p className="text-gray-500 dark:text-gray-400">Supervisa las subastas en curso y la actividad de los pujadores.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500 animate-pulse">Monitoreando arena...</div>
        ) : (
          auctions.map((auction) => (
            <div key={auction.id} className="bg-white dark:bg-[#1a170e] p-6 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm relative group">
              <div className="absolute top-4 right-4 bg-green-500/10 text-green-500 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                En Vivo
              </div>
              
              <h3 className="text-lg font-black dark:text-white mb-2">{auction.product.title}</h3>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Precio Actual</p>
                  <p className="text-2xl font-black text-[#d4af35]">${(auction.currentPriceCents / 100).toLocaleString('es-MX')}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Pujas</p>
                  <p className="text-xl font-black dark:text-white">{auction._count.bids}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-[#302c1c] flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Fin: {new Date(auction.endTime).toLocaleDateString()}</span>
                </div>
                <button className="bg-[#302c1c] text-[#d4af35] font-black px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest hover:bg-[#d4af35] hover:text-[#201d13] transition-all">
                  Ver Detalles
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
