"use client";

import { create } from "zustand";
import { formatInTimeZone } from "date-fns-tz";
import type {
  Appointment,
  BusinessProfile,
  CalendarView,
  Receipt,
  ServiceItem,
  ProductItem,
  StaffMember,
  TimeBlock,
  Client,
  CashMovement,
  WhatsAppTemplate,
  LoyaltySettings,
  SipapConfig,
  EvolutionApiConfig,
  UserRole,
  CrmConversation,
  CrmChannel,
  CrmMessage,
  ClientMedia,
  ClientMediaType,
  ClientMediaTag,
} from "@/lib/dashboard-types";

const TIMEZONE_NOTE =
  "Normalización TZ: interpretar start/end con formatInTimeZone(business.timezone).";

export const TIMEZONES = [
  "America/Asuncion",
  "America/Argentina/Buenos_Aires",
  "America/Sao_Paulo",
  "America/Santiago",
  "America/Mexico_City",
  "Europe/Madrid",
];

export const defaultCivilDate = (() => {
  try {
    return formatInTimeZone(new Date(), "America/Asuncion", "yyyy-MM-dd");
  } catch {
    return "2026-09-25";
  }
})();

const staff: StaffMember[] = [
  {
    id: "st-marcos",
    name: "Marcos Benítez",
    role: "Master Barber & Estilista",
    systemRole: "barbero",
    description: "Cortes clásicos, degradé, perfilado de barba y perfilado.",
    avatar: "MB",
    color: "#4f46e5",
    active: true,
    hours: "09:00 – 19:00",
    commissionPercentage: 50,
  },
  {
    id: "st-sofia",
    name: "Sofía Alcaraz",
    role: "Colorista & Peinados",
    systemRole: "estilista",
    description: "Especialista en coloración, alisados y tratamientos capilares.",
    avatar: "SA",
    color: "#ec4899",
    active: true,
    hours: "09:00 – 18:00",
    commissionPercentage: 45,
  },
  {
    id: "st-diego",
    name: "Diego Franco",
    role: "Barbero",
    systemRole: "barbero",
    description: "Cortes modernos, fade, diseños y cuidado facial.",
    avatar: "DF",
    color: "#0ea5e9",
    active: true,
    hours: "11:00 – 20:00",
    commissionPercentage: 40,
  },
  {
    id: "st-leticia",
    name: "Leticia Romero",
    role: "Cajera & Recepción",
    systemRole: "cajero",
    description: "Atención al cliente, cobros en caja, facturación y SIPAP.",
    avatar: "LR",
    color: "#10b981",
    active: true,
    hours: "08:30 – 19:30",
    commissionPercentage: 0,
  },
];

const services: ServiceItem[] = [
  {
    id: "sv-corte",
    name: "Corte de Pelo Clásico / Fade",
    category: "Peluquería",
    durationMin: 35,
    price: 80000,
    description: "Lavado previo, corte personalizado a tijera o máquina y peinado final.",
    image: "scissors",
  },
  {
    id: "sv-barba",
    name: "Corte + Ritual de Barba",
    category: "Barbería",
    durationMin: 55,
    price: 130000,
    description: "Corte completo con toalla caliente, aceite de argán y perfilado a navaja.",
    image: "scissors",
  },
  {
    id: "sv-color",
    name: "Colorimetría / Mechas Balayage",
    category: "Color",
    durationMin: 120,
    price: 320000,
    description: "Diseño de color personalizado con nutrición profunda y peinado.",
    image: "sparkles",
  },
  {
    id: "sv-tratamiento",
    name: "Tratamiento de Keratina / Alisado",
    category: "Tratamiento",
    durationMin: 90,
    price: 250000,
    description: "Nutrición capilar intensiva anti-frizz con efecto espejo.",
    image: "sparkles",
  },
  {
    id: "sv-perfilado",
    name: "Perfilado de Cejas y Barba Express",
    category: "Barbería",
    durationMin: 20,
    price: 45000,
    description: "Mantenimiento rápido de barba y cejas para el fin de semana.",
    image: "sparkles",
  },
];

export const initialProducts: ProductItem[] = [
  {
    id: "pr-1",
    name: "Cera Capilar Efecto Mate Extreme",
    description: "Fijación fuerte y duradera sin brillo. Ideal para tupés, quiffs y peinados con textura.",
    price: 70000,
    cost: 35000,
    imageUrl: "https://images.unsplash.com/photo-1597354984706-aec992b7d0d1?w=500&auto=format&fit=crop&q=80",
    category: "Peinado",
    stock: 18,
    active: true,
  },
  {
    id: "pr-2",
    name: "Aceite para Barba Sandalwood & Argán",
    description: "Hidratación profunda para piel y barba. Elimina la picazón y deja un aroma amaderado sofisticado.",
    price: 55000,
    cost: 25000,
    imageUrl: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&auto=format&fit=crop&q=80",
    category: "Cuidado Barba",
    stock: 12,
    active: true,
  },
  {
    id: "pr-3",
    name: "Shampoo Anticaída & Biotina Profesional",
    description: "Estimula el folículo piloso, previene el debilitamiento capilar y otorga densidad.",
    price: 85000,
    cost: 45000,
    imageUrl: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=80",
    category: "Lavado & Cuidado",
    stock: 9,
    active: true,
  },
  {
    id: "pr-4",
    name: "Pomada Clásica Base Agua Brillo Medio",
    description: "Peinados clásicos estilo pompadour o raya al costado. Se retira fácilmente con agua.",
    price: 65000,
    cost: 30000,
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80",
    category: "Peinado",
    stock: 15,
    active: true,
  },
  {
    id: "pr-5",
    name: "Perfume Capilar & Aftershave Colonia Fresh",
    description: "Refresca la piel tras el afeitado y neutraliza olores dejando una fragancia masculina duradera.",
    price: 90000,
    cost: 48000,
    imageUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&auto=format&fit=crop&q=80",
    category: "Fragancias",
    stock: 8,
    active: true,
  },
];

export const initialLoyalty: LoyaltySettings = {
  enabled: true,
  mode: "stamps",
  rewardThreshold: 5,
  rewardDescription: "50% OFF en tu próximo corte o servicio",
  pointsPerVisit: 1,
};

