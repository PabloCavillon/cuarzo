"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useT } from "@/lib/i18n/provider";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const inputCls =
  "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#4f8ef7]/50 focus:ring-1 focus:ring-[#4f8ef7]/30 transition";

export default function RegisterForm() {
  const t  = useT();
  const tr = t.auth.register;

  const [businessName, setBusinessName] = useState("");
  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) { setError(tr.errors.passwordMismatch); return; }
    if (password.length < 8)  { setError(tr.errors.passwordShort);    return; }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ businessName, name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? tr.errors.generic);
      return;
    }

    const redirectTo = (data.redirectTo as string) ?? "/admin/onboarding";
    const login = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (login?.error) {
      setError(tr.errors.loginFail);
    } else {
      window.location.href = redirectTo;
    }
  }

  async function handleGoogle() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/admin" });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-white text-center mb-2">{tr.title}</h1>
      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/60 font-medium" htmlFor="businessName">
          {tr.businessNameLabel}
        </label>
        <input
          id="businessName" type="text" autoComplete="organization" required minLength={2} maxLength={100}
          value={businessName} onChange={(e) => setBusinessName(e.target.value)}
          placeholder={tr.businessNamePlaceholder} className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/60 font-medium" htmlFor="name">{tr.nameLabel}</label>
        <input
          id="name" type="text" autoComplete="name" required minLength={2} maxLength={100}
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder={tr.namePlaceholder} className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/60 font-medium" htmlFor="email">{tr.emailLabel}</label>
        <input
          id="email" type="email" autoComplete="email" required maxLength={254}
          value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder={tr.emailPlaceholder} className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/60 font-medium" htmlFor="password">{tr.passwordLabel}</label>
        <input
          id="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128}
          value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder={tr.passwordPlaceholder} className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/60 font-medium" htmlFor="confirm">{tr.confirmLabel}</label>
        <input
          id="confirm" type="password" autoComplete="new-password" required maxLength={128}
          value={confirm} onChange={(e) => setConfirm(e.target.value)}
          placeholder={tr.confirmPlaceholder} className={inputCls}
        />
      </div>

      <button
        type="submit" disabled={loading}
        className="mt-2 bg-[#4f8ef7] hover:bg-[#3a7ae0] disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition"
      >
        {loading ? tr.loading : tr.submit}
      </button>

      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/30">o</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <button
        type="button" onClick={handleGoogle} disabled={loading}
        className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-800 font-semibold rounded-lg px-4 py-2.5 text-sm transition"
      >
        <GoogleIcon />
        {tr.google}
      </button>

      <p className="text-center text-xs text-white/40 mt-2">
        {tr.hasAccount}{" "}
        <Link href="/login" className="text-[#4f8ef7] hover:underline">
          {tr.loginLink}
        </Link>
      </p>
    </form>
  );
}
