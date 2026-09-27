import React from 'react';
import { 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight, 
  TrendingDown, 
  Sliders, 
  Zap,
  HelpCircle,
  Coffee,
  Dumbbell,
  CheckCircle2
} from 'lucide-react';
import { formatINR } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { useLanguage } from '../services/i18n.jsx';

export default function SpendValueCard({ 
  spendValueModel, 
  onOpenFullMap,
  className = ''
}) {
  const { language } = useLanguage();
  if (!spendValueModel) return null;

  const { rankedByValue = [], rankedByCost = [], insights = {}, quadrants = {} } = spendValueModel;
  const topCost = rankedByCost.slice(0, 3);
  const topValue = rankedByValue.slice(0, 3);

  const dontCut = insights?.dontCutItem;
  const cutTarget = insights?.cutItem;

  return (
    <div className={`p-6 rounded-[28px] bg-gradient-to-b from-cream/90 via-cream/50 to-ivory border-2 border-line-medium shadow-sm hover:shadow-md transition-all relative overflow-hidden ${className}`}>
      {/* Decorative subtle ambient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-coral/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-ivory border border-line-medium text-[10px] font-accent uppercase tracking-wider text-coral font-bold mb-1.5 shadow-xs">
            <Heart className="w-3 h-3 fill-coral text-coral" />
            <span>{language === 'hinglish' ? 'Spend Value Intelligence' : 'Spend Value Intelligence'}</span>
          </div>
          <h3 className="font-editorial text-2xl text-ink leading-tight">
            {language === 'hinglish' ? 'Aapka Paisa Kahan Zaroori Hai' : 'Where Your Money Matters'}
          </h3>
          <p className="font-sans text-xs text-ink-muted mt-0.5">
            {language === 'hinglish' ? 'Kharcha ≠ Khushi · Har kharcha barabar nahi hota.' : 'Money Cost ≠ Personal Value · Not all spending is equal.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            if (onOpenFullMap) onOpenFullMap();
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-ink text-ivory hover:bg-coral text-xs font-sans font-semibold transition-all shadow-xs cursor-pointer hover:scale-102 shrink-0"
        >
          <span>{language === 'hinglish' ? 'Value Map (4 Quadrants)' : 'Value Map'}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* The Core Insight Contrast Pill */}
      {insights?.perspectiveInsight && (
        <div className="p-3.5 rounded-2xl bg-ivory/95 border border-line-medium mb-5 shadow-xs relative z-10 text-xs font-sans text-ink leading-relaxed">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-coral shrink-0 mt-0.5" />
            <p className="text-[12px] text-ink-muted">
              <strong className="text-ink font-semibold">
                {language === 'hinglish' ? 'Asal Farak: ' : 'The Differentiator: '}
              </strong>
              {insights.perspectiveInsight}
            </p>
          </div>
        </div>
      )}

      {/* Side-by-Side Dual Perspectives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 relative z-10">
        {/* Left: Where Your Money Goes (Monetary Cost) */}
        <div className="p-4 rounded-2xl bg-ivory/80 border border-line-light space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-accent uppercase tracking-wider text-ink-muted font-bold pb-1 border-b border-line-light/60">
            <span>{language === 'hinglish' ? 'Paisa Kahan Jata Hai' : 'Where Money Goes'}</span>
            <span className="text-[10px] font-normal lowercase">{language === 'hinglish' ? 'kul ₹ / mahina' : 'by ₹ / mo'}</span>
          </div>
          <div className="space-y-2">
            {topCost.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                  <span>{item.emoji}</span>
                  <span className="font-medium text-ink truncate">{item.name}</span>
                </div>
                <div className="font-bold text-ink num-tabular text-right">
                  {formatINR(item.monthlyCost)}
                  <span className="text-[10px] text-ink-subtle font-normal">{language === 'hinglish' ? '/mahina' : '/mo'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: What Money Means (Personal Value Score) */}
        <div className="p-4 rounded-2xl bg-ivory/80 border border-line-light space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-accent uppercase tracking-wider text-coral font-bold pb-1 border-b border-line-light/60">
            <span>{language === 'hinglish' ? 'Aapke Liye Kya Mayne Hai' : 'What It Means To You'}</span>
            <span className="text-[10px] font-normal lowercase">{language === 'hinglish' ? 'value score' : 'value score'}</span>
          </div>
          <div className="space-y-2">
            {topValue.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                  <span>{item.emoji}</span>
                  <span className="font-medium text-ink truncate">{item.name}</span>
                </div>
                <div className="inline-flex items-center gap-1">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full num-tabular">
                    {item.personalValueScore} / 100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Companion Guidance Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
        {/* Don't Cut This */}
        {dontCut && (
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-accent uppercase tracking-wider text-emerald-900 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{language === 'hinglish' ? `Isko Mat Roko: ${dontCut.name}` : `Don't Cut This: ${dontCut.name}`}</span>
            </div>
            <p className="text-[11px] font-sans text-emerald-950 leading-snug">
              {language === 'hinglish' 
                ? `Karcha ~${formatINR(dontCut.monthlyCost)}/mahina hai, par aapko asli khushi milti hai (${dontCut.personalValueScore}/100). Isse budget cuts se bacha ke rakhein.`
                : `Costs ~${formatINR(dontCut.monthlyCost)}/mo, but consistent personal value (${dontCut.personalValueScore}/100). Protected from budget cuts.`}
            </p>
          </div>
        )}

        {/* Smart Cut Target */}
        {cutTarget && (() => {
          const targetSavings = Math.min(
            cutTarget.monthlyCost,
            cutTarget.suggestedAction?.savings || Math.round(cutTarget.monthlyCost * 0.25)
          ) || Math.round(cutTarget.monthlyCost * 0.25) || 50;

          return (
            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-accent uppercase tracking-wider text-rose-900 font-bold">
                <TrendingDown className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{language === 'hinglish' ? `Yahan Bachao: ${cutTarget.name}` : `Review: ${cutTarget.name}`}</span>
              </div>
              <p className="text-[11px] font-sans text-rose-950 leading-snug">
                {language === 'hinglish'
                  ? `Har mahine ~${formatINR(cutTarget.monthlyCost)} jaata hai bina kisi khaas faayde ke. 25% kam karke aasaani se ~${formatINR(targetSavings)}/mahina bacha sakte ho.`
                  : `Takes ~${formatINR(cutTarget.monthlyCost)}/mo with lower value return. Trim 25% to free up ~${formatINR(targetSavings)}/mo safely.`}
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
