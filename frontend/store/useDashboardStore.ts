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
  BotEngineMode,
  BotMainMenuOption,
  BotKeywordRule,
  UserRole,
  CrmConversation,
  CrmChannel,
  CrmMessage,
  ClientMedia,
  ClientMediaType,
  ClientMediaTag,
  ProductOrder,
  ProductOrderStatus,
  ProductOfferType,
  CommissionPayoutRecord,
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

export const initialStaff: StaffMember[] = [
  {
    id: "st-sebas",
    name: "Sebastián Duarte",
    role: "Director / Dueño",
    systemRole: "admin",
    description: "Gestión global del local, finanzas, supervisión y dirección comercial.",
    avatar: "SD",
    color: "#FF4F2B",
    active: true,
    hours: "08:00 – 20:00",
    commissionPercentage: 50,
    productCommissionPercentage: 15,
    advanceBalance: 0,
  },
  {
    id: "st-marcos",
    name: "Marcos Benítez",
    role: "Master Barber",
    systemRole: "barbero",
    description: "Cortes clásicos, degradé fade, ritual de barba y perfilado a navaja.",
    avatar: "MB",
    color: "#4f46e5",
    active: true,
    hours: "09:00 – 19:00",
    commissionPercentage: 50,
    productCommissionPercentage: 10,
    advanceBalance: 50000,
  },
  {
    id: "st-sofia",
    name: "Sofía Alcaraz",
    role: "Colorista & Estilista",
    systemRole: "estilista",
    description: "Especialista en balayage, coloración, alisados y nutrición capilar.",
    avatar: "SA",
    color: "#ec4899",
    active: true,
    hours: "09:00 – 18:00",
    commissionPercentage: 45,
    productCommissionPercentage: 10,
    advanceBalance: 0,
  },
  {
    id: "st-leticia",
    name: "Leticia Romero",
    role: "Cajera & Recepción",
    systemRole: "cajero",
    description: "Atención al cliente, cobros en mostrador, facturación y transferencias.",
    avatar: "LR",
    color: "#10b981",
    active: true,
    hours: "08:30 – 19:30",
    commissionPercentage: 0,
    productCommissionPercentage: 5,
    advanceBalance: 0,
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
    productCommissionPercentage: 10,
    advanceBalance: 0,
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
    isOnSale: true,
    salePrice: 50000,
    saleType: "both",
    saleExpiresAt: "2026-10-15T23:59",
    saleMaxUnits: 10,
    saleUnitsSold: 4,
  },
  {
    id: "pr-2",
    name: "Aceite para Barba Sandalwood & Argán",
    description: "Hidratación profunda para vello facial y piel. Suaviza la barba y aporta brillo natural con aroma amaderado.",
    price: 65000,
    cost: 30000,
    imageUrl: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&auto=format&fit=crop&q=80",
    category: "Cuidado Barba",
    stock: 14,
    active: true,
    isOnSale: false,
  },
  {
    id: "pr-3",
    name: "Shampoo Anticaída & Biotina Profesional",
    description: "Fórmula fortificante con biotina y cafeína activa. Estimula el folículo y previene la caída del cabello.",
    price: 85000,
    cost: 40000,
    imageUrl: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=80",
    category: "Lavado & Cuidado",
    stock: 16,
    active: true,
    isOnSale: true,
    salePrice: 65000,
    saleType: "both",
    saleExpiresAt: "2026-10-20T23:59",
    saleMaxUnits: 15,
    saleUnitsSold: 6,
  },
  {
    id: "pr-4",
    name: "Pomada Clásica Base Agua Brillo Alto",
    description: "Fijación media-fuerte con brillo clásico de barbería tradicional. Se enjuaga fácilmente con agua.",
    price: 60000,
    cost: 28000,
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80",
    category: "Peinado",
    stock: 22,
    active: true,
    isOnSale: false,
  },
  {
    id: "pr-5",
    name: "Mascarilla Nutritiva Keratina Anti-Frizz",
    description: "Tratamiento intensivo reconstructor para cabellos secos o dañados por decoloración. Brillo efecto espejo.",
    price: 95000,
    cost: 45000,
    imageUrl: "https://images.unsplash.com/photo-1608248597359-00224d45d654?w=500&auto=format&fit=crop&q=80",
    category: "Lavado & Cuidado",
    stock: 9,
    active: true,
    isOnSale: false,
  },
  {
    id: "pr-6",
    name: "Bálsamo Post-Afeitado Hidratante Aloe Vera",
    description: "Calma la irritación del afeitado al instante. Efecto frío refrescante sin alcohol para pieles sensibles.",
    price: 50000,
    cost: 22000,
    imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?w=500&auto=format&fit=crop&q=80",
    category: "Cuidado Barba",
    stock: 15,
    active: true,
    isOnSale: false,
  },
  {
    id: "pr-7",
    name: "Perfume Capilar & Corporal Oud Wood 50ml",
    description: "Fragancia masculina sofisticada con notas de madera de oud, cardamomo y vainilla ámbar. Larga fijación.",
    price: 120000,
    cost: 55000,
    imageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format&fit=crop&q=80",
    category: "Fragancias",
    stock: 8,
    active: true,
    isOnSale: true,
    salePrice: 95000,
    saleType: "both",
    saleExpiresAt: "2026-10-30T23:59",
    saleMaxUnits: 5,
    saleUnitsSold: 2,
  },
  {
    id: "pr-8",
    name: "Cepillo Profesional Cerdas de Jabalí & Madera",
    description: "Desenreda sin tirones y distribuye los aceites naturales del cuero cabelludo y barba para mayor brillo.",
    price: 45000,
    cost: 20000,
    imageUrl: "https://images.unsplash.com/photo-1590159763121-7c9ff3149e0a?w=500&auto=format&fit=crop&q=80",
    category: "Accesorios",
    stock: 12,
    active: true,
    isOnSale: false,
  },
];

export const initialProductOrders: ProductOrder[] = [
  {
    id: "ord-1",
    orderNumber: "#PED-501",
    clientName: "Rodrigo Caballero",
    clientPhone: "+595 981 445 120",
    sellerStaffId: "st-marcos",
    items: [
      {
        productId: "pr-1",
        productName: "Cera Capilar Efecto Mate Extreme",
        qty: 1,
        unitPrice: 50000,
        isOnSale: true,
      },
      {
        productId: "pr-2",
        productName: "Aceite para Barba Sandalwood & Argán",
        qty: 1,
        unitPrice: 55000,
        isOnSale: false,
      },
    ],
    totalAmount: 105000,
    status: "delivered",
    paymentMethod: "transferencia",
    deliveryType: "retirar_en_local",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    notes: "Vendido por Marcos Benítez en sillón tras corte.",
  },
  {
    id: "ord-2",
    orderNumber: "#PED-502",
    clientName: "Gonzalo Almirón",
    clientPhone: "+595 971 889 332",
    sellerStaffId: "st-sofia",
    items: [
      {
        productId: "pr-3",
        productName: "Shampoo Anticaída & Biotina Profesional",
        qty: 2,
        unitPrice: 65000,
        isOnSale: true,
      },
    ],
    totalAmount: 130000,
    status: "delivered",
    paymentMethod: "pos",
    deliveryType: "retirar_en_local",
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    notes: "Recomendado y vendido por Sofía en peinado.",
  },
  {
    id: "ord-3",
    orderNumber: "#PED-503",
    clientName: "Esteban Rivas",
    clientPhone: "+595 982 710 445",
    sellerStaffId: "st-leticia",
    items: [
      {
        productId: "pr-1",
        productName: "Cera Capilar Efecto Mate Extreme",
        qty: 1,
        unitPrice: 50000,
        isOnSale: true,
      },
    ],
    totalAmount: 50000,
    status: "delivered",
    paymentMethod: "efectivo",
    deliveryType: "retirar_en_local",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    notes: "Vendido en caja por Leticia Romero.",
  },
  {
    id: "ord-4",
    orderNumber: "#PED-504",
    clientName: "Carlos Méndez",
    clientPhone: "+595 983 221 990",
    sellerStaffId: "st-diego",
    items: [
      {
        productId: "pr-2",
        productName: "Aceite para Barba Sandalwood & Argán",
        qty: 1,
        unitPrice: 55000,
        isOnSale: false,
      },
    ],
    totalAmount: 55000,
    status: "delivered",
    paymentMethod: "efectivo",
    deliveryType: "retirar_en_local",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    notes: "Vendido por Diego Franco.",
  },
];

