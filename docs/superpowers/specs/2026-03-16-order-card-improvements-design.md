# Order Card Improvements Design

**Date:** 2026-03-16
**Status:** Approved
**Scope:** `/admin/dashboard/orders` — stats section + order card content

## Context

The admin orders dashboard is primarily used on mobile. The current order card does not show customer notes, admin notes, or product additions. Staff must tap "Ver detalle" to access this info, which is slow on mobile. Additionally, the 4 stats cards take too much vertical space on mobile.

## Goals

1. Show product additions inline in the order card
2. Show customer notes and admin notes in the card (when they exist)
3. Compact the stats section for mobile

---

## Design

### 1. Stats Section

**Mobile (`grid-cols-2`) and Desktop (`grid-cols-4`)**

Replace the current large stat cards with compact chips (~40px tall each):

```
┌─────────────────────┐  ┌─────────────────────┐
│ 🟡 Pendientes   [5] │  │ 🔵 Preparando   [3] │
└─────────────────────┘  └─────────────────────┘
┌─────────────────────┐  ┌─────────────────────┐
│ 🟢 Listos       [2] │  │ ⚫ Entregados    [8] │
└─────────────────────┘  └─────────────────────┘
```

Each chip contains:
- Small colored icon (same color scheme: yellow, blue, green, gray)
- Label in `text-sm`
- Count in `font-bold text-lg` aligned to the right
- `grid-cols-4` on `lg:` breakpoint, `grid-cols-2` on mobile

---

### 2. Order Card — Products Section

Below the existing card content, add a products section with additions inline:

```
📦 Productos
┌────────────────────────────────────────┐
│  2x Hamburguesa Clásica      $28.000  │
│     + Queso extra, Salsa picante      │
│  1x Desgranado especial      $18.000  │
│     + Butifarra, Carne                │
│  1x Papas Medianas            $8.000  │
└────────────────────────────────────────┘
```

**Rules:**
- Product list container: `max-h-[140px] overflow-y-auto` to prevent oversized cards on large orders
- Each item: one line with quantity, name, and price
- Additions (if any): line below, indented, `text-xs text-muted-foreground`, format `+ Adición1, Adición2`
- Additions line uses `break-words` to wrap within the card width — never overflows horizontally
- If item has no additions: nothing extra rendered

---

### 3. Order Card — Notes Section

Rendered **only when the field has content**. Both note types can coexist.

**Customer note:**
- Background: `bg-muted/50`
- Icon: `MessageCircle` (lucide-react)
- Label: "Nota del cliente"
- Text: customer's note content

**Admin note:**
- Background: `bg-amber-50 dark:bg-amber-950/20`
- Icon: `Lock` (lucide-react)
- Label: "Nota del admin"
- Text: admin's internal note
- Visually distinct to communicate it's internal/staff-only

Both notes appear after the products section, before the total.

---

## Files to Modify

- `src/app/admin/dashboard/orders/page.tsx`
  - `OrderCard` component (inline, lines ~71–239): add additions display and notes sections
  - Stats section (lines ~362–411): replace with compact 2x2 chips

## Data Available

All required data is already present in `OrderWithItems`:
- `items[].additions[]` — `additionName`, `price`
- `notes` — customer note (optional)
- `adminNotes` — admin internal note (optional)

No API or schema changes required.
