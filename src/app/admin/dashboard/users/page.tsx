"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Mail,
  Phone,
  ShoppingCart,
  UserPlus,
  Shield,
  UserCog,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUsers } from "@/hooks/use-users";
import type { UserRole, UserStatus } from "@/types/models";

interface UserWithCount {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date | string;
  _count: {
    orders: number;
  };
}

function getRoleColor(role: UserRole): string {
  switch (role) {
    case "admin":
      return "bg-purple-500";
    case "staff":
      return "bg-blue-500";
    case "customer":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}

function getRoleText(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Administrador";
    case "staff":
      return "Personal";
    case "customer":
      return "Cliente";
    default:
      return role;
  }
}

function getStatusText(status: UserStatus): string {
  switch (status) {
    case "active":
      return "Activo";
    case "inactive":
      return "Inactivo";
    case "banned":
      return "Bloqueado";
    default:
      return status;
  }
}

function RoleIcon({ role }: { role: UserRole }) {
  switch (role) {
    case "admin":
      return <Shield className="h-4 w-4" />;
    case "staff":
      return <UserCog className="h-4 w-4" />;
    case "customer":
      return <UserIcon className="h-4 w-4" />;
  }
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRole, setActiveRole] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { users, isLoading, deleteUser } = useUsers();

  const userStats = {
    total: users.length,
    customers: users.filter((u) => u.role === "customer").length,
    staff: users.filter((u) => u.role === "staff").length,
    admins: users.filter((u) => u.role === "admin").length,
    active: users.filter((u) => u.status === "active").length,
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = activeRole === "all" || user.role === activeRole;
    return matchesSearch && matchesRole;
  });

  const handleDelete = (user: UserWithCount) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (user: UserWithCount) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    const success = await deleteUser(selectedUser.id);
    setIsDeleting(false);
    if (success) {
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">
            Administra clientes y personal del restaurante
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/dashboard/users/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Usuarios</p>
              <p className="text-2xl font-bold">{userStats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <UserIcon className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clientes</p>
              <p className="text-2xl font-bold">{userStats.customers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <UserCog className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Personal</p>
              <p className="text-2xl font-bold">{userStats.staff}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
              <Shield className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Administradores</p>
              <p className="text-2xl font-bold">{userStats.admins}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={activeRole} onValueChange={setActiveRole}>
              <TabsList>
                <TabsTrigger value="all">Todos ({userStats.total})</TabsTrigger>
                <TabsTrigger value="customer">
                  Clientes ({userStats.customers})
                </TabsTrigger>
                <TabsTrigger value="staff">
                  Personal ({userStats.staff})
                </TabsTrigger>
                <TabsTrigger value="admin">
                  Admin ({userStats.admins})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-480px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Pedidos</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className={`${getRoleColor(user.role)} text-white`}>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${getRoleColor(user.role)} text-white`}
                      >
                        <RoleIcon role={user.role} />
                        <span className="ml-1">{getRoleText(user.role)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.status === "active"
                            ? "border-green-500 text-green-500"
                            : user.status === "banned"
                            ? "border-red-500 text-red-500"
                            : "border-gray-500 text-gray-500"
                        }
                      >
                        {getStatusText(user.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {user._count.orders > 0 ? (
                        <div className="flex items-center justify-end gap-1">
                          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                          <span>{user._count.orders}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/dashboard/users/${user.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(user)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserIcon className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  No se encontraron usuarios
                </h3>
                <p className="text-muted-foreground">
                  {users.length === 0
                    ? "Crea tu primer usuario para comenzar"
                    : "Intenta ajustar los filtros de búsqueda"}
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback
                    className={`${getRoleColor(selectedUser.role)} text-white text-xl`}
                  >
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`${getRoleColor(selectedUser.role)} text-white`}
                    >
                      {getRoleText(selectedUser.role)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        selectedUser.status === "active"
                          ? "border-green-500 text-green-500"
                          : selectedUser.status === "banned"
                          ? "border-red-500 text-red-500"
                          : "border-gray-500 text-gray-500"
                      }
                    >
                      {getStatusText(selectedUser.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              <Card>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedUser.email}</span>
                  </div>
                  {selectedUser.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedUser.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedUser.role === "customer" && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Historial de Compras
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="rounded-lg bg-muted p-3 text-center w-full">
                      <p className="text-2xl font-bold">
                        {selectedUser._count.orders}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total Pedidos
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="text-center text-sm text-muted-foreground">
                Miembro desde{" "}
                {new Date(selectedUser.createdAt).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a &quot;{selectedUser?.name}&quot;?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
