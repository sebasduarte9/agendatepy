"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CalendarPlus,
  MessageCircle,
  Award,
  Copy,
  Check,
  Star,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { cancelAppointmentAction } from "@/lib/scheduling/actions";
import { formatGs } from "@/lib/dashboard-dates";
import SmartCalendarSync from "@/components/booking/SmartCalendarSync";

type Props = {
  appointment: {
    id: string;
    clientName: string;
    clientPhone: string;
    startTime: string; // ISO
    endTime: string; // ISO
    status: string;
    service: {
      name: string;
      durationMinutes: number;
      price: number;
    };
    staff: {
      name: string;
    };
    tenant: {
      name: string;
      subdomain: string;
      timezone: string;
      whatsappPhone: string | null;
      address?: string;
    };
  };
};

export default function ClientAppointmentManager({ appointment }: Props) {
  const [status, setStatus] = useState(appointment.status);
  const [isPending, startTransition] = useTransition();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copiedSipap, setCopiedSipap] = useState(false);

  const tenant = appointment.tenant;
  const time = formatInTimeZone(appointment.startTime, tenant.timezone, "HH:mm");
  const endTimeFormatted = formatInTimeZone(appointment.endTime, tenant.timezone, "HH:mm");
  const dateFormatted = formatInTimeZone(
    appointment.startTime,
    tenant.timezone,
    "EEEE d 'de' MMMM, yyyy",
    { locale: es }
  );

  // Google Calendar URL generation
  // WhatsApp contact link
  const waText = encodeURIComponent(
    `Hola ${tenant.name}, soy ${appointment.clientName}. Te escribo respecto a mi turno de ${appointment.service.name} para el ${dateFormatted} a las ${time} hs.`
  );
  const waUrl = tenant.whatsappPhone
    ? `https://wa.me/${tenant.whatsappPhone}?text=${waText}`
    : null;

  function handleCancel() {
    startTransition(async () => {
      const res = await cancelAppointmentAction(appointment.id, tenant.subdomain);
      if (res.ok) {
        setStatus("CANCELLED");
        setMessage(res.message);
      } else {
        setMessage(res.message);
      }
      setShowCancelModal(false);
    });
  }

  const isCancelled = status === "CANCELLED";
  const isConfirmed = status === "CONFIRMED";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-between px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            {tenant.name}
          </span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            {isCancelled ? "Turno Cancelado" : "Gestión de tu Turno"}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {isCancelled
              ? "Este horario ha sido liberado en la agenda."
              : "Revisá los detalles de tu cita o agregala a tu calendario."}
          </p>
        </div>

        {/* Status Alert */}
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-xs font-semibold ${
            isCancelled
              ? "bg-rose-50 text-rose-800 border border-rose-200"
              : isConfirmed
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          {isCancelled ? (
            <XCircle className="h-5 w-5 shrink-0 text-rose-600" />
          ) : isConfirmed ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          )}
          <div>
            <p className="font-bold">
              {isCancelled
                ? "Turno Cancelado"
                : isConfirmed
                ? "¡Turno Confirmado!"
                : "Pendiente de Confirmación"}
            </p>
            <p className="text-[11px] font-normal opacity-90 mt-0.5">
              {message
                ? message
                : isCancelled
                ? "El turno no se llevará a cabo. Podés agendar uno nuevo cuando quieras."
                : isConfirmed
                ? "Te esperamos con todo listo para atenderte puntualmente."
                : "Recordá confirmar por WhatsApp antes de que expire tu reserva temporal."}
            </p>
          </div>
        </div>

        {/* Appointment Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              Servicio Solicitado
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {appointment.service.name}
              </h2>
              <span className="font-black text-primary text-base">
                {formatGs(appointment.service.price)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Duración aproximada: {appointment.service.durationMinutes} minutos
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="capitalize font-medium text-slate-900">{dateFormatted}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-slate-400 shrink-0" />
              <span>
                <strong>{time} hs</strong> a {endTimeFormatted} hs
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <User className="h-4 w-4 text-slate-400 shrink-0" />
              <span>
                Profesional: <strong>{appointment.staff.name}</strong>
              </span>
            </div>
            {tenant.address && (
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-600">{tenant.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Digital Loyalty Club Card (VIP Stamps) */}
        {!isCancelled && (
          <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-4.5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-900">Club VIP · Tarjeta de Sellos</span>
              </div>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-800">
                4 / 5 Visitas
              </span>
            </div>

            {/* Digital stamps */}
            <div className="flex items-center justify-between gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`flex h-9 flex-1 items-center justify-center rounded-xl text-sm font-black transition ${
                    s <= 4
                      ? "bg-amber-400 text-slate-950 shadow-xs scale-105"
                      : "border-2 border-dashed border-amber-300 bg-white/60 text-amber-300"
                  }`}
                >
                  <Star className={`h-4 w-4 ${s <= 4 ? "fill-slate-950 text-slate-950" : "text-amber-300"}`} />
                </div>
              ))}
            </div>

            <p className="text-[11px] text-amber-900 font-medium leading-tight">
              ¡Completá <strong>1 visita más</strong> para acceder a tu <strong>50% de descuento</strong> en tu próximo servicio!
            </p>
          </div>
        )}

        {/* SIPAP Bank Transfer Card */}
        {!isCancelled && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900">Datos para Transferencia SIPAP</span>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText("agendate.py");
                  setCopiedSipap(true);
                  setTimeout(() => setCopiedSipap(false), 2000);
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-700 transition"
              >
                {copiedSipap ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedSipap ? "Copiado" : "Copiar Alias"}
              </button>
            </div>
            <div className="text-[11px] text-emerald-800 space-y-0.5">
              <p>Banco: <strong>Banco Itaú Paraguay</strong></p>
              <p>Alias SIPAP: <strong>agendate.py</strong></p>
              <p>Titular: <strong>{tenant.name}</strong></p>
              <p className="text-[10px] text-emerald-700/90 pt-1">
                Podés transferir el importe ({formatGs(appointment.service.price)}) y enviar tu comprobante por WhatsApp.
              </p>
            </div>
          </div>
        )}

        {/* Calendar Sync Inteligente (Android Google Calendar / iPhone Apple Reminders) */}
        {!isCancelled && (
          <SmartCalendarSync
            appointment={{
              serviceName: appointment.service.name,
              staffName: appointment.staff.name,
              clientName: appointment.clientName,
              startTime: appointment.startTime,
              endTime: appointment.endTime,
              price: appointment.service.price,
              durationMinutes: appointment.service.durationMinutes,
            }}
            business={{
              name: tenant.name,
              address: tenant.address || undefined,
              timezone: tenant.timezone,
            }}
          />
        )}

        {!isCancelled && (
          <div className="space-y-3">

            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <MessageCircle className="h-4 w-4" />
                Hablar con el Local por WhatsApp
              </a>
            )}

            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="w-full rounded-2xl border border-rose-200 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
            >
              Cancelar mi Turno
            </button>
          </div>
        )}

        {isCancelled && (
          <Link
            href={`/${tenant.subdomain}/reservar`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-white shadow-sm hover:opacity-95 transition"
          >
            Agendar un Nuevo Turno
          </Link>
        )}
      </div>

      {/* Footer Branding */}
      <div className="mt-8 text-center text-xs text-slate-400">
        <p>Sistema de gestión y reservas provisto por</p>
        <p className="font-bold text-slate-600 mt-0.5">AgendatePY</p>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl space-y-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">¿Cancelar tu turno?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Al cancelar, el horario quedará libre de inmediato para que otra persona pueda tomarlo.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Volver
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleCancel}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-40"
              >
                {isPending ? "Cancelando..." : "Sí, Cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
