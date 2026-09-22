import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronRight, FiHeart } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import ProductGrid from '@/components/tienda/ProductGrid';
import { formatPrice } from '@/lib/utils';
// We need a Client Component for interactivity since this page requires states for size/color selection
import ProductDetailClient from './ProductDetailClient';

async function getProduct(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/productos?slug=${slug}`, { next: { revalidate: 60 } }).catch(() => null);
    if (!res?.ok) return null;
    const json = await res.json();
    if (json?.data && Array.isArray(json.data)) {
      return json.data[0] || null;
    }
    return Array.isArray(json) ? json[0] : json;
  } catch (error) {
    return null;
  }
}

async function getRelatedProducts(categoriaId?: string, excludeId?: string) {
  if (!categoriaId) return [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/productos?categoria=${categoriaId}&pageSize=5`, { next: { revalidate: 60 } }).catch(() => null);
    if (!res?.ok) return [];
    const json = await res.json();
    const list = json?.data || (Array.isArray(json) ? json : []);
    return list.filter((p: any) => p.id !== excludeId).slice(0, 4);
  } catch (error) {
    return [];
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const producto = await getProduct(params.slug);

  if (!producto) {
    notFound();
  }

  const related = await getRelatedProducts(producto.categoria_id, producto.id);
  const categoriaNombre = producto.categoria?.nombre || 'Colección';
  const categoriaSlug = producto.categoria?.slug || 'todos';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-gray-500 mb-8 font-sans">
        <Link href="/" className="hover:text-rosa-petalo">Inicio</Link>
        <FiChevronRight className="mx-2" />
        <Link href={`/categoria/${categoriaSlug}`} className="hover:text-rosa-petalo capitalize">
          {categoriaNombre}
        </Link>
        <FiChevronRight className="mx-2" />
        <span className="text-carbon truncate max-w-[200px] sm:max-w-none">{producto.nombre}</span>
      </nav>

      {/* Main Product Area */}
      <ProductDetailClient producto={producto} />

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-24 pt-16 border-t border-cream">
          <ProductGrid productos={related} title="También te puede gustar" />
        </div>
      )}
    </div>
  );
}
