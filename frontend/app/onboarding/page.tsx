"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BrandLogo from "@/components/ui/BrandLogo";
import {
  CalendarCheck,
  Building2,
  Globe,
  Flower2,
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Scissors,
  Phone,
  Clock,
  Coins,
  ShieldCheck,
  Stethoscope,
  Activity,
  Heart,
  Mail,
  User,
  Camera,
  UploadCloud,
  X,
  Sparkles,
  FileText,
  Bell,
} from "lucide-react";

const CATEGORIES = [
  { id: "barberia", label: "Barbería / Peluquería", icon: Scissors },
  { id: "estetica", label: "Centro de Estética / Spa", icon: Flower2 },
  { id: "salud", label: "Consultorio / Salud / Odonto", icon: Stethoscope },
  { id: "padel", label: "Canchas / Deportes / Pádel", icon: Activity },
  { id: "veterinaria", label: "Veterinaria / Pet Shop", icon: Heart },
];

const DURATION_PRESETS = [
  { value: "15", label: "15m" },
  { value: "30", label: "30m" },
  { value: "45", label: "45m" },
  { value: "60", label: "60m (1h)" },
  { value: "90", label: "90m" },
];

const PRICE_PRESETS = ["50000", "80000", "100000", "150000"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1, 2, 3

  // Form State
  const [businessName, setBusinessName] = useState("Estudio Elegance");
  const [category, setCategory] = useState("barberia");
  const [slug, setSlug] = useState("elegance");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [ruc, setRuc] = useState("");

  const [serviceName, setServiceName] = useState("Corte & Estilo Personalizado");
  const [duration, setDuration] = useState("45");
  const [price, setPrice] = useState("80000");

  const [whatsapp, setWhatsapp] = useState("");
  const [phoneType, setPhoneType] = useState<"business" | "personal">("business");
  const [personalPhone, setPersonalPhone] = useState("");
  const [notifyPersonal, setNotifyPersonal] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  const [isFinishing, setIsFinishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSlugify = (name: string) => {
    setBusinessName(name);
    const generated = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 24);
    setSlug(generated);
  };

  // Image Upload with client compression for fast mobile uploads
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Por favor selecciona un archivo de imagen (JPG, PNG o WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar a max 400x400 para subida ultra liviana en redes móviles
        const canvas = document.createElement("canvas");
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/webp", 0.85);
          setLogoUrl(compressed);
          setErrorMessage(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFinish = async () => {
    if (!ownerEmail || !ownerEmail.includes("@")) {
      setErrorMessage("Por favor ingresa un correo electrónico válido para tu cuenta de administrador.");
      return;
    }

    setIsFinishing(true);
    setErrorMessage(null);

    const { createTenantOnboardingAction } = await import("@/lib/tenant/actions");
    const res = await createTenantOnboardingAction({
      businessName,
      category,
      slug,
      serviceName,
      duration: Number(duration) || 45,
      price: Number(price.replace(/\D/g, "")) || 80000,
      whatsapp,
      phoneType,
      personalPhone: phoneType === "personal" ? whatsapp : (notifyPersonal ? personalPhone : ""),
      ruc: ruc.trim(),
      logoUrl,
      ownerName: ownerName.trim() || businessName,
      ownerEmail: ownerEmail.trim().toLowerCase(),
    });

    if (res.ok) {
      window.location.href = "/dashboard?onboarding=completed&tour=start";
    } else {
      setIsFinishing(false);
      setErrorMessage(res.error || "Ocurrió un error al registrar el negocio.");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#fbfbfd] text-slate-900 selection:bg-brand selection:text-white">
      {/* Luces de fondo estilo Apple */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[450px] w-[550px] -translate-x-1/2 rounded-full bg-gradient-to-b from-brand/10 via-orange-100/30 to-transparent blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4">
          <Link href="/" className="flex items-center">
            <BrandLogo variant="horizontal" iconClassName="h-6.5 w-6.5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Paso <span className="text-brand">{step}</span> de 3
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step
                      ? "w-8 bg-brand"
                      : i < step
                      ? "w-4 bg-emerald-500"
                      : "w-4 bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-xl px-3.5 sm:px-6 py-6 sm:py-12">
        <AnimatePresence mode="wait">
          {/* ============================================================== */}
          {/* PASO 1: TU NEGOCIO & IDENTIDAD (LOGO, NOMBRE, SLUG, RUBRO, RUC) */}
          {/* ============================================================== */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="rounded-3xl sm:rounded-[28px] border border-slate-200/80 bg-white/95 p-5 xs:p-6 sm:p-8 shadow-[0_12px_40px_rgb(0,0,0,0.06)] backdrop-blur-xl"
            >
              <div className="mb-5 sm:mb-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-[11px] font-bold text-brand">
                    <Building2 className="h-3.5 w-3.5" />
                    Paso 1: Identidad del Local
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> 14 días gratis
                  </span>
                </div>
                <h1 className="mt-3 text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-snug">
                  Datos de tu Negocio
                </h1>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Esta información aparecerá en tu agenda pública y en los mensajes automáticos de WhatsApp.
                </p>
              </div>

              <div className="space-y-4 sm:space-y-5">
                {/* 1.1 Carga Simple de Logo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Logo o Foto de Portada <span className="font-normal text-slate-400">(Opcional)</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageFile}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 bg-slate-50/70">
                    {logoUrl ? (
                      <div className="relative h-16 w-16 sm:h-18 sm:w-18 shrink-0 rounded-2xl overflow-hidden border border-brand/20 shadow-xs">
                        <img src={logoUrl} alt="Logo preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setLogoUrl("")}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition cursor-pointer"
                          title="Eliminar logo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-16 w-16 sm:h-18 sm:w-18 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white text-slate-400 hover:border-brand hover:text-brand transition cursor-pointer active:scale-95"
                      >
                        <Camera className="h-6 w-6 stroke-[1.8]" />
                      </button>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800">
                        {logoUrl ? "Logo cargado con éxito" : "Subí el logo de tu local"}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        {logoUrl
                          ? "Se mostrará en la cabecera de tu página de reservas."
                          : "Tocá para sacar una foto o elegir desde tu galería."}
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline cursor-pointer"
                      >
                        <UploadCloud className="h-3 w-3" />
                        <span>{logoUrl ? "Cambiar imagen" : "Elegir archivo"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 1.2 Nombre del Negocio */}
                <div>
                  <label htmlFor="business-name-input" className="block text-xs font-bold text-slate-700">
                    Nombre del Negocio o Estudio *
                  </label>
                  <input
                    id="business-name-input"
                    type="text"
                    required
                    autoComplete="organization"
                    value={businessName}
                    onChange={(e) => handleSlugify(e.target.value)}
                    placeholder="Ej: Barbería Don Pedro, Spazio Belleza..."
                    className="mt-1.5 w-full rounded-2xl border border-slate-200/90 bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition shadow-2xs"
                  />
                </div>

                {/* 1.3 Subdominio Web Instantáneo */}
                <div>
                  <label htmlFor="business-slug-input" className="block text-xs font-bold text-slate-700">
                    Tu Enlace Web de Reservas
                  </label>
                  <div className="mt-1.5 flex items-center rounded-2xl border border-slate-200/90 bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 transition shadow-2xs">
                    <span className="text-xs font-bold text-slate-400">agendate.py/</span>
                    <input
                      id="business-slug-input"
                      type="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      className="ml-1 w-full bg-transparent text-sm font-bold text-brand focus:outline-none"
                    />
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 shrink-0">
                      <CheckCircle2 className="h-3 w-3" /> Libre
                    </span>
                  </div>
                </div>

                {/* 1.4 Selector de Rubro */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Seleccioná tu Rubro
                  </label>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 sm:gap-2">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const active = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`flex items-center gap-2.5 rounded-2xl border p-2.5 sm:p-3 text-left transition cursor-pointer active:scale-98 ${
                            active
                              ? "border-brand bg-brand/5 shadow-xs ring-1 ring-brand/30"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <span className={`p-1.5 sm:p-2 rounded-xl ${active ? "bg-brand text-white" : "bg-slate-100 text-slate-700"}`}>
                            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </span>
                          <span className="text-xs font-bold text-slate-800 leading-tight">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1.5 RUC / Cédula con teclado numérico en móvil */}
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="ruc-input" className="block text-xs font-bold text-slate-700">
                      RUC o C.I. del Titular
                    </label>
                    <span className="text-[10px] font-semibold text-slate-400">Opcional</span>
                  </div>
                  <div className="relative mt-1.5">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="ruc-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9-]*"
                      value={ruc}
                      onChange={(e) => setRuc(e.target.value)}
                      placeholder="Ej: 80012345-6 o 4567890"
                      className="w-full rounded-2xl border border-slate-200/90 bg-white py-2.5 sm:py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition shadow-2xs"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Teclado numérico activado. Utilizado para facturación legal o recibos.
                  </p>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!businessName.trim()) {
                        setErrorMessage("Por favor ingresa el nombre de tu negocio.");
                        return;
                      }
                      setErrorMessage(null);
                      setStep(2);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-[#FF6B4A] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-md shadow-brand/25 hover:brightness-110 active:scale-98 transition cursor-pointer"
                  >
                    <span>Siguiente: Tu Servicio Estrella</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* PASO 2: SERVICIO ESTRELLA (NOMBRE, DURACIÓN, PRECIO NUMÉRICO) */}
          {/* ============================================================== */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="rounded-3xl sm:rounded-[28px] border border-slate-200/80 bg-white/95 p-5 xs:p-6 sm:p-8 shadow-[0_12px_40px_rgb(0,0,0,0.06)] backdrop-blur-xl"
            >
              <div className="mb-5 sm:mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-[11px] font-bold text-purple-700">
                  <Scissors className="h-3.5 w-3.5" />
                  Paso 2: Tu Catálogo
                </span>
                <h2 className="mt-3 text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-snug">
                  Crea tu Primer Servicio Estrella
                </h2>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Podrás agregar más servicios, combos y empleados desde el panel una vez creada tu cuenta.
                </p>
              </div>

              <div className="space-y-4 sm:space-y-5">
                {/* 2.1 Nombre del Servicio */}
                <div>
                  <label htmlFor="service-name-input" className="block text-xs font-bold text-slate-700">
                    Nombre del Servicio *
                  </label>
                  <input
                    id="service-name-input"
                    type="text"
                    required
                    autoCapitalize="words"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="Ej: Corte Clásico & Barba, Limpieza Facial..."
                    className="mt-1.5 w-full rounded-2xl border border-slate-200/90 bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition shadow-2xs"
                  />
                </div>

                {/* 2.2 Duración del Turno en Chips Rápidos */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Duración Estimada del Turno
                  </label>
                  <div className="grid grid-cols-5 gap-1 sm:gap-2">
                    {DURATION_PRESETS.map((item) => {
                      const active = duration === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setDuration(item.value)}
                          className={`py-2 sm:py-2.5 rounded-xl border text-center transition cursor-pointer active:scale-95 ${
                            active
                              ? "border-brand bg-brand text-white font-bold shadow-xs"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 font-semibold text-xs"
                          }`}
                        >
                          <span className="text-xs">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2.3 Precio en Guaraníes con Teclado Numérico y Chips */}
                <div>
                  <label htmlFor="service-price-input" className="block text-xs font-bold text-slate-700">
                    Precio en Guaraníes (Gs.)
                  </label>
                  <div className="relative mt-1.5">
                    <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="service-price-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={price}
                      onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                      placeholder="80000"
                      className="w-full rounded-2xl border border-slate-200/90 bg-white py-2.5 sm:py-3 pl-10 pr-4 text-sm font-bold text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition shadow-2xs"
                    />
                  </div>

                  {/* Chips de precios rápidos en Paraguay */}
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Precios sugeridos:</span>
                    {PRICE_PRESETS.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPrice(val)}
                        className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold transition cursor-pointer active:scale-95 ${
                          price === val
                            ? "border-brand bg-brand/10 text-brand"
                            : "border-slate-200 bg-white text-slate-600 hover:border-brand/40"
                        }`}
                      >
                        Gs. {Number(val).toLocaleString("es-PY")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vista previa de la tarjeta del servicio */}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-indigo-950">{serviceName || "Nombre del servicio"}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {duration} minutos de atención
                      </p>
                    </div>
                    <span className="text-xs font-black text-brand bg-white px-2.5 py-1 rounded-xl shadow-2xs border border-indigo-100">
                      Gs. {Number(price || 0).toLocaleString("es-PY")}
                    </span>
                  </div>
                </div>

                <div className="pt-3 flex justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 sm:px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Atrás</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!serviceName.trim()) {
                        setErrorMessage("Por favor ingresa el nombre de tu primer servicio.");
                        return;
                      }
                      setErrorMessage(null);
                      setStep(3);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-[#FF6B4A] px-5 sm:px-6 py-3 text-xs sm:text-sm font-black text-white shadow-md shadow-brand/25 hover:brightness-110 active:scale-98 transition cursor-pointer"
                  >
                    <span>Siguiente: WhatsApp & Cuenta</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* PASO 3: WHATSAPP, EMAIL DE ACCESO & ACTIVACIÓN FINAL */}
          {/* ============================================================== */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="rounded-3xl sm:rounded-[28px] border border-slate-200/80 bg-white/95 p-5 xs:p-6 sm:p-8 shadow-[0_12px_40px_rgb(0,0,0,0.06)] backdrop-blur-xl"
            >
              <div className="mb-5 sm:mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                  <Phone className="h-3.5 w-3.5" />
                  Paso 3: Conexión & Cuenta
                </span>
                <h2 className="mt-3 text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-snug">
                  WhatsApp y Acceso al Panel
                </h2>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Ingresa tu número para recibir alertas de turnos y tu correo para ingresar al panel de control.
                </p>
              </div>

              <div className="space-y-4">
                {/* 3.1 Selector Switch: Personal o Negocio */}
                <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        ¿Qué número de contacto vas a registrar?
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {phoneType === "business"
                          ? "Línea comercial o chip exclusivo del local"
                          : "Mi número de WhatsApp personal"}
                      </span>
                    </div>

                    <div className="flex items-center rounded-xl bg-slate-200/80 p-0.5 text-xs font-bold shrink-0">
                      <button
                        type="button"
                        onClick={() => setPhoneType("business")}
                        className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                          phoneType === "business"
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Negocio
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoneType("personal")}
                        className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                          phoneType === "personal"
                            ? "bg-white text-brand shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Personal
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3.2 WhatsApp con teclado tel nativo */}
                <div>
                  <label htmlFor="whatsapp-input" className="block text-xs font-bold text-slate-700">
                    {phoneType === "personal"
                      ? "Tu Número de WhatsApp Personal *"
                      : "Número de WhatsApp del Negocio *"}
                  </label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      🇵🇾 +595
                    </span>
                    <input
                      id="whatsapp-input"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="981 123 456"
                      className="w-full rounded-2xl border border-slate-200/90 bg-white py-2.5 sm:py-3 pl-20 pr-4 text-sm font-semibold text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition shadow-2xs"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {phoneType === "personal"
                      ? "Acá tus clientes escribirán y además te avisaremos en tiempo real cada vez que reserven un turno."
                      : "Línea comercial donde tus clientes escribirán y tu asistente atenderá automáticamente."}
                  </p>
                </div>

                {/* Opción adicional si es número de negocio: avisar al personal */}
                {phoneType === "business" && (
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-brand shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            Avisarme a mi WhatsApp personal cuando reserven
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Recibí un mensaje cada vez que un cliente agende una cita
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifyPersonal}
                        onChange={(e) => setNotifyPersonal(e.target.checked)}
                        className="h-4 w-4 rounded text-brand focus:ring-brand/30 border-slate-300 cursor-pointer"
                      />
                    </div>

                    {notifyPersonal && (
                      <div className="pt-1">
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            🇵🇾 +595
                          </span>
                          <input
                            type="tel"
                            inputMode="tel"
                            value={personalPhone}
                            onChange={(e) => setPersonalPhone(e.target.value)}
                            placeholder="981 700 800 (tu celular personal)"
                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50 py-2 pl-20 pr-3 text-xs font-semibold text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                          />
                        </div>
                        <p className="mt-1 text-[10px] text-slate-400">
                          Te enviaremos quién reservó, qué servicio y con qué profesional.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3.2 Nombre del Dueño/a */}
                <div>
                  <label htmlFor="owner-name-input" className="block text-xs font-bold text-slate-700">
                    Tu Nombre Completo *
                  </label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="owner-name-input"
                      type="text"
                      autoComplete="name"
                      autoCapitalize="words"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Ej: Marcos Benítez"
                      className="w-full rounded-2xl border border-slate-200/90 bg-white py-2.5 sm:py-3 pl-10 pr-4 text-sm font-semibold text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition shadow-2xs"
                    />
                  </div>
                </div>

                {/* 3.3 Email de Acceso */}
                <div>
                  <label htmlFor="owner-email-input" className="block text-xs font-bold text-slate-700">
                    Tu Correo de Acceso al Panel *
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="owner-email-input"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      required
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full rounded-2xl border border-slate-200/90 bg-white py-2.5 sm:py-3 pl-10 pr-4 text-sm font-semibold text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition shadow-2xs"
                    />
                  </div>
                </div>

                {/* Badge de Garantía */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-700" />
                      <span className="text-xs font-bold text-emerald-900">Plan Inicial Gratuito Activado</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Gs. 0 · Sin Tarjeta
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-emerald-800 leading-relaxed">
                    Tu cuenta incluye <strong>20 turnos por mes para siempre</strong> y cobro opcional de seña por transferencia para evitar plantones.
                  </p>
                </div>

                {errorMessage && (
                  <p className="rounded-xl bg-red-50 p-3 text-center text-xs font-semibold text-red-700">
                    {errorMessage}
                  </p>
                )}

                <div className="pt-3 flex justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 sm:px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Atrás</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={isFinishing}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 sm:px-8 py-3 text-xs sm:text-sm font-black text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-98 transition disabled:opacity-60 cursor-pointer"
                  >
                    {isFinishing ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Creando tu negocio...</span>
                      </>
                    ) : (
                      <>
                        <span>Activar Mi Agenda</span>
                        <Sparkles className="h-4 w-4" />
                      </>
                    )}
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
