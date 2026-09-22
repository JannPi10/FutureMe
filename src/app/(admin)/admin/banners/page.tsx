'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import toast from 'react-hot-toast';

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => setBanners(Array.isArray(data) ? data : (data?.data || [])))
      .catch(() => toast.error('Error al cargar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const [form, setForm] = useState({ 
    titulo: '', subtitulo: '', descripcion: '', imagen_url: '', 
    boton1_texto: '', boton1_url: '', boton2_texto: '', boton2_url: '', 
    orden: 0, activo: true 
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      toast.success('Banner creado');
      loadData();
    } else {
      toast.error('Error al crear');
    }
  };

  const deleteItem = async (item: any) => {
    if(confirm('¿Eliminar banner?')) {
      await fetch(`/api/banners/${item.id}`, { method: 'DELETE' });
      toast.success('Eliminado');
      loadData();
    }
  }

  const columns = [
    { key: 'imagen_url', header: 'Imagen', render: (b: any) => <img src={b.imagen_url} alt="" className="h-10 w-20 object-cover rounded" /> },
    { key: 'titulo', header: 'Título' },
    { key: 'orden', header: 'Orden' },
    { 
      key: 'activo', 
      header: 'Activo',
      render: (b: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${b.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {b.activo ? 'Sí' : 'No'}
        </span>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 shadow rounded-lg h-fit">
        <h3 className="text-lg font-medium mb-4">Nuevo Banner</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm">Título</label><input type="text" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} className="mt-1 block w-full border rounded-md p-2" /></div>
          <div><label className="block text-sm">Subtítulo</label><input type="text" value={form.subtitulo} onChange={e => setForm({...form, subtitulo: e.target.value})} className="mt-1 block w-full border rounded-md p-2" /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Banner *</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                id="banner-file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const tid = toast.loading('Subiendo imagen...');
                  const fd = new FormData();
                  fd.append('file', file);
                  const res = await fetch('/api/upload', { method: 'POST', body: fd });
                  if (res.ok) {
                    const json = await res.json();
                    setForm({ ...form, imagen_url: json.url });
                    toast.success('Imagen cargada', { id: tid });
                  } else {
                    toast.error('Error al subir imagen', { id: tid });
                  }
                }}
              />
              <label
                htmlFor="banner-file"
                className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-carbon rounded-md text-xs font-semibold uppercase tracking-wider"
              >
                Elegir foto desde equipo
              </label>
              {form.imagen_url && (
                <img src={form.imagen_url} alt="Vista previa" className="h-10 w-20 object-cover rounded border" />
              )}
            </div>
            {form.imagen_url && (
              <p className="text-[11px] text-gray-400 mt-1 truncate max-w-sm">{form.imagen_url}</p>
            )}
          </div>
          <div><label className="block text-sm font-medium text-gray-700">Texto Botón 1</label><input type="text" value={form.boton1_texto} onChange={e => setForm({...form, boton1_texto: e.target.value})} className="mt-1 block w-full border rounded-md p-2" /></div>
          <div><label className="block text-sm font-medium text-gray-700">URL Botón 1</label><input type="text" value={form.boton1_url} onChange={e => setForm({...form, boton1_url: e.target.value})} className="mt-1 block w-full border rounded-md p-2" /></div>
          <div className="flex items-center space-x-4">
            <div><label className="block text-sm font-medium text-gray-700">Orden</label><input type="number" value={form.orden} onChange={e => setForm({...form, orden: Number(e.target.value)})} className="mt-1 block w-full border rounded-md p-2" /></div>
            <div className="flex items-center mt-6"><input type="checkbox" checked={form.activo} onChange={e => setForm({...form, activo: e.target.checked})} className="mr-2" /> Activo</div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setForm({ titulo: '', subtitulo: '', descripcion: '', imagen_url: '', boton1_texto: '', boton1_url: '', boton2_texto: '', boton2_url: '', orden: 0, activo: true })}
              className="w-1/2 border border-gray-300 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
            <button type="submit" className="w-1/2 bg-carbon text-white py-2 rounded-md text-sm font-bold hover:bg-rosa-petalo transition-colors">
              Guardar Banner
            </button>
          </div>
        </form>
      </div>

      <div>
        <DataTable columns={columns} data={banners} loading={loading} onDelete={deleteItem} searchable={false} />
      </div>
    </div>
  );
}
