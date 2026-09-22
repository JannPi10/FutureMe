import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"
import { generarNumeroPedido } from "@/lib/utils"
import { requireAdminSession } from "@/lib/auth"
import { rateLimit, getClientIp } from "@/lib/rateLimit"
import { sanitizeName, sanitizePhone, sanitizeEmail, sanitizeCode, sanitizeString, sanitizeCartItems } from "@/lib/sanitize"

// GET /api/pedidos - Admin only
export async function GET(request: NextRequest) {
  const authError = await requireAdminSession()
  if (authError) return authError

  try {
    const supabase = createServerSupabase()
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get("estado")
    const busqueda = searchParams.get("busqueda")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const pageSize = Math.min(50, parseInt(searchParams.get("pageSize") || "20"))

    let query = supabase
      .from("pedidos")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    if (estado) query = query.eq("estado", sanitizeName(estado))
    if (busqueda) {
      const safeBusqueda = sanitizeName(busqueda)
      query = query.or(
        `numero_pedido.ilike.%${safeBusqueda}%,cliente_nombre.ilike.%${safeBusqueda}%,cliente_telefono.ilike.%${safeBusqueda}%`
      )
    }

    const from = (page - 1) * pageSize
    query = query.range(from, from + pageSize - 1)

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({ data, total: count || 0, page, pageSize })
  } catch (error: any) {
    console.error("[GET /api/pedidos]", error.message)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// POST /api/pedidos - Public (COD checkout) con rate limiting
export async function POST(request: NextRequest) {
  // Rate limiting: max 5 pedidos por minuto por IP
  const ip = getClientIp(request)
  const limiter = rateLimit(ip, { windowMs: 60_000, max: 5 })
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Espera un momento e intenta de nuevo." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((limiter.resetAt - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  try {
    const supabase = createServerSupabase()
    const body = await request.json()

    // Sanitizar todos los inputs (soportando tanto campos directos como anidados en contacto/envio)
    const cliente_nombre = sanitizeName(body.cliente_nombre || body.contacto?.nombre)
    const cliente_telefono = sanitizePhone(body.cliente_telefono || body.contacto?.telefono)
    const cliente_email = sanitizeEmail(body.cliente_email || body.contacto?.email)
    const cliente_cedula = sanitizeName(body.cliente_cedula || body.contacto?.cedula)
    const direccion = sanitizeString(body.direccion || body.envio?.direccion)
    const ciudad = sanitizeName(body.ciudad || body.envio?.ciudad)
    const departamento = sanitizeName(body.departamento || body.envio?.departamento)
    const codigo_postal = sanitizeName(body.codigo_postal || body.envio?.codigo_postal)
    const notas = sanitizeString(body.notas || body.envio?.notas)
    const descuento_codigo = sanitizeCode(body.descuento_codigo || body.codigo_descuento)
    const descuento_monto = typeof body.descuento_monto === "number"
      ? Math.max(0, body.descuento_monto)
      : (typeof body.descuento === "number" ? Math.max(0, body.descuento) : 0)
    const items = sanitizeCartItems(body.items)
    const subtotal = typeof body.subtotal === "number" ? Math.max(0, body.subtotal) : 0

    // Validar campos requeridos (nombre, teléfono, email, cédula, dirección, ciudad, departamento e items)
    if (!cliente_nombre || !cliente_telefono || !cliente_email || !cliente_cedula || !direccion || !ciudad || !departamento || !items.length) {
      return NextResponse.json({ 
        error: "Faltan campos requeridos. Nombre, teléfono, correo electrónico, cédula, dirección, departamento y ciudad son obligatorios." 
      }, { status: 400 })
    }

    // Obtener config de envio
    const { data: configData } = await supabase
      .from("configuracion")
      .select("clave, valor")
      .in("clave", ["costo_envio", "envio_gratis_desde"])

    const configMap: Record<string, string> = {}
    configData?.forEach((c) => { configMap[c.clave] = c.valor || "0" })

    const costoEnvio =
      subtotal - descuento_monto >= parseInt(configMap.envio_gratis_desde || "150000")
        ? 0
        : parseInt(configMap.costo_envio || "8000")

    const total = subtotal - descuento_monto + costoEnvio
    const numero_pedido = generarNumeroPedido()

    const { data, error } = await supabase
      .from("pedidos")
      .insert([{
        numero_pedido,
        cliente_nombre,
        cliente_email: cliente_email || null,
        cliente_telefono,
        cliente_cedula: cliente_cedula || null,
        direccion,
        ciudad,
        departamento,
        codigo_postal: codigo_postal || null,
        notas: notas || null,
        items,
        subtotal,
        descuento_codigo: descuento_codigo || null,
        descuento_monto,
        costo_envio: costoEnvio,
        total,
        estado: "pendiente",
      }])
      .select()
      .single()

    if (error) throw error

    if (descuento_codigo) {
      try {
        await supabase.rpc("increment_descuento_usos", { p_codigo: descuento_codigo })
      } catch {
        // Ignorar si la función rpc no existe aún en supabase
      }
    }

    return NextResponse.json({ data, numero_pedido: data.numero_pedido }, { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/pedidos]", error.message)
    return NextResponse.json({ error: "Error interno al procesar el pedido" }, { status: 500 })
  }
}
