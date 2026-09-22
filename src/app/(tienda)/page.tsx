import HeroSlider from '@/components/tienda/HeroSlider';
import CategoryCards from '@/components/tienda/CategoryCards';
import ProductGrid from '@/components/tienda/ProductGrid';
import InstagramFeed from '@/components/tienda/InstagramFeed';
import { FiTruck, FiRefreshCcw, FiShield, FiMessageCircle } from 'react-icons/fi';
import { Producto } from '@/types';
import Link from 'next/link';

// Helper to fetch data safely
async function getHomeData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // In a real app, these would be fetch calls to the Next.js API routes or Supabase directly.
    // For this Server Component, since we are on the same server, fetching absolute URLs to our own API 
    // requires full URL. But to avoid issues during build, it's often better to fetch directly from DB in RSC.
    // Since we don't have direct DB access here, we'll try to fetch, but fallback to empty arrays to prevent build errors.
    
    // Simulate fetching new products
    const newsRes = await fetch(`${baseUrl}/api/productos?nuevo=true&limit=8`, { 
      next: { revalidate: 60 } 
    }).catch(() => null);
    
    // Simulate fetching featured products
    const featRes = await fetch(`${baseUrl}/api/productos?destacado=true&limit=4`, { 
      next: { revalidate: 60 } 
    }).catch(() => null);

    const newsData = newsRes?.ok ? await newsRes.json() : null;
    const featData = featRes?.ok ? await featRes.json() : null;

    const newProducts: Producto[] = Array.isArray(newsData)
      ? newsData
      : (Array.isArray(newsData?.data) ? newsData.data : []);

    const featuredProducts: Producto[] = Array.isArray(featData)
      ? featData
      : (Array.isArray(featData?.data) ? featData.data : []);

    return { newProducts, featuredProducts };
  } catch (error) {
    console.error("Failed to fetch home data:", error);
    return { newProducts: [], featuredProducts: [] };
  }
}

export default async function HomePage() {
  const { newProducts, featuredProducts } = await getHomeData();

  const benefits = [
    { icon: FiTruck, title: 'Envíos Rápidos', sub: 'A todo el país' },
    { icon: FiRefreshCcw, title: 'Cambios Fáciles', sub: 'Sin complicaciones' },
    { icon: FiShield, title: 'Pagos Seguros', sub: 'Contra entrega disponible' },
    { icon: FiMessageCircle, title: 'Atención Personalizada', sub: 'Estamos para ayudarte' },
  ];

  return (
    <div className="w-full">
      <HeroSlider />
      
      <CategoryCards />

      {/* Benefits Strip */}
      <section className="bg-cream py-10 border-y border-rosa-tulip/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 divide-x-0 md:divide-x divide-gray-300">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex flex-col items-center text-center px-4">
                <benefit.icon className="text-rosa-petalo text-3xl mb-3" />
                <h4 className="font-sans font-bold text-carbon text-sm uppercase tracking-wider mb-1">{benefit.title}</h4>
                <p className="text-gray-500 text-xs">{benefit.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nuevos Lanzamientos */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductGrid 
            productos={newProducts} 
            title="Nuevos Lanzamientos" 
            showLink={true} 
            linkHref="/productos?novedades=true"
            linkText="Ver todas las novedades →"
          />
        </div>
      </section>

      {/* Banner Medio */}
      <section className="py-16 bg-carbon text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-rosa-tulip text-sm font-bold tracking-[0.2em] uppercase mb-4 block">Esencia FutureMe</span>
          <h2 className="font-serif text-4xl md:text-5xl mb-6">Moda pensada para la mujer real</h2>
          <p className="text-gray-300 mb-8">Cada prenda es diseñada con amor, buscando el balance perfecto entre comodidad absoluta y estilo inconfundible.</p>
          <Link href="/nosotros" className="inline-block bg-rosa-tulip text-carbon px-8 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors">
            Conoce nuestra historia
          </Link>
        </div>
      </section>

      {/* Destacados */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductGrid 
            productos={featuredProducts} 
            title="Los Favoritos de Siempre" 
          />
        </div>
      </section>

      {/* Instagram Section */}
      <InstagramFeed />
    </div>
  );
}
