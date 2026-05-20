"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import type { AuthUser } from "@/lib/auth/session";

export function AdminShell({
  children,
  user,
  activeModules,
}: {
  children: ReactNode;
  user: AuthUser;
  activeModules: string[];
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#070e1c]">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeModules={activeModules}
        user={user}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-5 sm:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
