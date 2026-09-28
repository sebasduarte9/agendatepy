export type PaymentMethod = "efectivo" | "sipap" | "pos_bancard" | "billetera_py";
export type AppointmentStatus = "confirmed" | "pending" | "cancelled" | "completed" | "no_show" | "expired";
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
  productCommissionPercentage?: number;
  advanceBalance?: number;
};

export type CommissionPayoutRecord = {
  id: string;
  staffId: string;
  staffName: string;
  staffRole?: string;
  periodStart: string;
  periodEnd: string;
  servicesAmount: number;
  productsAmount: number;
  servicesCommission?: number;
  productsCommission?: number;
  servicesSharePercent?: number;
  productsSharePercent?: number;
  grossCommission: number;
  advancesDeducted: number;
  amountPaid: number;
  paymentMethod: "Efectivo" | "SIPAP" | "POS Bancard" | "Billetera" | string;
  status: "PAID" | "PENDING";
  paidAt: string;
  paidBy?: string;
  receiptNumber?: string;
  notes?: string;
  itemsCount: number;
};

export type ServiceItem = {
  id: string;
  name: string;
  category?: string;
  durationMin: number;
  price: number;
  description: string;
  image: string;
  active?: boolean;
  staffIds?: string[]; // IDs de colaboradores que realizan este servicio
  // Promociones y Ofertas limitadas
  hasPromo?: boolean;
  promoPrice?: number;
  promoBadge?: string; // ej: "-20% OFF", "Ahorrá 20.000 Gs"
  promoDisplayType?: "percentage" | "amount"; // Modo de visualización del descuento
  promoType?: "quantity" | "time" | "both"; // por cantidad de cupos, tiempo limitado o ambos
  promoLimitQuantity?: number; // ej: 5 cupos
  promoLimitHours?: number; // ej: 24 horas
  promoDeadline?: string; // Fecha y hora límite en ISO
  requirePrepayment?: boolean; // Requiere seña o pago anticipado para confirmar
  prepaymentType?: "full" | "deposit"; // 100% anticipado o seña fija
  prepaymentAmount?: number; // Monto en Gs de la seña
  prepaymentMethod?: "transferencia" | "sipap" | "qr" | "cualquiera"; // Método aceptado
  prepaymentInstructions?: string; // Instrucciones de pago
};

export type ProductOfferType = "time" | "quantity" | "both";

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
  // Promociones y Ofertas especiales
  isOnSale?: boolean;
  salePrice?: number; // Precio de oferta en Gs.
  saleType?: ProductOfferType; // 'time' (por tiempo), 'quantity' (por cantidad máxima) o 'both'
  saleExpiresAt?: string; // Fecha/hora límite de la oferta
  saleMaxUnits?: number; // Límite de unidades en oferta
  saleUnitsSold?: number; // Cantidad ya vendida en oferta
};

export type ProductOrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

export type ProductOrderItem = {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  isOnSale?: boolean;
};

export type ProductOrder = {
  id: string;
  orderNumber: string; // ej: #PED-804
  clientName: string;
  clientPhone: string;
  sellerStaffId?: string;
  items: ProductOrderItem[];
  totalAmount: number;
  status: ProductOrderStatus;
  paymentMethod: "efectivo" | "transferencia" | "pos" | "sipap";
  deliveryType: "retirar_en_local" | "delivery";
  createdAt: string;
  notes?: string;
};

export type Appointment = {
  id: string;
  clientId?: string;
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
  clientPhone?: string;
  amount: number;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  note: string;
  bankOrigin?: string; // Ej: "Banco Itaú", "Ueno Bank", "Banco Continental", "BNF", "Sudameris"
  operationNumber?: string; // Ej: "SIPAP-894210", "SPI-991203"
  ocrVerified?: boolean; // True si fue extraído automáticamente por OCR
  ocrConfidence?: number; // Porcentaje de confianza (ej: 99.4)
  qrCodeDetected?: boolean; // Si contenía código QR bancario válido
  qrPayload?: string;
  channel?: CrmChannel;
  receiptUrl?: string;
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
  lastVisit: string | null; // ISO o null si no tiene visitas completadas
  tags: string[]; // "VIP", "Frecuente", "Nuevo"
  loyaltyPoints: number; // Sellos / puntos de fidelización acumulados
  loyaltyRedeemed: number; // Recompensas canjeadas
  gallery?: ClientMedia[]; // Fotos y videos optimizados (Antes / Después / Resultados)
};

export type CrmChannel = "whatsapp" | "instagram" | "messenger";

export type CrmReceiptAttachment = {
  receiptId: string;
  bankOrigin: string;
  amount: number;
  operationNumber: string;
  qrCodeDetected: boolean;
  ocrConfidence: number;
  ocrVerified: boolean;
  status: "pending" | "approved" | "rejected";
};

export type CrmMessage = {
  id: string;
  sender: "client" | "agent" | "bot";
  text: string;
  timestamp: string; // ISO
  status?: "sent" | "delivered" | "read";
  receiptAttachment?: CrmReceiptAttachment;
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
  category?: string;
};

export type WhatsAppTemplate = {
  id: string;
  name: string;
  trigger: "confirmacion" | "recordatorio_24h" | "recordatorio_2h" | "cancelacion";
  body: string;
  enabled: boolean;
};

export type LoyaltyMode = "stamps" | "points";

export type LoyaltySettings = {
  enabled: boolean;
  mode?: LoyaltyMode; // "stamps" (sellos por visita) o "points" (puntos acumulables)
  rewardThreshold: number; // Ej. 5 sellos o 100 puntos
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
  phoneNumber?: string;
  autoBotEnabled?: boolean;
  webhookUrl?: string;
  lastSync?: string;
  instagramConnected?: boolean;
  instagramHandle?: string;
  messengerConnected?: boolean;
  messengerPage?: string;
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
  acceptedPaymentMethods?: string[]; // Medios de pago habilitados: efectivo, pos, transferencia, billetera, qr
};
