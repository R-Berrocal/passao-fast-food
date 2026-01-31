export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "staff" | "customer";
  status: "active" | "inactive";
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

export const mockUsers: User[] = [
  {
    id: "USR-001",
    name: "Carlos Pérez",
    email: "carlos.perez@email.com",
    phone: "3001234567",
    role: "customer",
    status: "active",
    createdAt: "2024-01-10",
    totalOrders: 15,
    totalSpent: 450000,
  },
  {
    id: "USR-002",
    name: "María García",
    email: "maria.garcia@email.com",
    phone: "3109876543",
    role: "customer",
    status: "active",
    createdAt: "2024-01-08",
    totalOrders: 8,
    totalSpent: 280000,
  },
  {
    id: "USR-003",
    name: "Juan López",
    email: "juan.lopez@email.com",
    phone: "3205551234",
    role: "customer",
    status: "inactive",
    createdAt: "2024-01-05",
    totalOrders: 3,
    totalSpent: 95000,
  },
  {
    id: "USR-004",
    name: "Ana Martínez",
    email: "ana.martinez@passao.com",
    phone: "3157778899",
    role: "staff",
    status: "active",
    createdAt: "2023-12-01",
    totalOrders: 0,
    totalSpent: 0,
  },
  {
    id: "USR-005",
    name: "Roberto Sánchez",
    email: "roberto.sanchez@passao.com",
    phone: "3186665544",
    role: "admin",
    status: "active",
    createdAt: "2023-11-15",
    totalOrders: 0,
    totalSpent: 0,
  },
  {
    id: "USR-006",
    name: "Laura Díaz",
    email: "laura.diaz@email.com",
    phone: "3142223344",
    role: "customer",
    status: "active",
    createdAt: "2024-01-12",
    totalOrders: 22,
    totalSpent: 620000,
  },
];

export const getRoleColor = (role: User["role"]): string => {
  const colors = {
    admin: "bg-purple-500",
    staff: "bg-blue-500",
    customer: "bg-green-500",
  };
  return colors[role];
};

export const getRoleText = (role: User["role"]): string => {
  const texts = {
    admin: "Administrador",
    staff: "Personal",
    customer: "Cliente",
  };
  return texts[role];
};

export const getStatusColor = (status: User["status"]): string => {
  const colors = {
    active: "bg-green-500",
    inactive: "bg-gray-500",
  };
  return colors[status];
};

export const getStatusText = (status: User["status"]): string => {
  const texts = {
    active: "Activo",
    inactive: "Inactivo",
  };
  return texts[status];
};