export const initialSipap: SipapConfig = {
  bankName: "Banco Itaú Paraguay",
  accountHolder: "Barbería & Studio AgendatePY S.A.",
  rucOrCi: "80099881-2",
  accountNumber: "720045678",
  aliasSipap: "agendate.py",
};

export const initialEvolutionApi: EvolutionApiConfig = {
  enabled: true,
  baseUrl: "https://api.evolution.py",
  apiKey: "EVO_SECRET_DEMO_KEY_2026",
  instanceName: "agendatepy-central",
  autoSendOnBooking: true,
  autoSendOnCancel: true,
  connected: true,
};

/** Turnos de demo y visitas históricas en Guaraníes (Asunción, UTC-3). */
const appointments: Appointment[] = [
  // Visitas de María Ferreira
  {
    id: "ap-1",
    clientName: "María Ferreira",
    clientEmail: "maria.ferreira@gmail.com",
    clientPhone: "+595981111222",
    serviceId: "sv-color",
    staffId: "st-sofia",
    start: `${defaultCivilDate}T11:30:00.000-03:00`,
    end: `${defaultCivilDate}T13:30:00.000-03:00`,
    paymentMethod: "pos_bancard",
    status: "confirmed",
    notes: "Balayage miel: Tono 8.3 con oxidante 20 vol + matizador plata. Quedó encantada con el matiz.",
  },
  {
    id: "ap-1b",
    clientName: "María Ferreira",
    clientEmail: "maria.ferreira@gmail.com",
    clientPhone: "+595981111222",
    serviceId: "sv-tratamiento",
    staffId: "st-sofia",
    start: "2026-08-22T13:00:00.000Z",
    end: "2026-08-22T14:30:00.000Z",
    paymentMethod: "pos_bancard",
    status: "confirmed",
    notes: "Tratamiento intensivo con botox capilar y baño de brillo. Corte de puntas abiertas (2 cm).",
  },
  {
    id: "ap-1c",
    clientName: "María Ferreira",
    clientEmail: "maria.ferreira@gmail.com",
    clientPhone: "+595981111222",
    serviceId: "sv-lavado",
    staffId: "st-sofia",
    start: "2026-07-28T16:00:00.000Z",
    end: "2026-07-28T16:45:00.000Z",
    paymentMethod: "efectivo",
    status: "confirmed",
    notes: "Lavado premium con mascarilla reconstructora y peinado con ondas suaves.",
  },

  // Visitas de José Insfrán
  {
    id: "ap-2",
    clientName: "José Insfrán",
    clientEmail: "jose.insfran@hotmail.com",
    clientPhone: "+595982333444",
    serviceId: "sv-barba",
    staffId: "st-marcos",
    start: `${defaultCivilDate}T15:00:00.000-03:00`,
    end: `${defaultCivilDate}T15:55:00.000-03:00`,
    paymentMethod: "sipap",
    status: "confirmed",
    receiptUrl: "/comprobante-jose.png",
    notes: "Corte fade medio con navaja + perfilado de barba con toalla caliente. Piel sensible: aplicar bálsamo mentolado sin alcohol.",
  },
  {
    id: "ap-2b",
    clientName: "José Insfrán",
    clientEmail: "jose.insfran@hotmail.com",
    clientPhone: "+595982333444",
    serviceId: "sv-corte",
    staffId: "st-marcos",
    start: "2026-09-02T15:00:00.000Z",
    end: "2026-09-02T15:35:00.000Z",
    paymentMethod: "efectivo",
    status: "confirmed",
    notes: "Degradé lateral 0 a 1.5, textura con tijera de entresacar en la cúspide. Peinado con cera mate.",
  },
  {
    id: "ap-2c",
    clientName: "José Insfrán",
    clientEmail: "jose.insfran@hotmail.com",
    clientPhone: "+595982333444",
    serviceId: "sv-barba",
    staffId: "st-marcos",
    start: "2026-08-16T14:00:00.000Z",
    end: "2026-08-16T14:50:00.000Z",
    paymentMethod: "pos_bancard",
    status: "confirmed",
    notes: "Alineación de bigote y desvanecido de patillas.",
  },

  // Visitas de Carla Duarte
  {
    id: "ap-3",
    clientName: "Carla Duarte",
    clientEmail: "carla.duarte@pymail.com",
    clientPhone: "+595983555666",
    serviceId: "sv-tratamiento",
    staffId: "st-sofia",
    start: "2026-09-19T16:00:00.000Z",
    end: "2026-09-19T17:30:00.000Z",
    paymentMethod: "efectivo",
    status: "confirmed",
    notes: "Alisado de keratina termoactiva brasileña. Planchado en mechones finos a 210°C. Cero frizz.",
  },
  {
    id: "ap-3b",
    clientName: "Carla Duarte",
    clientEmail: "carla.duarte@pymail.com",
    clientPhone: "+595983555666",
    serviceId: "sv-corte",
    staffId: "st-sofia",
    start: "2026-08-10T17:00:00.000Z",
    end: "2026-08-10T17:40:00.000Z",
    paymentMethod: "pos_bancard",
    status: "confirmed",
    notes: "Corte desfilado en capas para dar ligereza antes del tratamiento.",
  },

  // Pedro Gómez
  {
    id: "ap-4",
    clientName: "Pedro Gómez",
    clientEmail: "pedro.gomez@gmail.com",
    clientPhone: "+595984777888",
    serviceId: "sv-corte",
    staffId: "st-diego",
    start: "2026-09-20T11:00:00.000Z",
    end: "2026-09-20T11:35:00.000Z",
    paymentMethod: "efectivo",
    status: "confirmed",
    notes: "Corte clásico a tijera en laterales, número 3 en nuca. Primera visita recomendada por Instagram.",
  },

  // Ana Torres
  {
    id: "ap-5",
    clientName: "Ana Torres",
    clientEmail: "ana.torres@gmail.com",
    clientPhone: "+595985112233",
    serviceId: "sv-corte",
    staffId: "st-marcos",
    start: "2026-09-18T14:00:00.000Z",
    end: "2026-09-18T14:35:00.000Z",
    paymentMethod: "pos_bancard",
    status: "cancelled",
    notes: "Cancelado con aviso previo de 2 horas por motivo laboral.",
  },

  // Luis Vera
  {
    id: "ap-6",
    clientName: "Luis Vera",
    clientEmail: "luis.vera@outlook.com",
    clientPhone: "+595986999000",
    serviceId: "sv-barba",
    staffId: "st-marcos",
    start: "2026-09-21T16:00:00.000Z",
    end: "2026-09-21T16:55:00.000Z",
    paymentMethod: "sipap",
    status: "confirmed",
    receiptUrl: "/comprobante-luis.png",
    notes: "Barba completa degrade 1 a 3 con contorno definido a navaja. Abono confirmado por SIPAP.",
  },
  {
    id: "ap-6b",
    clientName: "Luis Vera",
    clientEmail: "luis.vera@outlook.com",
    clientPhone: "+595986999000",
    serviceId: "sv-corte",
    staffId: "st-marcos",
    start: "2026-08-25T16:30:00.000Z",
    end: "2026-08-25T17:10:00.000Z",
    paymentMethod: "sipap",
    status: "confirmed",
    notes: "Fade bajo tradicional y rebaje de volumen superior.",
  },
];

