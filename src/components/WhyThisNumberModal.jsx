import React from 'react';
import { 
  X, 
  HelpCircle, 
  ShieldCheck, 
  Calendar, 
  ArrowRight, 
  CheckCircle2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { formatINR } from '../engine/cashflowEngine';
import { soundFX } from '../engine/audioEffects';
import { useLanguage } from '../services/i18n.jsx';

export default function WhyThisNumberModal({
  isOpen,
  onClose,
  safeToSpendResult
}) {
  const { t, language } = useLanguage();
  if (!isOpen || !safeToSpendResult) return null;

  const breakdown = safeToSpendResult.whyBreakdown || {};
  const currentCash = breakdown.currentCash || safeToSpendResult.effectiveCurrentBalance || 0;
  const commitments = breakdown.upcomingCommitments || safeToSpendResult.commitmentsBeforeIncome || 0;
  const safetyBuffer = breakdown.safetyBuffer || safeToSpendResult.safetyBuffer || 3000;
  const protectedMoney = breakdown.protectedMoney || (commitments + safetyBuffer);
  const spendableLiquidity = breakdown.spendableLiquidity || (currentCash - protectedMoney);
  const daysToNext = breakdown.daysToNextIncome || safeToSpendResult.nextIncomeDays || 7;
  const dailyRecommended = safeToSpendResult.safeToSpendToday || 0;
  const committedItems = safeToSpendResult.committedItems || [];
  const reliableIncome = safeToSpendResult.reliableIncome || 0;
  const potentialIncome = safeToSpendResult.potentialIncome || 0;

  return (
    <div className="fixed inset-0 bg-[#171512]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-ivory border border-line-medium rounded-2xl w-full max-w-lg max-h-[90vh] shadow-lifted flex flex-col overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-6 border-b border-line-medium flex items-start justify-between bg-ivory">
          <div className="space-y-1">
            <span className="text-[11px] font-accent uppercase tracking-widest text-coral font-bold block">
              Formula · Single Source of Truth
            </span>
            <h3 className="font-editorial text-2xl text-ink font-normal">
              {t('modal_why_title', 'How We Calculated This Number')}
            </h3>
            <p className="font-sans text-xs text-ink-muted">
              {t('modal_why_sub', '100% transparent, mathematical single source of truth')}
            </p>
          </div>
          <button 
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full border border-line-medium hover:border-line-dark flex items-center justify-center text-ink-muted hover:text-ink transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Result Card */}
          <div className="bg-cream/60 border border-line-medium rounded-xl p-5 text-center space-y-2">
            <span className="text-[11px] font-accent font-semibold text-coral uppercase tracking-wider block">
              Recommended Daily Discretionary Cap
            </span>
            <div className="font-editorial text-4xl text-ink font-normal">
              {formatINR(dailyRecommended)}
              <span className="font-sans text-xs text-ink-muted ml-1 font-normal">/ day</span>
            </div>
            <p className="font-sans text-xs text-ink-muted">
              Calibrated across the next {daysToNext} days until your next confirmed income.
            </p>
          </div>

          {/* Mathematical Ledger Breakdown */}
          <div className="bg-ivory border border-line-medium rounded-xl p-5 space-y-4">
            <h4 className="font-accent text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Exact Calculation Breakdown
            </h4>

            <div className="space-y-2.5 font-sans text-xs">
              <div className="flex justify-between items-center py-1 border-b border-line-light">
                <span className="text-ink">Current Available Cash</span>
                <span className="font-accent font-semibold text-ink num-tabular">{formatINR(currentCash)}</span>
              </div>

              {reliableIncome > 0 && (
                <div className="flex justify-between items-center py-1 border-b border-line-light">
                  <span className="text-emerald-700">+ Reliable Upcoming Income</span>
                  <span className="font-accent font-semibold text-emerald-700 num-tabular">+{formatINR(reliableIncome)}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-1 border-b border-line-light">
                <span className="text-red-700">- Mandatory Upcoming Commitments</span>
                <span className="font-accent font-semibold text-red-700 num-tabular">-{formatINR(commitments)}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-line-light">
                <span className="text-ink-muted">- Protected Emergency Safety Buffer</span>
                <span className="font-accent font-semibold text-ink-muted num-tabular">-{formatINR(safetyBuffer)}</span>
              </div>

              <div className="flex justify-between items-center pt-2 font-semibold text-sm">
                <span className="text-ink">Net Spendable Headroom</span>
                <span className={`font-accent num-tabular ${spendableLiquidity >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {formatINR(spendableLiquidity)}
                </span>
              </div>

              <div className="pt-2 text-[11px] text-ink-muted leading-relaxed">
                Allocated across <strong className="text-ink">{daysToNext} days</strong> with a conservative 85% safety coefficient:
                <div className="mt-1 font-mono text-[10px] bg-cream p-2 rounded border border-line-light text-ink">
                  {formatINR(spendableLiquidity)} ÷ {daysToNext} days × 0.85 = {formatINR(dailyRecommended)}
                </div>
              </div>
            </div>
          </div>

          {/* Protected Bills List */}
          {committedItems.length > 0 && (
            <div className="space-y-2">
              <span className="font-accent text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
                Commitments Locked & Protected in this Window
              </span>
              <div className="space-y-1.5">
                {committedItems.map(item => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center px-3 py-2 bg-cream/40 rounded-lg border border-line-light text-xs font-sans"
                  >
                    <span className="text-ink">{item.title} <span className="text-[10px] text-ink-muted font-accent">(in {item.daysAway}d)</span></span>
                    <span className="font-accent font-semibold text-red-700 num-tabular">-{formatINR(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conservative Policy Notice */}
          {potentialIncome > 0 && (
            <div className="p-3 bg-cream border border-line-medium rounded-xl text-xs font-sans flex items-start gap-2.5">
              <AlertCircle size={15} className="text-coral flex-shrink-0 mt-0.5" />
              <div className="text-ink-muted text-[11px] leading-relaxed">
                <strong className="text-ink">Conservative policy:</strong> {formatINR(potentialIncome)} in uncertain/freelance income is excluded from this daily calculation until approved by your client.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-line-medium bg-ivory flex justify-end">
          <button 
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-full bg-coral text-white text-xs font-sans font-semibold hover:bg-coral-dark transition-all cursor-pointer shadow-subtle"
          >
            {t('modal_why_close', 'Understood')}
          </button>
        </div>
      </div>
    </div>
  );
}
