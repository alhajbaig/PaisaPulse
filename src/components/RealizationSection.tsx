"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function RealizationSection() {
  const containerRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);
  const line3Ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 65%",
          end: "bottom 80%",
          scrub: false,
        },
      });

      tl.fromTo(
        line1Ref.current,
        { opacity: 0.2, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
        .fromTo(
          line2Ref.current,
          { opacity: 0.1, y: 25 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          "+=0.2"
        )
        .fromTo(
          line3Ref.current,
          { opacity: 0, scale: 0.98, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power3.out" },
          "+=0.3"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[70vh] py-32 sm:py-44 px-6 sm:px-10 bg-cream text-ink flex items-center justify-center border-t border-line-light overflow-hidden"
    >
      <div className="max-w-4xl mx-auto w-full text-center space-y-8 sm:space-y-12">
        {/* Subtle Index */}
        <span className="inline-block text-[11px] font-accent uppercase tracking-[0.25em] text-ink-subtle">
          03 / The Paradigm Shift
        </span>

        {/* Line 1 */}
        <p
          ref={line1Ref}
          className="font-sans text-xl sm:text-3xl text-ink-muted font-light tracking-tight max-w-2xl mx-auto"
        >
          Most budgeting apps tell you <span className="line-through decoration-coral/50">what happened</span>.
        </p>

        {/* Line 2 (The Pause) */}
        <p
          ref={line2Ref}
          className="font-editorial italic text-2xl sm:text-4xl text-ink-subtle font-normal"
        >
          Hum poochte hain...
        </p>

        {/* Line 3 (The Punchline / Realization) */}
        <p
          ref={line3Ref}
          className="font-editorial text-4xl sm:text-7xl lg:text-8xl text-ink font-normal leading-[1.05] tracking-editorial"
        >
          &ldquo;Ab kya karna <span className="text-coral underline decoration-1 underline-offset-8">safe hai</span>?&rdquo;
        </p>

        {/* Sub-note */}
        <div className="pt-6 max-w-lg mx-auto">
          <p className="font-sans text-xs sm:text-sm text-ink-muted uppercase tracking-wider">
            Backward accounting causes anxiety. Forward projection creates agency.
          </p>
        </div>
      </div>
    </section>
  );
}
