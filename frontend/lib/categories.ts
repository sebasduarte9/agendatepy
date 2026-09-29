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
    heroExample: "Corte + Barba",
    services: [
      { id: "corte", name: "Corte de cabello", duration: "30 min", price: "Gs. 80.000" },
      { id: "barba", name: "Corte + Barba", duration: "45 min", price: "Gs. 110.000" },
      { id: "color", name: "Color / Mechas", duration: "90 min", price: "Gs. 250.000" },
    ],
    whatsapp: {
      confirmation:
        "Tu turno fue confirmado: Corte + Barba — Viernes 10:00hs en Studio Corte & Barba.",
      reminder24h: "Recordatorio: Mañana es tu turno de Corte + Barba. ¿Necesitás reprogramar?",
      reminder2h: "Te esperamos en 2 horas en Studio Corte & Barba.",
    },
  },
  {
    id: "odontologia",
    label: "Odontología & Dental",
    emoji: "",
    businessName: "Clínica Dental Sonrisa",
    heroExample: "Turno para Limpieza Dental",
    services: [
      { id: "consulta", name: "Consulta dental", duration: "30 min", price: "Gs. 150.000" },
      { id: "limpieza", name: "Limpieza dental", duration: "45 min", price: "Gs. 280.000" },
      { id: "blanqueamiento", name: "Blanqueamiento", duration: "60 min", price: "Gs. 450.000" },
    ],
    whatsapp: {
      confirmation:
        "Tu turno fue confirmado: Limpieza Dental — Viernes 10:00hs en Clínica Dental Sonrisa.",
      reminder24h: "Recordatorio: Mañana es tu turno de Limpieza Dental. ¿Necesitás reprogramar?",
      reminder2h: "Te esperamos en 2 horas en Clínica Dental Sonrisa.",
    },
  },
  {
    id: "spas",
    label: "Estética & Spas",
    emoji: "",
    businessName: "Spa Luz & Calma",
    heroExample: "Masaje relajante 60 min",
    services: [
      { id: "masaje", name: "Masaje relajante", duration: "60 min", price: "Gs. 220.000" },
      { id: "facial", name: "Limpieza facial", duration: "50 min", price: "Gs. 180.000" },
      { id: "combo", name: "Ritual spa", duration: "90 min", price: "Gs. 350.000" },
    ],
    whatsapp: {
      confirmation:
        "Tu turno fue confirmado: Masaje relajante 60 min — Viernes 10:00hs en Spa Luz & Calma.",
      reminder24h: "Recordatorio: Mañana es tu masaje relajante. ¿Necesitás reprogramar?",
      reminder2h: "Te esperamos en 2 horas en Spa Luz & Calma.",
    },
  },
  {
    id: "pilates",
    label: "Pilates & Fitness",
    emoji: "",
    businessName: "Studio Pilates Aura",
    heroExample: "Clase de Reformer",
    services: [
      { id: "reformer", name: "Clase de Reformer", duration: "50 min", price: "Gs. 90.000" },
      { id: "mat", name: "Pilates Mat", duration: "50 min", price: "Gs. 70.000" },
      { id: "privado", name: "Sesión privada", duration: "55 min", price: "Gs. 160.000" },
    ],
    whatsapp: {
      confirmation:
        "Tu turno fue confirmado: Clase de Reformer — Viernes 10:00hs en Studio Pilates Aura.",
      reminder24h: "Recordatorio: Mañana es tu clase de Reformer. ¿Necesitás reprogramar?",
      reminder2h: "Te esperamos en 2 horas en Studio Pilates Aura.",
    },
  },
  {
    id: "medicos",
    label: "Médicos & Especialistas",
    emoji: "",
    businessName: "Consultorio Dr. Benítez",
    heroExample: "Consulta clínica",
    services: [
      { id: "clinica", name: "Consulta clínica", duration: "30 min", price: "Gs. 200.000" },
      { id: "control", name: "Control de seguimiento", duration: "20 min", price: "Gs. 150.000" },
      { id: "tele", name: "Teleconsulta", duration: "25 min", price: "Gs. 180.000" },
    ],
    whatsapp: {
      confirmation:
        "Tu turno fue confirmado: Consulta clínica — Viernes 10:00hs en Consultorio Dr. Benítez.",
      reminder24h: "Recordatorio: Mañana es tu consulta clínica. ¿Necesitás reprogramar?",
      reminder2h: "Te esperamos en 2 horas en Consultorio Dr. Benítez.",
    },
  },
  {
    id: "gimnasios",
    label: "Gimnasios & Crossfit",
    emoji: "",
    businessName: "Iron Box Asunción",
    heroExample: "Clase de Crossfit / Funcional",
    services: [
      { id: "crossfit", name: "Clase de Crossfit", duration: "60 min", price: "Gs. 50.000" },
      { id: "mensual", name: "Pase Libre Mensual", duration: "30 días", price: "Gs. 280.000" },
      { id: "personal", name: "Sesión Personal Trainer", duration: "60 min", price: "Gs. 120.000" },
    ],
    whatsapp: {
      confirmation:
        "Tu turno fue confirmado: Clase de Crossfit — Viernes 10:00hs en Iron Box Asunción.",
      reminder24h: "Recordatorio: Mañana es tu clase en Iron Box. ¿Confirmás asistencia?",
      reminder2h: "Te esperamos en 2 horas en Iron Box Asunción.",
    },
  },
  {
    id: "veterinarias",
    label: "Veterinarias & Pets",
    emoji: "",
    businessName: "Vet Amigos",
    heroExample: "Control + vacunación",
    services: [
      { id: "control", name: "Control general", duration: "25 min", price: "Gs. 120.000" },
      { id: "vacuna", name: "Control + vacunación", duration: "30 min", price: "Gs. 160.000" },
      { id: "peluqueria", name: "Peluquería canina", duration: "60 min", price: "Gs. 140.000" },
    ],
    whatsapp: {
      confirmation:
        "Tu turno fue confirmado: Control + vacunación — Viernes 10:00hs en Vet Amigos.",
      reminder24h: "Recordatorio: Mañana es el control de tu mascota. ¿Necesitás reprogramar?",
      reminder2h: "Te esperamos en 2 horas en Vet Amigos.",
    },
  },
  {
    id: "padel",
    label: "Canchas & Pádel",
    emoji: "",
    businessName: "Central Pádel Club",
    heroExample: "Turno Cancha Central 90 min",
    services: [
      { id: "cancha", name: "Alquiler Cancha 90 min", duration: "90 min", price: "Gs. 160.000" },
      { id: "clase", name: "Clase con Profesor", duration: "60 min", price: "Gs. 120.000" },
      { id: "torneo", name: "Inscripción Torneo", duration: "120 min", price: "Gs. 100.000" },
    ],
    whatsapp: {
      confirmation:
        "Tu turno fue confirmado: Alquiler Cancha 90 min — Viernes 10:00hs en Central Pádel Club.",
      reminder24h: "Recordatorio: Mañana juegan en Cancha Central. ¿Confirmás el turno?",
      reminder2h: "La cancha está lista en 2 horas en Central Pádel Club.",
    },
  },
  {
    id: "talleres",
    label: "Talleres & Servicios",
    emoji: "",
    businessName: "AutoPro Detailing",
    heroExample: "Lavado Premium + Encerado",
    services: [
      { id: "lavado", name: "Lavado Detailing", duration: "60 min", price: "Gs. 100.000" },
      { id: "pulido", name: "Pulido y Encerado", duration: "120 min", price: "Gs. 350.000" },
      { id: "service", name: "Mantenimiento Express", duration: "45 min", price: "Gs. 180.000" },
    ],
    whatsapp: {
      confirmation:
        "Tu turno fue confirmado: Lavado Detailing — Viernes 10:00hs en AutoPro Detailing.",
      reminder24h: "Recordatorio: Mañana recibimos tu vehículo en AutoPro Detailing.",
      reminder2h: "Te esperamos en 2 horas en AutoPro Detailing.",
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
