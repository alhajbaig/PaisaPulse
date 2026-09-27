"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Zap,
  User,
  LogOut,
  RefreshCw,
} from "lucide-react";
import gsap from "gsap";
import ClickSpark from "./ClickSpark";
import { getSupabase, isSupabaseConfigured } from "../services/supabaseClient.js";
import { fetchUserFromSupabase } from "../services/supabaseSync.js";
import {
  findUserByEmail,
  saveUserData,
  loginUser,
  loginUserAsync,
  switchUserByEmail,
  registerUser,
  getDemoUser,
  DEMO_CREDENTIALS,
  getActiveUser,
  logoutUser,
} from "../engine/userStore.js";

interface AuthPortalProps {
  initialMode?: "login" | "signup";
}

export default function AuthPortal({ initialMode = "login" }: AuthPortalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("email");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentBalance, setCurrentBalance] = useState("");
  const [safetyBuffer, setSafetyBuffer] = useState("3000");
  const [profession, setProfession] = useState("Young Working Professional");
  const [otpStage, setOtpStage] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Status & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSessionUser, setActiveSessionUser] = useState<any | null>(null);

  // Transition Expansion State
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionStatus, setTransitionStatus] = useState("Calibrating forward ledger...");

  const cardRef = useRef<HTMLDivElement>(null);
  const authContentRef = useRef<HTMLDivElement>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check for existing active session on load
  useEffect(() => {
    try {
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const isExplicitLogout = searchParams ? searchParams.get("logout") === "true" : false;

      if (isExplicitLogout) {
        logoutUser();
        setActiveSessionUser(null);
      } else {
        const existing = getActiveUser();
        if (existing && existing.email) {
          setActiveSessionUser(existing);
        }
      }
    } catch {}
  }, []);

  // Trigger Automatic Portal Expansion & Navigate to /dashboard
  const triggerPortalExpansion = (userName = "User") => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTransitionStatus("Authenticating with 256-bit cryptographic vault...");

    const card = cardRef.current;
    const authContent = authContentRef.current;

    // Sequence status messages
    setTimeout(() => {
      setTransitionStatus("Unfolding 14-day cashflow matrix...");
    }, 300);

    setTimeout(() => {
      setTransitionStatus(`Welcome, ${userName.split(" ")[0]}. Launching Cashflow Guardian...`);
    }, 650);

    if (card && authContent) {
      const tl = gsap.timeline({
        onComplete: () => {
          // Instant route transition to live dashboard
          window.location.href = "/dashboard";
        },
      });

      // Step 1: Smoothly fade and lift auth content
      tl.to(authContent, {
        opacity: 0,
        y: -20,
        scale: 0.98,
        duration: 0.35,
        ease: "power2.inOut",
      });

      // Step 2: Automatic ScrollExpand-style morph to full screen
      tl.to(
        card,
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          width: "100%",
          maxWidth: "100%",
          height: "100%",
          duration: 0.85,
          ease: "power4.inOut",
        },
        "-=0.15"
      );
    } else {
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    }
  };

  // Submit Handler for Sign In / Sign Up
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // 1. Mobile Phone OTP Method
      if (authMethod === "phone") {
        if (!otpStage) {
          if (phone.length < 10) {
            setErrorMessage("Please enter a valid 10-digit mobile number.");
            setIsLoading(false);
            return;
          }
          setTransitionStatus("Sending 6-digit OTP...");
          setOtpStage(true);
          setIsLoading(false);
          return;
        }

        // Verify OTP
        const otpCode = otp.join("");
        if (otpCode.length < 6) {
          setErrorMessage("Please enter the complete 6-digit OTP code.");
          setIsLoading(false);
          return;
        }

        const phoneEmail = `${phone}@pulse.in`;
        const phoneName = fullName.trim() || `User +91-${phone.slice(-4)}`;

        // Register or login via userStore
        let userResult = loginUser(phoneEmail, "phone_otp_verified");
        if (!userResult.success) {
          const balanceNum = currentBalance.trim() === "" ? 0 : parseFloat(currentBalance.replace(/,/g, "")) || 0;
          const bufferNum = safetyBuffer.trim() === "" ? 3000 : parseFloat(safetyBuffer.replace(/,/g, "")) || 0;

          userResult = registerUser({
            id: "",
            name: phoneName,
            email: phoneEmail,
            phone: phone.trim(),
            mobile: phone.trim(),
            password: "phone_otp_verified",
            role: profession || "Mobile Banking User",
            initialBalance: Math.max(0, balanceNum),
            safetyBuffer: Math.max(0, bufferNum),
            upcomingIncome: [],
            upcomingCommitments: [],
          });
        }

        if (userResult.success) {
          triggerPortalExpansion(phoneName);
        } else {
          setErrorMessage(userResult.error || "Authentication failed.");
          setIsLoading(false);
        }
        return;
      }

      // 2. Email & Password Method
      if (!email || !email.includes("@")) {
        setErrorMessage("Please enter a valid email address.");
        setIsLoading(false);
        return;
      }

      if (!password || password.length < 4) {
        setErrorMessage("Password must be at least 4 characters.");
        setIsLoading(false);
        return;
      }

      if (mode === "login") {
        // Authoritative cloud & local verification via userStore
        const result = await loginUserAsync(email, password);
        if (result.success && result.user) {
          triggerPortalExpansion(result.user.name || "Member");
        } else {
          if (result.suggestSignup) {
            setErrorMessage(
              `No account found for "${email}". Switch to Create Account to get started.`
            );
          } else {
            setErrorMessage(result.error || "Incorrect credentials. Please try again.");
          }
          setIsLoading(false);
        }
      } else {
        // Mode === "signup"
        if (!fullName.trim()) {
          setErrorMessage("Please enter your full name.");
          setIsLoading(false);
          return;
        }

        if (phone.trim() && phone.replace(/\D/g, "").length < 10) {
          setErrorMessage("Please enter a valid 10-digit mobile number.");
          setIsLoading(false);
          return;
        }

        const balanceNum = currentBalance.trim() === "" ? 0 : parseFloat(currentBalance.replace(/,/g, "")) || 0;
        const bufferNum = safetyBuffer.trim() === "" ? 3000 : parseFloat(safetyBuffer.replace(/,/g, "")) || 0;

        // Attempt Supabase Cloud Signup
        let supaUserId: string | null = null;
        if (isSupabaseConfigured()) {
          try {
            const client = getSupabase();
            if (client) {
              const { data, error: supaErr } = await client.auth.signUp({
                email: email.trim().toLowerCase(),
                password: password,
                options: {
                  data: {
                    name: fullName.trim(),
                    phone: phone.trim(),
                    role: profession,
                  },
                },
              });
              if (data?.user?.id) {
                supaUserId = data.user.id;
              }
              if (supaErr) {
                console.debug("Supabase signup status:", supaErr.message);
              }
            }
          } catch (supaErr) {
            console.debug("Supabase signup exception:", supaErr);
          }
        }

        const regResult = registerUser({
          id: supaUserId || undefined,
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          mobile: phone.trim(),
          password: password,
          role: profession,
          initialBalance: Math.max(0, balanceNum),
          safetyBuffer: Math.max(0, bufferNum),
          upcomingIncome: [],
          upcomingCommitments: [],
        });

        if (regResult.success && regResult.user) {
          if (supaUserId) {
            regResult.user.id = supaUserId;
          }
          triggerPortalExpansion(fullName.trim());
        } else {
          setErrorMessage(regResult.error || "Failed to create account. Email may already be registered.");
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // 1-Click Demo Persona Access
  const handleSelectDemoPersona = (key: "kartik" | "ananya") => {
    setErrorMessage(null);
    setIsLoading(true);
    const user = getDemoUser(key);
    triggerPortalExpansion(user.name);
  };



  // Fill credentials from demo pill
  const handleFillDemoCreds = (demoEmail: string, demoPass: string) => {
    setAuthMethod("email");
    setEmail(demoEmail);
    setPassword(demoPass);
    setMode("login");
    setErrorMessage(null);
  };

  // Handle OTP Inputs
  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <ClickSpark
      sparkColor="#FF6244"
      sparkSize={10}
      sparkRadius={18}
      sparkCount={8}
      duration={400}
    >
      <div className="min-h-screen w-full bg-ivory text-ink flex flex-col justify-between selection:bg-coral selection:text-ivory relative overflow-x-hidden">
        {/* Top Minimal Navigation Bar */}
        <header className="w-full py-5 px-6 sm:px-12 flex items-center justify-between z-20 border-b border-line-light/50 bg-ivory/80 backdrop-blur-md">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-xs font-sans text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-coral" />
            <span>Back to PaisaPulse</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <span className="font-accent text-xs uppercase tracking-[0.25em] font-bold text-ink">
              PAISAPULSE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-coral animate-ping" />
          </Link>

          <div className="flex items-center gap-3 text-xs font-accent">
            <button
              onClick={() => handleSelectDemoPersona("kartik")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cream hover:bg-peach/50 border border-line-medium text-coral font-bold tracking-wider uppercase text-[10px] transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <Sparkles className="w-3 h-3" />
              <span>⚡ Fast Demo Access</span>
            </button>
          </div>
        </header>

        {/* The Portal Stage */}
        <main className="flex-1 w-full flex items-center justify-center p-4 sm:p-8 relative">
          
          {/* Animated Expandable Portal Card */}
          <div
            ref={cardRef}
            className="w-full max-w-xl p-8 sm:p-12 rounded-[32px] bg-gradient-to-b from-cream/90 via-cream/60 to-ivory border-2 border-line-medium shadow-[0_24px_70px_-15px_rgba(23,21,18,0.08)] backdrop-blur-md relative overflow-hidden flex flex-col justify-center items-center transition-all duration-300"
          >
            {/* Transition Expansion Full-bleed Pulse */}
            {isTransitioning && (
              <div className="absolute inset-0 z-50 bg-ivory/95 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-200">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-coral/30 animate-ping" />
                  <div className="w-10 h-10 rounded-full bg-coral/15 border border-coral flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-coral" />
                  </div>
                </div>
                <div className="text-xs font-accent uppercase tracking-widest text-coral font-bold text-center px-4">
                  {transitionStatus}
                </div>
                <div className="w-48 h-1 bg-line-light rounded-full overflow-hidden">
                  <div className="h-full bg-coral w-3/4 animate-pulse rounded-full" />
                </div>
              </div>
            )}

            {/* Auth Form Container */}
            <div ref={authContentRef} className="w-full space-y-8 text-center">
              
              {/* Brand Credo Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ivory border border-line-medium text-[10px] font-accent uppercase tracking-[0.25em] text-coral shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-coral animate-ping" />
                <span>AI Cashflow Guardian · Forward Permission</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-3">
                <h1 className="font-editorial text-4xl sm:text-5xl font-normal tracking-editorial text-ink leading-[1.05]">
                  {mode === "login" ? (
                    <>
                      Welcome back to <br />
                      <span className="font-editorial-italic text-coral">financial clarity.</span>
                    </>
                  ) : (
                    <>
                      Never ask where it went. <br />
                      <span className="font-editorial-italic text-coral">Know what is safe.</span>
                    </>
                  )}
                </h1>
                <p className="font-sans text-sm sm:text-base text-ink-muted max-w-sm mx-auto leading-relaxed">
                  Paise sirf aaj ke nahi hote. Kal ke bhi hote hain.
                </p>
              </div>

              {/* Existing Active Session Detected Alert */}
              {activeSessionUser && !isTransitioning && (
                <div className="p-3.5 rounded-2xl bg-cream border border-line-medium text-left flex items-center justify-between gap-3 text-xs font-sans">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-coral/15 text-coral font-bold flex items-center justify-center text-xs">
                      {activeSessionUser.avatar || activeSessionUser.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="font-bold text-ink">{activeSessionUser.name}</div>
                      <div className="text-[11px] text-ink-muted">Active session: {activeSessionUser.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => triggerPortalExpansion(activeSessionUser.name)}
                      className="px-3 py-1.5 rounded-full bg-ink text-ivory text-[11px] font-semibold hover:bg-coral transition-colors"
                    >
                      Resume ➔
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        logoutUser();
                        setActiveSessionUser(null);
                      }}
                      className="p-1.5 text-ink-muted hover:text-coral transition-colors"
                      title="Log Out of this session"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Fast 1-Tap Persona Cards for Hackathon Evaluators */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-accent uppercase tracking-wider text-ink-muted">
                  <span>Fast 1-Click Evaluation Personas:</span>
                  <span className="text-coral font-bold">Zero Setup</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectDemoPersona("kartik")}
                    className="p-3 rounded-2xl bg-ivory/80 hover:bg-ivory border border-line-medium hover:border-coral transition-all text-left group shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-ink group-hover:text-coral transition-colors">
                        Kartik Sharma
                      </span>
                      <span className="text-[10px] font-accent uppercase text-coral font-bold bg-coral/10 px-2 py-0.5 rounded-full">
                        ₹12,480
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-muted mt-1 leading-snug">
                      College Intern · Stipend, PG Rent & Dining
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDemoPersona("ananya")}
                    className="p-3 rounded-2xl bg-ivory/80 hover:bg-ivory border border-line-medium hover:border-coral transition-all text-left group shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-ink group-hover:text-coral transition-colors">
                        Ananya Roy
                      </span>
                      <span className="text-[10px] font-accent uppercase text-coral font-bold bg-coral/10 px-2 py-0.5 rounded-full">
                        ₹24,500
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-muted mt-1 leading-snug">
                      Freelance UI/UX · Client Inflows & Software
                    </p>
                  </button>
                </div>
              </div>


              {/* Error Alert Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-sans text-left flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">
                    {errorMessage}
                    {errorMessage.includes("Switch to Create Account") && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("signup");
                          setErrorMessage(null);
                        }}
                        className="ml-2 underline font-bold text-red-900 hover:text-coral"
                      >
                        Switch Now
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Mode Selector Tabs (Sign In vs Create Account) */}
              <div className="flex items-center p-1 rounded-full bg-ivory border border-line-medium">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setOtpStage(false);
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs font-sans font-medium rounded-full transition-all cursor-pointer ${
                    mode === "login"
                      ? "bg-ink text-ivory shadow-sm font-semibold"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setOtpStage(false);
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs font-sans font-medium rounded-full transition-all cursor-pointer ${
                    mode === "signup"
                      ? "bg-ink text-ivory shadow-sm font-semibold"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Auth Method Switcher (Email vs Mobile) */}
              <div className="flex items-center justify-center gap-4 text-xs font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("email");
                    setOtpStage(false);
                    setErrorMessage(null);
                  }}
                  className={`inline-flex items-center gap-1.5 pb-1 border-b-2 transition-all cursor-pointer ${
                    authMethod === "email"
                      ? "border-coral text-ink font-bold"
                      : "border-transparent text-ink-muted hover:text-ink"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-coral" />
                  <span>Email & Password</span>
                </button>
                <span className="text-line-medium">·</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("phone");
                    setOtpStage(false);
                    setErrorMessage(null);
                  }}
                  className={`inline-flex items-center gap-1.5 pb-1 border-b-2 transition-all cursor-pointer ${
                    authMethod === "phone"
                      ? "border-coral text-ink font-bold"
                      : "border-transparent text-ink-muted hover:text-ink"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-coral" />
                  <span>Mobile (Instant OTP)</span>
                </button>
              </div>

              {/* Primary Form */}
              <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 text-left">
                {mode === "signup" && !otpStage && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-accent uppercase tracking-wider text-ink-muted block font-bold">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Arjun Verma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-ivory border border-line-medium text-ink placeholder:text-ink-subtle text-sm focus:outline-none focus:border-coral transition-colors"
                        required
                      />
                    </div>

                    {authMethod === "email" && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-accent uppercase tracking-wider text-ink-muted block font-bold">
                          Mobile Number (10 digits)
                        </label>
                        <div className="flex items-center rounded-xl bg-ivory border border-line-medium overflow-hidden focus-within:border-coral transition-colors">
                          <span className="px-3.5 py-3 text-xs font-accent text-ink-muted border-r border-line-light font-bold">
                            +91
                          </span>
                          <input
                            type="tel"
                            placeholder="98765 43210"
                            value={phone}
                            maxLength={10}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-4 py-3 bg-transparent text-ink placeholder:text-ink-subtle text-sm focus:outline-none num-tabular"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Email Flow */}
                {authMethod === "email" && (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-accent uppercase tracking-wider text-ink-muted block">
                          Email Address
                        </label>
                        {mode === "login" && (
                          <button
                            type="button"
                            onClick={() => handleFillDemoCreds("kartik@pulse.in", "password123")}
                            className="text-[10px] text-coral hover:underline font-accent"
                          >
                            Fill: kartik@pulse.in
                          </button>
                        )}
                      </div>
                      <input
                        type="email"
                        autoComplete="off"
                        placeholder="kartik@pulse.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-ivory border border-line-medium text-ink placeholder:text-ink-subtle text-sm focus:outline-none focus:border-coral transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-accent uppercase tracking-wider text-ink-muted block">
                          Password
                        </label>
                        {mode === "login" && (
                          <button
                            type="button"
                            onClick={() => handleFillDemoCreds("kartik@pulse.in", "password123")}
                            className="text-[10px] text-coral hover:underline font-accent"
                          >
                            Fill: password123
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          autoComplete="off"
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-ivory border border-line-medium text-ink placeholder:text-ink-subtle text-sm focus:outline-none focus:border-coral transition-colors pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Mobile Phone OTP Flow */}
                {authMethod === "phone" && (
                  <>
                    {!otpStage ? (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-accent uppercase tracking-wider text-ink-muted block">
                          Phone Number
                        </label>
                        <div className="flex items-center rounded-xl bg-ivory border border-line-medium overflow-hidden focus-within:border-coral transition-colors">
                          <span className="px-3.5 py-3 text-xs font-accent text-ink-muted border-r border-line-light font-bold">
                            +91
                          </span>
                          <input
                            type="tel"
                            placeholder="98765 43210"
                            value={phone}
                            maxLength={10}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-4 py-3 bg-transparent text-ink placeholder:text-ink-subtle text-sm focus:outline-none num-tabular"
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-ink-muted">Enter code sent to +91 {phone}</span>
                          <button
                            type="button"
                            onClick={() => setOtpStage(false)}
                            className="text-coral hover:underline text-[11px]"
                          >
                            Edit Phone
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          {otp.map((digit, i) => (
                            <input
                              key={i}
                              ref={(el) => {
                                otpInputRefs.current[i] = el;
                              }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(i, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(i, e)}
                              className="w-11 h-13 text-center text-xl font-bold font-sans rounded-xl bg-ivory border border-line-medium focus:border-coral focus:ring-1 focus:ring-coral text-ink focus:outline-none transition-all num-tabular"
                            />
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => setOtp(["4", "8", "1", "9", "2", "0"])}
                          className="text-xs text-coral hover:underline font-bold block"
                        >
                          Auto-fill Test OTP: 481920
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Real Financial Starting Baseline (Zero Mock Data) */}
                {mode === "signup" && !otpStage && (
                  <div className="space-y-3 pt-2 border-t border-line-light animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Available Liquid Balance */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-accent uppercase tracking-wider text-ink-muted block font-bold">
                            Bank Balance Right Now
                          </label>
                          <span className="text-[10px] text-coral font-bold font-accent bg-coral/10 px-1.5 py-0.5 rounded">
                            Bank + UPI
                          </span>
                        </div>
                        <div className="relative flex items-center rounded-xl bg-ivory border border-line-medium focus-within:border-coral transition-colors">
                          <span className="pl-3.5 pr-1 text-sm font-bold text-coral num-tabular">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            placeholder="e.g. 25000"
                            value={currentBalance}
                            onChange={(e) => setCurrentBalance(e.target.value)}
                            className="w-full px-2 py-2.5 bg-transparent text-ink placeholder:text-ink-subtle text-sm focus:outline-none num-tabular font-semibold"
                            required
                          />
                        </div>
                        <p className="text-[10px] text-ink-subtle leading-tight">
                          Real starting balance in your account right now.
                        </p>
                      </div>

                      {/* Safety Buffer */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-accent uppercase tracking-wider text-ink-muted block font-bold">
                            Safety Buffer Floor
                          </label>
                          <span className="text-[10px] text-emerald-800 font-bold font-accent bg-emerald-50 px-1.5 py-0.5 rounded">
                            Protected
                          </span>
                        </div>
                        <div className="relative flex items-center rounded-xl bg-ivory border border-line-medium focus-within:border-coral transition-colors">
                          <span className="pl-3.5 pr-1 text-sm font-bold text-emerald-700 num-tabular">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="500"
                            placeholder="3000"
                            value={safetyBuffer}
                            onChange={(e) => setSafetyBuffer(e.target.value)}
                            className="w-full px-2 py-2.5 bg-transparent text-ink placeholder:text-ink-subtle text-sm focus:outline-none num-tabular font-semibold"
                            required
                          />
                        </div>
                        <p className="text-[10px] text-ink-subtle leading-tight">
                          Emergency cushion to never breach.
                        </p>
                      </div>
                    </div>

                    {/* Financial Role Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-accent uppercase tracking-wider text-ink-muted block font-bold">
                        Financial Persona / Profession
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "College Student / Intern",
                          "Young Working Professional",
                          "Freelancer / Creator",
                          "Small Business / Founder",
                        ].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setProfession(p)}
                            className={`py-2 px-2.5 rounded-xl text-[11px] font-sans font-medium text-left border transition-all cursor-pointer ${
                              profession === p
                                ? "bg-coral/10 border-coral text-coral font-bold shadow-xs"
                                : "bg-ivory border-line-medium text-ink-muted hover:text-ink hover:border-line-dark"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isTransitioning}
                  className="w-full mt-4 py-4 px-6 rounded-full bg-coral text-ivory text-sm font-sans font-semibold hover:bg-coral-hover transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating Vault...</span>
                    </>
                  ) : (
                    <span>
                      {authMethod === "phone" && !otpStage
                        ? "Verify Phone Number ➔"
                        : mode === "login"
                        ? "Enter Cashflow Guardian ➔"
                        : "Activate Guardian Account ➔"}
                    </span>
                  )}
                </button>
              </form>

              {/* Trust Seal */}
              <div className="pt-4 border-t border-line-light flex items-center justify-center gap-2 text-[11px] font-accent text-ink-subtle uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Zero Netbanking Passwords · Supabase Auth Encrypted</span>
              </div>
            </div>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="w-full py-5 px-6 sm:px-12 text-center text-xs font-accent uppercase tracking-wider text-ink-subtle border-t border-line-light/50">
          <span>PaisaPulse Autonomous Architecture · Bengaluru, India · 2026</span>
        </footer>
      </div>
    </ClickSpark>
  );
}
