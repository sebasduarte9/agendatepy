"use client";

import { motion } from "framer-motion";

const WEB_LOGOS = ["WordPress", "Wix", "Shopify", "HTML"];
const ADS_LOGOS = ["Facebook Ads", "Instagram Ads", "TikTok Ads"];

export default function Integrations() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-2">
        <IntegrationCard
          title="Web Integration"
          text="Pegá un botón o un iFrame y el widget de reservas aparece en cualquier web, en minutos."
          logos={WEB_LOGOS}
        />
        <IntegrationCard
          title="Ads Integration"
          text="Trackeá conversiones de Facebook, Instagram y TikTok Ads para optimizar cada campaña."
          logos={ADS_LOGOS}
        />
      </div>
    </section>
  );
}

function IntegrationCard({
  title,
  text,
  logos,
}: {
  title: string;
  text: string;
  logos: string[];
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[#FAFAFB] p-8">
      <div className="absolute right-6 top-8 h-24 w-24 rounded-full bg-brand/10 blur-2xl" />
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{text}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {logos.map((logo, index) => (
          <motion.span
            key={logo}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.2 }}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm"
          >
            {logo}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
