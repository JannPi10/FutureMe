'use client';

import { useState, useEffect } from 'react';
import ProductForm from '@/components/admin/ProductForm';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function EditarProductoPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false);
  const [producto, setProducto] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/productos/${params.id}`)
      .then(res => res.json())
      .then(data => setProducto(data?.data || data))
      .catch(() => toast.error('Error al cargar producto'));
  }, [params.id]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/productos/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        toast.success('Producto actualizado exitosamente');
        router.push('/admin/productos');
      } else {
        const err = await res.json();
        toast.error(`Error: ${err.error || 'No se pudo actualizar'}`);
      }
    } catch (error) {
      toast.error('Error de red');
    } finally {
      setLoading(false);
    }
  };

  if (!producto) return <div>Cargando...</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h2 className="text-xl font-medium text-gray-900">Editar Producto</h2>
      </div>
      <ProductForm producto={producto} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
