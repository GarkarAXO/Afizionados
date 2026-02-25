'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

interface Product {
  id: string;
  title: string;
  priceCents: number;
  description: string | null;
  isAuction: boolean;
  stock: number;
  images: { url: string, type: string }[];
  category?: { name: string };
  auctions?: { id: string }[];
  details?: {
    fichaTecnica: string | null;
    infoColeccionista: string | null;
    cuidadosProduct: string | null;
    videoUrl: string | null;
  };
  certificates?: {
    title: string;
    description: string | null;
    issuedBy: string | null;
  }[];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
        const mainImg = data.data.images?.find((img: any) => img.type === 'MAIN')?.url || data.data.images?.[0]?.url;
        setActiveImage(mainImg || '');
      }
    } catch (error) {
      console.error('Error loading product details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 flex flex-col lg:flex-row gap-12 animate-pulse">
        <div className="w-full lg:w-1/2 aspect-square bg-gray-100 dark:bg-white/5 rounded-[3rem]"></div>
        <div className="flex-1 space-y-8">
          <div className="h-12 bg-gray-100 dark:bg-white/5 rounded-2xl w-3/4"></div>
          <div className="h-24 bg-gray-100 dark:bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="py-20 text-center uppercase font-black tracking-widest text-gray-500">Gema no encontrada</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-20 relative transition-colors duration-300">
      
      {/* LIGHTBOX */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in" onClick={() => setIsLightboxOpen(false)}>
          <button className="absolute top-8 right-8 text-white p-2 hover:bg-white/10 rounded-full transition-all">
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
          <img src={activeImage} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" alt="Vista expandida" />
        </div>
      )}

      {/* SECCIÓN SUPERIOR */}
      <section className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        <div className="w-full lg:w-1/2 space-y-6">
          <div onClick={() => setIsLightboxOpen(true)} className="relative aspect-square bg-gray-100 dark:bg-[#1a170e] rounded-[3rem] overflow-hidden border border-gray-200 dark:border-white/5 shadow-2xl group cursor-zoom-in">
            {activeImage ? (
              <img src={activeImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={product.title} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="material-symbols-outlined text-8xl">image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
            {product.isAuction && (
              <div className="absolute top-8 left-8 bg-[#d4af35] text-[#201d13] px-4 py-2 rounded-full font-black uppercase text-[10px] tracking-widest shadow-lg">Gema en Subasta</div>
            )}
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImage(img.url)} className={`w-20 h-20 sm:w-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === img.url ? 'border-[#d4af35]' : 'border-gray-200 dark:border-white/5 opacity-50'}`}>
                <img src={img.url} className="w-full h-full object-cover" alt="miniatura" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-10 text-left">
          <div className="space-y-4">
            <nav className="flex gap-2 text-[10px] font-black uppercase tracking-widest text-[#d4af35]">
              <Link href="/arena">Bóveda</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-500">{product.category?.name || 'Memorabilia'}</span>
            </nav>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-[1.1] text-gray-900 dark:text-white">{product.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base font-medium leading-relaxed">{product.description}</p>
          </div>

          <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-gray-200 dark:border-white/10 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Valoración</p>
                <p className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">
                  <span className="text-xl sm:text-2xl mr-1 text-[#d4af35]">$</span>
                  {(product.priceCents / 100).toLocaleString('es-MX')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${product.stock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {product.stock > 0 ? 'Disponible' : 'Adquirido'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {product.isAuction && product.auctions?.[0] ? (
                <Link href={`/arena/auctions/${product.auctions[0].id}`} className="flex-1 py-5 bg-[#d4af35] text-[#201d13] font-black rounded-2xl uppercase text-xs tracking-widest text-center hover:brightness-110 shadow-lg shadow-[#d4af35]/20 transition-all">Entrar a la Puja</Link>
              ) : !product.isAuction ? (
                <button onClick={handleAddToCart} className={`flex-1 py-5 font-black rounded-2xl uppercase text-xs tracking-widest text-center transition-all shadow-xl ${added ? 'bg-green-500 text-white' : 'bg-[#d4af35] text-[#201d13] hover:brightness-110'}`}>{added ? 'En Carrito' : 'Adquirir Pieza'}</button>
              ) : (
                <div className="flex-1 py-5 bg-gray-500/10 text-gray-500 font-black rounded-2xl uppercase text-xs text-center border border-gray-200">Subasta Pendiente</div>
              )}
              <button className="px-8 py-5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl hover:border-[#d4af35]/50 transition-all text-gray-400 hover:text-[#d4af35] shadow-sm"><span className="material-symbols-outlined">favorite</span></button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5">
              <span className="material-symbols-outlined text-[#d4af35]">workspace_premium</span>
              <div className="min-w-0"><p className="text-[10px] font-black uppercase text-gray-900 dark:text-white truncate">100% Auténtico</p><p className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Certificado</p></div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5">
              <span className="material-symbols-outlined text-[#d4af35]">local_shipping</span>
              <div className="min-w-0"><p className="text-[10px] font-black uppercase text-gray-900 dark:text-white truncate">Global Shipping</p><p className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Asegurado</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* DETALLES Y HISTORIA */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-gray-200 dark:border-white/5 pt-20 text-left">
        <div className="space-y-8">
          <div className="flex items-center gap-3"><span className="material-symbols-outlined text-[#d4af35]">list_alt</span><h3 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Ficha Técnica</h3></div>
          <div className="bg-gray-50 dark:bg-[#1a170e] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 min-h-[300px]"><p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed whitespace-pre-wrap">{product.details?.fichaTecnica || 'En auditoría.'}</p></div>
        </div>
        <div className="space-y-8">
          <div className="flex items-center gap-3"><span className="material-symbols-outlined text-[#d4af35]">history_edu</span><h3 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Historia</h3></div>
          <div className="bg-gray-50 dark:bg-[#1a170e] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 min-h-[300px]"><p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed whitespace-pre-wrap">{product.details?.infoColeccionista || 'Documentando historia.'}</p></div>
        </div>
        <div className="space-y-8">
          <div className="flex items-center gap-3"><span className="material-symbols-outlined text-[#d4af35]">verified</span><h3 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Autenticidad</h3></div>
          <div className="space-y-4">
            {product.certificates?.map((cert, i) => (
              <div key={i} className="p-6 bg-white dark:bg-gradient-to-br dark:from-[#1a170e] dark:to-[#0a0a0a] rounded-2xl border border-gray-200 dark:border-[#d4af35]/20 shadow-sm"><p className="text-[10px] font-black text-[#d4af35] uppercase mb-2">Emisor: {cert.issuedBy}</p><h4 className="text-gray-900 dark:text-white font-black uppercase text-sm mb-2">{cert.title}</h4><p className="text-gray-500 text-[10px] font-bold leading-relaxed">{cert.description}</p></div>
            )) || <p className="text-gray-400 text-[10px] font-black uppercase text-center py-10">En proceso de peritaje</p>}
          </div>
        </div>
      </section>

      {/* VIDEO */}
      {product.details?.videoUrl && (
        <section className="space-y-10 border-t border-gray-200 dark:border-white/5 pt-20 text-center">
          <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white">El Momento de la <span className="text-[#d4af35] italic">Verdad</span></h3>
          <div className="max-w-5xl mx-auto aspect-video bg-gray-100 dark:bg-[#1a170e] rounded-[3rem] overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl relative group cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center z-10 group-hover:bg-black/20 transition-all"><span className="material-symbols-outlined text-8xl text-[#d4af35] opacity-80 group-hover:scale-110 transition-all">play_circle</span></div>
            <img src="https://images.unsplash.com/photo-1518091043644-c1d445f008d7?auto=format&fit=crop&w=1920&q=80" className="w-full h-full object-cover opacity-40" alt="Video" />
          </div>
        </section>
      )}

      <section className="bg-gray-50 dark:bg-white/5 rounded-[3rem] p-10 sm:p-16 border border-gray-200 dark:border-white/5 transition-colors">
        <div className="max-w-3xl space-y-6 text-left"><div className="flex items-center gap-4"><span className="material-symbols-outlined text-[#d4af35] text-4xl">inventory_2</span><h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Preservación</h3></div><p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg leading-relaxed font-medium">{product.details?.cuidadosProduct || 'Condiciones controladas recomendadas.'}</p></div>
      </section>
    </div>
  );
}
