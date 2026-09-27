"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ShieldCheck, Sparkles, TrendingUp, AlertCircle, CheckCircle2, Sliders } from "lucide-react";
import gsap from "gsap";
import ScrollExpand from "./ScrollExpand";
import { isUserLoggedIn } from "../engine/userStore.js";

export default function Hero() {
  const [sliderCash, setSliderCash] = useState<number>(10000);
  const [sliderRent, setSliderRent] = useState<number>(5000);
  const [sliderBills, setSliderBills] = useState<number>(1200);
  const [sliderBuffer, setSliderBuffer] = useState<number>(3000);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        setIsLoggedIn(isUserLoggedIn());
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();

    window.addEventListener("storage", checkAuth);
    window.addEventListener("paisapulse_auth_change", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("paisapulse_auth_change", checkAuth);
    };
  }, []);

  // Dynamic calculated safe spend
  const safeSpendCalculated = Math.max(0, sliderCash - sliderRent - sliderBills - sliderBuffer);
  const dailySafeSpend = Math.round(safeSpendCalculated / 10);

  return (
    <section className="relative bg-ivory text-ink">
      {/* 1. SCROLL EXPAND COMPONENT - OBSIDIAN BLACK TO WARM IVORY THEME (NO IMAGE) */}
      <div className="w-full relative bg-ivory">
        <ScrollExpand
          title="PAISAPULSE"
          scrollHint="Scroll to unfold the guardian ↓"
          startWidth={58}
          startHeight={60}
          startRadius={28}
          endRadius={0}
          scrollDistance={1.2}
          holdDistance={0.45}
        >
          <div className="max-w-4xl mx-auto text-center space-y-6 px-4 py-6 transition-colors duration-500">
            {/* Ultra-Luxury Eyebrow Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[var(--badge-bg)] backdrop-blur-md border border-[var(--badge-border)] text-xs font-accent uppercase tracking-[0.25em] text-coral shadow-sm">
              <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
              <span className="font-bold">AI Cashflow Guardian · Built for India</span>
            </div>

            {/* Majestic $100k Editorial Headline */}
            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-[5.5rem] font-normal leading-[1.04] tracking-editorial text-[var(--text-main)] transition-colors duration-500">
              Account mein <span className="num-tabular font-sans font-black text-coral">₹10,000</span> hain. <br />
              <span className="font-editorial-italic font-normal">Par kya woh actually tumhare hain?</span>
            </h1>

            {/* Supporting Insight */}
            <p className="font-sans text-base sm:text-xl text-[var(--text-sub)] max-w-2xl mx-auto leading-relaxed transition-colors duration-500 font-normal">
              Your bank balance doesn&apos;t know what tomorrow needs.
              <br className="hidden sm:inline" />
              <span className="font-semibold text-[var(--text-main)]">
                {" "}PaisaPulse transforms static accounting into real-time forward permission.
              </span>
            </p>

            {/* The $100k Live Financial Clarity Strip */}
            <div className="pt-2 max-w-3xl mx-auto">
              <div className="p-3 sm:p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-sm grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="border-l-2 border-line-medium pl-3">
                  <span className="text-[10px] font-accent uppercase text-[var(--text-sub)] block tracking-wider">01 · Ledger</span>
                  <span className="font-sans font-bold text-sm sm:text-base text-[var(--text-main)] block num-tabular">₹10,000</span>
                  <span className="text-[10px] text-[var(--text-sub)] block">Bank Balance</span>
                </div>
                <div className="border-l-2 border-coral pl-3">
                  <span className="text-[10px] font-accent uppercase text-coral block tracking-wider">02 · PG Rent</span>
                  <span className="font-sans font-bold text-sm sm:text-base text-coral block num-tabular">− ₹5,000</span>
                  <span className="text-[10px] text-[var(--text-sub)] block">Due in 4 days</span>
                </div>
                <div className="border-l-2 border-coral pl-3">
                  <span className="text-[10px] font-accent uppercase text-coral block tracking-wider">03 · Bills & Wi-Fi</span>
                  <span className="font-sans font-bold text-sm sm:text-base text-coral block num-tabular">− ₹1,200</span>
                  <span className="text-[10px] text-[var(--text-sub)] block">Due in 6 days</span>
                </div>
                <div className="border-l-2 border-coral bg-coral/10 rounded-r-lg pl-3 py-1">
                  <span className="text-[10px] font-accent uppercase text-coral font-bold block tracking-wider">04 · Truly Free</span>
                  <span className="font-sans font-black text-sm sm:text-base text-coral block num-tabular">₹800 safe</span>
                  <span className="text-[10px] text-[var(--text-main)] font-medium block">Spend guilt-free</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="group px-8 py-3.5 bg-coral text-ivory rounded-full text-sm font-sans font-semibold tracking-wide hover:bg-coral-hover transition-all shadow-md hover:scale-105 inline-flex items-center gap-2"
                >
                  <span>Go to Live Dashboard</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <a
                  href="#interactive-calculator"
                  className="group px-8 py-3.5 bg-coral text-ivory rounded-full text-sm font-sans font-semibold tracking-wide hover:bg-coral-hover transition-all shadow-md hover:scale-105 inline-flex items-center gap-2"
                >
                  <span>Calculate Your Safe Spend</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              )}
              <a
                href="#how-it-works"
                className="px-7 py-3.5 bg-[var(--badge-bg)] text-[var(--text-main)] border border-[var(--badge-border)] rounded-full text-sm font-sans font-medium hover:border-coral transition-all"
              >
                Explore Methodology
              </a>
            </div>

            {/* Micro Trust Note */}
            <div className="text-[11px] font-accent text-[var(--text-sub)] uppercase tracking-wider">
              Zero bank passwords · Deterministic cashflow physics · Made for India
            </div>
          </div>
        </ScrollExpand>
      </div>

      {/* 2. CENTERED, RICH HERO CONTINUATION & LIVE FINANCIAL RADAR */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-16 pb-24 text-center">
        {/* Top Centered Live Indicator Ticker */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-full bg-cream border border-line-medium text-xs font-accent text-ink-muted mb-8 shadow-sm">
          <span className="flex items-center gap-1.5 text-coral font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
            Live Guardian Active
          </span>
          <span className="text-line-dark hidden sm:inline">|</span>
          <span className="text-ink font-medium">Forward Projection Horizon: 14 to 30 Days</span>
          <span className="text-line-dark hidden sm:inline">|</span>
          <span className="num-tabular text-emerald-800 font-semibold">Zero Bank Password Required</span>
        </div>

        {/* Centered Main Editorial Statement */}
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="font-editorial text-4xl sm:text-7xl lg:text-8xl text-ink font-normal leading-[1.02] tracking-editorial">
            Money management, <br />
            <span className="font-editorial-italic text-coral">without the mental load.</span>
          </h2>

          <p className="font-sans text-lg sm:text-2xl text-ink-muted max-w-3xl mx-auto font-normal leading-relaxed">
            Paise sirf aaj ke nahi hote. Kal ke bhi hote hain.
            <br />
            <span className="text-ink font-semibold">
              PaisaPulse doesn&apos;t just track your money — it helps you decide what you can safely do with it.
            </span>
          </p>
        </div>

        {/* Dynamic Financial Quick Chips (Centered, Rich Visual Polish) */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-3xl mx-auto">
          <div className="px-4 py-2 rounded-lg bg-cream/70 border border-line-medium flex items-center gap-2 text-xs font-sans text-ink">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Rent Reserved: <strong>₹5,000 (1st)</strong></span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-cream/70 border border-line-medium flex items-center gap-2 text-xs font-sans text-ink">
            <CheckCircle2 className="w-4 h-4 text-coral" />
            <span>Scheduled Bills: <strong>₹1,200 (3rd)</strong></span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-cream/70 border border-line-medium flex items-center gap-2 text-xs font-sans text-ink">
            <Sparkles className="w-4 h-4 text-ink" />
            <span>Untouchable Buffer: <strong>₹3,000</strong></span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-coral/15 border border-coral/40 flex items-center gap-2 text-xs font-sans text-coral font-bold">
            <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
            <span>Safe Spend Today: <strong>₹800</strong></span>
          </div>
        </div>

        {/* 3. INTERACTIVE LIVE SAFE-TO-SPEND SIMULATOR (Rich, Filled, Engaging) */}
        <div id="interactive-calculator" className="mt-16 text-left max-w-4xl mx-auto p-6 sm:p-10 bg-cream/60 border-2 border-line-medium rounded-2xl shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line-medium">
            <div>
              <span className="text-xs font-accent uppercase tracking-widest text-coral font-bold flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Interactive Cashflow Radar
              </span>
              <h3 className="font-editorial text-2xl sm:text-4xl text-ink font-normal mt-1">
                Test your own numbers in real-time
              </h3>
            </div>
            <div className="text-xs font-sans text-ink-muted bg-ivory px-3 py-1.5 rounded-full border border-line-light shrink-0">
              Drag the sliders to test any scenario
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {/* Slider 1: Cash in Hand */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-sans">
                <span className="text-ink-muted">Bank + UPI Balance</span>
                <span className="font-bold text-ink num-tabular">₹{sliderCash.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="50000"
                step="1000"
                value={sliderCash}
                onChange={(e) => setSliderCash(Number(e.target.value))}
                className="w-full h-2 bg-ivory rounded-lg appearance-none cursor-pointer accent-coral"
              />
              <div className="flex justify-between text-[10px] font-accent text-ink-subtle">
                <span>₹5,000</span>
                <span>₹50,000</span>
              </div>
            </div>

            {/* Slider 2: Upcoming Rent */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-sans">
                <span className="text-ink-muted">Upcoming Rent / PG Due</span>
                <span className="font-bold text-coral num-tabular">− ₹{sliderRent.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="2000"
                max="30000"
                step="500"
                value={sliderRent}
                onChange={(e) => setSliderRent(Number(e.target.value))}
                className="w-full h-2 bg-ivory rounded-lg appearance-none cursor-pointer accent-coral"
              />
              <div className="flex justify-between text-[10px] font-accent text-ink-subtle">
                <span>₹2,000</span>
                <span>₹30,000</span>
              </div>
            </div>

            {/* Slider 3: Scheduled Bills */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-sans">
                <span className="text-ink-muted">Bills & Subscriptions</span>
                <span className="font-bold text-coral num-tabular">− ₹{sliderBills.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="100"
                value={sliderBills}
                onChange={(e) => setSliderBills(Number(e.target.value))}
                className="w-full h-2 bg-ivory rounded-lg appearance-none cursor-pointer accent-coral"
              />
              <div className="flex justify-between text-[10px] font-accent text-ink-subtle">
                <span>₹500</span>
                <span>₹10,000</span>
              </div>
            </div>

            {/* Slider 4: Emergency Buffer */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-sans">
                <span className="text-ink-muted">Untouchable Buffer</span>
                <span className="font-bold text-ink num-tabular">− ₹{sliderBuffer.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="20000"
                step="500"
                value={sliderBuffer}
                onChange={(e) => setSliderBuffer(Number(e.target.value))}
                className="w-full h-2 bg-ivory rounded-lg appearance-none cursor-pointer accent-ink"
              />
              <div className="flex justify-between text-[10px] font-accent text-ink-subtle">
                <span>₹1,000</span>
                <span>₹20,000</span>
              </div>
            </div>
          </div>

          {/* Live Outcome Box */}
          <div className="p-6 bg-ivory border-2 border-coral/40 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-accent uppercase tracking-widest text-coral font-bold block">
                Calculated Discretionary Pool
              </span>
              <div className="font-editorial text-2xl sm:text-3xl text-ink font-normal">
                {safeSpendCalculated > 0
                  ? "Haan, yeh paisa actually spendable hai!"
                  : "Caution: Outflows exceed buffer. Squeeze imminent!"}
              </div>
              <p className="font-sans text-xs text-ink-muted">
                {sliderCash} − {sliderRent} (Rent) − {sliderBills} (Bills) − {sliderBuffer} (Buffer)
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end shrink-0">
              <div className="text-xs font-accent text-ink-subtle uppercase tracking-wider">
                Safe to Spend Pool
              </div>
              <div className={`font-sans text-4xl sm:text-6xl font-black num-tabular ${safeSpendCalculated > 0 ? "text-coral" : "text-red-600"}`}>
                ₹{safeSpendCalculated.toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] font-sans text-ink-muted font-medium mt-1">
                ≈ ₹{dailySafeSpend.toLocaleString("en-IN")} / day safe burn rate
              </span>
            </div>
          </div>
        </div>

        {/* 4. THE HORIZONTAL TIMELINE COMPARISON AT THE BOTTOM OF HERO */}
        <div className="mt-16 pt-10 border-t border-line-medium max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
            <div className="p-4 bg-cream/40 border border-line-medium rounded-lg">
              <span className="text-[10px] font-accent uppercase text-ink-subtle tracking-wider block">Today</span>
              <span className="font-sans font-bold text-base sm:text-lg text-ink block mt-1">₹10,000</span>
              <span className="text-xs text-ink-muted block mt-0.5">Bank Balance</span>
            </div>
            <div className="p-4 bg-cream/40 border border-line-medium rounded-lg">
              <span className="text-[10px] font-accent uppercase text-ink-subtle tracking-wider block">1st of Month</span>
              <span className="font-sans font-semibold text-base sm:text-lg text-coral block mt-1">− ₹5,000</span>
              <span className="text-xs text-ink-muted block mt-0.5">PG / Room Rent</span>
            </div>
            <div className="p-4 bg-cream/40 border border-line-medium rounded-lg">
              <span className="text-[10px] font-accent uppercase text-ink-subtle tracking-wider block">3rd of Month</span>
              <span className="font-sans font-semibold text-base sm:text-lg text-coral block mt-1">− ₹1,200</span>
              <span className="text-xs text-ink-muted block mt-0.5">Bills & Mobile</span>
            </div>
            <div className="p-4 bg-peach/40 border border-coral/40 rounded-lg">
              <span className="text-[10px] font-accent uppercase text-coral font-bold tracking-wider block">Daily Safe Burn</span>
              <span className="font-sans font-extrabold text-base sm:text-lg text-ink block mt-1">₹620 / day</span>
              <span className="text-xs text-ink-muted block mt-0.5">Guilt-Free Spend</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
