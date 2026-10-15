"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Calendar,
  CalendarPlus,
  Users,
  Banknote,
  Bot,
  Scissors,
  ShoppingBag,
  BarChart3,
  Coins,
  Award,
  Palette,
  Settings,
  X,
  ArrowRight,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { triggerHaptic } from "@/lib/haptics";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const clients = useDashboardStore((s) => s.clients);
  const services = useDashboardStore((s) => s.services);

  // Global keydown listener for ⌘K / Ctrl+K and Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) onClose();
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Reset query on open
  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const navRoutes = useMemo(
    () => [
      { id: "inicio", title: "Inicio / Dashboard", category: "General", href: "/dashboard", icon: LayoutDashboard },
      { id: "agenda", title: "Agenda & Calendario de Citas", category: "Operaciones", href: "/dashboard/calendario", icon: Calendar },
      { id: "nueva-reserva", title: "Nueva Cita / Reserva Rápida", category: "Operaciones", href: "/dashboard/nueva-reserva", icon: CalendarPlus },
      { id: "clientes", title: "Clientes & Directorio CRM", category: "Relaciones", href: "/dashboard/clientes", icon: Users },
      { id: "caja", title: "Caja, Cobros y Movimientos", category: "Finanzas", href: "/dashboard/caja", icon: Banknote },
      { id: "whatsapp", title: "WhatsApp IA & Asistente Automatizado", category: "Automatización", href: "/dashboard/whatsapp", icon: Bot },
      { id: "servicios", title: "Servicios & Catálogo de Precios", category: "Tu Negocio", href: "/dashboard/servicios", icon: Scissors },
      { id: "productos", title: "Productos, Stock e Inventario", category: "Tu Negocio", href: "/dashboard/productos", icon: ShoppingBag },
      { id: "equipo", title: "Equipo, Especialistas y Horarios", category: "Personas", href: "/dashboard/equipo", icon: Users },
      { id: "estadisticas", title: "Métricas, Ocupación e Ingresos", category: "Finanzas", href: "/dashboard/estadisticas", icon: BarChart3 },
      { id: "comisiones", title: "Comisiones y Liquidaciones", category: "Finanzas", href: "/dashboard/comisiones", icon: Coins },
      { id: "fidelizacion", title: "Fidelización & Tarjeta de Sellos", category: "Relaciones", href: "/dashboard/fidelizacion", icon: Award },
      { id: "apariencia", title: "Estudio de Apariencia & Glassy", category: "Diseño", href: "/dashboard/apariencia", icon: Palette },
      { id: "configuracion", title: "Configuración del Negocio & Horarios", category: "Ajustes", href: "/dashboard/configuracion", icon: Settings },
    ],
    []
  );

  const defaultRecommendations = useMemo(
    () => [
      navRoutes[2], // Nueva Cita / Reserva Rápida
      navRoutes[1], // Agenda & Calendario de Citas
      navRoutes[3], // Clientes & Directorio CRM
    ],
    [navRoutes]
  );

  const [recentSearchHrefs, setRecentSearchHrefs] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("agendate_recent_searches");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRecentSearchHrefs(parsed);
          }
        }
      } catch {}
    }
  }, [open]);

  const mobileRecommendedRoutes = useMemo(() => {
    if (recentSearchHrefs.length > 0) {
      const recents = recentSearchHrefs
        .map((href) => navRoutes.find((r) => r.href === href))
        .filter(Boolean) as typeof navRoutes;
      if (recents.length > 0) {
        return recents.slice(0, 3);
      }
    }
    return defaultRecommendations;
  }, [recentSearchHrefs, navRoutes, defaultRecommendations]);

  const filteredRoutes = useMemo(() => {
    if (!query.trim()) return navRoutes;
    const q = query.toLowerCase().trim();
    return navRoutes.filter(
      (r) => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
    );
  }, [navRoutes, query]);

  const filteredClients = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return clients
      .filter((c) => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q)))
      .slice(0, 5);
  }, [clients, query]);

  const filteredServices = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return services
      .filter((s) => s.name.toLowerCase().includes(q) || (s.category && s.category.toLowerCase().includes(q)))
      .slice(0, 4);
  }, [services, query]);

  function handleSelect(href: string) {
    triggerHaptic("selection");
    if (typeof window !== "undefined") {
      try {
        const updated = [href, ...recentSearchHrefs.filter((h) => h !== href)].slice(0, 3);
        setRecentSearchHrefs(updated);
        localStorage.setItem("agendate_recent_searches", JSON.stringify(updated));
      } catch {}
    }
    onClose();
    router.push(href);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop con desenfoque de cristal profundo */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Contenedor Modal Glassy */}
      <div className="relative w-full max-w-xl rounded-2xl glass-modal shadow-[0_25px_70px_rgba(0,0,0,0.55)] backdrop-blur-3xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Barra de entrada de búsqueda */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200/80 dark:border-white/10">
          <Search className="h-5 w-5 text-slate-400 dark:text-zinc-400 shrink-0" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar sección, cliente o servicio…"
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] tabular-nums font-semibold text-slate-400 dark:text-zinc-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md">
              ESC
            </kbd>
          )}
        </div>

        {/* Lista de Resultados con Scroll Suave */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
          {/* Secciones del Sistema */}
          {!query.trim() ? (
            <>
              {/* En Mobile (< sm): Solo 3 recomendaciones o búsquedas recientes */}
              <div className="sm:hidden">
                <p className="px-3 py-1 text-[11px] tabular-nums font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
                  {recentSearchHrefs.length > 0 ? "Búsquedas recientes" : "Recomendaciones"}
                </p>
                <div className="space-y-0.5 mt-1">
                  {mobileRecommendedRoutes.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={`mob-${r.id}`}
                        type="button"
                        onClick={() => handleSelect(r.href)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/10 transition group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center shrink-0 text-slate-500 dark:text-zinc-400 group-hover:text-[var(--primary)] group-hover:border-[var(--primary)]/40 transition">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium truncate">{r.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-400 tabular-nums shrink-0">
                          {r.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* En Desktop (>= sm): Todas las secciones normales */}
              <div className="hidden sm:block">
                <p className="px-3 py-1 text-[11px] tabular-nums font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
                  Secciones
                </p>
                <div className="space-y-0.5 mt-1">
                  {filteredRoutes.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={`desk-${r.id}`}
                        type="button"
                        onClick={() => handleSelect(r.href)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/10 transition group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center shrink-0 text-slate-500 dark:text-zinc-400 group-hover:text-[var(--primary)] group-hover:border-[var(--primary)]/40 transition">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium truncate">{r.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-400 tabular-nums shrink-0">
                          {r.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            filteredRoutes.length > 0 && (
              <div>
                <p className="px-3 py-1 text-[11px] tabular-nums font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
                  Secciones
                </p>
                <div className="space-y-0.5 mt-1">
                  {filteredRoutes.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleSelect(r.href)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/10 transition group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center shrink-0 text-slate-500 dark:text-zinc-400 group-hover:text-[var(--primary)] group-hover:border-[var(--primary)]/40 transition">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium truncate">{r.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-400 tabular-nums shrink-0">
                          {r.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* Clientes Encontrados */}
          {filteredClients.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[11px] tabular-nums font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
                Clientes
              </p>
              <div className="space-y-0.5 mt-1">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect("/dashboard/clientes")}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/10 transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-7 w-7 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 flex items-center justify-center text-xs font-semibold shrink-0">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate leading-tight">{c.name}</p>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-400">{c.phone || "Sin teléfono"}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Servicios Encontrados */}
          {filteredServices.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[11px] tabular-nums font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
                Servicios
              </p>
              <div className="space-y-0.5 mt-1">
                {filteredServices.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelect("/dashboard/servicios")}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/10 transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Scissors className="h-4 w-4 text-slate-400 group-hover:text-[var(--primary)] transition" />
                      <span className="font-medium truncate">{s.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
                      Gs. {s.price.toLocaleString("es-PY")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredRoutes.length === 0 && filteredClients.length === 0 && filteredServices.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
                No encontramos resultados para &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1">
                Intenta con otra palabra clave como &ldquo;agenda&rdquo;, &ldquo;caja&rdquo; o el nombre de un cliente.
              </p>
            </div>
          )}
        </div>

        {/* Pie de Atajos (Oculto en Mobile, visible en Desktop) */}
        <div className="hidden sm:flex px-4 py-2.5 bg-slate-50 dark:bg-black/30 border-t border-slate-200/80 dark:border-white/5 items-center justify-between text-[11px] text-slate-400 dark:text-zinc-400">
          <span>Presiona <kbd className="tabular-nums font-semibold">↵</kbd> para navegar</span>
          <span className="tabular-nums text-[11px] uppercase">Agendatepy Glassy 2.0</span>
        </div>
      </div>
    </div>
  );
}
