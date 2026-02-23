'use client';

import React, { useState, useEffect } from 'react';

interface Customer {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación de carga (sustituir con API real /api/users si se desea)
    setCustomers([
      { id: '1', name: 'Erik Coleccionista', email: 'erik@example.com', role: 'ADMIN', createdAt: '2024-02-22' },
      { id: '2', name: 'Juan Aficionado', email: 'juan@arena.com', role: 'CLIENT', createdAt: '2024-02-21' },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Coleccionistas en la Arena</h1>
        <p className="text-gray-500 dark:text-gray-400">Gestiona la base de datos de usuarios y sus niveles de acceso.</p>
      </div>

      <div className="bg-white dark:bg-[#1a170e] rounded-2xl border border-gray-200 dark:border-[#433d28] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-[#433d28]">
          <h3 className="font-bold dark:text-white uppercase text-sm tracking-widest">Lista de Usuarios</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#302c1c]/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Correo Electrónico</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Miembro desde</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#433d28]">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 animate-pulse">Cargando base de datos...</td></tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-[#302c1c]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#d4af35]/10 rounded-full flex items-center justify-center text-[#d4af35] font-bold">
                          {customer.name[0]}
                        </div>
                        <span className="font-bold dark:text-white text-sm">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{customer.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        customer.role === 'ADMIN' ? 'bg-[#d4af35]/10 text-[#d4af35]' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {customer.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 uppercase font-medium">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 text-gray-400 hover:text-[#d4af35] transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
