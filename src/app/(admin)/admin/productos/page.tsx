'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DataTable from '@/components/admin/DataTable';
import { FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProductosPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadProductos = () => {
    setLoading(true);
    fetch('/api/productos?pageSize=1000') // Fetching a larger batch for client-side search, or could implement server-side search
      .then(res => res.json())
      .then(data => setProductos(Array.isArray(data) ? data : (data?.data || [])))
      .catch(() => toast.error('Error al cargar productos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProductos();
  }, []);

  const toggleStatus = async (id: string, field: string, value: boolean) => {
    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !value })
      });
      if (res.ok) {
        loadProductos();
        toast.success('Producto actualizado');
      } else {
        toast.error('Error al actualizar');
      }
    } catch (e) {
      toast.error('Error al actualizar');
    }
  };

  const deleteProducto = async (item: any) => {
    if (confirm(`¿Estás seguro de eliminar "${item.nombre}"?`)) {
      try {
        const res = await fetch(`/api/productos/${item.id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Producto eliminado (soft delete)');
          loadProductos();
        } else {
          toast.error('Error al eliminar');
        }
      } catch (e) {
        toast.error('Error al eliminar');
      }
    }
  };

  const columns = [
    {
      key: 'imagen', header: 'Imagen', render: (p: any) => (
        p.imagenes?.[0] ? <img src={p.imagenes[0]} alt={p.nombre} className="h-10 w-10 object-cover rounded" /> : <div className="h-10 w-10 bg-gray-200 rounded"></div>
      )
    },
    { key: 'nombre', header: 'Nombre' },
    { key: 'categoria', header: 'Categoría', render: (p: any) => p.categoria?.nombre || '-' },
    { key: 'precio', header: 'Precio', render: (p: any) => `$${p.precio.toLocaleString()}` },
    { key: 'stock', header: 'Stock' },
    {
      key: 'nuevo', header: 'Nuevo', render: (p: any) => (
        <button onClick={() => toggleStatus(p.id, 'nuevo', p.nuevo)} className={`px-2 py-1 rounded-full text-xs font-semibold ${p.nuevo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {p.nuevo ? 'Sí' : 'No'}
        </button>
      )
    },
    {
      key: 'destacado', header: 'Destacado', render: (p: any) => (
        <button onClick={() => toggleStatus(p.id, 'destacado', p.destacado)} className={`px-2 py-1 rounded-full text-xs font-semibold ${p.destacado ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
          {p.destacado ? 'Sí' : 'No'}
        </button>
      )
    },
    {
      key: 'activo', header: 'Activo', render: (p: any) => (
        <button onClick={() => toggleStatus(p.id, 'activo', p.activo)} className={`px-2 py-1 rounded-full text-xs font-semibold ${p.activo ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
          {p.activo ? 'Activo' : 'Inactivo'}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 font-sans">Productos</h2>
        <Link href="/admin/productos/nuevo" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-carbon hover:bg-gray-800">
          <FiPlus className="-ml-1 mr-2 h-5 w-5" />
          Nuevo Producto
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={productos}
        loading={loading}
        searchable={true}
        searchField="nombre"
        onEdit={(item) => router.push(`/admin/productos/${item.id}`)}
        onDelete={deleteProducto}
      />
    </div>
  );
}
