'use client';

import { useState } from 'react';
import ProductForm from '@/components/admin/ProductForm';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function NuevoProductoPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        toast.success('Producto creado exitosamente');
        router.push('/admin/productos');
      } else {
        const err = await res.json();
        toast.error(`Error: ${err.error || 'No se pudo crear'}`);
      }
    } catch (error) {
      toast.error('Error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h2 className="text-xl font-medium text-gray-900">Crear Nuevo Producto</h2>
      </div>
      <ProductForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
