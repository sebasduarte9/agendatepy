"use client";

import { useEffect } from "react";
import { CategoryProvider } from "@/context/CategoryContext";
import HorizontalScroll from "./HorizontalScroll";
import Header from "./Header";
import Hero from "./Hero";

import ThreeGradientBackground from "./ThreeGradientBackground";
import StackingCardsSection from "./StackingCardsSection";
import Features from "./Features";
import Pricing from "./Pricing";
import FAQ from "./FAQ";
import Footer from "./Footer";
import WhatsAppFloatingButton from "./WhatsAppFloatingButton";
import StickyMobileCta from "./StickyMobileCta";

export default function LandingPage() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <HorizontalScroll>
      <CategoryProvider>
        <ThreeGradientBackground />
        <Header />
        <main className="pb-20 sm:pb-0 overflow-x-clip max-w-full w-full">
          <Hero />
          <StackingCardsSection />
          <Features />
          <Pricing />
          <FAQ />
        </main>
        <Footer />
        <WhatsAppFloatingButton />
        <StickyMobileCta />
      </CategoryProvider>
    </HorizontalScroll>
  );
}
