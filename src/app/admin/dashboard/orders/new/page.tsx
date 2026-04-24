"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Loader2,
  Receipt,
  Check,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useOrders } from "@/hooks/use-orders";
import { useAdditions } from "@/hooks/use-additions";
import { formatPrice } from "@/stores/use-cart-store";
import { cn } from "@/lib/utils";
import type { Product, Addition } from "@/types/models";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartItemAddition {
  id: string;
  name: string;
  price: number;
}

interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  additions: CartItemAddition[];
}

const checkoutSchema = z
  .object({
    paymentMethod: z.enum(["cash", "nequi", "daviplata", "transfer"]),
    orderType: z.enum(["pickup", "delivery"]),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    deliveryAddress: z.string().optional(),
    adminNotes: z.string().max(300, "La nota no puede superar los 300 caracteres").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.orderType === "delivery") {
      if (!data.customerName || data.customerName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El nombre es requerido (mín. 2 caracteres)",
          path: ["customerName"],
        });
      }
      if (!data.customerPhone || !/^3\d{9}$/.test(data.customerPhone.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Teléfono inválido (10 dígitos, ej: 3001234567)",
          path: ["customerPhone"],
        });
      }
      if (!data.deliveryAddress || data.deliveryAddress.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La dirección es requerida (mín. 5 caracteres)",
          path: ["deliveryAddress"],
        });
      }
    }
  });

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ============================================================================
// AddProductDialog
// ============================================================================

