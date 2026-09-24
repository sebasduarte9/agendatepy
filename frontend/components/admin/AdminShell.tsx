"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ExternalLink,
  Menu,
  Palette,
  Scissors,
  Settings,
  Users,
  X,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Inicio", icon: CalendarDays },
  { href: "/admin/servicios", label: "Servicios", icon: Scissors },
  { href: "/admin/equipo", label: "Equipo", icon: Users },
  { href: "/admin/apariencia", label: "Apariencia", icon: Palette },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
] as const;

export default function AdminShell({
  name,
  slug,
  primaryColor,
  children,
}: {
  name: string;
  slug: string;
  primaryColor: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [open, setOpen] = useState(false);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <div className="min-h-dvh bg-[#eef0f4] md:grid md:grid-cols-[17.5rem_minmax(0,1fr)]">
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/10 bg-slate-950 px-4 text-white md:hidden">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <p className="truncate text-sm font-semibold">{name}</p>
      </div>

      {open && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col bg-slate-950 text-slate-300 shadow-2xl shadow-slate-950/30 transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 pb-4 pt-7">
          <div
            className="mb-4 h-1.5 w-10 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Panel
          </p>
          <p className="mt-1 truncate text-lg font-semibold text-white">{name}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Administración">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const isPathBased = pathname.startsWith(`/${slug}`);
            const resolvedHref = isPathBased ? `/${slug}${href}` : href;
            const current = isCurrent(pathname, slug, href);
            return (
              <Link
                key={href}
                href={resolvedHref}
                aria-current={current ? "page" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                  current ? "text-white shadow-lg" : "hover:bg-white/5 hover:text-white"
                }`}
                style={current ? { backgroundColor: primaryColor } : undefined}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4">
          <Link
            href={pathname.startsWith(`/${slug}`) ? `/${slug}/reservar` : "/reservar"}
            target="_blank"
            className="flex items-center justify-between rounded-2xl border border-white/10 px-3 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition"
          >
            <span>Ver página pública</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}

function isCurrent(pathname: string, slug: string, href: string): boolean {
  const internal = `/${slug}${href}`;
  if (href === "/admin") {
    return pathname === "/admin" || pathname === internal;
  }
  return (
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    pathname === internal ||
    pathname.startsWith(`${internal}/`)
  );
}
