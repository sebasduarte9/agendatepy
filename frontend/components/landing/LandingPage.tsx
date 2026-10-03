"use client";

import dynamic from "next/dynamic";
import { CategoryProvider } from "@/context/CategoryContext";
import HorizontalScroll from "./HorizontalScroll";
import Header from "./Header";
import Hero from "./Hero";
import Ticker from "./Ticker";

import ThreeGradientBackground from "./ThreeGradientBackground";
import StackingCardsSection from "./StackingCardsSection";
import Features from "./Features";
import ComparisonSection from "./ComparisonSection";
import Pricing from "./Pricing";
import Differentiators from "./Differentiators";
import FAQ from "./FAQ";
import Footer from "./Footer";
import WhatsAppFloatingButton from "./WhatsAppFloatingButton";
import StickyMobileCta from "./StickyMobileCta";

export default function LandingPage() {
  return (
    <HorizontalScroll>
      <CategoryProvider>
        <ThreeGradientBackground />
        <Header />
        <main className="pb-20 sm:pb-0 overflow-x-clip max-w-full w-full">
          <Hero />
          <Ticker />
          <StackingCardsSection />
          <Features />
          <ComparisonSection />
          <Pricing />
          <Differentiators />
          <FAQ />
        </main>
        <Footer />
        <WhatsAppFloatingButton />
        <StickyMobileCta />
      </CategoryProvider>
    </HorizontalScroll>
  );
}
