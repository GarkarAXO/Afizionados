'use client';

import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  title: string;
  priceCents: number;
  stock: number;
  isActive: boolean;
  category?: { name: string };
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) setProducts(data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Gestión de Inventario</h1>
          <p className="text-gray-500 dark:text-gray-400">Administra tus piezas de memorabilia y existencias.</p>
        </div>
        <button className="bg-[#d4af35] text-[#201d13] font-black px-6 py-3 rounded-lg hover:brightness-110 transition-all flex items-center gap-2 uppercase text-sm tracking-widest shadow-lg shadow-[#d4af35]/20">
          <span className="material-symbols-outlined">add</span>
          Nueva Pieza
        </button>
      </div>

      <div className="bg-white dark:bg-[#1a170e] rounded-2xl border border-gray-200 dark:border-[#433d28] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-[#433d28] flex justify-between items-center">
          <h3 className="font-bold dark:text-white">Lista de Productos</h3>
          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-[#d4af35]"><span className="material-symbols-outlined">filter_list</span></button>
            <button className="p-2 text-gray-400 hover:text-[#d4af35]"><span className="material-symbols-outlined">download</span></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#302c1c]/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Precio (MXN)</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#433d28]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 animate-pulse">Cargando inventario...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No hay productos registrados.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-[#302c1c]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-[#302c1c] rounded-lg flex items-center justify-center text-gray-400">
                          <span className="material-symbols-outlined">image</span>
                        </div>
                        <span className="font-bold dark:text-white text-sm">{product.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {product.category?.name || 'Sin categoría'}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold dark:text-white">
                      ${(product.priceCents / 100).toLocaleString('es-MX')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        product.stock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {product.stock} disp.
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`w-3 h-3 rounded-full ${product.isActive ? 'bg-[#d4af35]' : 'bg-gray-400'}`}></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-[#d4af35] transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                      </div>
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
