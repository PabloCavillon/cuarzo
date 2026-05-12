"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Mail, MapPin } from "lucide-react";
import { useT } from "@/lib/i18n/provider";

type Form = { name: string; email: string; company: string; message: string };

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 text-navy-900 text-sm placeholder:text-gray-300 focus:outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-600/10 transition-all";

export default function Contact() {
  const t = useT();
  const [form, setForm]         = useState<Form>({ name: "", email: "", company: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const set = (field: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setSubmitted(true);
  };

  const contactItems = [
    { icon: Mail,   label: t.contact.emailLabel,    value: "hola@cuarzo.com" },
    { icon: MapPin, label: t.contact.locationLabel, value: t.contact.locationValue },
  ];

  return (
    <section id="contacto" className="py-16 sm:py-24 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-navy-600 text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
              {t.contact.eyebrow}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight mb-5 sm:mb-6">
              {t.contact.heading}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8 sm:mb-12">
              {t.contact.description}
            </p>

            <div className="space-y-5">
              {contactItems.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                    <div className="text-navy-900 text-sm font-medium">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm"
              >
                <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-5" />
                <h3 className="text-xl font-bold text-navy-900 mb-2">
                  {t.contact.success.heading}
                </h3>
                <p className="text-gray-400 text-sm">{t.contact.success.description}</p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 tracking-wide uppercase mb-2 block">
                      {t.contact.fields.name}
                    </label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={set("name")}
                      placeholder={t.contact.fields.namePlaceholder}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 tracking-wide uppercase mb-2 block">
                      {t.contact.fields.email}
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder={t.contact.fields.emailPlaceholder}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 tracking-wide uppercase mb-2 block">
                    {t.contact.fields.company}
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={set("company")}
                    placeholder={t.contact.fields.companyPlaceholder}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 tracking-wide uppercase mb-2 block">
                    {t.contact.fields.message}
                  </label>
                  <textarea
                    required
                    value={form.message}
                    onChange={set("message")}
                    placeholder={t.contact.fields.messagePlaceholder}
                    rows={5}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-navy-900 text-white font-semibold px-8 py-4 rounded-xl hover:bg-navy-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t.contact.submit}
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
