import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Play, 
  Pause, 
  ShieldCheck, 
  AlertTriangle, 
  Lightbulb, 
  Cpu, 
  BrainCircuit, 
  ArrowRight,
  Sparkles,
  Zap,
  ShieldAlert,
  Coins,
  Compass,
  Layers,
  Flame,
  Award
} from 'lucide-react';
import { formatINR } from '../engine/cashflowEngine';
import { soundFX } from '../engine/audioEffects';

export function getDynamicDemoSteps(user, balance, safeToSpend, incomeList, commitmentsList, buffer) {
  const userName = user?.name || 'Raj';
  const firstName = userName.split(' ')[0] || 'Raj';
  const currentBal = typeof balance === 'number' ? balance : 12480;
  const safeToday = safeToSpend?.safeToSpendToday || 640;
  const safetyBuf = buffer || user?.safetyBuffer || 3000;
  const primaryIncome = incomeList?.[0] || { title: 'Salary / Stipend', amount: 8000, daysAway: 3 };
  const primaryCommitment = commitmentsList?.[0] || { title: 'PG Rent', amount: 5000, daysAway: 2 };

  return [
    {
      step: 1,
      chapter: 'Chapter 1: The Safe Haven',
      title: '1. Baseline Stable Position',
      shortTitle: '1. Safe Base',
      stageName: 'The Fortress Vault',
      description: `${firstName} begins in a healthy position with ${formatINR(currentBal)} liquid balance, ${formatINR(primaryIncome.amount)} (${primaryIncome.title}) expected in ${primaryIncome.daysAway} days, and a protected ${formatINR(safetyBuf)} buffer.`,
      risk: 'LOW',
      narrative: `All scheduled commitments (including ${formatINR(primaryCommitment.amount)} for ${primaryCommitment.title}) are fully funded with comfortable discretionary headroom.`,
      icon: ShieldCheck,
      badgeColor: '#10B981',
      badgeBg: '#ECFDF5',
      accentColor: '#10B981',
      stateModifiers: {
        incomeDelayDays: 0,
        immediateExpense: 0,
        pausedCommitmentIds: []
      }
    },
    {
      step: 2,
      chapter: 'Chapter 1: The Safe Haven',
      title: '2. Expected Income Delayed',
      shortTitle: '2. Income Delay',
      stageName: 'The Stretched Bridge',
      description: `${primaryIncome.title} (+${formatINR(primaryIncome.amount)}) payout is delayed by 5 days. The cash bridge between today and your next deposit expands.`,
      risk: 'MEDIUM',
      narrative: `${firstName}'s liquidity window extends from ${primaryIncome.daysAway} days to ${primaryIncome.daysAway + 5} days before the next cash injection clears into the bank account.`,
      icon: AlertTriangle,
      badgeColor: '#F59E0B',
      badgeBg: '#FFFBEB',
      accentColor: '#F59E0B',
      stateModifiers: {
        incomeDelayDays: 5,
        immediateExpense: 0,
        pausedCommitmentIds: []
      }
    },
    {
      step: 3,
      chapter: 'Chapter 2: The Shock Event',
      title: '3. Unexpected Outflow Occurs',
      shortTitle: '3. Surprise Outflow',
      stageName: 'The Expense Meteor',
      description: `${firstName} encounters a sudden emergency laptop repair and medicine bill of ₹3,500 paid via instant UPI scan.`,
      risk: 'HIGH',
      narrative: `Liquid cash reserve drops by ₹3,500 right before your scheduled ${primaryCommitment.title} (${formatINR(primaryCommitment.amount)}) auto-debit!`,
      icon: Flame,
      badgeColor: '#EF4444',
      badgeBg: '#FEF2F2',
      accentColor: '#EF4444',
      stateModifiers: {
        incomeDelayDays: 5,
        immediateExpense: 3500,
        pausedCommitmentIds: []
      }
    },
    {
      step: 4,
      chapter: 'Chapter 2: The Shock Event',
      title: '4. Shortfall Risk Triggered',
      shortTitle: '4. Risk Detected',
      stageName: 'The Deficit Chasm',
      description: `Guardian proactively detects liquidity deficit: projected minimum balance plummets into the danger zone before ${primaryIncome.title} arrives.`,
      risk: 'HIGH',
      narrative: `CRITICAL ALERT: 100% of ${formatINR(safetyBuf)} buffer breached! Severe risk of ${primaryCommitment.title} auto-debit bouncing with ECS penalty fees.`,
      icon: AlertTriangle,
      badgeColor: '#DC2626',
      badgeBg: '#FEE2E2',
      accentColor: '#DC2626',
      stateModifiers: {
        incomeDelayDays: 5,
        immediateExpense: 3500,
        pausedCommitmentIds: []
      }
    },
    {
      step: 5,
      chapter: 'Chapter 3: The Guardian Intervention',
      title: '5. Safe-to-Spend Lockdown',
      shortTitle: '5. Safe-to-Spend: ₹0',
      stageName: 'The Safe-to-Spend Lock',
      description: `Dynamic Safe-to-Spend instantly locks to ₹0 to protect remaining cash for ${primaryCommitment.title} and groceries.`,
      risk: 'HIGH',
      narrative: `Discretionary purchases are frozen. Every rupee spent now directly deepens the shortfall deficit on commitment day.`,
      icon: Cpu,
      badgeColor: '#7C3AED',
      badgeBg: '#F5F3FF',
      accentColor: '#7C3AED',
      stateModifiers: {
        incomeDelayDays: 5,
        immediateExpense: 3500,
        pausedCommitmentIds: []
      }
    },
    {
      step: 6,
      chapter: 'Chapter 3: The Guardian Intervention',
      title: '6. AI Explains Root Cause',
      shortTitle: '6. AI Explainability',
      stageName: 'The AI Analysis',
      description: `Groq AI isolates the mathematical cause: 5-day income delay + ₹3,500 emergency shock + ${formatINR(primaryCommitment.amount)} commitment collision.`,
      risk: 'HIGH',
      narrative: `The AI Guardian advises: 'Do not panic. You can avoid deficit by collecting pending roommate split dues and capping food delivery.'`,
      icon: Lightbulb,
      badgeColor: '#0284C7',
      badgeBg: '#F0F9FF',
      accentColor: '#0284C7',
      stateModifiers: {
        incomeDelayDays: 5,
        immediateExpense: 3500,
        pausedCommitmentIds: []
      }
    },
    {
      step: 7,
      chapter: 'Chapter 4: The Recovery & Learning',
      title: '7. Protective Action Applied',
      shortTitle: '7. Protective Shield',
      stageName: 'The Rescue Levers',
      description: `Protective mitigation activated: cap daily Swiggy dining at ₹250/day (saves ₹1,320) + collect roommate UPI dues (+₹1,500).`,
      risk: 'MEDIUM',
      narrative: `Cash recovers by +₹2,820! Balance pulls out of the red, lifting the projected minimum back above zero.`,
      icon: ShieldCheck,
      badgeColor: '#059669',
      badgeBg: '#ECFDF5',
      accentColor: '#059669',
      stateModifiers: {
        incomeDelayDays: 5,
        immediateExpense: 3500,
        pausedCommitmentIds: ['com_2']
      }
    },
    {
      step: 8,
      chapter: 'Chapter 4: The Recovery & Learning',
      title: '8. Feedback-Based Continuous Learning',
      shortTitle: '8. Adaptive Learning',
      stageName: 'The Adaptive Master',
      description: `${firstName} rejects pausing Netflix ("Need streaming for unwind") but accepts dining cap & roommate split. Guardian logs preference!`,
      risk: 'LOW',
      narrative: `Continuous Learning Cycles 1 & 2 complete: System permanently remembers ${firstName}'s lifestyle preferences for future cashflow peace of mind!`,
      icon: BrainCircuit,
      badgeColor: '#EA580C',
      badgeBg: '#FFF7ED',
      accentColor: '#EA580C',
      stateModifiers: {
        incomeDelayDays: 5,
        immediateExpense: 3500,
        pausedCommitmentIds: []
      }
    }
  ];
}