export const initialLoyalty: LoyaltySettings = {
  enabled: true,
  mode: "stamps",
  rewardThreshold: 5,
  rewardDescription: "50% OFF en tu próximo corte o servicio",
  pointsPerVisit: 1,
  rewards: [
    { id: "rew-1", threshold: 5, description: "50% OFF en tu próximo corte o servicio" },
    { id: "rew-2", threshold: 10, description: "Corte o Tratamiento Capilar 100% Gratis" },
  ],
};

export const initialSipap: SipapConfig = {
  bankName: "Banco Itaú Paraguay",
  accountHolder: "Barbería & Studio AgendatePY S.A.",
  rucOrCi: "80099881-2",
  accountNumber: "720045678",
  aliasSipap: "agendate.py",
};

export const defaultBotMenuOptions: BotMainMenuOption[] = [
  {
    id: "opt-1",
    key: "1",
    title: "Agendar Turno Online",
    response: "¡Excelente! Podés elegir tu servicio, ver los profesionales y reservar tu turno con confirmación inmediata acá:",
    action: "send_link",
    enabled: true,
  },
  {
    id: "opt-2",
    key: "2",
    title: "Servicios y Lista de Precios",
    response: "Nuestros servicios más pedidos:\n• Corte Clásico / Fade: Gs. 60.000\n• Perfilado & Barba VIP: Gs. 45.000\n• Combo Corte + Barba: Gs. 95.000\n\nPodés ver la carta completa y promociones aquí:",
    action: "send_link",
    enabled: true,
  },
  {
    id: "opt-3",
    key: "3",
    title: "Ubicación, Mapa y Horarios",
    response: "Estamos en Avda. Santa Teresa 1420 c/ Denis Roa, Asunción.\nHorario de atención: Lunes a Sábado de 09:00 a 20:00 hs.\nContamos con estacionamiento exclusivo para clientes.",
    action: "none",
    enabled: true,
  },
  {
    id: "opt-4",
    key: "4",
    title: "Datos para Transferencia Bancaria",
    response: "Datos para transferencias bancarias:\nBanco: Banco Itaú Paraguay\nTitular: AgendatePY Studio\nCta Cte: 0123456789\nRUC: 80012345-6\nAlias: pagos@agendate.py\n\nPor favor envianos tu comprobante para validarlo.",
    action: "send_sipap",
    enabled: true,
  },
  {
    id: "opt-5",
    key: "5",
    title: "Hablar con un Asesor Humano",
    response: "¡Claro que sí! Un integrante de nuestro equipo tomará la conversación en breve. Por favor dejanos tu consulta detallada.",
    action: "human_handoff",
    enabled: true,
  },
];

export const defaultBotKeywords: BotKeywordRule[] = [
  {
    id: "kw-1",
    keywords: ["precio", "costo", "cuanto", "tarifa", "promo", "vale"],
    response: "Nuestros servicios van desde Gs. 50.000. Podés ver todos los precios actualizados y reservar en:",
    action: "send_link",
    enabled: true,
  },
  {
    id: "kw-2",
    keywords: ["turno", "cita", "agendar", "hora", "reserva", "disponible", "libre"],
    response: "¡Con gusto! Consultá los horarios disponibles en tiempo real y asegurá tu lugar aquí:",
    action: "send_link",
    enabled: true,
  },
  {
    id: "kw-3",
    keywords: ["donde", "ubicacion", "direccion", "llegar", "mapa", "queda"],
    response: "Nos encontramos en Avda. Santa Teresa 1420. Abrimos de Lunes a Sábados de 09:00 a 20:00 hs.",
    action: "none",
    enabled: true,
  },
  {
    id: "kw-4",
    keywords: ["transferencia", "itau", "banco", "alias", "pago"],
    response: "Podés abonar por Transferencia a Banco Itaú Cta 0123456789 (Alias: pagos@agendate.py).",
    action: "send_sipap",
    enabled: true,
  },
  {
    id: "kw-5",
    keywords: ["humano", "persona", "charlar", "asesor", "operador", "llamar"],
    response: "Pausamos el bot automático y te comunicamos con un asesor de nuestro equipo.",
    action: "human_handoff",
    enabled: true,
  },
];

export const initialEvolutionApi: EvolutionApiConfig = {
  enabled: true,
  baseUrl: "https://api.evolution.py",
  apiKey: "EVO_SECRET_DEMO_KEY_2026",
  instanceName: "agendatepy-central",
  autoSendOnBooking: true,
  autoSendOnCancel: true,
  connected: false,
  phoneNumber: "",
  phoneType: "business",
  personalPhone: "",
  notifyPersonalPhoneOnBooking: false,
  allowEmojis: false,
  askStaffPreference: true,
  handoffOnUnknownTopic: true,
  minNoticeMinutes: 60,
  serviceScheduleMode: "always",
  autoBotEnabled: true,
  botMode: "rules",
  welcomeMessage: "¡Hola! Bienvenido/a a nuestro canal oficial. ¿En qué podemos ayudarte hoy?\n\n1. Agendar un turno online\n2. Ver servicios y precios\n3. Ubicación y horarios\n4. Datos de transferencia bancaria\n5. Hablar con un asesor\n\n_Escribí el número de la opción o tu consulta._",
  fallbackMessage: "Disculpá, no entendí esa opción. Por favor elegí una opción del menú escribiendo el número (ej: 1 o 2) o escribí *humano* para hablar con nuestro equipo.",
  mainMenuOptions: defaultBotMenuOptions,
  keywordRules: defaultBotKeywords,
  aiPrompt: "Sos el asistente virtual oficial de AgendatePY. Respondé de manera concisa, amable y profesional sobre servicios, precios y horarios. Si el cliente quiere reservar, enviale el enlace oficial de turnos.",
  autoBotCadenceSeconds: 12,
  outOfHoursEnabled: true,
  outOfHoursMessage: "¡Hola! En este momento nuestro local está cerrado. Nuestro horario es de Lunes a Sábados de 09:00 a 20:00 hs. Podés reservar tu turno para el próximo día disponible directamente en nuestra web:",
  instagramConnected: true,
  instagramHandle: "@barberia_central",
  messengerConnected: true,
  messengerPage: "Barbería & Studio Central",
};

