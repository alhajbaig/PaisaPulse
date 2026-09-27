"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, LayoutDashboard, User } from "lucide-react";
import { getActiveUser, isUserLoggedIn } from "../engine/userStore.js";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(
          Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100))
        );
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Monitor Auth Session
  useEffect(() => {
    const checkAuth = () => {
      try {
        const loggedIn = isUserLoggedIn();
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
          const active = getActiveUser();
          setCurrentUser(active);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setIsLoggedIn(false);
        setCurrentUser(null);
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

  const navLinks = [
    { name: "How it works", href: "/#how-it-works" },
    { name: "Safe-to-Spend", href: "/#safe-to-spend" },
    { name: "Afford Check", href: "/#afford-simulator" },
    { name: "What-If", href: "/#what-if" },
    { name: "Philosophy", href: "/#philosophy" },
  ];

  const firstName = currentUser?.name ? currentUser.name.split(" ")[0] : "User";
  const avatarLetter = currentUser?.avatar || (currentUser?.name ? currentUser.name.charAt(0) : "U");

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          scrolled
            ? "py-3 bg-[#FFFAF3]/85 backdrop-blur-md border-b border-line-light shadow-[0_4px_24px_rgba(23,21,18,0.03)]"
            : "py-6 bg-transparent"
        }`}
      >
        {/* Dynamic Smooth Reading Progress Loader Bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-line-light/20">
          <div
            className="h-full bg-gradient-to-r from-coral via-[#FFA07A] to-coral transition-all duration-75 ease-out shadow-[0_0_8px_#FF6244]"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2 text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-coral"
          >
            <span className="font-accent text-xs tracking-[0.2em] uppercase font-bold text-ink">
              PAISAPULSE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-coral transition-transform group-hover:scale-125" />
            <span className="hidden sm:inline-block text-[11px] font-accent text-ink-muted uppercase tracking-wider pl-2 border-l border-line-medium">
              Cashflow Guardian
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-sans text-[13px] tracking-wide text-ink-muted hover:text-ink transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-coral after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Right CTA: Adaptive Authenticated State */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream border border-line-medium text-xs font-sans text-ink hover:border-line-dark transition-all shadow-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-coral text-white text-[10px] font-bold flex items-center justify-center">
                    {avatarLetter}
                  </div>
                  <span className="font-semibold text-ink">{firstName}</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 px-5 py-2 rounded-full bg-coral text-white text-xs font-sans font-semibold hover:bg-coral-dark transition-all shadow-subtle"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-sans font-medium text-ink-muted hover:text-coral transition-colors px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 px-5 py-2 rounded-full bg-ink text-ivory text-xs font-sans font-medium hover:bg-coral hover:text-ivory transition-all shadow-sm"
                >
                  <span>Activate Guardian</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-ink hover:text-coral transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#FFFAF3] p-8 flex flex-col justify-between md:hidden pt-24 animate-in fade-in duration-200">
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-editorial text-3xl text-ink hover:text-coral transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="space-y-4 pt-8 border-t border-line-medium">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-cream rounded-2xl border border-line-medium">
                  <div className="w-10 h-10 rounded-full bg-coral text-white font-bold flex items-center justify-center text-sm">
                    {avatarLetter}
                  </div>
                  <div>
                    <div className="font-bold text-ink text-sm">{currentUser?.name}</div>
                    <div className="text-xs text-ink-muted">{currentUser?.email}</div>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-coral text-white text-sm font-sans font-semibold shadow-subtle"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-ivory border border-line-medium text-ink text-sm font-sans font-medium"
                >
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-coral text-ivory text-sm font-sans font-medium shadow-sm"
                >
                  <span>Activate Guardian (Free)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
            <p className="text-[11px] font-accent text-ink-muted text-center tracking-wider uppercase">
              Bengaluru · Built for India
            </p>
          </div>
        </div>
      )}
    </>
  );
}
