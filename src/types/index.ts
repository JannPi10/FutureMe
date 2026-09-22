// ──────────────────────────────────────────────────────────────────────────────
// TIPOS GLOBALES — FutureMe by Leidy Sabata
// ──────────────────────────────────────────────────────────────────────────────

export type Genero = 'mujer' | 'hombre' | 'nino' | 'accesorio'
export type EstadoPedido = 'pendiente' | 'confirmado' | 'en_preparacion' | 'enviado' | 'entregado' | 'cancelado'
export type TipoDescuento = 'porcentaje' | 'fijo'

// ─── Categoría ───────────────────────────────────────────────────────────────
export interface Categoria {
  id: string
  nombre: string
  slug: string
  genero: Genero
  subcategoria?: string
  descripcion?: string
  imagen_url?: string
  activo: boolean
  orden: number
  created_at: string
}

// ─── Color de producto ────────────────────────────────────────────────────────
export interface ColorProducto {
  nombre: string
  hex: string
}

// ─── Producto ─────────────────────────────────────────────────────────────────
export interface Producto {
  id: string
  nombre: string
  slug: string
  descripcion?: string
  precio: number
  precio_anterior?: number
  categoria_id?: string
  categoria?: Categoria
  imagenes: string[]           // Array de URLs
  tallas: string[]             // ['XS','S','M','L','XL','XXL'] o ['6','8','10',...]
  colores: ColorProducto[]
  destacado: boolean
  nuevo: boolean
  activo: boolean
  stock: number
  created_at: string
  updated_at: string
}

// ─── Item del carrito ─────────────────────────────────────────────────────────
export interface CartItem {
  productoId: string
  nombre: string
  precio: number
  imagen?: string
  talla: string
  color: ColorProducto
  cantidad: number
  slug: string
}

// ─── Pedido ───────────────────────────────────────────────────────────────────
export interface PedidoItem {
  productoId: string
  nombre: string
  precio: number
  cantidad: number
  talla: string
  color: ColorProducto
  imagen?: string
}

export interface Pedido {
  id: string
  numero_pedido: string
  // Datos del cliente
  cliente_nombre: string
  cliente_email?: string
  cliente_telefono: string
  cliente_cedula?: string
  // Datos de envío
  direccion: string
  ciudad: string
  departamento: string
  codigo_postal?: string
  notas?: string
  // Items y montos
  items: PedidoItem[]
  subtotal: number
  descuento_codigo?: string
  descuento_monto: number
  costo_envio: number
  total: number
  // Estado
  estado: EstadoPedido
  created_at: string
  updated_at: string
}

// ─── Datos del formulario de checkout ────────────────────────────────────────
export interface CheckoutFormData {
  // Contacto
  cliente_nombre: string
  cliente_email?: string
  cliente_telefono: string
  cliente_cedula?: string
  // Envío
  direccion: string
  ciudad: string
  departamento: string
  codigo_postal?: string
  notas?: string
  // Descuento
  descuento_codigo?: string
}

// ─── Descuento ────────────────────────────────────────────────────────────────
export interface Descuento {
  id: string
  codigo: string
  tipo: TipoDescuento
  valor: number
  activo: boolean
  fecha_inicio: string
  fecha_expiracion?: string
  usos_maximos?: number
  usos_actuales: number
  monto_minimo: number
  created_at: string
}

export interface DescuentoValidado {
  valido: boolean
  descuento?: Descuento
  monto_descuento?: number
  mensaje?: string
}

// ─── Banner ───────────────────────────────────────────────────────────────────
export interface Banner {
  id: string
  titulo?: string
  subtitulo?: string
  descripcion?: string
  imagen_url?: string
  boton1_texto?: string
  boton1_url?: string
  boton2_texto?: string
  boton2_url?: string
  orden: number
  activo: boolean
  created_at: string
}

// ─── Configuración ────────────────────────────────────────────────────────────
export interface Configuracion {
  id: string
  clave: string
  valor?: string
  descripcion?: string
  updated_at: string
}

export interface StoreConfig {
  whatsapp: string
  instagram: string
  facebook: string
  tiktok: string
  direccion: string
  ciudad: string
  email: string
  telefono: string
  mapa_url: string
  banner_envio: string
  costo_envio: number
  envio_gratis_desde: number
}

// ─── Respuestas de la API ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// ─── Filtros de búsqueda de productos ────────────────────────────────────────
export interface ProductoFiltros {
  categoria?: string
  genero?: Genero
  talla?: string
  color?: string
  precioMin?: number
  precioMax?: number
  busqueda?: string
  destacado?: boolean
  nuevo?: boolean
  orden?: 'precio_asc' | 'precio_desc' | 'nuevo' | 'nombre'
  page?: number
  pageSize?: number
}

// ─── Estadísticas del dashboard ───────────────────────────────────────────────
export interface DashboardStats {
  totalProductos: number
  totalPedidos: number
  pedidosPendientes: number
  ingresosTotales: number
  ingresosHoy: number
  pedidosHoy: number
}
