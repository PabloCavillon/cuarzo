"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Calendar, Package, Boxes,
  ShoppingCart, FileText, Users, Settings,
  LogOut, X, ChevronRight, Wallet, CreditCard, BarChart2, ListTodo,
} from "lucide-react";
import { CuarzoIsotype } from "@/app/components/CuarzoLogo";
import type { AuthUser } from "@/lib/session";

// ─── Nav definition ───────────────────────────────────────────────────────────

type NavItem = {
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  module: string | null;
  soon?: boolean;
};

const NAV: NavItem[] = [
  { label: "Dashboard",    href: "/admin",                Icon: LayoutDashboard, module: null },
  { label: "Bookings",     href: "/admin/bookings",       Icon: Calendar,        module: "turnera" },
  { label: "Catalog",      href: "/admin/catalog",        Icon: Package,         module: "catalog" },
  { label: "Stock",        href: "/admin/stock",          Icon: Boxes,           module: "stock" },
  { label: "Pedidos",      href: "/admin/orders",         Icon: ShoppingCart,    module: "orders" },
  { label: "Billing",      href: "/admin/billing",        Icon: FileText,        module: "fiscal" },
  { label: "Caja",         href: "/admin/caja",           Icon: Wallet,          module: "caja" },
  { label: "Tareas",       href: "/admin/tasks",          Icon: ListTodo,        module: null },
  { label: "Reportes",     href: "/admin/reports",        Icon: BarChart2,       module: null },
  { label: "Clients",      href: "/admin/clients",        Icon: Users,           module: null },
  { label: "Suscripción",  href: "/admin/subscription",   Icon: CreditCard,      module: null },
  { label: "Configuración",href: "/admin/settings",       Icon: Settings,        module: null },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar({
  open,
  onClose,
  activeModules,
  user,
}: {
  open: boolean;
  onClose: () => void;
  activeModules: string[];
  user: AuthUser;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  function isEnabled(item: NavItem) {
    if (item.module === null) return true;
    return activeModules.includes(item.module);
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 flex flex-col bg-[#0a1628] border-r border-white/8
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-5 border-b border-white/8 shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
            <CuarzoIsotype height={22} />
            <span className="text-sm font-bold tracking-[0.18em] text-white">CUARZO</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-white/40 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map((item) => {
            const enabled = isEnabled(item);
            const active  = isActive(item.href);

            if (!enabled && item.module !== null) {
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/20 cursor-not-allowed"
                >
                  <item.Icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {item.soon && (
                    <span className="text-[9px] font-bold tracking-wide bg-white/8 text-white/30 px-1.5 py-0.5 rounded-full">
                      SOON
                    </span>
                  )}
                </div>
              );
            }

            if (item.soon) {
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/30 cursor-not-allowed"
                >
                  <item.Icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  <span className="text-[9px] font-bold tracking-wide bg-white/8 text-white/30 px-1.5 py-0.5 rounded-full">
                    SOON
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  active
                    ? "bg-white/12 text-white"
                    : "text-white/55 hover:bg-white/8 hover:text-white"
                }`}
              >
                <item.Icon className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div className="shrink-0 border-t border-white/8 p-3">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-white/40 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
