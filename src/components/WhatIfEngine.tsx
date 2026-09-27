"use client";

import { useState } from "react";
import { RefreshCw, AlertTriangle, ShieldAlert, Sparkles } from "lucide-react";

interface Scenario {
  id: string;
  question: string;
  tag: string;
  before: {
    safeSpend: string;
    bufferStatus: string;
    rentSafety: string;
    projectionSummary: string;
  };
  after: {
    safeSpend: string;
    bufferStatus: string;
    rentSafety: string;
    projectionSummary: string;
  };
  guidance: string;
  urgency: "moderate" | "high" | "low";
}

export default function WhatIfEngine() {
  const [selectedScenario, setSelectedScenario] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const scenarios: Scenario[] = [
    {
      id: "stipend-late",
      question: "What if stipend 5 days late ho?",
      tag: "Delayed Inflow",
      before: {
        safeSpend: "₹800 / day",
        bufferStatus: "Intact (₹3,000)",
        rentSafety: "100% Guaranteed",
        projectionSummary: "Normal smooth flow until month end.",
      },
      after: {
        safeSpend: "₹320 / day",
        bufferStatus: "Guarded (₹2,200)",
        rentSafety: "Protected by Buffer",
        projectionSummary: "Safe spend automatically contracts to prevent overdraft.",
      },
      guidance: "PaisaPulse lowers daily safe spend by ₹480 for 5 days. You clear rent without touching credit cards or taking loans.",
      urgency: "moderate",
    },
    {
      id: "goa-trip",
      question: "What if Goa trip costs ₹8,500?",
      tag: "Unplanned Outflow",
      before: {
        safeSpend: "₹800 / day",
        bufferStatus: "Intact (₹3,000)",
        rentSafety: "Guaranteed",
        projectionSummary: "Safe trajectory across upcoming 14 days.",
      },
      after: {
        safeSpend: "₹0 / day",
        bufferStatus: "Critical (−₹1,500 breach)",
        rentSafety: "Rent at risk on 1st",
        projectionSummary: "Immediate shortfall detected 4 days ahead.",
      },
      guidance: "Trip will breach rent reserve. Recommendation: split trip payment into 2 tranches or collect ₹4,200 roommate dues beforehand.",
      urgency: "high",
    },
    {
      id: "food-spike",
      question: "What if food spending 30% badh jaye?",
      tag: "Lifestyle Drift",
      before: {
        safeSpend: "₹800 / day",
        bufferStatus: "Intact (₹3,000)",
        rentSafety: "Guaranteed",
        projectionSummary: "Dining accounted at normal ₹250/day.",
      },
      after: {
        safeSpend: "₹650 / day",
        bufferStatus: "Safe (₹2,800)",
        rentSafety: "Unaffected",
        projectionSummary: "Slight daily margin compression.",
      },
      guidance: "PaisaPulse absorbs the Swiggy surge smoothly by shaving ₹150 from leisure reserve. No emergency sirens or guilt.",
      urgency: "low",
    },
  ];

  const handleSelectScenario = (index: number) => {
    if (index === selectedScenario) return;
    setIsSimulating(true);
    setTimeout(() => {
      setSelectedScenario(index);
      setIsSimulating(false);
    }, 220);
  };

  const current = scenarios[selectedScenario];

  return (
    <section
      id="what-if"
      className="relative py-28 sm:py-36 px-6 sm:px-10 bg-ivory text-ink border-t border-line-medium transition-colors"
    >
      <div className="max-w-6xl mx-auto text-center space-y-16">
        {/* Centered Marker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream border border-line-medium text-[11px] font-accent uppercase tracking-[0.2em] text-coral">
          <Sparkles className="w-3.5 h-3.5" />
          <span>08 / Volatility Stress-Testing · The What-If Simulator</span>
        </div>

        {/* Centered Lead Narrative */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-editorial text-ink">
            Kal agar <span className="font-editorial-italic text-coral">plan badal gaya</span> toh?
          </h2>
          <p className="font-sans text-base sm:text-lg text-ink-muted leading-relaxed max-w-xl mx-auto">
            Future ko predict karna impossible hai. <br />
            <span className="text-ink font-semibold">But uske liye prepare karna 100% possible hai.</span>
          </p>
        </div>

        {/* Scenario Switchers (Centered, Rich Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
          {scenarios.map((sc, index) => {
            const isSelected = selectedScenario === index;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(index)}
                className={`p-5 rounded-xl border transition-all duration-300 relative cursor-pointer ${
                  isSelected
                    ? "border-coral bg-cream shadow-md ring-1 ring-coral/40 scale-[1.02]"
                    : "border-line-medium bg-ivory hover:border-ink hover:bg-cream/40"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-accent uppercase tracking-widest text-ink-subtle mb-2">
                  <span>Scenario 0{index + 1}</span>
                  <span className="text-coral font-bold">{sc.tag}</span>
                </div>
                <div className="font-editorial text-xl sm:text-2xl text-ink font-normal leading-snug">
                  &ldquo;{sc.question}&rdquo;
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Comparison Board (Centered, Filled, High-Impact) */}
        <div className="max-w-4xl mx-auto p-8 sm:p-12 bg-cream/50 border-2 border-line-medium rounded-2xl shadow-sm text-left space-y-8 relative overflow-hidden">
          {/* Subtle Simulation Scan Beam */}
          {isSimulating && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-coral via-[#FFA07A] to-coral animate-pulse z-20" />
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line-medium">
            <div>
              <span className="text-xs font-accent uppercase tracking-widest text-coral font-bold block mb-1">
                Active Simulation
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl text-ink">
                {current.question}
              </h3>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-accent text-ink-muted bg-ivory px-3 py-1.5 rounded-full border border-line-light shrink-0">
              <RefreshCw className={`w-3.5 h-3.5 text-coral ${isSimulating ? "animate-spin" : "animate-spin-slow"}`} />
              <span>{isSimulating ? "Recalibrating..." : "Real-time recalculation"}</span>
            </div>
          </div>

          {/* Side by Side Metrics */}
          {isSimulating ? (
            <div className="py-8 space-y-4 animate-pulse">
              <div className="h-20 bg-ivory/80 rounded-xl w-full" />
              <div className="h-16 bg-peach/30 rounded-xl w-full" />
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Before (Original Plan) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-accent uppercase tracking-widest text-ink-subtle">
                    <span className="w-2 h-2 rounded-full bg-ink/30" />
                    <span>BEFORE (Base Plan)</span>
                  </div>

                  <div className="p-5 bg-ivory rounded-xl border border-line-light space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-sans text-ink-muted">Safe-to-Spend:</span>
                      <span className="font-sans text-xl font-bold num-tabular text-ink">
                        {current.before.safeSpend}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-sans text-ink-muted">Buffer Status:</span>
                      <span className="text-xs font-medium text-ink">
                        {current.before.bufferStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-sans text-ink-muted">Rent Certainty:</span>
                      <span className="text-xs font-medium text-emerald-700">
                        {current.before.rentSafety}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted pt-2 border-t border-line-light">
                      {current.before.projectionSummary}
                    </p>
                  </div>
                </div>

                {/* After (The Volatile Twist) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-accent uppercase tracking-widest text-coral font-bold">
                    <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
                    <span>AFTER (Dynamic Adaptation)</span>
                  </div>

                  <div className="p-5 bg-ivory rounded-xl border-2 border-coral/50 space-y-3 shadow-sm">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-sans text-ink-muted">Adjusted Safe-to-Spend:</span>
                      <span className="font-sans text-xl font-black num-tabular text-coral">
                        {current.after.safeSpend}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-sans text-ink-muted">Buffer Status:</span>
                      <span className="text-xs font-semibold text-coral">
                        {current.after.bufferStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-sans text-ink-muted">Rent Certainty:</span>
                      <span className="text-xs font-medium text-ink">
                        {current.after.rentSafety}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted pt-2 border-t border-line-light">
                      {current.after.projectionSummary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Autonomous Solution Directive */}
              <div className="p-5 bg-peach/40 border border-coral/30 flex items-start gap-4 rounded-xl">
                <ShieldAlert className="w-5 h-5 text-coral shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[11px] font-accent uppercase tracking-widest text-coral font-bold block">
                    PaisaPulse Strategic Guidance
                  </span>
                  <p className="font-sans text-sm text-ink leading-relaxed">
                    {current.guidance}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
