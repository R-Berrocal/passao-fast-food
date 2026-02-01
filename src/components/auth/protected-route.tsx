"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "staff" | "customer")[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles = ["admin", "staff", "customer"],
  redirectTo = "/?authRequired=true",
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const hasRedirected = useRef(false);

  // Compute authorization directly from state
  const isAuthorized =
    !isLoading && isAuthenticated && user && allowedRoles.includes(user.role);

  // Handle redirect as a side effect (no setState)
  useEffect(() => {
    if (isLoading || hasRedirected.current) return;

    if (!isAuthenticated || !user) {
      hasRedirected.current = true;
      router.push(redirectTo);
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      hasRedirected.current = true;
      router.push("/?unauthorized=true");
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
