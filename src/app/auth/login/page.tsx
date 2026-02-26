'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (data.success) {
        setUserName(data.data.user.name || 'Coleccionista');
        setIsSuccess(true);
        
        // Guardamos los datos
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Determinamos a dónde enviar al usuario
        const redirectTo = searchParams.get('redirect');
        const finalPath = redirectTo || (data.data.user.role === 'ADMIN' ? '/dashboard' : '/arena');
        
        setTimeout(() => {
          window.location.href = finalPath;
        }, 3000);
      } else {
        setError(data.message || 'Error al iniciar sesión');
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
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>
      </div>

      {/* Fondo degradado para el body general */}
      <div className="absolute inset-0 z-[-1] bg-[#f8f7f6] dark:bg-[#0a0a0a]"></div>

      {isSuccess ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f8f7f6] dark:bg-[#121212] animate-fade-in-up">
          <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 w-full max-w-lg">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#d4af35]/10 rounded-full flex items-center justify-center text-[#d4af35] mb-6 sm:mb-8 ring-8 ring-[#d4af35]/5 animate-bounce">
              <span className="material-symbols-outlined text-5xl sm:text-6xl">verified_user</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4 text-gray-900 dark:text-white leading-tight">
              ¡Bienvenido, <br className="sm:hidden"/>{userName}!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] sm:text-sm tracking-[0.2em] sm:tracking-[0.4em] mb-8 sm:mb-12 max-w-xs sm:max-w-md mx-auto">
              Sincronizando con la Bóveda Maestra de Afizionados...
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
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"></div>
            <div className="relative z-10 flex flex-col justify-between p-12 h-full text-white">
              <img src="/img/afizionadosB.png" alt="Afizionados Logo" className="h-24 w-auto object-contain" />
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-black leading-tight">La Arena de los <br/><span className="text-[#d4af35] underline decoration-[#d4af35]/30">Coleccionistas Reales</span></h1>
                <p className="text-gray-300 text-lg max-w-sm font-medium">Asegura tu lugar en la historia. Accede a memorabilia autenticada y coleccionables deportivos exclusivos.</p>
              </div>
              <div className="flex items-center gap-2 text-white/50 text-xs font-black uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Conexión Segura y Encriptada</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative">
            <div className="mb-10 text-center md:text-left">
              <div className="md:hidden flex justify-center mb-8">
                <img src="/img/afizionadosB.png" alt="Afizionados Logo" className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,53,0.2)] dark:hidden" />
                <img src="/img/afizionadosW.png" alt="Afizionados Logo" className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,53,0.2)] hidden dark:block" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-3 text-gray-900 dark:text-white uppercase tracking-tight leading-none">Bienvenido</h2>
              <p className="text-[#d4af35] text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">Ingresa a tu Bóveda Privada</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Credencial de Acceso</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-5 py-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-2xl focus:border-[#d4af35] outline-none text-xs text-gray-900 dark:text-white font-bold tracking-widest transition-all"
                  placeholder="CORREO@ELECTRÓNICO.COM" required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Código de Seguridad</label>
                  <Link href="/auth/forgot-password" title="Recuperar contraseña" className="text-[9px] font-black text-[#d4af35] hover:underline uppercase tracking-widest">¿Olvidaste tu contraseña?</Link>
                </div>
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

              <div className="flex items-center gap-3 ml-1">
                <input 
                  type="checkbox" id="remember-me" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 border-gray-300 dark:border-white/10 rounded-md bg-white dark:bg-[#0a0a0a] text-[#d4af35] focus:ring-[#d4af35] cursor-pointer" 
                />
                <label htmlFor="remember-me" className="text-[9px] font-black text-gray-500 dark:text-gray-400 cursor-pointer select-none uppercase tracking-widest">Mantener sesión activa</label>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full py-5 bg-[#d4af35] text-[#201d13] font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all tracking-[0.2em] uppercase text-xs disabled:opacity-50 shadow-xl shadow-[#d4af35]/10 mt-4"
              >
                {loading ? 'Validando...' : 'Entrar a la Arena'}
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                ¿Aún no eres Guardián? 
                <Link href="/auth/register" className="text-[#d4af35] hover:underline underline-offset-4 ml-2">Crear una Cuenta</Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#f8f7f6] dark:bg-[#121212] min-h-screen flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-[1100px] h-[600px] bg-white dark:bg-[#1a170e] rounded-xl animate-pulse shadow-2xl border border-gray-200 dark:border-[#433d28]"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
