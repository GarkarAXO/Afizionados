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
    <div className="bg-[#f8f7f6] dark:bg-[#121212] min-h-screen flex items-center justify-center p-2 sm:p-4 text-gray-900 dark:text-white transition-colors duration-300">
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
        <div className="w-full max-w-[1100px] flex flex-col md:flex-row bg-white dark:bg-[#1a170e] rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#433d28]">
          
          <div 
            className="hidden md:flex md:w-1/2 relative bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"></div>
            <div className="relative z-10 flex flex-col justify-between p-12 h-full text-white">
              <img src="/img/afizionadosB.png" alt="Afizionados Logo" className="h-24 w-auto object-contain" />
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-black leading-tight">Únete a la <br/><span className="text-[#d4af35] underline decoration-[#d4af35]/30">Elite del Coleccionismo</span></h1>
                <p className="text-gray-300 text-lg max-w-sm">Crea tu cuenta hoy y comienza a pujar por las piezas más exclusivas del mundo deportivo.</p>
              </div>
              <div className="flex items-center gap-2 text-white/50 text-xs font-medium uppercase tracking-widest"><span>Seguridad Garantizada</span></div>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-white dark:bg-[#1a170e]">
            <div className="mb-6 sm:mb-8 text-center md:text-left">
              <div className="md:hidden flex justify-center mb-6">
                <img src="/img/afizionadosB.png" alt="Afizionados Logo" className="h-16 w-auto object-contain" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white uppercase tracking-tight">Crea tu Cuenta</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Forma parte de la comunidad de aficionados más grande.</p>
            </div>

            {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-bold uppercase">{error}</div>}

            <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nombre Completo</label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-3 bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-lg focus:ring-1 focus:ring-[#d4af35] outline-none text-sm text-gray-900 dark:text-white font-medium"
                  placeholder="Tu nombre" required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Correo Electrónico</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-lg focus:ring-1 focus:ring-[#d4af35] outline-none text-sm text-gray-900 dark:text-white font-medium"
                  placeholder="coleccionista@arena.com" required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Contraseña</label>
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

              <button 
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center py-4 bg-[#d4af35] text-[#201d13] font-black rounded-lg hover:brightness-110 active:scale-[0.99] transition-all tracking-widest uppercase text-xs disabled:opacity-50 shadow-lg shadow-[#d4af35]/20 mt-2"
              >
                {loading ? 'Creando cuenta...' : 'Unirse a la Arena'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">¿Ya tienes una cuenta? <Link href="/auth/login" className="font-black text-[#d4af35] hover:underline underline-offset-4 ml-2">Inicia Sesión</Link></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
