import Link from "next/link";
import { CalendarCheck, ArrowLeft, ShieldCheck, Lock } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad | AgendatePY",
  description: "Tratamiento y protección de datos personales en AgendatePY en cumplimiento con las leyes de la República del Paraguay.",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-900 selection:bg-brand selection:text-white">
      {/* Cabecera */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-brand text-white shadow-xs">
              <CalendarCheck className="h-4 w-4" />
            </span>
            <span className="text-sm font-black tracking-tight">
              Agendate<span className="text-brand">PY</span>
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 sm:p-12 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Lock className="h-4 w-4" />
            <span>Privacidad & Seguridad de Datos</span>
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Política de Privacidad
          </h1>
          <p className="mt-2 text-xs text-slate-500">
            En cumplimiento con la Ley N° 6534/20 de Protección de Datos Personales Crediticios y Privados de Paraguay
          </p>

          <div className="mt-8 space-y-8 text-xs leading-relaxed text-slate-600 border-t border-slate-100 pt-8">
            <section>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                1. Datos Recopilados y Finalidad
              </h2>
              <p className="mt-2">
                AgendatePY recopila información de contacto básica necesaria para la prestación del servicio: nombre, número de teléfono celular (WhatsApp) y correo electrónico. Estos datos se utilizan exclusivamente para:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-slate-700">
                <li>Gestionar y registrar la reserva de turnos solicitada por el cliente.</li>
                <li>Enviar confirmaciones, recordatorios y avisos de reprogramación por WhatsApp.</li>
                <li>Permitir al comercio adherido emitir el comprobante legal correspondiente.</li>
                <li>Brindar soporte técnico y resolver incidencias de acceso.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                2. Consentimiento para Notificaciones y Ofertas
              </h2>
              <p className="mt-2">
                Durante el inicio de sesión y registro, el usuario puede otorgar su consentimiento explícito para recibir comunicaciones promocionales y novedades comerciales de AgendatePY. Este consentimiento puede ser revocado en cualquier momento desde el panel de usuario o respondiendo la palabra <strong>BAJA</strong> a los mensajes informativos.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                3. Integraciones de Terceros (WhatsApp, Sendwo, uPay)
              </h2>
              <p className="mt-2">
                Para el despacho de mensajes automatizados, interactuamos con servicios de mensajería autorizados como Sendwo Bot y Meta Cloud API. Para cobros electrónicos, la información financiera se transmite de forma cifrada a través de pasarelas reguladas (uPay / Bancard). AgendatePY nunca almacena datos sensibles de tarjetas de crédito o contraseñas bancarias en sus servidores.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                4. Derechos del Titular de los Datos (ARCO)
              </h2>
              <p className="mt-2">
                Todo usuario o cliente final tiene derecho a solicitar el acceso, rectificación, cancelación u oposición al tratamiento de sus datos personales enviando un correo a <span className="font-semibold text-slate-800">privacidad@agendate.py</span>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
