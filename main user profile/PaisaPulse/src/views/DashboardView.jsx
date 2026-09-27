import React, { useState } from 'react';
import { 
  Wallet, 
  Calendar, 
  ShieldAlert, 
  ShieldCheck, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownRight, 
  Home, 
  Tv, 
  Smartphone, 
  Dumbbell, 
  ChevronRight,
  TrendingUp,
  Sparkles,
  Plus,
  Edit2,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Info,
  Clock,
  Zap,
  TrendingDown
} from 'lucide-react';
import CashflowChart from '../components/CashflowChart';
import Sparkline from '../components/Sparkline';
import { formatINR } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { generateBestActions, recordActionFeedback } from '../services/ai/recommendationEngine.js';
import { explainWhatChanged } from '../services/ai/financialExplainer.js';
import PaisaTwinDashboardCard from '../components/PaisaTwinDashboardCard.jsx';
import { useLanguage } from '../services/i18n.jsx';

export default function DashboardView({ 
  currentPersona, 
  forecastResult, 
  safeToSpendResult,
  twinModel,
  onNavigateToPaisaTwin,
  onViewForecast, 
  onViewCommitments,
  onOpenGuardian,
  onOpenManageCommitments,
  onOpenCanIAfford,
  onOpenWhyThisNumber,
  onOpenOnboarding
}) {
  const { t, language } = useLanguage();
  const {
    timeline = [],
    riskLevel = { label: 'Stable', color: '#10B981', bg: '#ECFDF5', text: 'All good' },
    shortfallDay,
    shortfallAmount = 0,
    minProjectedBalance = 0,
    minBalanceDate = 'Oct 3',
    headroom = 0
  } = forecastResult || {};

  const {
    safeToSpendToday = 0,
    effectiveCurrentBalance = 0,
    safetyBuffer = 3000,
    commitmentsBeforeIncome = 0,
    nextIncomeDays = 7,
    nextIncomeAmount = 0,
    reliableIncome = 0,
    potentialIncome = 0
  } = safeToSpendResult || {};

  const [appliedActionIds, setAppliedActionIds] = useState(new Set());
  const [dismissedActionIds, setDismissedActionIds] = useState(new Set());

  const userName = currentPersona?.name || 'Kartik';
  const firstName = userName.split(' ')[0] || 'Kartik';
  const isSevereCrisis = riskLevel.label === 'Shortfall Risk' || minProjectedBalance < 0;

  // Generate top 1-2 recommendations from Recommendation Engine
  const bestActions = generateBestActions({
    forecastResult,
    safeToSpendResult,
    currentPersona,
    empiricalDailyBurn: 420
  }).filter(a => !dismissedActionIds.has(a.id));

  // "What Changed?" explanation
  const whatChanged = explainWhatChanged({
    previousSafeToSpend: safeToSpendToday > 500 ? safeToSpendToday + 280 : 700,
    currentSafeToSpend: safeToSpendToday,
    recentTransactions: currentPersona.transactions || [],
    uncertainIncomeCount: potentialIncome > 0 ? 1 : 0
  });

  const nextIncome = currentPersona.upcomingIncome?.[0];
  const nextCommitment = currentPersona.upcomingCommitments?.[0];

  const handleApplyAction = (action) => {
    soundFX.playSuccess();
    recordActionFeedback(action.id, 'APPLY', action);
    setAppliedActionIds(prev => new Set(prev).add(action.id));
    if (onViewCommitments) onViewCommitments();
  };

  const handleDismissAction = (action) => {
    soundFX.playClick();
    recordActionFeedback(action.id, 'REJECT', action);
    setDismissedActionIds(prev => new Set(prev).add(action.id));
  };

  // Next money movements list (combines upcoming income and upcoming commitments sorted by daysAway)
  const nextMovements = [
    ...(currentPersona.upcomingIncome || []).map(inc => ({
      id: inc.id,
      title: inc.title,
      amount: inc.amount,
      daysAway: inc.daysAway,
      type: 'income',
      certainty: inc.certainty || 'confirmed',
      date: inc.date || `In ${inc.daysAway} days`
    })),
    ...(currentPersona.upcomingCommitments || []).map(com => ({
      id: com.id,
      title: com.title,
      amount: com.amount,
      daysAway: com.daysAway,
      type: 'expense',
      category: com.category || 'Rent/Hostel',
      date: com.date || `In ${com.daysAway} days`
    }))
  ].sort((a, b) => a.daysAway - b.daysAway).slice(0, 4);

  return (
    <div className="dashboard-grid">
      {/* ============================================================== */}
      {/* 1. PRIMARY "TODAY" EXPERIENCE CARD (10-Second Clarity)          */}
      {/* ============================================================== */}
      <div style={{
        background: 'linear-gradient(135deg, #1C1917 0%, #292524 100%)',
        color: '#FFFFFF',
        borderRadius: '24px',
        padding: '24px 28px',
        marginBottom: '20px',
        boxShadow: '0 12px 32px -4px rgba(28, 25, 23, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative glow */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: isSevereCrisis ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 88, 12, 0.2)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#EA580C' }}>
                {t('dash_brief_title', "TODAY'S DECISION BRIEF")}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#D6D3D1' }}>
                {t('dash_single_truth', 'Single Source of Truth')}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
              {t('dash_good_day', `Good day, ${firstName}! 👋`, { name: firstName })}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenCanIAfford();
              }}
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                color: '#FFF',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '12px',
                fontSize: '0.84rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)'
              }}
            >
              <Plus size={16} />
              <span>{t('dash_can_i_afford_btn', 'Can I Afford Something?')}</span>
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                if (onOpenOnboarding) onOpenOnboarding();
              }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#E7E5E4',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '9px 14px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
              title="First-time user onboarding & baseline setup"
            >
              {t('dash_setup_guide', 'Setup Guide')}
            </button>
          </div>
        </div>

        {/* 10-Second Summary Bullets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px 18px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <span style={{ fontSize: '0.74rem', color: '#A8A29E', display: 'block' }}>{t('dash_avail_cash', 'Available Liquid Cash')}</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF' }}>{formatINR(effectiveCurrentBalance)}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.74rem', color: '#A8A29E', display: 'block' }}>{t('dash_safe_today', 'Safe Discretionary Today')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: isSevereCrisis ? '#F87171' : '#34D399' }}>
                {formatINR(safeToSpendToday)}
              </span>
              <button
                onClick={() => {
                  soundFX.playClick();
                  onOpenWhyThisNumber();
                }}
                style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.15)', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}
              >
                {t('dash_why_btn', 'Why?')}
              </button>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.74rem', color: '#A8A29E', display: 'block' }}>{t('dash_next_event', 'Next Critical Event')}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FED7AA' }}>
              {nextCommitment ? `${formatINR(nextCommitment.amount)} ${nextCommitment.title} (in ${nextCommitment.daysAway}d)` : t('no_bills_due', 'No commitments pending')}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.74rem', color: '#A8A29E', display: 'block' }}>{t('dash_cashflow_health', 'Cashflow Health')}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isSevereCrisis ? '#F87171' : '#34D399' }}>
              {isSevereCrisis ? t('dash_deficit_alert', `Deficit alert around ${shortfallDay?.dayLabel || 'Day 4'}`, { day: shortfallDay?.dayLabel || 'Day 4' }) : t('dash_protected_status', 'Protected — No shortfall expected')}
            </span>
          </div>
        </div>
      </div>

      {/* SEVERE EMERGENCY DEFICIT ALERT BANNER */}
      {isSevereCrisis && (
        <div style={{
          background: 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #B91C1C 100%)',
          color: '#FFFFFF',
          borderRadius: '16px',
          padding: '18px 22px',
          marginBottom: '20px',
          boxShadow: '0 0 28px rgba(239, 68, 68, 0.45)',
          border: '2px solid #EF4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', maxWidth: '640px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldAlert size={22} color="#FECACA" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.94rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Critical Liquidity Shortfall Warning
                </span>
                <span style={{ background: '#F87171', color: '#7F1D1D', fontSize: '0.72rem', fontWeight: 900, padding: '2px 8px', borderRadius: '4px' }}>
                  DEFICIT RISK
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#FEE2E2', lineHeight: '1.4' }}>
                Projected cash drops to <strong>{formatINR(minProjectedBalance)}</strong> on {shortfallDay?.dayLabel || 'Day 4'}! 
                Upcoming essential bills (Rent/EMI) risk bouncing with bank charges unless protected now.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onViewCommitments();
            }}
            style={{
              background: '#FFFFFF',
              color: '#991B1B',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 900
            }}
          >
            Review Mitigations
          </button>
        </div>
      )}

      {/* 🧬 PAISATWIN DIGITAL TWIN HERO CARD */}
      {twinModel && (
        <PaisaTwinDashboardCard 
          twinModel={twinModel} 
          onNavigateToPaisaTwin={onNavigateToPaisaTwin} 
        />
      )}

      {/* ============================================================== */}
      {/* 2. THE 5 QUESTIONS DECISION CENTER                              */}
      {/* ============================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* QUESTION 1: HOW MUCH CAN I SPEND? */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t('dash_q1_title', '1. How Much Can I Spend Today?')}
              </span>
              <button
                onClick={() => {
                  soundFX.playClick();
                  onOpenWhyThisNumber();
                }}
                style={{ fontSize: '0.75rem', color: '#EA580C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <HelpCircle size={14} />
                <span>{t('dash_q1_why', 'Why this number?')}</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: isSevereCrisis ? '#DC2626' : '#1C1917', letterSpacing: '-0.03em' }}>
                {formatINR(safeToSpendToday)}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#78716C', fontWeight: 600 }}>{t('dash_q1_per_day', '/ today')}</span>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#57534E', lineHeight: 1.45 }}>
              {t('dash_q1_desc', `You can spend up to approximately ${formatINR(safeToSpendToday)} today without putting your upcoming rent, bills, or safety buffer at risk.`, { amount: formatINR(safeToSpendToday) })}
            </p>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #EFE8DF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: '#78716C' }}>
              {t('dash_q1_next_income', `Next Income: in ${nextIncomeDays} days`, { days: nextIncomeDays })}
            </span>
            <button
              onClick={onOpenCanIAfford}
              style={{ fontSize: '0.78rem', color: '#EA580C', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>{t('dash_q1_test_btn', 'Test a specific purchase →')}</span>
            </button>
          </div>
        </div>

        {/* QUESTION 2: WHY? (TRANSPARENT REASONING) */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
            {t('dash_q2_title', '2. Why? (Guaranteed Protections)')}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1C1917' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>{t('dash_q2_cash', 'Current available cash:')} <strong>{formatINR(effectiveCurrentBalance)}</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1C1917' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>{t('dash_q2_income', `Salary/Stipend in ${nextIncomeDays} days:`, { days: nextIncomeDays })} <strong>+{formatINR(nextIncomeAmount)}</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1C1917' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>{t('dash_q2_bills', 'Mandatory bills protected:')} <strong>-{formatINR(commitmentsBeforeIncome)}</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1C1917' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>{t('dash_q2_buffer', 'Untouchable emergency buffer:')} <strong>{formatINR(safetyBuffer)}</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#57534E' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>{t('dash_q2_weekend', 'Weekend spending surge calibrated (+28%)')}</span>
            </div>
          </div>
        </div>

        {/* QUESTION 3: WHAT IS COMING? (TIMELINE) */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('dash_q3_title', '3. What is Coming? (Next Movements)')}
            </span>
            <button 
              onClick={onOpenManageCommitments}
              style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: 700 }}
            >
              {t('dash_q3_edit', '+ Edit Bills')}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {nextMovements.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#78716C' }}>{t('dash_q3_none', 'No scheduled cash movements added yet.')}</p>
            ) : (
              nextMovements.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#FAF8F4', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: item.type === 'income' ? '#059669' : '#EF4444' }}>
                      {item.type === 'income' ? '+' : '-'}{formatINR(item.amount)}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#1C1917', fontWeight: 600 }}>{item.title}</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#78716C' }}>{item.date}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* QUESTION 4: IS THERE A PROBLEM? (SHORTFALL & HEADROOM) */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: isSevereCrisis ? '#DC2626' : '#10B981', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            {t('dash_q4_title', '4. Is There a Problem?')}
          </div>

          {isSevereCrisis ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', marginBottom: '6px' }}>
                <AlertTriangle size={18} />
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{t('dash_q4_buffer_breach', 'Buffer Breach Risk Detected')}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#78716C', marginBottom: '10px' }}>
                {t('dash_q4_shortfall_text', `Projected low of ${formatINR(minProjectedBalance)} on ${minBalanceDate}. You may dip ${formatINR(shortfallAmount)} below your ${formatINR(safetyBuffer)} safety floor.`, {
                  min: formatINR(minProjectedBalance),
                  date: minBalanceDate,
                  amount: formatINR(shortfallAmount),
                  buffer: formatINR(safetyBuffer)
                })}
              </p>
              <div style={{ background: '#FEF2F2', padding: '8px 10px', borderRadius: '8px', fontSize: '0.78rem', color: '#991B1B', fontWeight: 700 }}>
                {t('dash_q4_caution', 'Status: Caution Required')}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', marginBottom: '6px' }}>
                <CheckCircle2 size={18} />
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{t('dash_q4_no_shortfall', 'No Shortfall Expected')}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#78716C', marginBottom: '10px' }}>
                {t('dash_q4_safe_text', `Lowest projected balance is ${formatINR(minProjectedBalance)} on ${minBalanceDate}.`, { min: formatINR(minProjectedBalance), date: minBalanceDate })}
              </p>
              <div style={{ background: '#ECFDF5', padding: '8px 10px', borderRadius: '8px', fontSize: '0.78rem', color: '#065F46', display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('dash_q4_buffer_label', `Safety Buffer: ${formatINR(safetyBuffer)}`, { buffer: formatINR(safetyBuffer) })}</span>
                <strong>{t('dash_q4_headroom', `Headroom: +${formatINR(headroom)}`, { amount: formatINR(headroom) })}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. QUESTION 5: WHAT SHOULD I DO? (NEXT BEST ACTION)            */}
      {/* ============================================================== */}
      <div className="card" style={{ padding: '22px 24px', marginBottom: '20px', border: '1.5px solid #FED7AA', background: '#FFFDFB' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#EA580C" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1C1917' }}>
              {t('dash_q5_title', '5. Your Next Best Action (AI Cashflow Optimization)')}
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', background: '#FFEDD5', color: '#C2410C', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
            {t('dash_q5_sim_badge', 'Simulated / Plan Only')}
          </span>
        </div>

        {bestActions.length === 0 ? (
          <p style={{ fontSize: '0.84rem', color: '#78716C' }}>
            {t('dash_q5_no_action', 'No immediate protective actions required. Your daily cashflow plan is optimal.')}
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {bestActions.map(act => (
              <div 
                key={act.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '16px',
                  border: '1px solid #EFE8DF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1C1917' }}>
                      {act.title}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#EA580C', background: '#FFF7ED', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      {act.badge}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#78716C', marginBottom: '8px' }}>
                    {act.problem}
                  </p>

                  <div style={{ background: '#FAF8F4', padding: '10px 12px', borderRadius: '8px', fontSize: '0.82rem', color: '#1C1917', fontWeight: 600, marginBottom: '8px' }}>
                    {act.action}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#57534E', marginBottom: '14px' }}>
                    <span>Impact: <strong style={{ color: '#059669' }}>{act.liquidityImpact}</strong></span>
                    <span>Tradeoff: {act.tradeoff}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleApplyAction(act)}
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center', padding: '7px 12px', fontSize: '0.78rem' }}
                  >
                    <span>{appliedActionIds.has(act.id) ? t('dash_q5_in_plan', '✓ In Active Plan') : t('dash_q5_apply', 'Apply to Plan')}</span>
                  </button>
                  <button
                    onClick={() => handleDismissAction(act)}
                    className="btn-secondary"
                    style={{ padding: '7px 12px', fontSize: '0.78rem' }}
                  >
                    {t('dash_q5_not_relevant', 'Not Relevant')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 4. "WHAT CHANGED?" EXPLANATION CARD (Point 19)                  */}
      {/* ============================================================== */}
      <div className="card" style={{ padding: '18px 22px', marginBottom: '20px', background: '#FAF8F4' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Clock size={16} color="#EA580C" />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1C1917' }}>
            {t('dash_what_changed', 'What Changed in Your Cashflow?')}
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#78716C', marginBottom: '8px' }}>
          {whatChanged.summary}
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {whatChanged.reasons.map((r, idx) => (
            <span key={idx} style={{ fontSize: '0.76rem', background: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', border: '1px solid #EFE8DF', color: '#44403C' }}>
              • {r}
            </span>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. 7-DAY CASHFLOW FORECAST CHART & RECURRING OBLIGATIONS       */}
      {/* ============================================================== */}
      <div className="chart-commitments-row">
        {/* Forecast Visual */}
        <div className="card forecast-card-inner">
          <div className="card-title-row">
            <h3 className="card-title">{t('dash_forecast_chart_title', '7-Day Cashflow Projection')}</h3>

            <div className="chart-legends">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#10B981' }} />
                <span>Inflows</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#F97316' }} />
                <span>Outflows</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#18181B' }} />
                <span>Balance</span>
              </div>
            </div>

            <button 
              className="view-all-link"
              onClick={() => {
                soundFX.playClick();
                onViewForecast();
              }}
            >
              <span>Full 30-Day</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ flex: 1, minHeight: '220px' }}>
            <CashflowChart 
              timeline={timeline.slice(0, 7)} 
              safetyBuffer={safetyBuffer} 
              showConfidenceRange={false}
              height={220}
            />
          </div>
        </div>

        {/* Upcoming Commitments Card */}
        <div className="card commitments-card">
          <div className="card-title-row">
            <h3 className="card-title">{t('dash_fixed_commitments', 'Fixed Commitments')}</h3>
            <button 
              className="view-all-link"
              onClick={() => {
                soundFX.playClick();
                onOpenManageCommitments();
              }}
              title="Add or edit your scheduled bills"
            >
              <Plus size={14} />
              <span>{t('dash_add_edit', 'Add / Edit')}</span>
            </button>
          </div>

          <div className="commitments-list">
            {(currentPersona.upcomingCommitments || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: '#A8A29E' }}>
                <p style={{ fontWeight: 700, color: '#57534E', marginBottom: '4px' }}>
                  {t('dash_no_bills', 'No upcoming bills added')}
                </p>
                <p style={{ fontSize: '0.78rem', marginBottom: '12px' }}>
                  {t('dash_no_bills_sub', 'Add your scheduled rent or subscriptions so the Guardian can protect them.')}
                </p>
                <button
                  className="btn-secondary"
                  onClick={onOpenManageCommitments}
                  style={{ fontSize: '0.78rem', margin: '0 auto', padding: '6px 14px' }}
                >
                  <Plus size={13} />
                  <span>{t('dash_add_bills_btn', '+ Add Fixed Bills')}</span>
                </button>
              </div>
            ) : (
              (currentPersona.upcomingCommitments || []).map(com => (
                <div key={com.id} className="commitment-item">
                  <div className="commitment-left">
                    <div className="commitment-icon-wrap">
                      <Home size={17} />
                    </div>
                    <div>
                      <div className="commitment-title">{com.title}</div>
                      <div className="commitment-timing">in {com.daysAway} days ({com.date})</div>
                    </div>
                  </div>
                  <div className="commitment-amount">{formatINR(com.amount)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
