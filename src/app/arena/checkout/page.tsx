'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    phone: ''
  });

  // Redirigir si el carrito está vacío (a menos que acabemos de tener éxito)
  useEffect(() => {
    if (cart.length === 0 && !isSuccess) {
      router.push('/arena');
    }
  }, [cart, isSuccess, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      // En una implementación real, aquí llamaríamos a la API de /api/orders/checkout
      // Simularemos el proceso para esta fase de diseño
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSuccess(true);
      clearCart();
      
      setTimeout(() => {
        router.push('/arena');
      }, 5000);
    } catch (error) {
      alert('Error al procesar la adquisición');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center space-y-8 animate-fade-in-up">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto ring-8 ring-green-500/5">
            <span className="material-symbols-outlined text-5xl">verified</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Adquisición Confirmada</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-md mx-auto">
              Tu manifiesto ha sido registrado. Un perito de la Arena se pondrá en contacto contigo para coordinar el envío asegurado.
            </p>
          </div>
          <div className="pt-8">
            <Link href="/arena" className="px-10 py-4 bg-[#d4af35] text-[#201d13] font-black rounded-xl uppercase text-xs tracking-widest hover:brightness-110 transition-all shadow-xl shadow-[#d4af35]/20">
              Volver a la Bóveda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
      <div className="flex items-center gap-4 mb-12">
        <Link href="/arena" className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 text-gray-400 hover:text-[#d4af35] transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">Checkout</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
        
        {/* FORMULARIO DE ENVÍO */}
        <form onSubmit={handleSubmit} className="flex-1 w-full space-y-8 order-2 lg:order-1">
          <div className="space-y-6">
            <h3 className="text-lg font-black uppercase tracking-widest text-[#d4af35] flex items-center gap-3">
              <span className="material-symbols-outlined">local_shipping</span> 1. Detalles de Entrega
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Nombre del Coleccionista</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold"
                  placeholder="NOMBRE COMPLETO"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Dirección de la Bóveda Privada</label>
                <input 
                  type="text" required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold"
                  placeholder="CALLE, NÚMERO, COLONIA"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Ciudad</label>
                <input 
                  type="text" required
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold"
                  placeholder="CDMX"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Código Postal</label>
                <input 
                  type="text" required
                  value={formData.zip}
                  onChange={(e) => setFormData({...formData, zip: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold"
                  placeholder="00000"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-gray-100 dark:border-white/5">
            <h3 className="text-lg font-black uppercase tracking-widest text-[#d4af35] flex items-center gap-3">
              <span className="material-symbols-outlined">payments</span> 2. Protocolo de Pago
            </h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Las transacciones en la Arena se realizan bajo protocolos de alta seguridad. Tras confirmar el pedido, recibirás las instrucciones para la transferencia bancaria o pago con tarjeta asegurado.
            </p>
            <div className="p-6 bg-gray-50 dark:bg-[#1a170e] rounded-2xl border-2 border-dashed border-[#d4af35]/20 flex items-center gap-4">
              <span className="material-symbols-outlined text-3xl text-[#d4af35]">lock</span>
              <span className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-400 tracking-widest">Conexión Encriptada • Pago Protegido</span>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-[#d4af35] text-[#201d13] font-black rounded-[2rem] uppercase text-xs sm:text-sm tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all shadow-2xl shadow-[#d4af35]/20 disabled:opacity-50"
          >
            {loading ? 'Sincronizando...' : 'Confirmar Adquisición'}
          </button>
        </form>

        {/* RESUMEN DE LA ORDEN */}
        <aside className="w-full lg:w-[400px] sticky top-32 order-1 lg:order-2">
          <div className="bg-gray-50 dark:bg-[#1a170e] rounded-[2.5rem] p-8 border border-gray-200 dark:border-white/5 shadow-2xl space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 border-b border-gray-200 dark:border-white/5 pb-4">Tu Selección</h3>
            
            <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 flex-shrink-0">
                    <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase truncate">{item.title}</p>
                    <p className="text-xs font-bold text-[#d4af35] mt-1">${(item.priceCents / 100).toLocaleString('es-MX')}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-white/5">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500 tracking-widest">
                <span>Piezas</span>
                <span className="text-gray-900 dark:text-white">{cart.length}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500 tracking-widest">
                <span>Envío Asegurado</span>
                <span className="text-green-500 italic font-black">Cortesía Arena</span>
              </div>
              <div className="pt-4 flex justify-between items-end">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Inversión Final</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  <span className="text-sm mr-1 text-[#d4af35]">$</span>
                  {(totalPrice / 100).toLocaleString('es-MX')}
                </p>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
