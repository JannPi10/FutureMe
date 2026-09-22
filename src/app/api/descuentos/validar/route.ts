import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"
import { rateLimit, getClientIp } from "@/lib/rateLimit"
import { sanitizeCode } from "@/lib/sanitize"

// POST /api/descuentos/validar - Public con rate limiting
export async function POST(request: NextRequest) {
  // Rate limiting: max 10 validaciones por minuto por IP
  const ip = getClientIp(request)
  const limiter = rateLimit(ip, { windowMs: 60_000, max: 10 })
  if (!limiter.success) {
    return NextResponse.json(
      { valido: false, mensaje: "Demasiados intentos. Espera un momento." },
      {
        status: 429,
        headers: { "Retry-After": Math.ceil((limiter.resetAt - Date.now()) / 1000).toString() },
      }
    )
  }

  try {
    const supabase = createServerSupabase()
    const body = await request.json()

    const codigo = sanitizeCode(body.codigo)
    const subtotal = typeof body.subtotal === "number" ? Math.max(0, body.subtotal) : 0

    if (!codigo) {
      return NextResponse.json({ valido: false, mensaje: "Ingresa un codigo de descuento" })
    }

    const { data: descuento, error } = await supabase
      .from("descuentos")
      .select("*")
      .eq("codigo", codigo)
      .eq("activo", true)
      .single()

    if (error || !descuento) {
      return NextResponse.json({ valido: false, mensaje: "Codigo de descuento no valido" })
    }

    if (descuento.fecha_expiracion && new Date(descuento.fecha_expiracion) < new Date()) {
      return NextResponse.json({ valido: false, mensaje: "Este codigo ha expirado" })
    }

    if (descuento.usos_maximos && descuento.usos_actuales >= descuento.usos_maximos) {
      return NextResponse.json({ valido: false, mensaje: "Este codigo ya no esta disponible" })
    }

    if (descuento.monto_minimo && subtotal < descuento.monto_minimo) {
      return NextResponse.json({
        valido: false,
        mensaje: `El pedido minimo para este codigo es $${new Intl.NumberFormat("es-CO").format(descuento.monto_minimo)}`,
      })
    }

    let monto_descuento = 0
    if (descuento.tipo === "porcentaje") {
      monto_descuento = Math.round(subtotal * (descuento.valor / 100))
    } else {
      monto_descuento = Math.min(descuento.valor, subtotal)
    }

    return NextResponse.json({
      valido: true,
      descuento,
      monto_descuento,
      mensaje: `Codigo aplicado! Ahorras $${new Intl.NumberFormat("es-CO").format(monto_descuento)}`,
    })
  } catch (error: any) {
    console.error("[POST /api/descuentos/validar]", error.message)
    return NextResponse.json({ valido: false, mensaje: "Error al validar el codigo" }, { status: 500 })
  }
}
