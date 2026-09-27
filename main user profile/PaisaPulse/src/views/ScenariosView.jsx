import React, { useState } from 'react';
import { 
  Sliders, 
  Clock, 
  Plane, 
  TrendingUp, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { formatINR, calculateCashflowForecast } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { useLanguage } from '../services/i18n.jsx';

export default function ScenariosView({ 
  currentPersona, 
  onApplyScenario, 
  onResetScenario,
  activeScenario 
}) {
  const { t, language } = useLanguage();
  const [activeScenarioTab, setActiveScenarioTab] = useState('custom_spend');
  
  // Custom Spend state
  const [purchaseAmount, setPurchaseAmount] = useState('2000');
  
  // Income Delay state
  const [delayDays, setDelayDays] = useState(5);

  // Travel Plan state
  const [tripCost, setTripCost] = useState('8500');
  const [tripDaysAway, setTripDaysAway] = useState(6);

  // Expense Spike state
  const [burnMultiplier, setBurnMultiplier] = useState(1.3);

  // Run simulation based on current inputs
  let simModifiers = {};
  if (activeScenarioTab === 'custom_spend') {
    simModifiers = { immediateExpense: parseFloat(purchaseAmount) || 0 };
  } else if (activeScenarioTab === 'income_delay') {
    simModifiers = { incomeDelayDays: parseInt(delayDays, 10) || 0 };
  } else if (activeScenarioTab === 'travel') {
    simModifiers = { immediateExpense: parseFloat(tripCost) || 0 };
  } else if (activeScenarioTab === 'spending_increase') {
    simModifiers = { burnRateMultiplier: burnMultiplier };
  }

  // Base state forecast
  const baseForecast = calculateCashflowForecast({
    currentBalance: currentPersona.currentBalance,
    upcomingIncome: currentPersona.upcomingIncome,
    upcomingCommitments: currentPersona.upcomingCommitments,
    burnRateDaily: currentPersona.burnRateDaily,
    safetyBuffer: currentPersona.safetyBuffer,
    horizonDays: 14
  });

  // Simulated state forecast
  const simForecast = calculateCashflowForecast({
    currentBalance: currentPersona.currentBalance,
    upcomingIncome: currentPersona.upcomingIncome,
    upcomingCommitments: currentPersona.upcomingCommitments,
    burnRateDaily: currentPersona.burnRateDaily,
    safetyBuffer: currentPersona.safetyBuffer,
    horizonDays: 14,
    scenarioModifiers: simModifiers
  });

  const safetyBuffer = currentPersona.safetyBuffer || 3000;
  const isBufferBreach = simForecast.minProjectedBalance < safetyBuffer;
  const bufferShortfall = isBufferBreach ? safetyBuffer - simForecast.minProjectedBalance : 0;
  const bufferHeadroom = simForecast.minProjectedBalance >= safetyBuffer ? simForecast.minProjectedBalance - safetyBuffer : 0;
  const lowestDay = (simForecast.dailyBalances || []).reduce((prev, curr) => 
    (!prev || curr.closingBalance < prev.closingBalance ? curr : prev)
  , null) || { date: 'upcoming days', closingBalance: simForecast.minProjectedBalance };

  const handleRunSim = () => {
    soundFX.playClick();
    if (simForecast.riskLevel.label === 'Shortfall Risk') {
      soundFX.playWarning();
    } else {
      soundFX.playSuccess();
    }
  };

  const handleApplyToLive = () => {
    soundFX.playSuccess();
    onApplyScenario({
      tab: activeScenarioTab,
      modifiers: simModifiers,
      label: activeScenarioTab === 'custom_spend' 
        ? `Simulated Purchase of ${formatINR(purchaseAmount)}`
        : activeScenarioTab === 'income_delay'
        ? `Simulated ${delayDays}-day Stipend Delay`
        : activeScenarioTab === 'travel'
        ? `Simulated Trip of ${formatINR(tripCost)}`
        : `Simulated +${Math.round((burnMultiplier - 1) * 100)}% Spending Spike`
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="transactions-view-header">
        <div className="view-title-group">
          <h2>{t('scenarios_title', 'What-If Scenarios')}</h2>
          <p>{t('scenarios_sub', 'See how different decisions could impact your financial future.')}</p>
        </div>

        {activeScenario && (
          <button 
            className="btn-secondary"
            onClick={() => {
              soundFX.playClick();
              onResetScenario();
            }}
          >
            <RotateCcw size={15} />
            <span>Reset Active Simulation</span>
          </button>
        )}
      </div>

      {/* 4 Scenario Selector Cards (matching screenshot 4) */}
      <div className="scenario-selector-grid">
        {/* Tab 1 */}
        <div 
          className={`scenario-option-card ${activeScenarioTab === 'custom_spend' ? 'active' : ''}`}
          onClick={() => {
            soundFX.playClick();
            setActiveScenarioTab('custom_spend');
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sliders size={18} color="#EA580C" />
            <div className="scenario-option-title">Custom Spend</div>
          </div>
          <div className="scenario-option-sub">What if I spend a specific amount?</div>
        </div>

        {/* Tab 2 */}
        <div 
          className={`scenario-option-card ${activeScenarioTab === 'income_delay' ? 'active' : ''}`}
          onClick={() => {
            soundFX.playClick();
            setActiveScenarioTab('income_delay');
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Clock size={18} color="#EA580C" />
            <div className="scenario-option-title">Income Delay</div>
          </div>
          <div className="scenario-option-sub">What if my income is delayed?</div>
        </div>

        {/* Tab 3 */}
        <div 
          className={`scenario-option-card ${activeScenarioTab === 'travel' ? 'active' : ''}`}
          onClick={() => {
            soundFX.playClick();
            setActiveScenarioTab('travel');
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Plane size={18} color="#EA580C" />
            <div className="scenario-option-title">Travel Plan</div>
          </div>
          <div className="scenario-option-sub">Can I afford a trip next month?</div>
        </div>

        {/* Tab 4 */}
        <div 
          className={`scenario-option-card ${activeScenarioTab === 'spending_increase' ? 'active' : ''}`}
          onClick={() => {
            soundFX.playClick();
            setActiveScenarioTab('spending_increase');
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingUp size={18} color="#EA580C" />
            <div className="scenario-option-title">Increase in Spending</div>
          </div>
          <div className="scenario-option-sub">What if my expenses increase?</div>
        </div>
      </div>

      {/* Simulation Workbench Card */}
      <div className="simulation-workbench">
        {/* Dynamic Controls based on selected scenario */}
        {activeScenarioTab === 'custom_spend' && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1C1917' }}>
              Simulate a Purchase
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#78716C', marginBottom: '14px' }}>
              Enter an amount to see how it affects your financial state.
            </p>

            <div className="sim-input-row">
              <div className="sim-currency-input">
                <span className="sim-currency-symbol">₹</span>
                <input 
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder="2000"
                />
              </div>

              {/* Quick chips */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {['500', '1200', '2000', '3500', '5000'].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setPurchaseAmount(val);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: purchaseAmount === val ? '#18181B' : '#F5EFE6',
                      color: purchaseAmount === val ? '#FFF' : '#44403C',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>

              <button 
                className="btn-primary"
                onClick={handleRunSim}
                style={{ marginLeft: 'auto' }}
              >
                Run Simulation
              </button>
            </div>
          </div>
        )}

        {activeScenarioTab === 'income_delay' && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1C1917' }}>
              Simulate Stipend / Salary Delay
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#78716C', marginBottom: '16px' }}>
              See if your buffer can sustain recurring rent and bills if your next income is delayed.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <input 
                type="range"
                min="1"
                max="14"
                value={delayDays}
                onChange={(e) => setDelayDays(e.target.value)}
                style={{ width: '320px', accentColor: '#EA580C' }}
              />
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#EA580C' }}>
                +{delayDays} days delay
              </span>

              <button 
                className="btn-primary"
                onClick={handleRunSim}
                style={{ marginLeft: 'auto' }}
              >
                Simulate Delay
              </button>
            </div>
          </div>
        )}

        {activeScenarioTab === 'travel' && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1C1917' }}>
              Can I Afford a Trip / Vacation?
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#78716C', marginBottom: '16px' }}>
              Test booking flight/train tickets and hotel packages before your next salary credit.
            </p>

            <div className="sim-input-row">
              <div className="sim-currency-input">
                <span className="sim-currency-symbol">₹</span>
                <input 
                  type="number"
                  value={tripCost}
                  onChange={(e) => setTripCost(e.target.value)}
                  placeholder="8500"
                />
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {['Goa (₹8,500)', 'Manali (₹12,000)', 'Weekend Trek (₹3,200)'].map(pkg => (
                  <button
                    key={pkg}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      const num = pkg.match(/\d+/g)?.[0] || '8500';
                      setTripCost(num);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: '#F5EFE6',
                      color: '#44403C',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    {pkg}
                  </button>
                ))}
              </div>

              <button 
                className="btn-primary"
                onClick={handleRunSim}
                style={{ marginLeft: 'auto' }}
              >
                Check Feasibility
              </button>
            </div>
          </div>
        )}

        {activeScenarioTab === 'spending_increase' && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1C1917' }}>
              Simulate Variable Lifestyle Spend Increase
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#78716C', marginBottom: '16px' }}>
              Test if daily food delivery, shopping, or partying spikes by 10% to 50%.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <input 
                type="range"
                min="1.0"
                max="1.7"
                step="0.05"
                value={burnMultiplier}
                onChange={(e) => setBurnMultiplier(parseFloat(e.target.value))}
                style={{ width: '320px', accentColor: '#EA580C' }}
              />
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#EA580C' }}>
                +{Math.round((burnMultiplier - 1) * 100)}% Increase in Daily Burn
              </span>

              <button 
                className="btn-primary"
                onClick={handleRunSim}
                style={{ marginLeft: 'auto' }}
              >
                Run Burn Analysis
              </button>
            </div>
          </div>
        )}

        {/* Comparison Section (Current State ➔ With Simulation) */}
        <div className="sim-results-box">
          {/* Current state */}
          <div className="sim-state-col">
            <h4>Current State</h4>
            <div className="sim-balance-val" style={{ color: '#1C1917' }}>
              {formatINR(baseForecast.minProjectedBalance)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', marginTop: '4px' }}>
              <span style={{ color: '#78716C' }}>Safety Buffer: {formatINR(safetyBuffer)}</span>
              <span style={{
                background: baseForecast.riskLevel.bg,
                color: baseForecast.riskLevel.color,
                padding: '2px 8px',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '0.74rem'
              }}>
                {baseForecast.riskLevel.label}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ArrowRight size={28} color="#EA580C" />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', marginTop: '2px' }}>
              Impact
            </span>
          </div>

          {/* With Simulated Purchase */}
          <div className="sim-state-col">
            <h4>With Simulated Decision</h4>
            <div className="sim-balance-val" style={{ color: simForecast.minProjectedBalance < 0 ? '#EF4444' : (isBufferBreach ? '#F59E0B' : '#10B981') }}>
              {formatINR(simForecast.minProjectedBalance)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', marginTop: '4px' }}>
              <span style={{
                background: isBufferBreach ? '#FEF2F2' : '#ECFDF5',
                color: isBufferBreach ? '#DC2626' : '#059669',
                padding: '2px 8px',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: '0.74rem'
              }}>
                {isBufferBreach ? `BUFFER BREACH (-${formatINR(bufferShortfall)})` : `BUFFER INTACT (+${formatINR(bufferHeadroom)})`}
              </span>
            </div>
          </div>
        </div>

        {/* AI Guardian Explanation Banner */}
        <div className="sim-warning-banner" style={{
          background: isBufferBreach ? '#FEF2F2' : '#F0FDF4',
          borderColor: isBufferBreach ? '#FECACA' : '#BBF7D0'
        }}>
          <AlertTriangle size={20} color={isBufferBreach ? '#DC2626' : '#059669'} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', marginBottom: '4px', color: isBufferBreach ? '#991B1B' : '#166534', fontSize: '0.95rem' }}>
              {isBufferBreach
                ? `Future Liquidity Risk on ${lowestDay.date}: Buffer Breached by ${formatINR(bufferShortfall)}`
                : `Safe Liquidity Maintained: ${formatINR(bufferHeadroom)} Above Emergency Buffer`}
            </strong>
            <p style={{ margin: 0, fontSize: '0.84rem', color: isBufferBreach ? '#7F1D1D' : '#14532D', lineHeight: '1.45' }}>
              {isBufferBreach ? (
                <>
                  This purchase is affordable from today's available cash (<strong>{formatINR(currentPersona.currentBalance)}</strong>), 
                  but it causes a future liquidity problem on <strong>{lowestDay.date}</strong> when mandatory rent and commitment bills arrive, 
                  pulling your projected balance down to <strong>{formatINR(simForecast.minProjectedBalance)}</strong> ({formatINR(bufferShortfall)} below your protected {formatINR(safetyBuffer)} safety cushion).
                </>
              ) : (
                <>
                  Your cashflow can comfortably absorb this decision. Lowest projected balance reaches <strong>{formatINR(simForecast.minProjectedBalance)}</strong> on {lowestDay.date}, leaving a healthy <strong>{formatINR(bufferHeadroom)} cushion</strong> above your protected {formatINR(safetyBuffer)} buffer.
                </>
              )}
            </p>
          </div>
        </div>

        {/* One click apply to live forecast */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button 
            className="btn-primary"
            onClick={handleApplyToLive}
          >
            <CheckCircle2 size={16} />
            <span>Apply This Scenario to My Live Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
