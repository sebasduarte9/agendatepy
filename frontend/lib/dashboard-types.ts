export type PaymentMethod = "efectivo" | "sipap" | "pos_bancard" | "billetera_py";
export type AppointmentStatus = "confirmed" | "pending" | "cancelled" | "completed";
export type PlanId = "basico" | "pro" | "premium" | "empresa";
export type CalendarView = "dia" | "semana" | "mes";

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  color: string;
  active: boolean;
  /** Horario regular en hora local del negocio (timezone store). */
  hours: string;
  commissionPercentage: number;
};

export type ServiceItem = {
  id: string;
  name: string;
  category?: string;
  durationMin: number;
  price: number;
  description: string;
  image: string;
};

export type ProductItem = {
  id: string;
  name: string;
  description: string;
  price: number; // Precio en Gs.
  cost: number; // Costo de compra en Gs.
  imageUrl: string;
  category: string;
  stock: number;
  active: boolean;
};

export type Appointment = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceId: string;
  staffId: string;
  /** ISO UTC. Normalizar con date-fns-tz + timezone del negocio. */
  start: string;
  end: string;
  paymentMethod: PaymentMethod;
  status: AppointmentStatus;
  notes?: string;
  receiptUrl?: string;
};

export type TimeBlock = {
  id: string;
  staffId: string;
  /** Fecha civil YYYY-MM-DD en timezone del local. */
  date: string;
  start: string;
  end: string;
  reason: string;
};

export type Receipt = {
  id: string;
  appointmentId: string;
  clientName: string;
  amount: number;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  note: string;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  formula?: string; // Ficha técnica: tinte, corte o preferencia médica/estética
  totalVisits: number;
  totalSpent: number;
  lastVisit: string; // ISO
  tags: string[]; // "VIP", "Frecuente", "Nuevo"
  loyaltyPoints: number; // Sellos / puntos de fidelización acumulados
  loyaltyRedeemed: number; // Recompensas canjeadas
};

export type CashMovement = {
  id: string;
  type: "ingreso" | "egreso";
  amount: number;
  method: "efectivo" | "pos" | "transferencia";
  concept: string;
  date: string; // ISO o YYYY-MM-DD
  appointmentId?: string;
  voucherNumber?: string;
};

export type WhatsAppTemplate = {
  id: string;
  name: string;
  trigger: "confirmacion" | "recordatorio_24h" | "recordatorio_2h" | "cancelacion";
  body: string;
  enabled: boolean;
};

export type LoyaltySettings = {
  enabled: boolean;
  rewardThreshold: number; // Ej. 5 visitas
  rewardDescription: string; // Ej. "50% de descuento en tu próximo corte"
  pointsPerVisit: number;
};

export type SipapConfig = {
  bankName: string;
  accountHolder: string;
  rucOrCi: string;
  accountNumber: string;
  aliasSipap: string;
};

export type EvolutionApiConfig = {
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
  instanceName: string;
  autoSendOnBooking: boolean;
  autoSendOnCancel: boolean;
  connected: boolean;
};

export type BusinessProfile = {
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  timezone: string;
  primaryColor: string;
  plan: PlanId;
  usedBookings: number;
  freeBookingLimit: number;
  whatsappOn: boolean;
  whatsappNumber: string;
  discordWebhook: string;
  maxAdvanceDays: number;
  metaPixel: string;
  tiktokPixel: string;
  openingCash: number; // Fondo de caja inicial en Gs.
};
