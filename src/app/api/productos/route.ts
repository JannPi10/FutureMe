import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"
import { requireAdminSession } from "@/lib/auth"
import { sanitizeName } from "@/lib/sanitize"

export const dynamic = "force-dynamic"
export const revalidate = 0

// GET /api/productos - Public
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { searchParams } = new URL(request.url)

    const genero = searchParams.get("genero")
    const categoria = searchParams.get("categoria")
    const sub = searchParams.get("sub") || searchParams.get("subcategoria")
    const talla = searchParams.get("talla")
    const busqueda = searchParams.get("busqueda")
    const nuevo = searchParams.get("nuevo")
    const destacado = searchParams.get("destacado")
    const slug = searchParams.get("slug")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") || "12"))
    const orden = searchParams.get("orden") || "nuevo"
    const all = searchParams.get("all")

    let query = supabase
      .from("productos")
      .select("*, categoria:categorias(*)", { count: "exact" })

    if (!all) {
      query = query.eq("activo", true)
    }

    if (slug) query = query.eq("slug", sanitizeName(slug))

    // Normalizar género
    let normalizedGenero = genero?.toLowerCase()
    if (normalizedGenero === "infantil" || normalizedGenero === "ninos" || normalizedGenero === "niños") {
      normalizedGenero = "nino"
    } else if (normalizedGenero === "accesorios") {
      normalizedGenero = "accesorio"
    }

    // Filtrar por Departamento Padre (Género)
    if (normalizedGenero) {
      const { data: catRows } = await supabase
        .from("categorias")
        .select("id, slug, subcategoria")
        .eq("genero", normalizedGenero)
      
      let matchedCats = catRows || []
      if (sub && matchedCats.length > 0) {
        const subClean = sanitizeName(sub).toLowerCase()
        const filtered = matchedCats.filter(c => 
          c.slug?.toLowerCase() === subClean || 
          c.subcategoria?.toLowerCase() === subClean ||
          c.slug?.toLowerCase().includes(subClean)
        )
        if (filtered.length > 0) {
          matchedCats = filtered
        }
      }

      const catIds = matchedCats.map(c => c.id)
      if (catIds.length > 0) {
        query = query.in("categoria_id", catIds)
      } else {
        query = query.eq("categoria_id", "00000000-0000-0000-0000-000000000000")
      }
    }

    // Filtrar por categoría directa o subcategoría
    if (categoria) {
      const catClean = sanitizeName(categoria).toLowerCase()
      // Si el valor pasado como categoría es realmente un género (ej: /api/productos?categoria=mujer)
      if (["mujer", "hombre", "infantil", "nino", "accesorio", "accesorios"].includes(catClean)) {
        let g = catClean
        if (g === "infantil") g = "nino"
        if (g === "accesorios") g = "accesorio"
        const { data: catRows } = await supabase.from("categorias").select("id").eq("genero", g)
        const catIds = catRows?.map(c => c.id) || []
        if (catIds.length > 0) query = query.in("categoria_id", catIds)
        else query = query.eq("categoria_id", "00000000-0000-0000-0000-000000000000")
      } else {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoria)
        if (isUuid) {
          query = query.eq("categoria_id", categoria)
        } else {
          // Buscar por slug
          const { data: cat } = await supabase
            .from("categorias")
            .select("id")
            .eq("slug", catClean)
            .maybeSingle()
          if (cat?.id) {
            query = query.eq("categoria_id", cat.id)
          } else {
            // Buscar por subcategoria
            const { data: subCats } = await supabase
              .from("categorias")
              .select("id")
              .eq("subcategoria", catClean)
            const ids = subCats?.map(c => c.id) || []
            if (ids.length > 0) {
              query = query.in("categoria_id", ids)
            } else {
              query = query.eq("categoria_id", "00000000-0000-0000-0000-000000000000")
            }
          }
        }
      }
    }

    if (talla) query = query.contains("tallas", [sanitizeName(talla)])
    if (busqueda) query = query.ilike("nombre", `%${sanitizeName(busqueda)}%`)
    if (nuevo === "true") query = query.eq("nuevo", true)
    if (destacado === "true") query = query.eq("destacado", true)

    switch (orden) {
      case "precio_asc": query = query.order("precio", { ascending: true }); break
      case "precio_desc": query = query.order("precio", { ascending: false }); break
      case "nombre": query = query.order("nombre", { ascending: true }); break
      default: query = query.order("created_at", { ascending: false })
    }

    const from = (page - 1) * pageSize
    query = query.range(from, from + pageSize - 1)

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({ data, total: count || 0, page, pageSize })
  } catch (error: any) {
    console.error("[GET /api/productos]", error.message)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// POST /api/productos - Admin only
export async function POST(request: NextRequest) {
  const authError = await requireAdminSession()
  if (authError) return authError

  try {
    const supabase = createServerSupabase()
    const body = await request.json()

    const { data, error } = await supabase
      .from("productos")
      .insert([body])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/productos]", error.message)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
