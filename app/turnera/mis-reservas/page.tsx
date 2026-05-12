"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, CalendarDays, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useT, useLocale } from "@/lib/i18n/provider";

interface Booking {
  id: string;
  code: string;
  serviceName: string;
  duration: number;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  status: "confirmed" | "cancelled";
  createdAt: string;
}

function formatFullDate(dateStr: string, locale: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(locale === "pt" ? "pt-BR" : locale, {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
}

function isPast(dateStr: string, timeStr: string): boolean {
  const [y, m, d]  = dateStr.split("-").map(Number);
  const [hh, mm]   = timeStr.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm) < new Date();
}

export default function MisReservasPage() {
  const t      = useT();
  const locale = useLocale();
  const tc     = t.turnera.check;

  const [email,    setEmail]    = useState("");
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(false);
    try {
      const res = await fetch(`/api/turnera/bookings?email=${encodeURIComponent(email.trim())}`);
      if (!res.ok) throw new Error(tc.networkError);
      const { bookings: list } = await res.json();
      setBookings(list ?? []);
      setSearched(true);
    } catch {
      setError(tc.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <Link
        href="/turnera"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy-900 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> {tc.newBooking}
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-1">
        {tc.title}
      </h1>
      <p className="text-gray-400 text-sm mb-8">{tc.description}</p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={tc.emailPlaceholder}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-navy-900 placeholder:text-gray-300 focus:outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-600/10 transition-all"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-navy-900 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-navy-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {loading ? tc.loading : tc.submit}
        </button>
      </form>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <AnimatePresence>
        {searched && bookings !== null && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {bookings.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <CalendarDays className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm font-medium">{tc.noResults}</p>
                <p className="text-xs mt-1 text-gray-300">{tc.noResultsHint}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 font-medium mb-4">
                  {tc.resultCount(bookings.length)}
                </p>
                {bookings
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .map((b) => {
                    const past = isPast(b.date, b.time);
                    return (
                      <div
                        key={b.id}
                        className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
                          past ? "border-gray-100 opacity-60" : "border-gray-100 hover:border-navy-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="font-bold text-sm text-navy-900">{b.serviceName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatFullDate(b.date, locale)} · {b.time} {tc.hs} · {b.duration} {tc.min}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className="font-mono text-[11px] font-bold text-navy-700 bg-navy-50 px-2.5 py-1 rounded-full">
                              {b.code}
                            </span>
                            {b.status === "confirmed" ? (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                past ? "bg-gray-100 text-gray-400" : "bg-emerald-50 text-emerald-700"
                              }`}>
                                {past ? (
                                  <><Clock className="w-3 h-3" /> {tc.past}</>
                                ) : (
                                  <><CheckCircle2 className="w-3 h-3" /> {tc.confirmed}</>
                                )}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                                <XCircle className="w-3 h-3" /> {tc.cancelled}
                              </span>
                            )}
                          </div>
                        </div>
                        {b.notes && (
                          <p className="text-xs text-gray-400 border-t border-gray-50 pt-3 mt-3">
                            {b.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
