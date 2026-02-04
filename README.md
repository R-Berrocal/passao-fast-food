# 📋 Documentación del Proyecto - PASSAO Fast Food

## 📖 Resumen Funcional

**PASSAO Fast Food** es una aplicación web full-stack para un restaurante de comida rápida colombiana especializado en arepas, perros calientes, patacones y más. La aplicación permite a los clientes explorar el menú, realizar pedidos (delivery o pickup) y a los administradores gestionar productos, categorías, adiciones, pedidos y configuración del negocio.

### Características Principales

#### 👥 Para Clientes
- Exploración del menú con categorías dinámicas
- Carrito de compras con adiciones personalizables
- Checkout con opciones de delivery o pickup
- Pedidos como invitado o usuario registrado
- Guardado de direcciones para usuarios registrados
- Múltiples métodos de pago (efectivo, Nequi, Daviplata, transferencia)

#### 🔐 Para Administradores
- Dashboard con estadísticas en tiempo real
- CRUD completo de productos, categorías y adiciones
- Gestión de pedidos con cambios de estado
- Gestión de usuarios (clientes, staff, administradores)
- Configuración del negocio (contacto, horarios, pagos)
- Analytics de ventas y productos más vendidos

---

## 🛠️ Stack Tecnológico

### Lenguajes

