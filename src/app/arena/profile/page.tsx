'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  totalCents: number;
  status: string;
  createdAt: string;
  items: {
    product: { title: string };
  }[];
}

interface User {
  name: string;
  email: string;
  role: string;
}

interface AddressData {
  street: string;
  numInterior: string;
  numExterior: string;
  colonia: string;
  municipio: string;
  state: string;
  zipCode: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<AddressData>({
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
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressMessage, setAddressMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  const router = useRouter();

  // Función para buscar colonias
  const fetchColonias = useCallback(async (cp: string, currentColonia?: string) => {
    if (cp.length !== 5) return;
    setIsSearchingCP(true);
    console.log(`[Profile] Iniciando búsqueda para CP: ${cp}`);
    
    try {
      const response = await fetch(`/api/utils/dipomex?cp=${cp}`);
      const data = await response.json();
      
      console.log('[Profile] Respuesta recibida del Proxy:', data);
      
      if (!data.error && data.codigo_postal) {
        const cpInfo = data.codigo_postal;
        console.log('[Profile] Info de CP encontrada:', cpInfo);
        
        if (cpInfo.colonias && Array.isArray(cpInfo.colonias)) {
          // Soporte híbrido: si es string lo usa directo, si es objeto busca la propiedad
          const list = cpInfo.colonias.map((c: any) => 
            typeof c === 'string' ? c : (c.colonia || c.COLONIA || c.nombre || '')
          );
          console.log('[Profile] Lista de colonias procesada:', list);
          setColonias(list);
          
          setAddress(prev => ({
            ...prev,
            state: cpInfo.estado || cpInfo.ESTADO || '',
            municipio: cpInfo.municipio || cpInfo.MUNICIPIO || '',
            colonia: currentColonia && list.includes(currentColonia) ? currentColonia : (list[0] || '')
          }));
        } else {
          console.warn('[Profile] El objeto codigo_postal no contiene el array de colonias esperado');
        }
      } else {
        console.error('[Profile] Error en la respuesta de Dipomex:', data.message);
      }
    } catch (err) {
      console.error('[Profile] Error en la petición fetchColonias:', err);
    } finally {
      setIsSearchingCP(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/auth/login?redirect=/arena/profile');
      return;
    }

    setUser(JSON.parse(userStr));
    fetchData(token);
  }, []);

  const fetchData = async (token: string) => {
    try {
      const [ordersRes, addressRes] = await Promise.all([
        fetch('/api/user/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/user/address', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const ordersData = await ordersRes.json();
      const addressData = await addressRes.json();

      if (ordersData.success) setOrders(ordersData.data);
      if (addressData.success && addressData.data) {
        const d = addressData.data;
        const savedAddr = {
          street: d.street || '',
          numInterior: d.numInterior || '',
          numExterior: d.numExterior || '',
          colonia: d.colonia || '',
          municipio: d.municipio || '',
          state: d.state || '',
          zipCode: d.zipCode || ''
        };
        setAddress(savedAddr);
        
        // Solo cargamos la lista de colonias para el selector, pero no sobreescribimos la colonia guardada
        if (savedAddr.zipCode.length === 5) {
          // Llamada silenciosa solo para tener la lista de colonias en el select
          const response = await fetch(`/api/utils/dipomex?cp=${savedAddr.zipCode}`);
          const data = await response.json();
          if (!data.error && data.codigo_postal) {
            const list = data.codigo_postal.colonias.map((c: any) => 
              typeof c === 'string' ? c : (c.colonia || c.COLONIA || c.nombre || '')
            );
            setColonias(list);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleCPChange = (cp: string) => {
    // Si el CP es el mismo que el guardado, no hacemos nada
    if (cp === address.zipCode) return;
    
    setAddress(prev => ({ ...prev, zipCode: cp }));
    if (cp.length === 5) {
      fetchColonias(cp);
    } else {
      setColonias([]);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    setAddressMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(address)
      });

      const data = await response.json();
      if (data.success) {
        setAddressMessage({ type: 'success', text: 'Información de envío actualizada' });
      } else {
        setAddressMessage({ type: 'error', text: data.message || 'Error al guardar' });
      }
    } catch (error) {
      setAddressMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/arena';
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="animate-pulse text-[#d4af35] font-black uppercase tracking-[0.2em] sm:tracking-[0.5em] text-center text-[10px] sm:text-base">
        Abriendo Bóveda Privada...
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16 pb-32 md:pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-50 dark:bg-[#1a170e] p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] border border-gray-200 dark:border-white/5 shadow-2xl transition-colors">
        <div className="flex items-center gap-4 sm:gap-10 w-full min-w-0">
          <div className="w-16 h-16 sm:w-28 sm:h-28 bg-gradient-to-tr from-[#d4af35] to-[#f8f7f6] rounded-full flex items-center justify-center text-[#201d13] text-2xl sm:text-5xl font-black border-2 sm:border-4 border-white dark:border-[#0a0a0a] shadow-2xl flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
            <h1 className="text-xl sm:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-tight break-words">{user?.name}</h1>
            <p className="text-[#d4af35] font-black uppercase text-[8px] sm:text-xs tracking-[0.2em] truncate">{user?.email}</p>
            <div className="pt-1 sm:pt-2">
              <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-[#d4af35]/10 text-[#d4af35] border border-[#d4af35]/20 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-widest">Élite</span>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full md:w-auto px-6 py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-500 font-black rounded-xl uppercase text-[9px] tracking-widest transition-all">Cerrar Bóveda</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-left">
        <div className="lg:col-span-1 space-y-8">
          <div className="flex items-center gap-3 border-b border-gray-200 dark:border-white/5 pb-4">
            <span className="material-symbols-outlined text-[#d4af35]">local_shipping</span>
            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Dirección de Envío</h2>
          </div>

          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Calle / Dirección</label>
                <input 
                  type="text" value={address.street || ''}
                  onChange={(e) => setAddress({...address, street: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold"
                  placeholder="Calle y número"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Nº Interior</label>
                  <input 
                    type="text" value={address.numInterior || ''}
                    onChange={(e) => setAddress({...address, numInterior: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold"
                    placeholder="Ej. 2B"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Nº Exterior</label>
                  <input 
                    type="text" value={address.numExterior || ''}
                    onChange={(e) => setAddress({...address, numExterior: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold"
                    placeholder="O manzana"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex justify-between">
                  <span>Código Postal (CP)</span>
                  {isSearchingCP && <span className="text-[#d4af35] animate-pulse">Buscando...</span>}
                </label>
                <input 
                  type="text" value={address.zipCode || ''}
                  onChange={(e) => handleCPChange(e.target.value)}
                  maxLength={5}
                  className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold"
                  placeholder="00000"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Colonia</label>
                {colonias.length > 0 ? (
                  <select 
                    value={address.colonia || ''}
                    onChange={(e) => setAddress({...address, colonia: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold"
                  >
                    <option value="">Selecciona una colonia...</option>
                    {colonias.map((c, idx) => <option key={`${c}-${idx}`} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input 
                    type="text" value={address.colonia || ''}
                    onChange={(e) => setAddress({...address, colonia: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-[#1a170e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[#d4af35] font-bold"
                    placeholder="Colonia"
                  />
                )}
              </div>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Municipio / Alcaldía</label>
                <input 
                  type="text" value={address.municipio || ''}
                  readOnly
                  className="w-full bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-500 dark:text-gray-400 outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Estado</label>
                <input 
                  type="text" value={address.state || ''}
                  readOnly
                  className="w-full bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-500 dark:text-gray-400 outline-none font-bold"
                />
              </div>
            </div>

            {addressMessage && (
              <div className={`p-3 rounded-lg text-center text-[9px] font-black uppercase tracking-widest ${addressMessage.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {addressMessage.text}
              </div>
            )}

            <button type="submit" disabled={savingAddress} className="w-full py-4 bg-[#d4af35] text-[#201d13] font-black rounded-xl uppercase text-[10px] tracking-widest hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-[#d4af35]/20">
              {savingAddress ? 'Guardando...' : 'Actualizar Dirección'}
            </button>
          </form>
        </div>

        {/* HISTORIAL */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-3 border-b border-gray-200 dark:border-white/5 pb-4">
            <span className="material-symbols-outlined text-[#d4af35]">history_edu</span>
            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Manifiesto de Adquisiciones</h2>
          </div>

          {orders.length === 0 ? (
            <div className="py-20 text-center bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10">
              <p className="text-gray-500 font-black uppercase text-[10px] tracking-[0.3em]">Aún no has adquirido piezas en la Arena</p>
              <Link href="/arena/all" className="mt-6 inline-block text-[#d4af35] font-black uppercase text-[10px] tracking-widest hover:underline">Explorar Bóveda →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map((order) => (
                <div key={order.id} className="p-6 bg-white dark:bg-[#1a170e] rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Referencia</p>
                      <p className="text-xs font-black text-gray-900 dark:text-white uppercase">#ORD-{order.id.slice(-6).toUpperCase()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${order.status === 'PAID' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-3"><p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Piezas</p><div className="space-y-1">{order.items.map((item, i) => (<p key={i} className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase truncate">• {item.product.title}</p>))}</div></div>
                  <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-end"><div><p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Inversión</p><p className="text-xl font-black text-[#d4af35]">${(order.totalCents / 100).toLocaleString('es-MX')}</p></div><p className="text-[9px] text-gray-400 font-bold">{new Date(order.createdAt).toLocaleDateString()}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
