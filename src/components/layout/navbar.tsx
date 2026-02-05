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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCartStore, useCartItemCount } from "@/stores/use-cart-store";
import { Cart } from "@/components/cart/cart";
import { useState } from "react";
import { useBusinessConfig } from "@/hooks/use-business";
import { useMounted } from "@/hooks/use-mounted";

export function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const itemCount = useCartItemCount();
  const { isOpen, openCart, closeCart } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mounted = useMounted();

  const { config } = useBusinessConfig();

  const businessName = config?.name || "PASSAO";
  const logoUrl = config?.logoUrl;

  if (!mounted) return null;

  const navLinks = [
    { href: "#menu", label: "Menú", icon: UtensilsCrossed },
    { href: "#arepas", label: "Arepas", icon: CircleDot },
    { href: "#suizos", label: "Suizos", icon: Utensils },
    { href: "#salchipapas", label: "Salchipapas", icon: Utensils },
    { href: "#patacones", label: "Patacones", icon: Utensils },
    { href: "#perros", label: "Perros", icon: PawPrint },
  ];

  return (
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
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
