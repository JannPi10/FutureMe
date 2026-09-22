-- ═══════════════════════════════════════════════════════════════════════════
-- SCHEMA DE SUPABASE — FutureMe by Leidy Sabata
-- Ejecuta este script en: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABLA: categorias ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,
  genero        VARCHAR(20) NOT NULL CHECK (genero IN ('mujer', 'hombre', 'nino', 'accesorio')),
  subcategoria  VARCHAR(50),
  descripcion   TEXT,
  imagen_url    TEXT,
  activo        BOOLEAN DEFAULT true,
  orden         INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLA: productos ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre          VARCHAR(200) NOT NULL,
  slug            VARCHAR(200) UNIQUE NOT NULL,
  descripcion     TEXT,
  precio          NUMERIC(12,2) NOT NULL,
  precio_anterior NUMERIC(12,2),
  categoria_id    UUID REFERENCES categorias(id) ON DELETE SET NULL,
  imagenes        JSONB DEFAULT '[]',       -- ["url1","url2",...]
  tallas          TEXT[] DEFAULT '{}',      -- ['S','M','L',...]
  colores         JSONB DEFAULT '[]',       -- [{"nombre":"Rosado","hex":"#E8B7C8"},...]
  destacado       BOOLEAN DEFAULT false,
  nuevo           BOOLEAN DEFAULT false,
  activo          BOOLEAN DEFAULT true,
  stock           INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLA: banners ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo         VARCHAR(200),
  subtitulo      VARCHAR(300),
  descripcion    TEXT,
  imagen_url     TEXT,
  boton1_texto   VARCHAR(50),
  boton1_url     VARCHAR(200),
  boton2_texto   VARCHAR(50),
  boton2_url     VARCHAR(200),
  orden          INTEGER DEFAULT 0,
  activo         BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLA: descuentos ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS descuentos (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  codigo           VARCHAR(50) UNIQUE NOT NULL,
  tipo             VARCHAR(20) NOT NULL CHECK (tipo IN ('porcentaje', 'fijo')),
  valor            NUMERIC(10,2) NOT NULL,
  activo           BOOLEAN DEFAULT true,
  fecha_inicio     TIMESTAMPTZ DEFAULT NOW(),
  fecha_expiracion TIMESTAMPTZ,
  usos_maximos     INTEGER,
  usos_actuales    INTEGER DEFAULT 0,
  monto_minimo     NUMERIC(12,2) DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLA: pedidos ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedidos (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  numero_pedido    VARCHAR(20) UNIQUE NOT NULL,
  -- Datos del cliente
  cliente_nombre   VARCHAR(200) NOT NULL,
  cliente_email    VARCHAR(200),
  cliente_telefono VARCHAR(20) NOT NULL,
  cliente_cedula   VARCHAR(20),
  -- Datos de envío
  direccion        TEXT NOT NULL,
  ciudad           VARCHAR(100) NOT NULL,
  departamento     VARCHAR(100) NOT NULL,
  codigo_postal    VARCHAR(10),
  notas            TEXT,
  -- Items y montos
  items            JSONB NOT NULL,
  subtotal         NUMERIC(12,2) NOT NULL,
  descuento_codigo VARCHAR(50),
  descuento_monto  NUMERIC(12,2) DEFAULT 0,
  costo_envio      NUMERIC(12,2) DEFAULT 0,
  total            NUMERIC(12,2) NOT NULL,
  -- Estado
  estado           VARCHAR(30) DEFAULT 'pendiente'
                   CHECK (estado IN ('pendiente','confirmado','en_preparacion','enviado','entregado','cancelado')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLA: configuracion ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS configuracion (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clave        VARCHAR(100) UNIQUE NOT NULL,
  valor        TEXT,
  descripcion  VARCHAR(200),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FUNCIÓN: actualizar updated_at automáticamente ──────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
ALTER TABLE categorias    ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE descuentos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners       ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY "publico_categorias"    ON categorias    FOR SELECT USING (activo = true);
CREATE POLICY "publico_productos"     ON productos     FOR SELECT USING (activo = true);
CREATE POLICY "publico_banners"       ON banners       FOR SELECT USING (activo = true);
CREATE POLICY "publico_config"        ON configuracion FOR SELECT USING (true);
CREATE POLICY "publico_descuentos"    ON descuentos    FOR SELECT USING (activo = true);

-- Política para crear pedidos (cualquier visitante puede crear un pedido)
CREATE POLICY "crear_pedidos_publico" ON pedidos FOR INSERT WITH CHECK (true);

-- NOTA: El service_role_key bypassa RLS automáticamente, por lo que
-- el panel admin (que usa service_role) puede hacer todas las operaciones.

-- ─── FUNCIÓN: Incrementar usos de cupón de descuento ────────────────────────
CREATE OR REPLACE FUNCTION increment_descuento_usos(p_codigo VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE descuentos
  SET usos_actuales = COALESCE(usos_actuales, 0) + 1
  WHERE codigo = p_codigo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── DATOS INICIALES: Configuración ─────────────────────────────────────────
INSERT INTO configuracion (clave, valor, descripcion) VALUES
  ('whatsapp',           '+573209728606',                          'Número de WhatsApp (con código de país)'),
  ('instagram',          'futuremebyleidy',                        'Usuario de Instagram (sin @)'),
  ('facebook',           'FutureMeByLeidySabata',                  'Nombre de página de Facebook'),
  ('tiktok',             '@futuremebyleidy',                       'Usuario de TikTok'),
  ('direccion',          'Los Patios, Norte de Santander',         'Dirección física de la tienda'),
  ('ciudad',             'Los Patios, Colombia',                   'Ciudad donde está la tienda'),
  ('email',              'leidysabata@gmail.com',                  'Email de contacto'),
  ('telefono',           '+573209728606',                          'Teléfono de contacto'),
  ('mapa_url',           '',                                       'URL embed de Google Maps (iframe src)'),
  ('banner_envio',       '🌸 ENVÍO GRATIS en compras superiores a $150.000', 'Texto del banner superior'),
  ('costo_envio',        '8000',                                   'Costo de envío en pesos colombianos'),
  ('envio_gratis_desde', '150000',                                 'Monto mínimo para envío gratis (pesos)')
ON CONFLICT (clave) DO NOTHING;

-- ─── DATOS INICIALES: Categorías ─────────────────────────────────────────────
INSERT INTO categorias (nombre, slug, genero, subcategoria, orden) VALUES
  -- MUJER
  ('Vestidos',          'vestidos',         'mujer',     'vestidos',    1),
  ('Blusas',            'blusas',           'mujer',     'blusas',      2),
  ('Pantalones Mujer',  'pantalones-mujer', 'mujer',     'pantalones',  3),
  ('Faldas',            'faldas',           'mujer',     'faldas',      4),
  ('Shorts Mujer',      'shorts-mujer',     'mujer',     'shorts',      5),
  ('Pijamas Mujer',     'pijamas-mujer',    'mujer',     'pijamas',     6),
  -- HOMBRE
  ('Camisetas',         'camisetas-hombre', 'hombre',    'camisetas',   7),
  ('Pantalones Hombre', 'pantalones-hombre','hombre',    'pantalones',  8),
  ('Shorts Hombre',     'shorts-hombre',    'hombre',    'shorts',      9),
  ('Pijamas Hombre',    'pijamas-hombre',   'hombre',    'pijamas',     10),
  -- INFANTIL
  ('Ropa Niña',         'ropa-nina',        'nino',      NULL,          11),
  ('Ropa Niño',         'ropa-nino',        'nino',      NULL,          12),
  ('Pijamas Infantil',  'pijamas-infantil', 'nino',      'pijamas',     13),
  -- ACCESORIOS
  ('Bolsos',            'bolsos',           'accesorio', 'bolsos',      14),
  ('Accesorios',        'accesorios',       'accesorio', NULL,          15)
ON CONFLICT (slug) DO NOTHING;

-- ─── DATOS INICIALES: Banner de ejemplo ──────────────────────────────────────
INSERT INTO banners (titulo, subtitulo, descripcion, boton1_texto, boton1_url, boton2_texto, boton2_url, orden, activo)
VALUES
  ('Nueva Colección',
   'Estilo que florece todos los días',
   'Ropa cómoda, moderna y versátil para toda la familia.',
   'Ver colección', '/productos',
   'Novedades', '/productos?nuevo=true',
   1, true),
  ('Línea Mujer',
   'Descubre lo nuevo',
   'Vestidos, blusas y más para tu estilo único.',
   'Comprar ahora', '/categoria/vestidos',
   NULL, NULL,
   2, true)
ON CONFLICT DO NOTHING;
