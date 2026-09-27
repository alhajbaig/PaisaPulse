"use client";

import { useState } from "react";
import { TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function FutureTimeline() {
  const [activeNode, setActiveNode] = useState<number>(2);

  const timelinePoints = [
    {
      day: "Today",
      date: "Current",
      amount: "₹8,400",
      change: "Base balance",
      type: "neutral",
      note: "Starting cash balance across bank & UPI.",
      balance: "₹8,400",
    },
    {
      day: "Day 3",
      date: "Oct 28",
      amount: "− ₹1,200",
      change: "Utility deduction",
      type: "outflow",
      note: "Airtel fiber & phone recharge automatically settled.",
      balance: "₹7,200",
    },
    {
      day: "Day 5",
      date: "Oct 30",
      amount: "− ₹5,000",
      change: "PG / Rent debit",
      type: "outflow",
      note: "Monthly rent auto-cleared. Emergency buffer holds firm.",
      balance: "₹2,200",
    },
    {
      day: "Day 10",
      date: "Nov 04",
      amount: "+ ₹8,000",
      change: "Stipend inflow",
      type: "inflow",
      note: "Confirmed monthly internship stipend credited.",
      balance: "₹10,200",
    },
    {
      day: "Day 14",
      date: "Nov 08",
      amount: "₹9,800",
      change: "Cruising safe",
      type: "neutral",
      note: "Healthy trajectory with all commitments cleared.",
      balance: "₹9,800",
    },
  ];

  return (
    <section className="relative py-28 sm:py-36 px-6 sm:px-10 bg-cream text-ink border-t border-line-medium transition-colors">
      <div className="max-w-6xl mx-auto text-center space-y-16">
        {/* Centered Section Marker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ivory border border-line-medium text-[11px] font-accent uppercase tracking-[0.2em] text-coral">
          <Calendar className="w-3.5 h-3.5" />
          <span>07 / Dynamic Horizon · Temporal Awareness</span>
        </div>

        {/* Centered Lead Headline */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-editorial text-ink">
            Sirf aaj mat dekho. <br />
            <span className="font-editorial-italic text-coral">Kal bhi dekho.</span>
          </h2>
          <p className="font-sans text-base sm:text-lg text-ink-muted leading-relaxed max-w-xl mx-auto">
            Money isn&apos;t a static snapshot in an account. It is a moving river with crests, drops, and replenishment waves.
          </p>
        </div>

        {/* Cashflow Wave Visual (Centered, Filled, High-Impact) */}
        <div className="max-w-5xl mx-auto p-8 sm:p-10 bg-ivory border-2 border-line-medium rounded-2xl shadow-sm text-left space-y-8">
          {/* Interactive Checkpoint Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {timelinePoints.map((point, index) => {
              const isSelected = activeNode === index;
              return (
                <button
                  key={point.day}
                  onClick={() => setActiveNode(index)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-coral bg-cream shadow-sm ring-1 ring-coral/30"
                      : "border-line-medium bg-ivory/60 hover:border-ink hover:bg-cream/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-accent uppercase text-ink-subtle">
                    <span>{point.day}</span>
                    <span>{point.date}</span>
                  </div>
                  <div
                    className={`font-sans font-bold text-base sm:text-lg num-tabular mt-1 ${
                      point.type === "inflow"
                        ? "text-emerald-700"
                        : point.type === "outflow"
                        ? "text-coral"
                        : "text-ink"
                    }`}
                  >
                    {point.amount}
                  </div>
                  <span className="text-[10px] font-sans text-ink-muted block truncate mt-0.5">
                    {point.change}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SVG Wave Graphic */}
          <div className="relative w-full h-44 sm:h-56 bg-cream/40 border border-line-medium rounded-xl p-4 overflow-hidden flex flex-col justify-end">
            <svg
              viewBox="0 0 1000 240"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="curveGradientFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6244" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#FFF2DB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Buffer Floor Line */}
              <line
                x1="0"
                y1="180"
                x2="1000"
                y2="180"
                stroke="#FF6244"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.5"
              />
              <text
                x="20"
                y="172"
                fill="#FF6244"
                fontSize="11"
                fontFamily="var(--font-space)"
                letterSpacing="1"
              >
                UNTOUCHABLE SAFETY FLOOR (₹3,000)
              </text>

              {/* Fluid Area Fill */}
              <path
                d="M 50 90 C 150 90, 180 120, 250 120 C 330 120, 380 195, 450 195 C 550 195, 650 40, 750 40 C 850 40, 900 55, 950 55 L 950 240 L 50 240 Z"
                fill="url(#curveGradientFill)"
              />
              {/* Stroke */}
              <path
                d="M 50 90 C 150 90, 180 120, 250 120 C 330 120, 380 195, 450 195 C 550 195, 650 40, 750 40 C 850 40, 900 55, 950 55"
                fill="none"
                stroke="#171512"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Checkpoint Dots */}
              {[
                { cx: 50, cy: 90 },
                { cx: 250, cy: 120 },
                { cx: 450, cy: 195 },
                { cx: 750, cy: 40 },
                { cx: 950, cy: 55 },
              ].map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.cx}
                  cy={pt.cy}
                  r={activeNode === i ? "7" : "5"}
                  fill={activeNode === i ? "#FF6244" : "#171512"}
                  stroke="#FFFAF3"
                  strokeWidth="2.5"
                  className="cursor-pointer transition-all"
                  onClick={() => setActiveNode(i)}
                />
              ))}
            </svg>
          </div>

          {/* Active Detail Bar */}
          <div className="p-4 sm:p-5 bg-cream/60 border border-line-medium rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-accent uppercase tracking-widest text-coral font-bold block">
                Selected Checkpoint · {timelinePoints[activeNode].day} ({timelinePoints[activeNode].date})
              </span>
              <p className="font-sans text-sm text-ink-muted">
                {timelinePoints[activeNode].note}
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] font-accent uppercase tracking-wider text-ink-subtle block">
                Projected Balance
              </span>
              <span className="font-sans text-xl sm:text-2xl font-bold num-tabular text-ink">
                {timelinePoints[activeNode].balance}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
