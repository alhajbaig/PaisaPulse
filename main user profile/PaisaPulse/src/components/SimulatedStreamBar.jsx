import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Play, 
  Pause, 
  FastForward, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Banknote,
  Briefcase,
  Utensils,
  AlertOctagon,
  Copy,
  Users
} from 'lucide-react';
import { globalSimulationStream, SIMULATION_EVENTS } from '../engine/simulationStream';
import { formatINR } from '../engine/cashflowEngine';
import { soundFX } from '../engine/audioEffects';

export default function SimulatedStreamBar({ onSimulatedTransactionArrived }) {
  const [isRunning, setIsRunning] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [eventCount, setEventCount] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isRunning) {
      // Fire next event every 4.5 seconds
      timer = setInterval(() => {
        const next = globalSimulationStream.getNextEvent();
        triggerEvent(next);
      }, 4500);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const triggerEvent = (eventData) => {
    setLastEvent(eventData);
    setEventCount(prev => prev + 1);

    if (eventData.transaction.type === 'income') {
      soundFX.playSuccess();
    } else if (eventData.transaction.amount >= 5000 || eventData.eventMeta?.id === 'sim_severe_shock') {
      soundFX.playWarning();
    } else {
      soundFX.playClick();
    }

    onSimulatedTransactionArrived(eventData.transaction, eventData.eventMeta);
  };

  const handleNextManual = () => {
    soundFX.playClick();
    const next = globalSimulationStream.getNextEvent();
    triggerEvent(next);
  };

  const handleTriggerSpecific = (eventId) => {
    soundFX.playClick();
    const event = globalSimulationStream.getSpecificEvent(eventId);
    triggerEvent(event);
  };

  const handleToggleAuto = () => {
    soundFX.playClick();
    if (!isRunning) {
      const first = globalSimulationStream.getNextEvent();
      triggerEvent(first);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    soundFX.playClick();
    setIsRunning(false);
    globalSimulationStream.stopStream();
    globalSimulationStream.currentIndex = 0;
    setLastEvent(null);
    setEventCount(0);
  };

  return (
    <div style={{
      marginBottom: '20px',
      background: '#18181B',
      color: '#FFFFFF',
      borderRadius: '18px',
      border: '1px solid #27272A',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden',
      transition: 'all 0.25s ease'
    }}>
      {/* Top Banner Bar */}
      <div style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: isCollapsed ? 'none' : '1px solid #27272A',
        background: 'linear-gradient(90deg, #1C1917 0%, #27272A 100%)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isRunning ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 88, 12, 0.2)',
            color: isRunning ? '#EF4444' : '#FB923C',
            border: `1px solid ${isRunning ? '#EF4444' : '#EA580C'}`,
            padding: '3px 10px',
            borderRadius: '999px',
            fontSize: '0.74rem',
            fontWeight: 800
          }}>
            <Radio size={12} className={isRunning ? 'animate-pulse' : ''} />
            <span>{isRunning ? 'STREAM ACTIVE (ARRIVING OVER TIME)' : 'SIMULATED STREAM MODE'}</span>
          </div>

          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#E4E4E7' }}>
            Interactive Indian Account Stream
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Next manual event button */}
          <button
            onClick={handleNextManual}
            className="demo-step-btn"
            style={{ fontSize: '0.78rem', padding: '5px 12px' }}
            title="Trigger one simulated event sequentially"
          >
            <FastForward size={14} />
            <span>Next Event</span>
          </button>

          {/* Auto play toggle */}
          <button
            onClick={handleToggleAuto}
            className={`demo-step-btn ${isRunning ? 'primary' : ''}`}
            style={{ fontSize: '0.78rem', padding: '5px 12px' }}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            <span>{isRunning ? 'Pause Stream' : 'Auto Stream'}</span>
          </button>

          <button
            onClick={handleReset}
            className="demo-step-btn"
            style={{ fontSize: '0.78rem', padding: '5px 10px' }}
            title="Reset stream count"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ color: '#A1A1AA', padding: '4px' }}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Details & 1-Click Injection Buttons */}
      {!isCollapsed && (
        <div style={{ padding: '14px 20px' }}>
          {/* Recent Event Banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '14px' }}>
            {lastEvent ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: lastEvent.transaction.type === 'income' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: lastEvent.transaction.type === 'income' ? '#34D399' : '#F87171',
                  flexShrink: 0
                }}>
                  {lastEvent.transaction.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF' }}>
                      {lastEvent.eventMeta.title}
                    </span>
                    <span style={{
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      color: lastEvent.transaction.type === 'income' ? '#34D399' : '#FB923C'
                    }}>
                      {lastEvent.transaction.type === 'income' ? '+' : '-'} {formatINR(lastEvent.transaction.amount)}
                    </span>
                    <span style={{ fontSize: '0.72rem', background: '#27272A', color: '#A1A1AA', padding: '1px 6px', borderRadius: '4px' }}>
                      {lastEvent.transaction.paymentMethod}
                    </span>
                    {lastEvent.transaction.isDuplicateSuspect && (
                      <span style={{ fontSize: '0.72rem', background: '#78350F', color: '#FDE68A', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        DUPLICATE GLITCH
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#A1A1AA', marginTop: '2px' }}>
                    {lastEvent.eventMeta.narrative} — Single-source balance & safe-to-spend updated in real-time.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.82rem', color: '#A1A1AA', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={15} color="#FB923C" />
                <span>
                  Simulate live Indian transaction feeds: salary IMPS, Swiggy UPI, SBI ATM cash, family transfers, or critical deficit shocks.
                </span>
              </div>
            )}

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span style={{ fontSize: '0.74rem', color: '#71717A', display: 'block' }}>
                Events Fired
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FB923C' }}>
                {eventCount}
              </span>
            </div>
          </div>

          {/* 1-Click Quick Injections Bar */}
          <div style={{
            paddingTop: '12px',
            borderTop: '1px solid #27272A',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#71717A', textTransform: 'uppercase' }}>
              Instant Test Injections:
            </span>

            {/* Salary */}
            <button
              onClick={() => handleTriggerSpecific('sim_salary')}
              style={{
                background: '#14532D',
                border: '1px solid #22C55E',
                color: '#86EFAC',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Credit ₹35,000 monthly corporate salary"
            >
              <Briefcase size={12} />
              <span>+₹35k Salary</span>
            </button>

            {/* Swiggy UPI */}
            <button
              onClick={() => handleTriggerSpecific('sim_upi_food')}
              style={{
                background: '#451A03',
                border: '1px solid #F97316',
                color: '#FED7AA',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Debit ₹450 for Swiggy dinner via UPI"
            >
              <Utensils size={12} />
              <span>-₹450 Swiggy UPI</span>
            </button>

            {/* SBI ATM Cash */}
            <button
              onClick={() => handleTriggerSpecific('sim_atm_cash')}
              style={{
                background: '#1E1B4B',
                border: '1px solid #6366F1',
                color: '#C7D2FE',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Withdraw ₹3,000 cash from SBI ATM"
            >
              <Banknote size={12} />
              <span>-₹3,000 ATM Cash</span>
            </button>

            {/* Family Papa Transfer */}
            <button
              onClick={() => handleTriggerSpecific('sim_family')}
              style={{
                background: '#042F2E',
                border: '1px solid #14B8A6',
                color: '#99F6E4',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Receive ₹4,000 monthly allowance from Papa"
            >
              <Users size={12} />
              <span>+₹4k Papa Transfer</span>
            </button>

            {/* Duplicate UPI Glitch */}
            <button
              onClick={() => handleTriggerSpecific('sim_duplicate_glitch')}
              style={{
                background: '#3B1F04',
                border: '1px solid #EAB308',
                color: '#FEF08A',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Inject duplicate Swiggy double-debit transaction anomaly"
            >
              <Copy size={12} />
              <span>Duplicate Glitch</span>
            </button>

            {/* CRITICAL SHORTFALL SHOCK */}
            <button
              onClick={() => handleTriggerSpecific('sim_severe_shock')}
              style={{
                background: '#7F1D1D',
                border: '1px solid #EF4444',
                color: '#FECACA',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)'
              }}
              title="Simulate sudden -₹12,500 emergency shock that plunges cashflow into severe deficit"
            >
              <AlertOctagon size={13} color="#F87171" />
              <span>TRIGGER SEVERE SHORTFALL SHOCK (-₹12.5k)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
