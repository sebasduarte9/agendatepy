"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Menu, X, Smartphone, Sparkles, LayoutDashboard } from "lucide-react";

const NAV_LINKS = [
  { href: "#caracteristicas", label: "Características" },
  { href: "#como-funciona", label: "Cómo Funciona" },
  { href: "/barberia/reservar", label: "Web de Reservas", isRoute: true, badge: "Demo" },
  { href: "#precios", label: "Precios" },
  { href: "#faq", label: "Preguntas Frecuentes" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <motion.span
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/30"
            animate={{ rotate: [0, -6, 6, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
          >
            <CalendarCheck className="h-5 w-5" />
          </motion.span>
          <div className="flex items-center gap-1.5 font-bold tracking-tight">
            <span className="text-xl font-black text-slate-900">Agendate<span className="text-brand">PY</span></span>
            <span className="rounded-full bg-red-100 px-1.5 py-0.2 text-[10px] font-extrabold text-red-700">
              PY
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 lg:flex">
          {NAV_LINKS.map((link) =>
            link.isRoute ? (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 text-slate-700 hover:text-brand transition"
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                    link.badge === "Nuevo" ? "bg-amber-100 text-amber-800" : "bg-primary/10 text-primary"
                  }`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="text-slate-600 hover:text-brand transition"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        {/* Action Buttons */}
        <div className="hidden items-center gap-2.5 md:flex">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-brand transition"
          >
            <span>Iniciar Sesión</span>
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:border-brand hover:text-brand transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Crear Negocio</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand/25 transition hover:bg-brand-dark"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Panel</span>
          </Link>
        </div>

        <button
          type="button"
          className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-white md:hidden shadow-xl"
          >
            <div className="flex flex-col gap-2.5 px-4 py-4">
              {NAV_LINKS.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {link.label}
                  </a>
                )
              )}

              <div className="mt-3 flex flex-col gap-2 pt-3 border-t border-slate-100">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full border border-slate-200 py-2.5 text-center text-xs font-bold text-slate-800"
                >
                  <span>Iniciar Sesión</span>
                </Link>
                <Link
                  href="/onboarding"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full border border-brand/30 bg-brand/5 py-2.5 text-center text-xs font-bold text-brand"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Crear Nuevo Negocio</span>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-center text-xs font-bold text-white shadow-sm"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Entrar al Panel de Control</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
