'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiInstagram, FiFacebook, FiMapPin } from 'react-icons/fi';
import { SiTiktok } from 'react-icons/si';
import { FaWhatsapp } from 'react-icons/fa';
import { openWhatsAppChat, getWhatsAppUrl } from '@/lib/whatsapp';

export default function Footer() {
  const [config, setConfig] = useState({
    instagram: 'https://www.instagram.com/leidy_sabata?stkn=MWp6MXh3YjN3dnZkbA==',
    facebook: 'https://facebook.com',
    tiktok: 'https://www.tiktok.com/@leidy_sabata?_r=1&_t=ZS-99xGr3KEmRE',
    whatsapp: '573209728606',
    direccion: 'Los Patios',
    ciudad: 'Norte de Santander',
  });

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/configuracion', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setConfig(prev => ({
            ...prev,
            instagram: data.instagram || prev.instagram,
            facebook: data.facebook || prev.facebook,
            tiktok: data.tiktok || prev.tiktok,
            whatsapp: (data.whatsapp || prev.whatsapp).replace(/\D/g, ''),
            direccion: data.direccion || prev.direccion,
            ciudad: data.ciudad || prev.ciudad,
          }));
        }
      } catch (error) {
        console.error('Error fetching footer config:', error);
      }
    }
    fetchConfig();
  }, []);

  const formatSocialLink = (url: string, base: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${base}/${url.replace(/^@/, '')}`;
  };

  return (
    <footer className="bg-carbon text-tulip-white pt-16 pb-8 relative overflow-hidden">
      
      {/* Tulipán decorativo realista — Extraído y pulido en alta fidelidad */}
      <div 
        className="absolute bottom-0 right-0 pointer-events-none z-0 select-none overflow-hidden max-h-[360px] md:max-h-[440px]" 
        aria-hidden="true"
      >
        <img
          src="/tulip.png"
          alt="Tulipán decorativo FutureMe"
          className="w-52 sm:w-64 md:w-80 lg:w-96 h-auto object-contain opacity-80 md:opacity-90 transform translate-x-8 translate-y-8 md:translate-x-6 md:translate-y-6 filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] pointer-events-none"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Newsletter Section */}
        <div className="mb-16 border-b border-gray-700 pb-12 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 max-w-md">
            <h3 className="font-serif text-2xl mb-2">Únete a nuestra familia</h3>
            <p className="text-gray-300 text-sm">Suscríbete para recibir novedades, promociones exclusivas y un 10% de descuento en tu primera compra.</p>
          </div>
          <form className="flex w-full md:w-auto max-w-md" onSubmit={(e) => e.preventDefault()}>
            <input 
              id="newsletter-email"
              name="newsletter_email"
              type="email" 
              autoComplete="email"
              placeholder="Tu correo electrónico" 
              className="bg-transparent border border-gray-600 px-4 py-3 text-sm flex-grow focus:outline-none focus:border-rosa-tulip"
              required
            />
            <button 
              type="submit" 
              className="bg-rosa-tulip text-carbon px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors"
            >
              Suscribirse
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Column 1: Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="mb-4 inline-block bg-white rounded-2xl p-2.5 shadow-sm">
              <img src="/logo2.png" alt="FutureMe by Leidy Sabata" className="h-16 w-auto object-contain" />
            </Link>
            <p className="text-gray-300 text-sm max-w-xs mt-2">
              Ropa cómoda, moderna y versátil. Diseñada con amor para ti.
            </p>
          </div>

          {/* Column 2: Links */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-serif text-xl mb-6 tracking-wide">Explorar</h4>
            <ul className="space-y-3 text-center md:text-left text-sm text-gray-300">
              <li><Link href="/" className="hover:text-rosa-tulip transition-colors">Inicio</Link></li>
              <li><Link href="/categoria/mujer" className="hover:text-rosa-tulip transition-colors">Mujer</Link></li>
              <li><Link href="/categoria/hombre" className="hover:text-rosa-tulip transition-colors">Hombre</Link></li>
              <li><Link href="/categoria/infantil" className="hover:text-rosa-tulip transition-colors">Infantil</Link></li>
              <li><Link href="/categoria/accesorios" className="hover:text-rosa-tulip transition-colors">Accesorios</Link></li>
              <li><Link href="/productos?novedades=true" className="hover:text-rosa-tulip transition-colors">Novedades</Link></li>
              <li><Link href="/guia-de-tallas" className="hover:text-rosa-tulip transition-colors">Guía de Tallas</Link></li>
              <li><Link href="/contacto" className="hover:text-rosa-tulip transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Column 3: Social & Contact */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-serif text-xl mb-6 tracking-wide">Conéctate</h4>
            <div className="flex space-x-5 mb-8">
              <a 
                href={getWhatsAppUrl(config.whatsapp)} 
                onClick={(e) => {
                  e.preventDefault();
                  openWhatsAppChat(config.whatsapp);
                }}
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-[#25D366] transition-colors" 
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={24} />
              </a>
              <a 
                href={formatSocialLink(config.instagram, 'https://instagram.com')} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-rosa-tulip transition-colors" 
                aria-label="Instagram"
              >
                <FiInstagram size={24} />
              </a>
              <a 
                href={formatSocialLink(config.facebook, 'https://facebook.com')} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-rosa-tulip transition-colors" 
                aria-label="Facebook"
              >
                <FiFacebook size={24} />
              </a>
              <a 
                href={formatSocialLink(config.tiktok, 'https://tiktok.com/@')} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-rosa-tulip transition-colors" 
                aria-label="TikTok"
              >
                <SiTiktok size={24} />
              </a>
            </div>
            
            <div className="flex items-start space-x-3 text-gray-300 text-sm max-w-xs text-center md:text-left">
              <FiMapPin size={20} className="flex-shrink-0 mt-0.5 hidden md:block text-rosa-tulip" />
              <p>
                {config.direccion}
                <br/>
                {config.ciudad ? (
                  config.ciudad.toLowerCase().includes('colombia') 
                    ? config.ciudad 
                    : `${config.ciudad}, Colombia`
                ) : 'Colombia'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} FutureMe by Leidy Sabata. Todos los derechos reservados.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/terminos" className="hover:text-gray-300 transition-colors">Términos y Condiciones</Link>
            <Link href="/privacidad" className="hover:text-gray-300 transition-colors">Política de Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
