# Modelo de Datos - PASSAO Fast Food

## Diagrama de Entidades

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MODELO DE DATOS                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      USER        │       │     CATEGORY     │       │     PRODUCT      │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id               │       │ id               │       │ id               │
│ name             │       │ name             │       │ name             │
│ email (unique)   │       │ slug (unique)    │       │ description?     │
│ password?        │       │ description?     │       │ price            │
│ phone            │       │ image?           │       │ image            │
│ role             │       │ displayOrder     │       │ categoryId ──────────┐
│ status           │       │ isActive         │       │ isActive         │   │
│ createdAt        │       │ createdAt        │       │ isAvailable      │   │
│ updatedAt        │       │ updatedAt        │       │ displayOrder     │   │
└────────┬─────────┘       └──────────────────┘       │ createdAt        │   │
         │                        ▲                   │ updatedAt        │   │
         │                        │                   └──────────────────┘   │
         │                        └──────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐              ┌──────────────────┐
│     ADDRESS      │              │     ADDITION     │
├──────────────────┤              ├──────────────────┤
│ id               │              │ id               │
│ userId      ─────┤              │ name             │
│ label            │              │ price            │
│ street           │              │ image?           │
│ neighborhood     │              │ isActive         │
│ city             │              │ displayOrder     │
│ details?         │              │ createdAt        │
│ isDefault        │              │ updatedAt        │
│ createdAt        │              └────────┬─────────┘
└────────┬─────────┘                       │
         │                                 │
         │                                 │
         ▼                                 ▼
┌──────────────────┐       ┌──────────────────────────┐
│      ORDER       │       │      ORDER_ITEM          │
├──────────────────┤       ├──────────────────────────┤
│ id               │       │ id                       │
│ orderNumber      │       │ orderId            ──────┤
│ userId?     ─────┤       │ productId          ──────┤
│ addressId?  ─────┤       │ productName (snapshot)   │
│ customerName     │       │ quantity                 │
│ customerPhone    │       │ unitPrice                │
│ customerEmail?   │       │ totalPrice               │
│ type             │       │ createdAt                │
│ deliveryAddress? │       └──────────────────────────┘
│ subtotal         │                  │
│ deliveryFee      │                  │ 1:N
│ discount         │                  ▼
│ total            │       ┌──────────────────────────┐
│ status           │       │   ORDER_ITEM_ADDITION    │
│ notes?           │       ├──────────────────────────┤
│ adminNotes?      │       │ id                       │
│ paymentMethod    │       │ orderItemId        ──────┤
│ paymentStatus    │       │ additionId         ──────┤
│ paymentReference?│       │ additionName (snapshot)  │
│ createdAt        │       │ price                    │
│ confirmedAt?     │       └──────────────────────────┘
│ preparingAt?     │
│ readyAt?         │
│ deliveredAt?     │
│ cancelledAt?     │
│ updatedAt        │
└──────────────────┘


┌──────────────────┐       ┌──────────────────┐
│  BUSINESS_HOURS  │       │  BUSINESS_CONFIG │
├──────────────────┤       ├──────────────────┤
│ id               │       │ id (singleton)   │
│ dayOfWeek        │       │ name             │
│ isOpen           │       │ phone            │
│ openTime?        │       │ email            │
│ closeTime?       │       │ address          │
└──────────────────┘       │ city             │
                           │ deliveryFee      │
                           │ minOrderAmount   │
┌──────────────────┐       │ nequiNumber?     │
│   DAILY_SALES    │       │ daviplataNumber? │
├──────────────────┤       │ bankName?        │
│ id               │       │ bankAccountNumber│
│ date             │       │ bankAccountType? │
│ totalOrders      │       │ bankAccountHolder│
│ totalRevenue     │       │ updatedAt        │
│ deliveryOrders   │       └──────────────────┘
│ pickupOrders     │
│ cancelledOrders  │
│ averageOrderValue│
└──────────────────┘

