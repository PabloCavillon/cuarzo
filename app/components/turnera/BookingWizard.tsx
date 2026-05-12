"use client";

import { useState, useEffect, FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquare, Monitor, Settings, Wrench,
  Clock, ChevronLeft, ChevronRight, Check,
  Calendar, Download, ArrowLeft, AlertCircle, Loader2,
} from "lucide-react";
import Link from "next/link";
import type { ServiceResponse } from "@/app/api/turnera/services/route";
import { useT, useLocale } from "@/lib/i18n/provider";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Service extends ServiceResponse {
  Icon: React.ComponentType<{ className?: string }>;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface InfoForm {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

interface BookingResult {
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
  createdAt: string;
  status: string;
}

// ─── Icon mapping (keyed by DB service name — not translated) ─────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "Consulta Inicial": MessageSquare,
  "Demo del Sistema": Monitor,
  "Configuración":    Settings,
  "Soporte Técnico":  Wrench,
};

function iconForService(name: string) {
  return ICON_MAP[name] ?? MessageSquare;
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────

function getBusinessDays(count = 14): Date[] {
  const days: Date[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);
  while (days.length < count) {
    const d = cursor.getDay();
    if (d !== 0 && d !== 6) days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function getSlots(duration: number, dateStr: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const START = 9 * 60;
  const END   = 18 * 60;
  for (let m = START; m + duration <= END; m += 30) {
    const h   = Math.floor(m / 60);
    const min = m % 60;
    const time = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    const seed = dateStr + time;
    let hash = 0;
    for (const ch of seed) hash = (Math.imul(31, hash) + ch.charCodeAt(0)) | 0;
    slots.push({ time, available: Math.abs(hash) % 3 !== 0 });
  }
  return slots;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Use Intl API for locale-aware date formatting
function getDayAbbr(d: Date, locale: string): string {
  return d.toLocaleDateString(locale === "pt" ? "pt-BR" : locale, { weekday: "short" });
}

function getMonthAbbr(d: Date, locale: string): string {
  return d.toLocaleDateString(locale === "pt" ? "pt-BR" : locale, { month: "short" });
}

function formatShortDate(d: Date, locale: string): string {
  return d.toLocaleDateString(locale === "pt" ? "pt-BR" : locale, {
    weekday: "short", day: "numeric", month: "short",
  });
}

function formatFullDate(dateStr: string, locale: string): string {
  const [y, m, day] = dateStr.split("-").map(Number);
  const d = new Date(y, m - 1, day);
  return d.toLocaleDateString(locale === "pt" ? "pt-BR" : locale, {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
}

function priceLabel(price: number, freeLabel: string): string {
  return price === 0 ? freeLabel : `ARS $${price.toLocaleString("es-AR")}`;
}

function downloadICS(booking: BookingResult, calendarLabel: string) {
  const [y, mo, da] = booking.date.split("-");
  const [hh, mm]    = booking.time.split(":").map(Number);
  const endMin = hh * 60 + mm + booking.duration;
  const endH   = Math.floor(endMin / 60);
  const endM   = endMin % 60;
  const pad    = (n: number) => String(n).padStart(2, "0");
  const dtStart = `${y}${mo}${da}T${pad(hh)}${pad(mm)}00`;
  const dtEnd   = `${y}${mo}${da}T${pad(endH)}${pad(endM)}00`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cuarzo//Turnera//ES",
    "BEGIN:VEVENT",
    `UID:${booking.id}@cuarzo`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15)}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${booking.serviceName} — CUARZO`,
    `DESCRIPTION:${calendarLabel}\\: ${booking.code}\\nContacto\\: hola@cuarzo.com`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `booking-${booking.code}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Step progress ────────────────────────────────────────────────────────────

function StepProgress({ current, labels }: { current: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {labels.map((label, i) => {
        const n      = i + 1;
        const done   = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                  done
                    ? "bg-navy-900 border-navy-900 text-white"
                    : active
                    ? "bg-white border-navy-900 text-navy-900"
                    : "bg-white border-gray-200 text-gray-400"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : n}
              </div>
              <span
                className={`text-[10px] font-medium hidden sm:block ${
                  active ? "text-navy-900" : done ? "text-navy-600" : "text-gray-300"
                }`}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-4 sm:mb-5 rounded-full transition-colors duration-300 ${
                  done ? "bg-navy-900" : "bg-gray-100"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1 — Service ─────────────────────────────────────────────────────────

function StepService({
  services, selected, onSelect, loading, loadError,
}: {
  services: Service[];
  selected: Service | null;
  onSelect: (s: Service) => void;
  loading: boolean;
  loadError: string | null;
}) {
  const t      = useT();
  const locale = useLocale();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-sm">{t.turnera.wizard.step1.loading}</p>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {loadError}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-navy-900 mb-1">{t.turnera.wizard.step1.title}</h2>
      <p className="text-sm text-gray-400 mb-6">{t.turnera.wizard.step1.description}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {services.map((s) => {
          const isSelected = selected?.id === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={`text-left rounded-2xl border-2 p-5 transition-all duration-200 group ${
                isSelected
                  ? "border-navy-900 bg-navy-900/5 shadow-md shadow-navy-900/8"
                  : "border-gray-100 bg-white hover:border-navy-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected ? "bg-navy-900" : "bg-gray-100 group-hover:bg-navy-100"
                  }`}
                >
                  <s.Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-gray-500 group-hover:text-navy-700"}`} />
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    s.price === 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {priceLabel(s.price, t.turnera.wizard.step1.free)}
                </span>
              </div>
              <h3 className={`font-bold text-sm mb-1.5 ${isSelected ? "text-navy-900" : "text-gray-800"}`}>
                {s.name}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">{s.description}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                {s.durationMin} {t.turnera.wizard.step1.min}
                {s.price > 0 && (
                  <span className="ml-auto text-[10px] text-amber-600 font-medium">
                    {t.turnera.wizard.step1.payLater}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2 — Date ────────────────────────────────────────────────────────────

function StepDate({
  dates, selected, onSelect,
}: {
  dates: Date[];
  selected: Date | null;
  onSelect: (d: Date) => void;
}) {
  const t      = useT();
  const locale = useLocale();

  return (
    <div>
      <h2 className="text-lg font-bold text-navy-900 mb-1">{t.turnera.wizard.step2.title}</h2>
      <p className="text-sm text-gray-400 mb-6">{t.turnera.wizard.step2.description}</p>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {dates.map((d) => {
          const isSelected = selected && toDateStr(d) === toDateStr(selected);
          return (
            <button
              key={toDateStr(d)}
              onClick={() => onSelect(d)}
              className={`flex flex-col items-center py-3 px-1 rounded-xl border-2 text-center transition-all duration-200 ${
                isSelected
                  ? "border-navy-900 bg-navy-900 text-white shadow-md shadow-navy-900/20"
                  : "border-gray-100 bg-white text-gray-700 hover:border-navy-200"
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${isSelected ? "text-navy-300" : "text-gray-400"}`}>
                {getDayAbbr(d, locale)}
              </span>
              <span className="text-lg font-bold leading-none">{d.getDate()}</span>
              <span className={`text-[10px] mt-1 ${isSelected ? "text-navy-300" : "text-gray-400"}`}>
                {getMonthAbbr(d, locale)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3 — Time ────────────────────────────────────────────────────────────

function StepTime({
  slots, selected, onSelect, service, date,
}: {
  slots: TimeSlot[];
  selected: string | null;
  onSelect: (t: string) => void;
  service: Service;
  date: Date;
}) {
  const t      = useT();
  const locale = useLocale();

  return (
    <div>
      <h2 className="text-lg font-bold text-navy-900 mb-1">{t.turnera.wizard.step3.title}</h2>
      <p className="text-sm text-gray-400 mb-1">
        {formatShortDate(date, locale)} · {t.turnera.wizard.step3.subtitle(service.name, service.durationMin)}
      </p>
      <p className="text-xs text-gray-300 mb-6">{t.turnera.wizard.step3.takenSlots}</p>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {slots.map((slot) => {
          const isSelected = selected === slot.time;
          return (
            <button
              key={slot.time}
              disabled={!slot.available}
              onClick={() => slot.available && onSelect(slot.time)}
              className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-150 ${
                !slot.available
                  ? "border-gray-100 text-gray-300 line-through bg-gray-50 cursor-not-allowed"
                  : isSelected
                  ? "border-navy-900 bg-navy-900 text-white shadow-md shadow-navy-900/20"
                  : "border-gray-100 bg-white text-gray-700 hover:border-navy-300"
              }`}
            >
              {slot.time}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 4 — Info ────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm text-navy-900 placeholder:text-gray-300 focus:outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-600/10 transition-all";

function StepInfo({
  info, onChange, service, date, time,
}: {
  info: InfoForm;
  onChange: (f: InfoForm) => void;
  service: Service;
  date: Date;
  time: string;
}) {
  const t      = useT();
  const locale = useLocale();

  const set = (field: keyof InfoForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...info, [field]: e.target.value });

  return (
    <div>
      <h2 className="text-lg font-bold text-navy-900 mb-1">{t.turnera.wizard.step4.title}</h2>
      <p className="text-sm text-gray-400 mb-5">{t.turnera.wizard.step4.description}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {[service.name, formatShortDate(date, locale), time].map((val) => (
          <span key={val} className="inline-flex items-center gap-1.5 text-xs font-medium bg-navy-50 text-navy-700 px-3 py-1.5 rounded-full">
            {val}
          </span>
        ))}
      </div>

      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              {t.turnera.wizard.step4.nameLabel}
            </label>
            <input
              required type="text" maxLength={100}
              value={info.name} onChange={set("name")}
              placeholder={t.turnera.wizard.step4.namePlaceholder}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              {t.turnera.wizard.step4.emailLabel}
            </label>
            <input
              required type="email" maxLength={254}
              value={info.email} onChange={set("email")}
              placeholder={t.turnera.wizard.step4.emailPlaceholder}
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            {t.turnera.wizard.step4.phoneLabel}
          </label>
          <input
            type="tel" maxLength={30}
            value={info.phone} onChange={set("phone")}
            placeholder={t.turnera.wizard.step4.phonePlaceholder}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            {t.turnera.wizard.step4.notesLabel}
          </label>
          <textarea
            rows={3} maxLength={1000}
            value={info.notes} onChange={set("notes")}
            placeholder={t.turnera.wizard.step4.notesPlaceholder}
            className={`${inputCls} resize-none`}
          />
          <p className="text-right text-[10px] text-gray-300 mt-1">{info.notes.length}/1000</p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 5 — Confirmation ────────────────────────────────────────────────────

function StepConfirmation({ booking, service }: { booking: BookingResult; service: Service }) {
  const t      = useT();
  const locale = useLocale();
  const s      = t.turnera.wizard.step5;

  const details = [
    { label: s.serviceLabel,  value: booking.serviceName },
    { label: s.durationLabel, value: `${booking.duration} ${s.min}` },
    { label: s.dateLabel,     value: formatFullDate(booking.date, locale) },
    { label: s.timeLabel,     value: `${booking.time} ${s.hs}` },
    { label: s.nameLabel,     value: booking.name },
    { label: s.emailLabel,    value: booking.email },
  ];

  return (
    <div className="text-center py-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
        className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <Check className="w-10 h-10 text-emerald-600" strokeWidth={2.5} />
      </motion.div>

      <h2 className="text-2xl font-bold text-navy-900 mb-2">{s.title}</h2>
      <p className="text-gray-400 text-sm mb-6">
        {s.sentTo(booking.email)}
      </p>

      <div className="inline-flex items-center gap-2 bg-navy-950 text-white px-5 py-2.5 rounded-full font-mono text-sm font-bold tracking-widest mb-8">
        {booking.code}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 text-left mb-6 shadow-sm">
        <div className="grid sm:grid-cols-2 gap-4">
          {details.map((row) => (
            <div key={row.label}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{row.label}</p>
              <p className="text-sm font-medium text-navy-900">{row.value}</p>
            </div>
          ))}
        </div>
        {booking.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{s.notesLabel}</p>
            <p className="text-sm text-gray-600">{booking.notes}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => downloadICS(booking, s.serviceLabel)}
          className="inline-flex items-center justify-center gap-2 bg-navy-900 text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-navy-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          {s.calendar}
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 text-navy-700 border border-navy-200 text-sm font-semibold px-6 py-3 rounded-full hover:bg-navy-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {s.back}
        </Link>
      </div>
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

const slideVariants = {
  enter:  { opacity: 0, x: 20  },
  center: { opacity: 1, x: 0   },
  exit:   { opacity: 0, x: -20 },
};

export default function BookingWizard() {
  const t = useT();

  const [services,    setServices]    = useState<Service[]>([]);
  const [svcLoading,  setSvcLoading]  = useState(true);
  const [svcError,    setSvcError]    = useState<string | null>(null);

  const [step,       setStep]       = useState<1 | 2 | 3 | 4 | 5>(1);
  const [service,    setService]    = useState<Service | null>(null);
  const [date,       setDate]       = useState<Date | null>(null);
  const [time,       setTime]       = useState<string | null>(null);
  const [info,       setInfo]       = useState<InfoForm>({ name: "", email: "", phone: "", notes: "" });
  const [booking,    setBooking]    = useState<BookingResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/turnera/services")
      .then((r) => {
        if (!r.ok) throw new Error(t.turnera.wizard.errors.loadFail);
        return r.json();
      })
      .then(({ services: raw }: { services: ServiceResponse[] }) => {
        setServices(raw.map((s) => ({ ...s, Icon: iconForService(s.name) })));
      })
      .catch((e: unknown) => {
        setSvcError(e instanceof Error ? e.message : t.turnera.wizard.errors.loadFail);
      })
      .finally(() => setSvcLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableDates = getBusinessDays();
  const slots = date && service ? getSlots(service.durationMin, toDateStr(date)) : [];

  const canAdvance =
    (step === 1 && service !== null && !svcLoading && !svcError) ||
    (step === 2 && date !== null) ||
    (step === 3 && time !== null) ||
    (step === 4 && info.name.trim().length >= 2 && info.email.trim() !== "");

  const handleSubmit = async () => {
    if (!service || !date || !time) return;
    setSubmitting(true);
    setApiError(null);
    try {
      const res = await fetch("/api/turnera/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          date: toDateStr(date),
          time,
          name:  info.name,
          email: info.email,
          phone: info.phone || undefined,
          notes: info.notes || undefined,
        }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        throw new Error(error ?? t.turnera.wizard.errors.bookFail);
      }
      const { booking: b } = await res.json();
      setBooking(b);
      setStep(5);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : t.turnera.wizard.errors.bookFail);
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step === 4) { handleSubmit(); return; }
    setStep((s) => (s + 1) as typeof step);
  };
  const back = () => {
    setApiError(null);
    setStep((s) => (s - 1) as typeof step);
  };

  const stepLabels = [
    t.turnera.wizard.steps.service,
    t.turnera.wizard.steps.date,
    t.turnera.wizard.steps.time,
    t.turnera.wizard.steps.info,
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
      {step < 5 && <StepProgress current={step} labels={stepLabels} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: "easeInOut" }}
        >
          {step === 1 && (
            <StepService
              services={services}
              selected={service}
              onSelect={(s) => { setService(s); setTime(null); }}
              loading={svcLoading}
              loadError={svcError}
            />
          )}
          {step === 2 && (
            <StepDate
              dates={availableDates}
              selected={date}
              onSelect={(d) => { setDate(d); setTime(null); }}
            />
          )}
          {step === 3 && service && date && (
            <StepTime slots={slots} selected={time} onSelect={setTime} service={service} date={date} />
          )}
          {step === 4 && service && date && time && (
            <StepInfo info={info} onChange={setInfo} service={service} date={date} time={time} />
          )}
          {step === 5 && booking && service && (
            <StepConfirmation booking={booking} service={service} />
          )}
        </motion.div>
      </AnimatePresence>

      {apiError && (
        <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {apiError}
        </div>
      )}

      {step < 5 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          {step > 1 ? (
            <button
              onClick={back}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-900 font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> {t.turnera.wizard.nav.prev}
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={next}
            disabled={!canAdvance || submitting}
            className="inline-flex items-center gap-2 bg-navy-900 text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-navy-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t.turnera.wizard.nav.confirming}
              </span>
            ) : step === 4 ? (
              <>
                <Calendar className="w-4 h-4" /> {t.turnera.wizard.nav.confirm}
              </>
            ) : (
              <>
                {t.turnera.wizard.nav.next} <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
