'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import toast from 'react-hot-toast';
import DiscountForm from '@/components/admin/DiscountForm';

export default function DescuentosPage() {
  const [descuentos, setDescuentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetch('/api/descuentos')
      .then(res => res.json())
      .then(data => setDescuentos(Array.isArray(data) ? data : (data?.data || [])))
      .catch(() => toast.error('Error al cargar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleStatus = async (item: any) => {
    const res = await fetch(`/api/descuentos/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !item.activo })
    });
    if (res.ok) {
      toast.success('Actualizado');
      loadData();
    }
  };

  const deleteItem = async (item: any) => {
    if(confirm('¿Eliminar descuento?')) {
      await fetch(`/api/descuentos/${item.id}`, { method: 'DELETE' });
      toast.success('Eliminado');
      loadData();
    }
  };

  const handleSave = async (data: any) => {
    const res = await fetch('/api/descuentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      toast.success('Creado exitosamente');
      setShowForm(false);
      loadData();
    } else {
      toast.error('Error al guardar');
    }
  };

  const columns = [
    { key: 'codigo', header: 'Código', render: (d: any) => <span className="font-mono font-bold">{d.codigo}</span> },
    { key: 'tipo', header: 'Tipo', render: (d: any) => d.tipo === 'porcentaje' ? '%' : '$' },
    { key: 'valor', header: 'Valor' },
    { key: 'usos_actuales', header: 'Usos', render: (d: any) => `${d.usos_actuales} / ${d.usos_maximos}` },
    { key: 'fecha_expiracion', header: 'Expiración', render: (d: any) => d.fecha_expiracion ? new Date(d.fecha_expiracion).toLocaleDateString() : 'N/A' },
    { 
      key: 'activo', 
      header: 'Activo',
      render: (d: any) => (
        <button onClick={() => toggleStatus(d)} className={`px-2 py-1 rounded-full text-xs font-semibold ${d.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {d.activo ? 'Sí' : 'No'}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 font-sans">Descuentos</h2>
        <button onClick={() => setShowForm(true)} className="bg-carbon text-white px-4 py-2 rounded-md">
          Nuevo Descuento
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium mb-4">Crear Descuento</h3>
          <DiscountForm onSubmit={handleSave} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <DataTable columns={columns} data={descuentos} loading={loading} onDelete={deleteItem} searchable={false} />
    </div>
  );
}