export const initialClients: Client[] = [
  {
    id: "cli-martin",
    name: "Martín Benítez",
    phone: "+595 981 765 432",
    email: "martin.benitez@gmail.com",
    instagram: "@martin_benitez",
    notes: "Prefiere degradé medio navajeado y perfilado de barba con aceite de argán.",
    formula: "Degradé skin fade medio, tijera superior 3cm, barba contorno marcado.",
    totalVisits: 6,
    totalSpent: 480000,
    lastVisit: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    tags: ["Frecuente", "VIP"],
    loyaltyPoints: 4,
    loyaltyRedeemed: 0,
  },
  {
    id: "cli-camila",
    name: "Camila González",
    phone: "+595 972 345 678",
    email: "camila.gonzalez@gmail.com",
    instagram: "@camila_gonzalezpy",
    notes: "Cabello fino ondulado, decoloración cuidadosa.",
    formula: "Balayage tono 8.3 miel + matizador 9.02 con oxidante 20 vol.",
    totalVisits: 3,
    totalSpent: 540000,
    lastVisit: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString(),
    tags: ["Nuevo"],
    loyaltyPoints: 3,
    loyaltyRedeemed: 0,
  },
  {
    id: "cli-rodrigo",
    name: "Rodrigo Duarte",
    phone: "+595 983 912 345",
    email: "rodrigo.duarte@hotmail.com",
    messengerId: "rodrigo.duarte.fb",
    notes: "Corte clásico tijera y barba con toalla caliente.",
    formula: "Clásico ejecutivo, tijera pulida, pomada brillante.",
    totalVisits: 8,
    totalSpent: 640000,
    lastVisit: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    tags: ["VIP", "Frecuente"],
    loyaltyPoints: 5,
    loyaltyRedeemed: 1,
  },
  {
    id: "cli-maria",
    name: "María Ferreira",
    phone: "+595 981 111 222",
    email: "maria.ferreira@gmail.com",
    instagram: "@mariaferreirapy",
    notes: "Balayage miel: Tono 8.3 con oxidante 20 vol + matizador plata.",
    formula: "Balayage miel: Tono 8.3 con oxidante 20 vol + matizador plata.",
    totalVisits: 4,
    totalSpent: 600000,
    lastVisit: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    tags: ["Frecuente"],
    loyaltyPoints: 4,
    loyaltyRedeemed: 0,
  },
  {
    id: "cli-esteban",
    name: "Esteban Rivas",
    phone: "+595 982 710 445",
    email: "esteban.rivas@gmail.com",
    instagram: "@esteban_rivas",
    notes: "Perfilado de barba express y corte fade bajo. Viene cada 10 días.",
    formula: "Low fade navajeado, barba cuadrada con línea limpia.",
    totalVisits: 7,
    totalSpent: 520000,
    lastVisit: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    tags: ["VIP", "Frecuente"],
    loyaltyPoints: 5,
    loyaltyRedeemed: 0,
  },
  {
    id: "cli-gonzalo",
    name: "Gonzalo Almirón",
    phone: "+595 971 889 332",
    email: "gonzalo.almiron@pymail.com",
    notes: "Cabello grueso rebelde. Usa shampoo de biotina y pomada mate.",
    formula: "Corte clásico tijera con raya al costado texturada.",
    totalVisits: 5,
    totalSpent: 380000,
    lastVisit: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    tags: ["Frecuente"],
    loyaltyPoints: 3,
    loyaltyRedeemed: 0,
  },
  {
    id: "cli-carlos",
    name: "Carlos Méndez",
    phone: "+595 983 221 990",
    email: "carlos.mendez@outlook.com",
    instagram: "@carlosmendez_py",
    notes: "Barba poblada larga. Requiere toalla caliente doble y aceite aromático.",
    formula: "Ritual completo de barba y rebajado de pómulos.",
    totalVisits: 6,
    totalSpent: 490000,
    lastVisit: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    tags: ["Frecuente"],
    loyaltyPoints: 4,
    loyaltyRedeemed: 0,
  },
  {
    id: "cli-andrea",
    name: "Andrea Villalba",
    phone: "+595 984 667 890",
    email: "andrea.villalba@gmail.com",
    instagram: "@andrea_villalbapy",
    notes: "Coloración balayage miel y nutrición capilar con keratina.",
    formula: "Tono 9.1 rubio ceniza muy claro con matizador violeta suave.",
    totalVisits: 8,
    totalSpent: 890000,
    lastVisit: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    tags: ["VIP"],
    loyaltyPoints: 6,
    loyaltyRedeemed: 1,
  },
];

export const initialReceipts: Receipt[] = [
  {
    id: "rec-trf-1",
    appointmentId: "ap-demo-1",
    clientName: "Martín Benítez",
    clientPhone: "+595 981 765 432",
    amount: 130000,
    submittedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: "pending",
    note: "Transferencia Bancaria - Seña turno corte y cera capilar",
    bankOrigin: "Banco Itaú",
    operationNumber: "TRF-849201",
    ocrVerified: true,
    ocrConfidence: 99.4,
    qrCodeDetected: true,
    channel: "whatsapp",
    receiptUrl: "/receipts/itau_demo.png",
  },
  {
    id: "rec-trf-2",
    appointmentId: "ap-demo-2",
    clientName: "Camila González",
    clientPhone: "+595 972 345 678",
    amount: 180000,
    submittedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    status: "approved",
    note: "Pago total Balayage Miel y Nutrición Capilar",
    bankOrigin: "Ueno Bank",
    operationNumber: "TRF-204918",
    ocrVerified: true,
    ocrConfidence: 98.8,
    qrCodeDetected: true,
    channel: "whatsapp",
  },
  {
    id: "rec-trf-3",
    appointmentId: "ap-demo-3",
    clientName: "Rodrigo Duarte",
    clientPhone: "+595 983 912 345",
    amount: 80000,
    submittedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    status: "approved",
    note: "Corte Degradé y Perfilado de Barba",
    bankOrigin: "Banco Continental",
    operationNumber: "TRF-592031",
    ocrVerified: true,
    ocrConfidence: 97.5,
    qrCodeDetected: true,
    channel: "whatsapp",
  },
  {
    id: "rec-trf-4",
    appointmentId: "ap-demo-4",
    clientName: "María Ferreira",
    clientPhone: "+595 981 111 222",
    amount: 150000,
    submittedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    status: "approved",
    note: "Tratamiento y Tintura",
    bankOrigin: "BNF",
    operationNumber: "TRF-110294",
    ocrVerified: true,
    ocrConfidence: 99.1,
    qrCodeDetected: true,
    channel: "whatsapp",
  },
];

export const initialCrmConversations: CrmConversation[] = [
  {
    id: "conv-demo-1",
    clientId: "cli-martin",
    clientName: "Martín Benítez",
    clientAvatar: "MB",
    channel: "whatsapp",
    channelIdentifier: "+595 981 765 432",
    lastMessage: "Comprobante de Transferencia Bancaria (Itaú - Gs. 130.000)",
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unreadCount: 1,
    status: "open",
    messages: [
      {
        id: "m-demo-1",
        sender: "client",
        text: "¡Hola! Buenas tardes. Quería consultar si tienen turno disponible para corte y perfilado de barba para este jueves a las 16:00 hs aprox.",
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        status: "read",
      },
      {
        id: "m-demo-2",
        sender: "client",
        text: "Y también quería saber si tienen en stock la cera capilar efecto mate que vi en sus publicaciones.",
        timestamp: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
        status: "read",
      },
      {
        id: "m-demo-3",
        sender: "agent",
        text: "¡Hola Martín! Qué tal. Sí, tenemos disponibilidad este jueves a las 16:00 con nuestro estilista Marcos. Y la cera capilar mate la tenemos en stock con descuento promocional en Gs. 50.000. El corte y barba son Gs. 80.000. Total Gs. 130.000.",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: "delivered",
      },
      {
        id: "m-demo-4",
        sender: "client",
        text: "¡Genial! Ya te transferí desde Itaú para señar el turno y asegurar el pote de cera.",
        timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
        status: "delivered",
      },
      {
        id: "m-demo-5",
        sender: "client",
        text: "Comprobante de Transferencia Bancaria",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: "delivered",
        receiptAttachment: {
          receiptId: "rec-trf-1",
          bankOrigin: "Banco Itaú",
          amount: 130000,
          operationNumber: "TRF-849201",
          qrCodeDetected: true,
          ocrConfidence: 99.4,
          ocrVerified: true,
          status: "pending",
        },
      },
    ],
  },
  {
    id: "conv-demo-2",
    clientId: "cli-camila",
    clientName: "Camila González",
    clientAvatar: "CG",
    channel: "instagram",
    channelIdentifier: "@camila_gonzalezpy",
    lastMessage: "¡Muchísimas gracias! Nos vemos el sábado entonces.",
    lastMessageTime: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    unreadCount: 0,
    status: "resolved",
    messages: [
      {
        id: "m-demo-ig-1",
        sender: "client",
        text: "¡Hola chicos! ¿Qué precio tiene el balayage miel con hidratación profunda?",
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        status: "read",
      },
      {
        id: "m-demo-ig-2",
        sender: "agent",
        text: "¡Hola Camila! Está en promo este mes por Gs. 180.000 incluye nutrición capilar y peinado. Te podemos agendar para este sábado a las 10:00 con Sofía.",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: "delivered",
      },
      {
        id: "m-demo-ig-3",
        sender: "client",
        text: "¡Muchísimas gracias! Nos vemos el sábado entonces.",
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        status: "read",
      },
    ],
  },
  {
    id: "conv-demo-3",
    clientId: "cli-rodrigo",
    clientName: "Rodrigo Duarte",
    clientAvatar: "RD",
    channel: "messenger",
    channelIdentifier: "Rodrigo Duarte (Facebook)",
    lastMessage: "¿Hasta qué hora tienen abierto hoy?",
    lastMessageTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    unreadCount: 1,
    status: "open",
    messages: [
      {
        id: "m-demo-fb-1",
        sender: "client",
        text: "Buenas tardes, ¿hasta qué hora atienden hoy en el local de Villa Morra?",
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        status: "read",
      },
    ],
  },
];

