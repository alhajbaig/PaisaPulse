"use client";

import { Sparkles, AlertCircle, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function Personalization() {
  return (
    <section className="relative py-28 sm:py-36 px-6 sm:px-10 bg-ivory text-ink border-t border-line-medium transition-colors">
      <div className="max-w-6xl mx-auto text-center space-y-20">
        {/* Part 1: Personalization Philosophy (Centered) */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream border border-line-medium text-[11px] font-accent uppercase tracking-[0.2em] text-coral font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>11 / Adaptive Cognition · Individual Calibration</span>
          </div>

          <h2 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-editorial text-ink">
            PaisaPulse <span className="font-editorial-italic text-coral">tumhe samajhta hai.</span>
          </h2>

          <div className="space-y-3 font-sans text-base sm:text-lg text-ink-muted leading-relaxed">
            <p>
              Har user ka paisa alag hai. Kisi ke liye ₹500 dining budget realistic hai. Kisi ke liye nahi.
            </p>
            <p>
              Jis recommendation ko tum baar-baar reject karte ho, system us preference ko silently samajhta hai aur adapt karta hai.
            </p>
            <div className="pt-2">
              <span className="font-editorial text-2xl sm:text-3xl text-ink block font-normal">
                &ldquo;Not stricter. Smarter.&rdquo;
              </span>
            </div>
          </div>
        </div>

        {/* Part 2: Money Data Messy Hota Hai (Data Quality & Anomaly Detection - Centered, Filled) */}
        <div className="max-w-5xl mx-auto p-8 sm:p-12 bg-cream/40 border-2 border-line-medium rounded-2xl shadow-sm text-left space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line-medium">
            <div>
              <span className="text-xs font-accent uppercase tracking-widest text-coral font-bold block mb-1">
                Autonomous Intelligence
              </span>
              <h3 className="font-editorial text-3xl sm:text-4xl text-ink font-normal">
                Money data messy hota hai.
              </h3>
            </div>
            <span className="text-xs font-sans text-ink-muted bg-ivory px-3 py-1.5 rounded-full border border-line-light shrink-0">
              Categorizes · Deduplicates · Spots Outliers
            </span>
          </div>

          {/* Raw to Clean Stream Visual */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Raw Messy Inputs */}
            <div className="lg:col-span-5 p-6 bg-ivory border border-line-medium rounded-xl space-y-3">
              <span className="text-[10px] font-accent uppercase tracking-widest text-ink-subtle block font-semibold">
                Raw SMS & Bank Alerts
              </span>
              <div className="font-mono text-xs text-ink-muted space-y-2 opacity-80">
                <div className="p-2 bg-cream/50 rounded truncate">UPI/428919/ZOMATO_IN/BLR-560001 · −₹284</div>
                <div className="p-2 bg-cream/50 rounded truncate">VPA-SWIGGY-BANGALORE-RES-DEL · −₹340</div>
                <div className="p-2 bg-cream/50 rounded truncate">AIRTEL-PREPAID-PYMT-GTW-01 · −₹299</div>
                <div className="p-2 bg-cream/50 rounded truncate">ATM-WDL-HDFC-INDIRANAGAR · −₹2,000</div>
              </div>
              <div className="pt-2 text-[11px] font-sans text-ink-subtle">
                Cryptic text strings, delayed charges & mixed categories.
              </div>
            </div>

            {/* Transition Arrow */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center text-coral mb-2">
                <ArrowRight className="w-5 h-5 rotate-90 lg:rotate-0" />
              </div>
              <span className="text-xs font-accent uppercase tracking-wider text-coral font-bold block">
                PaisaPulse Cleans
              </span>
            </div>

            {/* Clean Result with Anomaly Highlight */}
            <div className="lg:col-span-5 p-6 bg-ivory border-2 border-coral/40 rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-accent text-ink-subtle uppercase">
                <span className="font-semibold text-ink">Intelligent Anomaly Scanner</span>
                <span className="text-coral font-bold">Flagged Context</span>
              </div>

              <div className="flex justify-between items-baseline pt-2">
                <div>
                  <span className="font-accent text-[11px] uppercase tracking-wider text-ink-subtle block">
                    Category: Dining
                  </span>
                  <span className="font-sans text-xs text-ink-muted">
                    Usual average: <strong className="text-ink num-tabular">₹250 / day</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-accent text-[10px] uppercase text-coral font-bold block">
                    TODAY
                  </span>
                  <span className="font-sans text-2xl font-black num-tabular text-coral">
                    ₹12,000
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-cream/70 border border-line-light rounded-lg text-xs font-sans text-ink leading-relaxed">
                <p className="font-bold text-ink">
                  &ldquo;Unusual. Not automatically fraud.&rdquo;
                </p>
                <p className="text-ink-muted mt-1">
                  Could be hosting a team lunch or milestone celebration. PaisaPulse asks whether to treat as a one-time anomaly before recalculating your safe spend horizon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
