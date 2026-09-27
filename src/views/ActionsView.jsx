import React, { useState } from 'react';
import { 
  ShieldAlert, 
  BrainCircuit, 
  Check, 
  X, 
  Sliders, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  Tv, 
  Utensils, 
  Users, 
  PiggyBank,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatINR } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { useLanguage } from '../services/i18n.jsx';

export default function ActionsView({ 
  learningEngine, 
  forecastResult, 
  safeToSpendResult,
  onApplyMitigation,
  onRefreshState
}) {
  const { t, language } = useLanguage();
  const [activeCycle, setActiveCycle] = useState(learningEngine.getCycle());
  const [history, setHistory] = useState(learningEngine.getDecisionHistory());
  const [preferences, setPreferences] = useState(learningEngine.getPreferences());
  const [actionStatuses, setActionStatuses] = useState({}); // actionId -> 'ACCEPTED' | 'REJECTED' | 'MODIFIED'

  const candidateActions = [
    {
      id: 'act_dining',
      type: 'cap_dining',
      problem: 'Daily discretionary dining burn is projected to draw down balance near buffer floor.',
      title: 'Temporary Daily Dining Budget Cap',
      amount: 1320,
      duration: '4 days',
      timing: 'Next 4 days (₹250/day cap)',
      impact: 'Reduces dining spending from current avg ₹580/day to ₹250/day for 4 days.',
      tradeoff: 'Less restaurant food delivery; relies on hostel mess or home meals for 4 days.',
      icon: Utensils,
      color: '#EA580C',
      baseScore: 75,
      isSimulated: true
    },
    {
      id: 'act_split',
      type: 'peer_split',
      problem: 'Pending roommate split bills have not been collected before month-end commitments.',
      title: 'Automated Peer Split Recovery via UPI',
      amount: 1200,
      duration: 'Instant',
      timing: 'Instant WhatsApp / UPI Nudge',
      impact: 'Collects pending roommate bill shares (Amit ₹750, Rohan ₹450) into liquid cash.',
      tradeoff: 'Zero lifestyle sacrifice; simply requires following up on money already owed to you.',
      icon: Users,
      color: '#0284C7',
      baseScore: 70,
      isSimulated: true
    },
    {
      id: 'act_sub',
      type: 'pause_subscription',
      problem: 'Upcoming ₹649 auto-debit triggers right before scheduled ₹5,000 rent payment.',
      title: 'Pause Netflix Auto-Debit',
      amount: 649,
      duration: 'Next billing cycle',
      timing: 'Due in 4 days (29 Sep)',
      impact: 'Preserves ₹649 liquid cash to avoid overdraft before PG rent clears.',
      tradeoff: 'Streaming account temporarily pauses until next stipend arrives.',
      icon: Tv,
      color: '#D97706',
      baseScore: 60,
      isSimulated: true
    },
    {
      id: 'act_buffer',
      type: 'adjust_buffer',
      problem: 'Temporary 3-day cash compression while waiting for delayed freelance invoice.',
      title: 'Micro-Buffer Elastic Drawdown',
      amount: 1500,
      duration: '3 days',
      timing: 'Emergency 3-Day Window',
      impact: 'Temporarily relaxes target buffer from ₹3,000 to ₹1,500 until stipend arrives.',
      tradeoff: 'Higher risk tolerance for 72 hours; requires avoiding unexpected large expenses.',
      icon: PiggyBank,
      color: '#059669',
      baseScore: 50,
      isSimulated: true
    }
  ];

  // Pass through continuous learning filter
  const rankedActions = learningEngine.filterAndRankActions(candidateActions);

  const handleDecision = (action, decision, notes = null) => {
    soundFX.playClick();

    if (decision === 'ACCEPTED') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      soundFX.playSuccess();
      onApplyMitigation(action);
    }

    // Record decision in continuous learning engine
    learningEngine.recordDecision({
      actionId: action.id,
      actionType: action.type,
      title: action.title,
      decision,
      impact: action.impact,
      modificationDetails: notes
    });

    // Update local reactive state
    setActionStatuses(prev => ({ ...prev, [action.id]: decision }));
    setHistory([...learningEngine.getDecisionHistory()]);
    setPreferences({ ...learningEngine.getPreferences() });
    setActiveCycle(learningEngine.getCycle());
    onRefreshState();
  };

  const handleResetLearning = () => {
    soundFX.playClick();
    learningEngine.resetLearning();
    setActionStatuses({});
    setHistory([...learningEngine.getDecisionHistory()]);
    setPreferences({ ...learningEngine.getPreferences() });
    setActiveCycle(learningEngine.getCycle());
    onRefreshState();
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header (Prompt Section 29) */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-line-medium pb-6 pt-2">
        <div className="space-y-1">
          <span className="text-xs font-accent uppercase tracking-widest text-coral font-bold block">
            Actions · Interventions
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-ink font-normal">
            Protective financial interventions
          </h1>
          <p className="font-sans text-xs sm:text-sm text-ink-muted">
            Autonomous shortfall interventions that learn and adapt to your personal financial preferences.
          </p>
        </div>

        <button 
          className="px-4 py-1.5 rounded-full bg-ivory border border-line-medium text-xs font-sans text-ink-muted hover:text-ink hover:border-line-dark transition-all self-start sm:self-auto flex items-center gap-1.5 cursor-pointer shadow-subtle"
          onClick={handleResetLearning}
        >
          <RotateCcw size={13} />
          <span>Reset Memory</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Shortfall Prevention Center */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-line-light">
            <h3 className="font-sans text-xs uppercase tracking-wider text-ink font-bold flex items-center gap-2">
              <ShieldAlert size={15} className="text-coral" />
              <span>Recommended Protective Actions</span>
            </h3>
            <span className="text-xs font-accent text-ink-muted">
              Ranked by Learned Preferences
            </span>
          </div>

          <div className="space-y-4">
            {rankedActions.map(action => {
              const Icon = action.icon;
              const currentStatus = actionStatuses[action.id];

              return (
                <div 
                  key={action.id}
                  className={`bg-ivory border transition-all rounded-xl p-5 ${
                    currentStatus === 'ACCEPTED'
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : currentStatus === 'REJECTED'
                      ? 'border-red-200 bg-red-50/20 opacity-60'
                      : 'border-line-medium hover:border-line-dark shadow-subtle'
                  }`}
                  style={{
                    opacity: action.suppressedReason && !currentStatus ? 0.65 : 1
                  }}
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-cream border border-line-light flex items-center justify-center text-ink flex-shrink-0 mt-0.5">
                        <Icon size={17} style={{ color: action.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-sans text-sm font-semibold text-ink">
                            {action.title}
                          </h4>
                          <span className="text-[10px] font-accent uppercase tracking-wider bg-cream border border-line-light text-ink-muted px-2 py-0.5 rounded-full font-medium">
                            Plan Only
                          </span>
                        </div>
                        <span className="text-xs font-accent text-ink-muted block mt-0.5">
                          {action.timing}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-accent text-base font-semibold text-ink num-tabular">
                        +{formatINR(action.amount)}
                      </div>
                      <div className="text-[10px] font-sans text-ink-muted">liquidity recovered</div>
                    </div>
                  </div>

                  {/* Problem & Impact Details */}
                  <div className="bg-cream/50 border border-line-light rounded-lg p-3 my-3 space-y-1.5 text-xs font-sans">
                    {action.problem && (
                      <div className="text-ink-muted">
                        <span className="font-semibold text-red-700">Problem: </span>
                        <span>{action.problem}</span>
                      </div>
                    )}
                    <div className="text-ink">
                      <span className="font-semibold text-emerald-700">Recovery: </span>
                      <span>{action.impact}</span>
                    </div>
                    {action.tradeoff && (
                      <div className="text-ink-muted">
                        <span className="font-semibold text-amber-700">Tradeoff: </span>
                        <span>{action.tradeoff}</span>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  {action.recommendedBadge && !action.suppressedReason && (
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-accent text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-3">
                      <Sparkles size={11} className="text-emerald-600" />
                      <span>{action.recommendedBadge}</span>
                    </div>
                  )}

                  {action.suppressedReason && (
                    <div className="text-[11px] font-accent text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md mb-3">
                      {action.suppressedReason}
                    </div>
                  )}

                  {/* Decision Actions */}
                  {currentStatus ? (
                    <div className="flex items-center gap-2 text-xs font-semibold pt-2 border-t border-line-light">
                      {currentStatus === 'ACCEPTED' ? (
                        <CheckCircle2 size={15} className="text-emerald-600" />
                      ) : (
                        <X size={15} className="text-red-600" />
                      )}
                      <span className={currentStatus === 'ACCEPTED' ? 'text-emerald-800' : 'text-red-700'}>
                        Decision Recorded: {currentStatus === 'ACCEPTED' ? 'Applied to Plan' : currentStatus}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-2 border-t border-line-light">
                      <button
                        className="px-3.5 py-1.5 rounded-full bg-coral text-white text-xs font-sans font-semibold hover:bg-coral-dark transition-all flex items-center gap-1.5 cursor-pointer shadow-subtle"
                        onClick={() => handleDecision(action, 'ACCEPTED')}
                      >
                        <Check size={13} />
                        <span>Apply to Plan</span>
                      </button>

                      <button
                        className="px-3 py-1.5 rounded-full bg-transparent border border-line-medium text-xs font-sans text-ink-muted hover:text-red-600 hover:border-red-300 transition-all flex items-center gap-1 cursor-pointer"
                        onClick={() => handleDecision(action, 'REJECTED', 'User prefers alternative budget cuts')}
                      >
                        <X size={13} />
                        <span>Dismiss</span>
                      </button>

                      <button
                        className="px-3 py-1.5 rounded-full bg-transparent border border-line-medium text-xs font-sans text-ink-muted hover:text-ink hover:border-line-dark transition-all flex items-center gap-1 cursor-pointer"
                        onClick={() => handleDecision(action, 'MODIFIED', 'User adjusted cap threshold')}
                      >
                        <Sliders size={13} />
                        <span>Customize</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Continuous Learning Engine Showcase */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-ivory border border-line-medium rounded-xl p-6 shadow-subtle space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-line-light">
              <div className="flex items-center gap-2">
                <BrainCircuit size={17} className="text-coral" />
                <h3 className="font-sans text-sm font-semibold text-ink">Continuous Learning Engine</h3>
              </div>
              <span className="font-accent text-[11px] bg-cream border border-line-light text-coral font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Cycle {activeCycle} Active
              </span>
            </div>

            <p className="font-sans text-xs text-ink-muted leading-relaxed">
              The engine records your decisions (accept, reject, customize), dynamically refining sensitivity weights across continuous learning cycles.
            </p>

            {/* Learned Weights Matrix */}
            <div className="bg-cream/40 border border-line-light rounded-lg p-4 space-y-4">
              <h4 className="font-accent text-[11px] uppercase tracking-wider text-ink-muted font-bold">
                Active Learned User Weights
              </h4>

              <div className="space-y-3 font-sans text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-ink font-medium">Subscription Protection</span>
                    <span className="font-accent font-semibold text-ink num-tabular">
                      {Math.round(preferences.subscriptionProtectionWeight * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-line-light rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-coral rounded-full transition-all duration-500" 
                      style={{ width: `${preferences.subscriptionProtectionWeight * 100}%` }} 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-ink font-medium">Dining Budget Flexibility</span>
                    <span className="font-accent font-semibold text-ink num-tabular">
                      {Math.round(preferences.discretionaryCapFlexibility * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-line-light rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                      style={{ width: `${preferences.discretionaryCapFlexibility * 100}%` }} 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-ink font-medium">Peer Split Proactivity</span>
                    <span className="font-accent font-semibold text-ink num-tabular">
                      {Math.round(preferences.peerSplitAggressiveness * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-line-light rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sky-600 rounded-full transition-all duration-500" 
                      style={{ width: `${preferences.peerSplitAggressiveness * 100}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Cycle Demonstration Log */}
            <div className="space-y-3">
              <h4 className="font-accent text-[11px] uppercase tracking-wider text-ink-muted font-bold">
                Adaptation Audit Trail
              </h4>

              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {history.map(item => (
                  <div 
                    key={item.id} 
                    className="p-3 rounded-lg border border-line-light bg-ivory text-xs font-sans space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-accent text-ink-muted">
                      <span className="bg-cream border border-line-light px-1.5 py-0.5 rounded font-mono text-ink">
                        {item.cycle}
                      </span>
                      <span>{item.timestamp}</span>
                    </div>
                    <div className="font-semibold text-ink">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-ink-muted">
                      Decision: <strong className={item.decision === 'ACCEPTED' ? 'text-emerald-700' : 'text-red-600'}>{item.decision}</strong>
                    </div>
                    <div className="text-[11px] text-coral font-medium">
                      Impact: {item.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
