import Link from "next/link";
import { CalendarCheck, ArrowLeft, Shield, FileText } from "lucide-react";

export const metadata = {
  title: "Términos y Condiciones | AgendatePY",
  description: "Términos de servicio y condiciones de uso de la plataforma AgendatePY en la República del Paraguay.",
};

export default function TerminosPage() {
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
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand">
            <FileText className="h-4 w-4" />
            <span>Marco Legal & Servicios</span>
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Términos y Condiciones de Uso
          </h1>
          <p className="mt-2 text-xs text-slate-500">
            Última actualización: Septiembre 2026 · Asunción, República del Paraguay
          </p>

          <div className="mt-8 space-y-8 text-xs leading-relaxed text-slate-600 border-t border-slate-100 pt-8">
            <section>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                1. Aceptación de los Términos
              </h2>
              <p className="mt-2">
                Al acceder, registrarse o utilizar la plataforma <strong>AgendatePY</strong> (en adelante "el Servicio"), usted manifiesta haber leído, comprendido y aceptado en su totalidad estos Términos y Condiciones, así como nuestra Política de Privacidad, en conformidad con la <strong>Ley N° 4868/13 de Comercio Electrónico</strong> de la República del Paraguay.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                2. Descripción del Servicio (SaaS)
              </h2>
              <p className="mt-2">
                AgendatePY provee un software como servicio (SaaS) diseñado para la digitalización de agendas, gestión de turnos online, notificaciones automatizadas vía WhatsApp (a través de proveedores como Sendwo y Cloud API), control de comisiones de equipo, caja y fidelización para negocios comerciales, centros de estética, barberías, consultorios y profesionales independientes en Paraguay.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                3. Registro de Cuenta y Responsabilidad del Negocio
              </h2>
              <p className="mt-2">
                El usuario administrador es el único responsable de mantener la confidencialidad de sus credenciales de acceso (incluyendo códigos OTP y accesos federados de Google) y de la exactitud de los precios en Guaraníes (Gs.), horarios de atención y datos de contacto publicados para sus clientes finales.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                4. Reservas, Señas y Cancelaciones
              </h2>
              <p className="mt-2">
                AgendatePY facilita la intermediación tecnológica para el agendamiento. Cada comercio o profesional adherido define de forma soberana sus políticas de cancelación, tolerancia de espera y cobro de señas anticipadas mediante pasarelas como uPay, Bancard o transferencias bancarias SIPAP. AgendatePY no es responsable por incumplimientos o cancelaciones de las partes en la cita presencial.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                5. Mensajería de WhatsApp y Comunicaciones
              </h2>
              <p className="mt-2">
                El uso de WhatsApp está sujeto a las Políticas de Comercio y Mensajería de Meta Platforms, Inc. y a las normativas de Sendwo. Queda terminantemente prohibido utilizar el Servicio para enviar spam masivo no solicitado, contenidos ilícitos o mensajes fuera del contexto de confirmación, recordatorio y atención de turnos acordados con el cliente final.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                6. Facturación y Suscripciones del Software
              </h2>
              <p className="mt-2">
                Los planes de suscripción mensual o anual (Básico, Profesional, Empresa) se abonan en Guaraníes (Gs.) y emiten la correspondiente factura legal con RUC paraguayo. El servicio puede suspenderse en caso de mora tras el periodo de gracia correspondiente.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                7. Ley Aplicable y Jurisdicción
              </h2>
              <p className="mt-2">
                Para cualquier controversia derivada del presente contrato, las partes se someten a la competencia de los Juzgados y Tribunales Ordinarios de la Ciudad de Asunción, República del Paraguay.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
