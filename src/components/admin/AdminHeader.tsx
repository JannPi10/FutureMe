'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AdminHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const getPageTitle = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length < 2) return 'Dashboard';
    const section = parts[1];
    return section.charAt(0).toUpperCase() + section.slice(1);
  };

  const email = session?.user?.email || 'admin@futureme.com';
  const initial = email.charAt(0).toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 font-sans">
          {getPageTitle()}
        </h1>
        <div className="text-xs text-gray-500 flex items-center space-x-2 mt-0.5">
          <span>Admin</span>
          <span>/</span>
          <span className="text-gray-700 font-medium">{getPageTitle()}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium text-gray-900">{email}</span>
          <span className="text-xs text-gray-500">Administrador</span>
        </div>
        <div className="h-10 w-10 rounded-full bg-rosa-tulip text-white flex items-center justify-center font-bold">
          {initial}
        </div>
      </div>
    </header>
  );
}
