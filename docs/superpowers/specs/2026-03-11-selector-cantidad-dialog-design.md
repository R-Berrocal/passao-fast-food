# Selector de Cantidad en el Dialog de Agregar al Carrito

**Fecha:** 2026-03-11
**Estado:** Aprobado

## Problema

Actualmente el cliente solo puede agregar 1 unidad por interacción con el dialog. Para agregar más del mismo producto con las mismas adiciones, debe abrir el dialog nuevamente. Esto es un paso extra innecesario.

## Solución

Agregar un contador `[−] cantidad [+]` dentro del `AddToCartDialog`, ubicado en la misma fila que el Total. El total se actualiza en tiempo real a medida que cambia la cantidad.

## Layout

```
├─────────────────────────────────┤
│ Total  [−] 1 [+]      $ 6.000  │
├─────────────────────────────────┤
```

Fórmula del total: `cantidad × (precio_base + total_adiciones)`

## Cambios Requeridos

### 1. `src/components/menu/add-to-cart-dialog.tsx`
- Agregar estado `quantity`: `useState(1)`, mínimo 1, máximo 10
- Resetear `quantity` a 1 al cerrar el dialog
- Reemplazar la fila estática del Total con: label + controles `[−] qty [+]` + precio dinámico
- Pasar `quantity` a `addItem`

### 2. `src/stores/use-cart-store.ts`
- Extender firma de `addItem`: `addItem(item, additions?, quantity?)`
- `quantity` por defecto en 1 (retrocompatible)
- Usar el parámetro `quantity` en lugar del hardcodeado `1` al crear el `newItem`

## Restricciones

- Rango de cantidad: 1–10
- `[−]` deshabilitado en 1 (no puede bajar de 1)
- Sin cambios en el drawer del carrito (ya tiene controles de cantidad)
- Sin cambios en la página de checkout
