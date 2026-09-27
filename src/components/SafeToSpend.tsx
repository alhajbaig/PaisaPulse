"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, CheckCircle2, Shield, Lock, Calculator, ArrowRight } from "lucide-react";

export default function SafeToSpend() {
  const [whyOpen, setWhyOpen] = useState(false);
  const [cash, setCash] = useState<number>(10000);
  const [rent, setRent] = useState<number>(5000);
  const [bills, setBills] = useState<number>(1200);
  const [buffer, setBuffer] = useState<number>(3000);

  const safeSpend = Math.max(0, cash - rent - bills - buffer);
  const daysInCycle = 10;
  const dailyBurn = Math.round(safeSpend / daysInCycle);

  return (
    <section
      id="safe-to-spend"
      className="relative py-28 sm:py-36 px-6 sm:px-10 bg-peach/30 text-ink border-t border-line-medium transition-colors"
    >
      <div className="max-w-5xl mx-auto text-center space-y-16">
        {/* Centered Marker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ivory border border-line-medium text-[11px] font-accent uppercase tracking-[0.2em] text-coral">
          <Calculator className="w-3.5 h-3.5" />
          <span>05 / The Hero Formula · Cashflow Physics</span>
        </div>

        {/* Section Headline */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-editorial text-ink">
            Safe to Spend Today: <br />
            <span className="font-editorial-italic text-coral">The Exact Formula.</span>
          </h2>
          <p className="font-sans text-base sm:text-lg text-ink-muted leading-relaxed max-w-xl mx-auto">
            Simple enough to understand in 5 seconds. Smart enough to protect your next 30 days.
          </p>
        </div>

        {/* The Visual Calculation Architecture (Filled, Centered, High Contrast) */}
        <div className="max-w-4xl mx-auto p-8 sm:p-12 bg-ivory border-2 border-line-medium rounded-2xl shadow-sm text-left space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line-medium">
            <span className="text-xs font-accent uppercase tracking-widest text-ink-subtle font-bold">
              Real-Time Discretionary Ledger
            </span>
            <span className="text-xs font-sans text-emerald-800 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ✓ All Upcoming Debits Ring-Fenced
            </span>
          </div>

          {/* Row 1: Current Cash */}
          <div className="flex items-center justify-between py-3 border-b border-line-light">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-cream flex items-center justify-center text-xs font-bold text-ink">1</div>
              <div>
                <span className="font-sans font-semibold text-sm sm:text-base text-ink block">
                  Current Liquid Cash
                </span>
                <span className="text-xs font-sans text-ink-muted">Bank savings + UPI balance</span>
              </div>
            </div>
            <span className="font-sans font-bold text-lg sm:text-xl text-ink num-tabular">₹{cash.toLocaleString("en-IN")}</span>
          </div>

          {/* Row 2: Rent Deducted */}
          <div className="flex items-center justify-between py-3 border-b border-line-light">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-coral/10 flex items-center justify-center text-xs font-bold text-coral">−</div>
              <div>
                <span className="font-sans font-semibold text-sm sm:text-base text-coral block">
                  Upcoming Rent (Due 1st)
                </span>
                <span className="text-xs font-sans text-ink-muted">Landlord auto-debit reserved</span>
              </div>
            </div>
            <span className="font-sans font-bold text-lg sm:text-xl text-coral num-tabular">− ₹{rent.toLocaleString("en-IN")}</span>
          </div>

          {/* Row 3: Scheduled Bills */}
          <div className="flex items-center justify-between py-3 border-b border-line-light">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-coral/10 flex items-center justify-center text-xs font-bold text-coral">−</div>
              <div>
                <span className="font-sans font-semibold text-sm sm:text-base text-coral block">
                  Scheduled Bills & Subscriptions
                </span>
                <span className="text-xs font-sans text-ink-muted">Airtel broadband, phone, OTT</span>
              </div>
            </div>
            <span className="font-sans font-bold text-lg sm:text-xl text-coral num-tabular">− ₹{bills.toLocaleString("en-IN")}</span>
          </div>

          {/* Row 4: Untouchable Buffer */}
          <div className="flex items-center justify-between py-3 border-b border-line-light">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-ink/10 flex items-center justify-center text-xs font-bold text-ink">−</div>
              <div>
                <span className="font-sans font-semibold text-sm sm:text-base text-ink block">
                  Emergency Medical & Living Buffer
                </span>
                <span className="text-xs font-sans text-ink-muted">Zero-breach safety floor</span>
              </div>
            </div>
            <span className="font-sans font-bold text-lg sm:text-xl text-ink num-tabular">− ₹{buffer.toLocaleString("en-IN")}</span>
          </div>

          {/* EQUALS: The Safe To Spend Result */}
          <div className="pt-6">
            <div className="p-6 bg-gradient-to-r from-cream via-ivory to-cream border-2 border-coral rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-coral animate-ping" />
                  <span className="font-accent text-xs uppercase tracking-widest text-coral font-bold">
                    = SAFE TO SPEND TODAY
                  </span>
                </div>
                <div className="font-editorial text-2xl sm:text-3xl text-ink font-normal">
                  Yeh paisa genuinely free hai.
                </div>
                <p className="font-sans text-xs text-ink-muted">
                  Spend this on coffee, books, or dining without guilt. Tomorrow&apos;s bills are locked and untouched.
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end shrink-0">
                <div className="font-sans text-5xl sm:text-7xl font-black text-coral num-tabular">
                  ₹{safeSpend.toLocaleString("en-IN")}
                </div>
                <span className="text-xs font-accent uppercase text-ink-subtle tracking-wider mt-1 font-semibold">
                  ≈ ₹{dailyBurn} / day safe burn rate
                </span>
              </div>
            </div>
          </div>

          {/* Minimal Inline [ Why? ] Explanation */}
          <div className="pt-2 text-center sm:text-left">
            <button
              onClick={() => setWhyOpen(!whyOpen)}
              className="inline-flex items-center gap-2 text-xs font-accent uppercase tracking-widest text-ink hover:text-coral transition-colors py-2 font-semibold"
            >
              <HelpCircle className="w-4 h-4 text-coral" />
              <span>[ {whyOpen ? "Hide Calculation Logic" : "Why ₹" + safeSpend + "?"} ]</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${whyOpen ? "rotate-180" : ""}`} />
            </button>

            {whyOpen && (
              <div className="mt-3 p-5 bg-cream/70 border border-line-medium rounded-lg text-xs sm:text-sm text-ink-muted leading-relaxed space-y-2 animate-in fade-in duration-200">
                <p className="font-semibold text-ink">
                  Deterministic Math: No AI hallucinations.
                </p>
                <p>
                  ₹{cash.toLocaleString("en-IN")} total bank cash − ₹{rent.toLocaleString("en-IN")} (Rent) − ₹{bills.toLocaleString("en-IN")} (Bills) − ₹{buffer.toLocaleString("en-IN")} (Emergency Buffer) = <strong className="text-ink">₹{safeSpend.toLocaleString("en-IN")}</strong>.
                </p>
                <p>
                  Divided over {daysInCycle} days until your next confirmed stipend inflow = <strong className="text-coral">₹{dailyBurn} per day</strong> safe discretionary spending.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
