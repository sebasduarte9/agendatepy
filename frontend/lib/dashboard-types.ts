export type PaymentMethod = "efectivo" | "sipap" | "pos_bancard" | "billetera_py";
export type AppointmentStatus = "confirmed" | "pending" | "cancelled" | "completed";
export type PlanId = "basico" | "pro" | "premium" | "empresa";
export type CalendarView = "dia" | "semana" | "mes";
export type UserRole = "admin" | "cajero" | "barbero" | "estilista";

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  systemRole?: UserRole;
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
  // Promociones y Ofertas limitadas
  hasPromo?: boolean;
  promoPrice?: number;
  promoBadge?: string; // ej: "-20% OFF", "2x1", "Promo Flash"
  promoType?: "quantity" | "time"; // por cantidad de cupos o por tiempo limitado
  promoLimitQuantity?: number; // ej: 5 cupos
  promoLimitHours?: number; // ej: 24 horas
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

export type ClientMediaType = "image" | "video";

export type ClientMediaTag = "Antes" | "Después" | "Proceso" | "Resultado" | "Fórmula";

export type ClientMedia = {
  id: string;
  type: ClientMediaType;
  url: string; // URL o Base64 optimizado
  thumbnailUrl?: string;
  title: string;
  tag: ClientMediaTag;
  createdAt: string; // ISO date
  sizeKb?: number; // Tamaño optimizado en KB
  originalSizeKb?: number; // Tamaño original para métrica de ahorro
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  instagram?: string; // Ej: @mariaferreirapy
  messengerId?: string; // Ej: maria.ferreira.py o ID de Facebook
  notes: string;
  formula?: string; // Ficha técnica: tinte, corte o preferencia médica/estética
  totalVisits: number;
  totalSpent: number;
  lastVisit: string; // ISO
  tags: string[]; // "VIP", "Frecuente", "Nuevo"
  loyaltyPoints: number; // Sellos / puntos de fidelización acumulados
  loyaltyRedeemed: number; // Recompensas canjeadas
  gallery?: ClientMedia[]; // Fotos y videos optimizados (Antes / Después / Resultados)
};

export type CrmChannel = "whatsapp" | "instagram" | "messenger";

export type CrmMessage = {
  id: string;
  sender: "client" | "agent" | "bot";
  text: string;
  timestamp: string; // ISO
  status?: "sent" | "delivered" | "read";
};

export type CrmConversation = {
  id: string;
  clientId?: string;
  clientName: string;
  clientAvatar?: string;
  channel: CrmChannel;
  channelIdentifier: string; // Número WA (+595...), @usuario IG, o Nombre FB
  lastMessage: string;
  lastMessageTime: string; // ISO
  unreadCount: number;
  status: "open" | "pending" | "resolved";
  assignedStaff?: string;
  messages: CrmMessage[];
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
