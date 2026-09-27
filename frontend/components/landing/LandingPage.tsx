"use client";

import { CategoryProvider } from "@/context/CategoryContext";
import Header from "./Header";
import Hero from "./Hero";
import Ticker from "./Ticker";
import HowItWorks from "./HowItWorks";
import WhatsAppShowcase from "./WhatsAppShowcase";
import Features from "./Features";
import RoiCalculator from "./RoiCalculator";
import Pricing from "./Pricing";
import Integrations from "./Integrations";
import Differentiators from "./Differentiators";
import Testimonials from "./Testimonials";
import FAQ from "./FAQ";
import Footer from "./Footer";
import WhatsAppFloatingButton from "./WhatsAppFloatingButton";
import StickyMobileCta from "./StickyMobileCta";

export default function LandingPage() {
  return (
    <CategoryProvider>
      <Header />
      <main>
        <Hero />
        <Ticker />
        <HowItWorks />
        <WhatsAppShowcase />
        <Features />
        <RoiCalculator />
        <Pricing />
        <Integrations />
        <Differentiators />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
      <WhatsAppFloatingButton />
      <StickyMobileCta />
    </CategoryProvider>
  );
}
