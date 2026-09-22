'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { 
  FiGrid, FiPackage, FiTag, FiShoppingBag, 
  FiPercent, FiImage, FiSettings, FiLogOut, FiMenu, FiX 
} from 'react-icons/fi';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: FiGrid },
  { name: 'Productos', href: '/admin/productos', icon: FiPackage },
  { name: 'Categorías', href: '/admin/categorias', icon: FiTag },
  { name: 'Pedidos', href: '/admin/pedidos', icon: FiShoppingBag },
  { name: 'Descuentos', href: '/admin/descuentos', icon: FiPercent },
  { name: 'Banners', href: '/admin/banners', icon: FiImage },
  { name: 'Configuración', href: '/admin/configuracion', icon: FiSettings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex-1 flex flex-col h-full overflow-y-auto pt-5 pb-4">
          <div className="flex flex-col items-start flex-shrink-0 px-6">
            <img src="/logo2.png" alt="FutureMe Boutique by Leidy Sabata" className="h-10 w-auto object-contain mb-2" />
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Panel Admin</span>
          </div>

          <nav className="mt-8 flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${isActive 
                      ? 'bg-rosa-tulip/20 text-rosa-petalo' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <Icon 
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-rosa-petalo' : 'text-gray-400 group-hover:text-gray-500'}`} 
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {session?.user?.email || 'Admin User'}
                </p>
                <button
                  onClick={async () => {
                    await signOut({ callbackUrl: '/login', redirect: true });
                  }}
                  className="mt-1 text-xs font-medium text-red-500 hover:text-red-700 flex items-center cursor-pointer"
                >
                  <FiLogOut className="mr-1 h-3 w-3" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
