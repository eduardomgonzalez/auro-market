# AuroMarket 🛒

E-commerce moderno construido con Next.js 16, React 19 y Tailwind CSS 4.

## 🚀 Características

- ✅ **Autenticación** - Login con Google OAuth y credenciales (NextAuth.js v5)
- ✅ **Catálogo de productos** - Gestión completa con imágenes
- ✅ **Carrito de compras** - Persistente en localStorage
- ✅ **Checkout con Mercado Pago** - Pagos seguros en ARS
- ✅ **Panel de administración** - Gestión de productos, pedidos y usuarios
- ✅ **Base de datos** - PostgreSQL con Prisma ORM (Supabase)

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: API Routes de Next.js
- **Base de datos**: PostgreSQL (Supabase) + Prisma
- **Autenticación**: NextAuth.js v5
- **Pagos**: Mercado Pago Checkout Pro
- **Imágenes**: Unsplash + uploads locales

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/auro-market.git
cd auro-market

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Iniciar desarrollo
npm run dev
```

## 🔧 Variables de Entorno

```env
# Base de datos (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Autenticación
AUTH_SECRET="genera-con-openssl"
AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Mercado Pago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="..."
MERCADOPAGO_ACCESS_TOKEN="..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Admin
ADMIN_EMAILS="tu@email.com"
```

## 🗄️ Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones
npx prisma migrate dev --name init

# Ver datos en Studio
npx prisma studio
```

## 🚀 Despliegue

Desplegar en Vercel:

1. Importar repositorio en [vercel.com](https://vercel.com)
2. Agregar variables de entorno
3. Deploy automático

## 📁 Estructura

```
auro-market/
├── src/
│   ├── app/              # Rutas y páginas
│   ├── components/        # Componentes React
│   ├── context/           # Contextos (cart, auth)
│   ├── lib/               # Utilidades y conexión BD
│   └── types/             # Tipos TypeScript
├── prisma/                # Schema de base de datos
└── public/                # Archivos estáticos
```

## 📄 Licencia

MIT - Eduardo González
