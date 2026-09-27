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
    <div style={{
      background: '#1C1917',
      borderRadius: '22px',
      color: '#FFFFFF',
      padding: '24px',
      boxShadow: '0 16px 40px -10px rgba(0, 0, 0, 0.35)',
      border: '1px solid #292524',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #292524'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #EA580C, #C2410C)',
            color: '#FFF',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '0.74rem',
            fontWeight: 900,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={13} />
            <span>2D/3D FINANCIAL STORY JOURNEY</span>
          </div>

          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              {firstName}'s 8-Step Cashflow Story & Survival Simulation
            </h3>
            <span style={{ fontSize: '0.76rem', color: '#A8A29E' }}>
              Step through how unexpected shocks occur, how the AI Guardian locks spending, and how to recover.
            </span>
          </div>
        </div>

        {/* Story Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIs3DView(!is3DView)}
            style={{
              background: is3DView ? '#3B82F6' : '#27272A',
              color: '#FFF',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Toggle 2.5D Isometric Story Cards"
          >
            <Layers size={14} />
            <span>{is3DView ? '3D Storyboard: On' : 'Compact View'}</span>
          </button>

          <button 
            className="demo-step-btn"
            onClick={() => {
              setIsPlaying(!isPlaying);
              soundFX.playClick();
            }}
            style={{ fontSize: '0.78rem', padding: '6px 14px' }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause Story' : 'Auto Play Story'}</span>
          </button>

          <button 
            className="demo-step-btn"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            style={{ opacity: currentStepIndex === 0 ? 0.4 : 1, fontSize: '0.78rem', padding: '6px 10px' }}
          >
            <ChevronLeft size={15} />
            <span>Prev</span>
          </button>

          <button 
            className="demo-step-btn primary"
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            style={{ opacity: currentStepIndex === steps.length - 1 ? 0.5 : 1, fontSize: '0.78rem', padding: '6px 14px' }}
          >
            <span>Next Chapter</span>
            <ChevronRight size={15} />
          </button>

          <button 
            className="demo-step-btn"
            onClick={() => {
              setIsPlaying(false);
              onReset();
              soundFX.playClick();
            }}
            title="Reset to Baseline"
            style={{ fontSize: '0.78rem', padding: '6px 10px' }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* 2.5D ISOMETRIC STORYBOARD CARDS TRACK */}
      {is3DView && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          marginBottom: '20px',
          perspective: '1000px'
        }}>
          {steps.map((s, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            const Icon = s.icon;

            return (
              <div
                key={s.step}
                onClick={() => {
                  soundFX.playClick();
                  onSelectStep(idx);
                }}
                style={{
                  background: isActive 
                    ? 'linear-gradient(135deg, #27272A 0%, #1C1917 100%)' 
                    : (isCompleted ? '#18181B' : '#141416'),
                  borderRadius: '14px',
                  padding: '12px 10px',
                  border: isActive ? `2px solid ${s.accentColor}` : '1px solid #27272A',
                  cursor: 'pointer',
                  transform: isActive 
                    ? 'translateY(-6px) rotateX(4deg) scale(1.03)' 
                    : 'translateY(0) rotateX(0deg)',
                  boxShadow: isActive 
                    ? `0 12px 24px -4px ${s.accentColor}40, 0 0 16px ${s.accentColor}25` 
                    : 'none',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                {/* Active Player / Character Marker */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: s.accentColor,
                    color: '#FFF',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>{firstName}</span>
                  </div>
                )}

                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: `${s.accentColor}20`,
                  color: s.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 6px auto'
                }}>
                  <Icon size={16} />
                </div>

                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: isActive ? '#FFFFFF' : '#A8A29E', lineHeight: 1.2 }}>
                  {s.shortTitle}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#71717A', marginTop: '2px' }}>
                  {s.risk === 'HIGH' ? 'Hazard' : (s.risk === 'MEDIUM' ? 'Caution' : 'Stable')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Story Stage Full Narrative Banner */}
      <div style={{
        background: currentStep.risk === 'HIGH' 
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(24, 24, 27, 0.95) 100%)' 
          : 'linear-gradient(135deg, rgba(234, 88, 12, 0.12) 0%, rgba(24, 24, 27, 0.95) 100%)',
        border: `1px solid ${currentStep.accentColor}50`,
        borderRadius: '16px',
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', maxWidth: '780px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: `${currentStep.accentColor}25`,
            color: currentStep.accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <StepIcon size={24} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.74rem', color: currentStep.accentColor, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {currentStep.chapter}
              </span>
              <span style={{ fontSize: '0.74rem', background: '#27272A', color: '#E4E4E7', padding: '1px 8px', borderRadius: '4px', fontWeight: 700 }}>
                {currentStep.stageName}
              </span>
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '4px' }}>
              {currentStep.title}
            </h4>

            <p style={{ fontSize: '0.86rem', color: '#D4D4D8', lineHeight: '1.5', marginBottom: '6px' }}>
              {currentStep.description}
            </p>

            <p style={{ fontSize: '0.8rem', color: currentStep.accentColor, fontWeight: 600 }}>
              {currentStep.narrative}
            </p>
          </div>
        </div>

        {/* Callout Action Pill */}
        <div style={{
          background: '#27272A',
          border: '1px solid #3F3F46',
          borderRadius: '10px',
          padding: '10px 14px',
          textAlign: 'right'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#A1A1AA', display: 'block' }}>
            Risk State:
          </span>
          <span style={{
            fontSize: '0.86rem',
            fontWeight: 800,
            color: currentStep.risk === 'HIGH' ? '#EF4444' : (currentStep.risk === 'MEDIUM' ? '#F59E0B' : '#10B981')
          }}>
            {currentStep.risk === 'HIGH' ? 'Shortfall Danger' : (currentStep.risk === 'MEDIUM' ? 'Caution Window' : 'Fully Protected')}
          </span>
        </div>
      </div>
    </div>
  );
}
