'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FiPackage, FiHeart, FiUser, FiLogOut, FiShoppingBag, 
  FiArrowRight, FiCheckCircle, FiClock, FiTruck, FiShield 
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { openWhatsAppChat, getWhatsAppUrl } from '@/lib/whatsapp';
import { Producto } from '@/types';
import ProductCard from '@/components/tienda/ProductCard';
import toast from 'react-hot-toast';

export default function MiCuentaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'pedidos' | 'favoritos' | 'datos'>('pedidos');

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab === 'favoritos' || tab === 'pedidos' || tab === 'datos') {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [favoritos, setFavoritos] = useState<Producto[]>([]);
  const [loadingFavoritos, setLoadingFavoritos] = useState(true);

  // Datos guardados de envío del cliente
  const [customerData, setCustomerData] = useState({
    nombre: '',
    telefono: '',
    ciudad: '',
    departamento: '',
    direccion: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/cuenta');
    }
  }, [status, router]);

  // Cargar pedidos del usuario
  useEffect(() => {
    if (session?.user?.email) {
      setLoadingPedidos(true);
      fetch('/api/pedidos/mis-pedidos')
        .then(res => res.json())
        .then(data => setPedidos(data.data || []))
        .catch(() => toast.error('No se pudieron cargar tus pedidos'))
        .finally(() => setLoadingPedidos(false));
    }
  }, [session?.user?.email]);

  // Cargar favoritos guardados en localStorage
  useEffect(() => {
    setLoadingFavoritos(true);
    fetch('/api/productos?pageSize=100')
      .then(res => res.json())
      .then(data => {
        const prods: Producto[] = data.data || [];
        const savedIds: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('saved_')) {
            savedIds.push(key.replace('saved_', ''));
          }
        }
        const favs = prods.filter(p => savedIds.includes(p.id));
        setFavoritos(favs);
      })
      .catch(() => {})
      .finally(() => setLoadingFavoritos(false));

    // Cargar datos de envío de localStorage si existen
    const savedCustomer = localStorage.getItem('futureme_customer_info');
    if (savedCustomer) {
      try {
        setCustomerData(JSON.parse(savedCustomer));
      } catch (e) {}
    } else if (session?.user) {
      setCustomerData(prev => ({
        ...prev,
        nombre: session.user?.name || '',
      }));
    }
  }, [session?.user]);

  const handleSaveCustomerData = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('futureme_customer_info', JSON.stringify(customerData));
    toast.success('Datos de entrega guardados para tus próximas compras');
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
    toast.success('Sesión cerrada con éxito');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rosa-tulip border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isAdmin = (session.user as any)?.role === 'admin';
  const userName = session.user?.name || session.user?.email?.split('@')[0] || 'Cliente';

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'entregado':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><FiCheckCircle className="mr-1" /> Entregado</span>;
      case 'enviado':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><FiTruck className="mr-1" /> En camino</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><FiClock className="mr-1" /> {estado}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[85vh]">
      
      {/* Banner de Admin si aplica */}
      {isAdmin && (
        <div className="mb-8 p-5 bg-gradient-to-r from-rosa-tulip/30 to-cream border border-rosa-tulip/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-full bg-carbon text-white flex items-center justify-center flex-shrink-0">
              <FiShield size={24} />
            </div>
            <div>
              <h3 className="font-bold text-carbon text-base">Acceso Administrador de Tienda</h3>
              <p className="text-xs text-gray-600">Tienes permisos para gestionar inventario, pedidos, descuentos y banners.</p>
            </div>
          </div>
          <Link
            href="/admin/dashboard"
            className="bg-carbon text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg hover:bg-rosa-petalo transition-colors flex items-center gap-2 whitespace-nowrap shadow"
          >
            Ir al Panel Admin <FiArrowRight />
          </Link>
        </div>
      )}

      {/* Header del Perfil */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-rosa-tulip text-carbon font-serif font-bold text-2xl flex items-center justify-center border-2 border-white shadow">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-carbon">¡Hola, {userName}!</h1>
            <p className="text-sm text-gray-500">{session.user?.email}</p>
            <span className="inline-block mt-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-rosa-tulip/20 text-rosa-petalo">
              {isAdmin ? 'Administradora Oficial' : 'Cliente FutureMe'}
            </span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 font-medium px-4 py-2 border border-gray-200 rounded-lg hover:border-red-200 transition-colors"
        >
          <FiLogOut /> Cerrar Sesión
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pedidos')}
          className={`py-3 px-6 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'pedidos'
              ? 'border-rosa-petalo text-rosa-petalo'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiPackage /> Mis Pedidos ({pedidos.length})
        </button>
        <button
          onClick={() => setActiveTab('favoritos')}
          className={`py-3 px-6 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'favoritos'
              ? 'border-rosa-petalo text-rosa-petalo'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiHeart /> Ropa Favorita ({favoritos.length})
        </button>
        <button
          onClick={() => setActiveTab('datos')}
          className={`py-3 px-6 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'datos'
              ? 'border-rosa-petalo text-rosa-petalo'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiUser /> Datos de Entrega
        </button>
      </div>

      {/* Contenido según Tab */}

      {/* 1. MIS PEDIDOS */}
      {activeTab === 'pedidos' && (
        <div>
          {loadingPedidos ? (
            <div className="py-12 text-center text-gray-400">Cargando tus pedidos...</div>
          ) : pedidos.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
              <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4 text-rosa-petalo">
                <FiShoppingBag size={28} />
              </div>
              <h3 className="font-serif text-xl text-carbon mb-2">Aún no tienes pedidos</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Cuando realices compras contra entrega en FutureMe, podrás seguir su estado y consultar los detalles aquí.
              </p>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 bg-carbon text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg hover:bg-rosa-petalo transition-colors"
              >
                Explorar Colección
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wider">Pedido</span>
                      <h4 className="font-bold text-carbon text-lg">#{pedido.numero_pedido}</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(pedido.estado)}
                      <span className="text-xs text-gray-500">
                        {new Date(pedido.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Items resumidos */}
                  <div className="py-4 space-y-2">
                    {pedido.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-800">
                          {item.cantidad}x {item.nombre} <span className="text-gray-400 text-xs">(Talla: {item.talla})</span>
                        </span>
                        <span className="font-medium text-carbon">${(item.precio * item.cantidad).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-100 gap-3">
                    <div className="text-sm">
                      <span className="text-gray-500">Total a pagar contra entrega: </span>
                      <span className="font-bold text-carbon text-base">${pedido.total?.toLocaleString()}</span>
                    </div>
                    <a
                      href={getWhatsAppUrl('573209728606', `¡Hola! Quiero consultar el estado de mi pedido #${pedido.numero_pedido}`)}
                      onClick={(e) => {
                        e.preventDefault();
                        openWhatsAppChat('573209728606', `¡Hola! Quiero consultar el estado de mi pedido #${pedido.numero_pedido}`);
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg bg-[#25D366] text-white hover:bg-green-600 transition-colors"
                    >
                      <FaWhatsapp size={16} /> Consultar por WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. PRENDAS FAVORITAS */}
      {activeTab === 'favoritos' && (
        <div>
          {loadingFavoritos ? (
            <div className="py-12 text-center text-gray-400">Cargando tus favoritos...</div>
          ) : favoritos.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
              <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4 text-rosa-petalo">
                <FiHeart size={28} />
              </div>
              <h3 className="font-serif text-xl text-carbon mb-2">No has guardado prendas favoritas</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Haz clic en el corazón de cualquier prenda que te encante para guardarla aquí y comprarla cuando quieras.
              </p>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 bg-carbon text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg hover:bg-rosa-petalo transition-colors"
              >
                Descubrir Moda
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {favoritos.map(producto => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. DATOS DE ENTREGA */}
      {activeTab === 'datos' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-carbon mb-2">Tus Datos de Entrega Habituales</h3>
          <p className="text-sm text-gray-500 mb-6">
            Guarda tu información para que tus pedidos contra entrega se procesen mucho más rápido en el checkout.
          </p>

          <form onSubmit={handleSaveCustomerData} className="space-y-4">
            <div>
              <label htmlFor="customer-nombre" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Nombre Completo</label>
              <input
                id="customer-nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                required
                value={customerData.nombre}
                onChange={e => setCustomerData({ ...customerData, nombre: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-rosa-tulip"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customer-telefono" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Teléfono (WhatsApp)</label>
                <input
                  id="customer-telefono"
                  name="telefono"
                  type="text"
                  autoComplete="tel"
                  placeholder="+57 320 000 0000"
                  value={customerData.telefono}
                  onChange={e => setCustomerData({ ...customerData, telefono: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-rosa-tulip"
                />
              </div>
              <div>
                <label htmlFor="customer-ciudad" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Ciudad</label>
                <input
                  id="customer-ciudad"
                  name="ciudad"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Ej: Los Patios / Cúcuta"
                  value={customerData.ciudad}
                  onChange={e => setCustomerData({ ...customerData, ciudad: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-rosa-tulip"
                />
              </div>
            </div>
            <div>
              <label htmlFor="customer-direccion" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Dirección Completa de Envío</label>
              <input
                id="customer-direccion"
                name="direccion"
                type="text"
                autoComplete="street-address"
                placeholder="Calle, número, barrio, conjunto o detalles"
                value={customerData.direccion}
                onChange={e => setCustomerData({ ...customerData, direccion: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-rosa-tulip"
              />
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-carbon text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg hover:bg-rosa-petalo transition-colors"
              >
                Guardar Datos de Entrega
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
