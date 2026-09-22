'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import toast from 'react-hot-toast';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

const DEPARTAMENTOS = [
  { id: 'mujer', label: '🌸 Mujer' },
  { id: 'hombre', label: '👔 Hombre' },
  { id: 'nino', label: '🧸 Infantil' },
  { id: 'accesorio', label: '👜 Accesorios' },
];

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch('/api/categorias', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setCategorias(Array.isArray(data) ? data : (data?.data || [])))
      .catch(() => toast.error('Error al cargar categorías'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const [form, setForm] = useState({ 
    nombre: '', 
    slug: '', 
    genero: 'mujer', 
    subcategoria: '', 
    activo: true, 
    orden: 0 
  });
  
  const handleNombreChange = (val: string) => {
    setForm(prev => ({
      ...prev,
      nombre: val,
      slug: slugify(val),
      subcategoria: prev.subcategoria || slugify(val)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalForm = {
      ...form,
      slug: form.slug || slugify(form.nombre),
      subcategoria: form.subcategoria || form.slug || slugify(form.nombre)
    };

    const tid = toast.loading('Creando categoría...');
    try {
      const res = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalForm)
      });
      if (res.ok) {
        toast.success('¡Categoría creada exitosamente!', { id: tid });
        setForm({ nombre: '', slug: '', genero: 'mujer', subcategoria: '', activo: true, orden: 0 });
        loadData();
      } else {
        const json = await res.json().catch(() => ({}));
        toast.error(json.error || 'Error al crear la categoría', { id: tid });
      }
    } catch {
      toast.error('Error de red al crear', { id: tid });
    }
  };

  const deleteItem = async (item: any) => {
    if (confirm(`¿Eliminar la categoría "${item.nombre}"?`)) {
      await fetch(`/api/categorias/${item.id}`, { method: 'DELETE' });
      toast.success('Categoría eliminada');
      loadData();
    }
  };

  const columns = [
    { key: 'nombre', header: 'Nombre' },
    { 
      key: 'genero', 
      header: 'Departamento',
      render: (c: any) => {
        const labels: Record<string, string> = {
          mujer: '🌸 Mujer',
          hombre: '👔 Hombre',
          nino: '🧸 Infantil',
          accesorio: '👜 Accesorios'
        };
        return (
          <span className="font-semibold text-xs text-carbon">
            {labels[c.genero] || c.genero}
          </span>
        );
      }
    },
    { 
      key: 'slug', 
      header: 'Enlace web',
      render: (c: any) => (
        <span className="text-xs font-mono text-gray-500">/categoria/{c.slug}</span>
      )
    },
    { key: 'orden', header: 'Orden' },
    { 
      key: 'activo', 
      header: 'Estado',
      render: (c: any) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {c.activo ? 'Activa' : 'Inactiva'}
        </span>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white p-6 shadow-sm border border-gray-100 rounded-xl h-fit">
        <h3 className="font-serif text-lg font-bold text-carbon mb-4">Nueva Categoría de Prendas</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Nombre de la Categoría *
            </label>
            <input 
              required 
              type="text" 
              placeholder="Ej. Vestidos de Fiesta"
              value={form.nombre} 
              onChange={e => handleNombreChange(e.target.value)} 
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rosa-tulip" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Departamento Padre (¿A quién pertenece?) *
            </label>
            <select
              value={form.genero}
              onChange={e => setForm({ ...form, genero: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rosa-tulip bg-white"
            >
              {DEPARTAMENTOS.map(d => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Enlace Web (Automático)
            </label>
            <input 
              type="text" 
              value={form.slug} 
              onChange={e => setForm({ ...form, slug: slugify(e.target.value) })} 
              className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2 text-xs font-mono" 
            />
            <p className="text-[11px] text-gray-400 mt-1">Se genera solo a partir del nombre.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Orden de lista
              </label>
              <input 
                type="number" 
                value={form.orden} 
                onChange={e => setForm({ ...form, orden: Number(e.target.value) })} 
                className="w-full border border-gray-300 rounded-lg p-2 text-sm" 
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.activo} 
                  onChange={e => setForm({ ...form, activo: e.target.checked })} 
                  className="rounded border-gray-300 text-rosa-petalo focus:ring-rosa-tulip h-4 w-4 mr-2" 
                />
                <span className="text-xs font-semibold text-gray-700">Activa</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setForm({ nombre: '', slug: '', genero: 'mujer', subcategoria: '', activo: true, orden: 0 })}
              className="w-1/2 border border-gray-300 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
            <button 
              type="submit" 
              className="w-1/2 bg-carbon text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors shadow-xs"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>

      <div className="lg:col-span-2">
        <DataTable columns={columns} data={categorias} loading={loading} onDelete={deleteItem} searchable={true} searchField="nombre" />
      </div>
    </div>
  );
}
