'use client';

import { useState, useEffect } from 'react';
import { FiMapPin, FiMail, FiPhone, FiInstagram, FiFacebook } from 'react-icons/fi';
import { SiTiktok } from 'react-icons/si';
import { FaWhatsapp } from 'react-icons/fa';
import { openWhatsAppChat, getWhatsAppUrl } from '@/lib/whatsapp';

export default function ContactoPage() {
  const [config, setConfig] = useState({
    whatsapp: '573209728606',
    telefono: '+57 320 972 8606',
    email: 'leidysabata@gmail.com',
    direccion: 'Los Patios',
    ciudad: 'Norte de Santander',
    instagram: 'https://www.instagram.com/leidy_sabata?stkn=MWp6MXh3YjN3dnZkbA==',
    facebook: 'https://facebook.com',
    tiktok: 'https://www.tiktok.com/@leidy_sabata?_r=1&_t=ZS-99xGr3KEmRE',
    mapa_url: '',
  });

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/configuracion', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setConfig(prev => ({
            ...prev,
            whatsapp: data.whatsapp ? data.whatsapp.replace(/\D/g, '') : prev.whatsapp,
            telefono: data.telefono || data.whatsapp || prev.telefono,
            email: data.email || prev.email,
            direccion: data.direccion || prev.direccion,
            ciudad: data.ciudad || prev.ciudad,
            instagram: data.instagram || prev.instagram,
            facebook: data.facebook || prev.facebook,
            tiktok: data.tiktok || prev.tiktok,
            mapa_url: data.mapa_url || '',
          }));
        }
      } catch (err) {
        console.error('Error al cargar configuración en contacto:', err);
      }
    }
    fetchConfig();
  }, []);

  const formatSocialLink = (url: string, base: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${base}/${url.replace(/^@/, '')}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openWhatsAppChat(
      config.whatsapp,
      `Hola FutureMe! Mi nombre es ${formData.nombre} (${formData.email}). ${formData.mensaje}`
    );
  };

  // Helper para resolver la URL del iframe del mapa
  const getMapEmbedUrl = () => {
    if (config.mapa_url && config.mapa_url.trim()) {
      const match = config.mapa_url.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) return match[1];
      if (config.mapa_url.includes('google.com/maps/embed') || config.mapa_url.includes('output=embed')) {
        return config.mapa_url;
      }
    }
    const cleanCity = config.ciudad ? config.ciudad.replace(/,\s*Colombia$/i, '') : 'Norte de Santander';
    const query = encodeURIComponent(`${config.direccion || 'Los Patios'}, ${cleanCity}, Colombia`);
    return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <div className="w-full">
      <div className="bg-cream py-16 text-center">
        <h1 className="font-serif text-4xl md:text-5xl text-carbon mb-4">Contacto</h1>
        <p className="text-gray-600 max-w-md mx-auto px-4 text-sm">
          ¿Tienes alguna duda o consulta? Escríbenos y te responderemos lo más pronto posible.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Form */}
          <div>
            <h2 className="font-serif text-3xl text-carbon mb-6">Envíanos un mensaje</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Nombre completo</label>
                <input 
                  type="text" 
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-carbon bg-transparent transition-colors" 
                  placeholder="Tu nombre"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Correo electrónico</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-carbon bg-transparent transition-colors" 
                  placeholder="tu@email.com"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Mensaje</label>
                <textarea 
                  name="mensaje"
                  rows={4}
                  required
                  value={formData.mensaje}
                  onChange={handleChange}
                  className="w-full border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-carbon bg-transparent transition-colors resize-none" 
                  placeholder="¿En qué te podemos ayudar?"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="bg-carbon text-white px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors flex items-center justify-center gap-2 w-full md:w-auto shadow-md"
              >
                Enviar Mensaje por WhatsApp <FaWhatsapp size={18} />
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="flex flex-col space-y-10">
            <div>
              <h3 className="font-serif text-2xl text-carbon mb-6">Información de contacto</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-rosa-tulip/30 text-rosa-petalo rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <FaWhatsapp size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-carbon text-sm uppercase tracking-wider mb-1">WhatsApp</p>
                    <a 
                      href={getWhatsAppUrl(config.whatsapp)} 
                      onClick={(e) => {
                        e.preventDefault();
                        openWhatsAppChat(config.whatsapp);
                      }}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-gray-600 hover:text-rosa-petalo"
                    >
                      {config.telefono || '+57 320 972 8606'}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-rosa-tulip/30 text-rosa-petalo rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <FiMail size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-carbon text-sm uppercase tracking-wider mb-1">Email</p>
                    <a href={`mailto:${config.email}`} className="text-gray-600 hover:text-rosa-petalo">
                      {config.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-rosa-tulip/30 text-rosa-petalo rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <FiMapPin size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-carbon text-sm uppercase tracking-wider mb-1">Ubicación</p>
                    <p className="text-gray-600">
                      {config.direccion}<br />
                      {config.ciudad}, Colombia
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-cream">
              <h4 className="font-bold text-carbon text-sm uppercase tracking-wider mb-4">Síguenos en Redes</h4>
              <div className="flex gap-4">
                {config.instagram && (
                  <a 
                    href={formatSocialLink(config.instagram, 'https://instagram.com')} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="Instagram"
                    className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-white hover:bg-rosa-petalo hover:border-rosa-petalo transition-all"
                  >
                    <FiInstagram size={22} />
                  </a>
                )}
                {config.facebook && (
                  <a 
                    href={formatSocialLink(config.facebook, 'https://facebook.com')} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="Facebook"
                    className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-white hover:bg-rosa-petalo hover:border-rosa-petalo transition-all"
                  >
                    <FiFacebook size={22} />
                  </a>
                )}
                {config.tiktok && (
                  <a 
                    href={formatSocialLink(config.tiktok, 'https://tiktok.com/@')} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="TikTok"
                    className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-white hover:bg-rosa-petalo hover:border-rosa-petalo transition-all"
                  >
                    <SiTiktok size={20} />
                  </a>
                )}
                {config.whatsapp && (
                  <a 
                    href={getWhatsAppUrl(config.whatsapp)} 
                    onClick={(e) => {
                      e.preventDefault();
                      openWhatsAppChat(config.whatsapp);
                    }}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="WhatsApp"
                    className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-white hover:bg-[#25D366] hover:border-[#25D366] transition-all"
                  >
                    <FaWhatsapp size={22} />
                  </a>
                )}
              </div>
            </div>
            
            {/* Map Dinámico */}
            <div className="space-y-2">
              <div className="w-full h-64 bg-gray-200 rounded-lg relative overflow-hidden border border-gray-200 shadow-inner">
                <iframe 
                  src={getMapEmbedUrl()} 
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Ubicación ${config.direccion}, ${config.ciudad}`}
                ></iframe>
              </div>
              {config.mapa_url && (
                <div className="text-right">
                  <a
                    href={config.mapa_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-carbon hover:text-rosa-petalo transition-colors underline"
                  >
                    <FiMapPin size={13} className="text-rosa-petalo" /> Abrir en Google Maps ↗
                  </a>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
