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
- Zustand for global state management
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
    │   ├── layout.tsx          # Root layout with ThemeProvider
    │   ├── page.tsx            # Landing page (menu browsing)
    │   ├── checkout/           # Checkout flow (delivery/pickup)
    │   ├── api/                # Route handlers (REST API)
    │   └── admin/
    │       └── dashboard/      # Full admin dashboard
    │           ├── layout.tsx  # Sidebar navigation layout
    │           ├── products/   # CRUD products
    │           ├── orders/     # Order management
    │           └── users/      # User management
    ├── components/
    │   ├── ui/                 # shadcn/ui primitives
    │   ├── layout/             # Navbar, Hero, Footer
    │   ├── menu/               # MenuItem, MenuList, AddToCartDialog
    │   └── cart/               # Cart drawer
    ├── stores/
    │   └── use-cart-store.ts   # Zustand store (cart + UI state)
    ├── types/
    │   └── models.ts           # TypeScript types and helpers
    ├── data/                   # Mock data (deprecated, use DB)
    └── lib/
        ├── utils.ts            # cn() utility for classnames
        └── prisma.ts           # Prisma client singleton
```

### Two Main User Flows

1. **Customer Flow**: Landing → Browse menu by category → Add items with additions → Cart → Checkout (delivery/pickup forms)

2. **Admin Flow**: `/admin/dashboard` → Sidebar navigation → Products/Orders/Users/Settings management

### Key Patterns

**Cart State (Zustand)**: Each cart item gets a unique `cartItemId` to allow the same product with different additions. Store also manages cart drawer open/close state.

**Theme**: Dark mode default. Primary color is lime/yellow (oklch). Toggle uses CSS classes (`dark:block`/`block dark:hidden`) to avoid hydration issues. Theme state shared globally via next-themes provider.

**Auth UI**: Navbar includes login/register dialogs. Authentication to be implemented with JWT.

**Database**: PostgreSQL with Prisma ORM. Schema in `prisma/schema.prisma`. Types and helpers in `src/types/models.ts`. Run `npm run db:seed` after migrations to populate initial data.

**Component Pattern**: UI primitives in `components/ui/` follow shadcn/ui conventions with Radix UI, CVA variants, and the `cn()` utility.

**Images**: Unsplash URLs. Remote patterns configured in `next.config.ts`.

**Locale**: Spanish (es-CO) for price formatting and UI text.

### Path Alias
Use `@/*` to import from `src/*` (configured in tsconfig.json).

## Rules

- Al momento de crear datos nuevos no uses Modales, usa paginas dedicadas para los formularios 
- no uses server actions, usa Route handlers
- para manejo de estado global usa Zustand
- para formularios usar react-hook-form y zod
- para las migraciones con prisma debes cambiar la variable de entorno por DIRECT_URL