/** Helper to generate ISO date strings relative to today in Asunción timezone */
export const makeDemoIsoDate = (dayOffset: number = 0): string => {
  try {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return formatInTimeZone(d, "America/Asuncion", "yyyy-MM-dd");
  } catch {
    return "2026-09-25";
  }
};

export const makeDemoDateTime = (dayOffset: number, hours: number, minutes: number = 0): string => {
  const dateStr = makeDemoIsoDate(dayOffset);
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return `${dateStr}T${hh}:${mm}:00.000-03:00`;
};

/** Bloqueos de demo para calendario y agenda */
export const initialBlocks: TimeBlock[] = [
  {
    id: "blk-1",
    staffId: "st-marcos",
    date: makeDemoIsoDate(0),
    start: "12:30",
    end: "13:30",
    reason: "Almuerzo y descanso del equipo",
  },
  {
    id: "blk-2",
    staffId: "st-diego",
    date: makeDemoIsoDate(1),
    start: "13:00",
    end: "14:00",
    reason: "Almuerzo y descanso del equipo",
  },
  {
    id: "blk-3",
    staffId: "st-sofia",
    date: makeDemoIsoDate(2),
    start: "08:30",
    end: "10:30",
    reason: "Masterclass L'Oréal Balayage Avanzado",
  },
];

