'use client';

import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { FiX, FiShoppingBag, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
  const { 
    isOpen, 
    closeCart, 
    items, 
    removeItem, 
    updateQuantity, 
    openCheckout,
    getTotal
  } = useCartStore();

  const total = getTotal();
  const FREE_SHIPPING_THRESHOLD = 150000;
  const progressToFreeShipping = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - total;

  const handleProceedToCheckout = () => {
    closeCart();
    openCheckout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-carbon/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-tulip-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-cream">
              <h2 className="font-serif text-2xl text-carbon flex items-center gap-2">
                Mi Carrito
                <span className="bg-cream text-carbon text-xs font-sans w-6 h-6 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              </h2>
              <button
                onClick={closeCart}
                className="text-carbon hover:text-rosa-petalo transition-colors p-2"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Free Shipping Bar */}
            {items.length > 0 && (
              <div className="bg-cream/50 p-4 border-b border-cream">
                <p className="text-xs text-center mb-2 font-medium">
                  {amountToFreeShipping > 0 ? (
                    <>Te faltan <strong className="text-rosa-petalo">{formatPrice(amountToFreeShipping)}</strong> para envío gratis 🌸</>
                  ) : (
                    <strong className="text-verde-salvia">¡Felicidades! Tienes envío gratis 🎉</strong>
                  )}
                </p>
                <div className="w-full bg-white h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${amountToFreeShipping <= 0 ? 'bg-verde-salvia' : 'bg-rosa-petalo'}`}
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center text-rosa-petalo mb-4">
                    <FiShoppingBag size={32} />
                  </div>
                  <h3 className="font-serif text-2xl text-carbon">Tu carrito está vacío</h3>
                  <p className="text-sm text-gray-500">¿No sabes qué comprar? Revisa nuestras novedades.</p>
                  <button
                    onClick={closeCart}
                    className="mt-4 bg-carbon text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors"
                  >
                    Seguir Comprando
                  </button>
                </div>
              ) : (
                <ul className="space-y-6">
                  {items.map((item) => {
                    const colorName = typeof item.color === 'string' ? item.color : item.color?.nombre || '';
                    const itemKey = `${item.productoId}-${item.talla}-${colorName}`;

                    return (
                      <li key={itemKey} className="flex gap-4">
                        {/* Image */}
                        <div className="relative w-20 h-24 md:w-24 md:h-32 bg-cream flex-shrink-0">
                          {item.imagen ? (
                            <Image
                              src={item.imagen}
                              alt={item.nombre}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="font-serif text-base text-carbon pr-4">{item.nombre}</h4>
                              <button
                                onClick={() => removeItem(item.productoId, item.talla, colorName)}
                                className="text-gray-400 hover:text-rosa-petalo p-1"
                                aria-label="Eliminar producto"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                            
                            <div className="text-xs text-gray-500 mt-1 space-y-1">
                              {item.talla && <p>Talla: {item.talla}</p>}
                              {colorName && <p>Color: {colorName}</p>}
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-4">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-gray-200">
                              <button
                                onClick={() => {
                                  if (item.cantidad <= 1) {
                                    removeItem(item.productoId, item.talla, colorName);
                                  } else {
                                    updateQuantity(item.productoId, item.talla, colorName, item.cantidad - 1);
                                  }
                                }}
                                className="px-2 py-1 text-gray-500 hover:text-carbon"
                                aria-label="Disminuir cantidad"
                              >
                                <FiMinus size={14} />
                              </button>
                              <span className="px-2 py-1 text-sm text-carbon w-8 text-center">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productoId, item.talla, colorName, item.cantidad + 1)}
                                className="px-2 py-1 text-gray-500 hover:text-carbon"
                                aria-label="Aumentar cantidad"
                              >
                                <FiPlus size={14} />
                              </button>
                            </div>
                            
                            <div className="font-bold text-sm text-carbon">
                              {formatPrice(item.precio * item.cantidad)}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-cream p-4 md:p-6 bg-white space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">{formatPrice(total)}</span>
                </div>
                
                <p className="text-xs text-gray-500 text-center">
                  El envío y los impuestos se calculan al finalizar la compra.
                </p>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-carbon text-white py-4 text-sm font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors"
                >
                  Proceder al Pago
                </button>
                
                <button
                  onClick={closeCart}
                  className="w-full text-center text-xs font-bold uppercase tracking-widest text-carbon hover:text-rosa-petalo transition-colors py-2"
                >
                  Continuar Comprando
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
