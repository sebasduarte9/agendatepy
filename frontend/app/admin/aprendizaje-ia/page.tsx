"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BrainCircuit,
  Bot,
  User,
  Building2,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Mic,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Save,
  Check,
  Share2,
} from "lucide-react";
import CustomSelect from "@/components/dashboard/ui/CustomSelect";

interface InteractionRecord {
  id: string;
  timestamp: string;
  createdAt: number;
  scope: "PLATFORM" | "TENANT";
  tenantId?: string;
  tenantName?: string;
  tenantSlug?: string;
  clientPhone: string;
  clientName?: string;
  userMessage: string;
  aiResponse: string;
  intent: string;
  channel: string;
  hadAudio?: boolean;
  hadImage?: boolean;
  humanIntervened: boolean;
  repetitionDetected: boolean;
  outcome: "RESOLVED" | "NEEDS_HUMAN" | "REPETITION_LOOP" | "SIPAP_CONFIRMED" | "ERROR";
  actionPerformed?: string;
  adminFeedback?: {
    correctedResponse?: string;
    notes?: string;
    isGoldenSample?: boolean;
    isAntiPattern?: boolean;
    reviewedAt?: string;
    reviewedBy?: string;
  };
}

interface StatsData {
  total: number;
  platformCount: number;
  tenantCount: number;
  autonomyRate: number;
  humanInterventions: number;
  repetitionLoops: number;
  audioCount: number;
  imageCount: number;
  goldenSamples: number;
  reviewedCount: number;
  intentBreakdown: Record<string, number>;
  topTenants: Array<{ count: number; name: string; humanInterventions: number }>;
}