/** Turnos de demo conectados y dinámicos en Guaraníes (Asunción, UTC-3). */
export const initialAppointments: Appointment[] = [
  // --- HOY (dayOffset = 0) ---
  {
    id: "ap-hoy-1",
    clientName: "Martín Peña",
    clientEmail: "martin.pena@gmail.com",
    clientPhone: "+595 981 123 456",
    serviceId: "sv-corte",
    staffId: "st-diego",
    start: makeDemoDateTime(0, 9, 0),
    end: makeDemoDateTime(0, 9, 35),
    paymentMethod: "efectivo",
    status: "confirmed",
    notes: "Degradé lateral 0.5 a tijera en la cúspide. Lavado previo con masaje.",
  },
  {
    id: "ap-hoy-2",
    clientName: "Camila Insfrán",
    clientEmail: "camila.insfran@gmail.com",
    clientPhone: "+595 982 987 654",
    serviceId: "sv-tratamiento",
    staffId: "st-sofia",
    start: makeDemoDateTime(0, 10, 0),
    end: makeDemoDateTime(0, 11, 30),
    paymentMethod: "pos_bancard",
    status: "confirmed",
    notes: "Tratamiento de keratina efecto espejo con nutrición anti-frizz.",
  },
  {
    id: "ap-hoy-3",
    clientName: "Rodrigo Duarte",
    clientEmail: "rodrigo.duarte@hotmail.com",
    clientPhone: "+595 983 456 789",
    serviceId: "sv-barba",
    staffId: "st-marcos",
    start: makeDemoDateTime(0, 11, 0),
    end: makeDemoDateTime(0, 11, 55),
    paymentMethod: "sipap",
    status: "confirmed",
    receiptUrl: "/receipts/itau_demo.png",
    notes: "Ritual completo con doble toalla caliente, aceite de sándalo y navaja.",
  },
  {
    id: "ap-hoy-4",
    clientName: "Gonzalo Almirón",
    clientEmail: "gonzalo.almiron@pymail.com",
    clientPhone: "+595 971 889 332",
    serviceId: "sv-corte",
    staffId: "st-diego",
    start: makeDemoDateTime(0, 13, 30),
    end: makeDemoDateTime(0, 14, 5),
    paymentMethod: "efectivo",
    status: "confirmed",
    notes: "Corte clásico tijera con raya al costado texturada.",
  },
  {
    id: "ap-hoy-5",
    clientName: "María Ferreira",
    clientEmail: "maria.ferreira@gmail.com",
    clientPhone: "+595 981 111 222",
    serviceId: "sv-color",
    staffId: "st-sofia",
    start: makeDemoDateTime(0, 14, 30),
    end: makeDemoDateTime(0, 16, 30),
    paymentMethod: "sipap",
    status: "pending",
    notes: "Balayage miel dorado: Tono 8.3 con oxidante 20 vol + matizador plata.",
  },
  {
    id: "ap-hoy-6",
    clientName: "Carlos Méndez",
    clientEmail: "carlos.mendez@outlook.com",
    clientPhone: "+595 983 221 990",
    serviceId: "sv-barba",
    staffId: "st-marcos",
    start: makeDemoDateTime(0, 16, 0),
    end: makeDemoDateTime(0, 16, 55),
    paymentMethod: "pos_bancard",
    status: "confirmed",
    notes: "Barba poblada: rebajado de pómulos y línea de cuello bien marcada.",
  },
  {
    id: "ap-hoy-7",
    clientName: "Esteban Bogado",
    clientEmail: "esteban.bogado@pymail.com",
    clientPhone: "+595 984 332 211",
    serviceId: "sv-perfilado",
    staffId: "st-diego",
    start: makeDemoDateTime(0, 17, 30),
    end: makeDemoDateTime(0, 17, 50),
    paymentMethod: "efectivo",
    status: "confirmed",
    notes: "Perfilado express de barba y cejas para evento de noche.",
  },
  {
    id: "ap-hoy-8",
    clientName: "Andrea Villalba",
    clientEmail: "andrea.villalba@gmail.com",
    clientPhone: "+595 984 667 890",
    serviceId: "sv-color",
    staffId: "st-sebas",
    start: makeDemoDateTime(0, 18, 30),
    end: makeDemoDateTime(0, 20, 30),
    paymentMethod: "pos_bancard",
    status: "confirmed",
    notes: "Diseño VIP con mechas rubio ceniza muy claro (9.1) y ondas al agua.",
  },

  // --- AYER (dayOffset = -1) ---
  {
    id: "ap-ayer-1",
    clientName: "Pedro Gómez",
    clientEmail: "pedro.gomez@gmail.com",
    clientPhone: "+595 984 777 888",
    serviceId: "sv-corte",
    staffId: "st-diego",
    start: makeDemoDateTime(-1, 9, 30),
    end: makeDemoDateTime(-1, 10, 5),
    paymentMethod: "efectivo",
    status: "completed",
    notes: "Corte clásico a tijera en laterales, número 3 en nuca.",
  },
  {
    id: "ap-ayer-2",
    clientName: "María Ferreira",
    clientEmail: "maria.ferreira@gmail.com",
    clientPhone: "+595 981 111 222",
    serviceId: "sv-color",
    staffId: "st-sofia",
    start: makeDemoDateTime(-1, 10, 30),
    end: makeDemoDateTime(-1, 12, 30),
    paymentMethod: "pos_bancard",
    status: "completed",
    notes: "Retoque de raíces y baño de brillo capilar.",
  },
  {
    id: "ap-ayer-3",
    clientName: "José Insfrán",
    clientEmail: "jose.insfran@hotmail.com",
    clientPhone: "+595 982 333 444",
    serviceId: "sv-barba",
    staffId: "st-marcos",
    start: makeDemoDateTime(-1, 14, 0),
    end: makeDemoDateTime(-1, 14, 55),
    paymentMethod: "sipap",
    status: "completed",
    notes: "Corte fade medio con navaja + perfilado de barba con toalla caliente.",
  },
  {
    id: "ap-ayer-4",
    clientName: "Carla Duarte",
    clientEmail: "carla.duarte@pymail.com",
    clientPhone: "+595 983 555 666",
    serviceId: "sv-tratamiento",
    staffId: "st-sofia",
    start: makeDemoDateTime(-1, 15, 30),
    end: makeDemoDateTime(-1, 17, 0),
    paymentMethod: "efectivo",
    status: "completed",
    notes: "Alisado con keratina termoactiva brasileña.",
  },
  {
    id: "ap-ayer-5",
    clientName: "Luis Vera",
    clientEmail: "luis.vera@outlook.com",
    clientPhone: "+595 986 999 000",
    serviceId: "sv-barba",
    staffId: "st-marcos",
    start: makeDemoDateTime(-1, 17, 15),
    end: makeDemoDateTime(-1, 18, 10),
    paymentMethod: "sipap",
    status: "completed",
    notes: "Barba completa degrade 1 a 3 con contorno definido a navaja.",
  },
  {
    id: "ap-ayer-6",
    clientName: "Ana Torres",
    clientEmail: "ana.torres@gmail.com",
    clientPhone: "+595 985 112 233",
    serviceId: "sv-corte",
    staffId: "st-marcos",
    start: makeDemoDateTime(-1, 18, 30),
    end: makeDemoDateTime(-1, 19, 5),
    paymentMethod: "pos_bancard",
    status: "cancelled",
    notes: "Cancelado con aviso previo por motivos laborales.",
  },

  // --- MAÑANA (dayOffset = 1) ---
  {
    id: "ap-man-1",
    clientName: "Martín Peña",
    clientEmail: "martin.pena@gmail.com",
    clientPhone: "+595 981 123 456",
    serviceId: "sv-corte",
    staffId: "st-diego",
    start: makeDemoDateTime(1, 9, 0),
    end: makeDemoDateTime(1, 9, 35),
    paymentMethod: "efectivo",
    status: "confirmed",
    notes: "Mantenimiento semanal de laterales y nuca.",
  },
  {
    id: "ap-man-2",
    clientName: "Fernando Benítez",
    clientEmail: "fernando.b@gmail.com",
    clientPhone: "+595 981 778 899",
    serviceId: "sv-barba",
    staffId: "st-marcos",
    start: makeDemoDateTime(1, 10, 0),
    end: makeDemoDateTime(1, 10, 55),
    paymentMethod: "pos_bancard",
    status: "confirmed",
    notes: "Ritual de barba y masaje capilar revitalizante.",
  },
  {
    id: "ap-man-3",
    clientName: "Camila Insfrán",
    clientEmail: "camila.insfran@gmail.com",
    clientPhone: "+595 982 987 654",
    serviceId: "sv-tratamiento",
    staffId: "st-sofia",
    start: makeDemoDateTime(1, 11, 30),
    end: makeDemoDateTime(1, 13, 0),
    paymentMethod: "pos_bancard",
    status: "confirmed",
    notes: "Baño de keratina y secado modelado para producción de fotos.",
  },
  {
    id: "ap-man-4",
    clientName: "Natalia Giménez",
    clientEmail: "natalia.gimenez@gmail.com",
    clientPhone: "+595 981 556 778",
    serviceId: "sv-color",
    staffId: "st-sofia",
    start: makeDemoDateTime(1, 15, 0),
    end: makeDemoDateTime(1, 17, 0),
    paymentMethod: "sipap",
    status: "confirmed",
    notes: "Balayage caramelo en cabello castaño oscuro.",
  },
  {
    id: "ap-man-5",
    clientName: "Rodrigo Duarte",
    clientEmail: "rodrigo.duarte@hotmail.com",
    clientPhone: "+595 983 456 789",
    serviceId: "sv-corte",
    staffId: "st-marcos",
    start: makeDemoDateTime(1, 17, 30),
    end: makeDemoDateTime(1, 18, 5),
    paymentMethod: "efectivo",
    status: "pending",
    notes: "Turno reservado vía WhatsApp por el cliente.",
  },

  // --- DÍAS ANTERIORES (Historial para fidelización, estadísticas y comisiones) ---
  {
    id: "ap-hist-1",
    clientName: "Martín Peña",
    clientEmail: "martin.pena@gmail.com",
    clientPhone: "+595 981 123 456",
    serviceId: "sv-corte",
    staffId: "st-diego",
    start: makeDemoDateTime(-4, 10, 0),
    end: makeDemoDateTime(-4, 10, 35),
    paymentMethod: "efectivo",
    status: "completed",
    notes: "Visita periódica registrada con sello VIP.",
  },
  {
    id: "ap-hist-2",
    clientName: "Camila Insfrán",
    clientEmail: "camila.insfran@gmail.com",
    clientPhone: "+595 982 987 654",
    serviceId: "sv-color",
    staffId: "st-sofia",
    start: makeDemoDateTime(-6, 14, 0),
    end: makeDemoDateTime(-6, 16, 0),
    paymentMethod: "pos_bancard",
    status: "completed",
    notes: "Diseño de iluminación y matizador beige.",
  },
  {
    id: "ap-hist-3",
    clientName: "Carlos Méndez",
    clientEmail: "carlos.mendez@outlook.com",
    clientPhone: "+595 983 221 990",
    serviceId: "sv-barba",
    staffId: "st-marcos",
    start: makeDemoDateTime(-8, 16, 30),
    end: makeDemoDateTime(-8, 17, 25),
    paymentMethod: "efectivo",
    status: "completed",
    notes: "Perfilado y tratamiento de aceite con toalla caliente.",
  },
  {
    id: "ap-hist-4",
    clientName: "Andrea Villalba",
    clientEmail: "andrea.villalba@gmail.com",
    clientPhone: "+595 984 667 890",
    serviceId: "sv-tratamiento",
    staffId: "st-sofia",
    start: makeDemoDateTime(-11, 11, 0),
    end: makeDemoDateTime(-11, 12, 30),
    paymentMethod: "pos_bancard",
    status: "completed",
    notes: "Cauterización molecular y baño de colágeno.",
  },
  {
    id: "ap-hist-5",
    clientName: "Esteban Bogado",
    clientEmail: "esteban.bogado@pymail.com",
    clientPhone: "+595 984 332 211",
    serviceId: "sv-corte",
    staffId: "st-diego",
    start: makeDemoDateTime(-14, 15, 0),
    end: makeDemoDateTime(-14, 15, 35),
    paymentMethod: "efectivo",
    status: "completed",
    notes: "Corte fade bajo y peinado pompadour.",
  },
  {
    id: "ap-hist-6",
    clientName: "María Ferreira",
    clientEmail: "maria.ferreira@gmail.com",
    clientPhone: "+595 981 111 222",
    serviceId: "sv-tratamiento",
    staffId: "st-sofia",
    start: makeDemoDateTime(-18, 14, 0),
    end: makeDemoDateTime(-18, 15, 30),
    paymentMethod: "pos_bancard",
    status: "completed",
    notes: "Tratamiento intensivo con botox capilar.",
  },
];

/** Alias compatible */
const appointments: Appointment[] = initialAppointments;