function AddProductDialog({
  product,
  additions,
  additionsLoading,
  allowsAdditions,
  open,
  onOpenChange,
  onConfirm,
}: {
  product: Product | null;
  additions: Addition[];
  additionsLoading: boolean;
  allowsAdditions: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (product: Product, additions: CartItemAddition[], quantity: number) => void;
}) {
  const [selectedAdditions, setSelectedAdditions] = useState<CartItemAddition[]>([]);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const toggleAddition = (addition: Addition) => {
    setSelectedAdditions((prev) => {
      const exists = prev.find((a) => a.id === addition.id);
      if (exists) return prev.filter((a) => a.id !== addition.id);
      return [...prev, { id: addition.id, name: addition.name, price: addition.price }];
    });
  };

  const additionsTotal = selectedAdditions.reduce((sum, a) => sum + a.price, 0);
  const unitTotal = product.price + additionsTotal;

  const handleConfirm = () => {
    onConfirm(product, selectedAdditions, quantity);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quantity selector */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Cantidad</span>
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center font-bold">{quantity}</span>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Additions */}
          {allowsAdditions && (
          <div>
            <p className="text-sm font-medium mb-2">Adiciones</p>
            {additionsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : additions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay adiciones disponibles</p>
            ) : (
              <ScrollArea className="max-h-48 overflow-y-auto">
                <div className="space-y-2 pr-2">
                  {additions.map((addition) => {
                    const isSelected = selectedAdditions.some((a) => a.id === addition.id);
                    return (
                      <button
                        key={addition.id}
                        type="button"
                        onClick={() => toggleAddition(addition)}
                        className={cn(
                          "w-full flex items-center justify-between rounded-lg border p-3 text-sm transition-colors",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "hover:bg-muted"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground"
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <span>{addition.name}</span>
                        </div>
                        <span className="text-muted-foreground">+{formatPrice(addition.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
          )}

          {/* Price summary */}
          <div className="rounded-md bg-muted p-3 flex justify-between text-sm">
            <span className="text-muted-foreground">Total ({quantity} × {formatPrice(unitTotal)})</span>
            <span className="font-bold">{formatPrice(unitTotal * quantity)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// ProductCard
// ============================================================================

function ProductCard({
  product,
  cartCount,
  onAdd,
}: {
  product: Product;
  cartCount: number;
  onAdd: () => void;
}) {
  return (
    <Card className="overflow-hidden transition-all hover:border-primary/50">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm leading-tight line-clamp-2">{product.name}</p>
            <p className="text-primary font-bold mt-1">{formatPrice(product.price)}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {cartCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {cartCount}
              </Badge>
            )}
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7 shrink-0"
              onClick={onAdd}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CartContent
// ============================================================================

function CartContent({
  cart,
  subtotal,
  form,
  isSubmitting,
  submitError,
  onIncrement,
  onDecrement,
  onRemove,
  onSubmit,
}: {
  cart: CartItem[];
  subtotal: number;
  form: ReturnType<typeof useForm<CheckoutFormData>>;
  isSubmitting: boolean;
  submitError: string | null;
  onIncrement: (cartItemId: string) => void;
  onDecrement: (cartItemId: string) => void;
  onRemove: (cartItemId: string) => void;
  onSubmit: () => void;
}) {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const orderType = form.watch("orderType");
  const paymentMethod = form.watch("paymentMethod");
  const adminNotes = form.watch("adminNotes") ?? "";
  const { errors } = form.formState;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Agrega productos al carrito</p>
          </div>
        ) : (
          cart.map(({ cartItemId, product, quantity, additions }) => {
            const additionsTotal = additions.reduce((s, a) => s + a.price, 0);
            const itemTotal = (product.price + additionsTotal) * quantity;
            return (
              <div key={cartItemId} className="flex items-start gap-2 rounded-lg border p-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                  {additions.length > 0 && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      + {additions.map((a) => a.name).join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{formatPrice(product.price + additionsTotal)} c/u</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => onDecrement(cartItemId)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-5 text-center text-sm font-bold">{quantity}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => onIncrement(cartItemId)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-destructive"
                    onClick={() => onRemove(cartItemId)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm font-bold w-16 text-right shrink-0">
                  {formatPrice(itemTotal)}
                </p>
              </div>
            );
          })
        )}
      </div>

      {cart.length > 0 && (
        <>
          <Separator />

          {/* Admin Notes */}
          <div className="rounded-lg border overflow-hidden">
            <button
              type="button"
              onClick={() => setIsNotesOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              <span className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                {adminNotes.trim() ? "Nota especial" : "Agregar nota especial"}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  isNotesOpen && "rotate-180"
                )}
              />
            </button>
            {isNotesOpen && (
              <div className="px-3 pb-3 pt-1 border-t space-y-1.5">
                <textarea
                  {...form.register("adminNotes")}
                  placeholder="ej: sin salsa, sin cebolla, extra picante..."
                  rows={3}
                  maxLength={300}
                  className={cn(
                    "w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    "transition-colors",
                    errors.adminNotes && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <div className="flex items-center justify-between">
                  {errors.adminNotes ? (
                    <p className="text-xs text-destructive">{errors.adminNotes.message}</p>
                  ) : (
                    <span />
                  )}
                  <span className={cn(
                    "text-xs tabular-nums",
                    adminNotes.length > 270 ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {adminNotes.length} / 300
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Order Type */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tipo de venta
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {(["pickup", "delivery"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => form.setValue("orderType", type)}
                  className={`rounded-lg border p-2 text-sm font-medium transition-colors ${
                    orderType === type
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {type === "pickup" ? "Mostrador" : "Domicilio"}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery fields */}
          {orderType === "delivery" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="customerName" className="text-xs">
                  Nombre del cliente *
                </Label>
                <Input
                  id="customerName"
                  placeholder="Nombre completo"
                  {...form.register("customerName")}
                  aria-invalid={!!errors.customerName}
                  className="h-8 text-sm"
                />
                {errors.customerName && (
                  <p className="text-xs text-destructive">{errors.customerName.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="customerPhone" className="text-xs">
                  Teléfono *
                </Label>
                <Input
                  id="customerPhone"
                  placeholder="3001234567"
                  {...form.register("customerPhone")}
                  aria-invalid={!!errors.customerPhone}
                  className="h-8 text-sm"
                />
                {errors.customerPhone && (
                  <p className="text-xs text-destructive">{errors.customerPhone.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="deliveryAddress" className="text-xs">
                  Dirección *
                </Label>
                <Input
                  id="deliveryAddress"
                  placeholder="Calle 45 #23-12"
                  {...form.register("deliveryAddress")}
                  aria-invalid={!!errors.deliveryAddress}
                  className="h-8 text-sm"
                />
                {errors.deliveryAddress && (
                  <p className="text-xs text-destructive">{errors.deliveryAddress.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Método de pago
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "cash", label: "Efectivo" },
                  { value: "nequi", label: "Nequi" },
                  { value: "daviplata", label: "Daviplata" },
                  { value: "transfer", label: "Transferencia" },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => form.setValue("paymentMethod", value)}
                  className={`rounded-lg border p-2 text-sm font-medium transition-colors ${
                    paymentMethod === value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">{formatPrice(subtotal)}</span>
          </div>

          {submitError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || cart.length === 0}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <Receipt className="mr-2 h-4 w-4" />
                Registrar Venta
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}

// ============================================================================
// NewOrderPage
// ============================================================================

export default function NewOrderPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [dialogProduct, setDialogProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { products, isLoading: productsLoading } = useProducts();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { createManualOrder } = useOrders();
  const { additions, isLoading: additionsLoading } = useAdditions({ showAll: false });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "cash",
      orderType: "pickup",
    },
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive || !p.isAvailable) return false;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "all" || p.categoryId === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  const subtotal = cart.reduce((sum, item) => {
    const additionsTotal = item.additions.reduce((s, a) => s + a.price, 0);
    return sum + (item.product.price + additionsTotal) * item.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const openAddDialog = (product: Product) => {
    setDialogProduct(product);
    setDialogOpen(true);
  };

  const handleDialogConfirm = (
    product: Product,
    selectedAdditions: CartItemAddition[],
    quantity: number
  ) => {
    setCart((prev) => [
      ...prev,
      { cartItemId: crypto.randomUUID(), product, quantity, additions: selectedAdditions },
    ]);
  };

  const incrementItem = (cartItemId: string) => {
    setCart((prev) =>
      prev.map((i) =>
        i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  const decrementItem = (cartItemId: string) => {
    setCart((prev) => {
      const item = prev.find((i) => i.cartItemId === cartItemId);
      if (!item) return prev;
      if (item.quantity <= 1) return prev.filter((i) => i.cartItemId !== cartItemId);
      return prev.map((i) =>
        i.cartItemId === cartItemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  const removeItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const onValidSubmit = async (values: CheckoutFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const isDelivery = values.orderType === "delivery";
    const orderData = {
      customerName: isDelivery ? values.customerName!.trim() : "Mostrador",
      customerPhone: isDelivery ? values.customerPhone!.trim() : "0000000000",
      type: isDelivery ? "delivery" : "pickup",
      deliveryAddress: isDelivery ? values.deliveryAddress!.trim() : undefined,
      adminNotes: values.adminNotes?.trim() || undefined,
      paymentMethod: values.paymentMethod,
      status: "pending",
      paymentStatus: "pending",
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        additions: item.additions.map((a) => ({ additionId: a.id })),
      })),
    };

    try {
      const result = await createManualOrder(orderData);
      if (result) {
        router.push("/admin/dashboard/orders");
      } else {
        setSubmitError("Error al crear la orden. Intenta de nuevo.");
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Error al crear la orden. Intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = form.handleSubmit(onValidSubmit);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/dashboard/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Nueva Venta</h2>
          <p className="text-muted-foreground text-sm">Registra una venta manualmente</p>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left: Products */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Search */}
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Tabs */}
          {!categoriesLoading && (
            <div className="overflow-x-auto shrink-0">
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="inline-flex w-max">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  {categories
                    .filter((c) => c.isActive)
                    .map((cat) => (
                      <TabsTrigger key={cat.id} value={cat.id}>
                        {cat.name}
                      </TabsTrigger>
                    ))}
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            {productsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No se encontraron productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartCount={cart
                      .filter((i) => i.product.id === product.id)
                      .reduce((sum, i) => sum + i.quantity, 0)}
                    onAdd={() => openAddDialog(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart Panel (desktop only) */}
        <div className="hidden lg:flex w-80 shrink-0 flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-3 shrink-0">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrito
                {cartCount > 0 && <Badge className="ml-auto">{cartCount}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-4 pt-0">
              <CartContent
                cart={cart}
                subtotal={subtotal}
                form={form}
                isSubmitting={isSubmitting}
                submitError={submitError}
                onIncrement={incrementItem}
                onDecrement={decrementItem}
                onRemove={removeItem}
                onSubmit={handleSubmit}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile: Sticky bottom bar */}
      {cartCount > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-40">
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button className="w-full" size="lg">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ver carrito ({cartCount} items) · {formatPrice(subtotal)}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] flex flex-col">
              <SheetHeader className="shrink-0">
                <SheetTitle>Carrito de Venta</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-hidden mt-4">
                <CartContent
                  cart={cart}
                  subtotal={subtotal}
                  form={form}
                  isSubmitting={isSubmitting}
                  submitError={submitError}
                  onIncrement={incrementItem}
                  onDecrement={decrementItem}
                  onRemove={removeItem}
                  onSubmit={() => {
                    form.handleSubmit(async (values) => {
                      await onValidSubmit(values);
                      setIsCartOpen(false);
                    })();
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Add product dialog */}
      <AddProductDialog
        key={dialogOpen ? dialogProduct?.id ?? "new" : "closed"}
        product={dialogProduct}
        additions={additions}
        additionsLoading={additionsLoading}
        allowsAdditions={
          dialogProduct
            ? categories.find((c) => c.id === dialogProduct.categoryId)?.allowsAdditions ?? true
            : true
        }
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleDialogConfirm}
      />
    </div>
  );
}
