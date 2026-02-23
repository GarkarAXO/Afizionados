'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/auth/login');
      return;
    }

    const user = JSON.parse(userStr);

    if (adminOnly && user.role !== 'ADMIN') {
      router.push('/'); // O a una página de "No autorizado"
      return;
    }

    setAuthorized(true);
  }, [router, adminOnly]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-[#d4af35] animate-pulse font-black tracking-widest uppercase">
          Verificando Acceso...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
