import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  ShoppingBag,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { simulateAffordability, formatINR } from '../engine/cashflowEngine';
import { soundFX } from '../engine/audioEffects';
import { useLanguage } from '../services/i18n.jsx';

export default function CanIAffordModal({
  isOpen,
  onClose,
  currentBalance,
  upcomingIncome = [],
  upcomingCommitments = [],
  safetyBuffer = 3000,
  burnRateDaily = 420
}) {
  const { t, language } = useLanguage();
  const [spendAmount, setSpendAmount] = useState('3500');
  const [itemTitle, setItemTitle] = useState('New Headphones / Sneakers');
  const [itemCategory, setItemCategory] = useState('Shopping');

  if (!isOpen) return null;

  const numAmount = parseFloat(spendAmount) || 0;
  const simulation = simulateAffordability({
    amount: numAmount,
    category: itemCategory,
    title: itemTitle,
    currentBalance,
    upcomingIncome,
    upcomingCommitments,
    safetyBuffer,
    burnRateDaily
  });

  return (
    <div className="fixed inset-0 bg-[#171512]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-ivory border border-line-medium rounded-2xl w-full max-w-lg max-h-[90vh] shadow-lifted flex flex-col overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-6 border-b border-line-medium flex items-start justify-between bg-ivory">
          <div className="space-y-1">
            <span className="text-[11px] font-accent uppercase tracking-widest text-coral font-bold block">
              Simulator · Affordability
            </span>
            <h3 className="font-editorial text-2xl text-ink font-normal">
              {t('modal_afford_title', 'Can I Afford This Purchase?')}
            </h3>
            <p className="font-sans text-xs text-ink-muted">
              {t('modal_afford_sub', 'Instant liquidity & safety buffer impact simulator')}
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
          {/* Input Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans font-semibold text-ink mb-1.5">
                {t('modal_afford_amount_label', 'Planned Spend (₹) *')}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-accent font-semibold text-coral text-base">
                  ₹
                </span>
                <input 
                  type="number"
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  placeholder="3500"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-line-medium bg-cream text-ink font-accent font-semibold text-lg focus:outline-none focus:border-coral transition-colors num-tabular"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-semibold text-ink mb-1.5">
                {t('modal_afford_cat_label', 'Category')}
              </label>
              <select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-line-medium bg-cream text-ink font-sans text-sm focus:outline-none focus:border-coral transition-colors"
              >
                <option value="Shopping">Shopping / Gadgets</option>
                <option value="Food">Food / Dining Out</option>
                <option value="Travel">Travel / Trip</option>
                <option value="Entertainment">Entertainment / Leisure</option>
                <option value="Other">Other Discretionary</option>
              </select>
            </div>
          </div>

          {/* Quick preset chips */}
          <div>
            <span className="text-[11px] font-accent uppercase tracking-wider text-ink-muted font-bold block mb-2">
              Quick presets
            </span>
            <div className="flex gap-2 flex-wrap">
              {[800, 1500, 3500, 6000, 10000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setSpendAmount(val.toString());
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-accent transition-all cursor-pointer ${
                    numAmount === val 
                      ? 'bg-coral text-white font-semibold shadow-subtle' 
                      : 'bg-ivory border border-line-medium text-ink-muted hover:border-line-dark hover:text-ink'
                  }`}
                >
                  ₹{val.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* SIMULATION VERDICT BOX */}
          <div className={`p-5 rounded-xl border ${
            simulation.bufferImpact === 'CRITICAL'
              ? 'border-red-200 bg-red-50/30'
              : simulation.bufferImpact === 'HIGH'
              ? 'border-amber-200 bg-amber-50/30'
              : 'border-emerald-200 bg-emerald-50/30'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {simulation.bufferImpact === 'CRITICAL' ? (
                  <AlertTriangle size={17} className="text-red-600" />
                ) : simulation.bufferImpact === 'HIGH' ? (
                  <AlertTriangle size={17} className="text-amber-600" />
                ) : (
                  <CheckCircle2 size={17} className="text-emerald-600" />
                )}
                <span className="font-sans text-sm font-bold text-ink">
                  {simulation.verdict}
                </span>
              </div>
              <span className={`text-[10px] font-accent font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                simulation.bufferImpact === 'CRITICAL'
                  ? 'bg-red-100 text-red-700'
                  : simulation.bufferImpact === 'HIGH'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                Buffer Impact: {simulation.bufferImpact}
              </span>
            </div>

            <p className="font-sans text-xs text-ink-muted leading-relaxed mb-3">
              {simulation.reasoning}
            </p>

            <div className="bg-ivory/80 border border-line-light rounded-lg p-3 text-xs font-sans text-ink">
              <span className="font-semibold text-coral">Guardian Advice: </span>
              <span>{simulation.recommendation}</span>
            </div>
          </div>

          {/* Mathematical Impact Breakdown */}
          <div className="bg-cream/40 border border-line-medium rounded-xl p-4 space-y-3">
            <div className="font-accent text-xs font-semibold text-ink flex items-center gap-1.5 uppercase tracking-wider">
              <Info size={13} className="text-coral" />
              <span>Cashflow Timeline Impact</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-ivory rounded-lg border border-line-light">
                <span className="text-[11px] font-sans text-ink-muted block mb-1">Lowest Balance (Baseline)</span>
                <span className="font-accent text-base font-semibold text-ink num-tabular">
                  {formatINR(simulation.baselineMin)}
                </span>
              </div>

              <div className="p-3 bg-ivory rounded-lg border border-line-light">
                <span className="text-[11px] font-sans text-ink-muted block mb-1">Lowest Balance (If Bought)</span>
                <span className={`font-accent text-base font-semibold num-tabular ${
                  simulation.newMin < safetyBuffer ? 'text-red-600' : 'text-emerald-700'
                }`}>
                  {formatINR(simulation.newMin)}
                </span>
              </div>
            </div>

            <p className="text-[11px] font-sans text-ink-muted">
              Protected safety buffer threshold: <strong className="text-ink">{formatINR(safetyBuffer)}</strong>.
            </p>
          </div>
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
            {t('modal_afford_close', 'Close Simulator')}
          </button>
        </div>
      </div>
    </div>
  );
}
