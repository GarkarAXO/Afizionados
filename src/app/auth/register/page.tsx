'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/auth/login?registered=true');
        }, 3000);
      } else {
        setError(data.message || 'Error al crear la cuenta');
        setLoading(false);
      }
    } catch (err) {
      setError('Algo salió mal. Por favor, inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 text-gray-900 dark:text-white transition-colors duration-300 overflow-hidden">
      {/* Fondo para móvil (mismo que el de la sección izquierda en desktop) */}
      <div 
        className="absolute inset-0 md:hidden bg-cover bg-center transition-all duration-500"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>
      </div>

      {/* Fondo degradado para el body general */}
      <div className="absolute inset-0 z-[-1] bg-[#f8f7f6] dark:bg-[#0a0a0a]"></div>

      {isSuccess ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f8f7f6] dark:bg-[#121212] animate-fade-in-up">
          <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 w-full max-w-lg">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#d4af35]/10 rounded-full flex items-center justify-center text-[#d4af35] mb-6 sm:mb-8 ring-8 ring-[#d4af35]/5 animate-bounce">
              <span className="material-symbols-outlined text-5xl sm:text-6xl">person_add</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4 text-gray-900 dark:text-white leading-tight">
              ¡Bienvenido a la Élite!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] sm:text-sm tracking-[0.2em] sm:tracking-[0.4em] mb-8 sm:mb-12 max-w-xs sm:max-w-md mx-auto">
              Tu cuenta ha sido creada con éxito. Redirigiendo a la entrada de la Arena...
            </p>
            <div className="w-48 sm:w-64 h-2 bg-gray-200 dark:bg-[#302c1c] rounded-full overflow-hidden shadow-inner p-0.5 border border-gray-100 dark:border-white/5">
              <div className="h-full bg-[#d4af35] animate-loading shadow-[0_0_20px_rgba(212,175,53,0.6)] rounded-full"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-[1100px] flex flex-col md:flex-row bg-white/95 dark:bg-[#1a170e]/95 md:bg-white md:dark:bg-[#1a170e] backdrop-blur-md md:backdrop-blur-none rounded-[2rem] overflow-hidden shadow-2xl border border-gray-200 dark:border-[#433d28] relative z-10">
          
          <div 
            className="hidden md:flex md:w-1/2 relative bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"></div>
            <div className="relative z-10 flex flex-col justify-between p-12 h-full text-white">
              <img src="/img/afizionadosB.png" alt="Afizionados Logo" className="h-24 w-auto object-contain" />
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-black leading-tight">Únete a la <br/><span className="text-[#d4af35] underline decoration-[#d4af35]/30">Elite del Coleccionismo</span></h1>
                <p className="text-gray-300 text-lg max-w-sm font-medium">Crea tu cuenta hoy y comienza a pujar por las piezas más exclusivas del mundo deportivo.</p>
              </div>
              <div className="flex items-center gap-2 text-white/50 text-xs font-black uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span>Seguridad Garantizada</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative">
            <div className="mb-10 text-center md:text-left">
              <div className="md:hidden flex justify-center mb-8">
                <img src="/img/afizionadosW.png" alt="Afizionados Logo" className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,53,0.2)] dark:hidden" />
                <img src="/img/afizionadosB.png" alt="Afizionados Logo" className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,53,0.2)] hidden dark:block" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-3 text-gray-900 dark:text-white uppercase tracking-tight leading-none">Crea tu Cuenta</h2>
              <p className="text-[#d4af35] text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">Forma parte de la comunidad de élite</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nombre Completo</label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="block w-full px-5 py-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-2xl focus:border-[#d4af35] outline-none text-xs text-gray-900 dark:text-white font-bold tracking-widest transition-all"
                  placeholder="TU NOMBRE COMPLETO" required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Correo Electrónico</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-5 py-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-2xl focus:border-[#d4af35] outline-none text-xs text-gray-900 dark:text-white font-bold tracking-widest transition-all"
                  placeholder="COLECCIONISTA@ARENA.COM" required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Código de Acceso</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-5 pr-14 py-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-2xl focus:border-[#d4af35] outline-none text-xs text-gray-900 dark:text-white font-bold tracking-widest transition-all"
                    placeholder="••••••••" required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#d4af35] transition-colors">
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full py-5 bg-[#d4af35] text-[#201d13] font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all tracking-[0.2em] uppercase text-xs disabled:opacity-50 shadow-xl shadow-[#d4af35]/10 mt-4"
              >
                {loading ? 'Procesando...' : 'Unirse a la Arena'}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                ¿Ya eres miembro? 
                <Link href="/auth/login" className="text-[#d4af35] hover:underline underline-offset-4 ml-2">Inicia Sesión</Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
