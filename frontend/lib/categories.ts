/**
 * Contenido dinámico por rubro.
 * Editar acá cambia Hero, WhatsApp y el widget de reserva en toda la landing.
 */
export type CategoryId =
  | "peluqueria"
  | "odontologia"
  | "pilates"
  | "spas"
  | "medicos"
  | "veterinarias"
  | "gimnasios"
  | "talleres"
  | "padel";

export type ServiceOption = {
  id: string;
  name: string;
  duration: string;
  price: string;
};

export type CategoryContent = {
  id: CategoryId;
  label: string;
  emoji: string;
  businessName: string;
  heroExample: string;
  staffName: string;
  botIntro: string;
  timeSlots: string[];
  services: ServiceOption[];
  whatsapp: {
    confirmation: string;
    reminder24h: string;
    reminder2h: string;
  };
};

export const CATEGORIES: CategoryContent[] = [
  {
    id: "peluqueria",
    label: "Peluquerías & Barberías",
    emoji: "",
    businessName: "Studio Corte & Barba",
    heroExample: "Corte Degradé + Barba",
    staffName: "Marcos Benítez",
    botIntro: "¡Hola! Bienvenido/a a Studio Corte & Barba en Asunción.\n\nSeleccioná el servicio que deseás agendar hoy:",
    timeSlots: ["15:30 hs", "17:00 hs", "18:30 hs"],
    services: [
      { id: "corte", name: "Corte Clásico Degradé", duration: "30 min", price: "Gs. 60.000" },
      { id: "barba", name: "Perfilado de Barba Spa", duration: "25 min", price: "Gs. 40.000" },
      { id: "combo", name: "Corte + Barba Completo", duration: "50 min", price: "Gs. 90.000" },
    ],
    whatsapp: {
      confirmation:
        "Tu turno fue confirmado: Corte + Barba — Hoy 17:00 hs en Studio Corte & Barba.",
      reminder24h: "Recordatorio: Mañana es tu turno de Corte + Barba. ¿Necesitás reprogramar?",
      reminder2h: "Te esperamos en 2 horas en Studio Corte & Barba.",
    },
  },
  {
    id: "odontologia",
    label: "Odontología & Dental",
    emoji: "",
    businessName: "Clínica Dental Sonrisa",
    heroExample: "Limpieza con Ultrasonido",
    staffName: "Dra. Camila Ruiz",
    botIntro: "¡Hola! Bienvenido/a a Clínica Dental Sonrisa.\n\nSeleccioná el tipo de consulta que necesitás:",
    timeSlots: ["10:30 hs", "15:00 hs", "16:30 hs"],
    services: [
      { id: "limpieza", name: "Limpieza con Ultrasonido", duration: "40 min", price: "Gs. 120.000" },
      { id: "consulta", name: "Consulta y Diagnóstico", duration: "30 min", price: "Gs. 80.000" },
      { id: "blanqueamiento", name: "Blanqueamiento Dental", duration: "60 min", price: "Gs. 450.000" },
    ],
    whatsapp: {
      confirmation:
        "Tu turno fue confirmado: Limpieza Dental — Hoy 16:30 hs en Clínica Dental Sonrisa.",
      reminder24h: "Recordatorio: Mañana es tu turno en Clínica Dental Sonrisa.",
      reminder2h: "Te esperamos en 2 horas en Clínica Dental Sonrisa.",
    },
  },
  {
    id: "spas",
    label: "Estética & Spas",
    emoji: "",
    businessName: "Serena Spa & Relax",
    heroExample: "Masaje Descontracturante",
    staffName: "Lic. Paola Gómez",
    botIntro: "¡Hola! Bienvenida/o a Serena Spa & Relax.\n\nElegí el tratamiento que deseás disfrutar:",
    timeSlots: ["11:00 hs", "14:30 hs", "16:00 hs"],
    services: [
      { id: "masaje", name: "Masaje Descontracturante", duration: "50 min", price: "Gs. 140.000" },
      { id: "facial", name: "Limpieza Facial Profunda", duration: "50 min", price: "Gs. 160.000" },
      { id: "circuito", name: "Circuito Spa Relax Total", duration: "90 min", price: "Gs. 260.000" },
    ],
    whatsapp: {
      confirmation:
        "Tu turno fue confirmado: Masaje Descontracturante — Hoy 16:00 hs en Serena Spa.",
      reminder24h: "Recordatorio: Mañana es tu sesión de spa. ¿Confirmás tu asistencia?",
      reminder2h: "Tu cabina está lista en 2 horas en Serena Spa.",
    },
  },
  {
    id: "pilates",
    label: "Pilates & Fitness",
    emoji: "",
    businessName: "Studio Pilates Aura",
    heroExample: "Clase de Reformer",
    staffName: "Instructora Vale",
    botIntro: "¡Hola! Bienvenido/a a Studio Pilates Aura.\n\nElegí tu clase o modalidad:",
    timeSlots: ["08:00 hs", "18:00 hs", "19:15 hs"],
    services: [
      { id: "reformer", name: "Clase de Prueba Reformer", duration: "50 min", price: "Gs. 50.000" },
      { id: "pack8", name: "Pase Mensual 8 Clases", duration: "Mes", price: "Gs. 320.000" },
      { id: "libre", name: "Pase Libre Pilates & Yoga", duration: "Mes", price: "Gs. 420.000" },
    ],
    whatsapp: {
      confirmation:
        "Tu lugar fue reservado: Clase Reformer — Hoy 18:00 hs en Studio Pilates Aura.",
      reminder24h: "Recordatorio: Mañana es tu clase de Reformer. Te esperamos con ropa cómoda.",
      reminder2h: "Te esperamos en 2 horas en Studio Pilates Aura.",
    },
  },
  {
    id: "medicos",
    label: "Médicos & Especialistas",
    emoji: "",
    businessName: "Consultorio Dr. Benítez",
    heroExample: "Consulta Médica General",
    staffName: "Dr. Roberto Benítez",
    botIntro: "¡Hola! Bienvenido/a al consultorio médico.\n\nPor favor seleccioná el motivo de consulta:",
    timeSlots: ["09:30 hs", "11:00 hs", "16:00 hs"],
    services: [
      { id: "clinica", name: "Consulta Médica General", duration: "30 min", price: "Gs. 120.000" },
      { id: "control", name: "Control y Certificado", duration: "20 min", price: "Gs. 80.000" },
      { id: "tele", name: "Teleconsulta Online", duration: "25 min", price: "Gs. 100.000" },
    ],
    whatsapp: {
      confirmation:
        "Tu consulta fue agendada: Consulta Médica — Hoy 16:00 hs con Dr. Roberto Benítez.",
      reminder24h: "Recordatorio: Mañana es tu consulta médica. ¿Confirmás tu asistencia?",
      reminder2h: "Te esperamos en 2 horas en Consultorio Dr. Benítez.",
    },
  },
  {
    id: "gimnasios",
    label: "Gimnasios & Crossfit",
    emoji: "",
    businessName: "Iron Box Crossfit & Gym",
    heroExample: "Clase de Prueba Crossfit",
    staffName: "Recepción Iron Box",
    botIntro: "¡Hola! Bienvenido a Iron Box Asunción.\n\n¿Querés registrar tu clase de prueba o inscribirte a un plan?",
    timeSlots: ["07:00 hs (Mañana)", "18:00 hs (Tarde)", "19:30 hs (Noche)"],
    services: [
      { id: "prueba", name: "Clase de Prueba Gratis", duration: "60 min", price: "Gratis" },
      { id: "mensual", name: "Pase Libre Musculación", duration: "30 días", price: "Gs. 220.000" },
      { id: "crossfit", name: "Plan Full Crossfit", duration: "30 días", price: "Gs. 290.000" },
    ],
    whatsapp: {
      confirmation:
        "¡Inscripción confirmada! Te esperamos hoy 18:00 hs en Iron Box Asunción.",
      reminder24h: "Recordatorio: Mañana tenés clase en Iron Box. Traé toalla y botella de agua.",
      reminder2h: "Tu clase de Crossfit arranca en 2 horas en Iron Box.",
    },
  },
  {
    id: "veterinarias",
    label: "Veterinarias & Pets",
    emoji: "",
    businessName: "Veterinaria Vet Amigos",
    heroExample: "Consulta + Vacunación",
    staffName: "Dra. Sofía Vet",
    botIntro: "¡Hola! Bienvenido/a a Vet Amigos.\n\n¿Qué atención necesita tu mascota hoy?",
    timeSlots: ["10:00 hs", "14:30 hs", "16:00 hs"],
    services: [
      { id: "control", name: "Consulta y Diagnóstico", duration: "25 min", price: "Gs. 80.000" },
      { id: "vacuna", name: "Vacunación Anual + Libreta", duration: "20 min", price: "Gs. 110.000" },
      { id: "bano", name: "Baño y Corte Higiénico", duration: "60 min", price: "Gs. 75.000" },
    ],
    whatsapp: {
      confirmation:
        "Tu turno fue confirmado: Consulta Veterinaria — Hoy 14:30 hs en Vet Amigos.",
      reminder24h: "Recordatorio: Mañana es el turno de tu mascota en Vet Amigos.",
      reminder2h: "Te esperamos en 2 horas en Vet Amigos.",
    },
  },
  {
    id: "padel",
    label: "Canchas & Pádel",
    emoji: "",
    businessName: "Central Pádel Club",
    heroExample: "Alquiler Cancha Techada 90 min",
    staffName: "Cancha 1 (Techada)",
    botIntro: "¡Hola! Bienvenido/a a Central Pádel Club.\n\nSeleccioná tu turno de cancha o clase:",
    timeSlots: ["18:30 hs", "20:00 hs", "21:30 hs"],
    services: [
      { id: "cancha", name: "Alquiler Cancha 90 min", duration: "90 min", price: "Gs. 140.000" },
      { id: "clase", name: "Clase Particular con Pro", duration: "60 min", price: "Gs. 100.000" },
      { id: "nocturno", name: "Turno Nocturno Techado", duration: "90 min", price: "Gs. 160.000" },
    ],
    whatsapp: {
      confirmation:
        "Cancha confirmada: Cancha 1 Techada — Hoy 20:00 hs en Central Pádel Club.",
      reminder24h: "Recordatorio: Mañana tienen turno de pádel. ¿Pelotas y paletas listas?",
      reminder2h: "La cancha 1 queda lista en 2 horas en Central Pádel Club.",
    },
  },
  {
    id: "talleres",
    label: "Talleres & Servicios",
    emoji: "",
    businessName: "AutoPro Taller & Detailing",
    heroExample: "Mantenimiento / Cambio de Aceite",
    staffName: "Box 1 Express",
    botIntro: "¡Hola! Bienvenido a AutoPro Taller & Detailing.\n\n¿Qué servicio necesita tu vehículo?",
    timeSlots: ["08:30 hs", "10:30 hs", "14:00 hs"],
    services: [
      { id: "service", name: "Mantenimiento / Cambio Aceite", duration: "45 min", price: "Gs. 180.000" },
      { id: "lavado", name: "Lavado Detailing + Encerado", duration: "60 min", price: "Gs. 90.000" },
      { id: "diagnostico", name: "Diagnóstico Computarizado", duration: "30 min", price: "Gs. 120.000" },
    ],
    whatsapp: {
      confirmation:
        "Tu turno fue confirmado: Mantenimiento Express — Hoy 10:30 hs en AutoPro Taller.",
      reminder24h: "Recordatorio: Mañana recibimos tu vehículo en AutoPro Taller.",
      reminder2h: "Te esperamos en 2 horas en Box 1 de AutoPro Taller.",
    },
  },
];

export type TickerItem = {
  label: string;
  iconKey:
    | "scissors"
    | "smile"
    | "sparkles"
    | "activity"
    | "stethoscope"
    | "dumbbell"
    | "paw"
    | "wrench";
};

export const TICKER_ITEMS: TickerItem[] = [
  { label: "Peluquerías & Barberías", iconKey: "scissors" },
  { label: "Odontología & Salud Dental", iconKey: "smile" },
  { label: "Estética & Spas", iconKey: "sparkles" },
  { label: "Pilates & Fitness", iconKey: "activity" },
  { label: "Médicos & Especialistas", iconKey: "stethoscope" },
  { label: "Gimnasios & Entrenamiento", iconKey: "dumbbell" },
  { label: "Veterinarias & Pet Shops", iconKey: "paw" },
  { label: "Talleres & Servicios", iconKey: "wrench" },
];

export function getCategory(id: CategoryId): CategoryContent {
  return CATEGORIES.find((item) => item.id === id) ?? CATEGORIES[0];
}
