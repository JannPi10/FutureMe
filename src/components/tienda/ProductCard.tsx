'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart } from 'react-icons/fi';
import { Producto } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
  producto: Producto;
}

export default function ProductCard({ producto }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    const saved = localStorage.getItem(`saved_${producto.id}`);
    if (saved) setIsSaved(true);
  }, [producto.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleQuickAdd = (talla: string) => {
    // For quick add, we just take the first color if colors exist
    const color = producto.colores && producto.colores.length > 0 
      ? producto.colores[0] 
      : { nombre: 'Único', hex: '#E8B7C8' };
    
    addItem({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagenes?.[0] || '',
      talla,
      color,
      cantidad: 1,
      slug: producto.slug,
    });
    
    setShowSelector(false);
    toast.success('Agregado al carrito', {
      icon: '🌸',
      style: {
        borderRadius: '10px',
        background: '#171516',
        color: '#FFF9F7',
      },
    });
    openCart();
  };

  const mainImage = producto.imagenes?.[0] || '';
  const hoverImage = producto.imagenes?.[1] || mainImage;
  const isNew = producto.nuevo || false;
  const discount = producto.precio_anterior 
    ? Math.round(((producto.precio_anterior - producto.precio) / producto.precio_anterior) * 100) 
    : 0;

  return (
    <div 
      className="group flex flex-col relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowSelector(false);
      }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-cream mb-3">
        <Link href={`/productos/${producto.slug}`} className="absolute inset-0 block">
          {mainImage ? (
            <>
              <Image
                src={mainImage}
                alt={producto.nombre}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className={`object-cover transition-opacity duration-500 ${isHovered && hoverImage !== mainImage ? 'opacity-0' : 'opacity-100'}`}
              />
              {hoverImage !== mainImage && (
                <Image
                  src={hoverImage}
                  alt={`${producto.nombre} alternate`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className={`object-cover transition-opacity duration-500 absolute inset-0 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-cream text-carbon/40">
              <span className="text-4xl mb-2">🌸</span>
              <span className="text-xs text-center px-4 font-sans">{producto.nombre}</span>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isNew && (
            <span className="bg-rosa-tulip text-carbon text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
              Nuevo
            </span>
          )}
          {discount > 0 && (
            <span className="bg-carbon text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={toggleSave}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/70 hover:bg-white text-carbon transition-colors z-10"
          aria-label="Save to wishlist"
        >
          <FiHeart size={16} className={isSaved ? 'fill-rosa-petalo stroke-rosa-petalo' : ''} />
        </button>

        {/* Quick Add Overlay */}
        <div className={`absolute bottom-0 left-0 w-full bg-white/95 p-3 transition-transform duration-300 transform ${showSelector ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Selecciona Talla</span>
            <button onClick={() => setShowSelector(false)} className="text-xs">✕</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {producto.tallas?.map((talla) => (
              <button 
                key={talla}
                onClick={() => handleQuickAdd(talla)}
                className="py-1 text-xs text-center border border-carbon hover:bg-carbon hover:text-white transition-colors"
              >
                {talla}
              </button>
            ))}
            {(!producto.tallas || producto.tallas.length === 0) && (
              <button 
                onClick={() => handleQuickAdd('Única')}
                className="col-span-4 py-1 text-xs text-center border border-carbon hover:bg-carbon hover:text-white transition-colors"
              >
                Talla Única
              </button>
            )}
          </div>
        </div>

        {/* Default Add Button */}
        <button 
          onClick={() => setShowSelector(true)}
          className={`absolute bottom-0 left-0 w-full bg-carbon/90 text-white py-3 text-xs uppercase tracking-widest font-bold transition-transform duration-300 transform ${isHovered && !showSelector ? 'translate-y-0' : 'translate-y-full'}`}
        >
          Agregar
        </button>
      </div>

      <div className="flex flex-col">
        {/* Colors */}
        {producto.colores && producto.colores.length > 0 && (
          <div className="flex gap-1 mb-2">
            {producto.colores.map((color, idx) => (
              <div 
                key={idx} 
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: color.hex || '#ccc' }}
                title={color.nombre}
              />
            ))}
          </div>
        )}

        <Link href={`/productos/${producto.slug}`} className="group-hover:text-rosa-petalo transition-colors">
          <h3 className="font-serif text-lg text-carbon line-clamp-1">{producto.nombre}</h3>
        </Link>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="font-sans font-bold text-sm text-carbon">{formatPrice(producto.precio)}</span>
          {producto.precio_anterior && (
            <span className="font-sans text-xs text-gray-400 line-through">
              {formatPrice(producto.precio_anterior)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
