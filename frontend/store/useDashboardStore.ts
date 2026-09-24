"use client";

import { create } from "zustand";
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

const staff: StaffMember[] = [
  {
    id: "st-marcos",
    name: "Marcos Benítez",
    role: "Master Barber & Estilista",
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
    role: "Barbero Profesional",
    description: "Cortes modernos, fade, diseños y cuidado facial.",
    avatar: "DF",
    color: "#0ea5e9",
    active: true,
    hours: "11:00 – 20:00",
    commissionPercentage: 40,
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
    price: 450000,
    description: "Mantenimiento rápido de barba y cejas para el fin de semana.",
    image: "sparkles",
  },
];

const initialClients: Client[] = [
  {
    id: "cl-1",
    name: "María Ferreira",
    phone: "+595981111222",
    email: "maria.ferreira@gmail.com",
    notes: "Prefiere café con leche al llegar. Muy puntual.",
    formula: "Balayage miel: Tono 8.3 con oxidante 20 vol + matizador plata.",
    totalVisits: 8,
    totalSpent: 1680000,
    lastVisit: "2026-09-18T14:00:00.000Z",
    tags: ["VIP", "Frecuente"],
    loyaltyPoints: 4,
    loyaltyRedeemed: 1,
  },
  {
    id: "cl-2",
    name: "José Insfrán",
    phone: "+595982333444",
    email: "jose.insfran@hotmail.com",
    notes: "Piel sensible en cuello, usar bálsamo mentolado.",
    formula: "Fade medio con navaja, textura arriba con cera mate.",
    totalVisits: 14,
    totalSpent: 1450000,
    lastVisit: "2026-09-19T13:30:00.000Z",
    tags: ["Frecuente"],
    loyaltyPoints: 3,
    loyaltyRedeemed: 2,
  },
  {
    id: "cl-3",
    name: "Carla Duarte",
    phone: "+595983555666",
    email: "carla.duarte@pymail.com",
    notes: "Le gusta agendar con Sofía los sábados.",
    formula: "Alisado brasileño con keratina termoactiva.",
    totalVisits: 4,
    totalSpent: 980000,
    lastVisit: "2026-09-19T15:00:00.000Z",
    tags: ["Frecuente"],
    loyaltyPoints: 4,
    loyaltyRedeemed: 0,
  },
  {
    id: "cl-4",
    name: "Pedro Gómez",
    phone: "+595984777888",
    email: "pedro.gomez@gmail.com",
    notes: "Cliente nuevo derivado de Instagram Bio.",
    formula: "Corte clásico tijera lados 3.",
    totalVisits: 1,
    totalSpent: 80000,
    lastVisit: "2026-09-20T11:00:00.000Z",
    tags: ["Nuevo"],
    loyaltyPoints: 1,
    loyaltyRedeemed: 0,
  },
  {
    id: "cl-5",
    name: "Luis Vera",
    phone: "+595986999000",
    email: "luis.vera@outlook.com",
    notes: "Siempre paga por transferencia SIPAP Banco Itaú.",
    formula: "Barba completa degrade 1 a 3 con contorno definido.",
    totalVisits: 6,
    totalSpent: 620000,
    lastVisit: "2026-09-21T16:00:00.000Z",
    tags: ["Frecuente"],
    loyaltyPoints: 2,
    loyaltyRedeemed: 1,
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

/** Turnos de demo en Guaraníes (Asunción, UTC-3). */
const appointments: Appointment[] = [
  {
    id: "ap-1",
    clientName: "María Ferreira",
    clientEmail: "maria.ferreira@gmail.com",
    clientPhone: "+595981111222",
    serviceId: "sv-color",
    staffId: "st-sofia",
    start: "2026-09-19T12:00:00.000Z",
    end: "2026-09-19T14:00:00.000Z",
    paymentMethod: "pos_bancard",
    status: "confirmed",
  },
  {
    id: "ap-2",
    clientName: "José Insfrán",
    clientEmail: "jose.insfran@hotmail.com",
    clientPhone: "+595982333444",
    serviceId: "sv-barba",
    staffId: "st-marcos",
    start: "2026-09-19T14:30:00.000Z",
    end: "2026-09-19T15:25:00.000Z",
    paymentMethod: "sipap",
    status: "pending",
    receiptUrl: "/comprobante-jose.png",
  },
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
  },
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
  },
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
  },
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
    status: "pending",
    receiptUrl: "/comprobante-luis.png",
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
  updateBusiness: (patch: Partial<BusinessProfile>) => void;
  addAppointment: (item: Appointment) => void;
  cancelAppointment: (id: string) => void;
  addBlock: (block: Omit<TimeBlock, "id">) => void;
  removeBlock: (id: string) => void;
  setReceiptStatus: (id: string, status: Receipt["status"]) => void;
  toggleStaff: (id: string) => void;
  addStaff: (item: Omit<StaffMember, "id">) => void;
  updateStaff: (id: string, patch: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;
  updateStaffCommission: (id: string, percentage: number) => void;
  addService: (item: Omit<ServiceItem, "id">) => void;
  updateService: (id: string, patch: Partial<ServiceItem>) => void;
  removeService: (id: string) => void;
  addProduct: (item: Omit<ProductItem, "id">) => void;
  updateProduct: (id: string, patch: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;
  updateProductStock: (id: string, delta: number) => void;
  addClient: (client: Omit<Client, "id">) => void;
  updateClient: (id: string, patch: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  updateLoyalty: (patch: Partial<LoyaltySettings>) => void;
  addClientLoyaltyPoint: (clientId: string) => void;
  redeemClientReward: (clientId: string) => void;
  updateSipap: (patch: Partial<SipapConfig>) => void;
  updateEvolutionApi: (patch: Partial<EvolutionApiConfig>) => void;
  addCashMovement: (item: Omit<CashMovement, "id">) => void;
  deleteCashMovement: (id: string) => void;
  updateWhatsAppTemplate: (id: string, body: string) => void;
  toggleWhatsAppTemplate: (id: string) => void;
  pushToast: (type: "success" | "error", message: string) => void;
  dismissToast: (id: string) => void;
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
  splitComment: "Si un bloque cruza medianoche en TZ de Asunción, se parte en dos fechas civiles.",
  business: {
    name: "Barbería & Studio AgendatePY",
    slug: "studio-agendate",
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
  },
  staff,
  services,
  products: initialProducts,
  appointments,
  clients: initialClients,
  cashMovements: initialCashMovements,
  whatsappTemplates: initialWhatsAppTemplates,
  loyalty: initialLoyalty,
  sipap: initialSipap,
  evolutionApi: initialEvolutionApi,
  blocks: [
    {
      id: "bl-1",
      staffId: "st-marcos",
      date: "2026-09-23",
      start: "13:00",
      end: "14:30",
      reason: "Almuerzo y descanso",
    },
  ],
  receipts: [
    {
      id: "rc-1",
      appointmentId: "ap-2",
      clientName: "José Insfrán",
      amount: 130000,
      submittedAt: "2026-09-19T12:10:00.000Z",
      status: "pending",
      note: "Transferencia SIPAP Banco Continental — ref #88219",
    },
    {
      id: "rc-2",
      appointmentId: "ap-6",
      clientName: "Luis Vera",
      amount: 130000,
      submittedAt: "2026-09-19T18:40:00.000Z",
      status: "pending",
      note: "Comprobante SIPAP Ueno Bank adjunto",
    },
  ],
  calendarDate: "2026-09-19",
  calendarView: "dia",
  selectedStaffId: "all",
  sidebarOpen: false,
  toasts: [],
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCalendarDate: (isoDate) => set({ calendarDate: isoDate }),
  setCalendarView: (view) => set({ calendarView: view }),
  setSelectedStaffId: (id) => set({ selectedStaffId: id }),
  updateBusiness: (patch) =>
    set({ business: { ...get().business, ...patch } }),
  addAppointment: (item) => {
    const apps = [...get().appointments, item];
    const existing = get().clients.find(
      (c) => c.phone === item.clientPhone || c.name.toLowerCase() === item.clientName.toLowerCase(),
    );
    const service = get().services.find((s) => s.id === item.serviceId);
    const price = service?.price ?? 0;
    const addPoints = get().loyalty.enabled ? get().loyalty.pointsPerVisit : 0;

    if (existing) {
      set({
        appointments: apps,
        clients: get().clients.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                totalVisits: c.totalVisits + 1,
                totalSpent: c.totalSpent + price,
                lastVisit: item.start,
                loyaltyPoints: c.loyaltyPoints + addPoints,
              }
            : c,
        ),
      });
    } else {
      const newClient: Client = {
        id: `cl-${Date.now()}`,
        name: item.clientName,
        phone: item.clientPhone,
        email: item.clientEmail,
        notes: item.notes || "Agendado vía web",
        totalVisits: 1,
        totalSpent: price,
        lastVisit: item.start,
        tags: ["Nuevo"],
        loyaltyPoints: addPoints,
        loyaltyRedeemed: 0,
      };
      set({
        appointments: apps,
        clients: [newClient, ...get().clients],
      });
    }
  },
  cancelAppointment: (id) =>
    set({
      appointments: get().appointments.map((item) =>
        item.id === id ? { ...item, status: "cancelled" } : item,
      ),
    }),
  addBlock: (block) => {
    const parts = splitOvernightBlock(block);
    const created = parts.map((part, index) => ({
      ...part,
      id: `bl-${Date.now()}-${index}`,
    }));
    set({ blocks: [...get().blocks, ...created] });
  },
  removeBlock: (id) =>
    set({ blocks: get().blocks.filter((item) => item.id !== id) }),
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
  toggleStaff: (id) =>
    set({
      staff: get().staff.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item,
      ),
    }),
  addStaff: (item) => {
    const id = `st-${Date.now()}`;
    set({ staff: [...get().staff, { ...item, id }] });
  },
  updateStaff: (id, patch) =>
    set({
      staff: get().staff.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }),
  deleteStaff: (id) =>
    set({ staff: get().staff.filter((item) => item.id !== id) }),
  updateStaffCommission: (id, percentage) =>
    set({
      staff: get().staff.map((item) =>
        item.id === id ? { ...item, commissionPercentage: percentage } : item,
      ),
    }),
  addService: (item) => {
    const id = `sv-${Date.now()}`;
    set({ services: [...get().services, { ...item, id }] });
  },
  updateService: (id, patch) =>
    set({
      services: get().services.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }),
  removeService: (id) =>
    set({ services: get().services.filter((item) => item.id !== id) }),

  addProduct: (item) => {
    const id = `pr-${Date.now()}`;
    set({ products: [{ ...item, id }, ...get().products] });
  },
  updateProduct: (id, patch) =>
    set({
      products: get().products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }),
  deleteProduct: (id) =>
    set({ products: get().products.filter((p) => p.id !== id) }),
  updateProductStock: (id, delta) =>
    set({
      products: get().products.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p,
      ),
    }),

  addClient: (item) => {
    const id = `cl-${Date.now()}`;
    set({ clients: [{ ...item, id }, ...get().clients] });
  },
  updateClient: (id, patch) =>
    set({
      clients: get().clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }),
  deleteClient: (id) =>
    set({ clients: get().clients.filter((c) => c.id !== id) }),

  updateLoyalty: (patch) =>
    set({ loyalty: { ...get().loyalty, ...patch } }),
  addClientLoyaltyPoint: (clientId) =>
    set({
      clients: get().clients.map((c) =>
        c.id === clientId ? { ...c, loyaltyPoints: c.loyaltyPoints + 1 } : c,
      ),
    }),
  redeemClientReward: (clientId) => {
    const threshold = get().loyalty.rewardThreshold;
    set({
      clients: get().clients.map((c) =>
        c.id === clientId
          ? {
              ...c,
              loyaltyPoints: Math.max(0, c.loyaltyPoints - threshold),
              loyaltyRedeemed: c.loyaltyRedeemed + 1,
            }
          : c,
      ),
    });
  },

  updateSipap: (patch) =>
    set({ sipap: { ...get().sipap, ...patch } }),
  updateEvolutionApi: (patch) =>
    set({ evolutionApi: { ...get().evolutionApi, ...patch } }),

  addCashMovement: (item) => {
    const id = `cm-${Date.now()}`;
    set({ cashMovements: [{ ...item, id }, ...get().cashMovements] });
  },
  deleteCashMovement: (id) =>
    set({ cashMovements: get().cashMovements.filter((m) => m.id !== id) }),

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

  pushToast: (type, message) => {
    const id = `t-${Date.now()}`;
    set({ toasts: [...get().toasts, { id, type, message }] });
    window.setTimeout(() => get().dismissToast(id), 3200);
  },
  dismissToast: (id) =>
    set({ toasts: get().toasts.filter((item) => item.id !== id) }),
}));
