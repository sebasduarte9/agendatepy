"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  CalendarPlus,
  Bell,
  Check,
  Smartphone,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { formatGs } from "@/lib/dashboard-dates";

interface SmartCalendarSyncProps {
  appointment: {
    serviceName: string;
    staffName: string;
    clientName: string;
    startTime: string | Date;
    endTime?: string | Date;
    price: number;
    durationMinutes?: number;
  };
  business: {
    name: string;
    address?: string;
    timezone?: string;
  };
}

export default function SmartCalendarSync({
  appointment,
  business,
}: SmartCalendarSyncProps) {
  const [device, setDevice] = useState<"android" | "ios" | "desktop">("desktop");
  const [downloadedIcs, setDownloadedIcs] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent.toLowerCase();
    if (/android/i.test(ua)) {
      setDevice("android");
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      setDevice("ios");
    } else {
      setDevice("desktop");
    }
  }, []);

  const tz = business.timezone || "America/Asuncion";
  const startDate = new Date(appointment.startTime);
  const duration = appointment.durationMinutes || 45;
  const endDate = appointment.endTime
    ? new Date(appointment.endTime)
    : new Date(startDate.getTime() + duration * 60_000);

  // Formato ISO compacto para URLs de calendario
  const startUtc = startDate.toISOString().replace(/-|:|\.\d+/g, "");
  const endUtc = endDate.toISOString().replace(/-|:|\.\d+/g, "");

  const title = encodeURIComponent(`Turno: ${appointment.serviceName} en ${business.name}`);
  const details = encodeURIComponent(
    `💈 Cita agendada en ${business.name}\n` +
      `✂️ Servicio: ${appointment.serviceName} (${formatGs(appointment.price)})\n` +
      `👤 Profesional: ${appointment.staffName}\n` +
      `📌 Cliente: ${appointment.clientName}\n\n` +
      `Recordatorio automático gestionado por AgendatePY.`
  );
  const location = encodeURIComponent(business.address || business.name);

  // 1. Google Calendar URL directa (para Android y navegadores)
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}`;

  // 2. Generador de archivo .ics con alarma de recordatorio 2 horas antes (para iOS / Apple Reminders & Calendar)
  const handleDownloadIcs = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AgendatePY//Turnos Online//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@agendate.py`,
      `SUMMARY:Turno: ${appointment.serviceName} - ${business.name}`,
      `DESCRIPTION:Turno con ${appointment.staffName} para ${appointment.clientName}. Total: Gs. ${new Intl.NumberFormat("es-PY").format(appointment.price)}.`,
      `DTSTART:${startUtc}`,
      `DTEND:${endUtc}`,
      `LOCATION:${business.address || business.name}`,
      "STATUS:CONFIRMED",
      // Alarmas de notificación: 24h antes y 2h antes (disparan aviso en iPhone, Apple Reminders y Calendarios)
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:Mañana: Recordatorio de turno para ${appointment.serviceName} en ${business.name}`,
      "END:VALARM",
      "BEGIN:VALARM",
      "TRIGGER:-PT2H",
      "ACTION:DISPLAY",
      `DESCRIPTION:En 2 horas: Tu turno para ${appointment.serviceName} en ${business.name}`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `turno_${business.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadedIcs(true);
    setTimeout(() => setDownloadedIcs(false), 3000);
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarPlus className="h-4 w-4 text-brand" />
          <span className="text-xs font-bold text-slate-900">
            Guardar Recordatorio en tu Calendario
          </span>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
          <Bell className="h-3 w-3 text-amber-500" /> Aviso 2h antes
        </span>
      </div>

      {/* Vista Inteligente según Dispositivo */}
      {device === "android" ? (
        /* Caso Android: Destacar Google Calendar */
        <div className="space-y-2">
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 active:scale-[0.99]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#ffffff"
                d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"
              />
            </svg>
            <span>Crear Recordatorio en Google Calendar</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
              Android
            </span>
          </a>

          <button
            type="button"
            onClick={handleDownloadIcs}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/60 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span>Descargar archivo .ics (Otros calendarios)</span>
          </button>
        </div>
      ) : device === "ios" ? (
        /* Caso iPhone / iOS: Destacar Apple Calendar / Recordatorios + Google Calendar */
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleDownloadIcs}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-md shadow-slate-900/25 transition hover:bg-black active:scale-[0.99]"
          >
            {downloadedIcs ? (
              <>
                <Check className="h-4 w-4 text-emerald-400 stroke-[3]" />
                <span className="text-emerald-300">¡Agregado a tu iPhone!</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4 fill-white" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.41-9.78-11.48-20.91-15.19-33.39-3.7-12.49-5.56-24.16-5.56-35.03 0-14.56 3.73-26.63 11.19-36.2 7.46-9.57 16.71-14.47 27.75-14.7 4.89 0 10.33 1.25 16.32 3.76 5.99 2.5 9.78 3.82 11.38 3.94 1.84-.23 5.92-1.63 12.24-4.22 6.31-2.58 11.66-3.76 16.05-3.53 12.38.65 22.42 5.09 30.13 13.33-10.88 6.53-16.2 15.68-15.96 27.46.24 9.35 3.88 17.13 10.92 23.35 7.04 6.21 15.35 9.77 24.94 10.67-2.14 6.64-4.8 13.43-7.98 20.36z" />
                </svg>
                <span>Agregar a Calendario / Recordatorios de Apple</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                  iPhone
                </span>
              </>
            )}
          </button>

          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <CalendarPlus className="h-3.5 w-3.5 text-blue-600" />
            <span>O abrir en Google Calendar</span>
          </a>
        </div>
      ) : (
        /* Caso Desktop / Tablet: Ambas opciones parejas */
        <div className="grid grid-cols-2 gap-2">
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/50 py-2.5 px-3 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-xs"
          >
            <CalendarPlus className="h-3.5 w-3.5 text-blue-600" />
            <span>Google Calendar</span>
          </a>

          <button
            type="button"
            onClick={handleDownloadIcs}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-xs"
          >
            <Calendar className="h-3.5 w-3.5 text-slate-700" />
            <span>Apple / Outlook (.ics)</span>
          </button>
        </div>
      )}
    </div>
  );
}
