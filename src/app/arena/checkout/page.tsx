'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [savedAddress, setSavedAddress] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    numInterior: '',
    numExterior: '',
    colonia: '',
    municipio: '',
    state: '',
    zipCode: ''
  });

  const [colonias, setColonias] = useState<string[]>([]);
  const [isSearchingCP, setIsSearchingCP] = useState(false);

  const fetchColonias = useCallback(async (cp: string, currentColonia?: string) => {
    if (cp.length !== 5) return;
    setIsSearchingCP(true);
    try {
      const response = await fetch(`/api/utils/dipomex?cp=${cp}`);
      const data = await response.json();
      
      if (!data.error && data.codigo_postal) {
        const cpInfo = data.codigo_postal;
        // Soporte híbrido para strings u objetos
        const list = cpInfo.colonias.map((c: any) => 
          typeof c === 'string' ? c : (c.colonia || c.COLONIA || c.nombre || '')
        );
        setColonias(list);
        
        setFormData(prev => ({
          ...prev,
          state: cpInfo.estado || cpInfo.ESTADO || '',
          municipio: cpInfo.municipio || cpInfo.MUNICIPIO || '',
          colonia: currentColonia && list.includes(currentColonia) ? currentColonia : (list[0] || '')
        }));
      }
    } catch (err) {
      console.error('Error Dipomex:', err);
    } finally {
      setIsSearchingCP(false);
    }
  }, []);

  useEffect(() => {
    if (cart.length === 0 && !isSuccess) {
      router.push('/arena');
    }
    fetchSavedAddress();
  }, [cart, isSuccess, router]);

  const fetchSavedAddress = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/user/address', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setSavedAddress(data.data);
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setFormData(prev => ({ ...prev, name: user.name || '' }));
        }
      }
    } catch (err) {
      console.error('Error fetching saved address');
    }
  };

  const handleToggleSavedAddress = async (checked: boolean) => {
    setUseSavedAddress(checked);
    if (checked && savedAddress) {
      const d = savedAddress;
      const addr = {
        street: d.street || '',
        numInterior: d.numInterior || '',
        numExterior: d.numExterior || '',
        colonia: d.colonia || '',
        municipio: d.municipio || '',
        state: d.state || '',
        zipCode: d.zipCode || ''
      };
      setFormData(prev => ({ ...prev, ...addr }));
      
      // Cargamos la lista de colonias silenciosamente para el selector
      if (addr.zipCode.length === 5) {
        try {
          const response = await fetch(`/api/utils/dipomex?cp=${addr.zipCode}`);
          const data = await response.json();
          if (!data.error && data.codigo_postal) {
            const list = data.codigo_postal.colonias.map((c: any) => 
              typeof c === 'string' ? c : (c.colonia || c.COLONIA || c.nombre || '')
            );
            setColonias(list);
          }
        } catch (e) { console.error(e); }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        street: '', numInterior: '', numExterior: '', colonia: '', municipio: '', state: '', zipCode: ''
      }));
      setColonias([]);
    }
  };

  const handleCPChange = (cp: string) => {
    setFormData(prev => ({ ...prev, zipCode: cp }));
    if (cp.length === 5) {
      fetchColonias(cp);
    } else {
      setColonias([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { name, street, colonia, municipio, state, zipCode } = formData;
    if (!name || !street || !colonia || !municipio || !state || !zipCode) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login?redirect=/arena/checkout');
        return;
      }

      const response = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingDetails: formData,
          items: cart.map(item => ({ productId: item.id, quantity: 1 }))
        })
      });

      const data = await response.json();
      if (data.success) {
        setIsSuccess(true);
        clearCart();
        setTimeout(() => router.push('/arena'), 5000);
      } else {
        setError(data.message || 'Error al procesar');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 text-center">
        <div className="space-y-8 animate-fade-in-up">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto ring-8 ring-green-500/5">
            <span className="material-symbols-outlined text-5xl">verified</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Adquisición Confirmada</h2>
          <Link href="/arena" className="px-10 py-4 bg-[#d4af35] text-[#201d13] font-black rounded-xl uppercase text-xs tracking-widest hover:brightness-110 shadow-xl inline-block">Volver a la Bóveda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 transition-colors duration-300">
      <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
        <Link href="/arena" className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 text-gray-400 hover:text-[#d4af35] transition-colors">
          <span className="material-symbols-outlined text-lg sm:text-2xl">arrow_back</span>
        </Link>
        <h1 className="text-2xl sm:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none text-left">Checkout</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-20 items-start">
        <aside className="w-full lg:w-[400px] lg:sticky lg:top-32 order-1 lg:order-2">
          <div className="bg-gray-50 dark:bg-[#1a170e] rounded-[2rem] p-6 sm:p-8 border border-gray-200 dark:border-white/5 shadow-2xl space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 border-b border-gray-200 dark:border-white/5 pb-4 text-left">Tu Selección</h3>
            <div className="space-y-4 max-h-[30vh] lg:max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 flex-shrink-0"><img src={item.image} className="w-full h-full object-cover" /></div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[9px] sm:text-[10px] font-black text-gray-900 dark:text-white uppercase truncate">{item.title}</p>
                    <p className="text-[10px] font-bold text-[#d4af35] mt-1">${(item.priceCents / 100).toLocaleString('es-MX')}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-white/5">
              <div className="flex justify-between items-center text-[9px] font-black uppercase text-gray-500"><span>Piezas</span><span className="text-gray-900 dark:text-white">{cart.length}</span></div>
              <div className="flex justify-between items-center text-[9px] font-black uppercase text-gray-500"><span>Envío</span><span className="text-green-500 italic font-black">Cortesía Arena</span></div>
              <div className="pt-4 flex justify-between items-end">
                <p className="text-[9px] font-black uppercase text-gray-400">Inversión Final</p>
                <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-none"><span className="text-sm mr-1 text-[#d4af35]">$</span>{(totalPrice / 100).toLocaleString('es-MX')}</p>
              </div>
            </div>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="flex-1 w-full space-y-8 order-2 lg:order-1 text-left">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-base sm:text-lg font-black uppercase tracking-widest text-[#d4af35] flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">local_shipping</span> 1. Detalles de Entrega
              </h3>
              {savedAddress && (
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={useSavedAddress} onChange={(e) => handleToggleSavedAddress(e.target.checked)} className="w-4 h-4 rounded border-gray-300 dark:border-white/10 text-[#d4af35] focus:ring-[#d4af35] bg-transparent" />
                  <span className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400 group-hover:text-[#d4af35]">Usar dirección guardada</span>
                </label>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="md:col-span-2"><label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Nombre Completo</label><input type="text" required value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold" /></div>
              <div className="md:col-span-2"><label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Calle y Dirección</label><input type="text" required value={formData.street || ''} onChange={(e) => setFormData({...formData, street: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Nº Interior</label><input type="text" value={formData.numInterior || ''} onChange={(e) => setFormData({...formData, numInterior: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold" /></div>
                <div><label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Nº Exterior</label><input type="text" value={formData.numExterior || ''} onChange={(e) => setFormData({...formData, numExterior: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold" /></div>
              </div>
              <div><label className="block text-[9px] font-black text-gray-400 uppercase mb-2 flex justify-between"><span>Código Postal (CP)</span>{isSearchingCP && <span className="text-[#d4af35] animate-pulse">...</span>}</label><input type="text" required value={formData.zipCode || ''} onChange={(e) => handleCPChange(e.target.value)} maxLength={5} className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold" /></div>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Colonia</label>
                {colonias.length > 0 ? (
                  <select value={formData.colonia || ''} onChange={(e) => setFormData({...formData, colonia: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold">
                    <option value="">Selecciona...</option>
                    {colonias.map((c, idx) => <option key={`${c}-${idx}`} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input type="text" required value={formData.colonia || ''} onChange={(e) => setFormData({...formData, colonia: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold" />
                )}
              </div>
              <div><label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Municipio</label><input type="text" value={formData.municipio || ''} readOnly className="w-full bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-500 outline-none font-bold" /></div>
              <div><label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Estado</label><input type="text" value={formData.state || ''} readOnly className="w-full bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-500 outline-none font-bold" /></div>
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-gray-100 dark:border-white/5">
            <h3 className="text-base sm:text-lg font-black uppercase tracking-widest text-[#d4af35] flex items-center gap-3"><span className="material-symbols-outlined">payments</span> 2. Protocolo de Pago</h3>
            <div className="p-6 bg-gray-50 dark:bg-[#1a170e] rounded-2xl border-2 border-dashed border-[#d4af35]/20 flex items-center gap-4"><span className="material-symbols-outlined text-3xl text-[#d4af35]">lock</span><span className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-400 tracking-widest leading-tight">Conexión Encriptada • Adquisición Protegida</span></div>
          </div>

          {error && (<div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-2 flex items-center gap-3"><span className="material-symbols-outlined text-sm">warning</span>{error}</div>)}

          <button type="submit" disabled={loading} className="w-full py-6 bg-[#d4af35] text-[#201d13] font-black rounded-[2rem] uppercase text-xs sm:text-sm tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all shadow-2xl shadow-[#d4af35]/20 disabled:opacity-50">{loading ? 'Sincronizando...' : 'Confirmar Adquisición'}</button>
        </form>
      </div>
    </div>
  );
}
