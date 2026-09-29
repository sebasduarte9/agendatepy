"use client";

import { CategoryProvider } from "@/context/CategoryContext";
import Header from "./Header";
import Hero from "./Hero";
import Ticker from "./Ticker";
import HowItWorks from "./HowItWorks";
import Features from "./Features";
import ComparisonSection from "./ComparisonSection";
import Pricing from "./Pricing";
import Integrations from "./Integrations";
import Differentiators from "./Differentiators";
import FAQ from "./FAQ";
import BottomCta from "./BottomCta";
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
        <Features />
        <ComparisonSection />
        <Pricing />
        <Integrations />
        <Differentiators />
        <FAQ />
        <BottomCta />
      </main>
      <Footer />
      <WhatsAppFloatingButton />
      <StickyMobileCta />
    </CategoryProvider>
  );
}
