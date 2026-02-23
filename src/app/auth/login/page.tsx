'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
        // Si 'Recordarme' está marcado, podríamos usar cookies de larga duración en el futuro
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        router.push('/dashboard');
      } else {
        setError(data.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Algo salió mal. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f7f6] dark:bg-[#121212] min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[1100px] flex flex-col md:flex-row bg-white dark:bg-[#1a170e] rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#433d28]">
        
        {/* Lado Izquierdo (Diseño Visual) */}
        <div 
          className="hidden md:flex md:w-1/2 relative bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"></div>
          <div className="relative z-10 flex flex-col justify-between p-12 h-full">
            <div>
              <div className="flex items-baseline gap-4 mb-2">
                <img 
                  src="/img/afizionadosB.png" 
                  alt="Afizionados Logo" 
                  className="h-32 w-auto object-contain"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                La Arena de los <br/>
                <span className="text-[#d4af35] underline decoration-[#d4af35]/30">Coleccionistas Reales</span>
              </h1>
              <p className="text-gray-300 text-lg max-w-sm">
                Asegura tu lugar en la historia. Accede a memorabilia autenticada y coleccionables deportivos exclusivos.
              </p>
            </div>

            <div className="flex items-center gap-2 text-white/50 text-xs font-medium uppercase tracking-widest">
              <span>Conexión Segura y Encriptada</span>
            </div>
          </div>
        </div>

        {/* Lado Derecho (Formulario) */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-2 text-gray-900 dark:text-white">Bienvenido de nuevo</h2>
            <p className="text-gray-500 dark:text-gray-400">Ingresa tus datos para acceder a tu bóveda.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Correo Electrónico</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-lg focus:ring-1 focus:ring-[#d4af35] focus:border-[#d4af35] outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="coleccionista@arena.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
                <Link href="/auth/forgot-password" title="Recuperar contraseña" className="text-xs font-semibold text-[#d4af35] hover:underline">¿Olvidaste tu contraseña?</Link>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-lg focus:ring-1 focus:ring-[#d4af35] focus:border-[#d4af35] outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[#d4af35] focus:ring-[#d4af35] border-gray-300 dark:border-[#605739] rounded bg-white dark:bg-[#302c1c]" 
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">Recordarme por 30 días</label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center py-4 bg-[#d4af35] text-[#201d13] font-black rounded-lg hover:brightness-110 active:scale-[0.99] transition-all tracking-wide uppercase disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar a la Arena'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿Nuevo en la colección? 
              <Link href="/auth/register" className="font-bold text-[#d4af35] hover:underline underline-offset-4 ml-1">
                Crear una Cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
