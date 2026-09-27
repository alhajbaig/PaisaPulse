"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ShieldCheck, Sparkles } from "lucide-react";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const topCurtainRef = useRef<HTMLDivElement>(null);
  const bottomCurtainRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const phases = [
    { code: "01", text: "SYNCHRONIZING FORWARD LEDGER", sub: "Reading upcoming obligations" },
    { code: "02", text: "CALIBRATING 14-DAY RADAR", sub: "Mapping rent, food & buffer dates" },
    { code: "03", text: "COMPUTING SAFE-TO-SPEND", sub: "Quarantining survival reserves" },
    { code: "04", text: "PAISAPULSE GUARDIAN ARMED", sub: "Guilt-free permission unlocked" },
  ];

  const handleFinish = () => {
    if (loaded) return;
    const top = topCurtainRef.current;
    const bottom = bottomCurtainRef.current;
    const content = contentRef.current;
    const preloader = preloaderRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        setLoaded(true);
      },
    });

    tl.to(content, {
      opacity: 0,
      scale: 0.96,
      duration: 0.4,
      ease: "power2.out",
    });

    if (top && bottom) {
      tl.to(
        top,
        {
          yPercent: -100,
          duration: 0.8,
          ease: "expo.inOut",
        },
        "-=0.15"
      );
      tl.to(
        bottom,
        {
          yPercent: 100,
          duration: 0.8,
          ease: "expo.inOut",
        },
        "<"
      );
    } else if (preloader) {
      tl.to(preloader, {
        yPercent: -100,
        duration: 0.8,
        ease: "expo.inOut",
      });
    }
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setLoaded(true);
      return;
    }

    const duration = 1350; // 1.35s ultra-fluid loader
    const startTime = performance.now();
    let animId = 0;

    const update = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Smooth cubic easing for counter deceleration
      const eased = 1 - Math.pow(1 - t, 3);
      const currentVal = Math.round(eased * 100);

      setProgress(currentVal);

      if (currentVal < 28) {
        setPhaseIndex(0);
      } else if (currentVal < 60) {
        setPhaseIndex(1);
      } else if (currentVal < 92) {
        setPhaseIndex(2);
      } else {
        setPhaseIndex(3);
      }

      if (t < 1) {
        animId = requestAnimationFrame(update);
      } else {
        setTimeout(handleFinish, 180);
      }
    };

    animId = requestAnimationFrame(update);

    // Keyboard shortcut to skip immediately
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        handleFinish();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (loaded) return null;

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 z-[10000] overflow-hidden select-none pointer-events-auto"
      onClick={handleFinish}
      title="Click or press any key to enter immediately"
    >
      {/* Top Split Curtain */}
      <div
        ref={topCurtainRef}
        className="absolute top-0 left-0 right-0 h-1/2 bg-[#0C0B0A] border-b border-white/5 will-change-transform"
      />

      {/* Bottom Split Curtain */}
      <div
        ref={bottomCurtainRef}
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#0C0B0A] border-t border-white/5 will-change-transform"
      />

      {/* Luxury Cinematic Content Overlay */}
      <div
        ref={contentRef}
        className="absolute inset-0 z-10 flex flex-col items-center justify-between p-8 sm:p-14 text-[#FFFAF3] will-change-transform"
      >
        {/* Top Status Header */}
        <div className="w-full flex items-center justify-between text-[11px] font-accent uppercase tracking-[0.25em] text-white/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
            <span className="font-semibold text-white/80">PaisaPulse</span>
            <span className="text-white/30 hidden sm:inline">· AI Cashflow Guardian</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFinish();
            }}
            className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-coral text-white/60 hover:text-coral transition-colors tracking-widest text-[10px]"
          >
            Skip ➔
          </button>
        </div>

        {/* Centerpiece Kinetic Core */}
        <div className="flex flex-col items-center text-center space-y-8 max-w-lg">
          {/* Glowing Guardian Micro-Ring */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Outer Breathing Rings */}
            <div className="absolute inset-0 rounded-full border border-coral/30 animate-ping opacity-60" />
            <div className="absolute -inset-2 rounded-full border border-coral/15 animate-pulse" />
            <div className="w-14 h-14 rounded-full bg-coral/10 border border-coral/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_24px_rgba(255,98,68,0.25)]">
              <span className="w-2.5 h-2.5 rounded-full bg-coral shadow-[0_0_10px_#FF6244]" />
            </div>
          </div>

          {/* Editorial Title & Credo */}
          <div className="space-y-3">
            <h1 className="font-editorial text-4xl sm:text-6xl tracking-editorial text-[#FFFAF3] font-normal leading-tight">
              PAISAPULSE
            </h1>
            <p className="font-editorial italic text-lg sm:text-xl text-white/80 tracking-wide">
              &ldquo;Paise sirf aaj ke nahi hote. Kal ke bhi hote hain.&rdquo;
            </p>
          </div>

          {/* High-Impact Tabular Counter */}
          <div className="flex items-baseline justify-center gap-1 font-sans font-black text-6xl sm:text-7xl text-coral num-tabular tracking-tighter drop-shadow-[0_0_20px_rgba(255,98,68,0.3)]">
            <span>{progress}</span>
            <span className="text-3xl text-coral/60 font-light">%</span>
          </div>

          {/* Smooth Kinetic Multi-Segment Bar */}
          <div className="w-64 sm:w-80 h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 relative">
            <div
              className="h-full bg-gradient-to-r from-coral via-[#FFA07A] to-coral rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_#FF6244]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Dynamic Telemetry Status */}
          <div className="space-y-1 h-12 flex flex-col items-center justify-center">
            <div className="text-[11px] font-accent uppercase tracking-[0.25em] text-coral font-bold flex items-center gap-2">
              <span className="text-white/40">[{phases[phaseIndex].code}]</span>
              <span>{phases[phaseIndex].text}</span>
            </div>
            <div className="text-[12px] font-sans text-white/50">
              {phases[phaseIndex].sub}
            </div>
          </div>
        </div>

        {/* Bottom Ambient Security Seal */}
        <div className="w-full flex items-center justify-between text-[10px] font-accent uppercase tracking-[0.2em] text-white/30 border-t border-white/5 pt-4">
          <span className="hidden sm:inline">Zero Bank Passwords</span>
          <span className="mx-auto sm:mx-0">Deterministic Math · Bengaluru, India</span>
          <span className="hidden sm:inline">Safe-To-Spend Protocol v2.4</span>
        </div>
      </div>
    </div>
  );
}
