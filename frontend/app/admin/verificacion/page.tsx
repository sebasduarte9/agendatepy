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
    "w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-700/50";

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-6 p-4 text-slate-100 sm:p-6 md:p-8">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          <Smartphone className="h-5 w-5 shrink-0 text-slate-400" />
          <span>Verificación de WhatsApp</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          Al registrarse, cada negocio recibe un código de 6 dígitos en su WhatsApp para confirmar que el número es suyo.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando configuración…
        </div>
      ) : (
        <>
          <form onSubmit={handleSave} className="space-y-5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <label htmlFor="verification-enabled" className="min-w-0 cursor-pointer">
                <span className="block text-sm font-medium text-white">Pedir código al registrarse</span>
                <span className="mt-0.5 block text-xs text-slate-400">
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
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  enabled ? "bg-emerald-500" : "bg-slate-700"
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
              <label htmlFor="sender-phone" className="block text-xs font-medium text-slate-300">
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
              <p className="text-xs text-slate-500">
                Tiene que ser el número vinculado a la instancia de WhatsApp de abajo. Es el que van a ver los negocios como remitente.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="instance" className="block text-xs font-medium text-slate-300">
                Instancia de envío <span className="font-normal text-slate-500">(opcional)</span>
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
                className={`flex items-start gap-1.5 text-xs ${message.type === "ok" ? "text-emerald-400" : "text-rose-400"}`}
              >
                {message.type === "ok" && <Check className="mt-px h-3.5 w-3.5 shrink-0" />}
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar cambios
            </button>
          </form>

          <div className="space-y-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5">
            <div>
              <h2 className="text-sm font-medium text-white">Probar el envío</h2>
              <p className="mt-0.5 text-xs text-slate-400">
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
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
              >
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Enviar prueba
              </button>
            </div>
            {testMessage && (
              <p role="status" className={`text-xs ${testMessage.type === "ok" ? "text-emerald-400" : "text-rose-400"}`}>
                {testMessage.text}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