export const initialCashMovements: CashMovement[] = [
  // --- MOVIMIENTOS DE HOY ---
  {
    id: "cm-hoy-1",
    type: "ingreso",
    amount: 300000,
    method: "efectivo",
    concept: "Apertura de caja chica del día",
    date: makeDemoDateTime(0, 8, 0),
  },
  {
    id: "cm-hoy-2",
    type: "ingreso",
    amount: 80000,
    method: "efectivo",
    concept: "Cobro turno: Martín Peña (Corte Clásico)",
    date: makeDemoDateTime(0, 9, 40),
    appointmentId: "ap-hoy-1",
  },
  {
    id: "cm-hoy-3",
    type: "egreso",
    amount: 45000,
    method: "efectivo",
    concept: "Compra de café espresso y hielo para recepción",
    date: makeDemoDateTime(0, 10, 15),
  },
  {
    id: "cm-hoy-4",
    type: "ingreso",
    amount: 250000,
    method: "pos",
    concept: "Cobro turno: Camila Insfrán (Keratina Espejo)",
    date: makeDemoDateTime(0, 11, 35),
    appointmentId: "ap-hoy-2",
    voucherNumber: "POS-59124",
  },
  {
    id: "cm-hoy-5",
    type: "ingreso",
    amount: 130000,
    method: "transferencia",
    concept: "Cobro turno: Rodrigo Duarte (Corte + Ritual Barba)",
    date: makeDemoDateTime(0, 12, 5),
    appointmentId: "ap-hoy-3",
    voucherNumber: "SIPAP-88412",
  },
  {
    id: "cm-hoy-6",
    type: "ingreso",
    amount: 70000,
    method: "efectivo",
    concept: "Venta mostrador: Cera Capilar Mate Extreme (pr-1)",
    date: makeDemoDateTime(0, 12, 30),
  },
  {
    id: "cm-hoy-7",
    type: "ingreso",
    amount: 80000,
    method: "transferencia",
    concept: "Cobro turno: Gonzalo Almirón (Corte Degradé)",
    date: makeDemoDateTime(0, 14, 10),
    appointmentId: "ap-hoy-4",
    voucherNumber: "QR-77291",
  },
  {
    id: "cm-hoy-8",
    type: "egreso",
    amount: 120000,
    method: "transferencia",
    concept: "Pago insumos: Distribuidora Capilar Asunción",
    date: makeDemoDateTime(0, 15, 20),
    voucherNumber: "SIPAP-PAG-331",
  },
  {
    id: "cm-hoy-9",
    type: "ingreso",
    amount: 130000,
    method: "pos",
    concept: "Cobro turno: Carlos Méndez (Ritual Barba)",
    date: makeDemoDateTime(0, 16, 45),
    appointmentId: "ap-hoy-6",
    voucherNumber: "POS-59188",
  },
  {
    id: "cm-hoy-10",
    type: "ingreso",
    amount: 65000,
    method: "efectivo",
    concept: "Venta mostrador: Aceite Barba Sandalwood & Argán (pr-2)",
    date: makeDemoDateTime(0, 17, 15),
  },

  // --- MOVIMIENTOS DE AYER ---
  {
    id: "cm-ayer-1",
    type: "ingreso",
    amount: 300000,
    method: "efectivo",
    concept: "Apertura de caja chica (ayer)",
    date: makeDemoDateTime(-1, 8, 0),
  },
  {
    id: "cm-ayer-2",
    type: "ingreso",
    amount: 80000,
    method: "efectivo",
    concept: "Cobro turno: Pedro Gómez (Corte Clásico)",
    date: makeDemoDateTime(-1, 10, 10),
    appointmentId: "ap-ayer-1",
  },
  {
    id: "cm-ayer-3",
    type: "ingreso",
    amount: 320000,
    method: "pos",
    concept: "Cobro turno: María Ferreira (Colorimetría Balayage)",
    date: makeDemoDateTime(-1, 12, 35),
    appointmentId: "ap-ayer-2",
    voucherNumber: "POS-48912",
  },
  {
    id: "cm-ayer-4",
    type: "ingreso",
    amount: 130000,
    method: "transferencia",
    concept: "Cobro turno: José Insfrán (Ritual Barba)",
    date: makeDemoDateTime(-1, 15, 0),
    appointmentId: "ap-ayer-3",
    voucherNumber: "SIPAP-73910",
  },
  {
    id: "cm-ayer-5",
    type: "egreso",
    amount: 35000,
    method: "efectivo",
    concept: "Insumos de limpieza y toallas descartables",
    date: makeDemoDateTime(-1, 16, 30),
  },
  {
    id: "cm-ayer-6",
    type: "ingreso",
    amount: 250000,
    method: "efectivo",
    concept: "Cobro turno: Carla Duarte (Tratamiento Keratina)",
    date: makeDemoDateTime(-1, 17, 40),
    appointmentId: "ap-ayer-4",
  },
  {
    id: "cm-ayer-7",
    type: "egreso",
    amount: 300000,
    method: "efectivo",
    concept: "Cierre y retiro de fondo de caja al final de jornada",
    date: makeDemoDateTime(-1, 18, 30),
  },
];

