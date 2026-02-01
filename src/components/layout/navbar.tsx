"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Moon,
  Sun,
  ShoppingCart,
  Menu,
  UtensilsCrossed,
  CircleDot,
  Utensils,
  PawPrint,
  User,
  LogOut,
  Settings,
  ShoppingBag,
  ChevronDown,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore, useCartItemCount } from "@/stores/use-cart-store";
import { Cart } from "@/components/cart/cart";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBusinessConfig } from "@/hooks/use-business";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/validations/auth";

export function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTheme, resolvedTheme } = useTheme();
  const itemCount = useCartItemCount();
  const { isOpen, openCart, closeCart } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const { user, isAuthenticated, isLoading, isSubmitting, error, login, register, logout, clearError } = useAuth();
  const { config } = useBusinessConfig();

  const businessName = config?.name || "PASSAO";
  const logoUrl = config?.logoUrl;

  const hasProcessedParams = useRef(false);

  // Handle URL params for auth redirects
  useEffect(() => {
    if (hasProcessedParams.current || isLoading) return;

    const authRequired = searchParams.get("authRequired");
    const unauthorized = searchParams.get("unauthorized");

    if (authRequired === "true" && !isAuthenticated) {
      hasProcessedParams.current = true;
      // Use requestAnimationFrame to defer state updates
      requestAnimationFrame(() => {
        setAuthMessage("Debes iniciar sesión para acceder a esta página");
        setLoginOpen(true);
      });
      router.replace("/", { scroll: false });
    } else if (unauthorized === "true") {
      hasProcessedParams.current = true;
      requestAnimationFrame(() => {
        setAuthMessage("No tienes permisos para acceder a esta página");
      });
      router.replace("/", { scroll: false });
    }
  }, [searchParams, isAuthenticated, isLoading, router]);

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  const navLinks = [
    { href: "#menu", label: "Menú", icon: UtensilsCrossed },
    { href: "#arepas", label: "Arepas", icon: CircleDot },
    { href: "#perros", label: "Perros", icon: PawPrint },
    { href: "#patacones", label: "Patacones", icon: Utensils },
  ];

  const handleLogin = async (data: LoginInput) => {
    const success = await login(data);
    if (success) {
      setLoginOpen(false);
      loginForm.reset();
    }
  };

  const handleRegister = async (data: RegisterInput) => {
    const success = await register(data);
    if (success) {
      setRegisterOpen(false);
      registerForm.reset();
    }
  };

  const handleLogout = () => {
    logout();
  };

  const openLoginDialog = () => {
    clearError();
    setAuthMessage(null);
    loginForm.reset();
    setLoginOpen(true);
  };

  const closeLoginDialog = (open: boolean) => {
    setLoginOpen(open);
    if (!open) {
      setAuthMessage(null);
    }
  };

  const openRegisterDialog = () => {
    clearError();
    registerForm.reset();
    setRegisterOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isStaff = user?.role === "admin" || user?.role === "staff";

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-black/10 dark:border-white/10 bg-primary dark:bg-zinc-900/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 dark:bg-primary overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt={`Logo ${businessName}`} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-white dark:text-primary-foreground">{businessName.charAt(0)}</span>
                )}
              </div>
              <span className="text-xl font-bold text-zinc-900 dark:text-primary">{businessName}</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-zinc-800 dark:text-gray-300 transition-colors hover:text-zinc-900 dark:hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Auth buttons - Desktop */}
            {isLoading ? (
              <div className="hidden sm:flex items-center">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-800 dark:text-gray-300" />
              </div>
            ) : !isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openLoginDialog}
                  className="text-zinc-800 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
                >
                  Iniciar sesión
                </Button>
                <Button
                  size="sm"
                  onClick={openRegisterDialog}
                  className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                >
                  Crear cuenta
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden sm:flex items-center gap-2 text-zinc-800 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 dark:bg-primary text-white dark:text-primary-foreground font-semibold text-sm">
                      {user ? getInitials(user.name) : "?"}
                    </div>
                    <span className="hidden lg:inline">{user?.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {isStaff && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Mis Pedidos
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="text-zinc-800 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
              suppressHydrationWarning
            >
              <Sun className="h-5 w-5 hidden dark:block" />
              <Moon className="h-5 w-5 block dark:hidden" />
            </Button>

            <Sheet open={isOpen} onOpenChange={(open) => (open ? openCart() : closeCart())}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-zinc-800 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer">
                  <ShoppingCart className="h-5 w-5 " />
                  {itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 dark:bg-primary text-xs font-bold text-white dark:text-primary-foreground">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <Cart />
              </SheetContent>
            </Sheet>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-zinc-800 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary overflow-hidden">
                      {logoUrl ? (
                        <img src={logoUrl} alt={`Logo ${businessName}`} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-primary-foreground">{businessName.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-primary">{businessName}</span>
                  </SheetTitle>
                </SheetHeader>

                <Separator className="my-4" />

                {/* User section - Mobile */}
                {isAuthenticated && user ? (
                  <div className="mb-4 rounded-lg bg-muted p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openLoginDialog();
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Iniciar sesión
                    </Button>
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openRegisterDialog();
                      }}
                      className="w-full justify-start"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Crear cuenta
                    </Button>
                  </div>
                )}

                <Separator className="my-4" />

                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>

                {isAuthenticated && (
                  <>
                    <Separator className="my-4" />
                    <nav className="flex flex-col gap-1">
                      {isStaff && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                        >
                          <LayoutDashboard className="h-5 w-5" />
                          Dashboard
                        </Link>
                      )}
                      <Link
                        href="#"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary cursor"
                      >
                        <User className="h-5 w-5" />
                        Mi Perfil
                      </Link>
                      <Link
                        href="#"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        <ShoppingBag className="h-5 w-5" />
                        Mis Pedidos
                      </Link>
                      <Link
                        href="#"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        <Settings className="h-5 w-5" />
                        Configuración
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
                      >
                        <LogOut className="h-5 w-5" />
                        Cerrar sesión
                      </button>
                    </nav>
                  </>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Login Dialog */}
      <Dialog open={loginOpen} onOpenChange={closeLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Iniciar sesión</DialogTitle>
            <DialogDescription>
              Ingresa tus credenciales para acceder a tu cuenta
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={loginForm.handleSubmit(handleLogin)}>
            <div className="grid gap-4 py-4">
              {authMessage && (
                <div className="rounded-md bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
                  {authMessage}
                </div>
              )}
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setLoginOpen(false);
                    openRegisterDialog();
                  }}
                  className="text-primary hover:underline"
                >
                  Crear cuenta
                </button>
              </p>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear cuenta</DialogTitle>
            <DialogDescription>
              Regístrate para hacer pedidos y guardar tus favoritos
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={registerForm.handleSubmit(handleRegister)}>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  placeholder="Juan Pérez"
                  {...registerForm.register("name")}
                />
                {registerForm.formState.errors.name && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="registerEmail">Correo electrónico</Label>
                <Input
                  id="registerEmail"
                  type="email"
                  placeholder="tu@email.com"
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="3001234567"
                  {...registerForm.register("phone")}
                />
                {registerForm.formState.errors.phone && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="registerPassword">Contraseña</Label>
                <Input
                  id="registerPassword"
                  type="password"
                  placeholder="••••••••"
                  {...registerForm.register("password")}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                )}
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear cuenta"
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setRegisterOpen(false);
                    openLoginDialog();
                  }}
                  className="text-primary hover:underline"
                >
                  Iniciar sesión
                </button>
              </p>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
