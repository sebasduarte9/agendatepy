import type { PlanId } from "@/lib/dashboard-types";

/**
 * AgendatePY subscription plans. Same prices and limits as the landing page
 * (components/landing/Pricing.tsx) and the sales assistant.
 */
export type PlanInfo = {
  id: PlanId;
  name: string;
  description: string;
  priceMonthly: number;
  /** Monthly equivalent when paid yearly (2 months free) */
  priceAnnualMonthly: number;
  bookingLimit: number | null;
  staffLimit: number | null;
  badge?: string;
  includes?: string;
  features: string[];
};

export const PLANS: PlanInfo[] = [
  {
    id: "gratis",
    name: "Plan Gratuito",
    description: "Para arrancar sin costo y recibir tus primeras reservas online.",
    priceMonthly: 0,
    priceAnnualMonthly: 0,
    bookingLimit: 20,
    staffLimit: 1,
    features: [
      "1 profesional",
      "Hasta 20 turnos por mes",
      "Página de reservas con tu logo",
      "Link para Instagram y Google Maps",
      "0% de comisión por turno",
    ],
  },
  {
    id: "basico",
    name: "Plan Básico",
    description: "Para profesionales independientes que quieren automatizar WhatsApp.",
    priceMonthly: 100000,
    priceAnnualMonthly: 80000,
    bookingLimit: 100,
    staffLimit: 1,
    badge: "14 días gratis",
    includes: "Todo lo del Gratuito, y además:",
    features: [
      "Hasta 100 turnos por mes",
      "Asistente IA que agenda por WhatsApp",
      "Confirmaciones automáticas por WhatsApp",
      "Tus clientes guardan el turno en Google Calendar",
    ],
  },
  {
    id: "pro",
    name: "Plan Pro",
    description: "Para salones, barberías y spas con equipo.",
    priceMonthly: 250000,
    priceAnnualMonthly: 200000,
    bookingLimit: null,
    staffLimit: 10,
    badge: "Recomendado",
    includes: "Todo lo del Básico, y además:",
    features: [
      "Hasta 10 profesionales",
      "Turnos ilimitados",
      "Recordatorios automáticos por WhatsApp",
      "Comisiones automáticas por profesional",
      "Caja y arqueo diario",
      "Ficha y CRM de clientes",
      "Soporte prioritario por WhatsApp",
    ],
  },
];

/** Tenant.plan in the database (BASICO, PROFESIONAL, EMPRESA, FREE, TRIAL…) → dashboard plan id */
export function planIdFromDb(raw: string | null | undefined): PlanId {
  const value = (raw || "").trim().toUpperCase();
  if (["FREE", "GRATIS", "GRATUITO", "INICIAL"].includes(value)) return "gratis";
  if (["BASICO", "BÁSICO", "BASIC", "TRIAL"].includes(value)) return "basico";
  if (["EMPRESA", "ENTERPRISE"].includes(value)) return "empresa";
  return "pro";
}

export function planById(id: PlanId): PlanInfo | null {
  return PLANS.find((p) => p.id === id) ?? null;
}
