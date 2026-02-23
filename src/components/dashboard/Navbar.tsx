'use client';

export default function Navbar() {
  return (
    <header className="h-16 bg-white/80 dark:bg-[#1a170e]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#433d28] sticky top-0 z-10 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-gray-400">search</span>
        <input 
          type="text" 
          placeholder="Buscar en la arena..." 
          className="bg-transparent border-none outline-none text-sm w-64 dark:text-white placeholder:text-gray-500"
        />
      </div>
      
      <div className="flex items-center gap-6">
        <button className="relative text-gray-500 hover:text-[#d4af35] transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a170e]"></span>
        </button>
        <div className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-[#433d28]">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold dark:text-white">Admin Afizionados</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Administrador Principal</p>
          </div>
          <div className="w-9 h-9 bg-gradient-to-tr from-[#d4af35] to-[#f8f7f6] rounded-full flex items-center justify-center font-bold text-[#201d13]">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
