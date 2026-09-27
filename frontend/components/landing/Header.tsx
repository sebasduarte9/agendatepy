"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  LogIn,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";

export default function Header() {
  const [activeTab, setActiveTab] = useState("inicio");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "inicio", label: "Inicio", href: "#inicio" },
    { id: "caracteristicas", label: "Características", href: "#caracteristicas" },
    { id: "whatsapp", label: "WhatsApp", href: "#whatsapp" },
    { id: "como-funciona", label: "Cómo Funciona", href: "#como-funciona" },
    { id: "calculadora", label: "Calculadora", href: "#calculadora" },
    { id: "precios", label: "Precios", href: "#precios" },
    { id: "faq", label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-3 z-50 px-3 sm:px-6 transition-all duration-300">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 rounded-full border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-950/90 px-4 sm:px-6 shadow-[0_12px_32px_-10px_rgba(0,0,0,0.08)] backdrop-blur-xl"
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <motion.div
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <BrandLogo variant="horizontal" iconClassName="h-9 w-9" badge="PY" />
          </motion.div>
        </Link>

        {/* Floating Pill Nav Rail (Desktop) */}
        <div className="hidden lg:flex min-w-0 flex-1 justify-center">
          <div className="relative min-w-0 max-w-full overflow-hidden rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 p-1 backdrop-blur-md">
            <div className="min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="relative flex w-max items-center gap-0.5">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={() => setActiveTab(item.id)}
                      className={`relative h-7 whitespace-nowrap rounded-full px-3 text-xs font-semibold transition-all duration-200 flex items-center ${
                        isActive
                          ? "bg-white dark:bg-slate-800 text-brand dark:text-white shadow-xs font-bold"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Subtle Live Demo Link */}
          <Link
            href="/barberia/reservar"
            className="hidden md:inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand transition px-2.5 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span>Ver Demo</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>

          {/* Login Button */}
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-semibold transition-colors border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 h-9 px-3 rounded-full text-slate-700 dark:text-slate-200 shadow-2xs"
          >
            <LogIn className="h-3.5 w-3.5 text-slate-400" />
            <span>Acceder</span>
          </Link>

          {/* High-Converting Primary CTA: Prueba gratuitamente */}
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs sm:text-sm font-bold transition-all duration-200 hover:brightness-110 active:scale-95 bg-gradient-to-r from-brand to-indigo-600 text-white h-9 px-4 sm:px-5 rounded-full shadow-md shadow-brand/25"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Prueba gratuitamente</span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs lg:hidden"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 p-4 shadow-2xl backdrop-blur-2xl lg:hidden"
          >
            <div className="flex flex-col gap-1.5">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </a>
              ))}

              <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <Link
                  href="/onboarding"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-indigo-600 py-3 text-center text-sm font-bold text-white shadow-md shadow-brand/25"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Prueba gratuitamente</span>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/barberia/reservar"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-center text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50"
                  >
                    <span>Ver Demo Web</span>
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-center text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50"
                  >
                    <LogIn className="h-3.5 w-3.5 text-slate-400" />
                    <span>Iniciar Sesión</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
