# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build (includes prisma generate)
npm run start        # Start production server
npm run lint         # Run ESLint

# Database (Prisma)
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database (no migrations)
npm run db:migrate   # Create and apply migrations
npm run db:seed      # Seed database with initial data
npm run db:studio    # Open Prisma Studio (GUI)
npm run db:reset     # Reset database and apply migrations
```

## Architecture

**Passao Fast Food** - A Next.js 16 App Router web application for a Colombian fast food restaurant. Full-stack with PostgreSQL database.

### Tech Stack
- Next.js 16 with App Router and React 19
- TypeScript with strict mode
- PostgreSQL + Prisma ORM
- Tailwind CSS v4 with oklch color system
- shadcn/ui components (Radix UI primitives)
- **TanStack Query** for server state management (data fetching, caching, mutations)
- Zustand for client-side UI state (cart, theme preferences)
- next-themes for dark/light mode
- react-hook-form + zod for form handling
- lucide-react for icons

### Directory Structure

```
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Initial data seed
├── docs/
│   └── data-model.md           # Data model documentation
└── src/
    ├── app/
    │   ├── layout.tsx          # Root layout with providers
    │   ├── page.tsx            # Landing page (menu browsing)
    │   ├── checkout/           # Checkout flow (delivery/pickup)
    │   ├── api/                # Route handlers (REST API)
    │   └── admin/
    │       └── dashboard/      # Full admin dashboard
    │           ├── layout.tsx  # Sidebar navigation layout
    │           ├── products/   # CRUD products
    │           ├── additions/  # CRUD additions
    │           ├── categories/ # CRUD categories
    │           ├── orders/     # Order management
    │           └── users/      # User management
    ├── components/
    │   ├── ui/                 # shadcn/ui primitives
    │   ├── providers/          # QueryProvider, ThemeProvider, AuthProvider
    │   ├── layout/             # Navbar, Hero, Footer
    │   ├── menu/               # MenuItem, MenuList, AddToCartDialog
    │   └── cart/               # Cart drawer
    ├── hooks/                  # TanStack Query hooks (useProducts, useCategories, etc.)
    ├── stores/
    │   ├── use-cart-store.ts   # Zustand store (cart + UI state)
    │   └── use-auth-store.ts   # Auth state and helpers
    ├── types/
    │   └── models.ts           # TypeScript types, ApiResponse<T>, and helpers
    └── lib/
        ├── utils.ts            # cn() utility for classnames
        ├── prisma.ts           # Prisma client singleton
        ├── query-client.ts     # TanStack Query client singleton
        ├── query-keys.ts       # Query key factory for cache management
        └── fetch-functions.ts  # Server-side fetch functions for SSR prefetch
```

### Two Main User Flows

1. **Customer Flow**: Landing → Browse menu by category → Add items with additions → Cart → Checkout (delivery/pickup forms)

2. **Admin Flow**: `/admin/dashboard` → Sidebar navigation → Products/Orders/Users/Settings management

### Key Patterns

#### Data Fetching with TanStack Query

All data fetching uses TanStack Query for caching, optimistic updates, and automatic refetching.

**Hook Pattern** (`src/hooks/use-*.ts`):
```typescript
// Query for fetching data
const query = useQuery({
  queryKey: queryKeys.products.list(options),
  queryFn: () => fetchProducts(options),
});

// Mutations with optimistic updates
const createMutation = useMutation({
  mutationFn: async (data) => { ... },
  onMutate: async (newData) => { /* optimistic update */ },
  onError: (err, data, context) => { /* rollback */ },
  onSuccess: () => { queryClient.invalidateQueries(...) },
});
```

**SSR Prefetching Pattern** (solo para páginas públicas donde importa SEO):
```typescript
// Server Component (page.tsx) - SOLO para páginas públicas como landing/menu
export default async function Page() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.products.list(),
    queryFn: () => fetchProducts(),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageContent />
    </HydrationBoundary>
  );
}
```

**Client-Only Pattern** (para admin dashboards - mejor caching):
```typescript
// page.tsx - Simple, sin SSR prefetch
import { PageContent } from "./page-content";
export default function Page() {
  return <PageContent />;
}

// page-content.tsx - Client component con useQuery
"use client";
export function PageContent() {
  const { products } = useProducts(); // TanStack Query maneja caching
  ...
}
```

**Cuándo usar cada patrón:**
- **SSR Prefetch**: Páginas públicas (landing, menú) donde SEO importa
- **Client-Only**: Admin dashboards donde el caching entre navegaciones es más importante

**Query Keys Factory** (`src/lib/query-keys.ts`):
- Centralized query keys for type safety and cache management
- Hierarchical structure: `queryKeys.products.list()`, `queryKeys.products.detail(id)`

#### State Management

- **Server State (TanStack Query)**: Products, categories, orders, users - anything from the API
- **Client State (Zustand)**: Cart items, UI toggles, user preferences

**Cart State (Zustand)**: Each cart item gets a unique `cartItemId` to allow the same product with different additions. Store also manages cart drawer open/close state.

#### Other Patterns

**Theme**: Dark mode default. Primary color is lime/yellow (oklch). Toggle uses CSS classes (`dark:block`/`block dark:hidden`) to avoid hydration issues. Theme state shared globally via next-themes provider.

**Auth UI**: Navbar includes login/register dialogs. JWT-based authentication with admin route protection.

**Database**: PostgreSQL with Prisma ORM. Schema in `prisma/schema.prisma`. Types and helpers in `src/types/models.ts`. Run `npm run db:seed` after migrations to populate initial data.

**Component Pattern**: UI primitives in `components/ui/` follow shadcn/ui conventions with Radix UI, CVA variants, and the `cn()` utility.

**API Response Type**: Use the centralized `ApiResponse<T>` from `@/types/models` for all API responses.

**Images**: Unsplash URLs. Remote patterns configured in `next.config.ts`.

**Locale**: Spanish (es-CO) for price formatting and UI text.

### Path Alias
Use `@/*` to import from `src/*` (configured in tsconfig.json).

## Rules

- Al momento de crear datos nuevos no uses Modales, usa paginas dedicadas para los formularios
- no uses server actions, usa Route handlers
- para manejo de estado global de UI usa Zustand, para estado del servidor usa TanStack Query
- para formularios usar react-hook-form y zod
- para las migraciones con prisma debes cambiar la variable de entorno por DIRECT_URL
- usar el tipo `ApiResponse<T>` de `@/types/models` para todas las respuestas de API
- para crear hooks de datos, seguir el patrón de TanStack Query con optimistic updates
- para páginas admin, usar el patrón client-only (sin SSR prefetch) para mejor caching
- para páginas públicas (landing, menú), usar SSR prefetch con `HydrationBoundary`
