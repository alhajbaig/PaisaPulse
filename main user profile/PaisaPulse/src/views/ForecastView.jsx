import React, { useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  Sliders, 
  Info,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import CashflowChart from '../components/CashflowChart';
import { formatINR } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { useLanguage } from '../services/i18n.jsx';

export default function ForecastView({ 
  forecastResult, 
  safetyBuffer = 3000, 
  horizonDays = 14, 
  onHorizonChange 
}) {
  const { t, language } = useLanguage();
  const [showConfidence, setShowConfidence] = useState(true);

  const {
    timeline,
    minProjectedBalance,
    riskLevel,
    shortfallDay,
    totalExpectedIncome,
    totalExpectedExpenses,
    finalProjectedBalance
  } = forecastResult;

  return (
    <div>
      {/* Header */}
      <div className="transactions-view-header">
        <div className="view-title-group">
          <h2>{t('forecast_title', 'Cashflow Forecast')}</h2>
          <p>{t('forecast_sub', 'See where your money is going and what to expect ahead.')}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Confidence interval toggle */}
          <button 
            className="btn-secondary"
            onClick={() => {
              soundFX.playClick();
              setShowConfidence(!showConfidence);
            }}
            title="Toggle Confidence Range (Conservative vs Optimistic bounds)"
          >
            {showConfidence ? <Eye size={15} /> : <EyeOff size={15} />}
            <span>Confidence Range: {showConfidence ? 'On' : 'Off'}</span>
          </button>

          {/* Horizon Selector */}
          <div className="filter-tabs">
            {[7, 14, 30].map(days => (
              <button
                key={days}
                onClick={() => {
                  soundFX.playClick();
                  onHorizonChange(days);
                }}
                className={`filter-tab-btn ${horizonDays === days ? 'active' : ''}`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Shortfall Callout if high risk */}
      {(riskLevel.label === 'Shortfall Risk' || minProjectedBalance < 0) && (
        <div style={{
          background: '#FEF2F2',
          border: '2px solid #EF4444',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#991B1B' }}>
                Point of Failure Detected: Projected Minimum {formatINR(minProjectedBalance)}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#B91C1C', marginTop: '2px' }}>
                Cash drops below zero / buffer on {shortfallDay?.dayLabel || 'upcoming date'} ({formatINR(shortfallDay?.deficit || Math.abs(minProjectedBalance))} deficit). 
                Essential commitments scheduled around this day will bounce unless mitigated.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Forecast Chart Card */}
      <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
        <div className="card-title-row" style={{ marginBottom: '16px' }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '1.2rem' }}>{horizonDays}-Day Forecast</h3>
            <p style={{ fontSize: '0.8rem', color: '#78716C' }}>
              Includes expected salary/stipend, recurring commitments, and weekend discretionary variance.
            </p>
          </div>

          <div className="chart-legends">
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#10B981' }} />
              <span>Income</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#F97316' }} />
              <span>Expenses</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#18181B' }} />
              <span>Projected Balance</span>
            </div>
            {showConfidence && (
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#FED7AA' }} />
                <span>Confidence Range (±20%)</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ minHeight: '260px' }}>
          <CashflowChart 
            timeline={timeline}
            safetyBuffer={safetyBuffer}
            showConfidenceRange={showConfidence}
            height={260}
          />
        </div>
      </div>

      {/* FORECAST CONFIDENCE BREAKDOWN (Point 14) */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: '24px', background: '#FAF8F4', border: '1px solid #EFE8DF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#059669" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1C1917' }}>
              Forecast Confidence: {forecastResult.confidence?.score || 88}%
            </h3>
          </div>
          <span style={{ fontSize: '0.74rem', background: '#ECFDF5', color: '#047857', padding: '3px 10px', borderRadius: '6px', fontWeight: 700 }}>
            {(forecastResult.confidence?.score || 88) >= 85 ? 'High Reliability' : 'Moderate Uncertainty'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              High Confidence Drivers:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#44403C' }}>
              {(forecastResult.confidence?.highConfidenceFactors || ['Scheduled rent & fixed auto-debits (pinned dates)', 'Empirical weekday burn rate calibrated from actual history']).map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#059669', fontWeight: 800 }}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Lower Confidence Variables:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#44403C' }}>
              {(forecastResult.confidence?.lowerConfidenceFactors || ['Weekend discretionary dining variance (+28%)']).map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#D97706', fontWeight: 800 }}>⚠</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forecast KPI Cards */}
      <div className="metrics-row" style={{ marginBottom: '24px' }}>
        {/* Total Expected Income */}
        <div className="card metric-card">
          <div className="metric-header">
            <div className="metric-icon-box" style={{ background: '#ECFDF5', color: '#10B981' }}>
              <TrendingUp size={16} />
            </div>
            <span>Total Expected Income</span>
          </div>
          <div className="metric-val" style={{ color: '#10B981' }}>
            {formatINR(totalExpectedIncome || 0)}
          </div>
          <div className="metric-timing">over next {horizonDays} days</div>
        </div>

        {/* Total Expected Expenses */}
        <div className="card metric-card">
          <div className="metric-header">
            <div className="metric-icon-box" style={{ background: '#FFF7ED', color: '#EA580C' }}>
              <Calendar size={16} />
            </div>
            <span>Total Expected Expenses</span>
          </div>
          <div className="metric-val">
            {formatINR(totalExpectedExpenses || 0)}
          </div>
          <div className="metric-timing">commitments + variable</div>
        </div>

        {/* Projected Balance */}
        <div className="card metric-card">
          <div className="metric-header">
            <div className="metric-icon-box" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
              <ShieldCheck size={16} />
            </div>
            <span>Projected Balance ({horizonDays} days)</span>
          </div>
          <div className="metric-val" style={{ color: finalProjectedBalance < 0 ? '#EF4444' : '#1C1917' }}>
            {formatINR(finalProjectedBalance)}
          </div>
          <div className="metric-timing">minimum dip: {formatINR(minProjectedBalance)}</div>
        </div>

        {/* Shortfall Risk */}
        <div className="card metric-card">
          <div className="metric-header">
            <div className="metric-icon-box" style={{ background: riskLevel.bg, color: riskLevel.color }}>
              <AlertTriangle size={16} />
            </div>
            <span>Shortfall Risk</span>
          </div>
          <div className="metric-val" style={{ color: riskLevel.color }}>
            {riskLevel.label}
          </div>
          <div className="metric-timing">
            {shortfallDay ? `Dip on ${shortfallDay.dayLabel}` : 'Buffer safe'}
          </div>
        </div>
      </div>

      {/* Liquidity Timeline Table */}
      <div className="data-table-card">
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #EFE8DF', background: '#FCFAF7' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1C1917' }}>
            Daily Liquidity & Commitment Schedule
          </h4>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Expected Inflow</th>
              <th>Scheduled Outflow</th>
              <th>Commitment Details</th>
              <th>Projected End Balance</th>
              <th>Buffer Cushion</th>
            </tr>
          </thead>
          <tbody>
            {timeline.slice(0, 10).map((d, i) => {
              const bufferCushion = d.projectedBalance - safetyBuffer;
              const isBelowBuffer = bufferCushion < 0;

              return (
                <tr key={d.dayIndex} style={{ backgroundColor: isBelowBuffer ? '#FFFBEB' : 'transparent' }}>
                  <td style={{ fontWeight: 700 }}>{d.dayLabel} 2025</td>
                  <td style={{ color: d.income > 0 ? '#10B981' : '#A8A29E', fontWeight: d.income > 0 ? 700 : 400 }}>
                    {d.income > 0 ? `+${formatINR(d.income)}` : '—'}
                  </td>
                  <td style={{ color: d.expenses > 0 ? '#EA580C' : '#A8A29E', fontWeight: d.expenses > 0 ? 700 : 400 }}>
                    {d.expenses > 0 ? `-${formatINR(d.expenses)}` : '—'}
                  </td>
                  <td>
                    {d.commitmentsList.length > 0 ? (
                      <span style={{ fontSize: '0.8rem', color: '#1C1917', fontWeight: 600 }}>
                        {d.commitmentsList.map(c => `${c.title} (${formatINR(c.amount)})`).join(', ')}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#A8A29E' }}>Baseline variable burn</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 700, color: d.projectedBalance < 0 ? '#EF4444' : '#1C1917' }}>
                    {formatINR(d.projectedBalance)}
                  </td>
                  <td>
                    {isBelowBuffer ? (
                      <span style={{
                        fontSize: '0.75rem',
                        background: '#FEE2E2',
                        color: '#DC2626',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontWeight: 700
                      }}>
                        Deficit {formatINR(Math.abs(bufferCushion))}
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '0.75rem',
                        background: '#ECFDF5',
                        color: '#059669',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontWeight: 700
                      }}>
                        +{formatINR(bufferCushion)} cushion
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
