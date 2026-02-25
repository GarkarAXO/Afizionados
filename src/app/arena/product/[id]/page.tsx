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
        <div className="w-full lg:w-1/2 aspect-square bg-white/5 rounded-[3rem]"></div>
        <div className="flex-1 space-y-8">
          <div className="h-12 bg-white/5 rounded-2xl w-3/4"></div>
          <div className="h-24 bg-white/5 rounded-2xl"></div>
          <div className="h-32 bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="py-20 text-center uppercase font-black tracking-widest text-gray-500">Gema no encontrada en la Bóveda</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-20 relative">
      
      {/* LIGHTBOX / ZOOM DE IMAGEN */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in" onClick={() => setIsLightboxOpen(false)}>
          <button className="absolute top-8 right-8 text-white p-2 hover:bg-white/10 rounded-full transition-all">
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
          <img src={activeImage} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" alt="Vista expandida" />
        </div>
      )}

      {/* SECCIÓN SUPERIOR: GALERÍA E INFO PRINCIPAL */}
      <section className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* Galería Inmersiva */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div 
            onClick={() => setIsLightboxOpen(true)}
            className="relative aspect-square bg-[#1a170e] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl group cursor-zoom-in"
          >
            {activeImage ? (
              <img src={activeImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={product.title} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-700">
                <span className="material-symbols-outlined text-8xl">image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
            <div className="absolute bottom-8 right-8 bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white">fullscreen</span>
            </div>
            {product.isAuction && (
              <div className="absolute top-8 left-8 bg-[#d4af35] text-[#201d13] px-4 py-2 rounded-full font-black uppercase text-[10px] tracking-widest shadow-lg animate-pulse">
                Gema en Subasta
              </div>
            )}
          </div>
          
          {/* Miniaturas */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {product.images.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImage(img.url)}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === img.url ? 'border-[#d4af35]' : 'border-white/5 opacity-50'}`}
              >
                <img src={img.url} className="w-full h-full object-cover" alt="Vista miniatura" />
              </button>
            ))}
          </div>
        </div>

        {/* Información de Venta */}
        <div className="flex-1 space-y-10">
          <div className="space-y-4">
            <nav className="flex gap-2 text-[10px] font-black uppercase tracking-widest text-[#d4af35]">
              <Link href="/arena">Bóveda</Link>
              <span>/</span>
              <span className="text-gray-500">{product.category?.name || 'Memorabilia'}</span>
            </nav>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-[1.1] dark:text-white">
              {product.title}
            </h1>
            <p className="text-gray-400 text-sm sm:text-base font-medium leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Valoración en Arena</p>
                <p className="text-4xl sm:text-5xl font-black text-white">
                  <span className="text-xl sm:text-2xl mr-1 text-[#d4af35]">$</span>
                  {(product.priceCents / 100).toLocaleString('es-MX')}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${product.stock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {product.stock > 0 ? 'Autenticado & Disponible' : 'Adquirido'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {product.isAuction && product.auctions?.[0] ? (
                <Link 
                  href={`/arena/auctions/${product.auctions[0].id}`}
                  className="flex-1 py-5 bg-[#d4af35] text-[#201d13] font-black rounded-2xl uppercase text-xs tracking-widest text-center hover:brightness-110 shadow-xl shadow-[#d4af35]/10"
                >
                  Entrar a la Arena de Pujas
                </Link>
              ) : !product.isAuction ? (
                <button 
                  onClick={handleAddToCart}
                  className={`flex-1 py-5 font-black rounded-2xl uppercase text-xs tracking-widest text-center transition-all shadow-xl ${
                    added 
                    ? 'bg-green-500 text-white shadow-green-500/20' 
                    : 'bg-[#d4af35] text-[#201d13] hover:brightness-110 shadow-[#d4af35]/10'
                  }`}
                >
                  {added ? 'Gema en Carrito' : 'Adquirir Pieza'}
                </button>
              ) : (
                <div className="flex-1 py-5 bg-gray-500/10 text-gray-500 font-black rounded-2xl uppercase text-xs tracking-widest text-center border border-gray-500/20">
                  Subasta Pendiente
                </div>
              )}
              <button className="px-8 py-5 bg-white/5 border border-white/10 rounded-2xl hover:border-[#d4af35]/50 transition-all group">
                <span className="material-symbols-outlined text-white group-hover:text-[#d4af35]">favorite</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="material-symbols-outlined text-[#d4af35]">workspace_premium</span>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase text-white truncate">100% Auténtico</p>
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Certificado Oficial</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="material-symbols-outlined text-[#d4af35]">local_shipping</span>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase text-white truncate">Global Shipping</p>
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Envío Asegurado</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE DETALLES TÉCNICOS Y AUTENTICACIÓN */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-white/5 pt-20">
        
        {/* Ficha Técnica */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#d4af35]">list_alt</span>
            <h3 className="text-xl font-black uppercase tracking-tight leading-none">Ficha Técnica</h3>
          </div>
          <div className="bg-[#1a170e] p-8 rounded-[2rem] border border-white/5 min-h-[300px]">
            <p className="text-gray-400 text-sm font-medium leading-relaxed whitespace-pre-wrap">
              {product.details?.fichaTecnica || 'Detalles técnicos en proceso de auditoría.'}
            </p>
          </div>
        </div>

        {/* Info para Coleccionistas */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#d4af35]">history_edu</span>
            <h3 className="text-xl font-black uppercase tracking-tight leading-none">Historia</h3>
          </div>
          <div className="bg-[#1a170e] p-8 rounded-[2rem] border border-white/5 min-h-[300px]">
            <p className="text-gray-400 text-sm font-medium leading-relaxed whitespace-pre-wrap">
              {product.details?.infoColeccionista || 'La historia de esta gema está siendo documentada por nuestros expertos.'}
            </p>
          </div>
        </div>

        {/* Certificados y Garantías */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#d4af35]">verified</span>
            <h3 className="text-xl font-black uppercase tracking-tight leading-none">Autenticidad</h3>
          </div>
          <div className="space-y-4">
            {product.certificates && product.certificates.length > 0 ? (
              product.certificates.map((cert, i) => (
                <div key={i} className="p-6 bg-gradient-to-br from-[#1a170e] to-[#0a0a0a] rounded-2xl border border-[#d4af35]/20 relative overflow-hidden group">
                  <div className="absolute top-[-50%] right-[-10%] w-32 h-32 bg-[#d4af35]/5 rounded-full blur-3xl"></div>
                  <p className="text-[10px] font-black text-[#d4af35] uppercase tracking-widest mb-2">Emitido por: {cert.issuedBy}</p>
                  <h4 className="text-white font-black uppercase text-sm mb-2">{cert.title}</h4>
                  <p className="text-gray-500 text-[10px] font-bold leading-relaxed">{cert.description}</p>
                </div>
              ))
            ) : (
              <div className="p-10 bg-white/5 rounded-[2rem] border border-dashed border-white/10 text-center">
                <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Certificados en Auditoría</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MOMENTO DE LA FIRMA (VIDEO) */}
      {product.details?.videoUrl && (
        <section className="space-y-10 border-t border-white/5 pt-20">
          <div className="text-center space-y-4">
            <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none">El Momento de la <span className="text-[#d4af35] italic">Verdad</span></h3>
            <p className="text-gray-500 text-sm sm:text-lg max-w-2xl mx-auto font-medium">Testimonio visual exclusivo de la autenticación de esta pieza histórica.</p>
          </div>
          <div className="max-w-5xl mx-auto aspect-video bg-[#1a170e] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group relative">
            {/* Aquí iría el reproductor de video real */}
            <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/40 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[100px] text-[#d4af35] opacity-80 group-hover:scale-110 transition-transform">play_circle</span>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1518091043644-c1d445f008d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
              className="w-full h-full object-cover opacity-40" 
              alt="Thumbnail de video de firma" 
            />
          </div>
        </section>
      )}

      {/* RECOMENDACIONES DE CUIDADO */}
      <section className="bg-gradient-to-b from-white/5 to-transparent rounded-[3rem] p-10 sm:p-16 border border-white/5">
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#d4af35] text-4xl">inventory_2</span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Preservación de la Gema</h3>
          </div>
          <p className="text-gray-400 text-sm sm:text-lg leading-relaxed font-medium">
            {product.details?.cuidadosProduct || 'Esta pieza requiere condiciones controladas de luz y humedad para mantener su valor histórico.'}
          </p>
        </div>
      </section>

    </div>
  );
}
