'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CategoryCards() {
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadCategoryImages() {
      try {
        const configRes = await fetch('/api/configuracion', { cache: 'no-store' });
        const config = configRes.ok ? await configRes.json() : {};

        const images: Record<string, string> = {};
        if (config.cat_img_mujer) images['mujer'] = config.cat_img_mujer;
        if (config.cat_img_hombre) images['hombre'] = config.cat_img_hombre;
        if (config.cat_img_infantil) images['infantil'] = config.cat_img_infantil;
        if (config.cat_img_accesorios) images['accesorios'] = config.cat_img_accesorios;

        // Fallback inteligente: si la administradora no ha subido una foto personalizada,
        // mostrar la foto de la prenda más reciente de esa categoría
        const missing = ['mujer', 'hombre', 'infantil', 'accesorios'].filter(k => !images[k]);
        if (missing.length > 0) {
          const prodsRes = await fetch('/api/productos?pageSize=50', { cache: 'no-store' });
          if (prodsRes.ok) {
            const prodsJson = await prodsRes.json();
            const prods = Array.isArray(prodsJson) ? prodsJson : (prodsJson?.data || []);
            
            prods.forEach((p: any) => {
              const gen = p.categoria?.genero;
              const key = gen === 'nino' ? 'infantil' : (gen === 'accesorio' ? 'accesorios' : gen);
              if (key && !images[key] && p.imagenes && p.imagenes.length > 0) {
                images[key] = p.imagenes[0];
              }
            });
          }
        }

        setCategoryImages(images);
      } catch (err) {
        console.error('Error al cargar fotos de categorías:', err);
      }
    }

    loadCategoryImages();
  }, []);

  const categories = [
    {
      id: 'mujer',
      title: 'MUJER',
      description: 'Elegancia y comodidad',
      href: '/categoria/mujer',
      image: categoryImages['mujer'] || null,
      bgColor: 'bg-rosa-tulip'
    },
    {
      id: 'hombre',
      title: 'HOMBRE',
      description: 'Estilo versátil',
      href: '/categoria/hombre',
      image: categoryImages['hombre'] || null,
      bgColor: 'bg-verde-salvia'
    },
    {
      id: 'infantil',
      title: 'INFANTIL',
      description: 'Aventuras con estilo',
      href: '/categoria/infantil',
      image: categoryImages['infantil'] || null,
      bgColor: 'bg-malva'
    },
    {
      id: 'accesorios',
      title: 'ACCESORIOS',
      description: 'El toque final',
      href: '/categoria/accesorios',
      image: categoryImages['accesorios'] || null,
      bgColor: 'bg-beige'
    }
  ];

  return (
    <section className="py-16 bg-tulip-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl text-carbon">Nuestras Categorías</h2>
          <div className="w-16 h-[2px] bg-rosa-petalo mx-auto mt-4"></div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={cat.href}
              className="group relative h-[220px] sm:h-[320px] lg:h-[360px] overflow-hidden rounded-2xl flex items-end block shadow-sm border border-gray-100"
            >
              {/* Background Image / Color */}
              {cat.image ? (
                <>
                  <img 
                    src={cat.image} 
                    alt={cat.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-carbon/90 via-carbon/40 to-black/15 transition-opacity group-hover:from-carbon/95"></div>
                </>
              ) : (
                <div className={`absolute inset-0 ${cat.bgColor} transition-transform duration-700 group-hover:scale-105`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                </div>
              )}
              
              {/* Content */}
              <div className="relative z-10 p-4 sm:p-6 w-full transform transition-transform duration-300 group-hover:-translate-y-1">
                <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl text-white font-bold tracking-wider mb-1 drop-shadow-sm">
                  {cat.title}
                </h3>
                <p className="text-white/90 text-xs sm:text-sm font-sans mb-2 sm:mb-3 opacity-90 line-clamp-1 drop-shadow-xs">
                  {cat.description}
                </p>
                <div className="flex items-center text-rosa-tulip text-xs font-bold uppercase tracking-widest transition-all">
                  <span>Descubrir</span>
                  <span className="ml-1.5 transform group-hover:translate-x-1.5 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
