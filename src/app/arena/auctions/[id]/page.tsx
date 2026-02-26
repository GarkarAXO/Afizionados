'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Bid {
  id: string;
  amountCents: number;
  createdAt: string;
  user: { name: string };
}

interface Auction {
  id: string;
  currentPriceCents: number;
  startingPriceCents: number;
  endTime: string;
  status: string;
  product: {
    title: string;
    description: string;
    images: { url: string }[];
  };
  bids: Bid[];
  _count: { bids: number };
}

export default function AuctionRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [placingBid, setPlacingBid] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchAuction();
    const interval = setInterval(fetchAuction, 10000); // Refrescar cada 10s
    return () => clearInterval(interval);
  }, [id]);

  const fetchAuction = async () => {
    try {
      const response = await fetch(`/api/auctions/${id}`);
      const data = await response.json();
      if (data.success) {
        setAuction(data.data);
        // Sugerir puja mínima: precio actual + 10%
        if (bidAmount === 0) {
          setBidAmount(Math.ceil((data.data.currentPriceCents / 100) * 1.1));
        }
      }
    } catch (error) {
      console.error('Error loading auction');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    if (!auction) return;
    const bidCents = Math.round(bidAmount * 100);

    if (bidCents <= auction.currentPriceCents) {
      setMessage({ type: 'error', text: 'La puja debe superar el precio actual' });
      return;
    }

    setPlacingBid(true);
    try {
      const response = await fetch(`/api/auctions/${id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amountCents: bidCents })
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: '¡Puja realizada con éxito!' });
        fetchAuction();
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al pujar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setPlacingBid(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="animate-pulse text-[#d4af35] font-black uppercase tracking-[0.5em]">Entrando a la Arena...</div>
    </div>
  );

  if (!auction) return <div className="py-20 text-center text-gray-500">Subasta no encontrada</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 transition-colors">
      
      {/* HEADER DE SALA */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
        
        {/* Lado Izquierdo: Visualización */}
        <div className="w-full lg:w-1/2 space-y-6">
          <Link href="/arena/auctions" className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-[#d4af35] uppercase tracking-widest transition-all">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Volver a la Arena
          </Link>
          <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-[#1a170e]">
            <img src={auction.product.images[0]?.url} className="w-full h-full object-cover" alt={auction.product.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-10 left-10 right-10">
              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight line-clamp-2">{auction.product.title}</h1>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Panel de Pujas */}
        <div className="flex-1 w-full space-y-8">
          
          {/* Cronómetro y Status */}
          <div className="p-8 bg-gradient-to-br from-[#1a170e] to-[#0a0a0a] rounded-[2.5rem] border border-[#d4af35]/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af35]/5 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex justify-between items-center mb-8">
              <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[8px] font-black uppercase tracking-[0.2em] animate-pulse">En Vivo</span>
              <div className="text-right">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Finaliza en</p>
                <p className="text-white font-black uppercase text-xs">{new Date(auction.endTime).toLocaleDateString()} - {new Date(auction.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-8">
              <div className="space-y-1">
                <p className="text-[9px] sm:text-[10px] text-gray-500 font-black uppercase tracking-widest">Oferta</p>
                <p className="text-2xl sm:text-5xl font-black text-[#d4af35] tracking-tighter">
                  <span className="text-sm sm:text-xl mr-0.5">$</span>
                  {(auction.currentPriceCents / 100).toLocaleString('es-MX')}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[9px] sm:text-[10px] text-gray-500 font-black uppercase tracking-widest">Pujas</p>
                <p className="text-2xl sm:text-5xl font-black text-white">{auction._count.bids}</p>
              </div>
            </div>

            {/* Formulario de Puja */}
            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-[#d4af35] font-black text-base sm:text-lg">$</div>
                <input 
                  type="number" 
                  value={bidAmount}
                  onChange={(e) => setBidAmount(parseFloat(e.target.value))}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 sm:py-5 pl-10 sm:pl-12 pr-4 sm:pr-6 text-lg sm:text-xl font-black text-white outline-none focus:border-[#d4af35] transition-all"
                  step="0.01"
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={placingBid}
                className="w-full py-5 bg-[#d4af35] text-[#201d13] font-black rounded-2xl uppercase text-xs tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[#d4af35]/20 disabled:opacity-50"
              >
                {placingBid ? 'Procesando Puja...' : 'Lanzar Oferta'}
              </button>
            </form>

            {message && (
              <div className={`mt-6 p-4 rounded-xl text-center text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                {message.text}
              </div>
            )}
          </div>

          {/* Historial de Batalla */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 px-4">Historial de Batalla</h3>
            <div className="space-y-3">
              {auction.bids.length === 0 ? (
                <div className="p-10 text-center bg-white/5 rounded-3xl border border-dashed border-white/10 opacity-40 uppercase text-[10px] font-black tracking-widest">Nadie ha lanzado el primer golpe</div>
              ) : (
                auction.bids.map((bid, i) => (
                  <div key={bid.id} className={`flex justify-between items-center p-5 rounded-2xl border transition-all ${i === 0 ? 'bg-[#d4af35]/5 border-[#d4af35]/30' : 'bg-white/5 border-white/5 opacity-60'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${i === 0 ? 'bg-[#d4af35] text-[#201d13]' : 'bg-white/10 text-gray-400'}`}>
                        {bid.user.name[0]}
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-tight ${i === 0 ? 'text-[#d4af35]' : 'text-gray-300'}`}>{bid.user.name}</p>
                        <p className="text-[8px] text-gray-500 font-bold uppercase">{new Date(bid.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-black ${i === 0 ? 'text-[#d4af35]' : 'text-white'}`}>${(bid.amountCents / 100).toLocaleString('es-MX')}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* DETALLES DE LA PIEZA */}
      <div className="pt-20 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
        <div className="space-y-4">
          <h4 className="text-xl font-black uppercase tracking-tight text-[#d4af35]">Descripción de la Gema</h4>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">{auction.product.description}</p>
        </div>
        <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <span className="material-symbols-outlined text-[#d4af35] text-3xl">verified_user</span>
            <h4 className="text-lg font-black uppercase tracking-tight">Autenticidad Garantizada</h4>
          </div>
          <p className="text-gray-500 text-xs font-medium italic">Esta pieza cuenta con certificado de autenticidad físico y registro digital en la Arena. La transferencia de propiedad se realiza tras la validación final del pago.</p>
        </div>
      </div>

    </div>
  );
}
