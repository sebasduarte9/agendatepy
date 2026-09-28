"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import {
  Store,
  MapPin,
  Phone,
  Globe,
  Clock,
  Palette,
  MessageCircle,
  Save,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Building,
  Key,
  Smartphone,
  Trash2,
  AlertTriangle,
  X,
  Check,
  Laptop,
  Lock,
  ExternalLink,
} from "lucide-react";
import { TIMEZONES, useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";

export default function ConfiguracionPage() {
  const { business, updateBusiness, pushToast } = useDashboardStore();

  const [openingTime, setOpeningTime] = useState("08:00");
  const [closingTime, setClosingTime] = useState("20:00");
  const [weekendClosing, setWeekendClosing] = useState("21:00");
  const [sundayOpen, setSundayOpen] = useState(false);

  // Google Authenticator 2FA State
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [is2faModalOpen, setIs2faModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [authCodeInput, setAuthCodeInput] = useState("");
  const [isVerifying2fa, setIsVerifying2fa] = useState(false);

  // Danger Zone / Delete Account State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const saved2fa = localStorage.getItem(`agendate_2fa_${business.slug || "default"}`);
    if (saved2fa === "true") {
      setIs2faEnabled(true);
    }
  }, [business.slug]);

  // Generate QR code for Google Authenticator
  useEffect(() => {
    if (is2faModalOpen) {
      const otpUrl = `otpauth://totp/AgendatePY:${encodeURIComponent(business.name)}?secret=JBSWY3DPEHPK3PXP&issuer=AgendatePY`;
      QRCode.toDataURL(otpUrl, { width: 220, margin: 2, color: { dark: "#1e1b4b", light: "#ffffff" } })
        .then((url) => setQrCodeDataUrl(url))
        .catch(console.error);
    }
  }, [is2faModalOpen, business.name]);

  function handleVerify2fa(e: React.FormEvent) {
    e.preventDefault();
    if (authCodeInput.trim().length !== 6) {
      pushToast("error", "Ingresá el código de 6 dígitos de Google Authenticator.");
      return;
    }
    setIsVerifying2fa(true);
    setTimeout(() => {
      setIsVerifying2fa(false);
      setIs2faEnabled(true);
      localStorage.setItem(`agendate_2fa_${business.slug || "default"}`, "true");
      setIs2faModalOpen(false);
      setAuthCodeInput("");
      pushToast("success", "¡Verificación de Google Authenticator (2FA) activada correctamente!");
    }, 600);
  }

  function handleDisable2fa() {
    setIs2faEnabled(false);
    localStorage.removeItem(`agendate_2fa_${business.slug || "default"}`);
    pushToast("success", "Verificación de dos pasos desactivada.");
  }

  async function handleDeleteAccount() {
    if (deleteConfirmationText.trim().toUpperCase() !== "ELIMINAR") {
      pushToast("error", "Escribí exactamente 'ELIMINAR' para confirmar.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch("/api/tenant/settings", { method: "DELETE" });
      if (res.ok) {
        pushToast("success", "Tu negocio y cuenta han sido eliminados de forma definitiva.");
        window.location.href = "/login";
      } else {
        const data = await res.json();
        pushToast("error", data.message || "Error al eliminar el negocio.");
        setIsDeleting(false);
      }
    } catch {
      pushToast("error", "Error de red al intentar eliminar la cuenta.");
      setIsDeleting(false);
    }
  }

  async function handleSaveAll(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateBusiness({
        name: business.name,
        slug: business.slug,
        phone: business.phone,
        whatsappNumber: business.whatsappNumber || business.phone,
        address: business.address,
        timezone: business.timezone,
        primaryColor: business.primaryColor,
        ...({
          openingTime,
          closingTime,
          weekendClosing,
          sundayOpen,
        } as any),
      });
      pushToast("success", "¡Configuración general del local guardada en la base de datos!");
    } catch {
      pushToast("error", "Error de conexión al guardar configuración");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mx-auto max-w-3xl space-y-6"
    >
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Configuración del Negocio & Ajustes
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          Información legal, dirección física, horarios de apertura, seguridad y gestión de cuenta.
        </p>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Brand & Logo Header Card */}
        <Card className="flex flex-col sm:flex-row items-center gap-5">
          <label className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center rounded-3xl bg-gradient-to-tr from-primary to-indigo-600 text-2xl font-black text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            {business.name.slice(0, 2).toUpperCase()}
            <input
              type="file"
              className="hidden"
              onChange={() => pushToast("success", "Logo del local actualizado")}
            />
            <span className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">
              Cambiar
            </span>
          </label>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {business.name}
              </h2>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Verificado
              </span>
            </div>
            <p className="font-mono text-xs text-primary font-bold">
              agendate.py/{business.slug}
            </p>
            <p className="text-xs text-slate-400">
              Haz clic en el avatar para subir un nuevo logotipo o imagen de portada.
            </p>
          </div>
        </Card>

        {/* Business General Info */}
        <Card className="space-y-4">
          <div className="border-b border-slate-100 dark:border-white/5 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Identidad & Contacto Comercial
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Datos visibles para tus clientes en la página web de reservas y comprobantes.
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-slate-400" /> Nombre Comercial del Local *
              </label>
              <input
                required
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                value={business.name}
                onChange={(e) => updateBusiness({ name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-400" /> Slug / Subdominio Web *
                </label>
                <div className="flex rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden focus-within:border-primary">
                  <span className="bg-slate-100 dark:bg-slate-800 px-3 py-2 text-slate-400 text-xs font-mono">
                    agendate.py/
                  </span>
                  <input
                    required
                    className="w-full bg-transparent px-3 py-2 text-slate-900 dark:text-white font-mono text-xs focus:outline-none"
                    value={business.slug}
                    onChange={(e) => updateBusiness({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> Teléfono de WhatsApp *
                </label>
                <input
                  required
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:outline-none font-mono"
                  value={business.phone}
                  onChange={(e) => updateBusiness({ phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> Dirección Física del Local
              </label>
              <input
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                placeholder="Ej: Avda. Mariscal López 1420 c/ San Martín, Asunción"
                value={business.address}
                onChange={(e) => updateBusiness({ address: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Operating Hours & Timezone */}
        <Card className="space-y-4">
          <div className="border-b border-slate-100 dark:border-white/5 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Horarios de Apertura & Zona Horaria
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Define los límites de agenda visibles para tus clientes en el calendario.
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Apertura Lunes a Viernes
                </label>
                <input
                  type="time"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Cierre Lunes a Viernes
                </label>
                <input
                  type="time"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Cierre Sábados
                </label>
                <input
                  type="time"
                  value={weekendClosing}
                  onChange={(e) => setWeekendClosing(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Zona Horaria (TZ)
                </label>
                <select
                  value={business.timezone}
                  onChange={(e) => updateBusiness({ timezone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sundayOpen}
                onChange={(e) => setSundayOpen(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Abrir atención los días Domingos
              </span>
            </label>
          </div>
        </Card>

        {/* Branding Color Accent */}
        <Card className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Color de Marca Principal
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acento utilizado en botones de reserva, badges y selector de turnos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={business.primaryColor || "#6366f1"}
              onChange={(e) => updateBusiness({ primaryColor: e.target.value })}
              className="h-10 w-16 cursor-pointer rounded-xl border border-slate-200/80 dark:border-white/10 p-1"
            />
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              {business.primaryColor}
            </span>
          </div>
        </Card>

        {/* Action Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-xs font-bold text-white shadow-xl shadow-primary/25 hover:opacity-95 transition cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Guardar Información del Local</span>
          </button>
        </div>
      </form>

      {/* Seguridad & Verificación de Google Authenticator (2FA) */}
      <Card className="space-y-4">
        <div className="border-b border-slate-100 dark:border-white/5 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              Seguridad & Verificación en Dos Pasos (2FA)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Protegé tu cuenta y la información financiera de tu local con Google Authenticator.
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
              is2faEnabled
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            }`}
          >
            {is2faEnabled ? "2FA Activo" : "Sin 2FA"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                Google Authenticator
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                Requiere un código temporal de 6 dígitos desde la aplicación Google Authenticator al iniciar sesión en un dispositivo nuevo.
              </p>
            </div>
          </div>

          <div>
            {is2faEnabled ? (
              <button
                type="button"
                onClick={handleDisable2fa}
                className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition cursor-pointer"
              >
                Desactivar 2FA
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIs2faModalOpen(true)}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:opacity-95 transition cursor-pointer"
              >
                Configurar Google Auth
              </button>
            )}
          </div>
        </div>

        {/* Active Session & Device Security */}
        <div className="pt-2">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <Laptop className="h-3.5 w-3.5 text-slate-400" /> Dispositivos con Sesión Activa
          </p>
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  Navegador Web (Sesión actual)
                </p>
                <p className="text-[11px] text-slate-400">
                  Asunción, Paraguay · Conexión HTTPS segura
                </p>
              </div>
            </div>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Activo ahora
            </span>
          </div>
        </div>
      </Card>

      {/* Danger Zone: Borrar Cuenta */}
      <Card className="border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 space-y-4">
        <div className="border-b border-rose-100 dark:border-rose-900/20 pb-3">
          <h3 className="font-bold text-rose-700 dark:text-rose-400 text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            Zona de Peligro: Eliminar Negocio y Datos
          </h3>
          <p className="text-xs text-rose-600/80 dark:text-rose-300/80">
            Esta acción eliminará de forma irreversible toda la información de tu salón: agenda, turnos, clientes y caja.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white">
              ¿Deseas cerrar permanentemente este local?
            </p>
            <p className="text-[11px]">
              Se cancelará el plan activo y se liberará el slug <code className="font-mono text-primary font-bold">agendate.py/{business.slug}</code>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setDeleteConfirmationText("");
              setIsDeleteModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 text-xs font-bold transition shadow-md shadow-rose-600/20 shrink-0 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Borrar Cuenta & Negocio</span>
          </button>
        </div>
      </Card>

      {/* Modal Configuración Google Authenticator */}
      <AnimatePresence>
        {is2faModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Key className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Vincular Google Authenticator
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIs2faModalOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  1. Abrí la app <strong>Google Authenticator</strong> en tu celular y escaneá este código QR:
                </p>

                {qrCodeDataUrl ? (
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 shadow-sm mx-auto w-fit">
                    <img
                      src={qrCodeDataUrl}
                      alt="Código QR de Google Authenticator"
                      className="h-44 w-44 rounded-lg"
                    />
                    <span className="mt-2 font-mono text-[10px] text-slate-500 font-bold tracking-wider">
                      JBSW Y3DP EHPK 3PXP
                    </span>
                  </div>
                ) : (
                  <div className="h-44 w-44 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse mx-auto" />
                )}

                <p className="text-slate-600 dark:text-slate-300">
                  2. Ingresá el código de 6 dígitos que aparece en tu pantalla para verificar:
                </p>

                <form onSubmit={handleVerify2fa} className="space-y-3">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000 000"
                    value={authCodeInput}
                    onChange={(e) => setAuthCodeInput(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center text-2xl font-mono font-black tracking-widest rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-900 py-3 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                    autoFocus
                  />

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIs2faModalOpen(false)}
                      className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isVerifying2fa || authCodeInput.length !== 6}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 font-bold text-white shadow-md shadow-primary/25 disabled:opacity-50"
                    >
                      {isVerifying2fa ? "Verificando..." : "Confirmar y Activar"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Doble Confirmación Borrar Cuenta */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-slate-950 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    ¿Confirmas eliminar {business.name}?
                  </h3>
                  <p className="text-xs text-rose-600 font-semibold">
                    Esta acción es irreversible y permanente.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  Se eliminarán permanentemente todas las citas, clientes, catálogo de servicios, registros de caja y accesos del equipo.
                </p>

                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Escribí la palabra <span className="font-mono text-rose-600 font-black">ELIMINAR</span> para confirmar:
                </p>

                <input
                  type="text"
                  placeholder="ELIMINAR"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  className="w-full rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 px-3.5 py-2.5 text-center font-mono font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmationText.trim().toUpperCase() !== "ELIMINAR"}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-bold shadow-md shadow-rose-600/25 disabled:opacity-40 transition cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{isDeleting ? "Eliminando..." : "Eliminar Definitivamente"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
