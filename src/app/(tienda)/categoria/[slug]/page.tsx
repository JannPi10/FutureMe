import Link from 'next/link';
import ProductGrid from '@/components/tienda/ProductGrid';
import { Producto } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CategoriaPageProps {
  params: { slug: string };
  searchParams?: { sub?: string };
}

const SUBCATEGORIAS_POR_GENERO: Record<string, { label: string; sub: string }[]> = {
  mujer: [
    { label: 'Vestidos', sub: 'vestidos' },
    { label: 'Blusas', sub: 'blusas' },
    { label: 'Pantalones', sub: 'pantalones' },
    { label: 'Faldas', sub: 'faldas' },
    { label: 'Shorts', sub: 'shorts' },
    { label: 'Pijamas', sub: 'pijamas' },
  ],
  hombre: [
    { label: 'Camisetas', sub: 'camisetas' },
    { label: 'Pantalones', sub: 'pantalones' },
    { label: 'Shorts', sub: 'shorts' },
    { label: 'Pijamas', sub: 'pijamas' },
  ],
  infantil: [
    { label: 'Ropa Niña', sub: 'ropa-nina' },
    { label: 'Ropa Niño', sub: 'ropa-nino' },
    { label: 'Pijamas Infantil', sub: 'pijamas' },
  ],
  accesorios: [
    { label: 'Bolsos', sub: 'bolsos' },
    { label: 'Accesorios', sub: 'accesorios' },
  ],
};

async function getCategoryProducts(slug: string, sub?: string): Promise<Producto[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const isGenero = ['mujer', 'hombre', 'infantil', 'accesorios'].includes(slug.toLowerCase());
    
    let query = isGenero ? `genero=${slug}` : `categoria=${slug}`;
    if (sub) {
      query += `&sub=${encodeURIComponent(sub)}`;
    }
    query += `&pageSize=100`;

    const res = await fetch(`${baseUrl}/api/productos?${query}`, { cache: 'no-store' }).catch(() => null);
    
    if (!res?.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : (json?.data || []);
  } catch (error) {
    console.error('Error fetching category products:', error);
    return [];
  }
}

export default async function CategoriaPage({ params, searchParams }: CategoriaPageProps) {
  const currentGenero = params.slug.toLowerCase();
  const currentSub = searchParams?.sub?.toLowerCase();

  const titleMap: Record<string, string> = {
    'mujer': 'Colección Mujer',
    'hombre': 'Colección Hombre',
    'infantil': 'Colección Infantil',
    'accesorios': 'Accesorios',
  };

  const baseTitle = titleMap[currentGenero] || params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
  const subOptions = SUBCATEGORIAS_POR_GENERO[currentGenero] || [];
  const currentSubObj = subOptions.find(s => s.sub === currentSub);
  
  const displayTitle = currentSubObj ? `${baseTitle} — ${currentSubObj.label}` : baseTitle;
  const productos = await getCategoryProducts(params.slug, currentSub);

  return (
    <div className="w-full min-h-screen bg-tulip-white/30">
      {/* Category Hero */}
      <div className="bg-cream/60 border-b border-cream py-12 md:py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="text-xs text-gray-500 mb-3 flex items-center justify-center gap-1.5 font-sans">
            <Link href="/" className="hover:text-rosa-petalo">Inicio</Link>
            <span>/</span>
            <Link href={`/categoria/${currentGenero}`} className="hover:text-rosa-petalo capitalize">{baseTitle}</Link>
            {currentSubObj && (
              <>
                <span>/</span>
                <span className="text-carbon font-semibold">{currentSubObj.label}</span>
              </>
            )}
          </nav>
          
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-carbon mb-3 capitalize">
            {displayTitle}
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto font-sans text-xs sm:text-sm px-4">
            Prendas cómodas, modernas y versátiles diseñadas con amor para ti.
          </p>

          {/* Subcategory Pills / Chips */}
          {subOptions.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
              <Link
                href={`/categoria/${currentGenero}`}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all shadow-xs ${
                  !currentSub 
                    ? 'bg-carbon text-white shadow-sm' 
                    : 'bg-white text-carbon hover:bg-rosa-tulip/30 border border-gray-200'
                }`}
              >
                Ver todo
              </Link>
              {subOptions.map((subItem) => (
                <Link
                  key={subItem.sub}
                  href={`/categoria/${currentGenero}?sub=${subItem.sub}`}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all shadow-xs ${
                    currentSub === subItem.sub
                      ? 'bg-carbon text-white shadow-sm'
                      : 'bg-white text-carbon hover:bg-rosa-tulip/30 border border-gray-200'
                  }`}
                >
                  {subItem.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <ProductGrid 
          productos={productos} 
          title={`${productos.length} prenda${productos.length === 1 ? '' : 's'} disponible${productos.length === 1 ? '' : 's'}`} 
        />
      </div>
    </div>
  );
}
