/**
 * Utilidades de sanitizacion de inputs.
 * Previene XSS, inyeccion SQL basica y prompt injection.
 */

const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /<[^>]+>/g,
  /javascript:/gi,
  /on\w+\s*=/gi,
]

export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return ''
  let sanitized = input.trim()
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '')
  }
  return sanitized.slice(0, 1000)
}

export function sanitizeName(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .replace(/<[^>]+>/g, '')
    .replace(/[<>"''`;]/g, '')
    .replace(/--/g, '')
    .slice(0, 200)
}

export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[^0-9+\s\-()]/g, '').trim().slice(0, 20)
}

export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return ''
  const trimmed = input.trim().toLowerCase().slice(0, 254)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(trimmed) ? trimmed : ''
}

export function sanitizeCode(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\-_]/g, '')
    .slice(0, 50)
}

export function sanitizeCartItems(items: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(items)) return []
  return items.slice(0, 50).map((item) => {
    if (typeof item !== 'object' || item === null) return {}
    const i = item as Record<string, unknown>
    return {
      productoId: sanitizeName(i.productoId),
      nombre: sanitizeName(i.nombre),
      precio: typeof i.precio === 'number' && i.precio >= 0 ? Math.floor(i.precio) : 0,
      cantidad: typeof i.cantidad === 'number' && i.cantidad > 0 ? Math.min(Math.floor(i.cantidad), 99) : 1,
      talla: sanitizeName(i.talla),
      color: typeof i.color === 'object' && i.color !== null
        ? { nombre: sanitizeName((i.color as Record<string, unknown>).nombre) }
        : { nombre: '' },
    }
  }).filter(item => item.productoId && item.nombre)
}
