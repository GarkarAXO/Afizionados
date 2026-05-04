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

  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    holder: ''
  });

  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'amex' | 'unknown'>('unknown');

  const detectCardType = (number: string) => {
    const clean = number.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'mastercard';
    if (/^3[47]/.test(clean)) return 'amex';
    return 'unknown';
  };

  const [colonias, setColonias] = useState<string[]>([]);
  const [isSearchingCP, setIsSearchingCP] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

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
    
    const initializeCheckout = async () => {
      const address = await fetchSavedAddress();
      if (address) {
        // Si el usuario tiene una dirección guardada, la aplicamos por defecto
        handleToggleSavedAddress(true, address);
      }
    };
    
    initializeCheckout();
  }, [cart, isSuccess, router]);

  const fetchSavedAddress = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

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
        return data.data;
      }
    } catch (err) {
      console.error('Error fetching saved address');
    }
    return null;
  };

  const handleToggleSavedAddress = async (checked: boolean, addressToUse?: any) => {
    setUseSavedAddress(checked);
    const targetAddress = addressToUse || savedAddress;
    
    if (checked && targetAddress) {
      const d = targetAddress;
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
        fetchColonias(addr.zipCode, addr.colonia);
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
      setError('Por favor, completa todos los campos de envío.');
      return;
    }

    const { number, expiry, cvv, holder } = cardData;
    if (!number || !expiry || !cvv || !holder) {
      setError('Por favor, ingresa los datos de pago.');
      return;
    }

    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.length < 16) {
      setError('El número de tarjeta debe tener 16 dígitos.');
      return;
    }

    if (!expiry.includes('/') || expiry.length < 5) {
      setError('Formato de vencimiento inválido (MM/YY).');
      return;
    }

    const [m, y] = expiry.split('/');
    const expMonth = parseInt(m, 10);
    const expYear = parseInt(y, 10) + 2000;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (expMonth < 1 || expMonth > 12) {
      setError('El mes de vencimiento debe estar entre 01 y 12.');
      return;
    }

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      setError('La tarjeta ingresada ya ha caducado.');
      return;
    }

    if (cvv.length < 3) {
      setError('El CVV debe tener al menos 3 dígitos.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login?redirect=/arena/checkout');
        return;
      }

      // Simulamos un pequeño delay de procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingDetails: formData,
          paymentDetails: { last4: cleanNumber.slice(-4), holder }, // Datos simulados para el servidor
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
              <div><label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Municipio</label><input type="text" value={formData.municipio || ''} onChange={(e) => setFormData({...formData, municipio: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold" /></div>
              <div><label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Estado</label><input type="text" value={formData.state || ''} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold" /></div>
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-gray-100 dark:border-white/5">
            <h3 className="text-base sm:text-lg font-black uppercase tracking-widest text-[#d4af35] flex items-center gap-3"><span className="material-symbols-outlined">payments</span> 2. Protocolo de Pago</h3>
            
            <div className="bg-gray-50 dark:bg-[#1a170e] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 space-y-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Tarjeta de Crédito / Débito</span>
                <div className="flex gap-2">
                  <div className={`px-2 py-1 rounded text-[8px] font-bold transition-all ${cardType === 'visa' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-200 dark:bg-white/5 text-gray-400 opacity-30'}`}>VISA</div>
                  <div className={`px-2 py-1 rounded text-[8px] font-bold transition-all ${cardType === 'mastercard' ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-200 dark:bg-white/5 text-gray-400 opacity-30'}`}>MASTERCARD</div>
                  <div className={`px-2 py-1 rounded text-[8px] font-bold transition-all ${cardType === 'amex' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-200 dark:bg-white/5 text-gray-400 opacity-30'}`}>AMEX</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Titular de la Tarjeta</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="NOMBRE COMO APARECE EN LA TARJETA"
                    value={cardData.holder}
                    onChange={(e) => setCardData({...cardData, holder: e.target.value.toUpperCase()})}
                    className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold placeholder:text-gray-300 dark:placeholder:text-white/10" 
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Número de Tarjeta</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required 
                      maxLength={19}
                      placeholder="0000 0000 0000 0000"
                      value={cardData.number}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        setCardData({...cardData, number: formatted});
                        setCardType(detectCardType(formatted));
                      }}
                      className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold tracking-widest placeholder:text-gray-300 dark:placeholder:text-white/10" 
                    />
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl transition-colors ${cardType !== 'unknown' ? 'text-[#d4af35]' : 'text-gray-300 dark:text-white/10'}`}>
                      {cardType === 'amex' ? 'contactless' : 'credit_card'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Vencimiento</label>
                    <input 
                      type="text" 
                      required 
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                      className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold text-center placeholder:text-gray-300 dark:placeholder:text-white/10" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-2">CVV</label>
                    <input 
                      type="password" 
                      required 
                      maxLength={4}
                      placeholder="•••"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/[^0-9]/g, '')})}
                      className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold text-center placeholder:text-gray-300 dark:placeholder:text-white/10" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 text-[8px] font-black uppercase text-gray-400">
                <span className="material-symbols-outlined text-xs text-green-500">lock</span>
                Transacción Encriptada mediante Protocolo SSL
              </div>
            </div>
          </div>

          {error && (<div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-2 flex items-center gap-3"><span className="material-symbols-outlined text-sm">warning</span>{error}</div>)}

          <button type="submit" disabled={loading} className="w-full py-6 bg-[#d4af35] text-[#201d13] font-black rounded-[2rem] uppercase text-xs sm:text-sm tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all shadow-2xl shadow-[#d4af35]/20 disabled:opacity-50">{loading ? 'Sincronizando...' : 'Confirmar Adquisición'}</button>
        </form>
      </div>
    </div>
  );
}
