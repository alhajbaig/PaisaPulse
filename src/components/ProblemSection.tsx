"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AlertCircle, EyeOff, ShieldCheck, ArrowRight, TrendingDown } from "lucide-react";

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".problem-fade",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="relative py-28 sm:py-36 px-6 sm:px-10 bg-gradient-to-b from-ivory via-[#FFF5E6] to-cream text-ink border-t border-line-medium transition-colors"
    >
      <div className="max-w-5xl mx-auto text-center space-y-16">
        {/* Section Index Marker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ivory border border-line-medium text-[11px] font-accent uppercase tracking-[0.2em] text-coral">
          <EyeOff className="w-3.5 h-3.5" />
          <span>02 / The Disconnect · Optical Illusion of Wealth</span>
        </div>

        {/* Lead Headline - Centered */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="problem-fade font-editorial text-4xl sm:text-6xl lg:text-7xl text-ink font-normal leading-[1.05] tracking-editorial">
            Balance tumhe <br />
            <span className="font-editorial-italic text-coral">poori story</span> nahi batata.
          </h2>
          <p className="problem-fade font-sans text-lg sm:text-xl text-ink-muted leading-relaxed pt-2 max-w-2xl mx-auto">
            Bank app bolta hai: <span className="text-ink font-semibold num-tabular">₹10,000 available</span>.
            <br />
            PaisaPulse poochta hai: <span className="text-ink font-semibold">₹10,000 mein se kitna actually free hai?</span>
          </p>
        </div>

        {/* Typographic & Visual Comparison Board (Centered, Filled, High-Impact) */}
        <div
          ref={comparisonRef}
          className="p-8 sm:p-12 bg-ivory border-2 border-line-medium rounded-2xl shadow-sm text-left grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative overflow-hidden"
        >
          {/* Subtle dividing line */}
          <div className="hidden md:block absolute top-8 bottom-8 left-1/2 w-[1px] bg-line-medium -translate-x-1/2" />

          {/* Left: Bank Balance Illusion */}
          <div className="space-y-6 md:pr-6">
            <div className="flex items-center justify-between">
              <span className="font-accent text-xs uppercase tracking-[0.25em] text-ink-subtle">
                What the Bank Shows
              </span>
              <span className="text-[10px] font-accent uppercase px-2 py-0.5 rounded bg-cream text-ink-muted border border-line-light">
                Static Ledger
              </span>
            </div>

            <div className="space-y-1">
              <div className="font-sans text-5xl sm:text-7xl font-bold tracking-tight text-ink/40 num-tabular line-through decoration-coral/40 decoration-2">
                ₹10,000
              </div>
              <span className="text-xs font-accent text-ink-subtle uppercase tracking-wider block">
                Visible Balance (Deceptive)
              </span>
            </div>

            <p className="text-sm font-sans text-ink-muted leading-relaxed">
              Silent about upcoming PG rent, electricity dues, Wi-Fi recharge, or emergency medical buffer.
            </p>

            <div className="p-3 bg-cream/50 rounded-lg text-xs font-sans text-ink-muted flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-coral shrink-0" />
              <span>Leaves you vulnerable to sudden overdraft panic</span>
            </div>
          </div>

          {/* Right: Safe Reality (The Focal Point) */}
          <div className="space-y-6 md:pl-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
                <span className="font-accent text-xs uppercase tracking-[0.25em] text-coral font-bold">
                  What PaisaPulse Calculates
                </span>
              </div>
              <span className="text-[10px] font-accent uppercase px-2 py-0.5 rounded bg-coral/10 text-coral font-bold border border-coral/30">
                Safe to Spend
              </span>
            </div>

            <div className="space-y-1">
              <div className="font-sans text-6xl sm:text-8xl font-black tracking-tight text-coral num-tabular">
                ₹620
              </div>
              <span className="text-xs font-accent text-coral uppercase tracking-wider block font-semibold">
                Daily Spendable Ceiling
              </span>
            </div>

            <div className="space-y-1">
              <span className="font-editorial text-xl sm:text-2xl text-ink block font-normal">
                Sirf ₹620 actually spendable.
              </span>
              <p className="text-sm font-sans text-ink-muted leading-relaxed">
                <span className="num-tabular font-semibold text-ink">₹5,000</span> rent ke liye reserved.{" "}
                <span className="num-tabular font-semibold text-ink">₹1,200</span> bills ke liye locked.{" "}
                <span className="num-tabular font-semibold text-ink">₹3,000</span> buffer protected.
              </p>
            </div>

            <div className="p-3 bg-peach/30 border border-coral/20 rounded-lg text-xs font-sans text-ink flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-coral shrink-0" />
              <span>100% guilt-free. Next month is completely secure.</span>
            </div>
          </div>
        </div>

        {/* Visual Progress Slices */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 bg-ivory border border-line-medium rounded-xl space-y-1">
            <span className="text-[10px] font-accent uppercase tracking-wider text-ink-subtle">01 · Scheduled PG Rent</span>
            <div className="font-sans font-bold text-lg text-ink num-tabular">₹5,000 <span className="text-xs font-normal text-ink-muted">(in 4 days)</span></div>
            <div className="w-full bg-cream h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-coral h-full w-[50%]" />
            </div>
          </div>

          <div className="p-4 bg-ivory border border-line-medium rounded-xl space-y-1">
            <span className="text-[10px] font-accent uppercase tracking-wider text-ink-subtle">02 · Wi-Fi & Subs</span>
            <div className="font-sans font-bold text-lg text-ink num-tabular">₹1,200 <span className="text-xs font-normal text-ink-muted">(in 6 days)</span></div>
            <div className="w-full bg-cream h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-coral h-full w-[12%]" />
            </div>
          </div>

          <div className="p-4 bg-ivory border-2 border-coral/30 rounded-xl space-y-1">
            <span className="text-[10px] font-accent uppercase tracking-wider text-coral font-bold">03 · Safety Cushion</span>
            <div className="font-sans font-bold text-lg text-coral num-tabular">₹3,000 <span className="text-xs font-normal text-ink-muted">(untouchable)</span></div>
            <div className="w-full bg-cream h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-ink h-full w-[30%]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
