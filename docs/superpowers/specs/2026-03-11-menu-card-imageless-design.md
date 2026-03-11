# Spec: Tarjeta de Menú sin Imágenes — Diseño Tipográfico Minimalista

**Fecha:** 2026-03-11
**Estado:** Aprobado

## Contexto

Las imágenes de productos son mocks de Unsplash y todas lucen igual, lo que no representa fielmente el menú real. Para poder lanzar la página al público sin esperar a tener fotos reales, se elimina la dependencia de imágenes y se rediseña la tarjeta con un enfoque tipográfico.

## Objetivo

Rediseñar el componente `MenuItem` para que sea visualmente atractivo y fácil de usar sin imágenes, manteniendo la misma experiencia de pedido.

## Decisiones de diseño

| Decisión | Elección |
|---|---|
| Estilo general | Tipográfico bold — sin imagen, el nombre protagoniza |
| Información visible | Completa: nombre + descripción (2 líneas) + precio |
| Área superior | Sin área superior — diseño plano, empieza directo con el nombre |
| Interacción | Toda la tarjeta es clickeable; hover con borde primary + escala sutil |

## Diseño de la tarjeta

```
┌─────────────────────────────┐
│                             │
│  Hamburguesa Clásica        │  ← text-xl font-bold text-foreground
│                             │
│  Carne 100% res, lechuga,   │  ← text-sm text-muted-foreground
│  tomate y salsa especial    │     line-clamp-2
│                             │
│  $18.500                    │  ← text-lg font-bold text-primary
│                             │
└─────────────────────────────┘
```

### Estado hover

- Borde en color primario (lime) — reemplaza sombra genérica
- `scale-[1.02]` para sentido de elevación
- `transition-all duration-200`
- `cursor-pointer` ya presente

## Cambios por archivo

### `src/components/menu/menu-item.tsx`

- **Eliminar:** bloque `<div className="relative h-40 w-full overflow-hidden">` completo (imagen + botón flotante)
- **Eliminar:** import de `Image` de next/image
- **Eliminar:** import de `Plus` de lucide-react y el `<Button>` flotante
- **Modificar padding:** `p-4` → `p-5` o `p-6`
- **Modificar nombre:** `font-semibold` → `text-xl font-bold`
- **Modificar hover Card:** agregar `hover:border-primary hover:scale-[1.02]`
- El `onClick` en `<Card>` ya existe y abre `AddToCartDialog` — no cambia

### `src/components/menu/menu-list.tsx`

- Ajustar altura del skeleton de loading: `h-64` → `h-36` (sin imagen la tarjeta es más corta)

### Sin cambios

- `AddToCartDialog` — intacto
- `MenuSection` — intacto
- Grid de columnas (1/2/3) — intacto
- Lógica de datos y hooks — intactos

## Skills a aplicar en implementación

- **frontend-design**: para asegurar que el resultado final tenga calidad de producción y no luzca genérico
- **simplify**: revisar el componente final para eliminar imports muertos y código innecesario tras la limpieza
