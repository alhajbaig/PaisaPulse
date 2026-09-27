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
      color: '#F97316',
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
      color: '#3B82F6',
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
      color: '#EC4899',
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
      color: '#10B981',
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
    <div>
      {/* Header */}
      <div className="transactions-view-header">
        <div className="view-title-group">
          <h2>{t('actions_title', 'Actions & Continuous Learning Hub')}</h2>
          <p>{t('actions_sub', 'Autonomous shortfall interventions that learn and adapt to your personal values.')}</p>
        </div>

        <button 
          className="btn-secondary"
          onClick={handleResetLearning}
        >
          <RotateCcw size={15} />
          <span>{language === 'hinglish' ? 'Memory Reset Karein' : 'Reset Learning Memory'}</span>
        </button>
      </div>

      <div className="actions-hub-grid">
        {/* Left Col: Shortfall Prevention Center */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1C1917', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} color="#EA580C" />
              <span>Recommended Protective Actions</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#78716C' }}>
              Ranked dynamically by Learned Preferences
            </span>
          </div>

          {rankedActions.map(action => {
            const Icon = action.icon;
            const currentStatus = actionStatuses[action.id];

            return (
              <div 
                key={action.id}
                className="action-card-item"
                style={{
                  opacity: action.suppressedReason && !currentStatus ? 0.65 : 1,
                  background: currentStatus === 'ACCEPTED' ? '#ECFDF5' : (currentStatus === 'REJECTED' ? '#FEF2F2' : '#FFFFFF'),
                  borderColor: currentStatus === 'ACCEPTED' ? '#A7F3D0' : (currentStatus === 'REJECTED' ? '#FECACA' : '#EFE8DF')
                }}
              >
                {/* Header of Action */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: '#FAF8F4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: action.color
                    }}>
                      <Icon size={19} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1C1917' }}>
                          {action.title}
                        </h4>
                        <span style={{
                          fontSize: '0.68rem',
                          background: '#F5EFE6',
                          color: '#78716C',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          Plan Only
                        </span>
                      </div>
                      <span style={{ fontSize: '0.76rem', color: '#78716C' }}>
                        {action.timing}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10B981' }}>
                      +{formatINR(action.amount)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#A8A29E' }}>liquidity recovered</div>
                  </div>
                </div>

                {/* Problem & Tradeoff Grid */}
                <div style={{
                  background: '#FAF8F4',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  marginBottom: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '0.8rem'
                }}>
                  {action.problem && (
                    <div>
                      <span style={{ fontWeight: 700, color: '#991B1B' }}>Problem: </span>
                      <span style={{ color: '#44403C' }}>{action.problem}</span>
                    </div>
                  )}
                  <div>
                    <span style={{ fontWeight: 700, color: '#047857' }}>Action & Recovery: </span>
                    <span style={{ color: '#44403C' }}>{action.impact}</span>
                  </div>
                  {action.tradeoff && (
                    <div>
                      <span style={{ fontWeight: 700, color: '#B45309' }}>Tradeoff: </span>
                      <span style={{ color: '#44403C' }}>{action.tradeoff}</span>
                    </div>
                  )}
                </div>

                {/* Badges */}
                {action.recommendedBadge && !action.suppressedReason && (
                  <div style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#059669',
                    background: '#D1FAE5',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginBottom: '8px'
                  }}>
                    <Sparkles size={12} />
                    <span>{action.recommendedBadge}</span>
                  </div>
                )}

                {action.suppressedReason && (
                  <div style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#92400E',
                    background: '#FEF3C7',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    marginBottom: '8px'
                  }}>
                    {action.suppressedReason}
                  </div>
                )}

                {/* Status or Action Buttons */}
                {currentStatus ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    marginTop: '10px',
                    color: currentStatus === 'ACCEPTED' ? '#059669' : '#DC2626'
                  }}>
                    {currentStatus === 'ACCEPTED' ? <CheckCircle2 size={16} /> : <X size={16} />}
                    <span>Decision Recorded: {currentStatus === 'ACCEPTED' ? 'Applied to Plan' : currentStatus}</span>
                  </div>
                ) : (
                  <div className="action-buttons-row">
                    <button
                      className="btn-primary"
                      onClick={() => handleDecision(action, 'ACCEPTED')}
                      style={{ padding: '7px 14px', fontSize: '0.8rem' }}
                    >
                      <Check size={14} />
                      <span>Apply to Plan</span>
                    </button>

                    <button
                      className="btn-secondary"
                      onClick={() => handleDecision(action, 'REJECTED', 'User prefers alternative budget cuts')}
                      style={{ padding: '7px 12px', fontSize: '0.8rem', color: '#DC2626' }}
                    >
                      <X size={14} />
                      <span>Dismiss</span>
                    </button>

                    <button
                      className="btn-secondary"
                      onClick={() => handleDecision(action, 'MODIFIED', 'User adjusted cap threshold')}
                      style={{ padding: '7px 12px', fontSize: '0.8rem' }}
                    >
                      <Sliders size={14} />
                      <span>Customize</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Col: Continuous Learning Engine Showcase */}
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrainCircuit size={20} color="#EA580C" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1C1917' }}>Continuous Learning Engine</h3>
              </div>
              <span style={{
                background: '#FEEEDD',
                color: '#EA580C',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.76rem',
                fontWeight: 800
              }}>
                Cycle {activeCycle} Active
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#78716C', marginBottom: '16px' }}>
              The system records whether users accept, reject, or modify actions, adjusting sensitivity weights across 2+ continuous learning cycles.
            </p>

            {/* Learned Weights Matrix */}
            <div style={{
              background: '#FAF8F4',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid #EFE8DF',
              marginBottom: '16px'
            }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#44403C', textTransform: 'uppercase', marginBottom: '12px' }}>
                Active Learned User Weights:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600 }}>Subscription Protection Weight</span>
                    <span style={{ fontWeight: 800, color: preferences.subscriptionProtectionWeight > 0.7 ? '#EF4444' : '#1C1917' }}>
                      {Math.round(preferences.subscriptionProtectionWeight * 100)}%
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#E5E5E5', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${preferences.subscriptionProtectionWeight * 100}%`, height: '100%', background: '#EF4444' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600 }}>Dining Budget Flexibility</span>
                    <span style={{ fontWeight: 800, color: '#10B981' }}>
                      {Math.round(preferences.discretionaryCapFlexibility * 100)}%
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#E5E5E5', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${preferences.discretionaryCapFlexibility * 100}%`, height: '100%', background: '#10B981' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600 }}>Peer Split Proactivity</span>
                    <span style={{ fontWeight: 800, color: '#3B82F6' }}>
                      {Math.round(preferences.peerSplitAggressiveness * 100)}%
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#E5E5E5', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${preferences.peerSplitAggressiveness * 100}%`, height: '100%', background: '#3B82F6' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Cycle Demonstration Log */}
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#44403C', textTransform: 'uppercase', marginBottom: '10px' }}>
                Demonstrated Adaptation Audit Trail:
              </h4>

              <div className="learning-history-box">
                {history.map(item => (
                  <div key={item.id} className="history-item">
                    <div className="history-item-header">
                      <span style={{ fontSize: '0.72rem', background: '#18181B', color: '#FFF', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        {item.cycle}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#A8A29E' }}>{item.timestamp}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1C1917', marginBottom: '2px' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#78716C', marginBottom: '4px' }}>
                      Decision: <strong style={{ color: item.decision === 'ACCEPTED' ? '#059669' : '#DC2626' }}>{item.decision}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#EA580C', fontWeight: 600 }}>
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