export const initialCommissionPayouts: CommissionPayoutRecord[] = [
  {
    id: "payout-001",
    staffId: "st-marcos",
    staffName: "Marcos Benítez",
    staffRole: "Master Barber",
    periodStart: "2026-09-01T00:00:00.000Z",
    periodEnd: "2026-09-15T23:59:59.000Z",
    servicesAmount: 1850000,
    productsAmount: 210000,
    servicesCommission: 925000,
    productsCommission: 21000,
    servicesSharePercent: 98,
    productsSharePercent: 2,
    grossCommission: 946000,
    advancesDeducted: 100000,
    amountPaid: 846000,
    paymentMethod: "Transferencia",
    status: "PAID",
    paidAt: "2026-09-16T11:30:00.000Z",
    paidBy: "admin@agendate.py",
    receiptNumber: "LIQ-2026-091",
    notes: "Liquidación quincenal conforme. Transferencia vía Banco Itaú.",
    itemsCount: 14,
  },
  {
    id: "payout-002",
    staffId: "st-sofia",
    staffName: "Sofía Alcaraz",
    staffRole: "Colorista & Estilista",
    periodStart: "2026-09-01T00:00:00.000Z",
    periodEnd: "2026-09-15T23:59:59.000Z",
    servicesAmount: 2400000,
    productsAmount: 140000,
    servicesCommission: 1080000,
    productsCommission: 14000,
    servicesSharePercent: 99,
    productsSharePercent: 1,
    grossCommission: 1094000,
    advancesDeducted: 0,
    amountPaid: 1094000,
    paymentMethod: "Efectivo",
    status: "PAID",
    paidAt: "2026-09-16T12:00:00.000Z",
    paidBy: "admin@agendate.py",
    receiptNumber: "LIQ-2026-092",
    notes: "Pago en efectivo en mostrador con firma de recibo.",
    itemsCount: 11,
  },
  {
    id: "payout-003",
    staffId: "st-diego",
    staffName: "Diego Franco",
    staffRole: "Barbero",
    periodStart: "2026-09-01T00:00:00.000Z",
    periodEnd: "2026-09-15T23:59:59.000Z",
    servicesAmount: 1100000,
    productsAmount: 70000,
    servicesCommission: 440000,
    productsCommission: 7000,
    servicesSharePercent: 98,
    productsSharePercent: 2,
    grossCommission: 447000,
    advancesDeducted: 0,
    amountPaid: 447000,
    paymentMethod: "Transferencia",
    status: "PAID",
    paidAt: "2026-09-16T14:15:00.000Z",
    paidBy: "admin@agendate.py",
    receiptNumber: "LIQ-2026-093",
    notes: "Transferencia a Ueno Bank.",
    itemsCount: 9,
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
    timingMinutesBefore: 1440,
    body: "¡Hola {cliente}! Te recordamos tu turno de mañana *{fecha} a las {hora} hs* para *{servicio}* en *{negocio}*.\n\n¿Nos confirmás tu asistencia? Si necesitás reprogramar o cancelar, podés hacerlo con un clic aquí:\n{link_autogestion}",
    enabled: true,
  },
  {
    id: "wt-recordatorio-2h",
    name: "Recordatorio 2 Horas Antes",
    trigger: "recordatorio_2h",
    timingMinutesBefore: 120,
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
  productOrders: ProductOrder[];
  updateProductOrderStatus: (orderId: string, status: ProductOrderStatus) => void;
  createProductOrder: (order: Omit<ProductOrder, "id" | "orderNumber" | "createdAt">) => void;
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
  updateAppointment: (id: string, patch: Partial<Appointment>) => Promise<boolean>;
  cancelAppointment: (id: string) => Promise<any> | void;
  addBlock: (block: Omit<TimeBlock, "id">) => Promise<any> | void;
  removeBlock: (id: string) => Promise<any> | void;
  setReceiptStatus: (id: string, status: Receipt["status"]) => void;
  toggleStaff: (id: string) => Promise<any> | void;
  addStaff: (item: Omit<StaffMember, "id">) => Promise<any> | void;
  updateStaff: (id: string, patch: Partial<StaffMember>) => Promise<any> | void;
  deleteStaff: (id: string) => Promise<any> | void;
  updateStaffCommission: (id: string, percentage: number, productPercentage?: number) => Promise<any> | void;
  commissionPayouts: CommissionPayoutRecord[];
  addCommissionPayout: (
    payout: Omit<CommissionPayoutRecord, "id" | "paidAt">,
    options?: { registerCashExpense?: boolean }
  ) => CommissionPayoutRecord;
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
  updateLoyalty: (patch: Partial<LoyaltySettings>) => Promise<boolean> | void;
  addClientLoyaltyPoint: (clientId: string, amount?: number) => void;
  redeemClientReward: (clientId: string, pointsToDeduct?: number, rewardDescription?: string) => Promise<boolean>;
  updateSipap: (patch: Partial<SipapConfig>) => void;
  updateEvolutionApi: (patch: Partial<EvolutionApiConfig>) => void;
  addCashMovement: (item: Omit<CashMovement, "id">) => Promise<any> | void;
  deleteCashMovement: (id: string) => Promise<any> | void;
  currentUserRole: UserRole;
  currentStaffId?: string;
  userName: string;
  setUserName: (name: string) => void;
  setCurrentUserRole: (role: UserRole, staffId?: string) => void;
  updateWhatsAppTemplate: (id: string, patch: string | Partial<WhatsAppTemplate>) => void;
  createWhatsAppTemplate: (template: WhatsAppTemplate) => void;
  deleteWhatsAppTemplate: (id: string) => void;
  toggleWhatsAppTemplate: (id: string) => void;
  pushToast: (type: "success" | "error", message: string) => void;
  dismissToast: (id: string) => void;
  crmConversations: CrmConversation[];
  evolutionConfig: EvolutionApiConfig;
  updateEvolutionConfig: (config: Partial<EvolutionApiConfig>) => Promise<boolean>;
  loadDemoConversation: () => void;
  clearCrmConversations: () => void;
  restoreCrmConversations: (conversations: CrmConversation[]) => void;
  ensureClientCrmConversation: (client: Client) => string;
  createOrderFromCrm: (data: {
    clientName: string;
    clientPhone: string;
    items: { productId: string; productName: string; qty: number; unitPrice: number; isOnSale?: boolean }[];
    notes?: string;
    deliveryType: "retirar_en_local" | "delivery";
    paymentMethod: "efectivo" | "pos" | "transferencia";
  }) => void;
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
    primaryColor: "#FF4F2B",
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
  staff: initialStaff,
  services: services,
  products: initialProducts,
  productOrders: initialProductOrders,
  appointments: initialAppointments,
  clients: initialClients,
  cashMovements: initialCashMovements,
  commissionPayouts: initialCommissionPayouts,
  whatsappTemplates: initialWhatsAppTemplates,
  loyalty: initialLoyalty,
  sipap: initialSipap,
  evolutionApi: initialEvolutionApi,
  blocks: initialBlocks,
  receipts: initialReceipts,
  currentUserRole: "admin",
  currentStaffId: undefined,
  userName: "Sebas Duarte",
  setUserName: (name: string) => set({ userName: name }),
  setCurrentUserRole: (role, staffId) =>
    set({
      currentUserRole: role,
      currentStaffId: staffId,
      selectedStaffId: (role === "barbero" || role === "estilista") && staffId ? staffId : "all",
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
            primaryColor: t.primaryColor || state.business.primaryColor,
            logoUrl: t.logoUrl ?? state.business.logoUrl,
            plan: t.plan || state.business.plan,
            usedBookings: typeof t.usedBookings === "number" ? t.usedBookings : state.business.usedBookings,
            freeBookingLimit:
              t.plan === "gratis" ? 20 : t.plan === "basico" ? 100 : t.plan ? 9999 : state.business.freeBookingLimit,
          };
        }

        if (data.tenant?.settings?.loyalty) {
          const dbLoyalty = data.tenant.settings.loyalty;
          nextState.loyalty = {
            ...state.loyalty,
            ...dbLoyalty,
            rewards: Array.isArray(dbLoyalty.rewards) && dbLoyalty.rewards.length > 0
              ? dbLoyalty.rewards
              : state.loyalty.rewards,
          };
        }

        if (data.tenant?.settings?.evolutionConfig) {
          nextState.evolutionConfig = {
            ...state.evolutionConfig,
            ...data.tenant.settings.evolutionConfig,
          };
        }

        if (Array.isArray(data.services) && data.services.length > 0) {
          nextState.services = data.services.map((s: any) => ({
            id: s.id,
            name: s.name,
            category: s.category || "Peluquería",
            imageUrl: s.imageUrl || "",
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

        if (Array.isArray(data.staff) && data.staff.length > 0) {
          nextState.staff = data.staff.map((st: any) => ({
            id: st.id,
            name: st.name,
            role: st.role || "Colaborador",
            systemRole: st.systemRole || (st.name.toLowerCase().includes("leticia") ? "cajero" : st.name.toLowerCase().includes("sofia") ? "estilista" : "barbero"),
            description: st.description || "",
            avatar: st.name.slice(0, 2).toUpperCase(),
            color: st.color || "#4f46e5",
            active: st.active ?? true,
            hours: st.hours || "08:00 – 20:00",
            commissionPercentage: st.commissionPercentage ?? 50,
            productCommissionPercentage: st.productCommissionPercentage ?? 10,
            advanceBalance: st.advanceBalance ?? 0,
          }));
        }

        if (Array.isArray(data.clients) && data.clients.length > 0) {
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
            lastVisit: c.lastVisit || null,
            loyaltyPoints: c.loyaltyPoints ?? 0,
            loyaltyRedeemed: 0,
          }));
        }

        if (Array.isArray(data.cashMovements) && data.cashMovements.length > 0) {
          const mappedCash = data.cashMovements.map((cm: any) => ({
            id: cm.id,
            type: cm.type,
            amount: cm.amount,
            method: cm.method,
            concept: cm.concept,
            date: cm.date,
            category: cm.category,
            appointmentId: cm.appointmentId,
          }));
          const hasTodayCash = mappedCash.some((cm: any) => (cm.date || "").slice(0, 10) === defaultCivilDate);
          nextState.cashMovements = hasTodayCash ? mappedCash : [...mappedCash, ...initialCashMovements];
        }

        if (Array.isArray(data.scheduleBlocks) && data.scheduleBlocks.length > 0) {
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

        if (Array.isArray(data.appointments) && data.appointments.length > 0) {
          const hasTodayApp = data.appointments.some((a: any) => {
            const d = (a.start || a.startTime || "").slice(0, 10);
            return d === defaultCivilDate;
          });
          nextState.appointments = hasTodayApp ? data.appointments : [...data.appointments, ...initialAppointments];
        }

        if (Array.isArray(data.products) && data.products.length > 0) {
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
  updateAppointment: async (id: string, patch: Partial<Appointment>) => {
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
    const crmConversations = get().crmConversations.map((c) => ({
      ...c,
      messages: c.messages.map((m) => {
        if (m.receiptAttachment?.receiptId === id) {
          return {
            ...m,
            receiptAttachment: {
              ...m.receiptAttachment,
              status,
            },
          };
        }
        return m;
      }),
    }));
    set({ receipts, appointments, crmConversations });
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
  updateStaffCommission: (id, percentage, productPercentage) => {
    const patch: Partial<StaffMember> = { commissionPercentage: percentage };
    if (productPercentage !== undefined) {
      patch.productCommissionPercentage = productPercentage;
    }
    return get().updateStaff(id, patch);
  },
  addCommissionPayout: (payoutData, options) => {
    const registerCashExpense = options?.registerCashExpense ?? true;
    const id = "payout-" + Date.now();
    const paidAt = new Date().toISOString();
    const receiptNumber =
      payoutData.receiptNumber ||
      `LIQ-${new Date().getFullYear()}-${String(get().commissionPayouts.length + 1).padStart(3, "0")}`;
    const newPayout: CommissionPayoutRecord = {
      ...payoutData,
      id,
      paidAt,
      receiptNumber,
    };

    // 1. Add to payouts list
    const updatedPayouts = [newPayout, ...get().commissionPayouts];

    // 2. Register an EGRESO in Caja Diaria when requested
    const cashExpense: CashMovement = {
      id: "cm-" + Date.now(),
      type: "egreso",
      amount: newPayout.amountPaid,
      method: (newPayout.paymentMethod.toLowerCase().includes("transfer") || newPayout.paymentMethod.toLowerCase().includes("sipap") ? "transferencia" : "efectivo") as any,
      concept: `Liquidación de comisiones: ${newPayout.staffName} (${receiptNumber})`,
      category: "Comisiones",
      date: paidAt,
    };

    set({
      commissionPayouts: updatedPayouts,
      cashMovements: registerCashExpense ? [cashExpense, ...get().cashMovements] : get().cashMovements,
    });

    // 3. Deduct advanceBalance from staff member if advance was deducted
    if (newPayout.advancesDeducted && newPayout.advancesDeducted > 0) {
      const currentStaff = get().staff.find((s) => s.id === newPayout.staffId);
      if (currentStaff && (currentStaff.advanceBalance ?? 0) > 0) {
        const remaining = Math.max(0, (currentStaff.advanceBalance || 0) - newPayout.advancesDeducted);
        get().updateStaff(newPayout.staffId, { advanceBalance: remaining });
      }
    }

    // Also attempt POST to backend if running with Postgres
    fetch("/api/commission-payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staffId: newPayout.staffId,
        periodStart: newPayout.periodStart,
        periodEnd: newPayout.periodEnd,
        paymentMethod: newPayout.paymentMethod,
        notes: newPayout.notes,
        registerCashExpense,
      }),
    }).catch(() => {});

    return newPayout;
  },
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
          imageUrl: item.imageUrl || "",
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
              imageUrl: data.service.imageUrl ?? item.imageUrl ?? "",
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
  updateProductOrderStatus: (orderId, status) => {
    const order = get().productOrders.find((o) => o.id === orderId);
    set({
      productOrders: get().productOrders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
    });
    // When delivered, auto-register cash ingress
    if (status === "delivered" && order) {
      get().addCashMovement({
        type: "ingreso",
        amount: order.totalAmount,
        method: (order.paymentMethod || "efectivo") as any,
        concept: `Venta de producto: ${order.items.map((i) => `${i.qty}x ${i.productName}`).join(", ")} · ${order.orderNumber}`,
        date: new Date().toISOString(),
        category: "Venta Producto",
      });
    }
  },
  createProductOrder: (orderData) => {
    const newOrder: ProductOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `#PED-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
    };
    set({
      productOrders: [newOrder, ...get().productOrders],
    });
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

  updateLoyalty: async (patch) => {
    const nextLoyalty = { ...get().loyalty, ...patch };
    set({ loyalty: nextLoyalty });
    try {
      const res = await fetch("/api/tenant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: { loyalty: nextLoyalty },
          loyalty: nextLoyalty,
        }),
      });
      const data = await res.json();
      return Boolean(data.ok);
    } catch (err) {
      console.warn("Error guardando loyalty en tenant.settings:", err);
      return false;
    }
  },
  addClientLoyaltyPoint: (clientId, amount = 1) => {
    const prev = get().clients;
    const target = prev.find((c) => c.id === clientId);
    if (!target) return;
    const newPoints = (target.loyaltyPoints || 0) + Math.max(1, Math.round(amount));
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
  redeemClientReward: async (clientId, pointsToDeduct, rewardDescription) => {
    const defaultThreshold = get().loyalty.rewardThreshold || 5;
    const threshold = typeof pointsToDeduct === "number" && pointsToDeduct > 0 ? pointsToDeduct : defaultThreshold;
    const target = get().clients.find((c) => c.id === clientId);
    if (!target) return false;
    const before = { loyaltyPoints: target.loyaltyPoints, loyaltyRedeemed: target.loyaltyRedeemed };
    const patchClient = (patch: Partial<Client>) =>
      set({ clients: get().clients.map((c) => (c.id === clientId ? { ...c, ...patch } : c)) });

    patchClient({
      loyaltyPoints: Math.max(0, (target.loyaltyPoints || 0) - threshold),
      loyaltyRedeemed: (target.loyaltyRedeemed || 0) + 1,
    });
    try {
      const res = await fetch(`/api/clients/${clientId}/redemptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pointsUsed: threshold,
          rewardDescription: rewardDescription?.trim() || "Premio de fidelización",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "No se pudo registrar el canje.");
      patchClient({ loyaltyPoints: data.loyaltyPoints, loyaltyRedeemed: data.loyaltyRedeemed });
      return true;
    } catch (err) {
      console.warn("Error canjeando premio de cliente:", err);
      patchClient(before);
      return false;
    }
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

  updateWhatsAppTemplate: (id, patch) =>
    set({
      whatsappTemplates: get().whatsappTemplates.map((t) =>
        t.id === id
          ? typeof patch === "string"
            ? { ...t, body: patch }
            : { ...t, ...patch }
          : t,
      ),
    }),
  createWhatsAppTemplate: (template) =>
    set({
      whatsappTemplates: [...get().whatsappTemplates, template],
    }),
  deleteWhatsAppTemplate: (id) =>
    set({
      whatsappTemplates: get().whatsappTemplates.filter((t) => t.id !== id),
    }),
  toggleWhatsAppTemplate: (id) =>
    set({
      whatsappTemplates: get().whatsappTemplates.map((t) =>
        t.id === id ? { ...t, enabled: !t.enabled } : t,
      ),
    }),

  crmConversations: initialCrmConversations,
  evolutionConfig: initialEvolutionApi,
  updateEvolutionConfig: async (config) => {
    const next = { ...get().evolutionConfig, ...config };
    try {
      const response = await fetch("/api/tenant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: { evolutionConfig: config },
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.ok !== true) return false;
      set({ evolutionConfig: next });
      return true;
    } catch (err) {
      console.warn("Error guardando evolutionConfig en BD:", err);
      return false;
    }
  },
  loadDemoConversation: () => {
    set({
      crmConversations: initialCrmConversations,
    });
    get().pushToast("success", "Conversaciones demo cargadas en la bandeja con comprobante de transferencia.");
  },
  clearCrmConversations: () => {
    set({ crmConversations: [] });
    get().pushToast("success", "Bandeja limpiada.");
  },
  restoreCrmConversations: (conversations) => {
    set((state) => {
      const currentIds = new Set(state.crmConversations.map((conversation) => conversation.id));
      return {
        crmConversations: [
          ...state.crmConversations,
          ...conversations.filter((conversation) => !currentIds.has(conversation.id)),
        ],
      };
    });
  },
  ensureClientCrmConversation: (client) => {
    const phoneDigits = client.phone.replace(/\D/g, "");
    const phoneSuffix = phoneDigits.slice(-8);
    const existing = phoneSuffix.length >= 6
      ? get().crmConversations.find(
          (conversation) =>
            conversation.channel === "whatsapp" &&
            conversation.channelIdentifier.replace(/\D/g, "").endsWith(phoneSuffix),
        )
      : undefined;

    if (existing) {
      set({
        crmConversations: get().crmConversations.map((conversation) =>
          conversation.id === existing.id
            ? {
                ...conversation,
                clientId: client.id,
                clientName: client.name,
                channelIdentifier: client.phone,
              }
            : conversation,
        ),
      });
      return existing.id;
    }

    const id = `conv-client-${client.id}-${Date.now()}`;
    const now = new Date().toISOString();
    const conversation: CrmConversation = {
      id,
      clientId: client.id,
      clientName: client.name,
      channel: "whatsapp",
      channelIdentifier: client.phone,
      lastMessage: "Sin mensajes previos",
      lastMessageTime: now,
      unreadCount: 0,
      status: "open",
      messages: [],
    };

    set({ crmConversations: [conversation, ...get().crmConversations] });
    return id;
  },
  createOrderFromCrm: (data) => {
    const total = data.items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
    const orderNumber = `#PED-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: ProductOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      items: data.items,
      totalAmount: total,
      status: "pending",
      paymentMethod: data.paymentMethod,
      deliveryType: data.deliveryType,
      createdAt: new Date().toISOString(),
      notes: data.notes || "Generado desde chat de CRM",
    };
    set({
      productOrders: [newOrder, ...get().productOrders],
    });
    get().pushToast("success", `Pedido ${orderNumber} creado exitosamente desde CRM`);
  },

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
