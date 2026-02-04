// ============================================================================
// API RESPONSE
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// ENUMS
// ============================================================================

export type UserRole = "admin" | "staff" | "customer";
export type UserStatus = "active" | "inactive" | "banned";
export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
export type OrderType = "delivery" | "pickup";
export type PaymentMethod = "cash" | "nequi" | "daviplata" | "transfer";
export type PaymentStatus = "pending" | "confirmed" | "rejected";
export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

// ============================================================================
// USER & AUTH
// ============================================================================

export interface User {
  id: string;
  name: string;
  email?: string; // Opcional para clientes, requerido para admin/staff
  phone: string;
  password?: string; // Hashed, never sent to client
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutCustomer {
  id: string;
  name: string;
  phone: string;
  isNew: boolean;
}

export interface Address {
  id: string;
  userId: string;
  address: string; // Dirección completa
  isDefault: boolean;
  createdAt: Date;
}

// ============================================================================
// PRODUCTS
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string; // "arepas", "perros", etc.
  description?: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  isActive: boolean; // Para desactivar sin eliminar
  isAvailable: boolean; // Disponibilidad temporal (se acabó, etc.)
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Addition {
  id: string;
  name: string;
  price: number;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ORDERS
// ============================================================================

export interface Order {
  id: string;
  orderNumber: string; // "ORD-001", auto-generated

  // Cliente (opcional para invitados)
  userId?: string;

  // Datos del cliente (siempre requeridos, incluso para invitados)
  customerName: string;
  customerPhone: string;
  customerEmail?: string;

  // Entrega
  type: OrderType;
  addressId?: string; // Solo para delivery de usuarios registrados
  deliveryAddress?: string; // Dirección completa como texto (invitados o manual)

  // Totales
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;

  // Estado
  status: OrderStatus;
  notes?: string; // Notas del cliente
  adminNotes?: string; // Notas internas

  // Pago
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string; // Referencia de transferencia/Nequi

  // Timestamps
  createdAt: Date;
  confirmedAt?: Date;
  preparingAt?: Date;
  readyAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string; // Snapshot del nombre
  quantity: number;
  unitPrice: number; // Precio unitario al momento de la orden
  totalPrice: number; // unitPrice * quantity + additions
  createdAt: Date;
}

export interface OrderItemAddition {
  id: string;
  orderItemId: string;
  additionId: string;
  additionName: string; // Snapshot del nombre
  price: number; // Precio al momento de la orden
}

// Order with items included (returned by API)
export interface OrderWithItems extends Order {
  items: (OrderItem & {
    additions: OrderItemAddition[];
  })[];
}

// ============================================================================
// BUSINESS CONFIG
// ============================================================================

export interface BusinessHours {
  id: string;
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime?: string; // "10:00" (HH:mm)
  closeTime?: string; // "22:00" (HH:mm)
}

export interface BusinessConfig {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;

  // Branding
  logoUrl?: string;
  slogan: string;

  // Contacto y redes sociales
  whatsappNumber?: string;
  instagramUrl?: string;
  facebookUrl?: string;

  // Hero statistics
  heroStatArepas: number;
  heroStatPerros: number;
  heroStatPatacones: number;
  heroStatTotal: number;

  // Delivery
  deliveryFee: number;
  minOrderAmount: number;

  // Pagos
  nequiNumber?: string;
  daviplataNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountType?: string;
  bankAccountHolder?: string;

  updatedAt: Date;
}

// ============================================================================
// ANALYTICS (para reportes)
// ============================================================================

export interface DailySales {
  id: string;
  date: Date;
  totalOrders: number;
  totalRevenue: number;
  deliveryOrders: number;
  pickupOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
}

export interface ProductSales {
  id: string;
  productId: string;
  date: Date;
  quantitySold: number;
  revenue: number;
}

// ============================================================================
// HELPERS - Status colors and text
// ============================================================================

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { color: string; text: string }> = {
  pending: { color: "bg-yellow-500", text: "Pendiente" },
  confirmed: { color: "bg-blue-500", text: "Confirmado" },
  preparing: { color: "bg-orange-500", text: "Preparando" },
  ready: { color: "bg-green-500", text: "Listo" },
  delivered: { color: "bg-gray-500", text: "Entregado" },
  cancelled: { color: "bg-red-500", text: "Cancelado" },
};

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { color: string; text: string }> = {
  pending: { color: "bg-yellow-500", text: "Pendiente" },
  confirmed: { color: "bg-green-500", text: "Confirmado" },
  rejected: { color: "bg-red-500", text: "Rechazado" },
};

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { text: string; icon: string }> = {
  cash: { text: "Efectivo", icon: "banknote" },
  nequi: { text: "Nequi", icon: "smartphone" },
  daviplata: { text: "Daviplata", icon: "smartphone" },
  transfer: { text: "Transferencia", icon: "building-2" },
};

export const USER_ROLE_CONFIG: Record<UserRole, { color: string; text: string }> = {
  admin: { color: "bg-purple-500", text: "Administrador" },
  staff: { color: "bg-blue-500", text: "Personal" },
  customer: { color: "bg-green-500", text: "Cliente" },
};

export const USER_STATUS_CONFIG: Record<UserStatus, { color: string; text: string }> = {
  active: { color: "bg-green-500", text: "Activo" },
  inactive: { color: "bg-gray-500", text: "Inactivo" },
  banned: { color: "bg-red-500", text: "Bloqueado" },
};

export const DAY_OF_WEEK_CONFIG: Record<DayOfWeek, { text: string; short: string }> = {
  monday: { text: "Lunes", short: "Lun" },
  tuesday: { text: "Martes", short: "Mar" },
  wednesday: { text: "Miércoles", short: "Mié" },
  thursday: { text: "Jueves", short: "Jue" },
  friday: { text: "Viernes", short: "Vie" },
  saturday: { text: "Sábado", short: "Sáb" },
  sunday: { text: "Domingo", short: "Dom" },
};
