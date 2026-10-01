"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { scrollToSection } from "@/lib/smoothScroll";
import { getCommercialWhatsAppUrl } from "@/lib/config/whatsapp";

export default function Header() {
  const [activeTab, setActiveTab] = useState("inicio");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Cerrar el menú al interactuar fuera del header SIN usar ningún backdrop que afecte la landing
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleOutsideInteraction = (e: PointerEvent) => {
      const target = e.target as Node;
      if (headerRef.current && !headerRef.current.contains(target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideInteraction);
    return () => document.removeEventListener("pointerdown", handleOutsideInteraction);
  }, [mobileMenuOpen]);

  const sectionIds = [
    "inicio",
    "como-funciona",
    "caracteristicas",
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

  // Manejo de carga inicial directa con hash en URL
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const initialHash = window.location.hash.replace("#", "");
      if (initialHash && sectionIds.includes(initialHash)) {
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
    { id: "caracteristicas", label: "Características", href: "#caracteristicas" },
    { id: "precios", label: "Precios", href: "#precios" },
    { id: "faq", label: "FAQ", href: "#faq" },
  ];

  return (
    <header ref={headerRef} className="sticky top-2 sm:top-3 z-50 px-2 sm:px-4 md:px-6 transition-all duration-300 relative">
      {/* Navbar principal limpia, blanca y con sutil frosted glass */}
      <nav
        aria-label="Navegación principal"
        className="relative mx-auto max-w-7xl rounded-full px-3.5 sm:px-5 md:px-6 h-13 sm:h-15 flex items-center justify-between gap-3 bg-white/92 dark:bg-slate-900/92 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300"
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center shrink-0 relative z-10">
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <BrandLogo variant="horizontal" iconClassName="h-6.5 w-6.5 sm:h-8 sm:w-8" />
          </motion.div>
        </Link>

        {/* Clean Center Navigation Rail (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-1.5 relative z-10">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.id, item.href)}
                className={`relative px-3.5 xl:px-4 py-1.5 text-xs font-bold transition-all duration-200 rounded-full flex items-center justify-center ${
                  isActive
                    ? "text-[#FF4F2B] dark:text-white bg-[#FF4F2B]/10 dark:bg-white/10 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative z-10">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center justify-center gap-1 whitespace-nowrap text-xs font-bold transition-all duration-200 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-white/50 dark:hover:bg-white/5 active:scale-95"
          >
            <LogIn className="h-3.5 w-3.5 opacity-70" />
            <span>Acceder</span>
          </Link>

          {/* Desktop CTA */}
          <Link
            href="/onboarding"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#FF4F2B] hover:bg-[#F04420] text-white text-xs font-bold shadow-sm shadow-[#FF4F2B]/25 active:scale-95 transition-all border border-white/20"
          >
            Probar gratis
          </Link>

          {/* Mobile Iniciar sesión CTA */}
          <Link
            href="/login"
            className="sm:hidden inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-[#FF4F2B] hover:bg-[#F04420] text-white text-xs font-bold shadow-sm shadow-[#FF4F2B]/25 active:scale-95 transition-all border border-white/20"
          >
            Iniciar sesión
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 shadow-xs lg:hidden shrink-0 transition-colors active:scale-95"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
          </button>
        </div>
      </nav>

      {/* Menú flotante: Blanco limpio, sutil frosted glass, sin empujar la landing */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "absolute" }}
            className="absolute top-[calc(100%+8px)] left-2 right-2 sm:left-4 sm:right-4 z-50 lg:hidden pointer-events-auto rounded-3xl p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.10)] overflow-hidden"
          >
            <div className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.id, item.href)}
                    className={`group flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? "bg-[#FF4F2B]/10 text-[#FF4F2B] border border-[#FF4F2B]/25 font-black shadow-2xs"
                        : "text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent active:scale-[0.99]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`h-2 w-2 rounded-full transition-all ${
                          isActive
                            ? "bg-[#FF4F2B] shadow-xs shadow-[#FF4F2B]"
                            : "bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400"
                        }`}
                      />
                      <span className="tracking-tight text-[13px]">{item.label}</span>
                    </span>
                    <ArrowRight
                      className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 ${
                        isActive ? "text-[#FF4F2B]" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                      }`}
                    />
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
