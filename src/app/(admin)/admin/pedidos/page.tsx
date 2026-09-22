'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadData = () => {
    setLoading(true);
    fetch('/api/pedidos')
      .then(res => res.json())
      .then(data => setPedidos(Array.isArray(data) ? data : (data?.data || [])))
      .catch(() => toast.error('Error al cargar pedidos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const getLabelEstado = (estado: string) => {
    const states: Record<string, string> = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'confirmado': 'bg-blue-100 text-blue-800',
      'enviado': 'bg-purple-100 text-purple-800',
      'entregado': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800',
    };
    return states[estado] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'numero_pedido', header: '# Pedido', render: (p: any) => <span className="font-medium text-blue-600">{p.numero_pedido}</span> },
    { key: 'created_at', header: 'Fecha', render: (p: any) => new Date(p.created_at).toLocaleString() },
    { key: 'cliente_nombre', header: 'Cliente' },
    { key: 'ciudad', header: 'Ciudad' },
    { key: 'total', header: 'Total', render: (p: any) => `$${p.total?.toLocaleString()}` },
    { 
      key: 'estado', 
      header: 'Estado',
      render: (p: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getLabelEstado(p.estado)}`}>
          {p.estado?.toUpperCase()}
        </span>
      )
    }
  ];

  const handleDelete = async (item: any) => {
    if (confirm(`¿Estás seguro de eliminar el pedido #${item.numero_pedido}? Esta acción no se puede deshacer.`)) {
      try {
        const res = await fetch(`/api/pedidos/${item.id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success(`Pedido #${item.numero_pedido} eliminado`);
          loadData();
        } else {
          toast.error('Error al eliminar pedido');
        }
      } catch (e) {
        toast.error('Error de red al eliminar');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 font-sans">Pedidos</h2>
      </div>

      <DataTable 
        columns={columns} 
        data={pedidos} 
        loading={loading} 
        searchable={true}
        searchField="numero_pedido"
        onEdit={(item) => router.push(`/admin/pedidos/${item.id}`)}
        onDelete={handleDelete}
      />
    </div>
  );
}
