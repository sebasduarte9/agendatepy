"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  Menu,
  X,
  ArrowRight,
  Zap,
  ExternalLink,
} from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { scrollToSection } from "@/lib/smoothScroll";

export default function Header() {
  const [activeTab, setActiveTab] = useState("inicio");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sectionIds = [
    "inicio",
    "como-funciona",
    "whatsapp",
    "caracteristicas",
    "calculadora",
    "precios",
    "faq",
  ];

  // Sincronización con el scroll para marcar la pestaña activa
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 120) {
        setActiveTab("inicio");
        return;
      }

      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 90;
      if (atBottom) {
        setActiveTab("faq");
        return;
      }

      // Detectar sección activa en base a la zona de enfoque del viewport
      const threshold = window.innerHeight * 0.38;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= threshold && rect.bottom > 100) {
            setActiveTab(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Manejo de carga inicial directa con hash en URL (ej: /#calculadora, /#caracteristicas)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const initialHash = window.location.hash.replace("#", "");
      if (initialHash && sectionIds.includes(initialHash)) {
        // Pequeño retardo para permitir que el DOM y el layout se estabilicen
        const timer = setTimeout(() => {
          setActiveTab(initialHash);
          scrollToSection(initialHash, "smooth");
        }, 150);
        return () => clearTimeout(timer);
      }
    }

    const onHashChange = () => {
      const currentHash = window.location.hash.replace("#", "");
      if (currentHash && sectionIds.includes(currentHash)) {
        setActiveTab(currentHash);
        scrollToSection(currentHash, "smooth");
      }
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Función de clic en opciones del menú
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    itemId: string,
    href: string
  ) => {
    e.preventDefault();
    setActiveTab(itemId);
    const wasMobileOpen = mobileMenuOpen;
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }

    // Actualizar hash en la URL sin salto tosco del navegador
    if (typeof window !== "undefined" && window.history?.pushState) {
      window.history.pushState(null, "", href);
    }

    if (wasMobileOpen) {
      setTimeout(() => {
        scrollToSection(itemId, "smooth");
      }, 50);
    } else {
      scrollToSection(itemId, "smooth");
    }
  };

  const navItems = [
    { id: "inicio", label: "Inicio", href: "#inicio" },
    { id: "como-funciona", label: "Cómo Funciona", href: "#como-funciona" },
    { id: "whatsapp", label: "WhatsApp", href: "#whatsapp" },
    { id: "caracteristicas", label: "Características", href: "#caracteristicas" },
    { id: "calculadora", label: "Calculadora", href: "#calculadora" },
    { id: "precios", label: "Precios", href: "#precios" },
    { id: "faq", label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-2 sm:top-3 z-50 px-2 sm:px-4 md:px-6 transition-all duration-300">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex h-13 xs:h-14 sm:h-16 max-w-7xl items-center justify-between gap-1.5 xs:gap-2.5 sm:gap-3 rounded-full border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-950/90 px-2.5 xs:px-4 sm:px-5 md:px-6 shadow-[0_12px_32px_-10px_rgba(0,0,0,0.08)] backdrop-blur-xl"
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <motion.div
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <BrandLogo variant="horizontal" iconClassName="h-6 w-6 xs:h-7 xs:w-7 sm:h-8.5 sm:w-8.5" />
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
                      onClick={(e) => handleNavClick(e, item.id, item.href)}
                      className={`relative h-7 whitespace-nowrap rounded-full px-2.5 xl:px-3 text-[11px] xl:text-xs font-semibold transition-all duration-200 flex items-center ${
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
        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 shrink-0">
          {/* Subtle Live Demo Link (visible on xl+ so 1024px iPad landscape has ample space) */}
          <Link
            href="/barberia/reservar"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand transition px-2.5 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span>Ver Demo</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>

          {/* Login Button */}
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-semibold transition-colors border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 h-8.5 sm:h-9 px-2.5 sm:px-3 rounded-full text-slate-700 dark:text-slate-200 shadow-2xs"
          >
            <LogIn className="h-3.5 w-3.5 text-slate-400" />
            <span>Acceder</span>
          </Link>

          {/* High-Converting Primary CTA: Adaptive Text across Viewports */}
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap text-xs sm:text-sm font-bold transition-all duration-200 hover:brightness-110 active:scale-95 bg-gradient-to-r from-brand to-[#FF6B4A] text-white h-8.5 sm:h-9 px-3 sm:px-4.5 rounded-full shadow-md shadow-brand/25"
          >
            <Zap className="h-3.5 w-3.5 text-amber-300 shrink-0" />
            <span className="hidden xl:inline">Prueba gratuitamente</span>
            <span className="hidden sm:inline xl:hidden">Probar gratis</span>
            <span className="sm:hidden">Probar</span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 xs:h-8.5 xs:w-8.5 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs lg:hidden shrink-0"
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
                  onClick={(e) => handleNavClick(e, item.id, item.href)}
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
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-[#FF6B4A] py-3 text-center text-sm font-bold text-white shadow-md shadow-brand/25"
                >
                  <Zap className="h-4 w-4 text-amber-300" />
                  <span>Prueba gratuitamente</span>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/barberia/reservar"
                    target="_blank"
                    rel="noopener noreferrer"
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
