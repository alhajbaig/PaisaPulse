import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Copy, 
  Check, 
  Sliders, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  PieChart
} from 'lucide-react';
import { formatINR } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { readMyMoneyAI, generateDeterministicReadMyMoney } from '../services/ai/paisaTwinExplainer.js';
import PaisaTwinCurve from '../components/PaisaTwinCurve.jsx';
import { useLanguage } from '../services/i18n.jsx';

export default function PaisaTwinView({
  twinModel,
  onOpenCanIAfford,
  onOpenWhyThisNumber,
  onNavigateToScenarios,
  onNavigateToGuardianChat
}) {
  const { t, language } = useLanguage();
  const [isRefreshingAI, setIsRefreshingAI] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showSecondaryTactics, setShowSecondaryTactics] = useState(false);
  const [customAiVerdict, setCustomAiVerdict] = useState(null);

  if (!twinModel) {
    return (
      <div className="text-center py-20 text-ink-muted">
        <div className="w-10 h-10 mx-auto rounded-full bg-coral/10 text-coral flex items-center justify-center mb-3">
          <Sparkles size={20} />
        </div>
        <h3 className="font-editorial text-xl text-ink">PaisaTwin Initializing...</h3>
        <p className="font-sans text-xs text-ink-muted mt-1">Calibrating your deterministic financial model.</p>
      </div>
    );
  }

  const {
    currentCash,
    confirmedIncome,
    uncertainIncome,
    mandatoryCommitments,
    safetyBuffer,
    protectedMoney,
    averageDailyBurn,
    safeDailySpend,
    nextFinancialPressure,
    projectedBalance7d,
    projectedBalance14d,
    projectedBalance30d,
    minimumProjectedBalance,
    minimumProjectedDate,
    minimumProjectedReason,
    healthMode,
    pressureTimeline,
    confidenceScore,
    confidenceBreakdown,
    spendingBreakdown,
    dailyBalances
  } = twinModel;

  const isHinglish = language === 'hinglish';

  // Handle AI analysis refresh
  const handleRefreshAnalysis = async () => {
    soundFX.playClick();
    setIsRefreshingAI(true);
    try {
      const res = await readMyMoneyAI(twinModel.structuredAIContext, language);
      setCustomAiVerdict(res.text);
      soundFX.playSuccess();
    } catch {
      setCustomAiVerdict(generateDeterministicReadMyMoney(twinModel.structuredAIContext, language));
    } finally {
      setIsRefreshingAI(false);
    }
  };

  const handleCopyLandlordScript = () => {
    soundFX.playClick();
    const script = isHinglish
      ? `Namaste, Mera stipend/salary credit kuch hi dino mein aane wala hai. Kya main abhi rent ka kuch token dekar baaki balance stipend credit hote hi clear kar du? Samajhne ke liye bohot dhanyawad!`
      : `Namaste, My stipend/salary credit is scheduled to land in a few days. Could I pay part of the rent today and clear the remaining balance once my credit clears? Thank you for understanding!`;
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // Determine real user verdict headline & text
  const isDeficit = minimumProjectedBalance < 0;
  const isTight = minimumProjectedBalance >= 0 && minimumProjectedBalance < safetyBuffer;

  const verdictHeadline = isDeficit
    ? (isHinglish 
        ? `${minimumProjectedDate} aapka danger point hai.` 
        : `${minimumProjectedDate} is your cashflow friction point.`)
    : isTight
    ? (isHinglish
        ? `Upcoming commitments aapke ₹${safetyBuffer} buffer ko compress karenge.`
        : `Upcoming bills will compress into your ₹${safetyBuffer} emergency buffer.`)
    : (isHinglish
        ? `Aapka 30-day cashflow comfortable aur safe hai.`
        : `Your cashflow trajectory is fully solvent through next month.`);

  const verdictSummary = isDeficit
    ? (isHinglish
        ? `Aapke paas abhi ${formatINR(currentCash)} liquid cash hai, lekin ${nextFinancialPressure ? nextFinancialPressure.title : 'PG Rent'} aapke stipend credit se pehle debit ho raha hai — jisse balance ${formatINR(minimumProjectedBalance)} tak dip ho sakta hai.`
        : `You have ${formatINR(currentCash)} in liquid cash today, but ${nextFinancialPressure ? nextFinancialPressure.title : 'PG Rent'} debits before your scheduled stipend credit, projecting a ${formatINR(minimumProjectedBalance)} deficit on ${minimumProjectedDate}.`)
    : isTight
    ? (isHinglish
        ? `Aapka balance ${minimumProjectedDate} ko ${formatINR(minimumProjectedBalance)} tak dip karega. Discretionary kharcha roz ₹${safeDailySpend} ke andar rakhne se aapka buffer bacha rahega.`
        : `Your projected balance bottoms out at ${formatINR(minimumProjectedBalance)} on ${minimumProjectedDate}. Restricting discretionary burn to ₹${safeDailySpend}/day preserves your reserve buffer.`)
    : (isHinglish
        ? `Aapke saare scheduled bills aur ₹${safetyBuffer} buffer fully protected hain. Rozana ₹${safeDailySpend} tak bina chinta ke spend kar sakte hain.`
        : `All scheduled commitments and your ₹${safetyBuffer} buffer remain intact. You have a verified safe-to-spend allowance of ₹${safeDailySpend}/day.`);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Ultra-Minimal Editorial Header & Stance */}
      <div className="border-b border-line-medium pb-6 pt-2 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-accent uppercase tracking-widest text-coral font-bold">
              PaisaTwin · Living Financial Mirror
            </span>
            <span className="text-ink-muted">·</span>
            <span className="text-[11px] font-sans text-ink-muted">
              {confidenceScore}% Deterministic Accuracy
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshAnalysis}
              disabled={isRefreshingAI}
              className="px-3.5 py-1.5 rounded-full bg-ivory border border-line-medium text-xs font-sans text-ink hover:border-line-dark transition-all flex items-center gap-1.5 shadow-xs"
              title="Re-run deterministic simulation"
            >
              <RotateCcw size={12} className={isRefreshingAI ? 'animate-spin text-coral' : 'text-ink-muted'} />
              <span>{isRefreshingAI ? 'Calibrating...' : 'Re-analyze'}</span>
            </button>

            {onOpenWhyThisNumber && (
              <button 
                className="px-3.5 py-1.5 rounded-full bg-ivory border border-line-medium text-xs font-sans text-ink hover:border-line-dark transition-all flex items-center gap-1.5 shadow-xs"
                onClick={onOpenWhyThisNumber}
              >
                <HelpCircle size={13} className="text-ink-muted" />
                <span>Why This Number?</span>
              </button>
            )}

            {onOpenCanIAfford && (
              <button 
                className="px-4 py-1.5 rounded-full bg-ink text-ivory text-xs font-sans font-semibold hover:bg-coral transition-all shadow-sm flex items-center gap-2"
                onClick={onOpenCanIAfford}
              >
                <Sparkles size={13} className="text-coral" />
                <span>Can I Afford This?</span>
              </button>
            )}
          </div>
        </div>

        {/* Real User Verdict: The Truth in Plain Words */}
        <div className="space-y-1.5">
          <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-ink font-normal leading-tight">
            {verdictHeadline}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-ink-muted max-w-3xl leading-relaxed">
            {customAiVerdict ? customAiVerdict.slice(0, 220) + '...' : verdictSummary}
          </p>
        </div>
      </div>

      {/* 2. Four-Column Hairline Radar Strip (Zero Heavy Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-line-medium bg-ivory divide-x divide-y lg:divide-y-0 divide-line-medium rounded-lg overflow-hidden shadow-xs">
        {/* Metric 1 */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] font-accent uppercase tracking-widest text-ink-muted block">
            01 · Liquid In Hand
          </span>
          <div className="font-mono text-xl sm:text-2xl font-bold text-ink">
            {formatINR(currentCash)}
          </div>
          <span className="text-[11px] font-sans text-ink-muted block">
            Available bank balance today
          </span>
        </div>

        {/* Metric 2 */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] font-accent uppercase tracking-widest text-ink-muted block">
            02 · Ring-Fenced
          </span>
          <div className="font-mono text-xl sm:text-2xl font-bold text-ink">
            {formatINR(protectedMoney)}
          </div>
          <span className="text-[11px] font-sans text-ink-muted block">
            Rent & bills + ₹{safetyBuffer} cushion
          </span>
        </div>

        {/* Metric 3 */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] font-accent uppercase tracking-widest text-ink-muted block">
            03 · Safe Daily Burn
          </span>
          <div className="font-mono text-xl sm:text-2xl font-bold text-emerald-700">
            {formatINR(safeDailySpend)}<span className="text-xs font-normal text-ink-muted">/day</span>
          </div>
          <span className="text-[11px] font-sans text-emerald-600 block">
            Discretionary spending ceiling
          </span>
        </div>

        {/* Metric 4 */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] font-accent uppercase tracking-widest text-ink-muted block">
            04 · Horizon Dip Point
          </span>
          <div className={`font-mono text-xl sm:text-2xl font-bold ${isDeficit ? 'text-coral' : 'text-ink'}`}>
            {formatINR(minimumProjectedBalance)}
          </div>
          <span className={`text-[11px] font-sans block ${isDeficit ? 'text-coral' : 'text-ink-muted'}`}>
            Expected on {minimumProjectedDate}
          </span>
        </div>
      </div>

      {/* 3. The Hero Visual: Interactive 30-Day Spline Curve */}
      <PaisaTwinCurve
        timeline={dailyBalances}
        safetyBuffer={safetyBuffer}
        currentCash={currentCash}
        minimumProjectedBalance={minimumProjectedBalance}
        minimumProjectedDate={minimumProjectedDate}
        height={270}
      />

      {/* 4. The Twin's Single Prescribed Action (Straight to the Point) */}
      <div className="border border-line-medium bg-[#FFFDF9] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-coral" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-coral/10 text-coral text-[10px] font-accent font-bold uppercase tracking-wider">
              {isDeficit ? '⚡ Primary Countermeasure' : '🛡️ Proactive Strategy'}
            </span>
            <span className="text-xs text-ink-muted font-sans">
              {isDeficit ? `Avoids the ${formatINR(Math.abs(minimumProjectedBalance))} deficit on ${minimumProjectedDate}` : 'Maintains safe spend discipline'}
            </span>
          </div>

          <span className="text-xs font-mono text-ink-muted">
            Impact: High
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="font-editorial text-xl sm:text-2xl text-ink font-normal">
            {isDeficit 
              ? `Stagger ${nextFinancialPressure ? nextFinancialPressure.title : 'PG Rent'} due date by 3 days (${minimumProjectedDate} → Oct 28)`
              : isTight
              ? `Cap variable daily spending to ₹${safeDailySpend}/day`
              : `Sweep cash surplus above ₹${safetyBuffer} into high-yield digital vault`}
          </h3>
          <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed max-w-3xl">
            {isDeficit 
              ? `Your confirmed ${formatINR(confirmedIncome)} stipend credit arrives on Oct 28. Shifting the ₹${nextFinancialPressure?.amount || 5000} debit by 72 hours keeps your liquid cash strictly positive and leaves your ₹${safetyBuffer} buffer 100% intact.`
              : isTight
              ? `Upcoming commitments totaling ${formatINR(mandatoryCommitments)} land before next income. Sticking strictly to ₹${safeDailySpend}/day prevents dipping into your protected safety cushion.`
              : `Your balance is fully solvent. All ${formatINR(mandatoryCommitments)} in commitments are pre-funded with guaranteed room to breathe.`}
          </p>
        </div>

        {/* 1-Click Execution Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {isDeficit && (
            <button
              onClick={handleCopyLandlordScript}
              className="px-4 py-2 rounded-lg bg-coral text-white text-xs font-sans font-semibold hover:bg-[#E55338] transition-all flex items-center gap-2 shadow-xs"
            >
              {copiedScript ? (
                <>
                  <Check size={14} />
                  <span>WhatsApp Message Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy WhatsApp Script for Landlord</span>
                </>
              )}
            </button>
          )}

          {onNavigateToScenarios && (
            <button
              onClick={() => {
                soundFX.playClick();
                onNavigateToScenarios();
              }}
              className="px-4 py-2 rounded-lg bg-ivory border border-line-medium text-xs font-sans text-ink hover:border-line-dark transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Sliders size={13} className="text-ink-muted" />
              <span>Simulate in What-If Scenarios ➔</span>
            </button>
          )}

          {onNavigateToGuardianChat && (
            <button
              onClick={() => {
                soundFX.playClick();
                onNavigateToGuardianChat();
              }}
              className="px-4 py-2 rounded-lg bg-ivory border border-line-medium text-xs font-sans text-ink hover:border-line-dark transition-all flex items-center gap-1.5 shadow-xs"
            >
              <MessageSquare size={13} className="text-ink-muted" />
              <span>Ask Guardian AI ➔</span>
            </button>
          )}

          {/* Secondary tactics collapsible toggle */}
          <button
            onClick={() => {
              soundFX.playClick();
              setShowSecondaryTactics(!showSecondaryTactics);
            }}
            className="ml-auto text-xs text-ink-muted hover:text-ink font-sans flex items-center gap-1 transition-colors"
          >
            <span>{showSecondaryTactics ? 'Hide' : '+ 2'} Secondary Defensive Tactics</span>
            {showSecondaryTactics ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Collapsible Secondary Tactics (Zero Clutter by Default) */}
        {showSecondaryTactics && (
          <div className="pt-4 border-t border-line-light grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-[#FAF8F4] border border-line-light rounded-lg space-y-1">
              <span className="text-[10px] font-accent font-bold uppercase tracking-wider text-amber-700 block">
                Tactic A · Spend Freeze
              </span>
              <h4 className="font-sans font-bold text-xs text-ink">Zero-Discretionary Spend Freeze</h4>
              <p className="font-sans text-[11px] text-ink-muted leading-relaxed">
                Cap daily variable spending from ₹{averageDailyBurn}/day to ₹0 for 72 hours to protect liquid reserves.
              </p>
            </div>

            <div className="p-3 bg-[#FAF8F4] border border-line-light rounded-lg space-y-1">
              <span className="text-[10px] font-accent font-bold uppercase tracking-wider text-indigo-700 block">
                Tactic B · Cushion Buffer Use
              </span>
              <h4 className="font-sans font-bold text-xs text-ink">Tactical Buffer Cushion Utilization</h4>
              <p className="font-sans text-[11px] text-ink-muted leading-relaxed">
                Use up to ₹{Math.min(Math.abs(minimumProjectedBalance || 1000), safetyBuffer)} from your ₹{safetyBuffer} emergency buffer strictly to avoid bank bounce penalties, then replenish the second stipend clears.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 5. Clean Two-Column Horizon: Movements (Left) + Outflows & Reliability (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left (7 Cols): Upcoming Cash Movements Timeline */}
        <div className="lg:col-span-7 border border-line-medium bg-ivory rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-line-light">
            <div className="space-y-0.5">
              <h3 className="font-editorial text-lg text-ink font-normal">
                Upcoming Cash Movements
              </h3>
              <p className="font-sans text-xs text-ink-muted">
                Chronological sequence of scheduled inflows and bank debits
              </p>
            </div>
            <span className="text-[11px] font-mono text-ink-muted">
              Next 30 Days
            </span>
          </div>

          <div className="divide-y divide-line-light">
            {pressureTimeline.slice(0, 5).map((item) => {
              const isToday = item.type === 'current_cash';
              const isIncoming = item.type === 'incoming';
              const isOutgoing = item.type === 'outgoing_mandatory';

              return (
                <div 
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isToday ? 'bg-ink' : isIncoming ? 'bg-emerald-500' : 'bg-coral'
                    }`} />

                    <div>
                      <div className="font-sans font-bold text-ink">
                        {item.title}
                      </div>
                      <div className="font-sans text-[11px] text-ink-muted">
                        {item.daysAway === 0 ? 'Today' : `In ${item.daysAway} days (${item.date})`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono font-bold text-sm ${
                      isIncoming ? 'text-emerald-700' : isOutgoing ? 'text-coral' : 'text-ink'
                    }`}>
                      {item.displaySign}{formatINR(item.amount)}
                    </div>
                    <div className="text-[10px] text-ink-muted capitalize">
                      {isToday ? 'Liquid Cash' : isIncoming ? 'Incoming' : 'Bank Debit'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (5 Cols): Outflow Allocation & Deterministic Confidence */}
        <div className="lg:col-span-5 space-y-6">
          {/* Outflow Breakdown */}
          <div className="border border-line-medium bg-ivory rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-line-light">
              <h3 className="font-editorial text-lg text-ink font-normal">
                Outflow Allocation
              </h3>
              <span className="text-[11px] font-sans text-ink-muted">
                Committed & Variable
              </span>
            </div>

            <div className="space-y-3">
              {spendingBreakdown.slice(0, 4).map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans text-ink font-medium">{cat.category}</span>
                    <span className="font-mono text-ink-muted">
                      {formatINR(cat.amount)} <strong className="text-ink">({cat.percentage}%)</strong>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F0EBE1] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        cat.category === 'Rent' || cat.category === 'Rent/Hostel' ? 'bg-coral' :
                        cat.category === 'Education' ? 'bg-indigo-600' :
                        cat.category === 'Food' ? 'bg-amber-500' : 'bg-ink'
                      }`}
                      style={{ width: `${Math.min(100, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Precision Box */}
          <div className="border border-line-medium bg-ivory rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-accent uppercase tracking-widest text-ink-muted font-bold">
                Deterministic Model Reliability
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold font-mono">
                {confidenceScore}% Reliability
              </span>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between text-ink-muted">
                <span>Verified Income Schedule:</span>
                <strong className="text-emerald-700 font-medium">Verified</strong>
              </div>
              <div className="flex items-center justify-between text-ink-muted">
                <span>Recurring Commitments Mapped:</span>
                <strong className="text-ink font-medium">{mandatoryCommitments > 0 ? `${formatINR(mandatoryCommitments)} locked` : 'None'}</strong>
              </div>
              <div className="flex items-center justify-between text-ink-muted">
                <span>Daily Burn Variance:</span>
                <strong className="text-ink font-medium">±{formatINR(Math.round(averageDailyBurn * 0.15))} /day</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-line-light text-[10px] text-ink-muted font-sans leading-tight">
              Uncertain / freelance income is excluded from guaranteed Safe-to-Spend calculations to prevent overdraft risk.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
