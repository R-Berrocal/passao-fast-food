# Kitchen Display — Design Spec
**Date:** 2026-03-17

## Overview

A read-only, fullscreen kitchen display at `/kitchen` optimized for a tablet mounted on the wall. Shows only active orders the cook needs to prepare. No interaction required — the waitress manages state changes from the admin dashboard on her phone.

## Problem

The cook needs to see pending orders at a glance from ~1 meter away without touching the screen (wears fabric gloves, incompatible with capacitive touchscreens). The existing admin orders dashboard has too much UI noise (filters, menus, stats) and is not readable at distance.

## Decisions Made

- **Read-only** — no buttons, no state changes from this screen
- **Statuses shown**: `pending`, `confirmed`, `preparing` — orders disappear when they reach `ready`
- **Single column list** — maximum text size wins over information density
- **No authentication** — fixed internal tablet, treated like a kitchen display board
- **State management**: waitress handles all status updates from admin dashboard on her phone

## Architecture

```
src/app/kitchen/
├── page.tsx           # client-only wrapper, no SSR prefetch
└── page-content.tsx   # client component
```

- Reuses existing `useOrders` hook — filters client-side for `pending | confirmed | preparing`
- Auto-refresh every 60 seconds already built into `useOrders`
- No new API routes needed

## Visual Design

### Layout
- Forced dark theme regardless of system preference
- Full viewport, no navbar, no sidebar
- Minimal top bar: "COCINA" label (left) · live clock hh:mm (center) · last refresh indicator (right)
- Cards stacked vertically, full width, scrollable if needed

### Card Anatomy
```
┌──────────────────────────────────────────────┐
│  #ORD-042    🕐 hace 8 min    📦 PARA LLEVAR │
│ ──────────────────────────────────────────── │
│  2x  Arepa de Choclo                         │
│       + Hogao  · + Queso extra               │
│  1x  Perro Especial                          │
│       + Mostaza  · + Papas                   │
│ ──────────────────────────────────────────── │
│  📝  Sin cebolla en todo                     │
└──────────────────────────────────────────────┘
```

### Status Colors (left border)
| Status | Color |
|--------|-------|
| `pending` | Amber/yellow |
| `confirmed` | Blue |
| `preparing` | Green |

### Delay Alert
- Orders older than **20 minutes**: border and elapsed time turn red
- Visual only, no sound

### Sort Order
Oldest order at top (ascending `createdAt`).

## Out of Scope
- Sound/audio alerts
- "Listo" button or any state mutation
- Authentication
- Filters or search
