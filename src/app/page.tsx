'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen flex flex-col relative overflow-x-hidden text-white antialiased">
      
      {/* Fondo con Textura y Profundidad */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,53,0.08),transparent_70%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 sm:opacity-20" style={{ backgroundImage: 'radial-gradient(#d4af35 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }}></div>
      </div>

      {/* Contenedor Centrado Flexible */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 pt-20 pb-12 w-full max-w-5xl mx-auto">
        
        {/* Logo - Adaptado a móvil */}
        <div className="mb-10 md:mb-16 animate-fade-in-up">
          <img 
            src="/img/afizionadosB.png" 
            alt="Afizionados Logo" 
            className="h-20 sm:h-28 md:h-36 w-auto object-contain drop-shadow-[0_0_30px_rgba(212,175,53,0.15)]"
          />
        </div>

        {/* Título Principal - Escalado para 360px */}
        <div className="space-y-6 md:space-y-8 text-center animate-fade-in-up px-2" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-8xl font-black text-white uppercase tracking-[0.05em] leading-[1.1] md:leading-[0.9]">
            La Arena <br/>
            <span className="text-[#d4af35] text-outline-gold italic">Esta Despertando</span>
          </h1>
          
          <div className="flex items-center justify-center gap-3 sm:gap-6 py-2 md:py-4">
            <div className="h-[1px] w-8 sm:w-24 bg-gradient-to-r from-transparent to-[#d4af35]/50"></div>
            <p className="text-[#d4af35] font-black uppercase text-[8px] sm:text-xs md:text-sm tracking-[0.3em] sm:tracking-[0.6em] whitespace-nowrap">Memorabilia Auténtica</p>
            <div className="h-[1px] w-8 sm:w-24 bg-gradient-to-l from-transparent to-[#d4af35]/50"></div>
          </div>

          <p className="text-gray-400 text-xs sm:text-base md:text-xl max-w-2xl mx-auto font-medium leading-relaxed px-2">
            Estamos preparando el acceso exclusivo a las piezas más icónicas del deporte mundial. 
            La historia está a punto de ser subastada.
          </p>
        </div>

        {/* Status de la Bóveda */}
        <div className="mt-12 md:mt-16 w-full max-w-[280px] sm:max-w-md md:max-w-xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex justify-between items-end mb-3">
            <div className="flex flex-col">
              <span className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5 text-left">Protocolo de Seguridad</span>
              <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest text-left">Sincronización</span>
            </div>
            <span className="text-sm sm:text-lg font-black text-[#d4af35] tabular-nums">85%</span>
          </div>
          <div className="h-1.5 sm:h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div className="h-full bg-gradient-to-r from-[#9a7b2c] via-[#d4af35] to-[#f1c40f] w-[85%] rounded-full shadow-[0_0_15px_rgba(212,175,53,0.3)]"></div>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-16 md:mt-24 flex flex-col md:flex-row items-center md:justify-center gap-6 md:gap-12 animate-fade-in-up w-full" style={{ animationDelay: '0.6s' }}>
          <Link 
            href="/auth/login" 
            className="w-full md:w-auto px-10 py-4 md:px-14 md:py-5 bg-[#d4af35] text-[#201d13] font-black rounded-xl uppercase text-[10px] sm:text-xs md:text-sm tracking-[0.2em] hover:scale-105 transition-all text-center shadow-lg shadow-[#d4af35]/10"
          >
            Entrada de Guardianes
          </Link>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-2 text-gray-500 font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] hover:text-[#d4af35] transition-all border-b border-transparent hover:border-[#d4af35]/30"
          >
            Recibir Invitación
          </button>
        </div>
      </div>

      {/* Footer Estético - Nunca se encimará */}
      <footer className="relative z-10 w-full text-center px-6 py-12 md:py-16 mt-auto border-t border-white/5 bg-[#0a0a0a]">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 opacity-30">
          <span className="text-[8px] sm:text-[10px] text-white font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]">Autenticidad Garantizada</span>
          <span className="hidden md:block w-1.5 h-1.5 bg-[#d4af35] rounded-full"></span>
          <span className="text-[8px] sm:text-[10px] text-white font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]">Global Shipping</span>
          <span className="hidden md:block w-1.5 h-1.5 bg-[#d4af35] rounded-full"></span>
          <span className="text-[8px] sm:text-[10px] text-white font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]">Arena VIP Access</span>
        </div>
      </footer>

      {/* MODAL DE INVITACIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1a170e] w-full max-w-sm rounded-3xl border border-[#d4af35]/30 p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-4">
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {isSubscribed ? (
              <div className="py-10 text-center animate-in zoom-in-95 duration-300">
                <span className="material-symbols-outlined text-5xl text-[#d4af35] mb-4">check_circle</span>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">¡Solicitud Enviada!</h3>
                <p className="text-gray-400 text-xs uppercase font-bold tracking-widest leading-relaxed">
                  Has sido añadido a la lista de espera de la élite. Pronto recibirás noticias.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Acceso Exclusivo</h3>
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em]">Únete a la lista de coleccionistas reales</p>
                </div>
                
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="TU CORREO ELECTRÓNICO"
                    className="w-full bg-[#0a0a0a] border border-[#d4af35]/20 rounded-xl px-4 py-4 text-xs text-white outline-none focus:border-[#d4af35] transition-all font-bold tracking-widest placeholder:text-gray-700"
                    required
                  />
                  <button 
                    type="submit"
                    className="w-full bg-[#d4af35] text-[#201d13] font-black py-4 rounded-xl uppercase text-[10px] tracking-[0.2em] hover:brightness-110 transition-all"
                  >
                    Enviar Solicitud
                  </button>
                </form>
                <p className="text-center text-[8px] text-gray-600 uppercase font-bold tracking-tighter">Al unirse, acepta recibir notificaciones exclusivas de la Arena.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
