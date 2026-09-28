/**
 * business-readiness.ts
 *
 * Fuente de verdad centralizada para determinar si un negocio está listo
 * para recibir reservas públicas en línea (Fase 5.3).
 */

export interface TenantReadinessData {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  subdomain?: string | null;
  status?: string | null;
  services?: Array<{
    id?: string;
    name?: string;
    active?: boolean;
    durationMinutes?: number;
    durationMin?: number;
    price?: number;
  }> | null;
  staff?: Array<{
    id?: string;
    name?: string;
    active?: boolean;
    schedules?: Array<{
      dayOfWeek?: number;
      startTime?: any;
      endTime?: any;
    }> | null;
    schedulesCount?: number;
  }> | null;
  appointmentsCount?: number;
}

export interface MissingStep {
  id: "basic_info" | "service" | "staff" | "schedules" | "status";
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

export interface BusinessReadinessResult {
  isReady: boolean;
  status: "ready" | "needs_setup" | "inactive";
  score: number; // 0 a 100%
  checks: {
    hasBasicInfo: boolean;
    hasActiveService: boolean;
    hasActiveStaff: boolean;
    hasAvailability: boolean;
    isActive: boolean;
  };
  missingSteps: MissingStep[];
  hasFirstBooking: boolean;
  activeServicesCount: number;
  activeStaffCount: number;
}

/**
 * Evalúa exhaustivamente los requisitos operacionales para que un negocio pueda recibir reservas.
 */
export function getBusinessReadiness(data: TenantReadinessData): BusinessReadinessResult {
  const missingSteps: MissingStep[] = [];

  // 1. Información Básica (Nombre y Slug)
  const hasBasicInfo = Boolean(
    data.name &&
    data.name.trim().length >= 2 &&
    (data.slug || data.subdomain)
  );
  if (!hasBasicInfo) {
    missingSteps.push({
      id: "basic_info",
      title: "Nombre del negocio y enlace",
      description: "Asigná un nombre oficial y un identificador único para tu página.",
      actionLabel: "Configurar negocio",
      actionHref: "/dashboard/configuracion",
    });
  }

  // 2. Al menos 1 Servicio Activo con duración y precio válidos
  const activeServices = (data.services || []).filter((s) => {
    const isActive = s.active !== false;
    const duration = s.durationMinutes ?? s.durationMin ?? 0;
    const price = s.price ?? 0;
    return isActive && duration > 0 && price >= 0;
  });
  const hasActiveService = activeServices.length > 0;
  if (!hasActiveService) {
    missingSteps.push({
      id: "service",
      title: "Creá tu primer servicio",
      description: "Agregá al menos un servicio con duración y precio para tu catálogo.",
      actionLabel: "+ Crear servicio",
      actionHref: "/dashboard/servicios",
    });
  }

  // 3. Al menos 1 Profesional Activo
  const activeStaff = (data.staff || []).filter((m) => m.active !== false);
  const hasActiveStaff = activeStaff.length > 0;
  if (!hasActiveStaff) {
    missingSteps.push({
      id: "staff",
      title: "Configurá a tu equipo",
      description: "Agregá al menos un profesional habilitado para atender turnos.",
      actionLabel: "+ Agregar colaborador",
      actionHref: "/dashboard/equipo",
    });
  }

  // 4. Horarios y Disponibilidad Configurada
  // El negocio tiene disponibilidad si al menos un profesional activo tiene jornadas
  const hasAvailability = activeStaff.some((m) => {
    if (m.schedules && m.schedules.length > 0) return true;
    if (typeof m.schedulesCount === "number" && m.schedulesCount > 0) return true;
    // Si no se provee arreglo detallado de schedules pero hay staff activo en un tenant activo,
    // por defecto se asume disponibilidad Lun-Sáb salvo que se demuestre lo contrario
    if (!m.schedules && m.schedulesCount === undefined) return true;
    return false;
  });
  if (!hasAvailability && hasActiveStaff) {
    missingSteps.push({
      id: "schedules",
      title: "Definí los horarios de atención",
      description: "Configurá los días y horas hábiles de tus colaboradores.",
      actionLabel: "Configurar horarios",
      actionHref: "/dashboard/equipo",
    });
  }

  // 5. Estado del Negocio (No pausado ni suspendido)
  const isActive = data.status ? data.status === "ACTIVE" : true;
  if (!isActive) {
    missingSteps.push({
      id: "status",
      title: "Estado del negocio activo",
      description: "Tu local se encuentra actualmente en pausa o suspendido.",
      actionLabel: "Activar negocio",
      actionHref: "/dashboard/configuracion",
    });
  }

  // Cálculo de Progreso
  const totalChecks = 4;
  let passedChecks = 0;
  if (hasBasicInfo) passedChecks++;
  if (hasActiveService) passedChecks++;
  if (hasActiveStaff) passedChecks++;
  if (hasAvailability) passedChecks++;

  const score = Math.round((passedChecks / totalChecks) * 100);
  const isReady = hasBasicInfo && hasActiveService && hasActiveStaff && hasAvailability && isActive;

  const hasFirstBooking = (data.appointmentsCount || 0) > 0;

  return {
    isReady,
    status: !isActive ? "inactive" : isReady ? "ready" : "needs_setup",
    score,
    checks: {
      hasBasicInfo,
      hasActiveService,
      hasActiveStaff,
      hasAvailability,
      isActive,
    },
    missingSteps,
    hasFirstBooking,
    activeServicesCount: activeServices.length,
    activeStaffCount: activeStaff.length,
  };
}

/**
 * Función booleana rápida reutilizable en frontend y backend.
 */
export function isBusinessReadyForBooking(data: TenantReadinessData): boolean {
  return getBusinessReadiness(data).isReady;
}
