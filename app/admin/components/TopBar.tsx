"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import type { AuthUser } from "@/lib/session";

const BREADCRUMBS: Record<string, string> = {
  "/admin":                    "Dashboard",
  "/admin/bookings":           "Bookings",
  "/admin/bookings/services":  "Bookings · Services",
  "/admin/catalog":            "Catalog",
  "/admin/catalog/categories": "Catalog · Categories",
  "/admin/stock":              "Stock",
  "/admin/stock/movements":    "Stock · Movements",
  "/admin/stock/warehouses":   "Stock · Warehouses",
  "/admin/orders":             "Pedidos",
  "/admin/orders/new":         "Pedidos · Nuevo",
  "/admin/billing":            "Billing",
  "/admin/billing/settings":  "Billing · Settings",
  "/admin/billing/new":       "Billing · New Invoice",
  "/admin/caja":              "Caja Digital",
  "/admin/subscription":     "Suscripción",
  "/admin/settings":         "Configuración",
  "/admin/reports":            "Reportes",
  "/admin/clients":            "Clients",
  "/admin/clients/suppliers":  "Clients · Suppliers",
  "/admin/clients/":           "Clients · Perfil",
};

export function TopBar({
  user,
  onMenuClick,
}: {
  user: AuthUser;
  onMenuClick: () => void;
}) {
  const pathname = usePathname();

  // Match exact path first, then prefix
  const crumb =
    BREADCRUMBS[pathname] ??
    Object.entries(BREADCRUMBS)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([key]) => pathname.startsWith(key))?.[1] ??
    "Admin";

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-5 bg-[#0a1628] border-b border-white/8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-white/50 hover:text-white transition-colors p-1 -ml-1"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-semibold text-white">{crumb}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold text-white">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