const initialCashMovements: CashMovement[] = [
  {
    id: "cm-1",
    type: "ingreso",
    amount: 300000,
    method: "efectivo",
    concept: "Apertura de caja chica",
    date: "2026-09-19T08:00:00.000Z",
  },
  {
    id: "cm-2",
    type: "ingreso",
    amount: 320000,
    method: "pos",
    concept: "Cobro turno: María Ferreira (Colorimetría)",
    date: "2026-09-19T14:05:00.000Z",
    appointmentId: "ap-1",
    voucherNumber: "POS-48912",
  },
  {
    id: "cm-3",
    type: "egreso",
    amount: 35000,
    method: "efectivo",
    concept: "Compra de hielo y café p/ recepción",
    date: "2026-09-19T14:30:00.000Z",
  },
  {
    id: "cm-4",
    type: "ingreso",
    amount: 250000,
    method: "efectivo",
    concept: "Cobro turno: Carla Duarte (Tratamiento Keratina)",
    date: "2026-09-19T17:35:00.000Z",
    appointmentId: "ap-3",
  },
];

const initialWhatsAppTemplates: WhatsAppTemplate[] = [
  {
    id: "wt-confirmacion",
    name: "Confirmación Inmediata de Turno",
    trigger: "confirmacion",
    body: "¡Hola {cliente}! Tu turno para *{servicio}* con *{profesional}* quedó confirmado para el *{fecha} a las {hora} hs* en {negocio}.\n\nUbicación: {direccion}\nVer o gestionar tu turno: {link_autogestion}\n\n¡Te esperamos!",
    enabled: true,
  },
  {
    id: "wt-recordatorio-24h",
    name: "Recordatorio 24 Horas Antes",
    trigger: "recordatorio_24h",
    body: "¡Hola {cliente}! Te recordamos tu turno de mañana *{fecha} a las {hora} hs* para *{servicio}* en *{negocio}*.\n\n¿Nos confirmás tu asistencia? Si necesitás reprogramar o cancelar, podés hacerlo con un clic aquí:\n{link_autogestion}",
    enabled: true,
  },
  {
    id: "wt-recordatorio-2h",
    name: "Recordatorio 2 Horas Antes",
    trigger: "recordatorio_2h",
    body: "¡Hola {cliente}! Te recordamos que tu turno es en 2 horas ({hora} hs). Te estamos esperando en {negocio} ({direccion}). ¡Nos vemos pronto!",
    enabled: true,
  },
  {
    id: "wt-cancelacion",
    name: "Aviso de Turno Cancelado",
    trigger: "cancelacion",
    body: "Hola {cliente}, te confirmamos que tu turno para *{servicio}* del *{fecha}* ha sido cancelado con éxito. Cuando desees volver a agendarte, podés elegir un nuevo horario aquí: {link_negocio}",
    enabled: true,
  },
];

