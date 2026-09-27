import React, { useState } from 'react';
import { 
  Dna, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  Flame, 
  Lock, 
  Wallet,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { formatINR } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { readMyMoneyAI } from '../services/ai/paisaTwinExplainer.js';
import PaisaTwinRichSummary from './PaisaTwinRichSummary.jsx';

export default function PaisaTwinDashboardCard({
  twinModel,
  onNavigateToPaisaTwin
}) {
  const [isReadingMoney, setIsReadingMoney] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  if (!twinModel) return null;

  const {
    currentCash,
    confirmedIncome,
    protectedMoney,
    averageDailyBurn,
    safeDailySpend,
    nextFinancialPressure,
    outlookMilestones,
    healthMode,
    dailyBalances,
    safetyBuffer
  } = twinModel;

  const handleReadMyMoney = async () => {
    soundFX.playClick();
    setIsReadingMoney(true);
    setIsSummaryExpanded(true);
    try {
      const res = await readMyMoneyAI(twinModel.structuredAIContext);
      setAiSummary(res.text);
      soundFX.playSuccess();
    } catch {
      setAiSummary("Unable to enrich AI summary at this moment. Deterministic projection remains fully active.");
    } finally {
      setIsReadingMoney(false);
    }
  };

  // Generate lightweight SVG chart points for 30-day projection
  const balances = dailyBalances.map(d => d.closingBalance);
  const maxB = Math.max(...balances, safetyBuffer * 1.5, 10000);
  const minB = Math.min(...balances, 0);
  const range = maxB - minB || 1;

  const svgW = 600;
  const svgH = 120;
  const padX = 20;
  const padY = 20;

  const pts = dailyBalances.map((d, i) => {
    const x = padX + (i / Math.max(1, dailyBalances.length - 1)) * (svgW - padX * 2);
    const y = padY + (1 - (d.closingBalance - minB) / range) * (svgH - padY * 2);
    return `${x},${y}`;
  }).join(' ');

  const bufferY = padY + (1 - (safetyBuffer - minB) / range) * (svgH - padY * 2);

  return (
    <div className="card paisatwin-hero-card" style={{
      padding: '24px',
      marginBottom: '28px',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8F4 100%)',
      border: `2px solid ${healthMode.borderColor}`,
      borderRadius: '20px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Header: Badge, Title & Read My Money */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#FEEEDD',
              color: '#EA580C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Dna size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1C1917', margin: 0, letterSpacing: '-0.02em' }}>
                  Your PaisaTwin
                </h2>
                <span style={{
                  background: healthMode.badgeBg,
                  color: healthMode.badgeColor,
                  border: `1px solid ${healthMode.borderColor}`,
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '2px 10px',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>{healthMode.emoji}</span>
                  <span>{healthMode.label}</span>
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#78716C', margin: 0 }}>
                {healthMode.tagline}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleReadMyMoney}
            disabled={isReadingMoney}
            className="btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={15} />
            <span>{isReadingMoney ? 'Reading Money...' : '✨ Read My Money'}</span>
          </button>

          {onNavigateToPaisaTwin && (
            <button
              onClick={() => {
                soundFX.playClick();
                onNavigateToPaisaTwin();
              }}
              className="btn-secondary"
              style={{
                padding: '8px 14px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Explore Twin</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* AI "Read My Money" Expanded Drawer */}
      {isSummaryExpanded && aiSummary && (
        <div style={{
          marginBottom: '20px',
          animation: 'fadeIn 0.25s ease-in-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} />
              <span>PaisaTwin Financial AI Interpretation & Solutions</span>
            </span>
            <button
              onClick={() => setIsSummaryExpanded(false)}
              style={{ background: 'transparent', border: 'none', color: '#A8A29E', cursor: 'pointer', padding: '2px' }}
            >
              <ChevronUp size={16} />
            </button>
          </div>
          <PaisaTwinRichSummary
            summaryText={aiSummary}
            twinModel={twinModel}
            onNavigateToScenarios={onNavigateToPaisaTwin}
            onNavigateToGuardianChat={onNavigateToPaisaTwin}
          />
        </div>
      )}

      {/* Current Financial State (6 Key Metrics) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {/* 1. Available Cash */}
        <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #EFE8DF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#78716C', marginBottom: '4px' }}>
            <Wallet size={14} color="#EA580C" />
            <span>Available Cash</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1C1917' }}>
            {formatINR(currentCash)}
          </div>
        </div>

        {/* 2. Confirmed Incoming */}
        <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #EFE8DF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#78716C', marginBottom: '4px' }}>
            <TrendingUp size={14} color="#10B981" />
            <span>Confirmed Inflow</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10B981' }}>
            +{formatINR(confirmedIncome)}
          </div>
        </div>

        {/* 3. Protected Money */}
        <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #EFE8DF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#78716C', marginBottom: '4px' }}>
            <Lock size={14} color="#F97316" />
            <span>Protected Money</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#44403C' }}>
            {formatINR(protectedMoney)}
          </div>
        </div>

        {/* 4. Average Daily Burn */}
        <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #EFE8DF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#78716C', marginBottom: '4px' }}>
            <Flame size={14} color="#EF4444" />
            <span>Avg Daily Burn</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#DC2626' }}>
            {formatINR(averageDailyBurn)}<span style={{ fontSize: '0.72rem', color: '#78716C' }}>/day</span>
          </div>
        </div>

        {/* 5. Safe-to-Spend */}
        <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #EFE8DF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#78716C', marginBottom: '4px' }}>
            <ShieldCheck size={14} color="#10B981" />
            <span>Safe-to-Spend</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669' }}>
            {formatINR(safeDailySpend)}<span style={{ fontSize: '0.72rem', color: '#78716C' }}>/day</span>
          </div>
        </div>

        {/* 6. Next Financial Pressure */}
        <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #EFE8DF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#78716C', marginBottom: '4px' }}>
            <Calendar size={14} color="#6366F1" />
            <span>Next Pressure</span>
          </div>
          {nextFinancialPressure ? (
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1C1917', lineHeight: '1.2' }}>
              {nextFinancialPressure.title} <span style={{ color: '#EA580C' }}>{formatINR(nextFinancialPressure.amount)}</span>
              <div style={{ fontSize: '0.7rem', color: '#78716C', fontWeight: 500 }}>in {nextFinancialPressure.daysAway} days</div>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 700 }}>
              No critical bills due
            </div>
          )}
        </div>
      </div>

      {/* 30-Day Outlook Projection Curve & Milestones */}
      <div style={{
        background: '#FAF8F4',
        borderRadius: '14px',
        padding: '16px 20px',
        border: '1px solid #EFE8DF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#44403C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            📈 30-Day Cashflow Outlook (Actual Deterministic Projection)
          </span>
          <span style={{ fontSize: '0.76rem', color: '#78716C' }}>
            Emergency Buffer: <strong>{formatINR(safetyBuffer)}</strong>
          </span>
        </div>

        {/* SVG Curve */}
        <div style={{ width: '100%', height: '80px', marginBottom: '12px' }}>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Safety buffer line */}
            <line
              x1={padX}
              y1={bufferY}
              x2={svgW - padX}
              y2={bufferY}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
            {/* Balance curve */}
            <polyline
              fill="none"
              stroke={healthMode.badgeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pts}
            />
          </svg>
        </div>

        {/* Milestone Pills */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '8px',
          textAlign: 'center'
        }}>
          {outlookMilestones.map(m => (
            <div key={m.label} style={{
              background: '#FFFFFF',
              padding: '6px 4px',
              borderRadius: '8px',
              border: '1px solid #EFE8DF'
            }}>
              <div style={{ fontSize: '0.7rem', color: '#A8A29E', fontWeight: 600 }}>{m.label}</div>
              <div style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                color: m.balance < safetyBuffer ? '#EF4444' : '#1C1917'
              }}>
                {formatINR(m.balance)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
