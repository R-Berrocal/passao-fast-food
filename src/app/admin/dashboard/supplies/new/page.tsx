"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupplies } from "@/hooks/use-supplies";
import { z } from "zod";
import { SUPPLY_CATEGORIES, type CreateSupplyInput } from "@/lib/validations/supply";
import { getTodayString } from "@/lib/date-utils";

// Form-specific schema uses z.string() for date to avoid z.coerce.date() type mismatch with useForm
const supplyFormSchema = z.object({
  description: z.string().min(2, "La descripción es requerida"),
  category: z.enum(SUPPLY_CATEGORIES, { error: () => ({ message: "Categoría inválida" }) }),
  amount: z.number().int().positive("El monto debe ser mayor a 0"),
  date: z.string().min(1),
  notes: z.string().optional(),
});
type SupplyFormValues = z.infer<typeof supplyFormSchema>;

export default function NewSupplyPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { createSupply, isCreating } = useSupplies();

  const form = useForm<SupplyFormValues>({
    resolver: zodResolver(supplyFormSchema),
    defaultValues: {
      description: "",
      category: undefined,
      amount: 0,
      date: getTodayString(),
      notes: "",
    },
  });

  const onSubmit = async (data: SupplyFormValues) => {
    setError(null);
    const supplyData: CreateSupplyInput = {
      ...data,
      date: new Date(data.date + "T12:00:00"),
    };
    const result = await createSupply(supplyData);
    if (result) {
      router.push("/admin/dashboard/supplies");
    } else {
      setError("Error al registrar la compra. Intenta de nuevo.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/dashboard/supplies">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Registrar Compra</h2>
          <p className="text-muted-foreground">Agrega una compra de insumos al registro del día</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Input
                  id="description"
                  placeholder="Ej: Harina de maíz 2kg"
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select
                    value={form.watch("category")}
                    onValueChange={(val) =>
                      form.setValue("category", val as (typeof SUPPLY_CATEGORIES)[number], {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPLY_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Monto (COP) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="50000"
                    {...form.register("amount", { valueAsNumber: true })}
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.amount.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  {...form.register("date")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Información adicional (opcional)"
                  rows={2}
                  {...form.register("notes")}
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <Button type="button" variant="outline" asChild className="flex-1">
                  <Link href="/admin/dashboard/supplies">Cancelar</Link>
                </Button>
                <Button type="submit" className="flex-1" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Registrar Compra"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
