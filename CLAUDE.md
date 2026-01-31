# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Architecture

This is a **Passao Fast Food** web application built with Next.js 16 App Router. It's a UI-only prototype with mocked data (no backend).

### Tech Stack
- Next.js 16 with App Router and React 19
- TypeScript with strict mode
- Tailwind CSS v4 with `@theme inline` for CSS variables
- shadcn/ui components (Radix UI primitives)
- Zustand for global state management
- next-themes for dark/light mode

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with ThemeProvider
│   ├── page.tsx            # Landing page (Navbar, Hero, MenuList, Footer)
│   ├── checkout/           # Checkout page (delivery/pickup forms)
│   └── admin/              # Admin panel (order management UI)
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── layout/             # Navbar, Hero, Footer
│   ├── menu/               # MenuItem, MenuList, AddToCartDialog
│   ├── cart/               # Cart drawer component
│   └── providers/          # ThemeProvider wrapper
├── stores/
│   └── use-cart-store.ts   # Zustand store for cart + UI state
├── data/
│   ├── menu.ts             # Menu items, categories, additions, formatPrice()
│   └── orders.ts           # Mock orders for admin panel
└── lib/
    └── utils.ts            # cn() utility for classnames
```

### Key Patterns

**Cart State (Zustand)**: Each cart item gets a unique `cartItemId` to allow the same product with different additions to exist separately. The store also manages cart drawer open/close state.

**Theme**: Dark mode is default. Primary color is yellow (oklch ~90 hue). Light mode uses yellow navbar with dark text. Theme toggle uses CSS classes (`dark:block`/`block dark:hidden`) instead of useState to avoid hydration issues.

**Menu Data**: Categories include arepas, perros, patacones, suizos, desgranados, salchipapas. Additions (adiciones) are selected via dialog when adding items to cart.

**Images**: Menu items use Unsplash URLs. Remote patterns configured in `next.config.ts`.

### Path Alias
Use `@/*` to import from `src/*` (configured in tsconfig.json).
