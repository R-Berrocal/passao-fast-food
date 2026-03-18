"use client";

import { useState, useEffect } from "react";
import { ChefHat, Clock, Lock, MessageCircle, Package, Truck } from "lucide-react";
import { useKitchenOrders } from "@/hooks/use-kitchen-orders";
import type { OrderWithItems } from "@/types/models";

// ─── Constants ────────────────────────────────────────────────────────────────

const LATE_THRESHOLD_MINUTES = 20;

const STATUS_BORDER: Record<string, string> = {
  pending: "border-l-amber-400",
  confirmed: "border-l-blue-400",
  preparing: "border-l-green-400",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "PENDIENTE",
  confirmed: "CONFIRMADO",
  preparing: "PREPARANDO",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getElapsedMinutes(createdAt: Date | string, now: Date): number {
  return Math.floor((now.getTime() - new Date(createdAt).getTime()) / 60_000);
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Bogota",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ElapsedBadge({ createdAt, now }: { createdAt: Date | string; now: Date }) {
  const minutes = getElapsedMinutes(createdAt, now);
  const isLate = minutes >= LATE_THRESHOLD_MINUTES;
  return (
    <span
      className={`flex items-center gap-1.5 text-xl font-semibold tabular-nums ${
        isLate ? "text-red-400" : "text-zinc-400"
      }`}
    >
      <Clock className={`w-5 h-5 ${isLate ? "text-red-400" : "text-zinc-500"}`} />
      {minutes < 1 ? "Ahora" : `hace ${minutes} min`}
    </span>
  );
}

function TypeBadge({ type }: { type: "delivery" | "pickup" }) {
  if (type === "pickup") {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-base font-bold">
        <Package className="w-4 h-4" />
        PARA LLEVAR
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-base font-bold">
      <Truck className="w-4 h-4" />
      DOMICILIO
    </span>
  );
}

function OrderCard({ order, now }: { order: OrderWithItems; now: Date }) {
  const isLate = getElapsedMinutes(order.createdAt, now) >= LATE_THRESHOLD_MINUTES;
  const borderClass = STATUS_BORDER[order.status] ?? "border-l-zinc-500";

  return (
    <div
      className={`border-l-8 rounded-xl bg-zinc-800 p-6 ${borderClass} ${
        isLate ? "ring-2 ring-red-500" : ""
      }`}
    >
      {/* Card header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <span className="text-4xl font-black text-white tracking-tight">
          {order.orderNumber}
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <ElapsedBadge createdAt={order.createdAt} now={now} />
          <TypeBadge type={order.type} />
          <span className="px-3 py-1 rounded-lg bg-zinc-700 text-zinc-300 text-sm font-bold tracking-wide">
            {STATUS_LABEL[order.status] ?? order.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {order.items.map((item) => (
          <div key={item.id}>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-amber-400 min-w-[2.5rem]">
                {item.quantity}×
              </span>
              <span className="text-3xl font-bold text-white leading-tight">
                {item.productName}
              </span>
            </div>
            {item.additions.length > 0 && (
              <div className="ml-14 mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                {item.additions.map((add) => (
                  <span key={add.id} className="text-xl text-zinc-300">
                    + {add.additionName}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Notes */}
      {(order.notes || order.adminNotes) && (
        <div className="mt-4 space-y-2 border-t border-zinc-700 pt-4">
          {order.notes && (
            <div className="rounded-lg bg-zinc-700/50 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-semibold text-zinc-400">Nota del cliente</span>
              </div>
              <p className="text-xl text-white">{order.notes}</p>
            </div>
          )}
          {order.adminNotes && (
            <div className="rounded-lg bg-amber-950/40 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">Nota del admin</span>
              </div>
              <p className="text-xl text-amber-200">{order.adminNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-5">
      <ChefHat className="w-20 h-20 text-zinc-700" />
      <p className="text-3xl text-zinc-500 font-semibold">
        No hay pedidos pendientes
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <p className="text-2xl text-zinc-500 animate-pulse">Cargando pedidos…</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function KitchenPageContent() {
  const [now, setNow] = useState(() => new Date());
  const { orders, isLoading, dataUpdatedAt } = useKitchenOrders();

  // Live clock — safe useEffect for timer (not prop-driven state reset)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(timer);
  }, []);

  const secondsSinceRefresh = Math.floor(
    (now.getTime() - (dataUpdatedAt ?? now.getTime())) / 1_000
  );

  return (
    // Forced dark — explicit colors, no dependency on next-themes
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChefHat className="w-9 h-9 text-amber-400" />
          <span className="text-2xl font-black tracking-widest text-amber-400">
            COCINA
          </span>
        </div>

        <span className="text-5xl font-mono font-black tabular-nums text-white">
          {formatClock(now)}
        </span>

        <span className="text-sm text-zinc-500 tabular-nums">
          Actualizado hace {secondsSinceRefresh}s
        </span>
      </header>

      {/* Orders list */}
      <main className="flex-1 p-6 space-y-4 overflow-y-auto">
        {isLoading ? (
          <LoadingState />
        ) : orders.length === 0 ? (
          <EmptyState />
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} now={now} />)
        )}
      </main>
    </div>
  );
}
