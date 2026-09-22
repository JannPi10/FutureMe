'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/admin/login';

  // Protección del lado del cliente: redirigir a login si no hay sesión
  useEffect(() => {
    if (!isLoginPage && !session) {
      router.replace('/admin/login');
    }
  }, [isLoginPage, session, router]);

  // Si está en /admin/login: renderiza la vista limpia sin barra lateral ni cabecera
  if (isLoginPage) {
    return <div className="min-h-screen bg-cream font-sans">{children}</div>;
  }

  // Si no hay sesión de admin, no mostrar nada mientras middleware/router redirige
  if (!session) {
    return null;
  }

  // Vista del panel de administración para usuarios autenticados
  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:ml-64">
        <AdminHeader />
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
