'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductGrid from '@/components/tienda/ProductGrid';
import { Producto } from '@/types';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

const CATEGORIAS = ['Vestidos', 'Blusas', 'Pantalones', 'Faldas', 'Shorts', 'Camisetas', 'Pijamas'];
const GENEROS = ['Mujer', 'Hombre', 'Infantil', 'Accesorios'];
const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'];

function ProductosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filter States
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedGens, setSelectedGens] = useState<string[]>([]);
  const [selectedTallas, setSelectedTallas] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('nuevos');

  // Initialize from URL params
  useEffect(() => {
    const cat = searchParams.get('categoria');
    const gen = searchParams.get('genero');
    const talla = searchParams.get('talla');
    const q = searchParams.get('busqueda');
    const nov = searchParams.get('novedades');

    if (cat) setSelectedCats(cat.split(','));
    if (gen) setSelectedGens(gen.split(','));
    if (talla) setSelectedTallas(talla.split(','));

    fetchProductos(searchParams.toString());
  }, [searchParams]);

  const fetchProductos = async (queryString: string) => {
    setLoading(true);
    try {
      // Fake API call or actual endpoint: /api/productos?${queryString}
      // For frontend demo purposes, we will pretend we fetch and get [] if no real backend
      const res = await fetch(`/api/productos?${queryString}`);
      if (res.ok) {
        const data = await res.json();
        setProductos(data);
      } else {
        setProductos([]); // fallback
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (selectedCats.length) params.set('categoria', selectedCats.join(','));
    if (selectedGens.length) params.set('genero', selectedGens.join(','));
    if (selectedTallas.length) params.set('talla', selectedTallas.join(','));
    if (minPrice) params.set('min', minPrice);
    if (maxPrice) params.set('max', maxPrice);
    if (sort) params.set('orden', sort);
    
    // Retain search if exists
    const q = searchParams.get('busqueda');
    if (q) params.set('busqueda', q);

    router.push(`/productos?${params.toString()}`);
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setSelectedCats([]);
    setSelectedGens([]);
    setSelectedTallas([]);
    setMinPrice('');
    setMaxPrice('');
    setSort('nuevos');
    router.push('/productos');
    setShowMobileFilters(false);
  };

  const toggleCheckbox = (setter: any, state: string[], val: string) => {
    if (state.includes(val)) {
      setter(state.filter(item => item !== val));
    } else {
      setter([...state, val]);
    }
  };

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold uppercase text-xs tracking-wider text-carbon">Filtros</h3>
          <button onClick={clearFilters} className="text-xs text-gray-500 underline hover:text-rosa-petalo">Limpiar</button>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-sm text-carbon mb-3">Género</h4>
        <div className="space-y-2">
          {GENEROS.map(g => (
            <label key={g} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={selectedGens.includes(g)} onChange={() => toggleCheckbox(setSelectedGens, selectedGens, g)} className="w-4 h-4 text-carbon border-gray-300 rounded-sm focus:ring-carbon accent-carbon" />
              <span className="text-sm text-gray-600 group-hover:text-carbon">{g}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-sm text-carbon mb-3">Categoría</h4>
        <div className="space-y-2">
          {CATEGORIAS.map(c => (
            <label key={c} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={selectedCats.includes(c)} onChange={() => toggleCheckbox(setSelectedCats, selectedCats, c)} className="w-4 h-4 text-carbon border-gray-300 rounded-sm focus:ring-carbon accent-carbon" />
              <span className="text-sm text-gray-600 group-hover:text-carbon">{c}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-sm text-carbon mb-3">Talla</h4>
        <div className="flex flex-wrap gap-2">
          {TALLAS.map(t => (
            <button
              key={t}
              onClick={() => toggleCheckbox(setSelectedTallas, selectedTallas, t)}
              className={`w-10 h-10 border flex items-center justify-center text-xs transition-colors ${selectedTallas.includes(t) ? 'border-carbon bg-carbon text-white' : 'border-gray-300 text-gray-600 hover:border-carbon'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-sm text-carbon mb-3">Precio</h4>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-carbon" />
          <span className="text-gray-400">-</span>
          <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-carbon" />
        </div>
      </div>

      <button onClick={applyFilters} className="w-full bg-carbon text-white py-3 text-sm font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors">
        Aplicar Filtros
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-8 pb-4 border-b border-cream gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-carbon mb-2">Colección Completa</h1>
          <p className="text-sm text-gray-500">{productos.length} productos encontrados</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <button 
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center gap-2 border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            <FiFilter /> Filtros
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 hidden sm:block">Ordenar por:</label>
            <div className="relative">
              <select 
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setTimeout(applyFilters, 100);
                }}
                className="appearance-none border border-gray-300 rounded-sm pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-carbon bg-white cursor-pointer"
              >
                <option value="nuevos">Más nuevos</option>
                <option value="precio_asc">Precio: Menor a Mayor</option>
                <option value="precio_desc">Precio: Mayor a Menor</option>
                <option value="nombre_asc">Nombre: A - Z</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <FilterContent />
        </aside>

        {/* Main Grid */}
        <main className="flex-1">
          <ProductGrid productos={productos} loading={loading} />
        </main>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-carbon/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b border-cream">
              <h2 className="font-serif text-xl font-bold">Filtros</h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-2"><FiX size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center font-serif text-carbon">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-rosa-petalo border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm uppercase tracking-widest text-gray-500">Cargando catálogo...</p>
        </div>
      </div>
    }>
      <ProductosContent />
    </Suspense>
  );
}
