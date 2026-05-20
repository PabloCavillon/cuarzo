import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a1628] px-4">
      <div className="mb-8 text-center">
        <span className="text-3xl font-bold tracking-tight text-white">
          cuarzo<span className="text-[#4f8ef7]">.</span>
        </span>
      </div>
      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}
