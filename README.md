# 🌸 FutureMe by Leidy Sabata

Tienda de ropa en línea con panel de administración completo. Desplegable en Vercel.

---

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env.local
```
Edita `.env.local` con tus credenciales (ver sección de Supabase abajo).

### 3. Configurar la base de datos (Supabase)
1. Crea una cuenta gratis en [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a **SQL Editor** → **New Query**
4. Copia y pega el contenido de `supabase/schema.sql` y ejecuta
5. Copia las claves de **Settings → API** a tu `.env.local`

### 4. Ejecutar en desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000)

---

## 🗂️ Estructura del Proyecto

```
futureme/
├── src/
│   ├── app/
│   │   ├── (tienda)/          # 🛍️ Tienda pública (frontend)
│   │   ├── (admin)/           # 🔐 Panel de administración (backend)
│   │   └── api/               # 🔌 API routes
│   ├── components/
│   │   ├── tienda/            # Componentes del frontend
│   │   └── admin/             # Componentes del admin
│   ├── lib/                   # Supabase, utilidades
│   ├── store/                 # Zustand (carrito)
│   └── types/                 # TypeScript types
├── supabase/
│   └── schema.sql             # Esquema de base de datos
├── public/                    # Imágenes y assets
└── .env.example               # Variables de entorno de ejemplo
```

---

## 🌐 Despliegue en Vercel

### Paso 1: Subir a GitHub
```bash
git init
git add .
git commit -m "Initial commit: FutureMe by Leidy Sabata"
git remote add origin https://github.com/tu-usuario/futureme.git
git push -u origin main
```

### Paso 2: Conectar en Vercel
1. Ve a [vercel.com](https://vercel.com) y crea cuenta
2. Click **"Add New Project"**
3. Importa tu repositorio de GitHub
4. Framework: **Next.js** (se detecta automáticamente)

### Paso 3: Variables de entorno en Vercel
En el dashboard de Vercel → Settings → Environment Variables, agrega:

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role de Supabase |
| `NEXTAUTH_URL` | URL de tu sitio en Vercel (ej: https://futureme.vercel.app) |
| `NEXTAUTH_SECRET` | Secreto aleatorio (genera con `openssl rand -base64 32`) |
| `ADMIN_EMAIL` | Email del administrador |
| `ADMIN_PASSWORD` | Contraseña del administrador |
| `NEXT_PUBLIC_WHATSAPP` | Número de WhatsApp con código de país (+57...) |

### Paso 4: Deploy
Click **Deploy** — ¡listo! 🎉

---

## 🔐 Panel de Administración

Accede en `/admin/login` con las credenciales configuradas en `.env.local`.

### Funcionalidades del Admin:
- 📦 **Productos**: crear, editar, eliminar productos con imágenes, tallas y colores
- 🗂️ **Categorías**: gestionar categorías por línea (Mujer, Hombre, Infantil, Accesorios)
- 🛒 **Pedidos**: ver todos los pedidos con datos completos de envío, actualizar estado
- 🏷️ **Descuentos**: crear códigos de descuento por porcentaje o valor fijo
- 🖼️ **Banners**: gestionar los banners del hero slider
- ⚙️ **Configuración**: WhatsApp, redes sociales, dirección, costos de envío

---

## 🛍️ Funcionalidades de la Tienda

- **Carrito de compras** con persistencia en localStorage
- **Checkout contra entrega** en 4 pasos (inspirado en Shopify)
- **Códigos de descuento** aplicables en el checkout
- **Pantalla de splash** animada al abrir la página
- **Botón de WhatsApp** flotante
- **Guía de tallas** (Mujer, Hombre, Infantil)
- **Filtros de productos** por categoría, talla, color, precio
- **Responsive**: optimizado para móvil y escritorio

---

## 🎨 Paleta de Colores

| Color | HEX | Uso |
|---|---|---|
| Blanco Tulipán | `#FFF9F7` | Fondo principal |
| Crema | `#F4E9E5` | Fondo secundario |
| Rosa Tulipán | `#E8B7C8` | Botones, acentos |
| Rosa Pétalo | `#D98FA8` | Hover, detalles |
| Verde Salvia | `#A8B5A0` | Acento secundario |
| Negro Carbón | `#171516` | Texto, botones oscuros |

---

## 📞 Soporte

Para consultas: FutureMe by Leidy Sabata
