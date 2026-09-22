'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface Banner {
  id: string;
  titulo: string;
  subtitulo?: string;
  descripcion?: string;
  imagen_url?: string;
  link_primario?: string;
  texto_btn_primario?: string;
  link_secundario?: string;
  texto_btn_secundario?: string;
  boton1_texto?: string;
  boton1_url?: string;
  boton2_texto?: string;
  boton2_url?: string;
}

export default function HeroSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch('/api/banners', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json) ? json : (json?.data || []);
          if (list && list.length > 0) {
            setBanners(list);
          }
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBanners();
  }, []);

  const defaultBanners: Banner[] = [
    {
      id: 'default-1',
      titulo: 'Nueva Colección',
      subtitulo: 'Primavera - Verano',
      descripcion: 'Descubre las nuevas tendencias que florecen esta temporada. Diseños exclusivos para ti.',
      link_primario: '/productos?novedades=true',
      texto_btn_primario: 'Comprar ahora',
    },
    {
      id: 'default-2',
      titulo: 'Comodidad y Estilo',
      subtitulo: 'Para tu día a día',
      descripcion: 'Prendas versátiles que te acompañan en cada momento. Siente la diferencia.',
      link_primario: '/categoria/mujer',
      texto_btn_primario: 'Ver Colección',
    }
  ];

  const displayBanners = banners.length > 0 ? banners : defaultBanners;

  if (loading) {
    return <div className="w-full min-h-[520px] md:h-[620px] bg-cream animate-pulse"></div>;
  }

  return (
    <div className="w-full relative">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        pagination={{ clickable: true, bulletClass: 'swiper-pagination-bullet custom-bullet' }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="w-full min-h-[520px] md:h-[620px]"
      >
        {displayBanners.map((banner) => {
          const link1 = banner.boton1_url || banner.link_primario || '/productos';
          const text1 = banner.boton1_texto || banner.texto_btn_primario || 'Descubrir';
          const link2 = banner.boton2_url || banner.link_secundario;
          const text2 = banner.boton2_texto || banner.texto_btn_secundario;

          return (
            <SwiperSlide key={banner.id}>
              <div 
                className={`w-full h-full min-h-[520px] md:h-[620px] flex items-center bg-cover bg-center relative ${!banner.imagen_url ? 'bg-gradient-to-r from-cream to-rosa-tulip/20' : ''}`}
                style={banner.imagen_url ? { backgroundImage: `url("${banner.imagen_url}")` } : {}}
              >
                {banner.imagen_url ? (
                  <div className="absolute inset-0 bg-gradient-to-r from-tulip-white/95 via-tulip-white/70 to-transparent"></div>
                ) : (
                  <div className="absolute inset-0 bg-tulip-white/40"></div>
                )}
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
                  <div className="max-w-xl md:w-1/2 pt-6 sm:pt-10">
                    {banner.subtitulo && (
                      <p className="text-rosa-petalo text-[11px] sm:text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-2 sm:mb-4">
                        {banner.subtitulo}
                      </p>
                    )}
                    <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-carbon leading-tight mb-3 sm:mb-6">
                      {banner.titulo}
                    </h2>
                    {banner.descripcion && (
                      <p className="text-carbon/80 text-sm sm:text-base md:text-lg mb-6 sm:mb-10 max-w-md font-sans">
                        {banner.descripcion}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                      {link1 && text1 && (
                        <Link 
                          href={link1} 
                          className="bg-carbon text-tulip-white px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors rounded-xs shadow-sm"
                        >
                          {text1}
                        </Link>
                      )}
                      {link2 && text2 && (
                        <Link 
                          href={link2} 
                          className="bg-transparent border border-carbon text-carbon px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-carbon hover:text-tulip-white transition-colors rounded-xs"
                        >
                          {text2}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      
      <style jsx global>{`
        .custom-bullet {
          width: 8px;
          height: 8px;
          display: inline-block;
          border-radius: 50%;
          background: #171516;
          opacity: 0.2;
          margin: 0 4px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .swiper-pagination-bullet-active.custom-bullet {
          opacity: 1;
          width: 24px;
          border-radius: 4px;
          background: #D98FA8;
        }
        .swiper-pagination {
          bottom: 20px !important;
        }
      `}</style>
    </div>
  );
}
