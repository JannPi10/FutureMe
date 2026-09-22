'use client';

import { useEffect, useState } from 'react';

export default function AnnouncementBar() {
  const [bannerText, setBannerText] = useState('🌸 ENVÍO GRATIS en compras superiores a $150.000');

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/configuracion', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.banner_envio) {
            const clean = data.banner_envio.startsWith('🌸') ? data.banner_envio : `🌸 ${data.banner_envio}`;
            setBannerText(clean);
          }
        }
      } catch (error) {
        console.error('Error fetching announcement banner config:', error);
      }
    }
    fetchConfig();
  }, []);

  return (
    <div className="bg-rosa-tulip text-carbon text-xs text-center tracking-widest uppercase font-sans py-2 px-4 w-full sticky top-0 z-40">
      {bannerText}
    </div>
  );
}
