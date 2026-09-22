import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Genero, StoreConfig } from '@/types'

// ─── Clase de Tailwind combinada ──────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Formateo de precios ──────────────────────────────────────────────────────
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// ─── Porcentaje de descuento ──────────────────────────────────────────────────
export function calcularDescuento(precioOriginal: number, precioActual: number): number {
  return Math.round(((precioOriginal - precioActual) / precioOriginal) * 100)
}

// ─── Generar número de pedido ─────────────────────────────────────────────────
export function generarNumeroPedido(): string {
  const fecha = new Date()
  const year = fecha.getFullYear().toString().slice(2)
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `FM-${year}${month}${day}-${random}`
}

// ─── Slugify ──────────────────────────────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// ─── Etiqueta de género ───────────────────────────────────────────────────────
export function getLabelGenero(genero: Genero): string {
  const labels: Record<Genero, string> = {
    mujer: 'Mujer',
    hombre: 'Hombre',
    nino: 'Infantil',
    accesorio: 'Accesorios',
  }
  return labels[genero]
}

// ─── Etiqueta de estado de pedido ────────────────────────────────────────────
export function getLabelEstado(estado: string): { label: string; color: string } {
  const estados: Record<string, { label: string; color: string }> = {
    pendiente:       { label: 'Pendiente',       color: 'bg-yellow-100 text-yellow-800' },
    confirmado:      { label: 'Confirmado',       color: 'bg-blue-100 text-blue-800' },
    en_preparacion:  { label: 'En preparación',   color: 'bg-purple-100 text-purple-800' },
    enviado:         { label: 'Enviado',          color: 'bg-orange-100 text-orange-800' },
    entregado:       { label: 'Entregado',        color: 'bg-green-100 text-green-800' },
    cancelado:       { label: 'Cancelado',        color: 'bg-red-100 text-red-800' },
  }
  return estados[estado] || { label: estado, color: 'bg-gray-100 text-gray-800' }
}

// ─── Formatear fecha ──────────────────────────────────────────────────────────
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// ─── Configuración por defecto de la tienda ───────────────────────────────────
export const defaultConfig: StoreConfig = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '+573209728606',
  instagram: 'https://www.instagram.com/leidy_sabata?stkn=MWp6MXh3YjN3dnZkbA==',
  facebook: 'https://facebook.com',
  tiktok: 'https://www.tiktok.com/@leidy_sabata?_r=1&_t=ZS-99xGr3KEmRE',
  direccion: 'Los Patios, Norte de Santander, Colombia',
  ciudad: 'Los Patios',
  email: 'leidysabata@gmail.com',
  telefono: '+573209728606',
  mapa_url: '',
  banner_envio: '🌸 ENVÍO GRATIS en compras superiores a $150.000',
  costo_envio: 8000,
  envio_gratis_desde: 150000,
}

// ─── Departamentos de Colombia ────────────────────────────────────────────────
export const DEPARTAMENTOS_COLOMBIA = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
  'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
  'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
  'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
  'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca',
  'Vaupés', 'Vichada', 'Bogotá D.C.',
]

// ─── Tallas disponibles ───────────────────────────────────────────────────────
export const TALLAS_ROPA = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
export const TALLAS_NINO = ['2', '4', '6', '8', '10', '12', '14', '16']
export const TALLAS_NUMERICAS = ['34', '36', '38', '40', '42', '44', '46']
export const TALLAS_UNICA = ['Única']
