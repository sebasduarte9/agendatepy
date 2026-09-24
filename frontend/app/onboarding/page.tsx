"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  Building2,
  Globe,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Scissors,
  Phone,
  Clock,
  Coins,
  ShieldCheck,
} from "lucide-react";

const CATEGORIES = [
  { id: "barberia", label: "Barbería / Peluquería", icon: "💈" },
  { id: "estetica", label: "Centro de Estética / Spa", icon: "✨" },
  { id: "salud", label: "Consultorio / Salud / Odontología", icon: "🩺" },
  { id: "padel", label: "Canchas / Deportes", icon: "🎾" },
  { id: "veterinaria", label: "Veterinaria / Pet Shop", icon: "🐾" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form State
  const [businessName, setBusinessName] = useState("Estudio Elegance");
  const [category, setCategory] = useState("barberia");
  const [slug, setSlug] = useState("elegance");
  const [serviceName, setServiceName] = useState("Corte & Estilo Personalizado");
  const [duration, setDuration] = useState("45");
  const [price, setPrice] = useState("90000");
  const [whatsapp, setWhatsapp] = useState("0981 123 456");
  const [isFinishing, setIsFinishing] = useState(false);

  const handleSlugify = (name: string) => {
    setBusinessName(name);
    const generated = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 24);
    setSlug(generated);
  };

  const handleFinish = () => {
    setIsFinishing(true);
    // Simular guardado y redirigir con tour activo
    setTimeout(() => {
      router.push("/dashboard?onboarding=completed&tour=start");
    }, 900);
  };

  return (
    <div className="relative min-h-screen bg-[#fbfbfd] text-slate-900 selection:bg-brand selection:text-white">
      {/* Luces de fondo Apple */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[450px] w-[550px] -translate-x-1/2 rounded-full bg-gradient-to-b from-purple-100/50 via-indigo-50/40 to-transparent blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-brand text-white shadow-xs">
              <CalendarCheck className="h-4 w-4" />
            </span>
            <span className="text-sm font-black tracking-tight">
              Agendate<span className="text-brand">PY</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Paso {step} de 4</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                    i <= step ? "bg-brand" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="rounded-[28px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_12px_40px_rgb(0,0,0,0.06)] backdrop-blur-xl"
            >
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-[11px] font-bold text-brand">
                  <Building2 className="h-3.5 w-3.5" />
                  Paso 1: Identidad
                </span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                  ¿Cómo se llama tu negocio?
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Este nombre aparecerá en tu agenda pública y en los mensajes automáticos de WhatsApp.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="business-name-input" className="block text-xs font-semibold text-slate-700">
                    Nombre del Negocio o Estudio
                  </label>
                  <input
                    id="business-name-input"
                    type="text"
                    value={businessName}
                    onChange={(e) => handleSlugify(e.target.value)}
                    placeholder="Ej: Barbería Don Pedro, Spazio Belleza..."
                    className="mt-1.5 w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-semibold text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Selecciona tu Rubro
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left transition ${
                          category === cat.id
                            ? "border-brand bg-brand/5 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-xs font-semibold text-slate-800">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 text-xs font-bold text-white shadow-md shadow-brand/20 hover:bg-brand-dark transition"
                  >
                    Siguiente: Tu Enlace Web
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="rounded-[28px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_12px_40px_rgb(0,0,0,0.06)] backdrop-blur-xl"
            >
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                  <Globe className="h-3.5 w-3.5" />
                  Paso 2: Dirección Web
                </span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                  Elige tu enlace de reservas
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Tus clientes usarán este link para agendar turnos las 24 horas del día.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="business-slug-input" className="block text-xs font-semibold text-slate-700">
                    Subdominio o Enlace Único
                  </label>
                  <div className="mt-1.5 flex items-center rounded-2xl border border-slate-200/90 bg-white px-4 py-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 transition">
                    <span className="text-xs font-medium text-slate-400">agendate.py/</span>
                    <input
                      id="business-slug-input"
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      className="ml-1 w-full bg-transparent text-sm font-bold text-brand focus:outline-none"
                    />
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" /> Disponible
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <p className="text-xs font-semibold text-indigo-900">Vista previa del link que compartirás:</p>
                  <p className="mt-1 font-mono text-xs font-bold text-brand">
                    https://{slug || "tu-negocio"}.agendate.py/reservar
                  </p>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Podrás colocarlo en tu biografía de Instagram, TikTok, Google Maps y enviarlo por WhatsApp.
                  </p>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 text-xs font-bold text-white shadow-md shadow-brand/20 hover:bg-brand-dark transition"
                  >
                    Siguiente: Tu Servicio Estrella
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="rounded-[28px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_12px_40px_rgb(0,0,0,0.06)] backdrop-blur-xl"
            >
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-[11px] font-bold text-purple-700">
                  <Scissors className="h-3.5 w-3.5" />
                  Paso 3: Catálogo
                </span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                  Crea tu primer servicio estrella
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Podrás agregar más servicios, combos y colaboradores en cualquier momento.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="service-name-input" className="block text-xs font-semibold text-slate-700">
                    Nombre del Servicio
                  </label>
                  <input
                    id="service-name-input"
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="Ej: Corte Degradé con Barba"
                    className="mt-1.5 w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-semibold text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="service-duration-select" className="block text-xs font-semibold text-slate-700">
                      Duración
                    </label>
                    <div className="relative mt-1.5">
                      <Clock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <select
                        id="service-duration-select"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200/90 bg-white py-3 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:border-brand focus:outline-none"
                      >
                        <option value="15">15 min</option>
                        <option value="30">30 min</option>
                        <option value="45">45 min</option>
                        <option value="60">60 min (1 h)</option>
                        <option value="90">90 min</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="service-price-input" className="block text-xs font-semibold text-slate-700">
                      Precio en Guaraníes (Gs.)
                    </label>
                    <div className="relative mt-1.5">
                      <Coins className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="service-price-input"
                        type="number"
                        step="5000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="80000"
                        className="w-full rounded-2xl border border-slate-200/90 bg-white py-3 pl-10 pr-4 text-xs font-bold text-slate-900 focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 text-xs font-bold text-white shadow-md shadow-brand/20 hover:bg-brand-dark transition"
                  >
                    Siguiente: WhatsApp
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="rounded-[28px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_12px_40px_rgb(0,0,0,0.06)] backdrop-blur-xl"
            >
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                  <Phone className="h-3.5 w-3.5" />
                  Paso 4: Notificaciones
                </span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                  Conexión con WhatsApp
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Ingresa el número de tu negocio para recibir avisos de nuevos turnos y enviar confirmaciones.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="whatsapp-input" className="block text-xs font-semibold text-slate-700">
                    Número de WhatsApp del Negocio
                  </label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      🇵🇾 +595
                    </span>
                    <input
                      id="whatsapp-input"
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="981 123 456"
                      className="w-full rounded-2xl border border-slate-200/90 bg-white py-3 pl-20 pr-4 text-sm font-semibold text-slate-900 focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-900">Compatible con Sendwo y Cloud API</span>
                  </div>
                  <p className="mt-1 text-[11px] text-emerald-800">
                    Podrás conectar tu instancia de Sendwo Bot o escanear el código QR directamente en el panel de WhatsApp de tu dashboard.
                  </p>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={isFinishing}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-7 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition active:scale-[0.99] disabled:opacity-60"
                  >
                    {isFinishing ? "Creando tu negocio..." : "Completar y Comenzar Visita Guiada"}
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
