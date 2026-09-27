"use client";

import { useState } from "react";
import { ArrowRight, Eye, ShieldCheck, Cpu, SlidersHorizontal, Sparkles, CheckCircle2 } from "lucide-react";

export default function IntroduceSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: "01",
      label: "TRACK",
      icon: Eye,
      title: "Silent Cash Velocity",
      detail: "Passively reconciles UPI, stipend, and savings without tedious manual logging.",
      note: "Aaj kya hai",
      example: "₹10,000 liquid across 1 bank account + Paytm UPI",
    },
    {
      num: "02",
      label: "PREDICT",
      icon: ShieldCheck,
      title: "Obligation Radar",
      detail: "Locks down upcoming rent, Wi-Fi, insurance, and committed EMIs days before they hit.",
      note: "Kal kya due hai",
      example: "PG Rent ₹5,000 on 1st + Wi-Fi ₹1,200 on 3rd ring-fenced",
    },
    {
      num: "03",
      label: "SIMULATE",
      icon: SlidersHorizontal,
      title: "Safe-to-Spend Boundary",
      detail: "Runs forward Monte Carlo simulation of next 14–30 days with unexpected variance buffer.",
      note: "Beech mein kitna free hai",
      example: "₹620/day maximum safe spend until next confirmed stipend",
    },
    {
      num: "04",
      label: "ACT",
      icon: Cpu,
      title: "Micro Interventions",
      detail: "Suggests subtle 3-day adjustments when shortfalls loom, before anxiety strikes.",
      note: "Warning nahi, solution",
      example: "Recover ₹850 flatmates split + pause 1 dormant subscription",
    },
    {
      num: "05",
      label: "LEARN",
      icon: Sparkles,
      title: "Behavioral Alignment",
      detail: "Understands your personal lifestyle comfort. Never forces unrealistic austerity.",
      note: "Tumhara lifestyle, tumhara rule",
      example: "Adapts to your regular weekend dining without shame",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative py-28 sm:py-36 px-6 sm:px-10 bg-gradient-to-b from-cream via-[#FFEAD0] to-peach/50 text-ink border-t border-line-medium transition-colors"
    >
      <div className="max-w-6xl mx-auto text-center space-y-16">
        {/* Centered Section Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ivory border border-line-medium text-[11px] font-accent uppercase tracking-[0.2em] text-coral">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MEET PAISAPULSE</span>
        </div>

        {/* Huge Centered Editorial Statement */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-editorial text-ink">
            Your money. <br />
            <span className="font-editorial-italic text-coral">With a sense of tomorrow.</span>
          </h2>

          <div className="max-w-2xl mx-auto text-ink-muted font-sans text-base sm:text-lg leading-relaxed space-y-2">
            <p>
              PaisaPulse tumhare paise ko sirf track nahi karta.
            </p>
            <p className="text-ink font-semibold">
              Woh dekhta hai: aaj kya hai, kal kya due hai, aur beech mein kitna safely spend kar sakte ho.
            </p>
          </div>
        </div>

        {/* 5-Step Editorial Stepper Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-4xl mx-auto">
          {steps.map((step, idx) => {
            const isSelected = activeStep === idx;
            const Icon = step.icon;
            return (
              <button
                key={step.label}
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-xl border transition-all text-left group ${
                  isSelected
                    ? "bg-ivory border-coral shadow-sm ring-1 ring-coral/30"
                    : "bg-ivory/50 border-line-medium hover:border-ink hover:bg-ivory/80"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-accent font-bold text-ink-subtle">
                    {step.num}
                  </span>
                  <Icon className={`w-4 h-4 transition-colors ${isSelected ? "text-coral" : "text-ink-muted"}`} />
                </div>
                <div className={`font-sans font-bold text-xs tracking-wider uppercase ${isSelected ? "text-coral" : "text-ink"}`}>
                  {step.label}
                </div>
                <div className="text-[10px] font-sans text-ink-muted truncate mt-0.5">
                  {step.note}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Card Showcase (Filled, Centered, High Aesthetic) */}
        <div className="max-w-4xl mx-auto p-8 sm:p-10 bg-ivory border-2 border-line-medium rounded-2xl shadow-sm text-left relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-accent uppercase tracking-widest text-coral font-bold">
                <span>Stage {steps[activeStep].num} · {steps[activeStep].label}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-coral" />
                <span className="text-ink-subtle font-normal">&ldquo;{steps[activeStep].note}&rdquo;</span>
              </div>

              <h3 className="font-editorial text-3xl sm:text-4xl text-ink font-normal leading-tight">
                {steps[activeStep].title}
              </h3>

              <p className="font-sans text-sm sm:text-base text-ink-muted leading-relaxed">
                {steps[activeStep].detail}
              </p>

              {/* Real World Concrete Example */}
              <div className="p-3 bg-cream/70 border border-line-light rounded-lg text-xs font-sans text-ink flex items-center gap-2 mt-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span><strong>Live Reality:</strong> {steps[activeStep].example}</span>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end justify-center border-t md:border-t-0 md:border-l border-line-medium pt-4 md:pt-0 md:pl-8 shrink-0">
              <span className="font-editorial italic text-2xl text-ink">
                PaisaPulse
              </span>
              <span className="font-accent text-xs uppercase tracking-wider text-coral font-bold mt-1">
                Autonomous Precision
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
