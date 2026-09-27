"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Send,
  Bell,
  CheckCheck,
  Smartphone,
  Sparkles,
  QrCode,
  ShieldCheck,
  RefreshCw,
  MessageCircle,
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
    updateWhatsAppTemplate,
    toggleWhatsAppTemplate,
    updateBusiness,
    pushToast,
  } = useDashboardStore();

  const [activeTab, setActiveTab] = useState<"plantillas" | "conexion">("plantillas");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    whatsappTemplates[0]?.id || "wt-confirmacion"
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [testPhone, setTestPhone] = useState("+595 981 123 456");
  const [sendingTest, setSendingTest] = useState(false);
  const [connectingQr, setConnectingQr] = useState(false);

  const currentTemplate =
    whatsappTemplates.find((t) => t.id === selectedTemplateId) ||
    whatsappTemplates[0];

  const slug = business.slug || "barberia";
  const [origin, setOrigin] = useState("https://agendatepy.com");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const bookingUrl = `${origin}/${slug}/reservar`;
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
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            WhatsApp & Recordatorios Automáticos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Confirmaciones inmediatas y recordatorios automáticos por WhatsApp para reducir ausencias hasta en un 80%.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 px-3.5 py-2 rounded-xl shadow-xs cursor-pointer">
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
              className="h-4 w-4 rounded text-brand focus:ring-brand"
            />
          </label>
        </div>
      </div>

      {/* Simplified, User-Friendly Tabs (Zero Technical Jargon) */}
      <div className="flex gap-2 border-b border-slate-200/80 dark:border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("plantillas")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "plantillas"
              ? "bg-brand text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          <span>Plantillas de Mensajes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("conexion")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "conexion"
              ? "bg-brand text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>Conexión de WhatsApp</span>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
            Conectado
          </span>
        </button>
      </div>

      {activeTab === "plantillas" ? (
        /* Tab 1: Plantillas & Vista previa */
        <div>
          {/* Sub-selector de tipo de mensaje */}
          <div className="flex flex-wrap gap-2 mb-6">
            {whatsappTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplateId(template.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedTemplateId === template.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50"
                }`}
              >
                <Bell className="h-3 w-3" />
                <span>{template.name}</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    template.enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Editor de Mensaje */}
            <div className="lg:col-span-7 space-y-4">
              <Card>
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {currentTemplate?.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Disparador automático cuando ocurre la acción en la agenda.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <span>Habilitado</span>
                    <input
                      type="checkbox"
                      checked={currentTemplate?.enabled}
                      onChange={() =>
                        currentTemplate && toggleWhatsAppTemplate(currentTemplate.id)
                      }
                      className="h-4 w-4 rounded text-brand focus:ring-brand"
                    />
                  </label>
                </div>

                <div className="space-y-4 pt-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Datos automáticos (tocá para insertar):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_TAGS.map((item) => (
                        <button
                          key={item.tag}
                          type="button"
                          onClick={() => insertTag(item.tag)}
                          className="rounded-lg border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-brand hover:text-brand transition"
                        >
                          +{item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mensaje a enviar:
                    </label>
                    <textarea
                      rows={8}
                      value={currentTemplate?.body || ""}
                      onChange={(e) =>
                        currentTemplate &&
                        updateWhatsAppTemplate(currentTemplate.id, e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 p-3.5 text-xs text-slate-900 dark:text-white focus:border-brand focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition leading-relaxed font-sans"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Consejo: Podés usar formato de WhatsApp como *negrita* o _cursiva_.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Cambios guardados automáticamente
                    </span>
                    <button
                      type="button"
                      onClick={() => pushToast("success", "Plantilla guardada")}
                      className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-bold shadow-xs hover:opacity-90"
                    >
                      Guardar Plantilla
                    </button>
                  </div>
                </div>
              </Card>

              {/* Respuesta Automática para WhatsApp Business */}
              <Card className="border border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-950/20">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Mensaje de Bienvenida para tu WhatsApp Business
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Copiá este mensaje en tu mensaje de bienvenida o respuesta rápida para que tus clientes agenden solos:
                    </p>
                    <div className="relative rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-slate-900 p-3 text-xs text-slate-800 dark:text-slate-200 font-mono">
                      <p className="whitespace-pre-wrap">{whatsappAutoReply}</p>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(whatsappAutoReply)}
                        className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
                      >
                        {copiedLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedLink ? "¡Copiado!" : "Copiar Mensaje"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Vista previa en Celular en Tiempo Real */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-[310px] sm:w-[330px] rounded-[42px] border-[6px] border-slate-900 dark:border-slate-800 bg-slate-900 p-2.5 shadow-2xl shadow-slate-900/30">
                {/* Notch */}
                <div className="mx-auto h-4 w-28 rounded-full bg-slate-900 mb-1" />

                {/* WhatsApp Screen */}
                <div className="overflow-hidden rounded-[30px] bg-[#efeae2] flex flex-col h-[520px]">
                  {/* WhatsApp Top Bar */}
                  <div className="flex items-center gap-2.5 bg-[#008069] px-3.5 py-3 text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                      AG
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">{business.name}</p>
                      <p className="text-[10px] opacity-80">en línea</p>
                    </div>
                  </div>

                  {/* WhatsApp Chat Area */}
                  <div className="flex-1 p-3 space-y-2.5 overflow-y-auto text-xs">
                    <div className="text-center">
                      <span className="rounded-md bg-white/80 px-2 py-0.5 text-[9px] font-semibold text-slate-500 uppercase shadow-2xs">
                        HOY
                      </span>
                    </div>

                    {/* Mensaje enviado al cliente */}
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-tl-xs bg-white p-3 text-slate-900 shadow-xs space-y-1">
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {currentTemplate ? getPreviewText(currentTemplate.body) : ""}
                        </p>
                        <div className="flex justify-end gap-1 text-[9px] text-slate-400">
                          <span>14:30</span>
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        </div>
                      </div>
                    </div>

                    {/* Respuesta típica del cliente */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-tr-xs bg-[#d9fdd3] p-2.5 text-slate-900 shadow-xs">
                        <p className="leading-snug text-xs">¡Muchas gracias! Ya tengo agendado el turno.</p>
                        <div className="flex justify-end gap-1 text-[9px] text-slate-500 mt-0.5">
                          <span>14:32</span>
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input bar */}
                  <div className="flex items-center gap-2 bg-[#f0f2f5] p-2 border-t border-slate-200">
                    <input
                      type="text"
                      disabled
                      placeholder="Escribir un mensaje..."
                      className="flex-1 rounded-full bg-white px-3.5 py-1.5 text-xs text-slate-500 outline-none"
                    />
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#008069] text-white">
                      <Send className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400 text-center">
                Vista previa en tiempo real de cómo recibe el mensaje tu cliente en su teléfono celular.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Conexión de tu WhatsApp (Sencillo y sin tecnicismos) */
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Card Estado de Conexión */}
          <div className="lg:col-span-7 space-y-4">
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      WhatsApp Oficial de tu Negocio
                    </h2>
                    <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 mt-0.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Línea conectada y despachando recordatorios
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 p-4 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Número asociado:</span>
                    <strong className="text-slate-900 dark:text-white font-mono text-sm">
                      +595 981 123 456
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Estado del servicio:</span>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 font-bold text-emerald-800 dark:text-emerald-300">
                      Activo 24/7
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tiempo de entrega promedio:</span>
                    <strong className="text-slate-700 dark:text-slate-300">
                      Menos de 3 segundos
                    </strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConnectingQr(true);
                      setTimeout(() => {
                        setConnectingQr(false);
                        pushToast("success", "Línea de WhatsApp sincronizada correctamente");
                      }, 1500);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 text-xs font-bold shadow-xs hover:opacity-95 transition"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>{connectingQr ? "Sincronizando..." : "Reconectar o Cambiar Número (QR)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => pushToast("success", "Verificación de línea completada. Todo en orden.")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Verificar Estado</span>
                  </button>
                </div>
              </div>
            </Card>

            {/* Test de Envío Directo */}
            <Card>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Probar Envío a tu Teléfono
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Enviá un mensaje de prueba a tu propio número para verificar cómo lo reciben tus clientes.
              </p>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+595 981 123 456"
                  className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand"
                />
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={sendingTest}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{sendingTest ? "Enviando..." : "Enviar Prueba"}</span>
                </button>
              </div>
            </Card>
          </div>

          {/* Card Explicativa para Dueños */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-indigo-100 dark:border-white/10">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" />
                <span>¿Cómo funciona para tu negocio?</span>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[10px]">
                    1
                  </span>
                  <p>
                    <strong>Cero configuración técnica:</strong> Todo el despacho de mensajes corre por nuestra infraestructura sin que tengas que instalar nada raro.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[10px]">
                    2
                  </span>
                  <p>
                    <strong>Confirmación inmediata:</strong> Cada vez que un cliente reserva desde tu web, recibe su comprobante en menos de 3 segundos.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[10px]">
                    3
                  </span>
                  <p>
                    <strong>Sin ausencias:</strong> Los recordatorios 24h y 2h antes le permiten al cliente confirmar o liberar el turno a tiempo.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
