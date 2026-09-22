'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Producto } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { FiHeart, FiMinus, FiPlus, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { openWhatsAppChat } from '@/lib/whatsapp';
import SizeGuide from '@/components/tienda/SizeGuide';
import { toast } from 'react-hot-toast';

export default function ProductDetailClient({ producto }: { producto: Producto }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(producto.colores?.[0]?.nombre || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`saved_${producto.id}`);
      if (saved) setIsSaved(true);
    }
  }, [producto.id]);

  const toggleSave = () => {
    if (typeof window === 'undefined') return;
    if (isSaved) {
      localStorage.removeItem(`saved_${producto.id}`);
      setIsSaved(false);
      toast.success('Eliminado de tus favoritos', {
        icon: '🤍',
        style: { borderRadius: '10px', background: '#171516', color: '#FFF9F7' },
      });
    } else {
      localStorage.setItem(`saved_${producto.id}`, 'true');
      setIsSaved(true);
      toast.success('Guardado en tus favoritos', {
        icon: '💖',
        style: { borderRadius: '10px', background: '#171516', color: '#FFF9F7' },
      });
    }
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  const { addItem, openCart } = useCartStore();

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const handleAddToCart = () => {
    if ((!producto.tallas || producto.tallas.length > 0) && !selectedSize) {
      toast.error('Por favor selecciona una talla');
      return;
    }

    const chosenColor = producto.colores?.find(c => c.nombre === selectedColor) || {
      nombre: selectedColor || 'Único',
      hex: '#E8B7C8',
    };

    addItem({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagenes?.[0] || '',
      talla: selectedSize || (producto.tallas?.length === 0 ? 'Única' : ''),
      color: chosenColor,
      cantidad: quantity,
      slug: producto.slug,
    });

    toast.success('Agregado al carrito', {
      icon: '🌸',
      style: { borderRadius: '10px', background: '#171516', color: '#FFF9F7' },
    });
    
    openCart();
  };

  const shareOnWhatsApp = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    openWhatsAppChat('', `¡Mira esto! ${producto.nombre} en FutureMe: ${url}`);
  };

  const isNew = producto.nuevo || false;
  const discount = producto.precio_anterior 
    ? Math.round(((producto.precio_anterior - producto.precio) / producto.precio_anterior) * 100) 
    : 0;

  return (
    <>
      <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
        
        {/* Left: Images */}
        <div className="md:w-1/2 flex flex-col-reverse md:flex-row gap-4 h-fit sticky top-24">
          {/* Thumbnails */}
          {producto.imagenes && producto.imagenes.length > 1 && (
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible w-full md:w-20 flex-shrink-0">
              {producto.imagenes.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-24 md:w-full md:h-28 flex-shrink-0 border-2 transition-colors ${selectedImage === idx ? 'border-carbon' : 'border-transparent'}`}
                >
                  <Image src={img} alt={`${producto.nombre} ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
          
          {/* Main Image */}
          <div className="relative w-full aspect-[3/4] bg-cream">
            {producto.imagenes && producto.imagenes.length > 0 ? (
              <Image 
                src={producto.imagenes[selectedImage]} 
                alt={producto.nombre} 
                fill 
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-4xl text-gray-300">
                🌸 <span className="text-sm mt-4 font-sans">Sin imagen</span>
              </div>
            )}
            
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {isNew && <span className="bg-rosa-tulip text-carbon text-xs font-bold px-3 py-1.5 uppercase tracking-wider">Nuevo</span>}
              {discount > 0 && <span className="bg-carbon text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider">{discount}% OFF</span>}
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="md:w-1/2 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-carbon pr-4">{producto.nombre}</h1>
            <button className="text-gray-400 hover:text-rosa-petalo pt-2">
              <FiHeart size={24} />
            </button>
          </div>
          
          <div className="flex items-center gap-3 mb-8">
            <span className="font-sans font-bold text-2xl text-carbon">{formatPrice(producto.precio)}</span>
            {producto.precio_anterior && (
              <span className="font-sans text-lg text-gray-400 line-through">
                {formatPrice(producto.precio_anterior)}
              </span>
            )}
          </div>

          {/* Colors */}
          {producto.colores && producto.colores.length > 0 && (
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-wider text-carbon mb-3">
                Color: <span className="font-normal text-gray-500 capitalize">{selectedColor}</span>
              </p>
              <div className="flex gap-3">
                {producto.colores.map((color) => (
                  <button
                    key={color.nombre}
                    onClick={() => setSelectedColor(color.nombre)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color.nombre ? 'border-carbon p-0.5' : 'border-transparent hover:border-gray-300'}`}
                    title={color.nombre}
                  >
                    <div className="w-full h-full rounded-full border border-gray-200" style={{ backgroundColor: color.hex || '#ccc' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {producto.tallas && producto.tallas.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold uppercase tracking-wider text-carbon">Talla</p>
                <button onClick={() => setIsSizeGuideOpen(true)} className="text-xs text-gray-500 underline hover:text-rosa-petalo">
                  Guía de tallas
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {producto.tallas?.map((talla) => (
                  <button
                    key={talla}
                    onClick={() => setSelectedSize(talla)}
                    className={`min-w-[3rem] h-12 px-4 border text-sm font-bold transition-colors relative ${
                      selectedSize === talla 
                        ? 'border-carbon bg-carbon text-white' 
                        : 'border-gray-300 text-carbon hover:border-carbon'
                    }`}
                  >
                    {talla}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-4 mb-10">
            <div className="flex gap-4 h-14">
              <div className="flex items-center border border-carbon w-1/3 md:w-32">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex-1 flex justify-center items-center text-gray-500 hover:text-carbon h-full">
                  <FiMinus />
                </button>
                <span className="flex-1 text-center font-bold text-carbon">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="flex-1 flex justify-center items-center text-gray-500 hover:text-carbon h-full">
                  <FiPlus />
                </button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-carbon text-white text-sm font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors"
              >
                Agregar al Carrito
              </button>

              <button
                type="button"
                onClick={toggleSave}
                className={`w-14 h-14 border border-carbon flex items-center justify-center transition-colors flex-shrink-0 ${
                  isSaved ? 'bg-rosa-tulip/30 border-rosa-petalo text-rosa-petalo' : 'hover:bg-cream text-carbon'
                }`}
                title={isSaved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                aria-label={isSaved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              >
                <FiHeart size={22} className={isSaved ? 'fill-rosa-petalo stroke-rosa-petalo' : ''} />
              </button>
            </div>
            
            <button 
              onClick={shareOnWhatsApp}
              className="w-full h-12 border border-carbon text-carbon flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider hover:bg-carbon hover:text-white transition-colors"
            >
              <FaWhatsapp size={18} /> Compartir
            </button>
          </div>

          {/* Accordions */}
          <div className="border-t border-cream divide-y divide-cream">
            {/* Description */}
            <div className="py-4">
              <button onClick={() => toggleAccordion('desc')} className="flex justify-between items-center w-full text-left font-serif text-lg text-carbon">
                Descripción
                {openAccordion === 'desc' ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              {openAccordion === 'desc' && (
                <div className="pt-4 text-sm text-gray-600 space-y-4">
                  <p>{producto.descripcion || 'Una prenda hermosa diseñada para brindarte confort y estilo.'}</p>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="py-4">
              <button onClick={() => toggleAccordion('detalles')} className="flex justify-between items-center w-full text-left font-serif text-lg text-carbon">
                Detalles y Cuidados
                {openAccordion === 'detalles' ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              {openAccordion === 'detalles' && (
                <div className="pt-4 text-sm text-gray-600">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Lavar a máquina en agua fría</li>
                    <li>No usar blanqueador</li>
                    <li>Secar a la sombra</li>
                    <li>Planchar a temperatura baja</li>
                  </ul>
                </div>
              )}
            </div>
            
            {/* Shipping */}
            <div className="py-4">
              <button onClick={() => toggleAccordion('envio')} className="flex justify-between items-center w-full text-left font-serif text-lg text-carbon">
                Envío y Devoluciones
                {openAccordion === 'envio' ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              {openAccordion === 'envio' && (
                <div className="pt-4 text-sm text-gray-600 space-y-3">
                  <p><strong>Envío Gratis:</strong> En compras superiores a $150.000.</p>
                  <p><strong>Pago Contra Entrega:</strong> Disponible en todo el país. Paga cuando recibas tu pedido.</p>
                  <p><strong>Cambios:</strong> Tienes 15 días calendario desde que recibes tu pedido para solicitar un cambio.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <SizeGuide isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </>
  );
}
