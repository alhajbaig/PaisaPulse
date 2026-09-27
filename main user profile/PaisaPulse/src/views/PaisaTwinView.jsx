import React, { useState, useEffect } from 'react';
import { 
  Dna, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  Flame, 
  Lock, 
  Wallet,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
  Clock,
  PieChart,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { formatINR } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { readMyMoneyAI, generateDeterministicReadMyMoney } from '../services/ai/paisaTwinExplainer.js';
import CashflowChart from '../components/CashflowChart.jsx';
import PaisaTwinRichSummary from '../components/PaisaTwinRichSummary.jsx';
import { useLanguage } from '../services/i18n.jsx';

export default function PaisaTwinView({
  twinModel,
  onOpenCanIAfford,
  onOpenWhyThisNumber,
  onNavigateToScenarios,
  onNavigateToGuardianChat
}) {
  const { t, language } = useLanguage();
  const [isReadingMoney, setIsReadingMoney] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [aiSummary, setAiSummary] = useState(() => {
    return twinModel?.structuredAIContext ? generateDeterministicReadMyMoney(twinModel.structuredAIContext, language) : null;
  });
  const [showSpendingBreakdown, setShowSpendingBreakdown] = useState(true);

  // When language switches, update deterministic summary if user hasn't generated custom AI text yet
  useEffect(() => {
    if (!isAiGenerated && twinModel?.structuredAIContext) {
      setAiSummary(generateDeterministicReadMyMoney(twinModel.structuredAIContext, language));
    }
  }, [language, isAiGenerated, twinModel]);

  if (!twinModel) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#78716C' }}>
        <Dna size={40} color="#EA580C" style={{ marginBottom: '12px' }} />
        <h3>PaisaTwin Digital Model Initializing...</h3>
        <p>Please ensure transactions and initial cash are set up.</p>
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
    outlookMilestones,
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
    insightCards,
    spendingBreakdown,
    dailyBalances
  } = twinModel;

  const handleReadMyMoney = async () => {
    soundFX.playClick();
    setIsReadingMoney(true);
    try {
      const res = await readMyMoneyAI(twinModel.structuredAIContext, language);
      setAiSummary(res.text);
      setIsAiGenerated(true);
      soundFX.playSuccess();
    } catch {
      setAiSummary(generateDeterministicReadMyMoney(twinModel.structuredAIContext, language));
    } finally {
      setIsReadingMoney(false);
    }
  };

  // Convert dailyBalances to chart format for 30-day view
  const chartTimeline = dailyBalances.map((d, i) => ({
    dayIndex: i,
    date: d.date,
    dayLabel: d.date,
    projectedBalance: d.closingBalance,
    optimisticBalance: d.closingBalance + (uncertainIncome > 0 ? uncertainIncome * 0.7 : 0),
    conservativeBalance: d.closingBalance - (averageDailyBurn * 0.15 * (i + 1)),
    income: d.income || 0,
    expenses: d.expenses || 0
  }));

  return (
    <div style={{ animation: 'fadeIn 0.25s ease-in-out' }}>
      {/* 1. Header Bar */}
      <div className="transactions-view-header" style={{ marginBottom: '24px' }}>
        <div className="view-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#FEEEDD',
              color: '#EA580C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Dna size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#1C1917' }}>
                  {t('twin_hero_title', 'PaisaTwin')}
                </h2>
                <span style={{
                  background: healthMode.badgeBg,
                  color: healthMode.badgeColor,
                  border: `1px solid ${healthMode.borderColor}`,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '3px 12px',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>{healthMode.emoji}</span>
                  <span>{language === 'hinglish' ? healthMode.label.replace('MODE', 'MODE (देसी)') : healthMode.label}</span>
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#78716C' }}>
                {t('twin_hero_sub', '“Your money. Your future. One digital twin.”')}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {onOpenWhyThisNumber && (
            <button 
              className="btn-secondary"
              onClick={onOpenWhyThisNumber}
            >
              <HelpCircle size={15} />
              <span>{t('btn_why_this_number', 'Why This Number?')}</span>
            </button>
          )}

          {onOpenCanIAfford && (
            <button 
              className="btn-primary"
              onClick={onOpenCanIAfford}
            >
              <Sparkles size={15} />
              <span>{t('btn_can_i_afford', 'Can I Afford This?')}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Summary Grid: Current Financial State */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        <div className="card" style={{ padding: '16px 18px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#78716C', marginBottom: '4px' }}>
            <Wallet size={15} color="#EA580C" />
            <span>{t('available_cash', 'Available Cash')}</span>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1C1917' }}>
            {formatINR(currentCash)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#A8A29E', marginTop: '2px' }}>{t('available_cash_sub', 'Current balance in hand')}</div>
        </div>

        <div className="card" style={{ padding: '16px 18px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#78716C', marginBottom: '4px' }}>
            <TrendingUp size={15} color="#10B981" />
            <span>{t('confirmed_inflow', 'Confirmed Incoming')}</span>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10B981' }}>
            +{formatINR(confirmedIncome)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '2px' }}>{t('confirmed_inflow_sub', 'Reliable salary / stipend')}</div>
        </div>

        <div className="card" style={{ padding: '16px 18px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#78716C', marginBottom: '4px' }}>
            <Lock size={15} color="#F97316" />
            <span>{t('protected_money', 'Protected Money')}</span>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#44403C' }}>
            {formatINR(protectedMoney)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#78716C', marginTop: '2px' }}>{t('protected_money_sub', `Rent & bills + ₹${safetyBuffer} buffer`)}</div>
        </div>

        <div className="card" style={{ padding: '16px 18px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#78716C', marginBottom: '4px' }}>
            <Flame size={15} color="#EF4444" />
            <span>{t('daily_burn', 'Average Daily Burn')}</span>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#DC2626' }}>
            {formatINR(averageDailyBurn)}<span style={{ fontSize: '0.8rem', color: '#78716C' }}>/day</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#A8A29E', marginTop: '2px' }}>{t('daily_burn_sub', 'Discretionary velocity')}</div>
        </div>

        <div className="card" style={{ padding: '16px 18px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#78716C', marginBottom: '4px' }}>
            <ShieldCheck size={15} color="#10B981" />
            <span>{t('safe_daily_spend', 'Safe-to-Spend')}</span>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669' }}>
            {formatINR(safeDailySpend)}<span style={{ fontSize: '0.8rem', color: '#78716C' }}>/day</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '2px' }}>{t('safe_daily_spend_sub', 'Discretionary daily cap')}</div>
        </div>

        <div className="card" style={{ padding: '16px 18px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#78716C', marginBottom: '4px' }}>
            <Calendar size={15} color="#6366F1" />
            <span>{t('next_pressure', 'Next Pressure')}</span>
          </div>
          {nextFinancialPressure ? (
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1C1917' }}>
                {nextFinancialPressure.title}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#EA580C', fontWeight: 700 }}>
                {formatINR(nextFinancialPressure.amount)} ({t('due_in_days', `in ${nextFinancialPressure.daysAway} days`, { days: nextFinancialPressure.daysAway })})
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.88rem', color: '#10B981', fontWeight: 700 }}>
              {t('no_bills_due', 'No critical bills due')}
            </div>
          )}
        </div>
      </div>

      {/* 3. AI "Read My Money" Hero Card */}
      <div className="card" style={{
        padding: '24px',
        marginBottom: '24px',
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #EFE8DF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1C1917', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Sparkles size={20} color="#EA580C" />
              <span>{t('read_my_money_title', 'Read My Money — AI Interpretation & Solutions')}</span>
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#78716C', margin: '4px 0 0 0' }}>
              {t('read_my_money_sub', 'Synthesizes your balances, commitments, and burn velocity into a direct, human summary with actionable solutions.')}
            </p>
          </div>

          <button
            onClick={handleReadMyMoney}
            disabled={isReadingMoney}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} />
            <span>{isReadingMoney ? t('btn_analyzing_summary', 'Analyzing via Groq AI...') : t('btn_generate_summary', '✨ Generate Fresh Summary')}</span>
          </button>
        </div>

        {aiSummary ? (
          <PaisaTwinRichSummary
            summaryText={aiSummary}
            twinModel={twinModel}
            onNavigateToScenarios={onNavigateToScenarios}
            onNavigateToGuardianChat={onNavigateToGuardianChat}
          />
        ) : (
          <div style={{
            background: '#FAF8F4',
            borderRadius: '12px',
            padding: '18px 20px',
            border: '1px dashed #DDD5C9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <strong style={{ fontSize: '0.9rem', color: '#1C1917', display: 'block', marginBottom: '2px' }}>
                Instant AI Financial Breakdown & Solutions
              </strong>
              <span style={{ fontSize: '0.82rem', color: '#78716C' }}>
                Click "Generate Fresh Summary" to translate all calculated cashflow numbers into actionable recovery steps.
              </span>
            </div>
            <button
              onClick={handleReadMyMoney}
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.8rem', flexShrink: 0 }}
            >
              Read Now
            </button>
          </div>
        )}
      </div>

      {/* 4. "If You Keep Spending Like This..." (7, 14, 30 Days + Lowest Point) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Horizon Forecast Card */}
        <div className="card" style={{ padding: '22px', background: '#FFFFFF', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1C1917', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{t('horizon_title', '🔮 If You Keep Spending Like This...')}</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#78716C', marginBottom: '16px' }}>
            {t('horizon_sub', 'Projected balances assuming your normal burn rate continues without intervention:')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: '#FAF8F4', padding: '12px', borderRadius: '10px', border: '1px solid #EFE8DF', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#78716C', fontWeight: 700, textTransform: 'uppercase' }}>{t('days_7', '7 Days')}</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: projectedBalance7d < safetyBuffer ? '#EF4444' : '#1C1917', marginTop: '2px' }}>
                {formatINR(projectedBalance7d)}
              </div>
            </div>

            <div style={{ background: '#FAF8F4', padding: '12px', borderRadius: '10px', border: '1px solid #EFE8DF', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#78716C', fontWeight: 700, textTransform: 'uppercase' }}>{t('days_14', '14 Days')}</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: projectedBalance14d < safetyBuffer ? '#EF4444' : '#1C1917', marginTop: '2px' }}>
                {formatINR(projectedBalance14d)}
              </div>
            </div>

            <div style={{ background: '#FAF8F4', padding: '12px', borderRadius: '10px', border: '1px solid #EFE8DF', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#78716C', fontWeight: 700, textTransform: 'uppercase' }}>{t('days_30', '30 Days')}</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: projectedBalance30d < safetyBuffer ? '#EF4444' : '#1C1917', marginTop: '2px' }}>
                {formatINR(projectedBalance30d)}
              </div>
            </div>
          </div>

          {/* Lowest Point Callout */}
          <div style={{
            background: minimumProjectedBalance < 0 ? '#FEF2F2' : (minimumProjectedBalance < safetyBuffer ? '#FFFBEB' : '#ECFDF5'),
            border: `1px solid ${minimumProjectedBalance < 0 ? '#FECACA' : (minimumProjectedBalance < safetyBuffer ? '#FDE68A' : '#A7F3D0')}`,
            borderRadius: '12px',
            padding: '14px 16px',
            boxShadow: minimumProjectedBalance < 0 ? '0 2px 8px rgba(220, 38, 38, 0.05)' : 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                fontSize: '0.84rem',
                fontWeight: 800,
                color: minimumProjectedBalance < 0 ? '#DC2626' : (minimumProjectedBalance < safetyBuffer ? '#D97706' : '#059669'),
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {minimumProjectedBalance < 0 ? <AlertTriangle size={15} color="#DC2626" /> : <ShieldCheck size={15} color="#059669" />}
                <span>{t('lowest_point_title', 'Lowest Projected Point:')}</span>
                <span className={minimumProjectedBalance < 0 ? 'pt-pill-negative' : 'pt-pill-positive'}>
                  {formatINR(minimumProjectedBalance)}
                </span>
              </span>
              <span className="pt-pill-date">
                {t('expected_on', `Expected: ${minimumProjectedDate}`, { date: minimumProjectedDate })}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#44403C', lineHeight: '1.5', fontWeight: 500 }}>
              {minimumProjectedReason}
            </p>
          </div>
        </div>

        {/* Confidence Breakdown Card */}
        <div className="card" style={{ padding: '22px', background: '#FFFFFF', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1C1917', margin: 0 }}>
              {t('confidence_title', '🎯 PaisaTwin Confidence')}
            </h3>
            <span style={{
              background: '#ECFDF5',
              color: '#059669',
              padding: '3px 10px',
              borderRadius: '999px',
              fontWeight: 800,
              fontSize: '0.8rem'
            }}>
              {confidenceScore}% — {t('confidence_high', 'High Reliability')}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#78716C', marginBottom: '14px' }}>
            Calculated from confirmed income, fixed commitments, and transaction frequency:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {confidenceBreakdown.map((item, idx) => (
              <div key={idx} style={{
                background: '#FAF8F4',
                padding: '8px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1C1917' }}>{item.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#78716C' }}>{item.note}</div>
                </div>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: item.rating === 'High' ? '#059669' : (item.rating === 'Medium' ? '#D97706' : '#EF4444'),
                  background: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid #EFE8DF'
                }}>
                  {item.rating}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.74rem', color: '#78716C', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Info size={13} color="#EA580C" />
            <span>{t('twin_uncertain_note', 'Uncertain / freelance income is never used in guaranteed Safe-to-Spend.')}</span>
          </div>
        </div>
      </div>

      {/* 5. 30-Day Outlook Interactive Curve */}
      <div className="card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1C1917', margin: 0 }}>
              {t('twin_chart_title', '📈 30-Day Visual Cashflow Outlook')}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#78716C' }}>
              {t('twin_chart_sub', 'Day-by-day projected cash balance factoring in scheduled bills, incomes, and daily burn rate.')}
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#78716C' }}>
            {t('twin_safety_floor', 'Safety Buffer Floor:')} <strong>{formatINR(safetyBuffer)}</strong>
          </span>
        </div>

        <CashflowChart
          timeline={chartTimeline}
          safetyBuffer={safetyBuffer}
          showConfidenceRange={true}
          height={220}
        />
      </div>

      {/* 6. Financial Pressure Timeline */}
      <div className="card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1C1917', marginBottom: '4px' }}>
          {t('money_timeline_title', '⏳ Your Money Timeline')}
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#78716C', marginBottom: '20px' }}>
          {t('money_timeline_sub', 'Chronological sequence of all upcoming financial movements:')}
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          position: 'relative',
          paddingLeft: '20px',
          borderLeft: '2px solid #EFE8DF',
          marginLeft: '8px'
        }}>
          {pressureTimeline.map((item) => {
            const isToday = item.type === 'current_cash';
            const isIncoming = item.type === 'incoming';
            const isPotential = item.type === 'potential_incoming';
            const isOutgoing = item.type === 'outgoing_mandatory';

            return (
              <div 
                key={item.id}
                style={{
                  position: 'relative',
                  background: isToday ? '#FEEEDD' : '#FAF8F4',
                  border: `1px solid ${isToday ? '#FDBA74' : '#EFE8DF'}`,
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                {/* Timeline node circle */}
                <div style={{
                  position: 'absolute',
                  left: '-27px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: isIncoming ? '#10B981' : (isOutgoing ? '#EF4444' : (isPotential ? '#F59E0B' : '#EA580C')),
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 0 0 2px #EFE8DF'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.1rem' }}>{item.indicator}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1C1917' }}>
                        {item.title}
                      </span>
                      {isPotential && (
                        <span style={{ fontSize: '0.68rem', background: '#FEF3C7', color: '#B45309', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          {t('twin_potential', 'Potential')}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.76rem', color: '#78716C' }}>
                      {item.daysAway === 0 ? t('twin_today', 'Today') : t('twin_in_days', `In ${item.daysAway} days (${item.date})`, { days: item.daysAway, date: item.date })}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: isIncoming ? '#059669' : (isOutgoing ? '#DC2626' : (isPotential ? '#D97706' : '#1C1917'))
                  }}>
                    {item.displaySign}{formatINR(item.amount)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#A8A29E', textTransform: 'capitalize' }}>
                    {item.type.replace('_', ' ')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. AI Insight Cards (Heads Up, Opportunity, Upcoming Pressure) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {insightCards.map(ins => (
          <div 
            key={ins.id}
            className="card"
            style={{
              padding: '18px',
              background: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #EFE8DF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{
                fontSize: '0.76rem',
                fontWeight: 800,
                color: ins.type === 'heads_up' ? '#EA580C' : (ins.type === 'opportunity' ? '#059669' : '#DC2626'),
                background: ins.type === 'heads_up' ? '#FEEEDD' : (ins.type === 'opportunity' ? '#ECFDF5' : '#FEF2F2'),
                padding: '3px 8px',
                borderRadius: '6px'
              }}>
                {ins.badge}
              </span>
            </div>
            <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#1C1917', margin: '0 0 4px 0' }}>
              {ins.title}
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#57534E', lineHeight: '1.45', margin: 0 }}>
              {ins.description}
            </p>
          </div>
        ))}
      </div>

      {/* 8. "Where Is My Money Going?" (Category Spending Breakdown) */}
      <div className="card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', marginBottom: '24px' }}>
        <div 
          onClick={() => setShowSpendingBreakdown(!showSpendingBreakdown)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1C1917', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={18} color="#EA580C" />
              <span>{t('where_money_going_title', '🧐 Where Is My Money Going?')}</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#78716C' }}>
              {t('where_money_going_sub', 'Breakdown of upcoming committed and projected variable outflow by category.')}
            </span>
          </div>

          <button style={{ background: 'transparent', border: 'none', color: '#78716C', cursor: 'pointer' }}>
            {showSpendingBreakdown ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {showSpendingBreakdown && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {spendingBreakdown.map(cat => (
                <div key={cat.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#1C1917' }}>{cat.category}</span>
                    <span style={{ fontWeight: 800, color: '#44403C' }}>
                      {formatINR(cat.amount)} <span style={{ color: '#78716C', fontWeight: 500 }}>({cat.percentage}%)</span>
                    </span>
                  </div>
                  <div style={{ height: '7px', background: '#F5EFE6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${cat.percentage}%`,
                      height: '100%',
                      background: cat.category === 'Food' ? '#F97316' : (cat.category === 'Rent/Hostel' ? '#6366F1' : (cat.category === 'Subscriptions' ? '#EC4899' : '#10B981'))
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
