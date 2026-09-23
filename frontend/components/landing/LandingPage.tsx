"use client";

import { CategoryProvider } from "@/context/CategoryContext";
import Header from "./Header";
import Hero from "./Hero";
import Ticker from "./Ticker";
import Features from "./Features";
import WhatsAppShowcase from "./WhatsAppShowcase";
import HowItWorks from "./HowItWorks";
import Integrations from "./Integrations";
import Differentiators from "./Differentiators";
import Pricing from "./Pricing";
import FAQ from "./FAQ";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <CategoryProvider>
      <Header />
      <main>
        <Hero />
        <Ticker />
        <Features />
        <WhatsAppShowcase />
        <HowItWorks />
        <Integrations />
        <Differentiators />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </CategoryProvider>
  );
}
