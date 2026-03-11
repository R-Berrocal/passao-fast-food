"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, KeyRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  verifyIdentitySchema,
  newPasswordSchema,
  type VerifyIdentityInput,
  type NewPasswordInput,
} from "@/lib/validations/auth";

function SetupPasswordForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState(emailParam);

  const step1Form = useForm<VerifyIdentityInput>({
    resolver: zodResolver(verifyIdentitySchema),
    defaultValues: { email: emailParam },
  });

  const step2Form = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
  });

  const onVerify = async (data: VerifyIdentityInput) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/setup-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Error al verificar identidad");
        return;
      }
      setVerifiedEmail(data.email);
      setStep(2);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSetupPassword = async (data: NewPasswordInput) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verifiedEmail,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Error al establecer la contraseña");
        return;
      }
      window.location.href = "/admin/login?passwordSet=true";
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <KeyRound className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Establecer contraseña</CardTitle>
          <CardDescription>
            {step === 1
              ? "Ingresa tu email para continuar"
              : "Crea una contraseña para tu cuenta"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Indicador de pasos */}
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              1
            </div>
            <div className={`h-px flex-1 ${step === 2 ? "bg-primary" : "bg-border"}`} />
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                step === 2
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={step1Form.handleSubmit(onVerify)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  {...step1Form.register("email")}
                  aria-invalid={!!step1Form.formState.errors.email}
                />
                {step1Form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {step1Form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Continuar"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <Link href="/admin/login" className="hover:text-primary hover:underline">
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form
              onSubmit={step2Form.handleSubmit(onSetupPassword)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  autoComplete="new-password"
                  {...step2Form.register("password")}
                  aria-invalid={!!step2Form.formState.errors.password}
                />
                {step2Form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {step2Form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••"
                  autoComplete="new-password"
                  {...step2Form.register("confirmPassword")}
                  aria-invalid={!!step2Form.formState.errors.confirmPassword}
                />
                {step2Form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {step2Form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Establecer contraseña"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(null); }}
                  className="hover:text-primary hover:underline"
                >
                  Volver al paso anterior
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SetupPasswordForm />
    </Suspense>
  );
}
