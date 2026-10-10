"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Smartphone, Send, Check } from "lucide-react";
import {
  getWhatsAppVerificationSettingsAction,
  saveWhatsAppVerificationSettingsAction,
  sendWhatsAppVerificationTestAction,
} from "@/lib/verification/actions";

function toLocal(phone: string) {
  return phone.startsWith("595") ? `0${phone.slice(3)}` : phone;
}

export default function WhatsAppVerificationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [savedEnabled, setSavedEnabled] = useState(false);
  const [senderPhone, setSenderPhone] = useState("");
  const [instance, setInstance] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [testPhone, setTestPhone] = useState("");
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    getWhatsAppVerificationSettingsAction()
      .then((res) => {
        if (res.ok) {
          setEnabled(res.config.enabled);
          setSavedEnabled(res.config.enabled);
          setSenderPhone(toLocal(res.config.senderPhone));
          setInstance(res.config.instance);
        } else {
          setMessage({ type: "error", text: res.error });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await saveWhatsAppVerificationSettingsAction({ enabled, senderPhone, instance });
    setSaving(false);
    if (res.ok) {
      setSenderPhone(toLocal(res.config.senderPhone));
      setInstance(res.config.instance);
      setSavedEnabled(res.config.enabled);
      setMessage({
        type: "ok",
        text: res.config.enabled
          ? "Guardado. Los negocios nuevos van a tener que verificar su WhatsApp."
          : "Guardado. La verificación está apagada: el registro no pide código.",
      });
    } else {
      setMessage({ type: "error", text: res.error });
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestMessage(null);
    const res = await sendWhatsAppVerificationTestAction(testPhone);
    setTesting(false);
    setTestMessage(res.ok ? { type: "ok", text: "Mensaje enviado. Revisá ese WhatsApp." } : { type: "error", text: res.error });
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#FF4F2B] focus:outline-none focus:ring-1 focus:ring-[#FF4F2B]/20 transition";

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-6 p-4 text-slate-900 sm:p-6 md:p-8">
      <div>
        <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          <div className="h-9 w-9 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#FF4F2B] shadow-2xs">
            <Smartphone className="h-5 w-5 shrink-0" />
          </div>
          <span>Verificación de WhatsApp</span>
        </h1>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Al registrarse, cada negocio recibe un código de 6 dígitos en su WhatsApp para confirmar que el número es suyo.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-[#FF4F2B]" />
          Cargando configuración…
        </div>
      ) : (
        <>
          <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <label htmlFor="verification-enabled" className="min-w-0 cursor-pointer">
                <span className="block text-sm font-bold text-slate-900">Pedir código al registrarse</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {savedEnabled
                    ? "Activo: nadie termina el registro sin verificar su número."
                    : "Apagado: el registro se completa sin código."}
                </span>
              </label>
              <button
                id="verification-enabled"
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled((v) => !v)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
                  enabled ? "bg-[#FF4F2B]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    enabled ? "translate-x-[22px]" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sender-phone" className="block text-xs font-semibold text-slate-700">
                Número que envía los códigos
              </label>
              <input
                id="sender-phone"
                type="tel"
                inputMode="tel"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="0981 123 456"
                className={inputClass}
              />
              <p className="text-xs text-slate-400">
                Tiene que ser el número vinculado a la instancia de WhatsApp de abajo. Es el que van a ver los negocios como remitente.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="instance" className="block text-xs font-semibold text-slate-700">
                Instancia de envío <span className="font-normal text-slate-400">(opcional)</span>
              </label>
              <input
                id="instance"
                type="text"
                value={instance}
                onChange={(e) => setInstance(e.target.value)}
                placeholder="Se usa la instancia principal si lo dejás vacío"
                className={inputClass}
              />
            </div>

            {message && (
              <p
                role="status"
                className={`flex items-start gap-1.5 text-xs font-semibold ${message.type === "ok" ? "text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200" : "text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200"}`}
              >
                {message.type === "ok" && <Check className="mt-px h-3.5 w-3.5 shrink-0" />}
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF4F2B] hover:bg-[#E03F1E] px-4 py-2 text-sm font-bold text-white transition disabled:opacity-60 shadow-xs cursor-pointer active:scale-98"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar cambios
            </button>
          </form>

          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Probar el envío</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Manda un mensaje de prueba con la configuración guardada.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="tel"
                inputMode="tel"
                aria-label="Número para la prueba"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="Tu celular, ej: 0981 123 456"
                className={inputClass}
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !testPhone.trim()}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Enviar prueba
              </button>
            </div>
            {testMessage && (
              <p role="status" className={`text-xs font-semibold ${testMessage.type === "ok" ? "text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200" : "text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200"}`}>
                {testMessage.text}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
