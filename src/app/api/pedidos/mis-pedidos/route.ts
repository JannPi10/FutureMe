import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'No autorizado. Inicia sesión.' }, { status: 401 });
    }

    const email = session.user.email.toLowerCase().trim();
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .ilike('cliente_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET /api/pedidos/mis-pedidos]', error);
      return NextResponse.json({ error: 'Error al consultar pedidos' }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    console.error('[GET /api/pedidos/mis-pedidos]', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
