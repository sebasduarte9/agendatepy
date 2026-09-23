import { Percent, Smartphone, Gift, Wallet } from "lucide-react";

const ITEMS = [
  {
    icon: Percent,
    title: "0% Comisión por reserva",
    text: "Suscripción mensual fija en Guaraníes. Cada guaraní que factura tu negocio es 100% tuyo.",
  },
  {
    icon: Smartphone,
    title: "Tus clientes no descargan ninguna app",
    text: "Reservan desde el celular a cualquier hora, desde tu link en Instagram o hablando con el asistente de WhatsApp.",
  },
  {
    icon: Gift,
    title: "Prueba gratis de 30 días sin tarjeta",
    text: "Creás tu agenda en 5 minutos, compartís tu enlace y empezás a recibir turnos de inmediato sin compromiso.",
  },
  {
    icon: Wallet,
    title: "Cobrás directo en Paraguay sin intermediarios",
    text: "Transferencias SIPAP a cualquier banco, cobro con QR Bancard, Billeteras (Tigo Money/Personal Pay) o efectivo en el local.",
  },
];

export default function Differentiators() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="max-w-2xl">
        <span className="rounded-full bg-brand/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
          Diferenciales
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Por qué peluquerías, salones y profesionales en Paraguay eligen AgendatePY
        </h2>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-brand/40 transition"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
