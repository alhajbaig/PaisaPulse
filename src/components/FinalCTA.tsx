"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { isUserLoggedIn } from "../engine/userStore.js";

export default function FinalCTA() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        setIsLoggedIn(isUserLoggedIn());
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();

    window.addEventListener("storage", checkAuth);
    window.addEventListener("paisapulse_auth_change", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("paisapulse_auth_change", checkAuth);
    };
  }, []);

  return (
    <section
      id="philosophy"
      className="relative py-32 sm:py-44 px-6 sm:px-10 bg-ivory text-ink border-t border-line-medium transition-colors overflow-hidden"
    >
      <div className="max-w-5xl mx-auto w-full text-center space-y-16">
        {/* Centered Credo */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream border border-line-medium text-[11px] font-accent uppercase tracking-[0.2em] text-coral font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>13 / The Final Credo</span>
          </div>

          <h2 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal text-ink leading-[1.05] tracking-editorial">
            Paise manage karna <br />
            <span className="font-editorial-italic text-ink-muted">sirf numbers ka game nahi hai.</span>
          </h2>

          <p className="font-editorial text-2xl sm:text-4xl lg:text-5xl font-normal text-ink leading-[1.1] tracking-editorial max-w-2xl mx-auto pt-2">
            It is knowing what today can afford without hurting tomorrow.
          </p>
        </div>

        {/* Brand Lockup & Final Action Card (Centered, Filled, High-Impact) */}
        <div className="max-w-4xl mx-auto p-8 sm:p-12 bg-cream/50 border-2 border-line-medium rounded-2xl shadow-sm text-center space-y-8">
          <div className="space-y-3">
            <span className="font-accent text-xs tracking-[0.25em] text-coral uppercase font-bold block">
              PAISAPULSE · AI CASHFLOW GUARDIAN
            </span>
            <h3 className="font-editorial text-4xl sm:text-6xl text-ink font-normal tracking-editorial">
              Know what is <br />
              <span className="font-editorial-italic text-coral">safe to spend.</span>
            </h3>
            <p className="font-sans text-sm sm:text-base text-ink-muted max-w-md mx-auto">
              Ready to replace balance anxiety with forward peace of mind?
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-coral text-ivory rounded-full text-sm font-sans font-semibold tracking-wide hover:bg-coral-hover transition-all shadow-md hover:scale-105 inline-flex items-center gap-2"
              >
                <span>Go to Your Live Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-coral text-ivory rounded-full text-sm font-sans font-semibold tracking-wide hover:bg-coral-hover transition-all shadow-md hover:scale-105 inline-flex items-center gap-2"
                >
                  <span>Activate Your Guardian (Free Alpha)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="px-7 py-4 bg-ivory text-ink border border-line-medium rounded-full text-sm font-sans font-medium hover:border-ink transition-all"
                >
                  <span>Sign In to Existing Vault</span>
                </Link>
              </>
            )}
          </div>

          {/* Uncompromising Trust Principle */}
          <div className="pt-6 border-t border-line-light max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-xs font-sans text-ink">
            <div className="flex items-center gap-2 text-coral font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>&ldquo;AI suggest karta hai. Decision tumhara.&rdquo;</span>
            </div>
            <span className="text-ink-subtle hidden sm:inline">·</span>
            <span className="text-ink-muted">Zero lock-in · 100% Transparency</span>
          </div>
        </div>
      </div>
    </section>
  );
}
