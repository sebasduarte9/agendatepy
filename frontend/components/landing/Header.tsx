"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Menu, X, Sparkles, LayoutDashboard } from "lucide-react";

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
    <header className="sticky top-3 z-50 px-4 sm:px-6">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 px-4 sm:px-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-300">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <motion.span
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand to-indigo-600 text-white shadow-lg shadow-brand/30"
            whileHover={{ scale: 1.05, rotate: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CalendarCheck className="h-5 w-5" />
          </motion.span>
          <div className="flex items-center gap-1.5 font-bold tracking-tight">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              Agendate<span className="text-brand">PY</span>
            </span>
            <span className="rounded-full bg-red-100 dark:bg-red-950/80 px-1.5 py-0.2 text-[10px] font-extrabold text-red-700 dark:text-red-400">
              PY
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300 lg:flex">
          {NAV_LINKS.map((link) =>
            link.isRoute ? (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 hover:text-brand transition duration-200"
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="rounded-full bg-brand/10 dark:bg-brand/20 px-2 py-0.5 text-[9px] font-bold text-brand">
                    {link.badge}
                  </span>
                )}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-brand transition duration-200"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        {/* Action Buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-brand transition"
          >
            <span>Iniciar Sesión</span>
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs hover:border-brand hover:text-brand transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Crear Negocio</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand/25 transition hover:brightness-110 active:scale-95"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Panel</span>
          </Link>
        </div>

        <button
          type="button"
          className="rounded-xl p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
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
            className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 p-4 shadow-2xl backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {link.label}
                  </a>
                )
              )}

              <div className="mt-3 flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 py-2.5 text-center text-xs font-bold text-slate-800 dark:text-slate-200"
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
