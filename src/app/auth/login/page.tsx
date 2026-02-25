'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();

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
        
        setTimeout(() => {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          window.location.href = '/dashboard';
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
    <div className="bg-[#f8f7f6] dark:bg-[#121212] min-h-screen flex items-center justify-center p-2 sm:p-4 text-white">
      {isSuccess ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8f7f6] dark:bg-[#121212] animate-fade-in-up">
          <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 w-full max-w-sm">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#d4af35]/10 rounded-full flex items-center justify-center text-[#d4af35] mb-6 sm:mb-8 ring-8 ring-[#d4af35]/5 animate-bounce">
              <span className="material-symbols-outlined text-5xl sm:text-6xl">verified_user</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black dark:text-white uppercase tracking-tight mb-4">¡Bienvenido, {userName}!</h2>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] sm:text-sm tracking-[0.2em] sm:tracking-[0.4em] mb-8 sm:mb-12">
              Sincronizando con la Bóveda Maestra de Afizionados...
            </p>
            <div className="w-48 sm:w-64 h-2 bg-gray-100 dark:bg-[#302c1c] rounded-full overflow-hidden shadow-inner p-0.5">
              <div className="h-full bg-[#d4af35] animate-loading shadow-[0_0_20px_rgba(212,175,53,0.6)] rounded-full"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-[1100px] flex flex-col md:flex-row bg-white dark:bg-[#1a170e] rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#433d28]">
          <div 
            className="hidden md:flex md:w-1/2 relative bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"></div>
            <div className="relative z-10 flex flex-col justify-between p-12 h-full text-white">
              <img src="/img/afizionadosB.png" alt="Afizionados Logo" className="h-24 w-auto object-contain" />
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-black leading-tight">La Arena de los <br/><span className="text-[#d4af35] underline decoration-[#d4af35]/30">Coleccionistas Reales</span></h1>
                <p className="text-gray-300 text-lg max-w-sm">Asegura tu lugar en la historia. Accede a memorabilia autenticada y coleccionables deportivos exclusivos.</p>
              </div>
              <div className="flex items-center gap-2 text-white/50 text-xs font-medium uppercase tracking-widest"><span>Conexión Segura y Encriptada</span></div>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center relative bg-white dark:bg-[#1a170e]">
            <div className="mb-6 sm:mb-8 text-center md:text-left">
              <div className="md:hidden flex justify-center mb-6">
                <img src="/img/afizionadosB.png" alt="Afizionados Logo" className="h-16 w-auto object-contain" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white uppercase tracking-tight">Bienvenido de nuevo</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Ingresa tus datos para acceder a tu bóveda.</p>
            </div>

            {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-bold uppercase">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Correo Electrónico</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-lg focus:ring-1 focus:ring-[#d4af35] outline-none text-sm text-gray-900 dark:text-white font-medium"
                  placeholder="coleccionista@arena.com" required
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Contraseña</label>
                  <Link href="/auth/forgot-password" title="Recuperar contraseña" className="text-[10px] font-black text-[#d4af35] hover:underline uppercase">¿Olvidaste tu contraseña?</Link>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-lg focus:ring-1 focus:ring-[#d4af35] outline-none text-sm text-gray-900 dark:text-white font-medium"
                    placeholder="••••••••" required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#d4af35] transition-colors">
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input 
                  type="checkbox" id="remember-me" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#d4af35] focus:ring-[#d4af35] border-gray-300 dark:border-[#605739] rounded bg-white dark:bg-[#302c1c] cursor-pointer" 
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-gray-500 dark:text-gray-400 cursor-pointer select-none uppercase tracking-tighter">Recordarme por 30 días</label>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center py-4 bg-[#d4af35] text-[#201d13] font-black rounded-lg hover:brightness-110 active:scale-[0.99] transition-all tracking-widest uppercase text-xs disabled:opacity-50 shadow-lg shadow-[#d4af35]/20"
              >
                {loading ? 'Entrando...' : 'Entrar a la Arena'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">¿Nuevo en la colección? <Link href="/auth/register" className="font-black text-[#d4af35] hover:underline underline-offset-4 ml-2">Crear una Cuenta</Link></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
