'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { DEPARTAMENTOS_COLOMBIA, getMunicipiosPorDepartamento } from '@/lib/colombia';
import { FiX, FiCheck, FiTruck, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { openWhatsAppChat, getWhatsAppUrl } from '@/lib/whatsapp';
import { toast } from 'react-hot-toast';

const contactSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre completo es obligatorio' }),
  telefono: z.string().min(7, { message: 'El teléfono debe tener al menos 7 dígitos' }),
  email: z.string().min(1, { message: 'El correo electrónico es obligatorio' }).email({ message: 'Ingresa un correo electrónico válido' }),
  cedula: z.string().min(5, { message: 'La cédula o documento de identidad es obligatorio' })
});

const shippingSchema = z.object({
  direccion: z.string().min(5, { message: 'La dirección completa es obligatoria' }),
  departamento: z.string().min(1, { message: 'Selecciona un departamento' }),
  ciudad: z.string().min(1, { message: 'Selecciona un municipio' }),
  codigo_postal: z.string().optional(),
  notas: z.string().optional()
});

type ContactFormData = z.infer<typeof contactSchema>;
type ShippingFormData = z.infer<typeof shippingSchema>;

export default function CheckoutModal() {
  const { 
    isCheckoutOpen, 
    closeCheckout, 
    items, 
    getTotal, 
    clearCart 
  } = useCartStore();

  const [step, setStep] = useState(1);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  // Form states
  const [contactData, setContactData] = useState<ContactFormData | null>(null);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);

  const contactForm = useRHForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { nombre: '', telefono: '+57', email: '', cedula: '' }
  });

  const shippingForm = useRHForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { direccion: '', ciudad: '', departamento: '', codigo_postal: '', notas: '' }
  });

  const selectedDepartamento = shippingForm.watch('departamento');
  const municipiosDisponibles = selectedDepartamento ? getMunicipiosPorDepartamento(selectedDepartamento) : [];

  // Reset ciudad if selected departamento changes and current ciudad is not in list
  useEffect(() => {
    if (selectedDepartamento) {
      const currentCiudad = shippingForm.getValues('ciudad');
      const municipios = getMunicipiosPorDepartamento(selectedDepartamento);
      if (currentCiudad && !municipios.includes(currentCiudad)) {
        shippingForm.setValue('ciudad', '');
      }
    }
  }, [selectedDepartamento, shippingForm]);

  if (!isCheckoutOpen) return null;

  const subtotal = getTotal();
  const envio = (subtotal - discountAmount) >= 150000 ? 0 : 15000;
  const total = subtotal - discountAmount + envio;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setIsApplyingDiscount(true);
    setDiscountError('');
    
    try {
      const res = await fetch('/api/descuentos/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: discountCode, subtotal })
      });
      const data = await res.json();
      
      if (res.ok && data.valido) {
        setDiscountAmount(data.descuento);
        toast.success('¡Descuento aplicado!');
      } else {
        setDiscountError(data.mensaje || 'Código no válido');
        setDiscountAmount(0);
      }
    } catch (error) {
      setDiscountError('Error al validar código');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const onSubmitContact = (data: ContactFormData) => {
    setContactData(data);
    setStep(3);
  };

  const onSubmitShipping = (data: ShippingFormData) => {
    setShippingData(data);
    setStep(4);
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    try {
      // API call to create order with flat and nested properties
      const orderPayload = {
        items,
        cliente_nombre: contactData?.nombre,
        cliente_telefono: contactData?.telefono,
        cliente_email: contactData?.email,
        cliente_cedula: contactData?.cedula,
        direccion: shippingData?.direccion,
        ciudad: shippingData?.ciudad,
        departamento: shippingData?.departamento,
        codigo_postal: shippingData?.codigo_postal || null,
        notas: shippingData?.notas || null,
        subtotal,
        descuento_monto: discountAmount,
        costo_envio: envio,
        total,
        descuento_codigo: discountAmount > 0 ? discountCode : null,
        metodo_pago: 'contra_entrega',
        contacto: contactData,
        envio: shippingData
      };

      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      
      const data = await res.json();
      if (res.ok && data.numero_pedido) {
        setOrderNumber(data.numero_pedido);
        setStep(5); // Success step
      } else {
        toast.error(data.error || 'Hubo un error al procesar tu pedido');
      }
    } catch (error) {
      toast.error('Error de red al procesar el pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    clearCart();
    closeCheckout();
    setStep(1);
    setDiscountAmount(0);
    setDiscountCode('');
    setContactData(null);
    setShippingData(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-carbon/80 backdrop-blur-sm p-0 md:p-6">
      <div className="bg-tulip-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl md:rounded-lg shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-white border-b border-cream p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="font-serif text-xl md:text-2xl font-bold">FutureMe</div>
          {step < 5 && (
            <button onClick={closeCheckout} className="text-gray-500 hover:text-carbon p-1">
              <FiX size={24} />
            </button>
          )}
        </div>

        {/* Progress Bar (Steps 1-4) */}
        {step < 5 && (
          <div className="bg-cream/30 py-3 px-4 border-b border-cream">
            <div className="flex justify-between items-center max-w-lg mx-auto">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex flex-col items-center flex-1 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                    step === s ? 'bg-carbon text-white' : step > s ? 'bg-verde-salvia text-white' : 'bg-white text-gray-400 border border-gray-300'
                  }`}>
                    {step > s ? <FiCheck size={12} /> : s}
                  </div>
                  {s < 4 && (
                    <div className={`absolute top-3 left-1/2 w-full h-0.5 ${step > s ? 'bg-verde-salvia' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between max-w-lg mx-auto mt-2 text-[10px] text-gray-500 uppercase tracking-widest text-center px-2">
              <span className={step >= 1 ? 'text-carbon font-bold' : ''}>Resumen</span>
              <span className={step >= 2 ? 'text-carbon font-bold' : ''}>Contacto</span>
              <span className={step >= 3 ? 'text-carbon font-bold' : ''}>Envío</span>
              <span className={step >= 4 ? 'text-carbon font-bold' : ''}>Pago</span>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-tulip-white">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Resumen */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} key="step1">
                <h2 className="font-serif text-2xl mb-6 text-carbon">Resumen del pedido</h2>
                
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <ul className="space-y-4 divide-y divide-cream">
                      {items.map(item => (
                        <li key={`${item.productoId}-${item.talla}-${typeof item.color === 'string' ? item.color : item.color?.nombre}`} className="pt-4 first:pt-0 flex gap-4">
                          <div className="relative w-16 h-20 bg-cream rounded overflow-hidden">
                            {item.imagen ? (
                              <Image src={item.imagen} alt={item.nombre} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">🌸</div>
                            )}
                            <span className="absolute -top-2 -right-2 bg-carbon text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center z-10 border border-white">
                              {item.cantidad}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-serif text-base text-carbon">{item.nombre}</h4>
                            <p className="text-xs text-gray-500 mt-1">{item.talla && `Talla: ${item.talla}`} {item.color && `| Color: ${typeof item.color === 'string' ? item.color : item.color?.nombre}`}</p>
                          </div>
                          <div className="font-bold text-sm">{formatPrice(item.precio * item.cantidad)}</div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="md:w-1/3 bg-white p-6 border border-cream rounded shadow-sm self-start">
                    <div className="mb-6 flex gap-2">
                      <input 
                        id="checkout-discount-code"
                        name="discount_code"
                        type="text" 
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="Código de descuento" 
                        className="flex-1 border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-carbon uppercase"
                      />
                      <button 
                        onClick={handleApplyDiscount}
                        disabled={isApplyingDiscount || !discountCode}
                        className="bg-gray-200 text-carbon px-4 py-2 text-sm font-bold uppercase disabled:opacity-50 hover:bg-gray-300"
                      >
                        Aplicar
                      </button>
                    </div>
                    {discountError && <p className="text-red-500 text-xs mb-4">{discountError}</p>}
                    {discountAmount > 0 && <p className="text-verde-salvia text-xs mb-4">¡Descuento aplicado!</p>}

                    <div className="space-y-3 text-sm border-b border-cream pb-4 mb-4">
                      <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-rosa-petalo font-bold"><span>Descuento</span><span>-{formatPrice(discountAmount)}</span></div>
                      )}
                      <div className="flex justify-between"><span className="text-gray-500">Envío</span><span>{envio === 0 ? 'Gratis' : formatPrice(envio)}</span></div>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-carbon mb-6">
                      <span>Total</span><span>{formatPrice(total)}</span>
                    </div>

                    <button 
                      onClick={() => setStep(2)}
                      className="w-full bg-carbon text-white py-4 text-sm font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Contacto */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} key="step2" className="max-w-xl mx-auto">
                <h2 className="font-serif text-2xl mb-6 text-carbon">Información de contacto</h2>
                
                <form onSubmit={contactForm.handleSubmit(onSubmitContact)} className="space-y-4">
                  <div>
                    <label htmlFor="contact-nombre" className="block text-xs font-bold uppercase text-gray-700 mb-1">Nombre completo *</label>
                    <input id="contact-nombre" {...contactForm.register('nombre')} className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-carbon" placeholder="Tu nombre y apellido" />
                    {contactForm.formState.errors.nombre && <p className="text-red-500 text-xs mt-1">{contactForm.formState.errors.nombre.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="contact-telefono" className="block text-xs font-bold uppercase text-gray-700 mb-1">Teléfono (WhatsApp) *</label>
                    <input id="contact-telefono" {...contactForm.register('telefono')} className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-carbon" placeholder="+57 300 000 0000" />
                    {contactForm.formState.errors.telefono && <p className="text-red-500 text-xs mt-1">{contactForm.formState.errors.telefono.message}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-bold uppercase text-gray-700 mb-1">Correo electrónico *</label>
                      <input id="contact-email" {...contactForm.register('email')} type="email" className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-carbon" placeholder="tu@email.com" />
                      {contactForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{contactForm.formState.errors.email.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="contact-cedula" className="block text-xs font-bold uppercase text-gray-700 mb-1">Cédula de ciudadanía / Documento *</label>
                      <input id="contact-cedula" {...contactForm.register('cedula')} className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-carbon" placeholder="Número de documento" />
                      {contactForm.formState.errors.cedula && <p className="text-red-500 text-xs mt-1">{contactForm.formState.errors.cedula.message}</p>}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8 pt-4 border-t border-cream">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 text-sm font-bold uppercase tracking-wider text-carbon border border-gray-300 hover:bg-gray-50 transition-colors">
                      Volver
                    </button>
                    <button type="submit" className="flex-1 bg-carbon text-white py-4 text-sm font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors">
                      Continuar
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 3: Envío */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} key="step3" className="max-w-xl mx-auto">
                <h2 className="font-serif text-2xl mb-6 text-carbon flex items-center gap-2">
                  <FiTruck /> Dirección de envío
                </h2>
                
                <form onSubmit={shippingForm.handleSubmit(onSubmitShipping)} className="space-y-4">
                  <div>
                    <label htmlFor="shipping-direccion" className="block text-xs font-bold uppercase text-gray-700 mb-1">Dirección completa *</label>
                    <input id="shipping-direccion" {...shippingForm.register('direccion')} className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-carbon" placeholder="Calle, Carrera, Número, Apto, Barrio" />
                    {shippingForm.formState.errors.direccion && <p className="text-red-500 text-xs mt-1">{shippingForm.formState.errors.direccion.message}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="shipping-departamento" className="block text-xs font-bold uppercase text-gray-700 mb-1">Departamento *</label>
                      <select id="shipping-departamento" {...shippingForm.register('departamento')} className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-carbon bg-white">
                        <option value="">Selecciona un departamento...</option>
                        {DEPARTAMENTOS_COLOMBIA.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                      </select>
                      {shippingForm.formState.errors.departamento && <p className="text-red-500 text-xs mt-1">{shippingForm.formState.errors.departamento.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="shipping-ciudad" className="block text-xs font-bold uppercase text-gray-700 mb-1">Ciudad / Municipio *</label>
                      <select 
                        id="shipping-ciudad" 
                        {...shippingForm.register('ciudad')} 
                        disabled={!selectedDepartamento}
                        className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-carbon bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {selectedDepartamento ? 'Selecciona tu municipio...' : 'Primero elige departamento'}
                        </option>
                        {municipiosDisponibles.map(mun => (
                          <option key={mun} value={mun}>{mun}</option>
                        ))}
                      </select>
                      {shippingForm.formState.errors.ciudad && <p className="text-red-500 text-xs mt-1">{shippingForm.formState.errors.ciudad.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="shipping-notas" className="block text-xs font-bold uppercase text-gray-700 mb-1">Notas / Instrucciones de entrega</label>
                    <textarea id="shipping-notas" {...shippingForm.register('notas')} rows={3} className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-carbon" placeholder="Dejar en portería, casa esquinera, etc." />
                  </div>

                  <div className="flex gap-4 mt-8 pt-4 border-t border-cream">
                    <button type="button" onClick={() => setStep(2)} className="flex-1 py-4 text-sm font-bold uppercase tracking-wider text-carbon border border-gray-300 hover:bg-gray-50 transition-colors">
                      Volver
                    </button>
                    <button type="submit" className="flex-1 bg-carbon text-white py-4 text-sm font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors">
                      Continuar
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 4: Confirmación y Pago */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} key="step4" className="max-w-2xl mx-auto">
                <h2 className="font-serif text-2xl mb-6 text-carbon">Confirmar Pedido</h2>
                
                <div className="bg-rosa-tulip/20 border border-rosa-tulip/30 p-6 rounded mb-6 flex gap-4 items-start">
                  <FiCreditCard className="text-rosa-petalo text-3xl flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-serif text-xl text-carbon mb-1">💳 Pago Contra Entrega</h3>
                    <p className="text-sm text-gray-700">Pagarás en efectivo cuando recibas tu pedido en la puerta de tu casa. No necesitas tarjeta de crédito.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white p-5 border border-cream rounded shadow-sm text-sm">
                    <h4 className="font-bold uppercase text-xs text-gray-500 mb-3 border-b border-cream pb-2">Envío y Contacto</h4>
                    <p className="font-bold text-carbon">{contactData?.nombre}</p>
                    <p className="text-gray-600">C.C.: {contactData?.cedula}</p>
                    <p className="text-gray-600">{shippingData?.direccion}</p>
                    <p className="text-gray-600">{shippingData?.ciudad}, {shippingData?.departamento}</p>
                    <p className="text-gray-600 mt-2">📞 {contactData?.telefono}</p>
                    <p className="text-gray-600">✉️ {contactData?.email}</p>
                  </div>
                  
                  <div className="bg-white p-5 border border-cream rounded shadow-sm text-sm">
                    <h4 className="font-bold uppercase text-xs text-gray-500 mb-3 border-b border-cream pb-2">Resumen de Totales</h4>
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-rosa-petalo"><span>Descuento</span><span>-{formatPrice(discountAmount)}</span></div>
                      )}
                      <div className="flex justify-between"><span className="text-gray-600">Envío</span><span>{envio === 0 ? 'Gratis' : formatPrice(envio)}</span></div>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-carbon border-t border-cream pt-2">
                      <span>Total a pagar</span><span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-4 border-t border-cream">
                  <button type="button" onClick={() => setStep(3)} disabled={isSubmitting} className="flex-1 py-4 text-sm font-bold uppercase tracking-wider text-carbon border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50">
                    Volver
                  </button>
                  <button 
                    onClick={handleConfirmOrder} 
                    disabled={isSubmitting}
                    className="flex-[2] bg-carbon text-white py-4 text-sm font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? (
                      <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> Procesando...</>
                    ) : (
                      'Confirmar Pedido'
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Éxito */}
            {step === 5 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-12 px-4">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 bg-verde-salvia text-white rounded-full flex items-center justify-center mb-6 shadow-lg"
                >
                  <FiCheckCircle size={48} />
                </motion.div>
                
                <h2 className="font-serif text-4xl text-carbon mb-2">¡Pedido Confirmado!</h2>
                <p className="text-gray-600 mb-6 font-sans">Gracias por tu compra en FutureMe.</p>
                
                <div className="bg-cream/50 border border-cream px-8 py-4 rounded mb-8">
                  <p className="text-xs uppercase text-gray-500 font-bold mb-1">Número de pedido</p>
                  <p className="font-serif text-2xl font-bold tracking-wider text-carbon">{orderNumber}</p>
                </div>

                <p className="text-sm text-carbon max-w-md mb-8">
                  Hemos registrado tu pedido exitosamente. <strong>Recuerda que pagarás en efectivo cuando lo recibas.</strong> Prepararemos tus prendas con mucho amor 🌸.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <a 
                    href={getWhatsAppUrl('573209728606', `¡Hola! Acabo de hacer el pedido #${orderNumber} en FutureMe Boutique.`)}
                    onClick={(e) => {
                      e.preventDefault();
                      openWhatsAppChat('573209728606', `¡Hola! Acabo de hacer el pedido #${orderNumber} en FutureMe Boutique.`);
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#25D366] text-white py-4 px-4 rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaWhatsapp size={20} /> Consultar por WhatsApp
                  </a>
                  <button 
                    onClick={handleFinish}
                    className="flex-1 bg-carbon text-white py-4 px-4 rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors"
                  >
                    Seguir Comprando
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
