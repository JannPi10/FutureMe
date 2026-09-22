/**
 * Rate Limiter simple basado en IP usando Map en memoria.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

interface RateLimitOptions {
  windowMs: number
  max: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(ip: string, options: RateLimitOptions): RateLimitResult {
  const { windowMs, max } = options
  const now = Date.now()

  if (store.size > 1000) {
    store.forEach((v, k) => {
      if (v.resetAt < now) store.delete(k)
    })
  }

  const entry = store.get(ip)

  if (!entry || entry.resetAt < now) {
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: max - 1, resetAt: now + windowMs }
  }

  if (entry.count >= max) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { success: true, remaining: max - entry.count, resetAt: entry.resetAt }
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}
