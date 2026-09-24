"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Send,
  Bell,
  CheckCheck,
  Smartphone,
  Cpu,
  RefreshCw,
  Zap,
  Radio,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";

const AVAILABLE_TAGS = [
  { tag: "{cliente}", label: "Nombre Cliente" },
  { tag: "{servicio}", label: "Nombre Servicio" },
  { tag: "{profesional}", label: "Profesional" },
  { tag: "{fecha}", label: "Fecha Turno" },
  { tag: "{hora}", label: "Hora Turno" },
  { tag: "{negocio}", label: "Nombre Negocio" },
  { tag: "{direccion}", label: "Dirección" },
  { tag: "{link_autogestion}", label: "Link Cancelar/Reprogramar" },
];

export default function WhatsAppHubPage() {
  const {
    business,
    whatsappTemplates,
    evolutionApi,
    updateWhatsAppTemplate,
    toggleWhatsAppTemplate,
    updateEvolutionApi,
    updateBusiness,
    pushToast,
  } = useDashboardStore();

  const [activeTab, setActiveTab] = useState<"plantillas" | "evolution">("plantillas");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    whatsappTemplates[0]?.id || "wt-confirmacion"
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [testPhone, setTestPhone] = useState("0981 123 456");
  const [sendingTest, setSendingTest] = useState(false);

  // Evolution API local form
  const [evoForm, setEvoForm] = useState({
    baseUrl: evolutionApi.baseUrl,
    apiKey: evolutionApi.apiKey,
    instanceName: evolutionApi.instanceName,
    autoSendOnBooking: evolutionApi.autoSendOnBooking,
    autoSendOnCancel: evolutionApi.autoSendOnCancel,
  });

  const currentTemplate =
    whatsappTemplates.find((t) => t.id === selectedTemplateId) ||
    whatsappTemplates[0];

  const slug = business.slug || "barberia";
  const bookingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${slug}/reservar`
    : `https://agendate.py/${slug}/reservar`;
  const whatsappAutoReply = `¡Hola! Gracias por comunicarte con *${business.name}*. Para ver nuestros servicios disponibles y agendar tu turno al instante sin esperar respuesta, accedé al enlace oficial:\n${bookingUrl}`;

  function insertTag(tag: string) {
    if (!currentTemplate) return;
    const updated = currentTemplate.body + " " + tag;
    updateWhatsAppTemplate(currentTemplate.id, updated);
  }

  function getPreviewText(templateBody: string) {
    return templateBody
      .replace(/{cliente}/g, "Martín Duarte")
      .replace(/{servicio}/g, "Corte + Ritual de Barba")
      .replace(/{profesional}/g, "Marcos Benítez")
      .replace(/{fecha}/g, "Viernes 25 de Septiembre")
      .replace(/{hora}/g, "16:30")
      .replace(/{negocio}/g, business.name)
      .replace(/{direccion}/g, business.address)
      .replace(
        /{link_autogestion}/g,
        `https://agendate.py/turno/ap-demo-123`
      )
      .replace(/{link_negocio}/g, bookingUrl);
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedLink(true);
    pushToast("success", "Copiado al portapapeles");
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function handleSaveEvo(e: React.FormEvent) {
    e.preventDefault();
    updateEvolutionApi(evoForm);
    pushToast("success", "Configuración de Evolution API guardada");
  }

  function handleSendTest() {
    if (!testPhone.trim()) {
      pushToast("error", "Ingresá un número de teléfono");
      return;
    }
    setSendingTest(true);
    setTimeout(() => {
      setSendingTest(false);
      pushToast("success", `¡Mensaje de prueba enviado exitosamente a ${testPhone}!`);
    }, 1000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            WhatsApp Hub & Automatización de Recordatorios
          </h1>
          <p className="text-sm text-slate-500">
            Confirmaciones instantáneas, recordatorios 24h y 2h antes para reducir inasistencias hasta en un 80%.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-border px-3.5 py-2 rounded-xl shadow-sm cursor-pointer">
            <span>WhatsApp Activo</span>
            <input
              type="checkbox"
              checked={business.whatsappOn}
              onChange={(e) => {
                updateBusiness({ whatsappOn: e.target.checked });
                pushToast(
                  "success",
                  `WhatsApp automático ${e.target.checked ? "activado" : "pausado"}`
                );
              }}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("plantillas")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "plantillas"
              ? "bg-primary text-white shadow-xs"
              : "bg-white text-slate-600 border border-border hover:bg-slate-50"
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          Plantillas & Recordatorios (24h / 2h)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("evolution")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "evolution"
              ? "bg-primary text-white shadow-xs"
              : "bg-white text-slate-600 border border-border hover:bg-slate-50"
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          Servidor Evolution API (Baileys)
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
        </button>
      </div>

      {activeTab === "evolution" ? (
        /* Evolution API Configuration & Test Tab */
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="space-y-5 lg:col-span-7">
            {/* Status Card */}
            <Card className="border border-emerald-200 bg-emerald-50/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                    <Radio className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Instancia Conectada · Evolution API v2
                    </h2>
                    <p className="text-xs text-emerald-700">
                      Sesión activa: <strong>{evolutionApi.instanceName}</strong> (Socket WhatsApp Web)
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
                  En línea
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Los mensajes automáticos se despachan de forma asíncrona mediante el runtime de Next.js sin demorar la respuesta de reserva de tus clientes.
              </p>
            </Card>

            {/* Credentials Form */}
            <Card className="border border-slate-200 space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Parámetros del Servidor Evolution API</h2>
              <form onSubmit={handleSaveEvo} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Evolution API URL</label>
                  <input
                    type="url"
                    required
                    value={evoForm.baseUrl}
                    onChange={(e) => setEvoForm({ ...evoForm, baseUrl: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border px-3.5 py-2 text-xs font-mono text-slate-900 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Global API Key / Token</label>
                  <input
                    type="password"
                    required
                    value={evoForm.apiKey}
                    onChange={(e) => setEvoForm({ ...evoForm, apiKey: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border px-3.5 py-2 text-xs font-mono text-slate-900 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Instance Name (Instancia)</label>
                  <input
                    type="text"
                    required
                    value={evoForm.instanceName}
                    onChange={(e) => setEvoForm({ ...evoForm, instanceName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border px-3.5 py-2 text-xs font-mono text-slate-900 outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-2 space-y-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={evoForm.autoSendOnBooking}
                      onChange={(e) => setEvoForm({ ...evoForm, autoSendOnBooking: e.target.checked })}
                      className="h-4 w-4 rounded text-primary focus:ring-primary"
                    />
                    <span>Despachar automáticamente al confirmar nueva reserva</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={evoForm.autoSendOnCancel}
                      onChange={(e) => setEvoForm({ ...evoForm, autoSendOnCancel: e.target.checked })}
                      className="h-4 w-4 rounded text-primary focus:ring-primary"
                    />
                    <span>Despachar automáticamente al cancelar turno</span>
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition"
                  >
                    Guardar Configuración
                  </button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right Column: Send Test Message */}
          <div className="space-y-4 lg:col-span-5">
            <Card className="border border-slate-200 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">Enviar Mensaje de Prueba</h2>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verificá que tu instancia de Evolution API responda correctamente enviando un mensaje directo a tu celular.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Número de Celular</label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="Ej. 0981 123 456"
                  className="mt-1 w-full rounded-xl border border-border px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-primary"
                />
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-800">Mensaje que se enviará:</p>
                <p className="italic text-[11px] text-slate-600">
                  &ldquo;¡Hola! Este es un mensaje de prueba exitoso desde tu servidor Evolution API en AgendatePY.&rdquo;
                </p>
              </div>

              <button
                type="button"
                disabled={sendingTest}
                onClick={handleSendTest}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {sendingTest ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sendingTest ? "Enviando prueba..." : "Enviar WhatsApp de Prueba"}
              </button>
            </Card>
          </div>
        </div>
      ) : (
        /* Templates Tab */
        <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Template Selection & Editing */}
        <div className="space-y-5 lg:col-span-7">
          {/* Template Selector Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {whatsappTemplates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTemplateId(t.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
                  selectedTemplateId === t.id
                    ? "bg-primary text-white shadow-sm"
                    : "border border-border bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Bell className="h-3 w-3" />
                <span>{t.name}</span>
              </button>
            ))}
          </div>

          {currentTemplate && (
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="font-bold text-slate-900">{currentTemplate.name}</h3>
                  <p className="text-xs text-slate-500">
                    Disparador automático cuando ocurre la acción en la agenda.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <span>Habilitado</span>
                  <input
                    type="checkbox"
                    checked={currentTemplate.enabled}
                    onChange={() => toggleWhatsAppTemplate(currentTemplate.id)}
                    className="h-4 w-4 rounded text-primary focus:ring-primary"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Variables dinámicas (tocá para insertar):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_TAGS.map(({ tag, label }) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertTag(tag)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-mono text-slate-700 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition"
                    >
                      +{label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mensaje a enviar:
                </label>
                <textarea
                  rows={6}
                  value={currentTemplate.body}
                  onChange={(e) =>
                    updateWhatsAppTemplate(currentTemplate.id, e.target.value)
                  }
                  className="w-full rounded-2xl border border-border p-3.5 text-sm font-sans text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Tip: Podés usar formato de WhatsApp como *negrita* o _cursiva_.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Cambios guardados automáticamente
                </span>
                <button
                  type="button"
                  onClick={() => pushToast("success", "Plantilla guardada")}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
                >
                  Guardar Plantilla
                </button>
              </div>
            </Card>
          )}

          {/* WhatsApp Business Greeting helper */}
          <Card className="border-emerald-100 bg-emerald-50/40 space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <Smartphone className="h-5 w-5" />
              </span>
              <div>
                <h4 className="font-bold text-slate-900">
                  Respuesta Automática para tu WhatsApp Business
                </h4>
                <p className="text-xs text-slate-600">
                  Copiá este mensaje en tu bienvenida de WhatsApp Business para que tus clientes reciban tu link solos.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-white border border-emerald-200/80 p-3 text-xs text-slate-800 font-mono whitespace-pre-wrap">
              {whatsappAutoReply}
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(whatsappAutoReply)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedLink ? "¡Copiado!" : "Copiar Respuesta Automática"}
            </button>
          </Card>
        </div>

        {/* Right Column: WhatsApp Live Phone Preview */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="mx-auto max-w-[320px] rounded-[44px] border-[6px] border-slate-900 bg-slate-900 p-2 shadow-2xl">
            {/* Phone Screen */}
            <div className="overflow-hidden rounded-[36px] bg-[#EFE7DE] text-slate-900">
              {/* WhatsApp Header */}
              <div className="flex items-center justify-between bg-[#008069] px-4 py-3 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 font-bold text-xs">
                    AG
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">{business.name}</p>
                    <p className="text-[10px] text-white/80">en línea</p>
                  </div>
                </div>
              </div>

              {/* Chat Canvas with Wallpaper */}
              <div className="p-3.5 min-h-[360px] flex flex-col justify-end space-y-3">
                <div className="text-center">
                  <span className="rounded-md bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-xs">
                    HOY
                  </span>
                </div>

                {/* Received Bubble */}
                <div className="flex justify-start">
                  <div className="max-w-[90%] rounded-2xl rounded-tl-xs bg-white p-3 text-xs shadow-sm">
                    <p className="whitespace-pre-wrap leading-relaxed text-slate-800">
                      {currentTemplate ? getPreviewText(currentTemplate.body) : ""}
                    </p>
                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                      <span>14:30</span>
                      <CheckCheck className="h-3 w-3 text-sky-500" />
                    </div>
                  </div>
                </div>

                {/* Mock Client Response */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-xs bg-[#D9FDD3] p-2.5 text-xs text-slate-800 shadow-sm">
                    <p>¡Muchas gracias! Ya tengo agendado el turno.</p>
                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                      <span>14:32</span>
                      <CheckCheck className="h-3 w-3 text-sky-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Footer Input Mock */}
              <div className="bg-[#f0f2f5] p-2 flex items-center gap-2 border-t border-slate-200">
                <div className="flex-1 rounded-full bg-white px-3 py-1.5 text-[11px] text-slate-400">
                  Escribir un mensaje...
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#008069] text-white">
                  <Send className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400">
              Vista previa en tiempo real de cómo recibe el mensaje tu cliente en su teléfono celular.
            </p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