export default function AiLearningHubPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [data, setData] = useState<InteractionRecord[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  // Filters
  const [scope, setScope] = useState<string>("ALL");
  const [outcome, setOutcome] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [hasAudio, setHasAudio] = useState<boolean>(false);
  const [hasRepetition, setHasRepetition] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  // Edit / Feedback drawer or card states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [correctedText, setCorrectedText] = useState<string>("");
  const [feedbackNotes, setFeedbackNotes] = useState<string>("");
  const [isGolden, setIsGolden] = useState<boolean>(false);
  const [isAnti, setIsAnti] = useState<boolean>(false);
  const [savingFeedback, setSavingFeedback] = useState<boolean>(false);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        scope,
        outcome,
        search,
        hasAudio: hasAudio ? "true" : "false",
        hasRepetition: hasRepetition ? "true" : "false",
        page: page.toString(),
        limit: "25",
      });

      const res = await fetch(`/api/admin/aprendizaje-ia?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setStats(json.stats);
        setData(json.data || []);
        setPagination(json.pagination || { total: 0, page: 1, totalPages: 1 });
      }
    } catch (err) {
      console.error("Error cargando datos de aprendizaje:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [scope, outcome, page, hasAudio, hasRepetition]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const startEdit = (rec: InteractionRecord) => {
    setEditingId(rec.id);
    setCorrectedText(rec.adminFeedback?.correctedResponse || "");
    setFeedbackNotes(rec.adminFeedback?.notes || "");
    setIsGolden(Boolean(rec.adminFeedback?.isGoldenSample));
    setIsAnti(Boolean(rec.adminFeedback?.isAntiPattern));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCorrectedText("");
    setFeedbackNotes("");
    setIsGolden(false);
    setIsAnti(false);
  };

  const saveFeedback = async (id: string) => {
    try {
      setSavingFeedback(true);
      const res = await fetch("/api/admin/aprendizaje-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          correctedResponse: correctedText.trim(),
          notes: feedbackNotes.trim(),
          isGoldenSample: isGolden,
          isAntiPattern: isAnti,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setData((prev) =>
          prev.map((item) => (item.id === id ? { ...item, adminFeedback: json.record?.adminFeedback } : item))
        );
        setSavedSuccessId(id);
        setTimeout(() => setSavedSuccessId(null), 3000);
        cancelEdit();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingFeedback(false);
    }
  };

  const handleDownloadDataset = () => {
    window.open(`/api/admin/aprendizaje-ia?export=jsonl&scope=${scope}`, "_blank");
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-[#FF4F2B] border border-orange-200/80">
              AI Continuous Learning Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5 mt-1">
            <GraduationCap className="h-7 w-7 text-[#FF4F2B] shrink-0" />
            <span>Aprendizaje & Patrones de la IA</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Centro de observabilidad, análisis de repeticiones y recopilación de chats de WhatsApp (soporte AgendatePY y locales) para entrenar y perfeccionar los modelos de IA.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleDownloadDataset}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#FF4F2B] hover:border-orange-200 text-xs font-bold transition shadow-xs cursor-pointer"
            title="Descargar dataset en formato JSONL para fine-tuning en Gemini"
          >
            <Download className="w-4 h-4 text-[#FF4F2B]" />
            <span>Exportar Dataset JSONL</span>
          </button>

          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition shadow-xs cursor-pointer"
            title="Recargar telemetría"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#FF4F2B]" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Total Chats */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Chats Registrados</span>
              <MessageSquare className="w-4 h-4 text-[#FF4F2B]" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums mt-1.5">
              {stats.total.toLocaleString("es-PY")}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">{stats.platformCount}</span> AgendatePY •{" "}
              <span className="font-semibold text-slate-700">{stats.tenantCount}</span> Locales
            </div>
          </div>

          {/* Autonomy Rate */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Autonomía de la IA</span>
              <BrainCircuit className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 tracking-tight tabular-nums mt-1.5">
              {stats.autonomyRate}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Resueltas sin requerir asesor humano
            </div>
          </div>

          {/* Human Interventions */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Intervención Humana</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600 tracking-tight tabular-nums mt-1.5">
              {stats.humanInterventions}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Casos derivados a soporte o asesor
            </div>
          </div>

          {/* Repetition Loops */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Patrones de Repetición</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-rose-600 tracking-tight tabular-nums mt-1.5">
              {stats.repetitionLoops}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Re-preguntas o bucles detectados
            </div>
          </div>
        </div>
      )}

      {/* Intents & Top Tenants Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Intents */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF4F2B]" />
                Distribución de Intenciones de Clientes
              </h2>
              <span className="text-xs text-slate-400">Total: {stats.total}</span>
            </div>

            <div className="space-y-2 pt-1">
              {Object.entries(stats.intentBreakdown || {}).length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Esperando nuevas conversaciones en WhatsApp...
                </div>
              ) : (
                Object.entries(stats.intentBreakdown).map(([intent, count]) => {
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={intent} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700 capitalize">
                          {intent === "agenda"
                            ? "📅 Agendamiento / Turnos"
                            : intent === "precios"
                            ? "💰 Precios y Planes"
                            : intent === "sipap_ocr"
                            ? "🧾 Comprobantes de Transferencia"
                            : intent === "humano"
                            ? "👤 Solicitud de Asesor"
                            : intent === "soporte"
                            ? "🛠️ Soporte Técnico"
                            : "💬 Consultas Generales"}
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#FF4F2B] h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Top Businesses Using WhatsApp Bot */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#FF4F2B]" />
                Locales Activos con Bot IA WhatsApp
              </h2>
              <span className="text-xs text-slate-400">Top {stats.topTenants.length}</span>
            </div>

            <div className="divide-y divide-slate-100 pt-1">
              {stats.topTenants.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Sin interacciones de locales registradas aún.
                </div>
              ) : (
                stats.topTenants.map((t) => (
                  <div key={t.name} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#FF4F2B] font-bold">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{t.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {t.humanInterventions > 0
                            ? `${t.humanInterventions} intervenciones humanas`
                            : "100% autónomo"}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60">
                      {t.count} mensajes
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por mensaje, respuesta, teléfono o local..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF4F2B] focus:bg-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Scope Filter */}
            <CustomSelect
              value={scope}
              onChange={(val) => {
                setScope(val);
                setPage(1);
              }}
              options={[
                { value: "ALL", label: "Todos los Ámbitos" },
                { value: "PLATFORM", label: "Soporte AgendatePY" },
                { value: "TENANT", label: "Locales y Negocios" },
              ]}
              buttonClassName="bg-white border-slate-200/80 text-slate-700 text-xs min-w-[170px]"
            />

            {/* Outcome Filter */}
            <CustomSelect
              value={outcome}
              onChange={(val) => {
                setOutcome(val);
                setPage(1);
              }}
              options={[
                { value: "ALL", label: "Todos los Estados" },
                { value: "RESOLVED", label: "Resueltos por IA" },
                { value: "NEEDS_HUMAN", label: "Intervención Humana" },
                { value: "REPETITION_LOOP", label: "Repetición / Bucle" },
                { value: "SIPAP_CONFIRMED", label: "Transferencia Validada" },
              ]}
              buttonClassName="bg-white border-slate-200/80 text-slate-700 text-xs min-w-[170px]"
            />

            {/* Quick Toggle Buttons */}
            <button
              type="button"
              onClick={() => {
                setHasAudio(!hasAudio);
                setPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                hasAudio
                  ? "bg-orange-50 text-[#FF4F2B] border-orange-200 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Con Audio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setHasRepetition(!hasRepetition);
                setPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                hasRepetition
                  ? "bg-rose-50 text-rose-600 border-rose-200 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Repeticiones</span>
            </button>
          </div>
        </form>
      </div>

      {/* Interactions Feed & Pattern Analyzer */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-[#FF4F2B] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Analizando patrones de conversación...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 space-y-2 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
            <div className="text-sm font-bold text-slate-900">Sin interacciones bajo estos filtros</div>
            <p className="text-xs text-slate-500">
              Cada nuevo mensaje que ingrese por WhatsApp quedará automáticamente indexado en este registro de aprendizaje.
            </p>
          </div>
        ) : (
          data.map((rec) => {
            const isEditing = editingId === rec.id;
            const isSaved = savedSuccessId === rec.id;

            return (
              <div
                key={rec.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition ${
                  rec.outcome === "REPETITION_LOOP"
                    ? "border-rose-200/80 hover:border-rose-300"
                    : rec.outcome === "NEEDS_HUMAN"
                    ? "border-amber-200/80 hover:border-amber-300"
                    : "border-slate-200/80 hover:border-orange-200"
                }`}
              >
                {/* Meta Top Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Scope Badge */}
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg border ${
                        rec.scope === "PLATFORM"
                          ? "bg-orange-50 text-[#FF4F2B] border-orange-200/80"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {rec.scope === "PLATFORM" ? "Soporte AgendatePY" : `Local: ${rec.tenantName || "Negocio"}`}
                    </span>

                    {/* Intent Badge */}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/60 uppercase">
                      {rec.intent}
                    </span>

                    {/* Outcome Badge */}
                    {rec.outcome === "NEEDS_HUMAN" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> Intervención Asesor
                      </span>
                    )}

                    {rec.outcome === "REPETITION_LOOP" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-rose-600" /> Bucle / Repetición
                      </span>
                    )}

                    {rec.outcome === "SIPAP_CONFIRMED" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Transferencia Validada
                      </span>
                    )}

                    {rec.adminFeedback?.isGoldenSample && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200 flex items-center gap-1">
                        ⭐ Ejemplo Dorado
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="text-slate-600 font-medium">{rec.clientPhone}</span>
                    <span>•</span>
                    <span>{new Date(rec.timestamp).toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>

                {/* Turn Dialogue Content */}
                <div className="mt-4 space-y-3">
                  {/* User Message */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 font-bold text-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {rec.clientName || "Cliente"}
                        </span>
                        {rec.hadAudio && (
                          <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                            <Mic className="w-2.5 h-2.5" /> Nota de voz
                          </span>
                        )}
                        {rec.hadImage && (
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                            <ImageIcon className="w-2.5 h-2.5" /> Imagen / Transferencia
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl p-3 mt-1 leading-relaxed">
                        {rec.userMessage}
                      </p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#FF4F2B] shrink-0 font-bold text-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          Respuesta generada por IA
                        </span>
                        {rec.actionPerformed && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            tool: {rec.actionPerformed}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-800 bg-orange-50/40 border border-orange-100 rounded-xl p-3 mt-1 leading-relaxed whitespace-pre-line">
                        {rec.aiResponse}
                      </p>
                    </div>
                  </div>

                  {/* Admin Ground Truth / Correction if exists */}
                  {rec.adminFeedback?.correctedResponse && (
                    <div className="ml-10 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                      <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Corrección del Administrador (Respuesta Ideal para Fine-Tuning):
                      </div>
                      <p className="text-emerald-900 mt-1 whitespace-pre-line">
                        {rec.adminFeedback.correctedResponse}
                      </p>
                      {rec.adminFeedback.notes && (
                        <p className="text-emerald-700/80 text-[11px] mt-1 italic">
                          Nota: {rec.adminFeedback.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Actions: Feedback & Fine-Tuning Tagging */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-400 text-[11px]">
                    {isSaved && (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> ¡Corrección guardada para entrenamiento!
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/crm?phone=${encodeURIComponent(rec.clientPhone)}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[#FF4F2B] px-2.5 py-1 rounded-lg hover:bg-slate-50 transition"
                    >
                      <span>Abrir en CRM</span> <ArrowRight className="w-3 h-3" />
                    </Link>

                    {!isEditing ? (
                      <button
                        onClick={() => startEdit(rec)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF4F2B] bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-lg border border-orange-200/80 transition cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{rec.adminFeedback?.correctedResponse ? "Editar Corrección" : "Evaluar / Corregir IA"}</span>
                      </button>
                    ) : (
                      <button
                        onClick={cancelEdit}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

                {/* Feedback Drawer (Formulario de Corrección Humana) */}
                {isEditing && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        ¿Qué debió responder la IA exactamente? (Ground Truth para entrenamiento)
                      </label>
                      <textarea
                        rows={3}
                        value={correctedText}
                        onChange={(e) => setCorrectedText(e.target.value)}
                        placeholder="Escribí acá la respuesta correcta ideal que debió dar la IA ante este mensaje..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#FF4F2B]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Notas o motivo de la corrección
                        </label>
                        <input
                          type="text"
                          value={feedbackNotes}
                          onChange={(e) => setFeedbackNotes(e.target.value)}
                          placeholder="Ej: Confundió el plan, o no ofreció el horario correcto..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#FF4F2B]"
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-4 sm:pt-6">
                        <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isGolden}
                            onChange={(e) => setIsGolden(e.target.checked)}
                            className="rounded border-slate-300 text-[#FF4F2B] focus:ring-[#FF4F2B]"
                          />
                          <span>⭐ Ejemplo Dorado</span>
                        </label>

                        <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAnti}
                            onChange={(e) => setIsAnti(e.target.checked)}
                            className="rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                          />
                          <span>🚫 Anti-Patrón (Qué NO hacer)</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Descartar
                      </button>
                      <button
                        onClick={() => saveFeedback(rec.id)}
                        disabled={savingFeedback}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#FF4F2B] hover:bg-[#E03F1E] rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savingFeedback ? "Guardando..." : "Guardar para Entrenamiento"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs text-slate-500 shadow-xs">
          <div>
            Total: <span className="font-bold text-slate-900">{pagination.total}</span> registros de aprendizaje
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              Anterior
            </button>
            <span className="font-semibold text-slate-700 px-2">
              Página {page} de {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
