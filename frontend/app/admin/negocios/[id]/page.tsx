"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  CalendarCheck,
  Users,
  Coins,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Scissors,
  Layers,
  Target,
  Lock,
  CreditCard,
  Mail,
  Phone,
  Globe,
  MapPin,
  ChevronRight,
  Image as ImageIcon,
  Trash2,
  Eye,
  ExternalLink,
  Copy,
  Check,
  Filter,
  X,
} from "lucide-react";

export default function SingleTenantAdminPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [mediaFilter, setMediaFilter] = useState<"ALL" | "product" | "client" | "branding">("ALL");
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTenant() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/admin/tenants/${tenantId}`);
        if (!res.ok) {
          throw new Error("No se pudo cargar la información operativa del negocio.");
        }
        const json = await res.json();
        setData(json.data);
        setMediaItems(json.data.mediaGallery || []);
      } catch (err: any) {
        setError(err.message || "Error al conectar con la API.");
      } finally {
        setLoading(false);
      }
    }
    if (tenantId) {
      loadTenant();
    }
  }, [tenantId]);

  const handleDeleteMediaItem = async (mediaId: string, type: string) => {
    if (!confirm("¿Deseas quitar este archivo multimedia del negocio?")) return;
    setDeletingId(mediaId);
    try {
      const res = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, type }),
      });
      if (res.ok) {
        setMediaItems((prev) => prev.filter((m) => m.id !== mediaId));
        if (selectedMedia?.id === mediaId) setSelectedMedia(null);
      } else {
        alert("No se pudo eliminar el archivo.");
      }
    } catch {
      alert("Error al conectar con el servidor.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatGs = (val: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getPlanBadge = (plan: string) => {
    const p = (plan || "PROFESIONAL").toUpperCase();
    if (p === "FREE" || p === "GRATUITO") {
      return (
        <span className="px-3 py-1 rounded-xl text-xs font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700">
          PLAN FREE
        </span>
      );
    }
    if (p === "EMPRESA" || p === "BUSINESS") {
      return (
        <span className="px-3 py-1 rounded-xl text-xs font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
          PLAN EMPRESA
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-xl text-xs font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
        PLAN {p}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div className="h-8 w-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono">Cargando perfil del negocio desde PostgreSQL...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 md:p-8 space-y-4 max-w-7xl mx-auto w-full">
        <Link
          href="/admin/negocios"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al directorio
        </Link>
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error || "Tenant no encontrado."}</span>
        </div>
      </div>
    );
  }

  const { tenant, operationalActivity, milestones, counts, aggregatedFinances, appointmentsByStatus, recentOperationalActivity } = data;

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 text-slate-100 overflow-hidden">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/negocios"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver al Directorio</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800 font-mono">
          <Lock className="h-3.5 w-3.5 text-amber-400" />
          <span>SUPERADMIN • Modo Lectura</span>
        </div>
      </div>

      {/* Tenant Identity & Account Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{tenant.name}</h1>
              {getPlanBadge(tenant.plan)}
              <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Estado: {tenant.status}
              </span>
            </div>

            {/* Subdomain & Identity Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>/{tenant.slug} • {tenant.subdomain}.agendatepy.com</span>
              </div>
              {tenant.ownerEmail && (
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300">{tenant.ownerEmail}</span>
                </div>
              )}
              {tenant.ownerPhone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-300">{tenant.ownerPhone}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Registrado: {new Date(tenant.createdAt).toLocaleDateString("es-PY")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-pink-400" />
                <span>Zona: {tenant.timezone || "America/Asuncion"}</span>
              </div>
            </div>
          </div>

          {/* Activity State Badge */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl shrink-0 min-w-[200px]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Estado de Actividad
            </div>
            <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {operationalActivity.status}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              {operationalActivity.lastActivityAt
                ? `Última: ${new Date(operationalActivity.lastActivityAt).toLocaleDateString("es-PY")}`
                : "Sin actividad registrada"}
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Counts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <Users className="h-3.5 w-3.5 text-blue-400" /> Staff
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{counts.staff}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <Scissors className="h-3.5 w-3.5 text-purple-400" /> Servicios
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{counts.services}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <Users className="h-3.5 w-3.5 text-emerald-400" /> Clientes
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{counts.clients}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <CalendarCheck className="h-3.5 w-3.5 text-indigo-400" /> Citas
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{counts.appointments}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <Coins className="h-3.5 w-3.5 text-amber-400" /> Mov. Caja
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{counts.cashMovements}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <DollarSign className="h-3.5 w-3.5 text-pink-400" /> Liquidaciones
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{counts.commissionPayouts}</div>
        </div>
      </div>

      {/* Activation Milestones */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Target className="h-4 w-4 text-indigo-400" />
          Hitos de Activación del Negocio
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">1. Configuración Inicial</div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {milestones.isConfigured ? "Completado" : "Pendiente"}
              </div>
            </div>
            <CheckCircle2
              className={`h-5 w-5 ${
                milestones.isConfigured ? "text-emerald-400" : "text-slate-600"
              }`}
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">2. Portal Público</div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {milestones.isReadyToBook ? "Habilitado" : "Incompleto"}
              </div>
            </div>
            <CheckCircle2
              className={`h-5 w-5 ${
                milestones.isReadyToBook ? "text-emerald-400" : "text-slate-600"
              }`}
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">3. Primera Reserva</div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {milestones.hasFirstBooking ? "Recibida" : "Sin reservas"}
              </div>
            </div>
            <CheckCircle2
              className={`h-5 w-5 ${
                milestones.hasFirstBooking ? "text-purple-400" : "text-slate-600"
              }`}
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">4. Primer Cobro</div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {milestones.hasFirstCash ? "Registrado" : "Sin cobros"}
              </div>
            </div>
            <CheckCircle2
              className={`h-5 w-5 ${
                milestones.hasFirstCash ? "text-amber-400" : "text-slate-600"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Financials & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Recorded Cash Volume */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-400" />
            Volumen de Caja Manejado por el Negocio
          </h2>
          <p className="text-xs text-slate-400">
            Dinero procesado internamente por el negocio en su módulo de caja (no confundir con cobros SaaS).
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-xs text-slate-400">Total Ingresos Registrados en Caja</div>
                <div className="text-xl font-black text-white mt-0.5">
                  {formatGs(aggregatedFinances.totalCashVolume)}
                </div>
              </div>
              <Coins className="h-6 w-6 text-amber-400 opacity-60" />
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-xs text-slate-400">Total Gastos Registrados en Caja</div>
                <div className="text-xl font-black text-rose-400 mt-0.5">
                  {formatGs(aggregatedFinances.totalExpenses)}
                </div>
              </div>
              <DollarSign className="h-6 w-6 text-rose-400 opacity-60" />
            </div>
          </div>
        </div>

        {/* Appointment Status Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-purple-400" />
            Desglose de Estados de Citas
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400 font-mono">COMPLETED</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                {appointmentsByStatus.COMPLETED}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400 font-mono">CONFIRMED</div>
              <div className="text-lg font-bold text-blue-400 mt-0.5">
                {appointmentsByStatus.CONFIRMED}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400 font-mono">PENDING</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5">
                {appointmentsByStatus.PENDING || appointmentsByStatus.PENDING_ACTION || 0}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400 font-mono">CANCELLED</div>
              <div className="text-lg font-bold text-red-400 mt-0.5">
                {appointmentsByStatus.CANCELLED}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400 font-mono">NO_SHOW</div>
              <div className="text-lg font-bold text-slate-400 mt-0.5">
                {appointmentsByStatus.NO_SHOW}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Operational Appointments */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-400" />
          Últimas Citas Operativas (Privacidad Preservada - Sin PII)
        </h2>

        <div className="divide-y divide-slate-800/80 text-xs">
          {recentOperationalActivity.length === 0 ? (
            <p className="text-slate-500 py-4 text-center">Sin actividad reciente de citas.</p>
          ) : (
            recentOperationalActivity.map((app: any) => (
              <div key={app.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">
                    {app.serviceName} • {app.staffName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Fecha: {new Date(app.date).toLocaleDateString("es-PY")}
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300">
                    {app.status}
                  </span>
                  <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                    {formatGs(app.price)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Client & Business Media Gallery Control */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-indigo-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Control de Galería & Multimedia de Clientes
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {mediaItems.length} archivos en servidor
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Supervisá las fotos de trabajos de clientes (fichas técnicas), catálogo de productos y banners alojados en nuestro servidor.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs overflow-x-auto max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
            {[
              { id: "ALL", label: "Todos" },
              { id: "client", label: "Clientes" },
              { id: "product", label: "Productos" },
              { id: "branding", label: "Branding" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setMediaFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  mediaFilter === f.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {(() => {
          const filtered = mediaItems.filter((m) =>
            mediaFilter === "ALL" ? true : m.type === mediaFilter
          );

          if (filtered.length === 0) {
            return (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <ImageIcon className="h-8 w-8 mx-auto opacity-40 text-slate-400" />
                <p className="text-xs">No hay archivos multimedia registrados en esta categoría.</p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 pt-1">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-2xl bg-slate-950/70 border border-slate-800 overflow-hidden flex flex-col hover:border-indigo-500/50 transition-all duration-200"
                >
                  {/* Thumbnail Container */}
                  <div
                    onClick={() => setSelectedMedia(item)}
                    className="relative h-32 w-full bg-slate-900 cursor-pointer overflow-hidden flex items-center justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-xs ${
                          item.type === "client"
                            ? "bg-purple-500/80 text-white"
                            : item.type === "product"
                            ? "bg-emerald-500/80 text-white"
                            : "bg-blue-500/80 text-white"
                        }`}
                      >
                        {item.type === "client" ? "Cliente" : item.type === "product" ? "Producto" : "Branding"}
                      </span>
                    </div>

                    {/* Quick Hover Zoom Icon */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white drop-shadow-md" />
                    </div>
                  </div>

                  {/* Metadata & Controls */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h3 className="text-xs font-bold text-white line-clamp-1" title={item.title}>
                        {item.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.subtitle}</p>
                      <p className="text-[9px] font-mono text-slate-500 truncate mt-1">
                        {item.url}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item.url)}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                        title="Copiar URL"
                      >
                        {copiedUrl === item.url ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>{copiedUrl === item.url ? "Copiado" : "URL"}</span>
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === item.id}
                        onClick={() => handleDeleteMediaItem(item.id, item.type)}
                        className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1 hover:bg-rose-500/10 rounded-md transition disabled:opacity-50"
                        title="Eliminar archivo del servidor"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Lightbox Preview Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedMedia.title}</h3>
                <p className="text-xs text-slate-400">{selectedMedia.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] flex items-center justify-center bg-black/40 rounded-2xl p-2 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedMedia.url}
                alt={selectedMedia.title}
                className="max-h-[55vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-mono text-slate-400 truncate max-w-sm">
                {selectedMedia.url}
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={selectedMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition font-medium"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir directo
                </a>
                <button
                  type="button"
                  onClick={() => handleDeleteMediaItem(selectedMedia.id, selectedMedia.type)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-600/30 hover:bg-rose-600/30 transition font-medium"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar archivo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
