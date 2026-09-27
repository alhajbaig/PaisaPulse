"use client";

import { useState } from "react";
import { 
  Radar, 
  ShieldAlert, 
  Sparkles, 
  SlidersHorizontal, 
  TrendingUp, 
  Zap, 
  Clock, 
  CheckCircle,
  HelpCircle,
  ArrowRight
} from "lucide-react";

export default function FeatureGrid() {
  const [activeTab, setActiveTab] = useState(0);

  const pillars = [
    {
      icon: Radar,
      title: "Autonomous Obligation Radar",
      tag: "Forward Scanning",
      headline: "Knows what tomorrow needs before you do",
      desc: "Scans ahead 14–30 days for rent, EMIs, recharge dates, and recurring subscriptions. Never lets a recurring auto-debit surprise your morning balance.",
      badge: "Zero Manual Logging",
      stat: "100% Obligation Coverage",
    },
    {
      icon: SlidersHorizontal,
      title: "Safe Daily Burn Dispenser",
      tag: "Daily Allowance",
      headline: "One clear decision, every single morning",
      desc: "Converts liquid cash, confirmed inflows, upcoming deductions, and emergency buffers into one simple guilt-free number: Safe to spend today.",
      badge: "Real-Time Dynamic",
      stat: "₹620 – ₹1,200 Daily Range",
    },
    {
      icon: Clock,
      title: "Temporal Volatility Buffer",
      tag: "Freelancer Friendly",
      headline: "Protects against the 'kal transfer karta hoon' trap",
      desc: "Separates confirmed salary/stipend from unverified freelance promises. Potential money stays quarantined until the funds physically settle in your bank.",
      badge: "Conservative Accounting",
      stat: "Zero False Confidence",
    },
    {
      icon: Zap,
      title: "Early Action Intervention",
      tag: "Pre-Emptive Fixes",
      headline: "Solutions, not panic notifications",
      desc: "Spots a cash squeeze 6 days before it happens and offers 4 gentle, realistic adjustments: split recovery, paused subscriptions, or purchase delays.",
      badge: "Respects Agency",
      stat: "6 Days Notice",
    },
    {
      icon: Sparkles,
      title: "Behavioral Personalization",
      tag: "No Austerity Shaming",
      headline: "Understands your personal comfort threshold",
      desc: "If you love weekend cafe sessions, PaisaPulse absorbs it. If you reject a recommendation, it learns your lifestyle rather than penalizing you.",
      badge: "Adaptive Memory",
      stat: "Self-Calibrating",
    },
    {
      icon: TrendingUp,
      title: "Messy Transaction Scrubber",
      tag: "Data Intelligence",
      headline: "Cleans cryptic UPI references effortlessly",
      desc: "Transforms cryptic strings like 'UPI/4920/ZOMATO_IN' into pristine categories. Flags genuine anomalies (like a ₹12,000 team lunch) with context.",
      badge: "Instant Clarity",
      stat: "99.8% Accuracy",
    },
  ];

  return (
    <section className="relative py-28 sm:py-36 px-6 sm:px-10 bg-cream/40 text-ink border-t border-line-medium">
      <div className="max-w-6xl mx-auto text-center space-y-16">
        {/* Section Marker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ivory border border-line-medium text-[11px] font-accent uppercase tracking-[0.2em] text-coral">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Forward Architecture</span>
        </div>

        {/* Section Headline */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-editorial text-ink">
            Engineered for clarity, <br />
            <span className="font-editorial-italic text-coral">not accounting anxiety.</span>
          </h2>
          <p className="font-sans text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
            Everything your traditional bank and expense tracker forgot to build. Built specifically for students, interns, and young earners across India.
          </p>
        </div>

        {/* Feature Cards Grid (Attractive, Filled, Centered) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-left">
          {pillars.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group p-6 sm:p-8 bg-ivory rounded-2xl border border-line-medium hover:border-coral/60 transition-all duration-300 hover:shadow-md flex flex-col justify-between space-y-6 relative overflow-hidden"
              >
                {/* Subtle Background Accent Corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-peach/20 rounded-bl-full pointer-events-none transition-transform group-hover:scale-125" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center border border-line-light group-hover:bg-coral group-hover:text-ivory transition-colors">
                      <Icon className="w-5 h-5 text-coral group-hover:text-ivory transition-colors" />
                    </div>
                    <span className="text-[10px] font-accent uppercase tracking-widest text-ink-subtle px-2.5 py-1 rounded-full bg-cream/70 border border-line-light">
                      {item.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-editorial text-2xl text-ink font-normal leading-snug">
                      {item.title}
                    </h3>
                    <div className="text-xs font-sans font-semibold text-coral mt-1">
                      {item.headline}
                    </div>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-line-light flex items-center justify-between text-[11px] font-accent text-ink-subtle">
                  <span className="text-ink font-medium">{item.badge}</span>
                  <span className="num-tabular text-coral font-semibold">{item.stat}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
