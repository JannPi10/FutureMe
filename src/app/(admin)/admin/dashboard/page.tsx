import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase';
import StatsCard from '@/components/admin/StatsCard';
import { FiPackage, FiShoppingBag, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/admin/login');
  }

  const supabase = createServerSupabase();
  
  // Total productos
  const { count: prodCount } = await supabase.from('productos').select('*', { count: 'exact', head: true }).eq('activo', true);
  
  // Pedidos stats
  const { data: pedidos } = await supabase.from('pedidos').select('*');
  
  const totalPedidos = pedidos?.length || 0;
  const pedidosPendientes = pedidos?.filter(p => p.estado === 'pendiente').length || 0;
  
  const ingresos = pedidos?.reduce((acc, p) => p.estado !== 'cancelado' ? acc + (p.total || 0) : acc, 0) || 0;
  
  const hoyStr = new Date().toISOString().split('T')[0];
  const pedidosHoy = pedidos?.filter(p => p.created_at.startsWith(hoyStr)).length || 0;

  const recentOrders = pedidos?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard title="Ingresos Totales" value={`$${ingresos.toLocaleString()}`} icon={FiDollarSign} color="bg-green-500 text-green-700" />
        <StatsCard title="Pedidos Totales" value={totalPedidos} icon={FiShoppingBag} color="bg-blue-500 text-blue-700" />
        <StatsCard title="Pedidos Pendientes" value={pedidosPendientes} icon={FiClock} color="bg-yellow-500 text-yellow-700" />
        <StatsCard title="Pedidos Hoy" value={pedidosHoy} icon={FiCheckCircle} color="bg-purple-500 text-purple-700" />
        <StatsCard title="Productos Activos" value={prodCount || 0} icon={FiPackage} color="bg-rosa-tulip text-rosa-petalo" />
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Últimos Pedidos</h3>
          <Link href="/admin/pedidos" className="text-sm text-rosa-petalo hover:text-rosa-tulip font-medium">Ver todos</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    <Link href={`/admin/pedidos/${p.id}`}>{p.numero_pedido}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.cliente_nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${p.total.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      p.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      p.estado === 'enviado' ? 'bg-blue-100 text-blue-800' :
                      p.estado === 'entregado' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {p.estado}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No hay pedidos recientes</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
