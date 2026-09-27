"use client";

import { useState } from "react";
import { AlertTriangle, Check, Sliders, X, Shield, Sparkles } from "lucide-react";

export default function ActionEngine() {
  const [actions, setActions] = useState([
    {
      id: "roommate",
      title: "Recover ₹850 from roommates",
      detail: "Pending split for Flat Wi-Fi & Groceries from 2 weeks ago.",
      impact: 850,
      impactText: "+ ₹850 liquidity",
      selected: true,
    },
    {
      id: "subscription",
      title: "Pause one subscription",
      detail: "Streaming subscription unused for 26 days.",
      impact: 499,
      impactText: "+ ₹499 saved",
      selected: true,
    },
    {
      id: "dining",
      title: "Reduce dining for 4 days",
      detail: "Cap daily food spend to ₹250 until 1st of month.",
      impact: 600,
      impactText: "+ ₹600 margin",
      selected: true,
    },
    {
      id: "delay",
      title: "Delay ₹2,000 footwear purchase",
      detail: "Push checkout from today to 12th (post-stipend).",
      impact: 2000,
      impactText: "Zero buffer breach",
      selected: false,
    },
  ]);

  const [planApplied, setPlanApplied] = useState(false);

  const toggleAction = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, selected: !a.selected } : a))
    );
  };

  const totalRecovered = actions
    .filter((a) => a.selected)
    .reduce((sum, a) => sum + a.impact, 0);

  return (
    <section
      id="action-engine"
      className="relative py-28 sm:py-36 px-6 sm:px-10 bg-gradient-to-b from-ivory via-[#FFF2EE] to-[#FFE9E4] text-ink border-t border-line-medium transition-colors"
    >
      <div className="max-w-5xl mx-auto text-center space-y-16">
        {/* Centered Marker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ivory border border-coral/30 text-[11px] font-accent uppercase tracking-[0.2em] text-coral font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>10 / The Action Engine · Active Safeguards</span>
        </div>

        {/* Lead Headline */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-editorial text-ink">
            Warning dena easy hai. <br />
            <span className="font-editorial-italic text-coral">Solution dena useful hai.</span>
          </h2>
          <p className="font-sans text-base sm:text-lg text-ink-muted leading-relaxed max-w-xl mx-auto">
            Other apps send panic notifications when you are already broke.
            PaisaPulse spots the squeeze 6 days early and hands you peaceful options.
          </p>
        </div>

        {/* Action Engine Board (Centered, Filled, High-Impact) */}
        <div className="max-w-4xl mx-auto p-8 sm:p-12 bg-ivory border-2 border-coral/30 rounded-2xl shadow-sm text-left space-y-8">
          {/* Subtle Warning Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-coral/10 border-l-4 border-coral text-ink rounded-r-xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-coral shrink-0" />
              <div className="font-sans text-sm sm:text-base font-semibold text-ink">
                Potential shortfall in 6 days: <span className="num-tabular text-coral">₹1,400</span> if pace continues.
              </div>
            </div>
            <span className="text-xs font-accent uppercase tracking-wider text-coral font-bold shrink-0">
              Early Intervention Ready
            </span>
          </div>

          {/* Actionable Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-accent uppercase tracking-widest text-ink-subtle mb-2">
              <span>Select Recommendations to Apply</span>
              <span className="text-coral font-bold num-tabular">
                + ₹{totalRecovered.toLocaleString("en-IN")} headroom recovered
              </span>
            </div>

            {actions.map((act) => (
              <div
                key={act.id}
                onClick={() => toggleAction(act.id)}
                className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  act.selected
                    ? "bg-cream/40 border-coral/60 shadow-sm"
                    : "bg-ivory border-line-medium opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center transition-colors ${
                      act.selected
                        ? "bg-coral border-coral text-ivory"
                        : "border-line-medium bg-ivory"
                    }`}
                  >
                    {act.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="font-sans text-sm sm:text-base font-semibold text-ink block">
                      {act.title}
                    </span>
                    <span className="font-sans text-xs text-ink-muted block mt-0.5">
                      {act.detail}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:self-center pl-8 sm:pl-0 shrink-0">
                  <span className="font-accent text-xs font-bold text-coral uppercase tracking-wide">
                    {act.impactText}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Philosophy Statement & Control Panel */}
          <div className="p-6 bg-cream/60 border border-line-medium rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="font-editorial text-2xl text-ink font-normal block">
                &ldquo;These are suggestions. Not decisions.&rdquo;
              </span>
              <p className="font-sans text-xs text-ink-muted">
                PaisaPulse recommends. The user decides. Never strict, always respectful of your lifestyle.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setPlanApplied(true)}
                className="px-6 py-3 bg-coral text-ivory rounded-full text-xs font-sans font-semibold tracking-wide hover:bg-coral-hover transition-all shadow-md"
              >
                {planApplied ? "✓ Plan Applied" : "Apply to Plan"}
              </button>
              <button
                onClick={() => {
                  setActions((prev) => prev.map((a) => ({ ...a, selected: false })));
                  setPlanApplied(false);
                }}
                className="px-4 py-3 bg-ivory text-ink border border-line-medium rounded-full text-xs font-sans font-medium hover:border-ink transition-colors"
              >
                Dismiss All
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
