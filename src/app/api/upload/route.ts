import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Solo se permiten imágenes (PNG, JPG, WEBP)' }, { status: 400 });
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'La imagen excede el límite de 10MB' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const supabase = createServerSupabase();
    const { data, error } = await supabase.storage
      .from('productos')
      .upload(cleanFileName, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('[Upload Error Supabase]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('productos')
      .getPublicUrl(cleanFileName);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      fileName: cleanFileName,
    });
  } catch (error: any) {
    console.error('[Upload Catch]', error);
    return NextResponse.json({ error: error.message || 'Error al procesar la imagen' }, { status: 500 });
  }
}
