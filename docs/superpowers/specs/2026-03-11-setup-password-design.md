# Setup Password — Diseño Técnico

**Fecha:** 2026-03-11
**Estado:** Aprobado

## Problema

El formulario de creación de usuarios en `/admin/dashboard/users/new` indica que si no se proporciona contraseña, el usuario deberá establecerla al iniciar sesión. Sin embargo, el login en `/admin/login` no implementa este flujo — simplemente rechaza a usuarios con `password === null` con un error genérico.

## Solución

Flujo multi-paso en una página dedicada `/admin/setup-password` con verificación de identidad mediante email + teléfono.

## Flujo de Datos

```
/admin/login
  │ Usuario ingresa email (sin contraseña en DB)
  │ POST /api/auth/login → 403 { code: "NO_PASSWORD" }
  │
  └─→ Redirige a /admin/setup-password?email=...
        │
        │ PASO 1: email (pre-llenado) + teléfono
        │ POST /api/auth/setup-password/verify → 200 ok / 400 error
        │
        └─→ PASO 2: nueva contraseña + confirmar
              POST /api/auth/setup-password → 200 ok
              └─→ Redirige a /admin/login?passwordSet=true
```

## Cambios en APIs Existentes

### `POST /api/auth/login`
- **Antes:** cuando `password === null` retorna `401 "Email o contraseña incorrectos"`
- **Después:** retorna `403 { code: "NO_PASSWORD" }` para distinguirlo de credenciales incorrectas

### `src/app/admin/login/page.tsx`
- Al recibir `code: "NO_PASSWORD"` → redirige a `/admin/setup-password?email=...`
- Al recibir query param `?passwordSet=true` → muestra alerta de éxito: *"Contraseña establecida correctamente. Ya puedes iniciar sesión."*

## Nuevos Endpoints

### `POST /api/auth/setup-password/verify`
- **Body:** `{ email, phone }`
- **Validaciones:**
  - Usuario existe con ese email
  - Teléfono coincide con el del usuario
  - `password === null` (cuenta sin contraseña)
  - Estado de cuenta es `active`
- **Respuestas:**
  - `200 ok`
  - `400 "Datos incorrectos"` (mensaje genérico — no revelar si email existe)
  - `403 "Tu cuenta no está activa. Contacta al administrador."`

### `POST /api/auth/setup-password`
- **Body:** `{ email, phone, password, confirmPassword }`
- **Validaciones:** re-valida email+teléfono (no confía en estado cliente), luego hashea y guarda la contraseña
- **Respuestas:**
  - `200 ok`
  - `400` errores de validación
  - `403` cuenta inactiva

## Nueva Página

### `src/app/admin/setup-password/page.tsx`
- Patrón client-only (sin SSR prefetch)
- Recibe `?email=...` como query param
- Estado interno: `step: 1 | 2`, `verifiedEmail`, `verifiedPhone`

**Paso 1 — Verificar identidad:**
- Campos: `email` (pre-llenado, editable), `phone`
- Schema: `verifyIdentitySchema`
- Submit → `POST /api/auth/setup-password/verify`
- Si ok → avanza a paso 2

**Paso 2 — Crear contraseña:**
- Campos: `password`, `confirmPassword`
- Schema: `setupPasswordSchema`
- Submit → `POST /api/auth/setup-password`
- Si ok → redirige a `/admin/login?passwordSet=true`

## Schemas de Validación

Archivo nuevo: `src/lib/validations/auth.ts`

```typescript
verifyIdentitySchema: {
  email: string (email válido),
  phone: string (min 10 chars)
}

setupPasswordSchema: {
  email: string,
  phone: string (min 10),
  password: string (min 6),
  confirmPassword: string
} + refinement: password === confirmPassword
```

## Casos Borde

| Situación | Comportamiento |
|-----------|---------------|
| Cuenta ya tiene contraseña | `/verify` retorna `400` — *"Esta cuenta ya tiene contraseña configurada"* |
| Email no existe | `/verify` retorna `400` genérico (no revelar si email existe) |
| Teléfono no coincide | `/verify` retorna `400` genérico |
| Cuenta inactiva o baneada | `/verify` retorna `403` — *"Tu cuenta no está activa"* |
| Query param `?email=` ausente | Campo email vacío, usuario lo llena manualmente |
| Acceso directo al paso 2 | Imposible — paso 2 solo se renderiza si `step === 2` (estado cliente) |
| Manipulación de email+phone en paso 2 | `/setup-password` re-valida antes de actualizar |

## Archivos Afectados

### Modificados
- `src/app/api/auth/login/route.ts` — nuevo código de error `NO_PASSWORD`
- `src/app/admin/login/page.tsx` — manejo de `NO_PASSWORD` y `?passwordSet=true`

### Creados
- `src/app/api/auth/setup-password/verify/route.ts`
- `src/app/api/auth/setup-password/route.ts`
- `src/app/admin/setup-password/page.tsx`
- `src/lib/validations/auth.ts`
