"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GhostFibers from "./GhostFibers";
import "./ScrollExpand.css";

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

export default function ScrollExpand({
  title = "PAISAPULSE",
  scrollHint = "Scroll to unfold the guardian ↓",
  startWidth = 58,
  startHeight = 60,
  startRadius = 28,
  endRadius = 0,
  scrollDistance = 1.15,
  holdDistance = 0.4,
  children,
  className = "",
  style = {},
}) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const fibersWrapperRef = useRef(null);
  const titleRef = useRef(null);
  const overlayRef = useRef(null);
  const hintRef = useRef(null);
  const [isFibersPaused, setIsFibersPaused] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const stage = stageRef.current;
    const track = trackRef.current;
    const frame = frameRef.current;
    const fibersWrapper = fibersWrapperRef.current;
    const titleEl = titleRef.current;
    const hintEl = hintRef.current;
    const overlay = overlayRef.current;

    if (!stage || !track || !frame) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Initial GPU clip-path state
    const initIx = (100 - startWidth) / 2;
    const initIy = (100 - startHeight) / 2;
    frame.style.clipPath = `inset(${initIy}% ${initIx}% ${initIy}% ${initIx}% round ${startRadius}px)`;
    frame.style.backgroundColor = "rgb(12, 11, 10)";
    frame.style.setProperty("--text-main", "#FFFAF3");
    frame.style.setProperty("--text-sub", "rgba(255, 250, 243, 0.75)");
    frame.style.setProperty("--badge-bg", "rgba(255, 255, 255, 0.08)");
    frame.style.setProperty("--badge-border", "rgba(255, 255, 255, 0.15)");
    frame.style.setProperty("--card-bg", "rgba(255, 255, 255, 0.06)");
    frame.style.setProperty("--card-border", "rgba(255, 255, 255, 0.12)");

    if (fibersWrapper) {
      fibersWrapper.style.opacity = "1";
      fibersWrapper.style.display = "block";
    }
    if (overlay) {
      overlay.style.opacity = "0";
      overlay.style.transform = "translate3d(0, 30px, 0)";
      overlay.style.pointerEvents = "none";
    }
    if (titleEl) {
      titleEl.style.opacity = "1";
      titleEl.style.transform = "translate3d(0, 0, 0)";
    }
    if (hintEl) {
      hintEl.style.opacity = "1";
    }

    if (prefersReducedMotion) {
      frame.style.clipPath = "inset(0% 0% 0% 0% round 0px)";
      frame.style.backgroundColor = "#FFFAF3";
      frame.style.setProperty("--text-main", "#171512");
      frame.style.setProperty("--text-sub", "#665E53");
      frame.style.setProperty("--badge-bg", "#FFF2DB");
      frame.style.setProperty("--badge-border", "rgba(23, 21, 18, 0.15)");
      frame.style.setProperty("--card-bg", "#FFF2DB");
      frame.style.setProperty("--card-border", "rgba(23, 21, 18, 0.1)");
      if (fibersWrapper) fibersWrapper.style.display = "none";
      if (overlay) {
        overlay.style.opacity = "1";
        overlay.style.transform = "translate3d(0, 0, 0)";
        overlay.style.pointerEvents = "auto";
      }
      if (titleEl) titleEl.style.opacity = "0";
      if (hintEl) hintEl.style.opacity = "0";
      setIsFibersPaused(true);
      return;
    }

    const pinScrollDistance = Math.round(
      window.innerHeight * (scrollDistance + holdDistance)
    );

    let isLightModeActive = false;

    const st = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: `+=${pinScrollDistance}`,
      pin: stage,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: true, // 1:1 hardware scroll lock with Lenis
      onUpdate: (self) => {
        const p = self.progress; // 0 to 1

        // Phase 1: Hardware-Accelerated Clip-Path Expansion (0 to 0.65)
        const expandPortion = 0.65;
        const e = clamp(p / expandPortion, 0, 1);
        const eased = e * e * (3 - 2 * e);

        const currentWidth = startWidth + (100 - startWidth) * eased;
        const currentHeight = startHeight + (100 - startHeight) * eased;
        const currentRadius = startRadius + (endRadius - startRadius) * eased;

        const ix = Math.max(0, (100 - currentWidth) / 2);
        const iy = Math.max(0, (100 - currentHeight) / 2);

        // GPU-only clipPath update (0 layout reflows!)
        frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${currentRadius}px)`;

        // GhostFibers Smooth Fade-Out & Complete GPU Resource Release:
        if (fibersWrapper) {
          if (p < 0.28) {
            const fibersFade = clamp(1 - p / 0.24, 0, 1);
            fibersWrapper.style.display = "block";
            fibersWrapper.style.opacity = `${fibersFade}`;
            setIsFibersPaused(false);
          } else {
            fibersWrapper.style.opacity = "0";
            fibersWrapper.style.display = "none";
            setIsFibersPaused(true); // Shut down WebGL loop completely!
          }
        }

        // Background Color Transition:
        // Seamlessly morphs from deep obsidian (12, 11, 10) to warm ivory (255, 250, 243)
        const colorProgress = clamp((p - 0.12) / 0.28, 0, 1);
        const colorEased = colorProgress * colorProgress * (3 - 2 * colorProgress);

        const r = Math.round(12 + (255 - 12) * colorEased);
        const g = Math.round(11 + (250 - 11) * colorEased);
        const b = Math.round(10 + (243 - 10) * colorEased);

        frame.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

        // ONLY trigger CSS variable changes once when crossing the boundary!
        const isLight = colorEased >= 0.5;
        if (isLight !== isLightModeActive) {
          isLightModeActive = isLight;
          if (!isLight) {
            frame.style.setProperty("--text-main", "#FFFAF3");
            frame.style.setProperty("--text-sub", "rgba(255, 250, 243, 0.75)");
            frame.style.setProperty("--badge-bg", "rgba(255, 255, 255, 0.08)");
            frame.style.setProperty("--badge-border", "rgba(255, 255, 255, 0.15)");
            frame.style.setProperty("--card-bg", "rgba(255, 255, 255, 0.06)");
            frame.style.setProperty("--card-border", "rgba(255, 255, 255, 0.12)");
          } else {
            frame.style.setProperty("--text-main", "#171512");
            frame.style.setProperty("--text-sub", "#665E53");
            frame.style.setProperty("--badge-bg", "#FFF2DB");
            frame.style.setProperty("--badge-border", "rgba(23, 21, 18, 0.15)");
            frame.style.setProperty("--card-bg", "#FFF2DB");
            frame.style.setProperty("--card-border", "rgba(23, 21, 18, 0.1)");
          }
        }

        // Title on black card lifts and fades out early (0 to 0.20)
        if (titleEl) {
          const titleOut = clamp(p / 0.18, 0, 1);
          titleEl.style.opacity = `${1 - titleOut}`;
          titleEl.style.transform = `translate3d(0, ${-40 * titleOut}px, 0)`;
        }

        // Hint fades out immediately (0 to 0.10)
        if (hintEl) {
          const hintOut = clamp(p / 0.10, 0, 1);
          hintEl.style.opacity = `${1 - hintOut}`;
        }

        // Overlay Content reveals smoothly from p = 0.35 to p = 0.60
        if (overlay) {
          const overlayIn = clamp((p - 0.32) / 0.25, 0, 1);
          const overlayEased = overlayIn * overlayIn * (3 - 2 * overlayIn);
          overlay.style.opacity = `${overlayEased}`;
          overlay.style.transform = `translate3d(0, ${24 * (1 - overlayEased)}px, 0)`;
          overlay.style.pointerEvents = overlayIn > 0.6 ? "auto" : "none";
        }
      },
    });

    return () => {
      st.kill();
    };
  }, [
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    scrollDistance,
    holdDistance,
  ]);

  return (
    <div
      ref={rootRef}
      className={`scroll-expand ${className}`.trim()}
      style={style}
    >
      <div ref={trackRef} className="scroll-expand__track">
        <div ref={stageRef} className="scroll-expand__stage">
          <div ref={frameRef} className="scroll-expand__frame">
            {/* Hypnotic GhostFibers Cashflow Pulse - Ethereal, Deep Obsidian & Low Transparency */}
            <div
              ref={fibersWrapperRef}
              className="absolute inset-0 overflow-hidden pointer-events-none opacity-35"
            >
              <GhostFibers
                lineColor="#FF6244"
                glowColor="#FFA07A"
                speed={0.15}
                scale={2.2}
                rotation={28}
                rotationSpeed={0.16}
                layers={3}
                waveAmplitude={0.012}
                waveFrequency={3}
                waveSpeed={0.14}
                layerSpeed={0.08}
                twist={0.1}
                twistFrequency={4.5}
                twistSpeed={1.0}
                lineFrequency={5}
                lineSpacing={2}
                lineSharpness={16}
                glowFalloff={16}
                glowIntensity={0.9}
                brightness={1.25}
                blueBoost={1.1}
                vignette={0.9}
                grain={0.03}
                dpr={1}
                fps={60}
                paused={isFibersPaused}
              />
              {/* Subtle luxury grid on black card */}
              <div className="scroll-expand__grid" />
            </div>

            {/* Resting Initial Title on Black Card - Ultra-Striking Hook */}
            <div ref={titleRef} className="scroll-expand__title">
              {/* Luminous Warm Backlight */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-coral/15 blur-3xl pointer-events-none -z-10" />

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/15 text-[11px] font-accent uppercase tracking-[0.3em] text-coral mb-5 backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
                <span className="font-bold">AI Cashflow Guardian</span>
              </div>
              <h1 className="font-editorial text-5xl sm:text-7xl lg:text-8xl tracking-editorial text-[#FFFAF3] font-normal drop-shadow-lg">
                {title}
              </h1>
              <p className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-white mt-5 font-normal tracking-wide max-w-2xl mx-auto drop-shadow-md leading-snug">
                &ldquo;Paise sirf aaj ke nahi hote.{" "}
                <span className="block sm:inline font-editorial-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#FF7E65] via-[#FFA978] to-[#FFE2BF] drop-shadow-[0_0_28px_rgba(255,98,68,0.55)]">
                  Kal ke bhi hote hain.
                </span>&rdquo;
              </p>
              <span className="font-sans text-xs uppercase tracking-[0.24em] text-white/70 block mt-3 font-medium drop-shadow-sm">
                Because your balance doesn&apos;t know what tomorrow needs
              </span>
            </div>

            {/* Scroll Hint */}
            <div ref={hintRef} className="scroll-expand__hint">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-sm">
                <span>{scrollHint}</span>
              </span>
            </div>

            {/* Expanded Overlay Content */}
            <div ref={overlayRef} className="scroll-expand__overlay">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
