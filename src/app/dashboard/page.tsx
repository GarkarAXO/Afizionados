'use client';

import AuthGuard from '@/components/AuthGuard';

const stats = [
  { label: 'Ventas Totales', value: '$128,430', icon: 'payments', trend: '+12.5%' },
  { label: 'Piezas Únicas', value: '42', icon: 'workspace_premium', trend: '+3 nuevas' },
  { label: 'Clientes Activos', value: '1,204', icon: 'group', trend: '+18%' },
  { label: 'Subastas Activas', value: '8', icon: 'gavel', trend: 'En curso' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Resumen de la Arena</h1>
        <p className="text-gray-500 dark:text-gray-400">Bienvenido de nuevo, Administrador. Así va la colección hoy.</p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-[#1a170e] p-6 rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-sm hover:border-[#d4af35]/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 dark:bg-[#302c1c] rounded-xl text-gray-400 group-hover:text-[#d4af35] transition-colors">
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-full uppercase">
                {stat.trend}
              </span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</h3>
            <p className="text-3xl font-black dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Actividad Reciente */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1a170e] rounded-2xl border border-gray-200 dark:border-[#433d28] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-[#433d28]">
            <h3 className="font-bold dark:text-white uppercase text-sm tracking-widest">Órdenes Recientes</h3>
          </div>
          <div className="p-6 text-center py-20">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-4">history</span>
            <p className="text-gray-500 text-sm">No hay transacciones recientes para mostrar.</p>
          </div>
        </div>

        {/* Mejores Clientes */}
        <div className="bg-white dark:bg-[#1a170e] rounded-2xl border border-gray-200 dark:border-[#433d28] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-[#433d28]">
            <h3 className="font-bold dark:text-white uppercase text-sm tracking-widest">Top Coleccionistas</h3>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#302c1c]/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#d4af35]/10 rounded-full flex items-center justify-center text-[#d4af35] font-bold">C</div>
                  <div>
                    <p className="text-sm font-bold dark:text-white">Coleccionista #{i}</p>
                    <p className="text-[10px] text-gray-500 uppercase">Premium Member</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#d4af35]">$2,400</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
