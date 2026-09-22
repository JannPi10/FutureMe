'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiPrinter, FiMessageCircle, FiArrowLeft, FiTrash2, FiSave } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { openWhatsAppChat, getWhatsAppUrl } from '@/lib/whatsapp';

export default function PedidoDetallePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [pedido, setPedido] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState('');
  const [notas, setNotas] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/pedidos/${params.id}`)
      .then(res => res.json())
      .then(data => {
        const p = data?.data || data;
        setPedido(p);
        setEstado(p?.estado || 'pendiente');
        setNotas(p?.notas || '');
      })
      .catch(() => toast.error('Error al cargar pedido'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/pedidos/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, notas })
      });
      if (res.ok) {
        toast.success('Pedido actualizado con éxito');
        setPedido((prev: any) => ({ ...prev, estado, notas }));
      } else {
        toast.error('Error al actualizar pedido');
      }
    } catch (e) {
      toast.error('Error de red');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`¿Estás seguro de eliminar permanentemente el pedido #${pedido?.numero_pedido}? Esta acción no se puede deshacer.`)) {
      try {
        const res = await fetch(`/api/pedidos/${params.id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Pedido eliminado exitosamente');
          router.push('/admin/pedidos');
        } else {
          toast.error('Error al eliminar pedido');
        }
      } catch {
        toast.error('Error de red al eliminar');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-carbon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Pedido no encontrado</p>
        <Link href="/admin/pedidos" className="text-blue-600 hover:underline">Volver a pedidos</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pedidos"
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            title="Volver a lista de pedidos"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-sans">Pedido #{pedido.numero_pedido}</h2>
            <p className="text-xs text-gray-500">{new Date(pedido.created_at).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => window.print()} 
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiPrinter className="mr-1.5" size={15} /> Imprimir
          </button>
          
          {pedido.cliente_telefono && (
            <a 
              href={getWhatsAppUrl(pedido.cliente_telefono, `¡Hola ${pedido.cliente_nombre}! Nos comunicamos de FutureMe Boutique respecto a tu pedido #${pedido.numero_pedido}.`)} 
              onClick={(e) => {
                e.preventDefault();
                openWhatsAppChat(pedido.cliente_telefono, `¡Hola ${pedido.cliente_nombre}! Nos comunicamos de FutureMe Boutique respecto a tu pedido #${pedido.numero_pedido}.`);
              }}
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-xs font-semibold rounded-lg text-white bg-[#25D366] hover:bg-green-600"
            >
              <FiMessageCircle className="mr-1.5" size={15} /> WhatsApp
            </a>
          )}

          <button
            onClick={handleDelete}
            className="inline-flex items-center px-3 py-2 border border-red-200 text-xs font-semibold rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            title="Eliminar pedido"
          >
            <FiTrash2 className="mr-1.5" size={15} /> Eliminar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 border-b pb-3 mb-4">Artículos del Pedido</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-2">Producto</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase pb-2">Cant.</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase pb-2">Precio</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase pb-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pedido.items?.map((item: any, i: number) => {
                    const colorDisplay = typeof item.color === 'string'
                      ? item.color
                      : (item.color?.nombre || '');
                    return (
                      <tr key={i}>
                        <td className="py-3 text-sm">
                          <div className="font-medium text-gray-900">{item.nombre}</div>
                          <div className="text-gray-500 text-xs flex items-center gap-2 mt-0.5">
                            {item.talla && <span>Talla: <strong>{item.talla}</strong></span>}
                            {colorDisplay && (
                              <span className="flex items-center gap-1">
                                | Color: <strong>{colorDisplay}</strong>
                                {item.color?.hex && (
                                  <span 
                                    className="inline-block w-3 h-3 rounded-full border border-gray-300" 
                                    style={{ backgroundColor: item.color.hex }} 
                                  />
                                )}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-sm text-center font-medium">{item.cantidad}</td>
                        <td className="py-3 text-sm text-right text-gray-600">${Number(item.precio || 0).toLocaleString()}</td>
                        <td className="py-3 text-sm text-right font-bold text-gray-900">${(Number(item.precio || 0) * Number(item.cantidad || 1)).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t mt-4 pt-4 space-y-2 text-right">
              <div className="text-sm text-gray-500">Subtotal: <span className="font-medium text-gray-800">${Number(pedido.subtotal || 0).toLocaleString()}</span></div>
              {(Number(pedido.descuento_monto) > 0 || Number(pedido.descuento) > 0) && (
                <div className="text-sm text-rosa-petalo font-semibold">
                  Descuento {pedido.descuento_codigo ? `(${pedido.descuento_codigo})` : ''}: -${Number(pedido.descuento_monto || pedido.descuento || 0).toLocaleString()}
                </div>
              )}
              <div className="text-sm text-gray-500">
                Envío: <span className="font-medium text-gray-800">{Number(pedido.costo_envio) === 0 ? 'Gratis' : `$${Number(pedido.costo_envio || 0).toLocaleString()}`}</span>
              </div>
              <div className="text-lg font-bold text-gray-900 border-t pt-2">Total: ${Number(pedido.total || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Estado del Pedido y Guardar */}
          <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 border-b pb-3 mb-4">Gestión del Pedido</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Estado actual</label>
                <select 
                  value={estado} 
                  onChange={e => setEstado(e.target.value)} 
                  className="w-full border-gray-300 rounded-lg text-sm border p-2.5 focus:ring-2 focus:ring-rosa-tulip outline-none bg-white font-medium"
                >
                  <option value="pendiente">🟡 Pendiente</option>
                  <option value="confirmado">🔵 Confirmado</option>
                  <option value="en_preparacion">🟣 En Preparación</option>
                  <option value="enviado">🚚 Enviado</option>
                  <option value="entregado">🟢 Entregado</option>
                  <option value="cancelado">🔴 Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Notas del pedido / entrega</label>
                <textarea
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  rows={3}
                  className="w-full border-gray-300 rounded-lg text-sm border p-2.5 focus:ring-2 focus:ring-rosa-tulip outline-none"
                  placeholder="Instrucciones especiales o seguimiento de entrega..."
                />
              </div>

              <button 
                onClick={handleSaveChanges} 
                disabled={isSaving}
                className="w-full bg-carbon text-white py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FiSave size={15} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 border-b pb-3 mb-4">Cliente</h3>
            <div className="text-sm space-y-2 text-gray-700">
              <p><strong>Nombre:</strong> {pedido.cliente_nombre}</p>
              <p><strong>Cédula:</strong> {pedido.cliente_cedula || '-'}</p>
              <p><strong>Teléfono:</strong> {pedido.cliente_telefono}</p>
              <p><strong>Email:</strong> {pedido.cliente_email || '-'}</p>
            </div>
          </div>

          {/* Información de Envío */}
          <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 border-b pb-3 mb-4">Dirección de Entrega</h3>
            <div className="text-sm space-y-2 text-gray-700">
              <p><strong>Dirección:</strong> {pedido.direccion}</p>
              <p><strong>Ciudad / Municipio:</strong> {pedido.ciudad}</p>
              <p><strong>Departamento:</strong> {pedido.departamento}</p>
              {pedido.codigo_postal && <p><strong>Código Postal:</strong> {pedido.codigo_postal}</p>}
              <p className="pt-2 text-xs text-green-700 font-semibold bg-green-50 p-2 rounded">
                💵 Método de pago: Contra Entrega en efectivo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