![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Framework Principal

![Next.js](https://img.shields.io/badge/Next.js-16.0-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)

### Base de Datos

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.3.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

### Gestión de Estado

![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.x-FF4154?style=for-the-badge&logo=react-query&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-Latest-000000?style=for-the-badge)

### UI & Estilos

![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-Latest-000000?style=for-the-badge)
![Radix UI](https://img.shields.io/badge/Radix_UI-Latest-161618?style=for-the-badge)

### Gestor de Paquetes

![npm](https://img.shields.io/badge/npm-Latest-CB3837?style=for-the-badge&logo=npm&logoColor=white)

---

## 📦 Librerías y Dependencias Principales

### Core
- **next**: 16.0+ - Framework React con App Router
- **react**: 19.0+ - Librería UI
- **react-dom**: 19.0+ - Renderizado React
- **typescript**: 5.0+ - Tipado estático

### Base de Datos & ORM
- **@prisma/client**: 7.3.0 - Cliente Prisma
- **prisma**: 7.3.0 - ORM y migraciones

### State Management
- **@tanstack/react-query**: 5.x - Server state management
- **zustand**: Latest - Client state management

### Formularios & Validación
- **react-hook-form**: Latest - Gestión de formularios
- **@hookform/resolvers**: Latest - Resolvers para validación
- **zod**: Latest - Validación de esquemas

### UI Components
- **@radix-ui/react-***: Latest - Primitivos UI accesibles
- **lucide-react**: Latest - Iconos
- **next-themes**: Latest - Tema claro/oscuro
- **class-variance-authority**: Latest - Variantes de componentes
- **tailwind-merge**: Latest - Merge de clases Tailwind
- **clsx**: Latest - Utilidad para clases condicionales

### Utilidades
- **bcryptjs**: Latest - Hash de contraseñas
- **jsonwebtoken**: Latest - Autenticación JWT
- **dotenv**: Latest - Variables de entorno

---

## 📁 Estructura del Proyecto

```
passao-fast-food/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   ├── seed.ts                # Datos iniciales
│   └── migrations/            # Migraciones de BD
│
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Landing page
│   │   ├── checkout/          # Flujo de checkout
│   │   ├── api/               # Route handlers (REST API)
│   │   └── admin/
│   │       └── dashboard/     # Panel de administración
│   │           ├── products/  # CRUD productos
│   │           ├── additions/ # CRUD adiciones
│   │           ├── orders/    # Gestión de pedidos
│   │           ├── users/     # Gestión de usuarios
│   │           └── settings/  # Configuración
│   │
│   ├── components/
│   │   ├── ui/                # Componentes shadcn/ui
│   │   ├── providers/         # Providers (Query, Theme, Auth)
│   │   ├── layout/            # Navbar, Hero, Footer
│   │   ├── menu/              # Componentes del menú
│   │   ├── cart/              # Carrito de compras
│   │   └── auth/              # Autenticación
│   │
│   ├── hooks/                 # Custom hooks (TanStack Query)
│   ├── stores/                # Zustand stores
│   ├── lib/
│   │   ├── fetch-functions/   # Funciones de fetch
│   │   ├── validations/       # Esquemas Zod
│   │   ├── query-keys.ts      # Factory de query keys
│   │   ├── query-client.ts    # Cliente TanStack Query
│   │   └── utils.ts           # Utilidades
│   │
│   ├── types/
│   │   └── models.ts          # Tipos TypeScript
│   │
│   └── generated/
│       └── prisma/            # Tipos generados por Prisma
│
├── docs/
│   └── data-model.md          # Documentación del modelo de datos
│
├── public/
│   └── images/                # Imágenes estáticas
│
├── .env                       # Variables de entorno
├── next.config.ts             # Configuración Next.js
├── tailwind.config.ts         # Configuración Tailwind
├── tsconfig.json              # Configuración TypeScript
├── prisma.config.ts           # Configuración Prisma
├── eslint.config.mjs          # Configuración ESLint
├── components.json            # Configuración shadcn/ui
└── package.json               # Dependencias y scripts
```

---

## 🚀 Scripts Disponibles

### Desarrollo
```bash
npm run dev          # Inicia servidor de desarrollo (localhost:3000)
npm run build        # Build de producción (incluye prisma generate)
npm run start        # Inicia servidor de producción
npm run lint         # Ejecuta ESLint
```

### Base de Datos (Prisma)
```bash
npm run db:generate  # Genera cliente Prisma
npm run db:push      # Envía schema a BD (sin migraciones)
npm run db:migrate   # Crea y aplica migraciones
npm run db:seed      # Pobla BD con datos iniciales
npm run db:studio    # Abre Prisma Studio (GUI)
npm run db:reset     # Resetea BD y aplica migraciones
```

---

## 🗄️ Modelo de Datos

El proyecto utiliza PostgreSQL con Prisma ORM. Las entidades principales incluyen:

### Entidades Core
- **User**: Usuarios (admin, staff, customer)
- **Address**: Direcciones de usuarios
- **Category**: Categorías de productos
- **Product**: Productos del menú
- **Addition**: Adiciones/extras personalizables

### Entidades de Pedidos
- **Order**: Pedidos
- **OrderItem**: Items del pedido
- **OrderItemAddition**: Adiciones por item

### Configuración del Negocio
- **BusinessConfig**: Configuración general (singleton)
- **BusinessHours**: Horarios de atención

### Analytics
- **DailySales**: Ventas diarias agregadas
- **ProductSales**: Ventas por producto

Ver documentación completa en [docs/data-model.md](docs/data-model.md).

---

## 🎨 Patrones de Arquitectura

### Data Fetching con TanStack Query
- **Server-side**: Prefetch con `HydrationBoundary` en páginas públicas
- **Client-side**: Hooks custom con optimistic updates
- **Query Keys Factory**: Claves centralizadas en [src/lib/query-keys.ts](src/lib/query-keys.ts)

### State Management
- **Server State**: TanStack Query (productos, pedidos, usuarios)
- **Client State**: Zustand (carrito, preferencias de tema)

### Autenticación
- JWT-based con tokens en localStorage
- Protected routes con componente [ProtectedRoute](src/components/auth/protected-route.tsx)
- Roles: admin, staff, customer

### API Response Type
Todas las respuestas de API utilizan el tipo centralizado:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

## 🌐 Variables de Entorno

Crear un archivo `.env` basado en `exampl.env`:

```env
# Database
DATABASE_URL=

# Direct connection to the database. Used for migrations
DIRECT_URL=

# Auth (para JWT)
JWT_SECRET=
JWT_EXPIRES_IN=

# Admin
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_PHONE=

#Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## 🔒 Seguridad

- Contraseñas hasheadas con bcryptjs
- Autenticación JWT con tokens de corta duración
- Protected routes en el lado del cliente y servidor
- Validación de esquemas con Zod en todas las entradas
- Headers de autenticación en requests a la API

---

## 🎨 Sistema de Diseño

### Theme
- **Modo por defecto**: Dark
- **Toggle**: next-themes con persistencia
- **Color primario**: Lime/Yellow (oklch)
- **Tipografía**: Geist Sans & Geist Mono

### Components
- **Primitivos**: Radix UI (accesibilidad nativa)
- **Estilos**: Tailwind CSS v4 con oklch
- **Variantes**: class-variance-authority (CVA)
- **Utilidad**: `cn()` para merge de clases

---

## 📱 Responsive Design

La aplicación es completamente responsive con breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

---

## 🌍 Localización

- **Idioma**: Español (es-CO)
- **Moneda**: Pesos colombianos (COP) sin decimales
- **Formato de precios**: `$12.000`

---

## 📄 Licencia

Este proyecto es de uso privado para PASSAO Fast Food.

---

## 👨‍💻 Comandos de Desarrollo Rápido

```bash
# Setup inicial
npm install
npm run db:migrate
npm run db:seed

# Desarrollo
npm run dev

# Resetear BD con datos frescos
npm run db:reset

# Ver BD en GUI
npm run db:studio
```

---

## 📚 Recursos Adicionales

- [Documentación Next.js](https://nextjs.org/docs)
- [Documentación Prisma](https://www.prisma.io/docs)
- [Documentación TanStack Query](https://tanstack.com/query/latest)
- [Documentación shadcn/ui](https://ui.shadcn.com)
- [Documentación Tailwind CSS](https://tailwindcss.com/docs)

---

**Última actualización**: Febrero 2026
