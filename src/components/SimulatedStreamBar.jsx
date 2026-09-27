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
    <div className="mb-6 rounded-2xl bg-cream/30 border border-line-medium text-ink overflow-hidden transition-all">
      {/* Top Banner Bar */}
      <div className={`p-4 flex flex-wrap items-center justify-between gap-3 ${isCollapsed ? '' : 'border-b border-line-medium'}`}>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-accent uppercase tracking-wider font-bold ${
            isRunning 
              ? 'bg-rose-100 text-rose-700 border border-rose-200' 
              : 'bg-cream border border-line-medium text-coral'
          }`}>
            <Radio size={12} className={isRunning ? 'animate-pulse' : ''} />
            <span>{isRunning ? 'Stream Active' : 'Account Stream Mode'}</span>
          </div>

          <span className="font-sans text-xs font-semibold text-ink">
            Interactive Transaction Feed
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Next manual event button */}
          <button
            onClick={handleNextManual}
            className="px-3 py-1 rounded-full bg-ivory border border-line-medium text-xs font-sans text-ink hover:border-line-dark flex items-center gap-1.5"
            title="Trigger one simulated event sequentially"
          >
            <FastForward size={12} />
            <span>Next Event</span>
          </button>

          {/* Auto play toggle */}
          <button
            onClick={handleToggleAuto}
            className={`px-3 py-1 rounded-full text-xs font-sans transition-all flex items-center gap-1.5 ${
              isRunning 
                ? 'bg-ink text-ivory font-semibold' 
                : 'bg-ivory border border-line-medium text-ink hover:border-line-dark'
            }`}
          >
            {isRunning ? <Pause size={12} /> : <Play size={12} />}
            <span>{isRunning ? 'Pause' : 'Auto Stream'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-full text-ink-muted hover:text-ink transition-colors"
            title="Reset stream count"
          >
            <RotateCcw size={13} />
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-ink-muted hover:text-ink p-1"
          >
            {isCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
        </div>
      </div>

      {/* Expanded Details & 1-Click Injection Buttons */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {/* Recent Event Banner */}
          <div className="flex items-center justify-between gap-4">
            {lastEvent ? (
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  lastEvent.transaction.type === 'income' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-coral/15 text-coral'
                }`}>
                  {lastEvent.transaction.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-sans font-semibold text-xs text-ink">
                      {lastEvent.eventMeta.title}
                    </span>
                    <span className={`font-sans font-bold text-xs num-tabular ${
                      lastEvent.transaction.type === 'income' ? 'text-emerald-800' : 'text-coral'
                    }`}>
                      {lastEvent.transaction.type === 'income' ? '+' : '−'} {formatINR(lastEvent.transaction.amount)}
                    </span>
                    <span className="text-[10px] font-accent text-ink-muted uppercase">
                      {lastEvent.transaction.paymentMethod}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-ink-muted mt-0.5">
                    {lastEvent.eventMeta.narrative}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs font-sans text-ink-muted flex items-center gap-2">
                <Sparkles size={14} className="text-coral" />
                <span>Simulate live Indian transaction feeds: salary IMPS, Swiggy UPI, ATM cash, family transfers, or critical deficit shocks.</span>
              </div>
            )}

            <div className="text-right shrink-0">
              <span className="text-[10px] font-accent uppercase text-ink-subtle block">Fired</span>
              <span className="font-sans font-bold text-sm text-coral num-tabular">{eventCount}</span>
            </div>
          </div>

          {/* 1-Click Quick Injections Bar */}
          <div className="pt-3 border-t border-line-medium flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-accent uppercase text-ink-subtle font-bold tracking-wider mr-1">
              Quick Injections:
            </span>

            {/* Salary */}
            <button
              onClick={() => handleTriggerSpecific('sim_salary')}
              className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans hover:bg-emerald-100 flex items-center gap-1.5"
            >
              <Briefcase size={11} />
              <span>+₹35k Salary</span>
            </button>

            {/* Swiggy UPI */}
            <button
              onClick={() => handleTriggerSpecific('sim_upi_food')}
              className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-sans hover:bg-orange-100 flex items-center gap-1.5"
            >
              <Utensils size={11} />
              <span>−₹450 Swiggy</span>
            </button>

            {/* SBI ATM Cash */}
            <button
              onClick={() => handleTriggerSpecific('sim_atm_cash')}
              className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-sans hover:bg-indigo-100 flex items-center gap-1.5"
            >
              <Banknote size={11} />
              <span>−₹3,000 Cash</span>
            </button>

            {/* Family Papa Transfer */}
            <button
              onClick={() => handleTriggerSpecific('sim_family')}
              className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-sans hover:bg-teal-100 flex items-center gap-1.5"
            >
              <Users size={11} />
              <span>+₹8,000 Family</span>
            </button>

            {/* Sudden Medical Shock */}
            <button
              onClick={() => handleTriggerSpecific('sim_severe_shock')}
              className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-sans hover:bg-rose-100 flex items-center gap-1.5"
            >
              <AlertTriangle size={11} />
              <span>−₹9,500 Emergency</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
