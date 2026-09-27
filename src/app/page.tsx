import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import RealizationSection from "@/components/RealizationSection";
import IntroduceSection from "@/components/IntroduceSection";
import FeatureGrid from "@/components/FeatureGrid";
import SafeToSpend from "@/components/SafeToSpend";
import AffordSimulator from "@/components/AffordSimulator";
import FutureTimeline from "@/components/FutureTimeline";
import WhatIfEngine from "@/components/WhatIfEngine";
import ComparisonMatrix from "@/components/ComparisonMatrix";
import UncertainIncome from "@/components/UncertainIncome";
import ActionEngine from "@/components/ActionEngine";
import Personalization from "@/components/Personalization";
import CoreDifference from "@/components/CoreDifference";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import LenisScroll from "@/components/LenisScroll";
import ClickSpark from "@/components/ClickSpark";
import Preloader from "@/components/Preloader";

export default function Home() {
  return (
    <main className="min-h-screen bg-ivory text-ink relative selection:bg-coral selection:text-ivory">
      {/* Cinematic Luxury Preloader */}
      <Preloader />

      {/* ClickSpark Interactive Micro-Particles */}
      <ClickSpark
        sparkColor="#FF6244"
        sparkSize={11}
        sparkRadius={20}
        sparkCount={8}
        duration={420}
        easing="ease-out"
      >
        {/* Lenis Smooth Scrolling Controller */}
        <LenisScroll />

        {/* Editorial Minimal Navbar */}
        <Navbar />

        {/* 01 — Starting Portal with ScrollExpand & Centered Hero + Live Calculator */}
        <Hero />

        {/* 02 — The Problem: Bank Balance vs Safe Today */}
        <ProblemSection />

        {/* 03 — The Realization: Ab kya karna safe hai? */}
        <RealizationSection />

        {/* 04 — Meet PaisaPulse: Track → Predict → Simulate → Act → Learn */}
        <IntroduceSection />

        {/* Feature Showcase Grid (Filled, Attractive, Centered Ecosystem) */}
        <FeatureGrid />

        {/* 05 — Pinned Experience #1: Safe-to-Spend Calculation Engine */}
        <SafeToSpend />

        {/* 06 — Pinned Experience #2: "Can I Afford This?" */}
        <AffordSimulator />

        {/* 07 — Future Cashflow Horizontal Timeline */}
        <FutureTimeline />

        {/* 08 — Pinned Experience #3: What-If Engine */}
        <WhatIfEngine />

        {/* Systematic Comparison Matrix */}
        <ComparisonMatrix />

        {/* 09 — Uncertain Income & Trust Principle */}
        <UncertainIncome />

        {/* 10 — Action Engine: Solution Dena Useful Hai */}
        <ActionEngine />

        {/* 11 — Personalization & Clean Transaction Intelligence */}
        <Personalization />

        {/* 12 — The Core Difference: Where did it go? vs What can I safely do? */}
        <CoreDifference />

        {/* 13 — Final Credo & CTA */}
        <FinalCTA />

        {/* Footer */}
        <Footer />
      </ClickSpark>
    </main>
  );
}
