import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"
import { requireAdminSession } from "@/lib/auth"
import { sanitizeName } from "@/lib/sanitize"

// GET /api/descuentos - Admin only
export async function GET() {
  const authError = await requireAdminSession()
  if (authError) return authError

  try {
    const supabase = createServerSupabase()
    const { data, error } = await supabase
      .from("descuentos")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[GET /api/descuentos]", error.message)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// POST /api/descuentos - Admin only
export async function POST(request: NextRequest) {
  const authError = await requireAdminSession()
  if (authError) return authError

  try {
    const supabase = createServerSupabase()
    const body = await request.json()
    const payload = {
      ...body,
      codigo: sanitizeName(body.codigo)?.toUpperCase(),
    }
    const { data, error } = await supabase
      .from("descuentos")
      .insert([payload])
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/descuentos]", error.message)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
