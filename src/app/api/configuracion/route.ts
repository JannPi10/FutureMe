import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { defaultConfig } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('configuracion')
      .select('*');

    if (error) throw error;

    const config: Record<string, string> = { ...defaultConfig as any };
    data.forEach(item => {
      config[item.clave] = item.valor;
    });

    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  } catch (error: any) {
    console.warn('[GET /api/configuracion] Usando configuración por defecto:', error.message);
    return NextResponse.json(defaultConfig, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerSupabase();
    const body = await request.json();

    const updates = Object.keys(body).map(key => ({
      clave: key,
      valor: body[key]
    }));

    const { error } = await supabase
      .from('configuracion')
      .upsert(updates, { onConflict: 'clave' });

    if (error) throw error;

    return NextResponse.json({ message: 'Configuración actualizada' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
