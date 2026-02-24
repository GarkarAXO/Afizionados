'use client';

import React, { useState, useEffect } from 'react';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Estados para modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN'
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user?role=ADMIN', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setAdmins(data.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (admin: Admin | null = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        name: admin.name,
        email: admin.email,
        password: '',
        role: 'ADMIN'
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editingAdmin ? 'PUT' : 'POST';
      const url = editingAdmin ? `/api/user/${editingAdmin.id}` : '/api/user';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: editingAdmin ? 'Administrador actualizado' : 'Nuevo administrador registrado' });
        setIsModalOpen(false);
        fetchAdmins();
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al guardar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Retirar privilegios de administrador a este usuario?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Administrador eliminado' });
        fetchAdmins();
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al eliminar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Guardianes de la Arena</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestión de personal con privilegios administrativos y de seguridad.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-[#d4af35] text-[#201d13] font-black px-6 py-3 rounded-lg hover:brightness-110 transition-all flex items-center gap-2 uppercase text-xs tracking-widest shadow-lg shadow-[#d4af35]/20"
        >
          <span className="material-symbols-outlined text-lg">admin_panel_settings</span> Nuevo Administrador
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center gap-3 animate-bounce shadow-lg ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-500' 
            : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          <span className="material-symbols-outlined text-sm">
            {message.type === 'success' ? 'check_circle' : 'warning'}
          </span>
          {message.text}
        </div>
      )}

      <div className="bg-white dark:bg-[#1a170e] rounded-2xl border border-gray-200 dark:border-[#433d28] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-[#433d28] flex justify-between items-center bg-gray-50 dark:bg-[#302c1c]/30">
          <h3 className="font-bold dark:text-white uppercase text-sm tracking-widest">Panel de Control de Acceso</h3>
        </div>

        {/* VISTA DESKTOP: TABLA */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#302c1c]/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Administrador</th>
                <th className="px-6 py-4">Email Corporativo</th>
                <th className="px-6 py-4 text-center">Alta en Sistema</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#433d28]">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 animate-pulse uppercase text-[10px] tracking-widest">Verificando credenciales...</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 uppercase text-[10px] tracking-widest">No hay administradores registrados</td></tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-[#302c1c]/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#d4af35]/10 rounded-full flex items-center justify-center text-[#d4af35] font-black border border-[#d4af35]/20 shadow-sm">
                          {admin.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold dark:text-white text-sm uppercase">{admin.name}</span>
                          <span className="block text-[8px] text-[#d4af35] font-black uppercase tracking-tighter">Acceso Nivel 1</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium lowercase">{admin.email}</td>
                    <td className="px-6 py-4 text-center text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openModal(admin)} className="p-2 text-gray-400 hover:text-[#d4af35] transition-colors"><span className="material-symbols-outlined text-lg">shield_person</span></button>
                        <button onClick={() => handleDelete(admin.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-lg">no_accounts</span></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* VISTA MÓVIL: TARJETAS */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-[#433d28]">
          {loading ? (
            <div className="p-12 text-center text-gray-500 animate-pulse uppercase text-[10px] tracking-widest">Verificando credenciales...</div>
          ) : admins.length === 0 ? (
            <div className="p-12 text-center text-gray-500 uppercase text-[10px] tracking-widest">No hay administradores registrados</div>
          ) : (
            admins.map((admin) => (
              <div key={admin.id} className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#d4af35]/10 rounded-full flex items-center justify-center text-[#d4af35] border border-[#d4af35]/30 shadow-lg shadow-[#d4af35]/5">
                    <span className="material-symbols-outlined text-xl">shield_person</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black dark:text-white text-xs uppercase truncate leading-tight">{admin.name}</p>
                    <p className="text-[10px] text-[#d4af35] font-black uppercase tracking-tighter mt-0.5">Acceso Nivel Administrativo</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-[#302c1c]/30 p-3 rounded-xl border border-gray-100 dark:border-[#433d28]">
                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">Email Corporativo</p>
                  <p className="text-[10px] dark:text-gray-300 font-bold truncate lowercase">{admin.email}</p>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-[#302c1c]">
                  <div className="flex flex-col">
                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Alta en Sistema</p>
                    <p className="text-[10px] dark:text-gray-300 font-bold">{new Date(admin.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openModal(admin)} className="p-3 bg-gray-50 dark:bg-[#302c1c] rounded-xl text-gray-400 hover:text-[#d4af35] transition-colors">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button onClick={() => handleDelete(admin.id)} className="p-3 bg-red-500/5 rounded-xl text-red-500/50 hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-sm">no_accounts</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL DE EDICIÓN / CREACIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1a170e] w-full max-w-md rounded-2xl border border-gray-200 dark:border-[#433d28] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-[#433d28] flex justify-between items-center bg-gray-50 dark:bg-[#302c1c]/30">
              <h3 className="font-black dark:text-white uppercase tracking-widest text-sm">
                {editingAdmin ? 'Refinar Perfil Administrativo' : 'Registrar Nuevo Guardián'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[#d4af35] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nombre del Administrador</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Corporativo</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  {editingAdmin ? 'Actualizar Llave Maestra (opcional)' : 'Llave Maestra (Contraseña)'}
                </label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#302c1c] border border-gray-200 dark:border-[#605739] rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-[#d4af35]"
                  required={!editingAdmin}
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-gray-200 dark:border-[#433d28] rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-[#302c1c] transition-all">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-[#d4af35] text-[#201d13] rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-[#d4af35]/20 transition-all">Guardar Permisos</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
