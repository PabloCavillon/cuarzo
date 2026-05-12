import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { ReactNode } from "react";

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { superAdmin: true },
  });

  if (!user?.superAdmin) redirect("/admin");

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <header className="border-b border-white/8 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tracking-widest text-white/40 uppercase">Cuarzo</span>
          <span className="text-white/20">/</span>
          <span className="text-sm font-semibold text-red-400">Super Admin</span>
        </div>
        <a href="/admin" className="text-xs text-white/40 hover:text-white transition-colors">
          ← Volver al admin
        </a>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