export const DEMO_STEPS = getDynamicDemoSteps();

export default function LiveDemoBar({ 
  currentStepIndex = 0, 
  onSelectStep, 
  onReset,
  currentUser,
  calculatedBalance = 12480,
  safeToSpendResult,
  activeCommitments = [],
  safetyBuffer = 3000
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [is3DView, setIs3DView] = useState(true);

  const steps = useMemo(() => {
    return getDynamicDemoSteps(
      currentUser,
      calculatedBalance,
      safeToSpendResult,
      currentUser?.upcomingIncome || [],
      activeCommitments,
      safetyBuffer
    );
  }, [currentUser, calculatedBalance, safeToSpendResult, activeCommitments, safetyBuffer]);

  const userName = currentUser?.name || 'Raj';
  const firstName = userName.split(' ')[0] || 'Raj';

  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        onSelectStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            soundFX.playSuccess();
            return prev;
          }
          soundFX.playClick();
          return prev + 1;
        });
      }, 4500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, onSelectStep, steps.length]);

  const currentStep = steps[currentStepIndex] || steps[0];
  const StepIcon = currentStep.icon;

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      soundFX.playClick();
      onSelectStep(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      soundFX.playClick();
      onSelectStep(currentStepIndex + 1);
    } else {
      soundFX.playSuccess();
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-cream/40 border border-line-medium text-ink space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line-medium pb-4">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-cream border border-line-medium text-[11px] font-accent uppercase tracking-widest text-coral font-bold flex items-center gap-1.5">
            <Sparkles size={12} />
            <span>Interactive Financial Storyboard</span>
          </div>

          <div>
            <h3 className="font-editorial text-xl text-ink font-normal">
              {firstName}'s 8-Step Cashflow Journey
            </h3>
            <span className="text-xs font-sans text-ink-muted">
              Step through unexpected cashflow shocks, automated ring-fencing, and recovery.
            </span>
          </div>
        </div>

        {/* Story Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setIsPlaying(!isPlaying);
              soundFX.playClick();
            }}
            className="px-3 py-1.5 rounded-full bg-ivory border border-line-medium text-xs font-sans text-ink hover:border-line-dark flex items-center gap-1.5"
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button 
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-3 py-1.5 rounded-full bg-ivory border border-line-medium text-xs font-sans text-ink-muted disabled:opacity-30 hover:text-ink flex items-center gap-1"
          >
            <ChevronLeft size={13} />
            <span>Prev</span>
          </button>

          <button 
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className="px-4 py-1.5 rounded-full bg-ink text-ivory text-xs font-sans font-semibold hover:bg-coral transition-colors disabled:opacity-30 flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight size={13} />
          </button>

          <button 
            onClick={() => {
              setIsPlaying(false);
              onReset();
              soundFX.playClick();
            }}
            title="Reset to Baseline"
            className="p-2 rounded-full text-ink-muted hover:text-ink transition-colors"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* STORYBOARD STEP CHIPS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {steps.map((s, idx) => {
          const isActive = idx === currentStepIndex;
          const isCompleted = idx < currentStepIndex;

          return (
            <button
              key={s.step}
              onClick={() => {
                soundFX.playClick();
                onSelectStep(idx);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isActive 
                  ? 'border-coral bg-coral/10 shadow-xs' 
                  : (isCompleted 
                      ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50' 
                      : 'border-line-medium bg-ivory hover:bg-cream/40')
              }`}
            >
              <div className="text-[10px] font-accent uppercase text-ink-subtle font-bold">
                Step 0{s.step}
              </div>
              <div className={`text-xs font-sans font-semibold truncate ${isActive ? 'text-coral' : 'text-ink'}`}>
                {s.shortTitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Story Stage Full Narrative Banner */}
      <div className="p-5 rounded-xl border border-line-medium bg-ivory flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4 max-w-2xl">
          <div className="w-10 h-10 rounded-xl bg-cream border border-line-medium text-coral flex items-center justify-center shrink-0">
            <StepIcon size={20} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-accent uppercase text-coral font-bold tracking-wider">
                {currentStep.chapter}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cream border border-line-medium font-sans text-ink-muted">
                {currentStep.stageName}
              </span>
            </div>

            <h4 className="font-editorial text-xl text-ink font-normal">
              {currentStep.title}
            </h4>

            <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed">
              {currentStep.description}
            </p>

            <p className="font-sans text-xs font-semibold text-coral">
              {currentStep.narrative}
            </p>
          </div>
        </div>

        {/* Callout Action Pill */}
        <div className="p-3 rounded-xl bg-cream/50 border border-line-medium text-right shrink-0">
          <span className="text-[10px] font-accent uppercase text-ink-subtle block font-bold">
            Risk Stance
          </span>
          <span className={`text-xs font-sans font-bold ${
            currentStep.risk === 'HIGH' ? 'text-rose-600' : (currentStep.risk === 'MEDIUM' ? 'text-amber-700' : 'text-emerald-700')
          }`}>
            {currentStep.risk === 'HIGH' ? 'Shortfall Danger' : (currentStep.risk === 'MEDIUM' ? 'Caution Window' : 'Fully Protected')}
          </span>
        </div>
      </div>
    </div>
  );
}
