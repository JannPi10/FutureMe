'use client';

import { useState, useEffect } from 'react';
import { FiInstagram } from 'react-icons/fi';

export default function InstagramFeed() {
  const [instagramUrl, setInstagramUrl] = useState('https://www.instagram.com/leidy_sabata?stkn=MWp6MXh3YjN3dnZkbA==');
  const [handle, setHandle] = useState('leidy_sabata');
  const [feedImages, setFeedImages] = useState<string[]>([]);

  useEffect(() => {
    async function loadInstagramData() {
      try {
        const configRes = await fetch('/api/configuracion', { cache: 'no-store' });
        const config = configRes.ok ? await configRes.json() : {};

        const igUrl = config.instagram || 'https://www.instagram.com/leidy_sabata?stkn=MWp6MXh3YjN3dnZkbA==';
        setInstagramUrl(igUrl);

        // Extraer handle limpio (ej. leidy_sabata)
        const match = igUrl.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
        if (match && match[1]) {
          setHandle(match[1]);
        }

        // Obtener fotos personalizadas o fotos de prendas de la tienda
        const customImages: string[] = [
          config.ig_img_1,
          config.ig_img_2,
          config.ig_img_3,
          config.ig_img_4,
        ].filter(Boolean);

        if (customImages.length === 4) {
          setFeedImages(customImages);
        } else {
          // Si faltan fotos personalizadas, completar con fotos de prendas reales de la tienda
          const prodsRes = await fetch('/api/productos?pageSize=20', { cache: 'no-store' });
          if (prodsRes.ok) {
            const prodsJson = await prodsRes.json();
            const prods = Array.isArray(prodsJson) ? prodsJson : (prodsJson?.data || []);
            
            const garmentImages: string[] = [];
            prods.forEach((p: any) => {
              if (p.imagenes && Array.isArray(p.imagenes)) {
                p.imagenes.forEach((img: string) => {
                  if (img && !garmentImages.includes(img) && !customImages.includes(img)) {
                    garmentImages.push(img);
                  }
                });
              }
            });

            const combined = [...customImages, ...garmentImages].slice(0, 4);
            setFeedImages(combined);
          } else {
            setFeedImages(customImages);
          }
        }
      } catch (err) {
        console.error('Error cargando Instagram feed:', err);
      }
    }

    loadInstagramData();
  }, []);

  return (
    <section className="bg-rosa-tulip/10 py-20 border-t border-cream">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-rosa-petalo shadow-sm border border-rosa-tulip/30">
            <FiInstagram size={28} />
          </div>
        </div>

        <h2 className="font-serif text-3xl md:text-4xl text-carbon mb-2">Síguenos en Instagram</h2>
        
        <a 
          href={instagramUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-rosa-petalo hover:text-carbon font-bold text-base md:text-lg transition-colors inline-flex items-center gap-1.5 mb-10"
        >
          <span>@{handle}</span>
          <span className="text-xs bg-rosa-tulip/30 px-2 py-0.5 rounded-full text-carbon font-semibold">Seguir ↗</span>
        </a>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {feedImages.length > 0 ? (
            feedImages.map((img, i) => (
              <a
                key={i}
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square bg-cream rounded-xl overflow-hidden relative group cursor-pointer block shadow-xs border border-gray-100"
              >
                <img 
                  src={img} 
                  alt={`Instagram FutureMe ${i + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-carbon/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 z-10 text-white">
                  <FiInstagram size={30} className="transform group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Ver en Instagram</span>
                </div>
              </a>
            ))
          ) : (
            [1, 2, 3, 4].map(i => (
              <a
                key={i}
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square bg-white rounded-xl overflow-hidden relative group flex items-center justify-center border border-rosa-tulip/20 shadow-xs"
              >
                <div className="text-center p-4">
                  <FiInstagram size={26} className="mx-auto text-rosa-petalo mb-2" />
                  <span className="text-xs font-bold text-carbon">@{handle}</span>
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
