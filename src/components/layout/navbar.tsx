"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
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

export function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const itemCount = useCartItemCount();
  const { isOpen, openCart, closeCart } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navLinks = [
    { href: "#menu", label: "Menú", icon: UtensilsCrossed },
    { href: "#arepas", label: "Arepas", icon: CircleDot },
    { href: "#perros", label: "Perros", icon: PawPrint },
    { href: "#patacones", label: "Patacones", icon: Utensils },
  ];

  const handleLogin = () => {
    setLoginOpen(false);
    setIsLoggedIn(true);
  };

  const handleRegister = () => {
    setRegisterOpen(false);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-black/10 dark:border-white/10 bg-primary dark:bg-zinc-900/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 dark:bg-primary">
                <span className="text-lg font-bold text-white dark:text-primary-foreground">P</span>
              </div>
              <span className="text-xl font-bold text-zinc-900 dark:text-primary">PASSAO</span>
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
            {!isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLoginOpen(true)}
                  className="text-zinc-800 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
                >
                  Iniciar sesión
                </Button>
                <Button
                  size="sm"
                  onClick={() => setRegisterOpen(true)}
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
                    className="hidden sm:flex items-center gap-2 text-zinc-800 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 dark:bg-primary text-white dark:text-primary-foreground font-semibold text-sm">
                      CP
                    </div>
                    <span className="hidden lg:inline">Carlos Pérez</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-medium">Carlos Pérez</p>
                    <p className="text-sm text-muted-foreground">carlos@email.com</p>
                  </div>
                  <DropdownMenuSeparator />
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
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
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
              className="text-zinc-800 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
              suppressHydrationWarning
            >
              <Sun className="h-5 w-5 hidden dark:block" />
              <Moon className="h-5 w-5 block dark:hidden" />
            </Button>

            <Sheet open={isOpen} onOpenChange={(open) => (open ? openCart() : closeCart())}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-zinc-800 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10">
                  <ShoppingCart className="h-5 w-5" />
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                      <span className="text-sm font-bold text-primary-foreground">P</span>
                    </div>
                    <span className="text-primary">PASSAO</span>
                  </SheetTitle>
                </SheetHeader>

                <Separator className="my-4" />

                {/* User section - Mobile */}
                {isLoggedIn ? (
                  <div className="mb-4 rounded-lg bg-muted p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                        CP
                      </div>
                      <div>
                        <p className="font-medium">Carlos Pérez</p>
                        <p className="text-sm text-muted-foreground">carlos@email.com</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLoginOpen(true);
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
                        setRegisterOpen(true);
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

                {isLoggedIn && (
                  <>
                    <Separator className="my-4" />
                    <nav className="flex flex-col gap-1">
                      <Link
                        href="#"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
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
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-destructive transition-colors hover:bg-destructive/10"
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
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Iniciar sesión</DialogTitle>
            <DialogDescription>
              Ingresa tus credenciales para acceder a tu cuenta
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-gray-300" />
                Recordarme
              </label>
              <button className="text-sm text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button onClick={handleLogin} className="w-full">
              Iniciar sesión
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <button
                onClick={() => {
                  setLoginOpen(false);
                  setRegisterOpen(true);
                }}
                className="text-primary hover:underline"
              >
                Crear cuenta
              </button>
            </p>
          </DialogFooter>
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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  placeholder="Pérez"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="registerEmail">Correo electrónico</Label>
              <Input
                id="registerEmail"
                type="email"
                placeholder="tu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="300 123 4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registerPassword">Contraseña</Label>
              <Input
                id="registerPassword"
                type="password"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
              />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1 rounded border-gray-300" />
              <span className="text-muted-foreground">
                Acepto los{" "}
                <button className="text-primary hover:underline">términos y condiciones</button>
                {" "}y la{" "}
                <button className="text-primary hover:underline">política de privacidad</button>
              </span>
            </label>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button onClick={handleRegister} className="w-full">
              Crear cuenta
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <button
                onClick={() => {
                  setRegisterOpen(false);
                  setLoginOpen(true);
                }}
                className="text-primary hover:underline"
              >
                Iniciar sesión
              </button>
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
