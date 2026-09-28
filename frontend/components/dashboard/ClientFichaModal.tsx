"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Calendar,
  Camera,
  Video,
  Plus,
  Trash2,
  ExternalLink,
  Award,
  CheckCircle2,
  Clock,
  User,
  Scissors,
  Phone,
  MessageCircle,
  Crown,
  Check,
  Play,
  Maximize2,
  Zap,
  Tag,
  AlertCircle,
  FileText,
  X,
  CreditCard,
  Building,
  ShieldCheck,
  CalendarPlus,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import Modal from "./ui/Modal";
import { formatGs, normalizeParaguayPhone } from "@/lib/dashboard-dates";
import {
  compressClientImage,
  readClientVideo,
  type CompressedImageResult,
} from "@/lib/media-compression";
import type {
  Client,
  ClientMedia,
  ClientMediaType,
  ClientMediaTag,
} from "@/lib/dashboard-types";

type Props = {
  client: Client | null;
  onClose: () => void;
  onOpenEdit: (c: Client) => void;
  onOpenQuickBooking?: (c: Client) => void;
};

export default function ClientFichaModal({ client, onClose, onOpenEdit, onOpenQuickBooking }: Props) {
  const {
    appointments,
    services,
    staff,
    business,
    cashMovements,
    loyalty,
    updateClient,
    addClientMedia,
    deleteClientMedia,
    pushToast,
  } = useDashboardStore();

  const [activeTab, setActiveTab] = useState<"visitas" | "galeria" | "formula" | "vip">("visitas");
  const [galleryFilter, setGalleryFilter] = useState<"todos" | ClientMediaTag | "video">("todos");

  // Media upload modal / form states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<ClientMediaType>("image");
  const [uploadTag, setUploadTag] = useState<ClientMediaTag>("Resultado");
  const [uploadTitle, setUploadTitle] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressedImageResult | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);

  // Lightbox / Video player modal state
  const [viewingMedia, setViewingMedia] = useState<ClientMedia | null>(null);

  // Formula quick edit
  const [isEditingFormula, setIsEditingFormula] = useState(false);
  const [formulaText, setFormulaText] = useState("");
  const [notesText, setNotesText] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function startEditingFormula() {
    setFormulaText(client?.formula || "");
    setNotesText(client?.notes || "");
    setIsEditingFormula(true);
  }

  const clientNormPhone = client ? normalizeParaguayPhone(client.phone) : "";

  // Todas las citas pertenecientes a este cliente ordenadas de más reciente a más antigua
  const clientAppointments = useMemo(() => {
    if (!client) return [];
    return appointments
      .filter((a) => {
        if (a.clientId && a.clientId === client.id) return true;
        if (clientNormPhone && normalizeParaguayPhone(a.clientPhone) === clientNormPhone) return true;
        return (
          a.clientPhone === client.phone ||
          a.clientName.toLowerCase() === client.name.toLowerCase()
        );
      })
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  }, [client, appointments, clientNormPhone]);

  // Citas completadas (regla estricta: solo COMPLETED cuenta como visita)
  const completedVisits = useMemo(() => {
    return clientAppointments.filter((a) => a.status === "completed");
  }, [clientAppointments]);

  // Última visita completada
  const lastCompletedApp = completedVisits[0] || null;

  // Próxima cita futura válida (no cancelada, no ausente, no expirada)
  const nextApp = useMemo(() => {
    const now = Date.now();
    const future = clientAppointments
      .filter(
        (a) =>
          new Date(a.start).getTime() > now &&
          a.status !== "cancelled" &&
          a.status !== "no_show" &&
          a.status !== "expired"
      )
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    return future[0] || null;
  }, [clientAppointments]);

  // Total gastado: cobros reales de caja (CashMovement) asociados a las citas de este cliente
  const clientTotalSpent = useMemo(() => {
    const appIds = new Set(clientAppointments.map((a) => a.id));
    let total = 0;
    for (const cm of cashMovements) {
      if (cm.type === "ingreso" && cm.appointmentId && appIds.has(cm.appointmentId)) {
        total += cm.amount;
      }
    }
    return total;
  }, [clientAppointments, cashMovements]);

  // Visit statistics
  const visitStats = useMemo(() => {
    if (completedVisits.length === 0) {
      return { preferredStaff: "Sin visitas", topService: "Sin visitas", avgTicket: 0 };
    }

    const staffCounts: Record<string, number> = {};
    const serviceCounts: Record<string, number> = {};

    for (const v of completedVisits) {
      staffCounts[v.staffId] = (staffCounts[v.staffId] || 0) + 1;
      serviceCounts[v.serviceId] = (serviceCounts[v.serviceId] || 0) + 1;
    }

    const topStaffId = Object.entries(staffCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topServiceId = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    const staffObj = staff.find((st) => st.id === topStaffId);
    const serviceObj = services.find((sv) => sv.id === topServiceId);

    return {
      preferredStaff: staffObj?.name || "Varios profesionales",
      topService: serviceObj?.name || "Varios servicios",
      avgTicket: completedVisits.length > 0 ? Math.round(clientTotalSpent / completedVisits.length) : 0,
    };
  }, [completedVisits, clientTotalSpent, services, staff]);

  // Alias para retrocompatibilidad
  const clientVisits = clientAppointments;

  // Filtered gallery
  const filteredGallery = useMemo(() => {
    if (!client || !client.gallery) return [];
    return client.gallery.filter((m) => {
      if (galleryFilter === "todos") return true;
      if (galleryFilter === "video") return m.type === "video";
      return m.tag === galleryFilter;
    });
  }, [client, galleryFilter]);

  if (!client) return null;

  // Handle image file selection with HTML5 Canvas automatic compression
  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      if (uploadType === "image") {
        // Comprime la imagen en el cliente (de 4MB+ a ~80KB WebP)
        const compressed = await compressClientImage(file, 1280, 1280, 0.82);
        setCompressionStats(compressed);
        setSelectedFilePreview(compressed.dataUrl);
      } else {
        // Video file
        const vid = await readClientVideo(file);
        setSelectedFilePreview(vid.url);
        setCompressionStats({
          dataUrl: vid.url,
          originalSizeKb: vid.sizeKb,
          compressedSizeKb: vid.sizeKb,
          savingsPercent: 0,
          width: 0,
          height: 0,
          format: "jpeg",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      pushToast("error", `Error al procesar el archivo: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  }

  // Save new media into client gallery
  function handleSaveMedia() {
    if (!client) return;
    if (!uploadTitle.trim()) {
      pushToast("error", "Por favor ingresá un título o descripción para el archivo.");
      return;
    }

    const finalUrl = uploadType === "video" && videoUrlInput.trim()
      ? videoUrlInput.trim()
      : selectedFilePreview;

    if (!finalUrl) {
      pushToast("error", "Seleccioná un archivo de foto/video o ingresá un enlace.");
      return;
    }

    addClientMedia(client.id, {
      type: uploadType,
      url: finalUrl,
      title: uploadTitle.trim(),
      tag: uploadTag,
      sizeKb: compressionStats?.compressedSizeKb || 120,
      originalSizeKb: compressionStats?.originalSizeKb || (compressionStats?.compressedSizeKb ? compressionStats.compressedSizeKb * 5 : 600),
    });

    // Reset upload form
    setUploadModalOpen(false);
    setUploadTitle("");
    setVideoUrlInput("");
    setSelectedFilePreview(null);
    setCompressionStats(null);
  }

  function handleSaveFormula() {
    if (!client) return;
    updateClient(client.id, {
      formula: formulaText.trim(),
      notes: notesText.trim(),
    });
    setIsEditingFormula(false);
    pushToast("success", "Fórmula técnica y notas actualizadas.");
  }

  return (
    <>
      <Modal
        open={Boolean(client)}
        title=""
        onClose={onClose}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-5 -mt-2">
          {/* Header Profile Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-purple-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/40 border border-slate-200/80 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white font-black text-lg shadow-md shadow-primary/20">
                {client.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {client.name}
                  </h2>
                  {client.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-extrabold px-2 py-0.5"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <Phone className="h-3 w-3 text-emerald-500" /> {client.phone}
                  </span>
                  {client.instagram && (
                    <span className="text-pink-600 dark:text-pink-400 font-semibold">
                      IG: {client.instagram}
                    </span>
                  )}
                  {client.email && <span>{client.email}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenQuickBooking ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenQuickBooking(client);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-primary hover:opacity-95 text-white px-3.5 py-2 text-xs font-bold shadow-md transition cursor-pointer"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Agendar Turno</span>
                </button>
              ) : (
                <Link
                  href={`/dashboard/calendario?newForClient=${client.id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-primary hover:opacity-95 text-white px-3.5 py-2 text-xs font-bold shadow-md transition"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Nueva Cita</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEdit(client);
                }}
                className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-2xs"
              >
                Editar
              </button>
            </div>
          </div>

          {/* Resumen Operacional: Visitas (COMPLETED), Última Visita, Total Gastado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-2xs">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Visitas Realizadas
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {completedVisits.length}
              </p>
              <span className="text-[10px] text-slate-500 font-medium">Turnos completados</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-2xs">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Última Visita
              </span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">
                {lastCompletedApp
                  ? formatInTimeZone(lastCompletedApp.start, business.timezone || "America/Asuncion", "dd MMM yyyy · HH:mm 'hs'")
                  : "Sin visitas"}
              </p>
              <span className="text-[10px] text-slate-500 font-medium">Histórico</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-2xs">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Gastado
              </span>
              <p className="text-xl font-black text-primary mt-0.5">
                {formatGs(clientTotalSpent)}
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium font-mono">Cobrado en caja</span>
            </div>
          </div>

          {/* Próxima Cita Banner */}
          {nextApp ? (
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      Próxima Cita Programada
                    </span>
                    <span className="rounded-full bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100 text-[10px] font-extrabold px-2 py-0.5">
                      {nextApp.status === "confirmed" ? "Confirmado" : nextApp.status}
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {services.find((s) => s.id === nextApp.serviceId)?.name || "Servicio"} ·{" "}
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {staff.find((st) => st.id === nextApp.staffId)?.name || "Profesional"}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatInTimeZone(nextApp.start, business.timezone || "America/Asuncion", "EEEE dd 'de' MMMM · HH:mm 'hs'")}
                  </p>
                </div>
              </div>

              <Link
                href={`/dashboard/calendario?appointmentId=${nextApp.id}`}
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition shrink-0"
              >
                <span>Ver en agenda</span>
                <span>→</span>
              </Link>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Sin próximas citas agendadas</span>
              </span>
              {onOpenQuickBooking ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenQuickBooking(client);
                  }}
                  className="font-bold text-primary hover:underline cursor-pointer"
                >
                  + Agendar cita
                </button>
              ) : (
                <Link
                  href={`/dashboard/calendario?newForClient=${client.id}`}
                  onClick={onClose}
                  className="font-bold text-primary hover:underline"
                >
                  + Agendar cita
                </Link>
              )}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-white/5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("visitas")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition ${
                activeTab === "visitas"
                  ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Historial ({clientAppointments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("formula")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition ${
                activeTab === "formula"
                  ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Ficha Técnica & Notas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("galeria")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition ${
                activeTab === "galeria"
                  ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Camera className="h-3.5 w-3.5 text-pink-500" />
              <span>Galería & Videos ({client.gallery?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("vip")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition ${
                activeTab === "vip"
                  ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Award className="h-3.5 w-3.5 text-emerald-500" />
              <span>Club VIP ({client.loyaltyPoints} sellos)</span>
            </button>
          </div>

          {/* TAB 1: HISTORIAL DE VISITAS DETALLADO */}
          {activeTab === "visitas" && (
            <div className="space-y-4">
              {/* Visit Stats Metric Deck */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                    Profesional Frecuente
                  </span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {visitStats.preferredStaff}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                    Servicio Más Solicitado
                  </span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {visitStats.topService}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                    Ticket Promedio por Visita
                  </span>
                  <p className="text-sm font-extrabold text-primary mt-0.5">
                    {formatGs(visitStats.avgTicket)}
                  </p>
                </div>
              </div>

              {/* Visit Timeline List */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {clientAppointments.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                    <p>No se registran citas pasadas ni futuras para este cliente.</p>
                    {onOpenQuickBooking ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenQuickBooking(client);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-white px-3.5 py-2 text-xs font-bold hover:opacity-95 transition cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Agendar primera cita</span>
                      </button>
                    ) : (
                      <Link
                        href={`/dashboard/calendario?newForClient=1&clientName=${encodeURIComponent(client.name)}&clientPhone=${encodeURIComponent(client.phone)}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-white px-3 py-1.5 text-xs font-bold"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Agendar primera cita</span>
                      </Link>
                    )}
                  </div>
                ) : (
                  clientAppointments.map((visit, index) => {
                    const service = services.find((s) => s.id === visit.serviceId);
                    const staffMember = staff.find((st) => st.id === visit.staffId);
                    const payment = cashMovements.find(
                      (cm) => cm.appointmentId === visit.id && cm.type === "ingreso"
                    );

                    return (
                      <div
                        key={visit.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 hover:border-primary/40 transition shadow-2xs space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-100 dark:border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary font-black text-[11px]">
                              #{clientAppointments.length - index}
                            </span>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {service?.name || "Servicio"}
                            </h4>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {service?.durationMin || 45} min
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            {payment ? (
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                Cobrado: {formatGs(payment.amount)}
                              </span>
                            ) : (
                              <span className="font-mono font-medium text-slate-500">
                                {formatGs(service?.price || 0)}
                              </span>
                            )}
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                                visit.status === "completed"
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                                  : visit.status === "confirmed"
                                  ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400"
                                  : visit.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : visit.status === "no_show"
                                  ? "bg-rose-100 text-rose-800 font-extrabold"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {visit.status === "completed"
                                ? "Completado"
                                : visit.status === "confirmed"
                                ? "Confirmado"
                                : visit.status === "cancelled"
                                ? "Cancelado"
                                : visit.status === "no_show"
                                ? "No Asistió"
                                : visit.status}
                            </span>
                          </div>
                        </div>

                        {/* Details row: Date, Staff, Payment, Link */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5 sm:col-span-2">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {formatInTimeZone(
                                visit.start,
                                business.timezone || "America/Asuncion",
                                "dd 'de' MMMM, yyyy · HH:mm 'hs'"
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-indigo-500" />
                            <span>Atendido: <strong>{staffMember?.name || "Profesional"}</strong></span>
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            {onOpenQuickBooking && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onOpenQuickBooking(client);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition cursor-pointer"
                                title="Reagendar turno para este cliente"
                              >
                                <CalendarPlus className="h-3 w-3" />
                                <span>Reagendar</span>
                              </button>
                            )}
                            <Link
                              href={`/dashboard/calendario?appointmentId=${visit.id}`}
                              onClick={onClose}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                            >
                              <span>Ver en agenda</span>
                              <span>→</span>
                            </Link>
                          </div>
                        </div>

                        {/* Session Technical Notes if present */}
                        {visit.notes && (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                            <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <p className="italic leading-relaxed">{visit.notes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GALERÍA MULTIMEDIA OPTIMIZADA (FOTOS & VIDEOS) */}
          {activeTab === "galeria" && (
            <div className="space-y-4">
              {/* Top Controls: Filter Pills & Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {(["todos", "Antes", "Después", "Resultado", "Proceso", "video"] as const).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setGalleryFilter(tag)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition capitalize shrink-0 ${
                        galleryFilter === tag
                          ? "bg-primary text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {tag === "video" ? "Videos" : tag}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setUploadModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-primary hover:opacity-95 text-white px-4 py-2 text-xs font-bold shadow-md transition shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Subir Foto o Video</span>
                </button>
              </div>

              {/* Gallery Grid */}
              {filteredGallery.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-6">
                  <Camera className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Aún no hay fotos o videos en esta categoría.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    Subí fotos de antes y después o videos en cámara lenta. El sistema comprime las imágenes automáticamente para que no ocupen espacio.
                  </p>
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(true)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary/10 text-primary font-bold px-3 py-1.5 text-xs hover:bg-primary/20 transition"
                  >
                    <Plus className="h-3.5 w-3.5" /> Agregar Primer Trabajo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[420px] overflow-y-auto pr-1">
                  {filteredGallery.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/60 dark:border-white/10 shadow-xs flex flex-col cursor-pointer"
                      onClick={() => setViewingMedia(item)}
                    >
                      {/* Media Thumbnail */}
                      <div className="relative aspect-square w-full overflow-hidden bg-slate-950">
                        {item.type === "video" ? (
                          <div className="relative h-full w-full flex items-center justify-center bg-slate-900">
                            {item.thumbnailUrl ? (
                              <img
                                src={item.thumbnailUrl}
                                alt={item.title}
                                className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition duration-300"
                              />
                            ) : (
                              <video
                                src={item.url}
                                className="h-full w-full object-cover opacity-70"
                                preload="metadata"
                              />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition">
                              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-md group-hover:scale-110 transition">
                                <Play className="h-4 w-4 fill-current ml-0.5" />
                              </span>
                            </div>
                            <span className="absolute top-2 left-2 rounded-full bg-red-600 text-white text-[9px] font-black px-2 py-0.5 tracking-wider uppercase shadow-xs">
                              Video
                            </span>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        )}

                        {/* Tag Pill */}
                        <span
                          className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[9.5px] font-black text-white shadow-xs ${
                            item.tag === "Antes"
                              ? "bg-amber-600/90"
                              : item.tag === "Después" || item.tag === "Resultado"
                              ? "bg-emerald-600/90"
                              : "bg-indigo-600/90"
                          }`}
                        >
                          {item.tag}
                        </span>

                        {/* Space saved indicator pill */}
                        {item.sizeKb && (
                          <span className="absolute bottom-2 left-2 rounded-md bg-black/70 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 inline-flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5 text-amber-400" />
                            {item.sizeKb} KB
                          </span>
                        )}
                      </div>

                      {/* Info & delete bar */}
                      <div className="p-2.5 bg-white dark:bg-slate-900 flex items-center justify-between gap-1">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.createdAt).toLocaleDateString("es-PY")}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteClientMedia(client.id, item.id);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                          title="Eliminar de la galería"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FICHA TÉCNICA, FÓRMULAS & PREFERENCIAS */}
          {activeTab === "formula" && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/50 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-white/10">
                  <h3 className="font-extrabold text-sm text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Fórmula Técnica de Tinte / Corte / Barbería</span>
                  </h3>

                  {!isEditingFormula ? (
                    <button
                      type="button"
                      onClick={startEditingFormula}
                      className="rounded-xl bg-primary text-white text-xs font-bold px-3 py-1.5 hover:opacity-95 transition"
                    >
                      Editar Ficha
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsEditingFormula(false)}
                        className="rounded-xl border border-slate-300 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveFormula}
                        className="rounded-xl bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 hover:bg-emerald-700 transition"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  )}
                </div>

                {isEditingFormula ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Fórmula Técnica / Números de Máquina / Colorimetría:
                      </label>
                      <textarea
                        rows={3}
                        value={formulaText}
                        onChange={(e) => setFormulaText(e.target.value)}
                        placeholder="Ej: Tinte 8.3 con oxidante 20 vol + matizador plata / Fade medio navaja 0 a 1.5..."
                        className="w-full rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Notas Clínicas / Alergias / Preferencias de Servicio:
                      </label>
                      <textarea
                        rows={2}
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        placeholder="Ej: Piel sensible en cuello, usar bálsamo mentolado. Prefiere café sin azúcar..."
                        className="w-full rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                        Fórmula Registrada:
                      </span>
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/5 font-mono text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {client.formula || "Sin fórmula técnica registrada. Hace clic en 'Editar Ficha' para cargarla."}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                        Notas & Preferencias Personales:
                      </span>
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/5 text-slate-700 dark:text-slate-300 leading-relaxed">
                        {client.notes || "Sin notas adicionales."}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CLUB VIP & APPLE WALLET */}
          {activeTab === "vip" && (
            <div className="space-y-4">
              {/* Regla de Fidelización VIP obligatoria */}
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/25 p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-xs text-amber-950 dark:text-amber-100">
                    Regla de Fidelización VIP
                  </p>
                  <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                    Para obtener un sello automático, <strong>es obligatorio que el cliente haya asistido al turno</strong> y esté registrado como <em>Completado</em>. Los turnos futuros o pendientes no suman sellos hasta su realización en el salón.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-amber-100/40 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/40 border border-amber-200/80 dark:border-amber-900/40 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                      <Award className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Tarjeta de Fidelización VIP
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {loyalty?.mode === "points"
                          ? `${client.loyaltyPoints || 0} de ${loyalty?.rewardThreshold || 100} puntos acumulados`
                          : `${Math.min(5, Math.max(0, completedVisits.length - (client.loyaltyRedeemed || 0) * (loyalty?.rewardThreshold || 5)))} de ${loyalty?.rewardThreshold || 5} sellos acumulados (${completedVisits.length} asistencias)`}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`/${business.slug || "barberia"}/tarjeta/${client.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-400 text-slate-950 px-3.5 py-2 text-xs font-black hover:bg-amber-300 transition shadow-sm cursor-pointer"
                  >
                    <Crown className="h-3.5 w-3.5" />
                    <span>Ver Tarjeta Digital</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                </div>

                {/* Progress Visual: Points or Stamps */}
                {loyalty?.mode === "points" ? (
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-amber-200/60 dark:border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Progreso hacia la recompensa
                      </span>
                      <span className="font-mono font-black text-amber-500">
                        {client.loyaltyPoints || 0} / {loyalty?.rewardThreshold || 100} pts
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.round(((client.loyaltyPoints || 0) / (loyalty?.rewardThreshold || 100)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-around gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-amber-200/60 dark:border-white/5">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const earnedStamps = Math.min(
                        5,
                        Math.max(
                          0,
                          completedVisits.length -
                            (client.loyaltyRedeemed || 0) * (loyalty?.rewardThreshold || 5)
                        )
                      );
                      const isCompleted = s <= earnedStamps;
                      return (
                        <div key={s} className="flex flex-col items-center gap-1">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-2xl font-black text-xs transition ${
                              isCompleted
                                ? "bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105"
                                : "border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400"
                            }`}
                          >
                            {isCompleted ? <Award className="h-5 w-5 fill-current" /> : s}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">Sello {s}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Recompensas Canjeadas:
                    </span>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {client.loyaltyRedeemed} premios
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Inversión Histórica:
                    </span>
                    <p className="text-base font-extrabold text-primary mt-0.5">
                      {formatGs(client.totalSpent)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL 2: SUBIR FOTO O VIDEO OPTIMIZADO */}
      <Modal
        open={uploadModalOpen}
        title="Subir Trabajo a la Galería (Foto o Video)"
        onClose={() => setUploadModalOpen(false)}
      >
        <div className="space-y-4 text-xs">
          {/* Optimization Explainer Badge */}
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-300 flex items-start gap-2">
            <Zap className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Compresión Automática:</strong> Las fotos de cámara (4 a 12 MB) son comprimidas en tu navegador a formato WebP ultraliviano (~80 KB), ahorrando hasta un <strong>98% de almacenamiento</strong> sin perder nitidez.
            </p>
          </div>

          {/* Type Selector (Image / Video) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setUploadType("image");
                setSelectedFilePreview(null);
                setCompressionStats(null);
              }}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl font-bold border transition ${
                uploadType === "image"
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
              }`}
            >
              <Camera className="h-4 w-4" />
              <span>Foto (Antes / Después)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUploadType("video");
                setSelectedFilePreview(null);
                setCompressionStats(null);
              }}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl font-bold border transition ${
                uploadType === "video"
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
              }`}
            >
              <Video className="h-4 w-4" />
              <span>Video (Reel / Proceso)</span>
            </button>
          </div>

          {/* Tag Selector */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Etiqueta de Trabajo:
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(["Antes", "Después", "Resultado", "Proceso", "Fórmula"] as const).map((tg) => (
                <button
                  key={tg}
                  type="button"
                  onClick={() => setUploadTag(tg)}
                  className={`py-1.5 px-1 rounded-xl text-center font-bold text-[11px] transition border ${
                    uploadTag === tg
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10"
                  }`}
                >
                  {tg}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Título / Descripción del Trabajo *
            </label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="Ej: Balayage Miel iluminado con matiz plata"
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* File input / Video URL */}
          {uploadType === "image" ? (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Seleccionar Imagen desde tu Dispositivo:
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageFileChange}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:opacity-95 cursor-pointer"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Seleccionar Archivo de Video (.mp4, .webm) o Enlace Externo:
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleImageFileChange}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:opacity-95 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 font-semibold text-center">— o pegar enlace —</p>
              <input
                type="url"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder="https://... (Enlace directo a video MP4 o Reel)"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
              />
            </div>
          )}

          {/* Compression & Preview Stats Box */}
          {compressionStats && uploadType === "image" && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Optimización Exitosa
                </span>
                <span className="font-mono text-emerald-700 dark:text-emerald-300">
                  -{compressionStats.savingsPercent}% de peso
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Original: {compressionStats.originalSizeKb} KB</span>
                <span className="text-slate-400">→</span>
                <span className="font-bold text-primary">Comprimido: {compressionStats.compressedSizeKb} KB ({compressionStats.format.toUpperCase()})</span>
              </div>

              {selectedFilePreview && (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900">
                  <img
                    src={selectedFilePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSaveMedia}
              className="rounded-xl bg-primary text-white font-bold px-5 py-2 hover:opacity-95 transition disabled:opacity-40 shadow-sm"
            >
              {isProcessing ? "Optimizando..." : "Guardar en Ficha"}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: LIGHTBOX / REPRODUCTOR DE VIDEO A PANTALLA COMPLETA */}
      {viewingMedia && (
        <Modal
          open={Boolean(viewingMedia)}
          title={viewingMedia.title}
          onClose={() => setViewingMedia(null)}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-3">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-lg">
              {viewingMedia.type === "video" ? (
                <video
                  src={viewingMedia.url}
                  controls
                  autoPlay
                  className="h-full w-full object-contain"
                />
              ) : (
                <img
                  src={viewingMedia.url}
                  alt={viewingMedia.title}
                  className="h-full w-full object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-white/10">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  {viewingMedia.title}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Etiqueta: {viewingMedia.tag} · Fecha: {new Date(viewingMedia.createdAt).toLocaleDateString("es-PY")}
                </span>
              </div>

              {viewingMedia.sizeKb && (
                <span className="rounded-lg bg-primary/10 text-primary font-mono text-[11px] font-bold px-2 py-1">
                  Tamaño: {viewingMedia.sizeKb} KB
                </span>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
