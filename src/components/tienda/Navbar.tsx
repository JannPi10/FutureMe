'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  FiSearch, FiUser, FiShoppingBag, FiMenu, FiX, 
  FiChevronDown, FiChevronRight, FiShield, FiLogOut, FiHeart, FiPackage
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { openWhatsAppChat, getWhatsAppUrl } from '@/lib/whatsapp';
import { useCartStore } from '@/store/cartStore';
import { useSession, signOut, signIn } from 'next-auth/react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  
  const { getItemCount, openCart } = useCartStore();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const updateWishlistCount = useCallback(() => {
    if (typeof window === 'undefined') return;
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('saved_')) {
        count++;
      }
    }
    setWishlistCount(count);
  }, []);

  useEffect(() => {
    setMounted(true);
    updateWishlistCount();

    window.addEventListener('wishlist-updated', updateWishlistCount);
    window.addEventListener('storage', updateWishlistCount);

    return () => {
      window.removeEventListener('wishlist-updated', updateWishlistCount);
      window.removeEventListener('storage', updateWishlistCount);
    };
  }, [updateWishlistCount]);

  // Cerrar menú y búsqueda al navegar
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Bloquear el scroll del fondo cuando el menú o búsqueda están abiertos
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  const toggleCategoryDropdown = (name: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/productos?busqueda=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Inicio', href: '/' },
    {
      name: 'Mujer',
      href: '/categoria/mujer',
      dropdown: [
        { name: 'Ver todo Mujer', href: '/categoria/mujer' },
        { name: 'Vestidos', href: '/categoria/mujer?sub=vestidos' },
        { name: 'Blusas', href: '/categoria/mujer?sub=blusas' },
        { name: 'Pantalones', href: '/categoria/mujer?sub=pantalones' },
        { name: 'Faldas', href: '/categoria/mujer?sub=faldas' },
        { name: 'Shorts', href: '/categoria/mujer?sub=shorts' },
        { name: 'Pijamas', href: '/categoria/mujer?sub=pijamas' },
      ],
    },
    {
      name: 'Hombre',
      href: '/categoria/hombre',
      dropdown: [
        { name: 'Ver todo Hombre', href: '/categoria/hombre' },
        { name: 'Camisetas', href: '/categoria/hombre?sub=camisetas' },
        { name: 'Pantalones', href: '/categoria/hombre?sub=pantalones' },
        { name: 'Shorts', href: '/categoria/hombre?sub=shorts' },
        { name: 'Pijamas', href: '/categoria/hombre?sub=pijamas' },
      ],
    },
    {
      name: 'Infantil',
      href: '/categoria/infantil',
      dropdown: [
        { name: 'Ver todo Infantil', href: '/categoria/infantil' },
        { name: 'Ropa Niña', href: '/categoria/infantil?sub=ropa-nina' },
        { name: 'Ropa Niño', href: '/categoria/infantil?sub=ropa-nino' },
        { name: 'Pijamas Infantil', href: '/categoria/infantil?sub=pijamas' },
      ],
    },
    { name: 'Accesorios', href: '/categoria/accesorios' },
    { name: 'Novedades', href: '/productos?novedades=true' },
    { name: 'Ofertas', href: '/productos?ofertas=true' },
    { name: 'Contacto', href: '/contacto' },
  ];

  const userEmail = session?.user?.email?.toLowerCase() || '';
  const isAdmin = (session?.user as any)?.role === 'admin' || 
    userEmail === 'leidysabata@gmail.com' || 
    userEmail.startsWith('jannpierre00@gmail');

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-tulip-white/95 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* Botón Menú Hamburguesa (Móvil) */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-carbon hover:text-rosa-petalo p-2 -ml-2 rounded-lg focus:outline-none transition-colors"
                aria-label="Abrir menú de navegación"
              >
                <FiMenu size={24} />
              </button>
            </div>

            {/* Logo Central (Móvil) / Izquierda (Desktop) */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <Link href="/" aria-label="FutureMe - Inicio" className="block">
                <img
                  src="/logo2.png"
                  alt="FutureMe Boutique by Leidy Sabata"
                  className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-300 hover:scale-105"
                />
              </Link>
            </div>

            {/* Navegación Desktop */}
            <nav className="hidden lg:flex lg:items-center lg:justify-center flex-1 mx-6">
              <ul className="flex space-x-6 text-sm font-medium text-carbon">
                {navLinks.map((link) => (
                  <li key={link.name} className="relative group">
                    <Link
                      href={link.href}
                      className="hover:text-rosa-petalo py-2 inline-flex items-center transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-rosa-petalo after:transition-all after:duration-300 group-hover:after:w-full"
                    >
                      {link.name}
                      {link.dropdown && <FiChevronDown className="ml-1 opacity-70 transition-transform group-hover:rotate-180" size={14} />}
                    </Link>
                    
                    {/* Dropdown Desktop */}
                    {link.dropdown && (
                      <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-cream shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 rounded-xl overflow-hidden py-1">
                        <ul>
                          {link.dropdown.map((dropLink) => (
                            <li key={dropLink.name}>
                              <Link
                                href={dropLink.href}
                                className="block px-4 py-2.5 text-xs font-medium text-carbon hover:bg-cream hover:text-rosa-petalo transition-colors"
                              >
                                {dropLink.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Íconos a la Derecha (Búsqueda, Perfil, Carrito) */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              
              {/* Buscador */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="text-carbon hover:text-rosa-petalo transition-colors p-2 rounded-full hover:bg-black/5" 
                aria-label="Buscar productos"
                title="Buscar"
              >
                <FiSearch size={20} />
              </button>

              {/* Favoritos / Wishlist */}
              <Link
                href="/favoritos"
                className="text-carbon hover:text-rosa-petalo transition-colors p-2 relative rounded-full hover:bg-black/5"
                aria-label="Mis Favoritos"
                title="Mis Favoritos"
              >
                <FiHeart size={20} />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rosa-tulip text-carbon text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Perfil de Usuario — Visible en Móvil y Desktop */}
              {session ? (
                <div className="relative group">
                  <Link 
                    href="/cuenta" 
                    className="text-carbon hover:text-rosa-petalo transition-colors p-1.5 flex items-center gap-1.5 rounded-full hover:bg-black/5"
                    aria-label="Mi Cuenta"
                    title="Mi Cuenta"
                  >
                    <div className="w-8 h-8 rounded-full bg-rosa-tulip text-carbon font-bold text-xs flex items-center justify-center border border-rosa-petalo/30 shadow-xs">
                      {(session.user?.name || session.user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  </Link>

                  {/* Dropdown Desktop del Perfil */}
                  <div className="hidden sm:block absolute right-0 top-full mt-1 w-56 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-carbon truncate">{session.user?.name || 'Cliente'}</p>
                      <p className="text-[11px] text-gray-400 truncate">{session.user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rosa-tulip/20 text-rosa-petalo">
                        {isAdmin ? 'Administrador' : 'Cliente'}
                      </span>
                    </div>
                    <Link href="/cuenta" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-cream hover:text-rosa-petalo">
                      <FiPackage size={14} /> Mis Pedidos
                    </Link>
                    <Link href="/favoritos" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-cream hover:text-rosa-petalo">
                      <FiHeart size={14} /> Mis Favoritos {mounted && wishlistCount > 0 && `(${wishlistCount})`}
                    </Link>
                    {isAdmin && (
                      <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-rosa-petalo hover:bg-rosa-tulip/20">
                        <FiShield size={14} /> Panel de Administración
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      <FiLogOut size={14} /> Cerrar sesión
                    </button>
                  </div>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="text-carbon hover:text-rosa-petalo transition-colors p-2 rounded-full hover:bg-black/5"
                  aria-label="Iniciar Sesión"
                  title="Iniciar sesión / Mi cuenta"
                >
                  <FiUser size={20} />
                </Link>
              )}

              {/* Carrito de Compras */}
              <button 
                onClick={openCart}
                className="text-carbon hover:text-rosa-petalo transition-colors p-2 relative rounded-full hover:bg-black/5" 
                aria-label="Ver carrito"
                title="Carrito de compras"
              >
                <FiShoppingBag size={21} />
                {mounted && getItemCount() > 0 && (
                  <span className="absolute top-1 right-1 bg-rosa-tulip text-carbon text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-xs">
                    {getItemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          DRAWER MENÚ MÓVIL (100% RESPONSIVE - INDEPENDIENTE DEL HEADER)
      ======================================================== */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex">
          
          {/* Overlay oscuro de fondo */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Panel Lateral Deslizable */}
          <div className="relative w-[85vw] max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-[101] overflow-hidden">
            
            {/* Header del Menú Móvil */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-cream/30">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="inline-block">
                <img
                  src="/logo2.png"
                  alt="FutureMe"
                  className="h-10 w-auto object-contain"
                />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-carbon hover:text-rosa-petalo rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Cerrar menú"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Buscador Rápido Móvil */}
            <div className="p-4 border-b border-gray-100">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  id="mobile-menu-search"
                  name="busqueda"
                  type="text"
                  placeholder="Buscar vestidos, blusas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs text-carbon placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rosa-tulip"
                />
                <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={15} />
              </form>
            </div>

            {/* Lista de Enlaces con Acordeón */}
            <div className="flex-1 overflow-y-auto py-2 px-4 space-y-1">
              {/* Enlace destacado a Favoritos */}
              <Link
                href="/favoritos"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 px-3 bg-rosa-tulip/15 rounded-xl text-sm font-semibold text-carbon hover:bg-rosa-tulip/25 transition-colors mb-2"
              >
                <span className="flex items-center gap-2 text-carbon">
                  <FiHeart className="text-rosa-petalo fill-rosa-petalo/40" size={17} /> Mis Favoritos
                </span>
                {mounted && wishlistCount > 0 && (
                  <span className="bg-rosa-tulip text-carbon text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {navLinks.map((link) => (
                <div key={link.name} className="border-b border-gray-50 last:border-b-0 py-1">
                  {link.dropdown ? (
                    <div>
                      <button
                        onClick={() => toggleCategoryDropdown(link.name)}
                        className="w-full flex items-center justify-between py-2.5 text-sm font-semibold text-carbon hover:text-rosa-petalo text-left"
                      >
                        <span>{link.name}</span>
                        <FiChevronDown 
                          size={16} 
                          className={`transition-transform duration-200 text-gray-400 ${
                            openDropdowns[link.name] ? 'rotate-180 text-rosa-petalo' : ''
                          }`} 
                        />
                      </button>

                      {/* Subcategorías desplegables */}
                      {openDropdowns[link.name] && (
                        <div className="pl-3 pb-2 space-y-1 bg-gray-50/70 rounded-lg my-1 py-1.5">
                          {link.dropdown.map((subLink) => (
                            <Link
                              key={subLink.name}
                              href={subLink.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1.5 px-3 text-xs text-gray-600 hover:text-rosa-petalo hover:bg-rosa-tulip/10 rounded-md transition-colors"
                            >
                              {subLink.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2.5 text-sm font-semibold text-carbon hover:text-rosa-petalo"
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Pie del Menú Móvil (Usuario y WhatsApp) */}
            <div className="p-4 border-t border-gray-100 bg-cream/40 space-y-3">
              {session ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                    <div className="w-9 h-9 rounded-full bg-rosa-tulip text-carbon font-bold text-sm flex items-center justify-center shadow-xs">
                      {(session.user?.name || session.user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-carbon truncate">{session.user?.name || 'Cliente'}</p>
                      <p className="text-[11px] text-gray-500 truncate">{session.user?.email}</p>
                    </div>
                  </div>

                  <Link
                    href="/cuenta"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 text-xs font-semibold text-carbon hover:text-rosa-petalo py-1.5"
                  >
                    <FiPackage size={15} /> Mi Cuenta (Pedidos & Favoritos)
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 text-xs font-bold text-rosa-petalo py-1.5"
                    >
                      <FiShield size={15} /> ⚙️ Panel de Administración
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="flex items-center gap-2 text-xs font-medium text-red-600 py-1.5 w-full text-left"
                  >
                    <FiLogOut size={14} /> Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full bg-carbon text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-center block hover:bg-rosa-petalo transition-colors shadow-xs"
                  >
                    Iniciar Sesión / Registrarse
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signIn('google', { callbackUrl: '/login' });
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continuar con Google</span>
                  </button>
                </div>
              )}

              {/* Botón WhatsApp */}
              <a
                href={getWhatsAppUrl('573209728606')}
                onClick={(e) => {
                  e.preventDefault();
                  openWhatsAppChat('573209728606');
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 bg-[#25D366] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-green-600 transition-colors shadow-xs"
              >
                <FaWhatsapp size={16} /> WhatsApp de la Tienda
              </a>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          MODAL DE BÚSQUEDA FLOTANTE (MÓVIL & ESCRITORIO)
      ======================================================== */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSearchOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 z-[101] border border-rosa-tulip/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-carbon">Buscar en el Catálogo</h3>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="text-gray-400 hover:text-carbon p-1 rounded-full hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                id="header-search-input"
                name="busqueda"
                type="text"
                autoFocus
                placeholder="Escribe lo que buscas (ej. vestido, blusa, short)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 text-sm text-carbon focus:outline-none focus:ring-2 focus:ring-rosa-tulip"
              />
              <FiSearch className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-carbon text-white text-xs font-bold uppercase px-3 py-1.5 rounded-lg hover:bg-rosa-petalo transition-colors"
              >
                Buscar
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Búsquedas populares:</p>
              <div className="flex flex-wrap gap-2">
                {['Vestidos', 'Blusas', 'Pijamas', 'Shorts', 'Faldas', 'Novedades'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      router.push(`/productos?busqueda=${encodeURIComponent(tag.toLowerCase())}`);
                      setIsSearchOpen(false);
                    }}
                    className="text-xs bg-gray-100 hover:bg-rosa-tulip/20 hover:text-rosa-petalo px-3 py-1 rounded-full transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
