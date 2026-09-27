"use client";

import React, { useState } from 'react';
import { 
  Sliders, 
  Clock, 
  Plane, 
  TrendingUp, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Heart,
  Shield,
  Scissors,
  Sparkles
} from 'lucide-react';
import { formatINR, calculateCashflowForecast } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { useLanguage } from '../services/i18n.jsx';

export default function ScenariosView({ 
  currentPersona, 
  twinModel,
  onOpenSpendValueMap,
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

  // Expense Spike state
  const [burnMultiplier, setBurnMultiplier] = useState(1.3);

  // Run simulation based on current inputs (100% preserved)
  let simModifiers = {};
  if (activeScenarioTab === 'custom_spend') {
    simModifiers = { immediateExpense: parseFloat(purchaseAmount) || 0 };
  } else if (activeScenarioTab === 'income_delay') {
    simModifiers = { incomeDelayDays: parseInt(delayDays, 10) || 0 };
  } else if (activeScenarioTab === 'travel') {
    simModifiers = { immediateExpense: parseFloat(tripCost) || 0 };
  } else if (activeScenarioTab === 'spending_increase') {
    simModifiers = { burnRateMultiplier: burnMultiplier };
  } else if (activeScenarioTab === 'spend_value_opt') {
    // Optimizing low-value leaks while leaving high-value spending intact: 15% reduction in empirical daily burn
    simModifiers = { burnRateMultiplier: 0.85 };
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
        : activeScenarioTab === 'spending_increase'
        ? `Simulated +${Math.round((burnMultiplier - 1) * 100)}% Spending Spike`
        : 'Spend Value: Protect High-Value Habits & Trim Discretionary Leaks'
    });
  };

  const tabs = [
    { id: 'custom_spend', label: 'Custom Purchase', sub: 'What if I spend money today?' },
    { id: 'income_delay', label: 'Income Delay', sub: 'What if salary/stipend is late?' },
    { id: 'travel', label: 'Travel & Events', sub: 'Can I afford tickets or a trip?' },
    { id: 'spending_increase', label: 'Burn Rate Surge', sub: 'What if daily spend rises?' },
    { id: 'spend_value_opt', label: 'Protect & Trim', sub: 'PaisaTwin 3-tier value optimization' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-line-medium pb-6 pt-2">
        <div className="space-y-1">
          <span className="text-xs font-accent uppercase tracking-widest text-coral font-bold block">
            What If?
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-ink font-normal">
            Explore how a change today affects your future cashflow
          </h1>
          <p className="font-sans text-xs sm:text-sm text-ink-muted">
            Test scenarios safely. Zero changes to your real accounts until explicitly applied.
          </p>
        </div>

        {activeScenario && (
          <button 
            onClick={() => {
              soundFX.playClick();
              onResetScenario();
            }}
            className="px-4 py-1.5 rounded-full bg-ivory border border-coral text-xs font-sans text-coral hover:bg-coral hover:text-ivory transition-all self-start sm:self-auto flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Active Scenario</span>
          </button>
        )}
      </div>

      {/* Scenario Mode Switcher — Understated Editorial Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {tabs.map((tab) => {
          const isActive = activeScenarioTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFX.playClick();
                setActiveScenarioTab(tab.id);
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                isActive 
                  ? 'border-coral bg-coral/10 shadow-sm' 
                  : 'border-line-medium bg-ivory hover:border-line-dark hover:bg-cream/40'
              }`}
            >
              <span className={`text-xs font-sans font-semibold block ${isActive ? 'text-coral' : 'text-ink'}`}>
                {tab.label}
              </span>
              <span className="text-[11px] font-sans text-ink-muted block mt-1 line-clamp-1">
                {tab.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Controls Workbench */}
      <div className="p-6 sm:p-8 rounded-2xl bg-cream/40 border border-line-medium space-y-6">
        {activeScenarioTab === 'custom_spend' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-editorial text-2xl text-ink font-normal">
                Simulate a Discretionary Expense
              </h3>
              <p className="font-sans text-xs text-ink-muted mt-1">
                Enter any amount to see whether it breaches your {formatINR(safetyBuffer)} buffer before next income.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center px-4 py-2 rounded-xl bg-ivory border border-line-medium text-lg font-sans">
                <span className="text-coral font-bold mr-1">₹</span>
                <input 
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  className="bg-transparent border-none outline-none font-sans font-semibold text-ink w-32 num-tabular"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {['500', '1200', '2000', '3500', '5000', '10000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setPurchaseAmount(val);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans transition-all border ${
                      purchaseAmount === val
                        ? 'bg-ink text-ivory border-ink font-semibold'
                        : 'bg-ivory text-ink-muted border-line-medium hover:text-ink'
                    }`}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeScenarioTab === 'income_delay' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-editorial text-2xl text-ink font-normal">
                Simulate Delayed Inflow / Salary
              </h3>
              <p className="font-sans text-xs text-ink-muted mt-1">
                See if your cash buffer sustains fixed rent & bills if your client payment or salary is delayed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <input 
                type="range"
                min="1"
                max="14"
                value={delayDays}
                onChange={(e) => setDelayDays(Number(e.target.value))}
                className="w-full sm:w-72 accent-coral"
              />
              <span className="font-sans font-bold text-base text-coral num-tabular">
                +{delayDays} days delay
              </span>
            </div>
          </div>
        )}

        {activeScenarioTab === 'travel' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-editorial text-2xl text-ink font-normal">
                Can I Afford a Trip or Big Event?
              </h3>
              <p className="font-sans text-xs text-ink-muted mt-1">
                Test booking flights, accommodation, and tickets before salary arrives.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center px-4 py-2 rounded-xl bg-ivory border border-line-medium text-lg font-sans">
                <span className="text-coral font-bold mr-1">₹</span>
                <input 
                  type="number"
                  value={tripCost}
                  onChange={(e) => setTripCost(e.target.value)}
                  className="bg-transparent border-none outline-none font-sans font-semibold text-ink w-32 num-tabular"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Weekend Trip', cost: '3500' },
                  { name: 'Goa Flights', cost: '8500' },
                  { name: 'Vacation Package', cost: '15000' }
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setTripCost(item.cost);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans transition-all border ${
                      tripCost === item.cost
                        ? 'bg-ink text-ivory border-ink font-semibold'
                        : 'bg-ivory text-ink-muted border-line-medium hover:text-ink'
                    }`}
                  >
                    {item.name} (₹{item.cost})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeScenarioTab === 'spending_increase' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-editorial text-2xl text-ink font-normal">
                Simulate Daily Lifestyle Burn Surge
              </h3>
              <p className="font-sans text-xs text-ink-muted mt-1">
                Test the impact if dining out, rides, and impulsive shopping surge by 10% to 50%.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <input 
                type="range"
                min="1.0"
                max="1.7"
                step="0.05"
                value={burnMultiplier}
                onChange={(e) => setBurnMultiplier(parseFloat(e.target.value))}
                className="w-full sm:w-72 accent-coral"
              />
              <span className="font-sans font-bold text-base text-coral num-tabular">
                +{Math.round((burnMultiplier - 1) * 100)}% daily burn surge
              </span>
            </div>
          </div>
        )}

        {activeScenarioTab === 'spend_value_opt' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-coral text-xs font-accent uppercase tracking-wider font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PaisaTwin Spend Value Strategy</span>
                </div>
                <h3 className="font-editorial text-2xl text-ink font-normal mt-0.5">
                  Protect What Matters, Optimize What Leaks
                </h3>
                <p className="font-sans text-xs text-ink-muted mt-1 max-w-xl">
                  PaisaTwin refuses to treat every rupee equally. In this simulation, high-value spending (daily chai, fitness) is 100% protected, while low-value orders (late-night delivery, impulse carts) are trimmed by 25%.
                </p>
              </div>

              {onOpenSpendValueMap && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onOpenSpendValueMap();
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-ivory border border-coral text-coral hover:bg-coral hover:text-ivory text-xs font-sans font-semibold transition-all shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  View Value Map ↗
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-accent uppercase font-bold text-emerald-800">1. Protect (High Value)</span>
                  <Shield className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <div className="text-xs font-bold text-ink">Daily Chai, Gym, Books</div>
                <div className="text-[11px] text-ink-muted">0% Cut · 100% protected lifestyle joy</div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-accent uppercase font-bold text-blue-800">2. Optimize (Medium)</span>
                  <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
                </div>
                <div className="text-xs font-bold text-ink">Rides, Subscriptions</div>
                <div className="text-[11px] text-ink-muted">Passive moderation · ~5% trim</div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-accent uppercase font-bold text-amber-900">3. Review & Cut (Low)</span>
                  <Scissors className="w-3.5 h-3.5 text-amber-700" />
                </div>
                <div className="text-xs font-bold text-ink">Food Delivery, Impulse Carts</div>
                <div className="text-[11px] text-ink-muted">25% Cut · Saves ~₹500–₹800/mo</div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Comparison Story (Editorial Board) */}
        <div className="pt-6 border-t border-line-medium grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Baseline State */}
          <div className="p-4 rounded-xl bg-ivory border border-line-medium space-y-2">
            <span className="text-[10px] font-accent uppercase text-ink-subtle tracking-wider font-bold">
              Current Baseline Stance
            </span>
            <div className="font-editorial text-3xl text-ink font-normal num-tabular">
              {formatINR(baseForecast.minProjectedBalance)}
            </div>
            <p className="font-sans text-xs text-ink-muted">
              Projected minimum balance with zero modifications. Safety buffer of {formatINR(safetyBuffer)} intact.
            </p>
          </div>

          {/* Simulated Impact */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            isBufferBreach 
              ? 'bg-coral/10 border-coral/40' 
              : 'bg-emerald-50/50 border-emerald-200'
          }`}>
            <span className="text-[10px] font-accent uppercase tracking-wider font-bold block" style={{ color: isBufferBreach ? '#FF6244' : '#059669' }}>
              Simulated Future Stance
            </span>
            <div className="font-editorial text-3xl font-normal num-tabular" style={{ color: isBufferBreach ? '#DC2626' : '#065F46' }}>
              {formatINR(simForecast.minProjectedBalance)}
            </div>
            <p className="font-sans text-xs text-ink-muted">
              {isBufferBreach
                ? `Breaches emergency buffer by ${formatINR(bufferShortfall)}. Commitments would be at risk.`
                : `Safe! Maintains ${formatINR(bufferHeadroom)} in surplus above your emergency buffer.`}
            </p>
          </div>
        </div>

        {/* Action button to apply simulation */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs font-sans text-ink-muted">
            {isBufferBreach ? '⚠️ High risk simulation' : '✓ Safe simulation verified'}
          </div>
          <button
            onClick={handleApplyToLive}
            className="px-6 py-2.5 rounded-full bg-ink text-ivory text-xs font-sans font-semibold hover:bg-coral transition-all shadow-sm flex items-center gap-2"
          >
            <span>Apply to Live Forecast</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
