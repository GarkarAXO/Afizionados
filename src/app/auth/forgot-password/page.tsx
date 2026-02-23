'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulación: aquí llamaríamos a una API para enviar el correo
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-[#f8f7f6] dark:bg-[#121212] min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[1100px] flex flex-col md:flex-row bg-white dark:bg-[#1a170e] rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#433d28]">
        
        {/* Lado Izquierdo (Diseño Visual) */}
        <div 
          className="hidden md:flex md:w-1/2 relative bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"></div>
          <div className="relative z-10 flex flex-col justify-between p-12 h-full">
            <div>
              <span className="text-3xl font-black tracking-[0.2em] text-white/90" style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.8)', color: 'transparent' }}>
                AFIZIONADOS
              </span>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                Recupera tu <br/>
                <span className="text-[#d4af35] underline decoration-[#d4af35]/30">Llave a la Bóveda</span>
              </h1>
              <p className="text-gray-300 text-lg max-w-sm">
                No te preocupes, incluso los mejores coleccionistas necesitan ayuda a veces.
              </p>
            </div>
            <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Soporte Afizionados</div>
          </div>
        </div>

        {/* Lado Derecho (Formulario) */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          {!sent ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold mb-2 text-gray-900 dark:text-white">¿Olvidaste tu contraseña?</h2>
                <p className="text-gray-500 dark:text-gray-400">Ingresa tu correo y te enviaremos instrucciones para restaurar tu acceso.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-3 bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-lg focus:ring-1 focus:ring-[#d4af35] outline-none transition-all dark:text-white"
                    placeholder="tu@correo.com"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full flex items-center justify-center py-4 bg-[#d4af35] text-[#201d13] font-black rounded-lg hover:brightness-110 active:scale-[0.99] transition-all tracking-wide uppercase disabled:opacity-50 shadow-xl shadow-[#d4af35]/20"
                >
                  {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto">
                <span className="material-symbols-outlined text-4xl">mark_email_read</span>
              </div>
              <h2 className="text-2xl font-bold dark:text-white">¡Correo Enviado!</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                Revisa tu bandeja de entrada. Te hemos enviado un enlace para que vuelvas a la arena pronto.
              </p>
            </div>
          )}

          <div className="mt-8 text-center border-t border-gray-100 dark:border-[#433d28] pt-8">
            <Link href="/auth/login" className="text-sm font-bold text-[#d4af35] hover:underline uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Volver al Inicio de Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
