import Link from 'next/link';
import { Producto } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  productos: Producto[];
  loading?: boolean;
  title?: string;
  showLink?: boolean;
  linkHref?: string;
  linkText?: string;
}

export default function ProductGrid({ 
  productos, 
  loading = false, 
  title, 
  showLink = false,
  linkHref = '/productos',
  linkText = 'Ver todos →'
}: ProductGridProps) {
  
  if (loading) {
    return (
      <div className="w-full">
        {title && (
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-serif text-3xl md:text-4xl text-carbon">{title}</h2>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col animate-pulse">
              <div className="aspect-[3/4] bg-cream mb-3 rounded-sm w-full"></div>
              <div className="flex gap-1 mb-2">
                <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                <div className="w-3 h-3 rounded-full bg-gray-200"></div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const list = Array.isArray(productos) ? productos : [];

  if (!list || list.length === 0) {
    return (
      <div className="w-full">
        {title && <h2 className="font-serif text-3xl md:text-4xl text-carbon mb-8">{title}</h2>}
        <div className="py-20 flex flex-col items-center justify-center text-center bg-tulip-white border border-cream rounded-sm">
          <span className="text-5xl mb-4">🌸</span>
          <h3 className="font-serif text-2xl text-carbon mb-2">No encontramos productos</h3>
          <p className="text-gray-500 mb-6 max-w-md">Lo sentimos, no hay productos disponibles con estos criterios de búsqueda.</p>
          <Link href="/productos" className="bg-carbon text-white px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors">
            Explorar Tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {(title || showLink) && (
        <div className="flex justify-between items-end mb-8 border-b border-cream pb-4">
          {title ? (
            <h2 className="font-serif text-3xl md:text-4xl text-carbon relative">
              {title}
              <span className="absolute -bottom-4 left-0 w-12 h-[2px] bg-rosa-petalo"></span>
            </h2>
          ) : <div></div>}
          
          {showLink && (
            <Link href={linkHref} className="text-sm font-bold uppercase tracking-wider text-carbon hover:text-rosa-petalo transition-colors flex items-center">
              {linkText}
            </Link>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-x-8">
        {list.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
    </div>
  );
}
