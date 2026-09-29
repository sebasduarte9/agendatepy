"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  Menu,
  X,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { scrollToSection } from "@/lib/smoothScroll";
import { getCommercialWhatsAppUrl } from "@/lib/config/whatsapp";

export default function Header() {
  const [activeTab, setActiveTab] = useState("inicio");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="sticky top-2 sm:top-3 z-50 px-2 sm:px-4 md:px-6 transition-all duration-300">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex h-13 sm:h-15 max-w-7xl items-center justify-between gap-3 rounded-full border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-slate-950/85 px-3.5 sm:px-5 md:px-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl"
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <BrandLogo variant="horizontal" iconClassName="h-6.5 w-6.5 sm:h-8 sm:w-8" />
          </motion.div>
        </Link>

        {/* Clean Center Navigation Rail (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.id, item.href)}
                className={`relative px-3.5 xl:px-4 py-1.5 text-xs font-bold transition-all duration-200 rounded-full flex items-center justify-center ${
                  isActive
                    ? "text-brand dark:text-white bg-brand/10 dark:bg-white/10 font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center justify-center gap-1 whitespace-nowrap text-xs font-bold transition-all duration-200 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95"
          >
            <LogIn className="h-3.5 w-3.5 opacity-70" />
            <span>Acceder</span>
          </Link>

          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-bold transition-all duration-200 bg-gradient-to-r from-brand to-[#FF6B4A] text-white hover:brightness-110 h-8 sm:h-8.5 px-3.5 sm:px-4 rounded-full shadow-sm shadow-brand/20 active:scale-95"
          >
            <span>Probar gratis</span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs lg:hidden shrink-0"
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
            initial={{ height: 0, opacity: 0, y: -8 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -8 }}
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
                <a
                  href={getCommercialWhatsAppUrl("Hola AgendatePY, quiero consultar sobre planes para mi negocio")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 py-2 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 active:scale-95 transition"
                >
                  <MessageCircle className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
                  <span>Consultar por WhatsApp</span>
                </a>
                <Link
                  href="/onboarding"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand to-[#FF6B4A] py-2.5 text-center text-xs font-bold text-white shadow-md shadow-brand/25"
                >
                  <span>Registrate gratis ahora</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 py-2 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                >
                  <LogIn className="h-3.5 w-3.5 text-slate-400" />
                  <span>Ya tengo cuenta · Acceder</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

