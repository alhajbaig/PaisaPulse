"use client";

import { useState } from "react";
import { AlertCircle, Clock, CheckCircle2, ShoppingBag, Sliders, ArrowRight, Sparkles } from "lucide-react";

interface ItemScenario {
  id: string;
  name: string;
  price: number;
  category: string;
  verdict: "Abhi nahi." | "Haan, safe hai." | "Slight stretch";
  verdictCoral: boolean;
  explanation: string;
  daysToSafe: number;
  bufferImpact: string;
}

export default function AffordSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const presets: ItemScenario[] = [
    {
      id: "headphones",
      name: "Wireless Headphones",
      price: 3500,
      category: "Tech & Audio",
      verdict: "Abhi nahi.",
      verdictCoral: true,
      explanation: "5 din baad stipend aayega. Tab ye purchase safer hai without breaching rent buffer.",
      daysToSafe: 5,
      bufferImpact: "Breaches buffer by ₹700",
    },
    {
      id: "dinner",
      name: "Weekend Cafe Outing",
      price: 1200,
      category: "Dining & Social",
      verdict: "Haan, safe hai.",
      verdictCoral: false,
      explanation: "Safe-to-Spend limit ke andar hai. Rent and bills unaffected.",
      daysToSafe: 0,
      bufferImpact: "Buffer intact 100%",
    },
    {
      id: "jacket",
      name: "Winter Jacket Sale",
      price: 4800,
      category: "Apparel",
      verdict: "Abhi nahi.",
      verdictCoral: true,
      explanation: "Rent cycle se pehle buffer dangerously close ho jayega (only ₹400 left). Wait for 10th.",
      daysToSafe: 7,
      bufferImpact: "Buffer squeezed to 12%",
    },
    {
      id: "concert",
      name: "Music Concert Pass",
      price: 2400,
      category: "Entertainment",
      verdict: "Slight stretch",
      verdictCoral: false,
      explanation: "Affordable if dining is trimmed by ₹100/day for the next 4 days.",
      daysToSafe: 2,
      bufferImpact: "Buffer holds at 85%",
    },
  ];

  const handleSelectPreset = (idx: number) => {
    if (idx === selectedScenario) return;
    setIsSimulating(true);
    setTimeout(() => {
      setSelectedScenario(idx);
      setIsSimulating(false);
    }, 220);
  };

  const currentItem = presets[selectedScenario];

  return (
    <section
      id="afford-simulator"
      className="relative py-28 sm:py-36 px-6 sm:px-10 bg-gradient-to-b from-peach/30 via-peach/50 to-cream text-ink border-t border-line-medium transition-colors"
    >
      <div className="max-w-5xl mx-auto text-center space-y-16">
        {/* Centered Marker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ivory border border-line-medium text-[11px] font-accent uppercase tracking-[0.2em] text-coral">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>06 / Pre-Checkout Simulator · Zero Regret Commerce</span>
        </div>

        {/* Lead Story */}
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="font-editorial italic text-2xl sm:text-3xl text-ink-muted">
            Shopping karne se pehle ek sawaal.
          </p>
          <h2 className="font-editorial text-4xl sm:text-7xl lg:text-8xl text-ink font-normal leading-[1] tracking-editorial">
            &ldquo;Can I afford this?&rdquo;
          </h2>
          <p className="font-sans text-base sm:text-lg text-ink-muted leading-relaxed max-w-xl mx-auto">
            Bank app simply says YES because ₹10,000 &gt; ₹3,500.
            <br />
            PaisaPulse simulates your upcoming 14 days and warns you before regret settles in.
          </p>
        </div>

        {/* Product Presets (Centered, attractive chips) */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
          {presets.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleSelectPreset(idx)}
              className={`px-5 py-2.5 text-xs font-sans rounded-full border transition-all duration-200 cursor-pointer ${
                selectedScenario === idx
                  ? "bg-ink text-ivory border-ink shadow-md scale-105"
                  : "bg-ivory text-ink-muted border-line-medium hover:border-ink hover:text-ink"
              }`}
            >
              {item.name} · <strong className="num-tabular">₹{item.price.toLocaleString("en-IN")}</strong>
            </button>
          ))}
        </div>

        {/* Interactive Simulation Board (Centered, Filled, High-Contrast) */}
        <div className="max-w-4xl mx-auto p-8 sm:p-12 bg-ivory border-2 border-line-medium rounded-2xl shadow-sm text-left grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative overflow-hidden">
          {/* Smooth Neural Scan Line during Simulation */}
          {isSimulating && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-coral via-[#FFA07A] to-coral animate-pulse z-20" />
          )}

          {/* Left: Cart Item Under Analysis */}
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-accent uppercase text-ink-subtle">
              <span>{currentItem.category}</span>
              <span className="text-coral font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-coral animate-ping" />
                Real-Time Audit
              </span>
            </div>

            <div>
              <h3 className="font-editorial text-3xl sm:text-4xl text-ink">
                {currentItem.name}
              </h3>
              <div className="font-sans text-4xl sm:text-5xl font-extrabold text-ink num-tabular mt-2">
                ₹{currentItem.price.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="p-4 bg-cream/50 rounded-xl space-y-2 text-xs font-sans text-ink-muted">
              <div className="flex justify-between">
                <span>Available Bank Balance:</span>
                <span className="font-semibold text-ink num-tabular">₹10,000</span>
              </div>
              <div className="flex justify-between">
                <span>Upcoming Rent (4 days):</span>
                <span className="font-semibold text-coral num-tabular">− ₹5,000</span>
              </div>
              <div className="flex justify-between">
                <span>Scheduled Bills (6 days):</span>
                <span className="font-semibold text-coral num-tabular">− ₹1,200</span>
              </div>
              <div className="flex justify-between border-t border-line-light pt-2 text-ink font-medium">
                <span>Projected Buffer Status:</span>
                <span className="font-bold text-coral">{currentItem.bufferImpact}</span>
              </div>
            </div>
          </div>

          {/* Right: The PaisaPulse Verdict */}
          <div className="space-y-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-line-medium pt-6 md:pt-0 md:pl-8">
            {isSimulating ? (
              <div className="space-y-4 py-8 animate-pulse">
                <div className="flex items-center gap-2 text-xs font-accent uppercase tracking-wider text-coral font-bold">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing 14-day cashflow radar...</span>
                </div>
                <div className="h-12 bg-coral/10 rounded-xl w-3/4 animate-pulse" />
                <div className="h-16 bg-cream rounded-xl w-full animate-pulse" />
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-accent uppercase tracking-wider text-ink-subtle">
                  <span>Forward Verdict</span>
                  <span className="inline-flex items-center gap-1 text-coral font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    Next 14 Days
                  </span>
                </div>

                <div
                  className={`font-editorial text-5xl sm:text-6xl font-normal leading-tight tracking-tight ${
                    currentItem.verdictCoral ? "text-coral" : "text-emerald-700"
                  }`}
                >
                  &ldquo;{currentItem.verdict}&rdquo;
                </div>

                <div className="p-4 bg-cream/70 border border-line-light rounded-xl text-xs sm:text-sm text-ink leading-relaxed">
                  {currentItem.explanation}
                </div>

                {currentItem.daysToSafe > 0 && (
                  <div className="flex items-center gap-2 text-xs font-sans text-ink-muted">
                    <AlertCircle className="w-4 h-4 text-coral shrink-0" />
                    <span>
                      Stipend arrives in <strong className="text-ink">{currentItem.daysToSafe} days</strong>. Buy then with 100% peace of mind.
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-line-light flex items-center justify-between text-xs font-accent text-ink-subtle">
              <span>Simulation Accuracy: 99.4%</span>
              <span className="text-coral font-bold">Deterministic Guidance</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
