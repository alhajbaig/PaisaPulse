"use client";

import { Check, X, Minus } from "lucide-react";

export default function ComparisonMatrix() {
  const comparisonRows = [
    {
      capability: "Core Question Answered",
      bankApp: "Where is my money today?",
      budgetApp: "Where did my money go?",
      paisaPulse: "Ab kitna spend karna actually safe hai?",
      highlight: true,
    },
    {
      capability: "Temporal Perspective",
      bankApp: "Static ledger snapshot (0 days)",
      budgetApp: "Backward historical autopsy",
      paisaPulse: "Forward predictive radar (14–30 days)",
      highlight: true,
    },
    {
      capability: "Upcoming Rent & Obligation Lock",
      bankApp: "Ignored (Shows full balance)",
      budgetApp: "Manual category envelope",
      paisaPulse: "Autonomous pre-emptive ring-fencing",
      highlight: false,
    },
    {
      capability: "Pending Freelance / Uncertain Income",
      bankApp: "Not recognized",
      budgetApp: "Manually entered as confirmed",
      paisaPulse: "Quarantined until funds physically arrive",
      highlight: false,
    },
    {
      capability: "Pre-Purchase 'Can I Afford This?' Check",
      bankApp: "No",
      budgetApp: "No",
      paisaPulse: "Yes, instant forward simulation & timing",
      highlight: true,
    },
    {
      capability: "Shortfall Handling",
      bankApp: "Bounces check / overdraft penalty",
      budgetApp: "Red angry progress bar",
      paisaPulse: "4 actionable friendly micro-adjustments 6 days early",
      highlight: true,
    },
    {
      capability: "Emotional Impact",
      bankApp: "False sense of wealth",
      budgetApp: "Post-purchase guilt & anxiety",
      paisaPulse: "Calm confidence & forward agency",
      highlight: true,
    },
  ];

  return (
    <section className="relative py-28 sm:py-36 px-6 sm:px-10 bg-ivory text-ink border-t border-line-medium">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Centered Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-block text-[11px] font-accent uppercase tracking-[0.25em] text-coral font-bold px-3 py-1 bg-cream rounded-full border border-line-medium">
            Systematic Comparison
          </span>

          <h2 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-editorial text-ink">
            A radical shift in <br />
            <span className="font-editorial-italic text-coral">financial psychology.</span>
          </h2>

          <p className="font-sans text-base sm:text-lg text-ink-muted leading-relaxed">
            See how PaisaPulse compares against traditional banking apps and outdated expense loggers.
          </p>
        </div>

        {/* Matrix Table (Clean, Centered, Filled, Beautiful) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b-2 border-line-medium text-xs font-accent uppercase tracking-wider text-ink-subtle">
                <th className="py-4 px-4 w-1/4">Financial Capability</th>
                <th className="py-4 px-4 w-1/4">Traditional Bank App</th>
                <th className="py-4 px-4 w-1/4">Old Expense Tracker</th>
                <th className="py-4 px-4 w-1/4 bg-coral/10 text-coral font-bold rounded-t-lg">
                  PaisaPulse Guardian
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-light text-xs sm:text-sm font-sans">
              {comparisonRows.map((row, idx) => (
                <tr
                  key={row.capability}
                  className={`transition-colors hover:bg-cream/30 ${
                    row.highlight ? "font-medium" : ""
                  }`}
                >
                  <td className="py-4 px-4 font-semibold text-ink">
                    {row.capability}
                  </td>
                  <td className="py-4 px-4 text-ink-muted">
                    {row.bankApp}
                  </td>
                  <td className="py-4 px-4 text-ink-muted">
                    {row.budgetApp}
                  </td>
                  <td className="py-4 px-4 bg-coral/5 text-ink font-semibold border-l border-r border-coral/20">
                    <span className="text-coral flex items-start gap-1.5">
                      <Check className="w-4 h-4 text-coral shrink-0 mt-0.5" />
                      <span>{row.paisaPulse}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Takeaway */}
        <div className="p-6 bg-cream/50 border border-line-medium rounded-xl text-center max-w-2xl mx-auto">
          <p className="font-editorial text-xl sm:text-2xl text-ink">
            &ldquo;Traditional tools look at what has already been lost. <br />
            PaisaPulse guards what is yet to come.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
