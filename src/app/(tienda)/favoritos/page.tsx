'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FiHeart, FiShoppingBag, FiArrowRight, FiTrash2 } from 'react-icons/fi';
import ProductCard from '@/components/tienda/ProductCard';
import { Producto } from '@/types';
import toast from 'react-hot-toast';

export default function FavoritosPage() {
  const [favoritos, setFavoritos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const savedIds: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('saved_')) {
        savedIds.push(key.replace('saved_', ''));
      }
    }

    if (savedIds.length === 0) {
      setFavoritos([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/productos?pageSize=100');
      if (res.ok) {
        const json = await res.json();
        const allProds: Producto[] = json.data || [];
        const filtered = allProds.filter(p => savedIds.includes(p.id));
        setFavoritos(filtered);
      }
    } catch (e) {
      console.error('Error al cargar favoritos', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();

    const handleUpdate = () => {
      loadFavorites();
    };

    window.addEventListener('wishlist-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('wishlist-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadFavorites]);

  const handleClearAll = () => {
    if (typeof window === 'undefined') return;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('saved_')) {
        localStorage.removeItem(key);
      }
    }
    setFavoritos([]);
    window.dispatchEvent(new Event('wishlist-updated'));
    toast.success('Lista de favoritos vaciada');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[75vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-cream gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-carbon flex items-center gap-3">
            <span className="p-2 bg-rosa-tulip/30 rounded-full text-rosa-petalo">
              <FiHeart size={28} className="fill-rosa-petalo" />
            </span>
            Mis Favoritos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Cargando tu lista...' : `${favoritos.length} ${favoritos.length === 1 ? 'prenda guardada' : 'prendas guardadas'} en tu lista de deseos`}
          </p>
        </div>

        {favoritos.length > 0 && !loading && (
          <button
            onClick={handleClearAll}
            className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1.5 transition-colors py-2 px-3 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
          >
            <FiTrash2 size={14} /> Vaciar lista
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-cream/40 rounded-lg aspect-[3/4] flex items-center justify-center">
              <span className="text-3xl opacity-40">🌸</span>
            </div>
          ))}
        </div>
      ) : favoritos.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white/60 rounded-3xl border border-cream my-8">
          <div className="w-20 h-20 rounded-full bg-rosa-tulip/30 flex items-center justify-center text-rosa-petalo mb-5">
            <FiHeart size={36} className="stroke-[1.5]" />
          </div>
          <h2 className="font-serif text-2xl text-carbon mb-2">Tu lista de deseos está vacía</h2>
          <p className="text-gray-500 text-sm max-w-md mb-8">
            Guarda las prendas que más te gusten tocando el ícono de corazón 💖 en cualquier producto para encontrarlas fácilmente aquí.
          </p>
          <Link
            href="/productos"
            className="bg-carbon text-white text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-lg hover:bg-rosa-petalo transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            Explorar Colección <FiArrowRight />
          </Link>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {favoritos.map(prod => (
            <ProductCard key={prod.id} producto={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
