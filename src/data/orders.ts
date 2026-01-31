export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered";
  type: "delivery" | "pickup";
  customerName: string;
  customerPhone: string;
  address?: string;
  createdAt: string;
}

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    items: [
      { id: "arepa-12", name: "Arepa Full", price: 14000, quantity: 2 },
      { id: "perro-5", name: "Perro Suizo", price: 8500, quantity: 1 },
      { id: "adicion-1", name: "Maicito", price: 3500, quantity: 1 },
    ],
    total: 40000,
    status: "preparing",
    type: "delivery",
    customerName: "Carlos Pérez",
    customerPhone: "3001234567",
    address: "Calle 45 #23-12, Barranquilla",
    createdAt: "2024-01-15T14:30:00",
  },
  {
    id: "ORD-002",
    items: [
      { id: "patacon-10", name: "Patacón Full", price: 19000, quantity: 1 },
      { id: "suizo-4", name: "Suizo Passao", price: 22000, quantity: 1 },
    ],
    total: 41000,
    status: "ready",
    type: "pickup",
    customerName: "María García",
    customerPhone: "3109876543",
    createdAt: "2024-01-15T14:45:00",
  },
  {
    id: "ORD-003",
    items: [
      { id: "salchipapa-4", name: "De la Casa", price: 20000, quantity: 2 },
      { id: "desgranado-2", name: "Especial", price: 20000, quantity: 1 },
    ],
    total: 60000,
    status: "pending",
    type: "delivery",
    customerName: "Juan López",
    customerPhone: "3205551234",
    address: "Carrera 52 #78-90, Apto 301",
    createdAt: "2024-01-15T15:00:00",
  },
  {
    id: "ORD-004",
    items: [
      { id: "arepa-1", name: "Arepa Quesuda", price: 6000, quantity: 3 },
      { id: "perro-1", name: "Perro Clásico", price: 5000, quantity: 2 },
    ],
    total: 28000,
    status: "delivered",
    type: "delivery",
    customerName: "Ana Martínez",
    customerPhone: "3157778899",
    address: "Calle 72 #45-67",
    createdAt: "2024-01-15T12:30:00",
  },
];

export const getStatusColor = (status: Order["status"]): string => {
  const colors = {
    pending: "bg-yellow-500",
    preparing: "bg-blue-500",
    ready: "bg-green-500",
    delivered: "bg-gray-500",
  };
  return colors[status];
};

export const getStatusText = (status: Order["status"]): string => {
  const texts = {
    pending: "Pendiente",
    preparing: "Preparando",
    ready: "Listo",
    delivered: "Entregado",
  };
  return texts[status];
};
