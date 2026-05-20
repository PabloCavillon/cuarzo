"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Calendar, Package, Boxes,
  ShoppingCart, FileText, Users, Settings,
  LogOut, X, ChevronRight, Wallet, CreditCard, BarChart2, ListTodo, Headphones, Truck,
} from "lucide-react";
import { CuarzoIsotype } from "@/app/components/CuarzoLogo";
import type { AuthUser } from "@/lib/auth/session";
import { useT } from "@/lib/i18n/provider";
import type { T } from "@/lib/i18n";

type NavItem = {
  labelKey: keyof T["admin"]["nav"];
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  module: string | null;
  soon?: boolean;
};

const NAV: NavItem[] = [
  { labelKey: "dashboard",    href: "/admin",              Icon: LayoutDashboard, module: null },
  { labelKey: "appointments", href: "/admin/appointments", Icon: Calendar,        module: "turnera" },
  { labelKey: "catalog",      href: "/admin/catalog",      Icon: Package,         module: "catalog" },
  { labelKey: "stock",        href: "/admin/stock",        Icon: Boxes,           module: "stock" },
  { labelKey: "orders",       href: "/admin/orders",       Icon: ShoppingCart,    module: "orders" },
  { labelKey: "billing",      href: "/admin/billing",      Icon: FileText,        module: "fiscal" },
  { labelKey: "finance",      href: "/admin/finance",      Icon: Wallet,          module: "caja" },
  { labelKey: "providers",    href: "/admin/providers",    Icon: Truck,           module: null },
  { labelKey: "tasks",        href: "/admin/tasks",        Icon: ListTodo,        module: null },
  { labelKey: "reports",      href: "/admin/reports",      Icon: BarChart2,       module: null },
  { labelKey: "customers",    href: "/admin/customers",    Icon: Users,           module: null },
  { labelKey: "subscription", href: "/admin/subscription", Icon: CreditCard,      module: null },
  { labelKey: "support",      href: "/admin/tickets",      Icon: Headphones,      module: null },
  { labelKey: "settings",     href: "/admin/settings",     Icon: Settings,        module: null },
];

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
  const t = useT();

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
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 flex flex-col bg-[#0a1628] border-r border-white/8
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
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

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map((item) => {
            const enabled = isEnabled(item);
            const active  = isActive(item.href);
            const label   = t.admin.nav[item.labelKey];

            if (!enabled && item.module !== null) {
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/20 cursor-not-allowed"
                >
                  <item.Icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium flex-1">{label}</span>
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
                  <span className="text-sm font-medium flex-1">{label}</span>
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
                <span className="text-sm font-medium flex-1">{label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
              </Link>
            );
          })}
        </nav>

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
            {t.admin.common.signOut}
          </button>
        </div>
      </aside>
    </>
  );
}
