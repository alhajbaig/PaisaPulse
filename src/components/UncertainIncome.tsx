"use client";

import { ShieldCheck, Clock, AlertCircle, ArrowRight } from "lucide-react";

export default function UncertainIncome() {
  return (
    <section className="relative py-28 sm:py-36 px-6 sm:px-10 bg-ivory text-ink border-t border-line-medium transition-colors">
      <div className="max-w-5xl mx-auto text-center space-y-16">
        {/* Centered Marker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream border border-line-medium text-[11px] font-accent uppercase tracking-[0.2em] text-coral">
          <Clock className="w-3.5 h-3.5" />
          <span>09 / Core Trust Principle · Verified vs Illusory</span>
        </div>

        {/* Lead Headline */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-editorial text-ink">
            Expected paisa <br />
            aur actual paisa <br />
            <span className="font-editorial-italic text-coral">same nahi hote.</span>
          </h2>
          <p className="font-sans text-base sm:text-lg text-ink-muted leading-relaxed max-w-xl mx-auto">
            Freelance client ne bola &ldquo;kal transfer karunga&rdquo;? PaisaPulse never stakes your rent or food on a verbal promise.
          </p>
        </div>

        {/* Typographic Distinction Cards (Centered, Filled, High-Impact) */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Confirmed Cash Inflow Card */}
          <div className="p-8 bg-cream/50 border-2 border-emerald-700/30 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-accent text-xs uppercase tracking-[0.25em] text-emerald-800 font-bold">
                CONFIRMED
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-100/60 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                Counted in Safe Spend
              </span>
            </div>

            <div>
              <div className="font-sans text-5xl sm:text-6xl font-black text-ink num-tabular tracking-tight">
                ₹8,000
              </div>
              <span className="font-editorial text-2xl text-ink font-normal block mt-2">
                Monthly Internship Stipend
              </span>
            </div>

            <p className="text-xs sm:text-sm font-sans text-ink-muted leading-relaxed">
              Recognized corporate payroll. Expected 10th of every month. 100% safe to allocate against scheduled commitments.
            </p>
          </div>

          {/* Potential / Freelance Cash Inflow Card */}
          <div className="p-8 bg-ivory border-2 border-line-medium rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-accent text-xs uppercase tracking-[0.25em] text-coral font-bold">
                POTENTIAL
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-coral font-semibold bg-coral/10 px-3 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                Quarantined in Shadow Reserve
              </span>
            </div>

            <div>
              <div className="font-sans text-5xl sm:text-6xl font-bold text-ink/35 num-tabular tracking-tight">
                ₹5,000
              </div>
              <span className="font-editorial text-2xl text-ink/70 font-normal block mt-2">
                Freelance Design Invoice
              </span>
            </div>

            <p className="text-xs sm:text-sm font-sans text-ink-muted leading-relaxed">
              Client confirmed via WhatsApp/email, but bank settlement is pending. Quarantined until it hits your account.
            </p>
          </div>
        </div>

        {/* The Fundamental Trust Banner */}
        <div className="max-w-4xl mx-auto p-6 bg-cream/70 border border-line-medium rounded-xl text-center space-y-2">
          <p className="font-editorial text-2xl sm:text-3xl text-ink font-normal">
            &ldquo;Potential income Safe-to-Spend mein count nahi hoti.&rdquo;
          </p>
          <span className="font-accent text-xs uppercase tracking-[0.2em] text-coral font-bold block">
            Until it actually arrives in the account.
          </span>
        </div>
      </div>
    </section>
  );
}
