'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiImage, FiTrash2, FiUploadCloud } from 'react-icons/fi';

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/configuracion', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(() => toast.error('Error al cargar configuración'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSave = async (keys: string[]) => {
    const payload: Record<string, string> = {};
    keys.forEach(k => payload[k] = config[k] || '');
    
    const tid = toast.loading('Guardando cambios en vivo...');
    try {
      const res = await fetch('/api/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success('¡Configuración guardada y actualizada en vivo!', { id: tid });
      } else {
        toast.error('Error al guardar configuración', { id: tid });
      }
    } catch (e) {
      toast.error('Error de red al guardar', { id: tid });
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-900 font-sans">Configuración de la Tienda</h2>

      {/* Redes Sociales */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium border-b pb-2 mb-4">Redes Sociales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['whatsapp', 'instagram', 'facebook', 'tiktok'].map(k => (
            <div key={k}>
              <label className="block text-sm font-medium capitalize">{k}</label>
              <input type="text" value={config[k] || ''} onChange={e => handleChange(k, e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={() => handleSave(['whatsapp', 'instagram', 'facebook', 'tiktok'])} className="bg-carbon text-white px-4 py-2 rounded-md text-sm">Guardar Redes</button>
        </div>
      </div>

      {/* Contacto */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium border-b pb-2 mb-4">Contacto & Ubicación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['email', 'telefono', 'direccion', 'ciudad'].map(k => (
            <div key={k}>
              <label className="block text-sm font-medium capitalize">{k}</label>
              <input type="text" value={config[k] || ''} onChange={e => handleChange(k, e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">URL del Mapa (Google Maps iframe src)</label>
            <textarea value={config.mapa_url || ''} onChange={e => handleChange('mapa_url', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows={3}></textarea>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={() => handleSave(['email', 'telefono', 'direccion', 'ciudad', 'mapa_url'])} className="bg-carbon text-white px-4 py-2 rounded-md text-sm">Guardar Contacto</button>
        </div>
      </div>

      {/* Envío */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium border-b pb-2 mb-4">Opciones de Envío & Banners</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium">Mensaje Banner Superior (Top Bar)</label>
            <input type="text" value={config.banner_envio || ''} onChange={e => handleChange('banner_envio', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Costo de Envío Fijo ($)</label>
              <input type="number" value={config.costo_envio || ''} onChange={e => handleChange('costo_envio', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Envío Gratis Desde ($)</label>
              <input type="number" value={config.envio_gratis_desde || ''} onChange={e => handleChange('envio_gratis_desde', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={() => handleSave(['banner_envio', 'costo_envio', 'envio_gratis_desde'])} className="bg-carbon text-white px-4 py-2 rounded-md text-sm">Guardar Opciones</button>
        </div>
      </div>

      {/* Fotos de Portada para Categorías */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium border-b pb-2 mb-2 font-serif">Fotos de Categorías en Portada</h3>
        <p className="text-xs text-gray-500 mb-6">
          Personaliza las fotos de fondo que aparecen en las 4 cartas de la portada (Mujer, Hombre, Infantil, Accesorios).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'cat_img_mujer', label: '🌸 Mujer', defaultName: 'Mujer' },
            { id: 'cat_img_hombre', label: '👔 Hombre', defaultName: 'Hombre' },
            { id: 'cat_img_infantil', label: '🧸 Infantil', defaultName: 'Infantil' },
            { id: 'cat_img_accesorios', label: '👜 Accesorios', defaultName: 'Accesorios' },
          ].map(cat => (
            <div key={cat.id} className="border border-gray-200 rounded-xl p-3 flex flex-col justify-between bg-gray-50/50">
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-carbon mb-2">{cat.label}</p>
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 border border-gray-200 mb-3 flex items-center justify-center">
                  {config[cat.id] ? (
                    <img src={config[cat.id]} alt={cat.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-3 text-gray-400">
                      <FiImage size={28} className="mx-auto mb-1 opacity-50 text-gray-400" />
                      <span className="text-[11px] block">Color por defecto</span>
                    </div>
                  )}
                  {config[cat.id] && (
                    <button
                      type="button"
                      onClick={() => handleChange(cat.id, '')}
                      className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full text-xs shadow hover:bg-red-700 transition-colors"
                      title="Quitar foto"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <input
                  type="file"
                  id={`file-${cat.id}`}
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const tid = toast.loading(`Subiendo foto para ${cat.defaultName}...`);
                    const fd = new FormData();
                    fd.append('file', file);
                    try {
                      const res = await fetch('/api/upload', { method: 'POST', body: fd });
                      if (res.ok) {
                        const json = await res.json();
                        handleChange(cat.id, json.url);
                        toast.success(`Foto de ${cat.defaultName} lista para guardar`, { id: tid });
                      } else {
                        toast.error('Error al subir la imagen', { id: tid });
                      }
                    } catch {
                      toast.error('Error de red al subir', { id: tid });
                    }
                  }}
                />
                <label
                  htmlFor={`file-${cat.id}`}
                  className="w-full text-center block cursor-pointer px-3 py-2 bg-white border border-gray-300 hover:border-carbon text-carbon rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                >
                  {config[cat.id] ? 'Cambiar Foto' : 'Elegir Foto'}
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={() => handleSave(['cat_img_mujer', 'cat_img_hombre', 'cat_img_infantil', 'cat_img_accesorios'])} 
            className="bg-carbon text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors shadow-xs"
          >
            Guardar Fotos de Categorías
          </button>
        </div>
      </div>

      {/* Fotos de Instagram en Portada */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium border-b pb-2 mb-2 font-serif">Mosaico de Fotos de Instagram (Portada)</h3>
        <p className="text-xs text-gray-500 mb-6">
          Sube o cambia las 4 fotos que aparecen en la sección "Síguenos en Instagram" de la página de inicio. Al hacer clic, llevarán a tus clientes directo a tu perfil de Instagram.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { id: 'ig_img_1', label: 'Foto 1' },
            { id: 'ig_img_2', label: 'Foto 2' },
            { id: 'ig_img_3', label: 'Foto 3' },
            { id: 'ig_img_4', label: 'Foto 4' },
          ].map(item => (
            <div key={item.id} className="border border-gray-200 rounded-xl p-3 flex flex-col justify-between bg-gray-50/50">
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-carbon mb-2">{item.label}</p>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 border border-gray-200 mb-3 flex items-center justify-center">
                  {config[item.id] ? (
                    <img src={config[item.id]} alt={item.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2 text-gray-400">
                      <FiImage size={24} className="mx-auto mb-1 opacity-50 text-gray-400" />
                      <span className="text-[10px] block leading-tight">Automático de tienda</span>
                    </div>
                  )}
                  {config[item.id] && (
                    <button
                      type="button"
                      onClick={() => handleChange(item.id, '')}
                      className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full text-xs shadow hover:bg-red-700 transition-colors"
                      title="Quitar foto"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <input
                  type="file"
                  id={`file-${item.id}`}
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const tid = toast.loading(`Subiendo ${item.label}...`);
                    const fd = new FormData();
                    fd.append('file', file);
                    try {
                      const res = await fetch('/api/upload', { method: 'POST', body: fd });
                      if (res.ok) {
                        const json = await res.json();
                        handleChange(item.id, json.url);
                        toast.success(`${item.label} lista para guardar`, { id: tid });
                      } else {
                        toast.error('Error al subir la imagen', { id: tid });
                      }
                    } catch {
                      toast.error('Error de red al subir', { id: tid });
                    }
                  }}
                />
                <label
                  htmlFor={`file-${item.id}`}
                  className="w-full text-center block cursor-pointer px-2 py-2 bg-white border border-gray-300 hover:border-carbon text-carbon rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                >
                  {config[item.id] ? 'Cambiar Foto' : 'Elegir Foto'}
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={() => handleSave(['ig_img_1', 'ig_img_2', 'ig_img_3', 'ig_img_4'])} 
            className="bg-carbon text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors shadow-xs"
          >
            Guardar Fotos de Instagram
          </button>
        </div>
      </div>

    </div>
  );
}