type DashboardState = {
  business: BusinessProfile;
  staff: StaffMember[];
  services: ServiceItem[];
  products: ProductItem[];
  appointments: Appointment[];
  blocks: TimeBlock[];
  receipts: Receipt[];
  clients: Client[];
  cashMovements: CashMovement[];
  whatsappTemplates: WhatsAppTemplate[];
  loyalty: LoyaltySettings;
  sipap: SipapConfig;
  evolutionApi: EvolutionApiConfig;
  calendarDate: string;
  calendarView: CalendarView;
  selectedStaffId: string | "all";
  sidebarOpen: boolean;
  toasts: { id: string; type: "success" | "error"; message: string }[];
  timezoneNote: string;
  splitComment: string;
  setSidebarOpen: (open: boolean) => void;
  setCalendarDate: (isoDate: string) => void;
  setCalendarView: (view: CalendarView) => void;
  setSelectedStaffId: (id: string | "all") => void;
  updateBusiness: (patch: Partial<BusinessProfile>) => Promise<any> | void;
  addAppointment: (item: Appointment) => Promise<any> | void;
  cancelAppointment: (id: string) => Promise<any> | void;
  addBlock: (block: Omit<TimeBlock, "id">) => Promise<any> | void;
  removeBlock: (id: string) => Promise<any> | void;
  setReceiptStatus: (id: string, status: Receipt["status"]) => void;
  toggleStaff: (id: string) => Promise<any> | void;
  addStaff: (item: Omit<StaffMember, "id">) => Promise<any> | void;
  updateStaff: (id: string, patch: Partial<StaffMember>) => Promise<any> | void;
  deleteStaff: (id: string) => Promise<any> | void;
  updateStaffCommission: (id: string, percentage: number) => Promise<any> | void;
  addService: (item: Omit<ServiceItem, "id">) => Promise<any> | void;
  updateService: (id: string, patch: Partial<ServiceItem>) => Promise<any> | void;
  removeService: (id: string) => Promise<any> | void;
  addProduct: (item: Omit<ProductItem, "id">) => void;
  updateProduct: (id: string, patch: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;
  updateProductStock: (id: string, delta: number) => void;
  addClient: (client: Omit<Client, "id">) => Promise<any> | void;
  updateClient: (id: string, patch: Partial<Client>) => Promise<any> | void;
  deleteClient: (id: string) => Promise<any> | void;
  updateLoyalty: (patch: Partial<LoyaltySettings>) => void;
  addClientLoyaltyPoint: (clientId: string) => void;
  redeemClientReward: (clientId: string) => void;
  updateSipap: (patch: Partial<SipapConfig>) => void;
  updateEvolutionApi: (patch: Partial<EvolutionApiConfig>) => void;
  addCashMovement: (item: Omit<CashMovement, "id">) => Promise<any> | void;
  deleteCashMovement: (id: string) => Promise<any> | void;
  currentUserRole: UserRole;
  currentStaffId?: string;
  setCurrentUserRole: (role: UserRole, staffId?: string) => void;
  updateAppointment: (id: string, patch: Partial<Appointment>) => Promise<any> | void;
  updateWhatsAppTemplate: (id: string, body: string) => void;
  toggleWhatsAppTemplate: (id: string) => void;
  pushToast: (type: "success" | "error", message: string) => void;
  dismissToast: (id: string) => void;
  crmConversations: CrmConversation[];
  sendCrmMessage: (conversationId: string, text: string) => void;
  resolveCrmConversation: (conversationId: string) => void;
  reopenCrmConversation: (conversationId: string) => void;
  addClientMedia: (clientId: string, media: Omit<ClientMedia, "id" | "createdAt">) => void;
  deleteClientMedia: (clientId: string, mediaId: string) => void;
  syncFromDatabase: (tenantSlug?: string) => Promise<void>;
  isInitialSyncDone: boolean;
  isTourOpen: boolean;
  tourSectionKey: string;
  openTour: (sectionKey?: string) => void;
  closeTour: () => void;
};

function splitOvernightBlock(block: Omit<TimeBlock, "id">): Omit<TimeBlock, "id">[] {
  const [sh, sm] = block.start.split(":").map(Number);
  const [eh, em] = block.end.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  if (endMin > startMin) return [block];

  const next = new Date(`${block.date}T00:00:00`);
  next.setDate(next.getDate() + 1);
  const nextDate = next.toISOString().slice(0, 10);
  return [
    { ...block, end: "23:59" },
    { ...block, date: nextDate, start: "00:00" },
  ];
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  timezoneNote: TIMEZONE_NOTE,
  isInitialSyncDone: false,
  splitComment: "Si un bloque cruza medianoche en TZ de Asunción, se parte en dos fechas civiles.",
  business: {
    name: "Barbería & Studio AgendatePY",
    slug: "barberia",
    email: "hola@agendate.com.py",
    phone: "+595 981 700 800",
    address: "Av. Mariscal López 1420 c/ San Martín, Asunción",
    city: "Asunción",
    timezone: "America/Asuncion",
    primaryColor: "#4f46e5",
    plan: "pro",
    usedBookings: 24,
    freeBookingLimit: 100,
    whatsappOn: true,
    whatsappNumber: "595981700800",
    discordWebhook: "",
    maxAdvanceDays: 30,
    metaPixel: "",
    tiktokPixel: "",
    openingCash: 300000,
    acceptedPaymentMethods: ["efectivo", "pos", "transferencia", "billetera", "qr"],
  },
  staff: [],
  services: [],
  products: [],
  appointments: [],
  clients: [],
  cashMovements: [],
  whatsappTemplates: initialWhatsAppTemplates,
  loyalty: initialLoyalty,
  sipap: initialSipap,
  evolutionApi: initialEvolutionApi,
  blocks: [],
  receipts: [],
  currentUserRole: "admin",
  currentStaffId: undefined,
  setCurrentUserRole: (role, staffId) =>
    set({
      currentUserRole: role,
      currentStaffId: staffId,
      selectedStaffId: role === "barbero" || role === "estilista" ? staffId || "st-marcos" : "all",
    }),
  calendarDate: defaultCivilDate,
  calendarView: "dia",
  selectedStaffId: "all",
  sidebarOpen: false,
  toasts: [],
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCalendarDate: (isoDate) => set({ calendarDate: isoDate }),
  setCalendarView: (view) => set({ calendarView: view }),
  setSelectedStaffId: (id) => set({ selectedStaffId: id }),
  updateBusiness: async (patch) => {
    set({ business: { ...get().business, ...patch } });
    try {
      const res = await fetch("/api/tenant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      return data.ok;
    } catch (err) {
      console.error("Error syncing business settings to DB:", err);
      return false;
    }
  },
  syncFromDatabase: async (tenantSlug?: string) => {
    try {
      const url = tenantSlug
        ? `/api/dashboard/sync?tenant=${encodeURIComponent(tenantSlug)}`
        : `/api/dashboard/sync`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.ok) return;

      set((state) => {
        const nextState: Partial<DashboardState> = {};

        if (data.tenant) {
          const t = data.tenant;
          nextState.business = {
            ...state.business,
            name: t.name || state.business.name,
            slug: t.slug || state.business.slug,
            timezone: t.timezone || state.business.timezone,
            phone: t.phone || state.business.phone,
            whatsappNumber: t.whatsappNumber || state.business.whatsappNumber,
            address: t.address || state.business.address,
            openingCash: t.openingCash ?? state.business.openingCash,
            acceptedPaymentMethods: t.settings?.acceptedPaymentMethods || state.business.acceptedPaymentMethods,
          };
        }

        if (data.tenant?.settings?.loyalty) {
          nextState.loyalty = {
            ...state.loyalty,
            ...data.tenant.settings.loyalty,
          };
        }

        if (Array.isArray(data.services)) {
          nextState.services = data.services.map((s: any) => ({
            id: s.id,
            name: s.name,
            category: s.category || "Peluquería",
            durationMin: s.durationMin ?? 45,
            price: s.price ?? 80000,
            description: s.description || "",
            image: s.image || "scissors",
            active: s.active ?? true,
            staffIds: s.staffIds || [],
            hasPromo: Boolean(s.hasPromo),
            promoPrice: s.promoPrice,
            promoBadge: s.promoBadge,
            promoDisplayType: s.promoDisplayType,
            promoType: s.promoType,
            promoLimitQuantity: s.promoLimitQuantity,
            promoLimitHours: s.promoLimitHours,
            promoDeadline: s.promoDeadline,
            requirePrepayment: Boolean(s.requirePrepayment),
            prepaymentType: s.prepaymentType,
            prepaymentAmount: s.prepaymentAmount,
            prepaymentMethod: s.prepaymentMethod,
            prepaymentInstructions: s.prepaymentInstructions,
          }));
        }

        if (Array.isArray(data.staff)) {
          nextState.staff = data.staff.map((st: { id: string; name: string; active?: boolean; commissionPercentage?: number }) => ({
            id: st.id,
            name: st.name,
            role: "Colaborador",
            systemRole: "barbero",
            description: "",
            avatar: st.name.slice(0, 2).toUpperCase(),
            color: "#4f46e5",
            active: st.active ?? true,
            hours: "08:00 – 20:00",
            commissionPercentage: st.commissionPercentage ?? 50,
          }));
        }

        if (Array.isArray(data.clients)) {
          nextState.clients = data.clients.map((c: any) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email || "",
            notes: c.notes || "",
            formula: c.formula || "",
            tags: Array.isArray(c.tags) && c.tags.length > 0 ? c.tags : ["Nuevo"],
            instagram: c.instagram || "",
            totalVisits: c.totalVisits ?? 0,
            totalSpent: c.totalSpent ?? 0,
            lastVisit: c.lastVisit || new Date().toISOString(),
            loyaltyPoints: c.loyaltyPoints ?? 0,
            loyaltyRedeemed: 0,
          }));
        }

        if (Array.isArray(data.cashMovements)) {
          nextState.cashMovements = data.cashMovements.map((cm: any) => ({
            id: cm.id,
            type: cm.type,
            amount: cm.amount,
            method: cm.method,
            concept: cm.concept,
            date: cm.date,
            category: cm.category,
            appointmentId: cm.appointmentId,
          }));
        }

        if (Array.isArray(data.scheduleBlocks)) {
          const tz = (nextState.business?.timezone || state.business.timezone || "America/Asuncion");
          nextState.blocks = data.scheduleBlocks.map((b: any) => {
            const bDate = formatInTimeZone(b.startTime, tz, "yyyy-MM-dd");
            const bStart = formatInTimeZone(b.startTime, tz, "HH:mm");
            const bEnd = formatInTimeZone(b.endTime, tz, "HH:mm");
            return {
              id: b.id,
              staffId: b.staffId || undefined,
              date: bDate,
              start: bStart,
              end: bEnd,
              reason: b.reason || "Bloqueo operativo",
            };
          });
        }

        if (Array.isArray(data.appointments)) {
          nextState.appointments = data.appointments;
        }

        if (Array.isArray(data.products)) {
          nextState.products = data.products;
        }

        return nextState;
      });
    } catch (err) {
      console.error("Error al sincronizar con PostgreSQL:", err);
    } finally {
      set({ isInitialSyncDone: true });
    }
  },
  updateAppointment: async (id, patch) => {
    const prev = get().appointments;
    const existing = prev.find((a) => a.id === id);
    if (!existing) return false;

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: patch.start,
          endTime: patch.end,
          staffId: patch.staffId,
          status: patch.status,
        }),
      });
      const data = await res.json();
      if (res.status === 409 || data.error === "SLOT_TAKEN") {
        get().pushToast("error", data.message || "Horario ocupado. El profesional ya tiene un turno en ese intervalo.");
        return false;
      }
      if (!data.ok) {
        get().pushToast("error", data.message || "Error al reprogramar la cita.");
        return false;
      }

      // Regla estricta de fidelización VIP: solo otorga sello y suma visita al COMPLETAR y asistir al turno
      let updatedClients = get().clients;
      if (patch.status === "completed" && existing.status !== "completed") {
        const service = get().services.find((s) => s.id === (patch.serviceId || existing.serviceId));
        const price = service?.price ?? 0;
        const addPoints = get().loyalty.enabled ? get().loyalty.pointsPerVisit : 1;

        updatedClients = updatedClients.map((c) => {
          const isMatch =
            (existing.clientId && c.id === existing.clientId) ||
            c.phone === existing.clientPhone ||
            c.name.toLowerCase() === existing.clientName.toLowerCase();
          if (isMatch) {
            return {
              ...c,
              totalVisits: c.totalVisits + 1,
              totalSpent: c.totalSpent + price,
              lastVisit: existing.start,
              loyaltyPoints: c.loyaltyPoints + addPoints,
            };
          }
          return c;
        });
      }

      set({
        appointments: prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        clients: updatedClients,
      });
      return true;
    } catch (err) {
      console.error("Error updating appointment:", err);
      get().pushToast("error", "Error de comunicación con el servidor al reprogramar.");
      return false;
    }
  },
  addAppointment: async (item) => {
    const tempId = item.id;
    const apps = [...get().appointments, item];
    const existing = get().clients.find(
      (c) => c.phone === item.clientPhone || c.name.toLowerCase() === item.clientName.toLowerCase(),
    );
    const service = get().services.find((s) => s.id === item.serviceId);
    const price = service?.price ?? 0;

    // Regla estricta de fidelización VIP: solo suma visita y sello si el turno ya fue completado/asistido
    const isCompleted = item.status === "completed";
    const addPoints = isCompleted && get().loyalty.enabled ? get().loyalty.pointsPerVisit : 0;

    let updatedClients = get().clients;
    if (existing) {
      if (isCompleted) {
        updatedClients = get().clients.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                totalVisits: c.totalVisits + 1,
                totalSpent: c.totalSpent + price,
                lastVisit: item.start,
                loyaltyPoints: c.loyaltyPoints + addPoints,
              }
            : c,
        );
      }
    } else {
      const newClient: Client = {
        id: `cl-${Date.now()}`,
        name: item.clientName,
        phone: item.clientPhone,
        email: item.clientEmail,
        notes: item.notes || "Agendado vía web",
        totalVisits: isCompleted ? 1 : 0,
        totalSpent: isCompleted ? price : 0,
        lastVisit: isCompleted ? item.start : null,
        tags: ["Nuevo"],
        loyaltyPoints: addPoints,
        loyaltyRedeemed: 0,
      };
      updatedClients = [newClient, ...get().clients];
    }

    // Optimistically update store
    set({
      appointments: apps,
      clients: updatedClients,
    });

    // Synchronize with PostgreSQL and replace temporary ID with real database UUID
    try {
      const res = await fetch("/api/dashboard/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_appointment",
          tenantSlug: get().business.slug || "barberia",
          data: item,
        }),
      });
      const data = await res.json();
      if (data.ok && data.appointmentId) {
        const realId = data.appointmentId;
        set({
          appointments: get().appointments.map((a) =>
            a.id === tempId ? { ...a, id: realId } : a,
          ),
        });
        return realId;
      } else {
        set({
          appointments: get().appointments.filter((a) => a.id !== tempId),
        });
        get().pushToast("error", data.message || "No se pudo registrar la cita.");
        return null;
      }
    } catch (e) {
      console.error("Error syncing new appointment to DB:", e);
      set({
        appointments: get().appointments.filter((a) => a.id !== tempId),
      });
      get().pushToast("error", "Error de conexión al guardar la cita.");
      return null;
    }
  },
  cancelAppointment: async (id) => {
    const prev = get().appointments;
    set({
      appointments: prev.map((item) =>
        item.id === id ? { ...item, status: "cancelled" } : item,
      ),
    });
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) {
        set({ appointments: prev });
        get().pushToast("error", data.message || "Error al cancelar turno en PostgreSQL.");
        return false;
      }
      return true;
    } catch (e) {
      console.error("Error cancelling appointment in DB:", e);
      return false;
    }
  },
  addBlock: async (block) => {
    try {
      const res = await fetch("/api/schedule-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: block.staffId === "all" ? null : block.staffId,
          date: block.date,
          start: block.start,
          end: block.end,
          reason: block.reason,
        }),
      });
      const data = await res.json();
      if (data.ok && data.block) {
        const tz = get().business.timezone || "America/Asuncion";
        const b = data.block;
        const bDate = formatInTimeZone(b.startTime, tz, "yyyy-MM-dd");
        const bStart = formatInTimeZone(b.startTime, tz, "HH:mm");
        const bEnd = formatInTimeZone(b.endTime, tz, "HH:mm");
        set({
          blocks: [
            ...get().blocks,
            {
              id: b.id,
              staffId: b.staffId || undefined,
              date: bDate,
              start: bStart,
              end: bEnd,
              reason: b.reason,
            },
          ],
        });
        return true;
      } else {
        get().pushToast("error", data.message || "Error al guardar bloqueo de horario.");
        return false;
      }
    } catch (err) {
      console.error("Error creating block in DB:", err);
      get().pushToast("error", "Error de conexión al guardar bloqueo.");
      return false;
    }
  },
  removeBlock: async (id) => {
    const prev = get().blocks;
    set({ blocks: prev.filter((item) => item.id !== id) });
    try {
      const res = await fetch(`/api/schedule-blocks/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) {
        set({ blocks: prev });
        get().pushToast("error", data.message || "Error al eliminar bloqueo en PostgreSQL.");
        return false;
      }
      return true;
    } catch (err) {
      set({ blocks: prev });
      get().pushToast("error", "Error de conexión al eliminar bloqueo.");
      return false;
    }
  },
  setReceiptStatus: (id, status) => {
    const receipts = get().receipts.map((item) =>
      item.id === id ? { ...item, status } : item,
    );
    const receipt = receipts.find((item) => item.id === id);
    const appointments = get().appointments.map((item) => {
      if (item.id !== receipt?.appointmentId) return item;
      return {
        ...item,
        status: status === "approved" ? "confirmed" : status === "rejected" ? "cancelled" : item.status,
      };
    });
    set({ receipts, appointments });
  },
  toggleStaff: async (id) => {
    const target = get().staff.find((s) => s.id === id);
    if (!target) return;
    return get().updateStaff(id, { active: !target.active });
  },
  addStaff: async (item) => {
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          role: item.role,
          commissionPercentage: item.commissionPercentage,
          color: item.color,
          active: item.active,
          email: (item as any).email,
        }),
      });
      const data = await res.json();
      if (data.ok && data.staff) {
        set({
          staff: [
            ...get().staff,
            {
              id: data.staff.id,
              name: data.staff.name,
              role: data.staff.role || item.role,
              systemRole: item.systemRole || "barbero",
              description: item.description || "",
              avatar: item.avatar || data.staff.name.slice(0, 2).toUpperCase(),
              color: data.staff.color || item.color || "#4f46e5",
              active: data.staff.active ?? true,
              hours: item.hours || "08:00 – 20:00",
              commissionPercentage: data.staff.commissionPercentage ?? 50,
            },
          ],
        });
        return true;
      } else {
        get().pushToast("error", data.message || "Error al crear colaborador");
        return false;
      }
    } catch (err) {
      console.error("Error adding staff to DB:", err);
      get().pushToast("error", "Error de conexión al agregar colaborador");
      return false;
    }
  },
  updateStaff: async (id, patch) => {
    const prev = get().staff;
    set({
      staff: prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!data.ok) {
        set({ staff: prev });
        get().pushToast("error", data.message || "Error al actualizar colaborador");
        return false;
      }
      return true;
    } catch (err) {
      set({ staff: prev });
      get().pushToast("error", "Error de conexión al actualizar colaborador");
      return false;
    }
  },
  deleteStaff: async (id) => {
    const prev = get().staff;
    set({ staff: prev.filter((item) => item.id !== id) });
    try {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) {
        set({ staff: prev });
        get().pushToast("error", data.message || "Error al eliminar colaborador");
        return false;
      }
      return true;
    } catch (err) {
      set({ staff: prev });
      get().pushToast("error", "Error de conexión al eliminar colaborador");
      return false;
    }
  },
  updateStaffCommission: (id, percentage) =>
    get().updateStaff(id, { commissionPercentage: percentage }),
  addService: async (item) => {
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          category: item.category,
          durationMin: item.durationMin,
          price: item.price,
          description: item.description,
          active: item.active !== false,
          staffIds: item.staffIds,
          hasPromo: item.hasPromo,
          promoPrice: item.promoPrice,
          promoBadge: item.promoBadge,
          promoDisplayType: item.promoDisplayType,
          promoType: item.promoType,
          promoLimitQuantity: item.promoLimitQuantity,
          promoLimitHours: item.promoLimitHours,
          promoDeadline: item.promoDeadline,
          requirePrepayment: item.requirePrepayment,
          prepaymentType: item.prepaymentType,
          prepaymentAmount: item.prepaymentAmount,
          prepaymentMethod: item.prepaymentMethod,
          prepaymentInstructions: item.prepaymentInstructions,
        }),
      });
      const data = await res.json();
      if (data.ok && data.service) {
        set({
          services: [
            ...get().services,
            {
              id: data.service.id,
              name: data.service.name,
              category: data.service.category || item.category || "Peluquería",
              durationMin: data.service.durationMin,
              price: data.service.price,
              description: data.service.description || item.description || "",
              image: item.image || "scissors",
              active: data.service.active ?? true,
              staffIds: data.service.staffIds || item.staffIds || [],
              hasPromo: Boolean(data.service.hasPromo ?? item.hasPromo),
              promoPrice: data.service.promoPrice ?? item.promoPrice,
              promoBadge: data.service.promoBadge ?? item.promoBadge,
              promoDisplayType: data.service.promoDisplayType ?? item.promoDisplayType,
              promoType: data.service.promoType ?? item.promoType,
              promoLimitQuantity: data.service.promoLimitQuantity ?? item.promoLimitQuantity,
              promoLimitHours: data.service.promoLimitHours ?? item.promoLimitHours,
              promoDeadline: data.service.promoDeadline ?? item.promoDeadline,
              requirePrepayment: Boolean(data.service.requirePrepayment ?? item.requirePrepayment),
              prepaymentType: data.service.prepaymentType ?? item.prepaymentType,
              prepaymentAmount: data.service.prepaymentAmount ?? item.prepaymentAmount,
              prepaymentMethod: data.service.prepaymentMethod ?? item.prepaymentMethod,
              prepaymentInstructions: data.service.prepaymentInstructions ?? item.prepaymentInstructions,
            },
          ],
        });
        return true;
      } else {
        get().pushToast("error", data.message || "Error al crear servicio");
        return false;
      }
    } catch (err) {
      console.error("Error adding service to DB:", err);
      get().pushToast("error", "Error de conexión al agregar servicio");
      return false;
    }
  },
  updateService: async (id, patch) => {
    const prev = get().services;
    set({
      services: prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!data.ok) {
        set({ services: prev });
        get().pushToast("error", data.message || "Error al actualizar servicio");
        return false;
      }
      return true;
    } catch (err) {
      set({ services: prev });
      get().pushToast("error", "Error de conexión al actualizar servicio");
      return false;
    }
  },
  removeService: async (id) => {
    const prev = get().services;
    set({ services: prev.filter((item) => item.id !== id) });
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) {
        set({ services: prev });
        get().pushToast("error", data.message || "Error al eliminar servicio");
        return false;
      }
      return true;
    } catch (err) {
      set({ services: prev });
      get().pushToast("error", "Error de conexión al eliminar servicio");
      return false;
    }
  },

  addProduct: (item) => {
    const id = `pr-${Date.now()}`;
    set({ products: [{ ...item, id }, ...get().products] });
    fetch("/api/dashboard/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_product",
        tenantSlug: get().business.slug || "barberia",
        data: item,
      }),
    }).catch((e) => console.error("Error creating product in DB:", e));
  },
  updateProduct: (id, patch) => {
    set({
      products: get().products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
    fetch("/api/dashboard/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_product",
        tenantSlug: get().business.slug || "barberia",
        data: { id, patch },
      }),
    }).catch((e) => console.error("Error updating product in DB:", e));
  },
  deleteProduct: (id) => {
    set({ products: get().products.filter((p) => p.id !== id) });
    fetch("/api/dashboard/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete_product",
        tenantSlug: get().business.slug || "barberia",
        data: { id },
      }),
    }).catch((e) => console.error("Error deleting product in DB:", e));
  },
  updateProductStock: (id, delta) => {
    const updated = get().products.map((p) =>
      p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p,
    );
    set({ products: updated });
    const target = updated.find((p) => p.id === id);
    if (target) {
      fetch("/api/dashboard/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_product",
          tenantSlug: get().business.slug || "barberia",
          data: { id, patch: { price: target.price, active: target.active } },
        }),
      }).catch((e) => console.error("Error syncing stock update in DB:", e));
    }
  },

  addClient: async (item) => {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (data.ok && data.client) {
        const c = data.client;
        set({
          clients: [
            {
              id: c.id,
              name: c.name,
              phone: c.phone,
              email: c.email || item.email || "",
              notes: c.notes || item.notes || "",
              formula: c.formula || item.formula || "",
              tags: Array.isArray(c.tags) && c.tags.length > 0 ? c.tags : ["Nuevo"],
              instagram: c.instagram || item.instagram || "",
              totalVisits: c.totalVisits ?? 0,
              totalSpent: c.totalSpent ?? 0,
              lastVisit: c.lastVisit || null,
              loyaltyPoints: c.points ?? 0,
              loyaltyRedeemed: 0,
            },
            ...get().clients.filter((cl) => cl.id !== c.id),
          ],
        });
        return true;
      } else {
        get().pushToast("error", data.message || "Error al crear cliente");
        return false;
      }
    } catch (err) {
      console.error("Error adding client to DB:", err);
      get().pushToast("error", "Error de conexión al crear cliente");
      return false;
    }
  },
  updateClient: async (id, patch) => {
    const prev = get().clients;
    set({
      clients: prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!data.ok) {
        set({ clients: prev });
        get().pushToast("error", data.message || "Error al actualizar cliente");
        return false;
      }
      return true;
    } catch (err) {
      set({ clients: prev });
      get().pushToast("error", "Error de conexión al actualizar cliente");
      return false;
    }
  },
  deleteClient: async (id) => {
    const prev = get().clients;
    set({ clients: prev.filter((c) => c.id !== id) });
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) {
        set({ clients: prev });
        get().pushToast("error", data.message || "Error al eliminar cliente");
        return false;
      }
      return true;
    } catch (err) {
      set({ clients: prev });
      get().pushToast("error", "Error de conexión al eliminar cliente");
      return false;
    }
  },

  updateLoyalty: (patch) => {
    const nextLoyalty = { ...get().loyalty, ...patch };
    set({ loyalty: nextLoyalty });
    fetch("/api/tenant/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settings: { loyalty: nextLoyalty },
      }),
    }).catch((err) => console.warn("Error guardando loyalty en tenant.settings:", err));
  },
  addClientLoyaltyPoint: (clientId) => {
    const prev = get().clients;
    const target = prev.find((c) => c.id === clientId);
    if (!target) return;
    const newPoints = (target.loyaltyPoints || 0) + 1;
    set({
      clients: prev.map((c) =>
        c.id === clientId ? { ...c, loyaltyPoints: newPoints } : c
      ),
    });
    fetch(`/api/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points: newPoints }),
    }).catch((err) => console.warn("Error actualizando puntos de cliente:", err));
  },
  redeemClientReward: (clientId) => {
    const threshold = get().loyalty.rewardThreshold;
    const prev = get().clients;
    const target = prev.find((c) => c.id === clientId);
    if (!target) return;
    const newPoints = Math.max(0, (target.loyaltyPoints || 0) - threshold);
    const newRedeemed = (target.loyaltyRedeemed || 0) + 1;
    set({
      clients: prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              loyaltyPoints: newPoints,
              loyaltyRedeemed: newRedeemed,
            }
          : c
      ),
    });
    fetch(`/api/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points: newPoints }),
    }).catch((err) => console.warn("Error canjeando puntos de cliente:", err));
  },

  updateSipap: (patch) =>
    set({ sipap: { ...get().sipap, ...patch } }),
  updateEvolutionApi: (patch) =>
    set({ evolutionApi: { ...get().evolutionApi, ...patch } }),

  addCashMovement: async (item) => {
    try {
      const res = await fetch("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: item.type === "ingreso" ? "INCOME" : "EXPENSE",
          amount: item.amount,
          paymentMethod: item.method,
          description: item.concept,
          category: (item as any).category || (item.type === "ingreso" ? "Cobro Servicio" : "Gasto Operativo"),
          createdAt: item.date,
          appointmentId: item.appointmentId,
        }),
      });
      const data = await res.json();
      if (data.ok && data.movement) {
        const m = data.movement;
        set({
          cashMovements: [
            {
              id: m.id,
              type: m.type === "INCOME" || m.type === "ingreso" ? "ingreso" : "egreso",
              amount: m.amount,
              method: (m.paymentMethod?.toLowerCase() || m.method?.toLowerCase() || "efectivo") as any,
              concept: m.description || m.concept,
              date: m.createdAt || m.date || new Date().toISOString(),
              category: m.category,
              voucherNumber: item.voucherNumber,
              appointmentId: m.appointmentId,
            },
            ...get().cashMovements,
          ],
        });
        return true;
      } else {
        get().pushToast("error", data.message || "Error al registrar movimiento en caja");
        return false;
      }
    } catch (err) {
      console.error("Error creating cash movement in DB:", err);
      get().pushToast("error", "Error de conexión al registrar movimiento");
      return false;
    }
  },
  deleteCashMovement: async (id) => {
    const prev = get().cashMovements;
    set({ cashMovements: prev.filter((m) => m.id !== id) });
    try {
      const res = await fetch(`/api/cash/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) {
        set({ cashMovements: prev });
        get().pushToast("error", data.message || "Error al anular movimiento");
        return false;
      }
      return true;
    } catch (err) {
      set({ cashMovements: prev });
      get().pushToast("error", "Error de conexión al anular movimiento");
      return false;
    }
  },

  updateWhatsAppTemplate: (id, body) =>
    set({
      whatsappTemplates: get().whatsappTemplates.map((t) =>
        t.id === id ? { ...t, body } : t,
      ),
    }),
  toggleWhatsAppTemplate: (id) =>
    set({
      whatsappTemplates: get().whatsappTemplates.map((t) =>
        t.id === id ? { ...t, enabled: !t.enabled } : t,
      ),
    }),

  crmConversations: [],
  sendCrmMessage: (conversationId, text) => {
    if (!text.trim()) return;
    const newMsg: CrmMessage = {
      id: `msg-${Date.now()}`,
      sender: "agent",
      text: text.trim(),
      timestamp: new Date().toISOString(),
      status: "delivered",
    };
    set({
      crmConversations: get().crmConversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: text.trim(),
              lastMessageTime: new Date().toISOString(),
              messages: [...c.messages, newMsg],
            }
          : c
      ),
    });
  },
  resolveCrmConversation: (conversationId) => {
    set({
      crmConversations: get().crmConversations.map((c) =>
        c.id === conversationId ? { ...c, status: "resolved", unreadCount: 0 } : c
      ),
    });
    get().pushToast("success", "Conversación archivada como resuelta.");
  },
  reopenCrmConversation: (conversationId) => {
    set({
      crmConversations: get().crmConversations.map((c) =>
        c.id === conversationId ? { ...c, status: "open" } : c
      ),
    });
    get().pushToast("success", "Conversación reabierta.");
  },
  addClientMedia: (clientId, media) => {
    const newMediaItem: ClientMedia = {
      ...media,
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    set({
      clients: get().clients.map((c) =>
        c.id === clientId
          ? {
              ...c,
              gallery: [newMediaItem, ...(c.gallery || [])],
            }
          : c
      ),
    });
    get().pushToast(
      "success",
      `${media.type === "video" ? "Video" : "Foto"} agregado con éxito a la ficha.`
    );
  },
  deleteClientMedia: (clientId, mediaId) => {
    set({
      clients: get().clients.map((c) =>
        c.id === clientId
          ? {
              ...c,
              gallery: (c.gallery || []).filter((m) => m.id !== mediaId),
            }
          : c
      ),
    });
    get().pushToast("success", "Archivo eliminado de la galería.");
  },
  pushToast: (type, message) => {
    const id = `t-${Date.now()}`;
    set({ toasts: [...get().toasts, { id, type, message }] });
    window.setTimeout(() => get().dismissToast(id), 3200);
  },
  dismissToast: (id) =>
    set({ toasts: get().toasts.filter((item) => item.id !== id) }),
  isTourOpen: false,
  tourSectionKey: "inicio",
  openTour: (sectionKey?: string) => {
    set({
      isTourOpen: true,
      ...(sectionKey ? { tourSectionKey: sectionKey } : {}),
    });
  },
  closeTour: () => set({ isTourOpen: false }),
}));
