"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, CheckCircle2, XCircle } from "lucide-react";

export default function CoreDifference() {
  const containerRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        leftRef.current,
        { opacity: 0.3, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
          },
        }
      );

      gsap.fromTo(
        rightRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 60%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative py-32 sm:py-44 px-6 sm:px-10 bg-ivory text-ink border-t border-line-medium overflow-hidden"
    >
      <div className="max-w-5xl mx-auto text-center space-y-20">
        {/* Section Index */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream border border-line-medium text-[11px] font-accent uppercase tracking-[0.2em] text-coral font-bold">
          <span>12 / The Fundamental Cleave · Backward vs Forward</span>
        </div>

        {/* The Two Worlds in High Contrast (Centered, Filled) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* World 1: The Old Expense Tracker */}
          <div
            ref={leftRef}
            className="p-8 sm:p-10 bg-cream/40 border border-line-medium rounded-2xl space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-accent uppercase tracking-widest text-ink-subtle">
                <span>The Past (Guilt)</span>
                <XCircle className="w-4 h-4 text-ink-muted" />
              </div>

              <span className="font-accent text-xs uppercase tracking-[0.25em] text-ink-subtle block">
                Traditional Expense Tracker
              </span>

              <h3 className="font-editorial text-3xl sm:text-5xl font-light text-ink/50 tracking-editorial leading-tight">
                &ldquo;Where did my money go?&rdquo;
              </h3>

              <p className="font-sans text-sm sm:text-base text-ink-muted leading-relaxed">
                Autopsy of past guilt. Pie charts of yesterday&apos;s coffee. Zero help for what to do this evening.
              </p>
            </div>

            <div className="p-4 bg-ivory rounded-xl text-xs font-sans text-ink-muted">
              Result: Post-spending regret, constant anxiety, manual logging fatigue.
            </div>
          </div>

          {/* World 2: PaisaPulse (The Climax) */}
          <div
            ref={rightRef}
            className="p-8 sm:p-10 bg-ivory border-2 border-coral rounded-2xl space-y-6 shadow-md flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-accent uppercase tracking-widest text-coral font-bold">
                <span>The Future (Clarity)</span>
                <CheckCircle2 className="w-4 h-4 text-coral" />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
                <span className="font-accent text-xs uppercase tracking-[0.25em] text-coral font-bold block">
                  PaisaPulse Forward Guardian
                </span>
              </div>

              <h2 className="font-editorial text-3xl sm:text-5xl font-normal text-ink tracking-editorial leading-tight">
                &ldquo;What can I <span className="font-editorial-italic text-coral">safely do</span> with it?&rdquo;
              </h2>

              <p className="font-sans text-sm sm:text-base text-ink font-medium leading-relaxed">
                Real-time permission to live your life. Knowing tomorrow is locked, so today is yours to enjoy guilt-free.
              </p>
            </div>

            <div className="p-4 bg-coral/10 border border-coral/30 rounded-xl text-xs font-sans text-coral font-semibold">
              Result: Complete agency, zero overdrafts, peaceful financial mindset.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
