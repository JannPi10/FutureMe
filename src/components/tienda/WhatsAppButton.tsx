'use client';

import { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { openWhatsAppChat } from '@/lib/whatsapp';

export default function WhatsAppButton() {
  const [phoneNumber, setPhoneNumber] = useState(process.env.NEXT_PUBLIC_WHATSAPP || '573209728606');

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/configuracion');
        if (res.ok) {
          const data = await res.json();
          if (data.whatsapp || data.whatsapp_numero) {
            setPhoneNumber((data.whatsapp || data.whatsapp_numero).replace(/\D/g, ''));
          }
        }
      } catch (error) {
        console.error('Error fetching whatsapp config:', error);
      }
    }
    fetchConfig();
  }, []);

  const handleClick = () => {
    openWhatsAppChat(
      phoneNumber || '573209728606',
      '¡Hola! Me gustaría recibir información sobre las prendas de FutureMe Boutique 🌸'
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end group">
      {/* Tooltip */}
      <div className="mb-2 px-3 py-1.5 bg-white text-carbon text-xs font-bold rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
        Chatea con nosotros
      </div>
      
      {/* Button with Pulse Effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-75"></div>
        <button
          onClick={handleClick}
          className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 hover:bg-green-500 transition-all duration-300 focus:outline-none"
          aria-label="WhatsApp"
        >
          <FaWhatsapp size={28} />
        </button>
      </div>
    </div>
  );
}