┌──────────────────┐
│  PRODUCT_SALES   │
├──────────────────┤
│ id               │
│ productId        │
│ productName      │
│ date             │
│ quantitySold     │
│ revenue          │
└──────────────────┘
```

---

## Enums

### UserRole
| Valor | Descripción |
|-------|-------------|
| `admin` | Administrador del sistema |
| `staff` | Personal del restaurante |
| `customer` | Cliente |

### UserStatus
| Valor | Descripción |
|-------|-------------|
| `active` | Usuario activo |
| `inactive` | Usuario inactivo |
| `banned` | Usuario bloqueado |

### OrderStatus
| Valor | Descripción |
|-------|-------------|
| `pending` | Pedido recibido, esperando confirmación |
| `confirmed` | Pedido confirmado por el restaurante |
| `preparing` | Pedido en preparación |
| `ready` | Pedido listo para entrega/recogida |
| `delivered` | Pedido entregado |
| `cancelled` | Pedido cancelado |

### OrderType
| Valor | Descripción |
|-------|-------------|
| `delivery` | Entrega a domicilio |
| `pickup` | Recoger en tienda |

### PaymentMethod
| Valor | Descripción |
|-------|-------------|
| `cash` | Pago en efectivo |
| `nequi` | Pago por Nequi |
| `daviplata` | Pago por Daviplata |
| `transfer` | Transferencia bancaria |

### PaymentStatus
| Valor | Descripción |
|-------|-------------|
| `pending` | Pago pendiente de confirmación |
| `confirmed` | Pago confirmado |
| `rejected` | Pago rechazado |

### DayOfWeek
| Valor | Español |
|-------|---------|
| `monday` | Lunes |
| `tuesday` | Martes |
| `wednesday` | Miércoles |
| `thursday` | Jueves |
| `friday` | Viernes |
| `saturday` | Sábado |
| `sunday` | Domingo |

---

## Descripción de Entidades

### User
Usuarios del sistema. Pueden ser administradores, personal o clientes.
- **password**: Solo requerido para login. Null si el usuario fue creado por admin.
- Los clientes pueden hacer pedidos como invitados (sin registro).

### Address
Direcciones guardadas de los usuarios registrados.
- Un usuario puede tener múltiples direcciones.
- `isDefault`: Indica la dirección predeterminada.

### Category
Categorías de productos del menú.
- **slug**: Identificador único legible (ej: "arepas", "perros").
- **displayOrder**: Orden de visualización en el menú.

### Product
Productos del menú.
- **isActive**: Si el producto está habilitado en el sistema.
- **isAvailable**: Disponibilidad temporal (ej: "se acabó").
- Los precios son en pesos colombianos (COP) sin decimales.

### Addition
Adiciones/extras que se pueden agregar a los productos.
- Ej: Maicito, Gratinado, Butifarra, etc.

### Order
Pedidos realizados por clientes o invitados.
- **userId**: Null para pedidos de invitados.
- **orderNumber**: Código único legible (ej: "ORD-001").
- Timestamps para cada cambio de estado.
- Snapshots de precios al momento de la orden.

### OrderItem
Items individuales dentro de un pedido.
- **productName**: Snapshot del nombre del producto.
- **unitPrice**: Precio del producto al momento de la orden.
- **totalPrice**: Precio total incluyendo adiciones.

### OrderItemAddition
Adiciones seleccionadas para cada item.
- **additionName**: Snapshot del nombre de la adición.
- **price**: Precio al momento de la orden.

### BusinessHours
Horarios de atención del restaurante.
- Un registro por día de la semana.
- Formato de hora: "HH:mm" (ej: "10:00").

### BusinessConfig
Configuración general del negocio (singleton).
- Datos de contacto.
- Configuración de delivery.
- Datos de pago (Nequi, Daviplata, banco).

### DailySales
Agregado de ventas diarias para reportes.
- Se actualiza al finalizar cada pedido.

### ProductSales
Ventas por producto por día para analytics.
- Permite identificar productos más vendidos.

---

## Relaciones

| Relación | Tipo | Descripción |
|----------|------|-------------|
| User → Address | 1:N | Un usuario puede tener múltiples direcciones |
| User → Order | 1:N | Un usuario puede tener múltiples pedidos |
| Category → Product | 1:N | Una categoría tiene múltiples productos |
| Order → OrderItem | 1:N | Un pedido tiene múltiples items |
| OrderItem → OrderItemAddition | 1:N | Un item puede tener múltiples adiciones |
| Product → OrderItem | 1:N | Un producto puede estar en múltiples items |
| Addition → OrderItemAddition | 1:N | Una adición puede estar en múltiples items |
| Address → Order | 1:N | Una dirección puede usarse en múltiples pedidos |

---

## Flujos de Negocio

### Pedido como Invitado
1. Cliente agrega productos al carrito
2. En checkout, ingresa nombre y teléfono
3. Selecciona tipo (delivery/pickup)
4. Si delivery, ingresa dirección manualmente
5. Selecciona método de pago
6. Confirma pedido → `status: pending`

### Pedido como Usuario Registrado
1. Cliente inicia sesión
2. Agrega productos al carrito
3. En checkout, selecciona dirección guardada o ingresa nueva
4. Selecciona método de pago
5. Confirma pedido → `status: pending`

### Flujo de Estados del Pedido
```
pending → confirmed → preparing → ready → delivered
    ↓         ↓           ↓          ↓
cancelled  cancelled  cancelled  cancelled
```

### Flujo de Pago
- **Efectivo**: `paymentStatus: pending` → confirma al entregar
- **Nequi/Daviplata/Transfer**: Cliente paga → envía referencia → admin confirma

---

## Índices Recomendados

- `orders.status` - Filtrar por estado
- `orders.createdAt` - Ordenar por fecha
- `orders.userId` - Historial de usuario
- `daily_sales.date` - Reportes por fecha
- `product_sales.date` - Reportes por fecha
- `product_sales.productId` - Analytics por producto
