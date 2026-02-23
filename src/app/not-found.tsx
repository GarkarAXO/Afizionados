import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f7f6] dark:bg-[#121212] flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <h1 className="text-[120px] font-black leading-none text-gray-200 dark:text-[#1a170e] relative">
          404
          <span className="absolute inset-0 flex items-center justify-center text-4xl text-[#d4af35] tracking-[0.3em] uppercase">
            Perdido
          </span>
        </h1>
        
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold dark:text-white uppercase tracking-tight">Pieza no encontrada</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Incluso en las mejores colecciones, algunas piezas son difíciles de rastrear. 
            La página que buscas no existe o ha sido movida a una bóveda privada.
          </p>
        </div>

        <div className="mt-10">
          <Link 
            href="/" 
            className="inline-block px-8 py-4 bg-[#d4af35] text-[#201d13] font-black rounded-lg hover:brightness-110 active:scale-[0.95] transition-all tracking-widest uppercase text-sm"
          >
            Volver a la Arena
          </Link>
        </div>

        <div className="mt-12 flex justify-center gap-4">
          <div className="h-[1px] w-12 bg-[#d4af35]/30 self-center"></div>
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Afizionados Memorabilia</span>
          <div className="h-[1px] w-12 bg-[#d4af35]/30 self-center"></div>
        </div>
      </div>
    </div>
  );
}
