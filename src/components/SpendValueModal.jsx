import React, { useState, useMemo } from 'react';
import { 
  X, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingDown, 
  ArrowRight, 
  CheckCircle2, 
  Sliders, 
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Coffee,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatINR } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { 
  QUADRANTS, 
  VALUE_RATINGS, 
  computeSpendValueMap, 
  saveSpendValueFeedback 
} from '../engine/spendValueEngine.js';
import { useLanguage } from '../services/i18n.jsx';

export default function SpendValueModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onUpdateUserFeedback 
}) {
  const { language } = useLanguage();
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'HIGH_VALUE_LOW_COST' | 'HIGH_VALUE_HIGH_COST' | 'LOW_VALUE_LOW_COST' | 'LOW_VALUE_HIGH_COST' | 'PERSPECTIVES'
  const [localFeedback, setLocalFeedback] = useState(() => {
    return currentUser?.spendValueFeedback || {};
  });

  const transactions = currentUser?.transactions || [];
  const userId = currentUser?.id || currentUser?.email || 'default';

  // Compute live value map from transactions and current feedback state
  const valueModel = useMemo(() => {
    return computeSpendValueMap(transactions, localFeedback);
  }, [transactions, localFeedback]);

  const { clusters = [], quadrants = {}, insights = {}, totalMonthlyDiscretionary = 0 } = valueModel;

  // Handle user rating feedback (❤️ Valuable, 😐 Neutral, ❌ Not Worth It)
  const handleRateCluster = (clusterId, rating) => {
    soundFX.playClick();
    if (rating === VALUE_RATINGS.VALUABLE) {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }

    const updated = saveSpendValueFeedback(userId, clusterId, rating);
    setLocalFeedback({ ...localFeedback, [clusterId]: rating });

    if (onUpdateUserFeedback) {
      onUpdateUserFeedback(clusterId, rating);
    }
  };

  // Filtered clusters based on active tab
  const displayClusters = useMemo(() => {
    if (activeTab === 'ALL' || activeTab === 'PERSPECTIVES') return clusters;
    return quadrants[activeTab] || [];
  }, [activeTab, clusters, quadrants]);

  return (
    <div className="fixed inset-0 bg-ink/65 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-ivory border-2 border-line-medium rounded-[32px] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="p-6 border-b border-line-light/80 bg-gradient-to-r from-cream/90 via-cream/50 to-ivory flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ivory border border-line-medium text-[11px] font-accent uppercase tracking-wider text-coral font-bold mb-2 shadow-xs">
              <Heart className="w-3.5 h-3.5 fill-coral text-coral" />
              <span>{language === 'hinglish' ? 'AI Cashflow Guardian · Spend Value Map' : 'AI Cashflow Guardian · Spend Value Map'}</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl text-ink leading-tight">
              {language === 'hinglish' ? 'Aapka Paisa Kahan Zaroori Hai' : 'Where Your Money Matters'}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-ink-muted mt-1 max-w-xl">
              {language === 'hinglish' 
                ? <><strong>Kharcha ≠ Khushi (Value).</strong> PaisaPulse aapki aadat aur feedback se seekhta hai ki aapke liye kya zaroori hai, taaki bina sukoon gawaye bindaas paisa bacha sakein.</>
                : <><strong>Money Cost ≠ Personal Value.</strong> PaisaPulse learns what you actually value from routine consistency and your feedback, ensuring you save without cutting what you love.</>}
            </p>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-cream hover:bg-peach/60 border border-line-medium flex items-center justify-center text-ink-muted hover:text-ink transition-colors cursor-pointer shrink-0"
            title="Close Spend Value Map"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-left">
          
          {/* Hero Companion Insight: "Don't Cut This" & "Where To Cut" */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Don't Cut This Hero Card */}
            {insights?.dontCutItem && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-emerald-50/60 to-ivory border border-emerald-200/90 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/70 border border-emerald-300 text-[10px] font-accent uppercase tracking-wider text-emerald-900 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'hinglish' ? 'Isko Bilkul Mat Roko' : "Don't Cut This"}</span>
                  </div>
                  <span className="text-xl">{insights.dontCutItem.emoji}</span>
                </div>
                <h4 className="font-editorial text-xl text-emerald-950 font-semibold mb-1">
                  {insights.dontCutItem.name}
                </h4>
                <p className="font-sans text-xs text-emerald-900 leading-relaxed mb-3">
                  {insights.dontCutReason}
                </p>
                <div className="flex items-center justify-between text-[11px] font-sans font-bold text-emerald-800 pt-2 border-t border-emerald-200/60">
                  <span>{language === 'hinglish' ? 'Kharcha:' : 'Monthly Cost:'} {formatINR(insights.dontCutItem.monthlyCost)}{language === 'hinglish' ? '/mahina' : ''}</span>
                  <span className="bg-emerald-200/60 px-2 py-0.5 rounded-full">
                    {language === 'hinglish' ? 'Value Score:' : 'Value Score:'} {insights.dontCutItem.personalValueScore}/100
                  </span>
                </div>
              </div>
            )}

            {/* Where To Cut Hero Card */}
            {insights?.cutItem && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 via-rose-50/60 to-ivory border border-rose-200/90 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100/70 border border-rose-300 text-[10px] font-accent uppercase tracking-wider text-rose-900 font-bold">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-700" />
                    <span>{language === 'hinglish' ? 'Yahan Bachav Karein' : 'Primary Cut Candidate'}</span>
                  </div>
                  <span className="text-xl">{insights.cutItem.emoji}</span>
                </div>
                <h4 className="font-editorial text-xl text-rose-950 font-semibold mb-1">
                  {insights.cutItem.name}
                </h4>
                <p className="font-sans text-xs text-rose-900 leading-relaxed mb-3">
                  {insights.cutAdvice}
                </p>
                <div className="flex items-center justify-between text-[11px] font-sans font-bold text-rose-800 pt-2 border-t border-rose-200/60">
                  <span>{language === 'hinglish' ? 'Kharcha:' : 'Monthly:'} {formatINR(insights.cutItem.monthlyCost)}{language === 'hinglish' ? '/mahina' : ''}</span>
                  <span className="bg-rose-200/60 px-2 py-0.5 rounded-full">
                    {language === 'hinglish' ? 'Bach sakti hai: ~' : 'Potential Savings: ~'}{formatINR(insights.potentialMonthlySavings || 500)}{language === 'hinglish' ? '/mahina' : '/mo'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Core Philosophy Banner */}
          <div className="p-4 rounded-2xl bg-cream/70 border border-line-medium flex items-center justify-between gap-4 text-xs font-sans text-ink-muted">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-coral shrink-0" />
              <span>
                {language === 'hinglish' ? (
                  <>
                    <strong>Purane apps bolte hain:</strong> &ldquo;Har kharcha band kardo.&rdquo; <br />
                    <strong>PaisaPulse bolta hai:</strong> &ldquo;Jisse khushi mile usse bacha ke rakho. Sirf faltu kharcha roko.&rdquo;
                  </>
                ) : (
                  <>
                    <strong>Traditional apps say:</strong> &ldquo;Cut whatever costs money.&rdquo; <br />
                    <strong>PaisaPulse says:</strong> &ldquo;Protect what brings you value. Only optimize what isn't worth it.&rdquo;
                  </>
                )}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-accent uppercase tracking-wider block text-ink-subtle">
                {language === 'hinglish' ? 'Discretionary Kharcha' : 'Discretionary Pool'}
              </span>
              <span className="font-bold text-ink text-sm num-tabular">
                {formatINR(totalMonthlyDiscretionary)}{language === 'hinglish' ? '/mahina' : '/mo'}
              </span>
            </div>
          </div>

          {/* Matrix Filter Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-accent uppercase tracking-wider text-ink-muted font-bold">
              <span>Value × Cost Matrix Quadrants:</span>
              <span className="text-coral">Click buttons below to train AI</span>
            </div>

            <div className="flex flex-wrap gap-2 pb-1">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setActiveTab('ALL');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-ink text-ivory font-bold shadow-xs'
                    : 'bg-ivory border border-line-medium text-ink-muted hover:text-ink'
                }`}
              >
                All Spending ({clusters.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setActiveTab('HIGH_VALUE_LOW_COST');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
                  activeTab === 'HIGH_VALUE_LOW_COST'
                    ? 'bg-emerald-800 text-ivory font-bold shadow-xs'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                }`}
              >
                ❤️ Keep — High Value / Low Cost ({quadrants.HIGH_VALUE_LOW_COST?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setActiveTab('HIGH_VALUE_HIGH_COST');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
                  activeTab === 'HIGH_VALUE_HIGH_COST'
                    ? 'bg-blue-800 text-ivory font-bold shadow-xs'
                    : 'bg-blue-50 border border-blue-200 text-blue-900 hover:bg-blue-100'
                }`}
              >
                💎 Meaningful ({quadrants.HIGH_VALUE_HIGH_COST?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setActiveTab('LOW_VALUE_LOW_COST');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
                  activeTab === 'LOW_VALUE_LOW_COST'
                    ? 'bg-amber-800 text-ivory font-bold shadow-xs'
                    : 'bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100'
                }`}
              >
                ⚠️ Small Leaks ({quadrants.LOW_VALUE_LOW_COST?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setActiveTab('LOW_VALUE_HIGH_COST');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
                  activeTab === 'LOW_VALUE_HIGH_COST'
                    ? 'bg-rose-800 text-ivory font-bold shadow-xs'
                    : 'bg-rose-50 border border-rose-200 text-rose-900 hover:bg-rose-100'
                }`}
              >
                🚨 Review First ({quadrants.LOW_VALUE_HIGH_COST?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setActiveTab('PERSPECTIVES');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
                  activeTab === 'PERSPECTIVES'
                    ? 'bg-coral text-ivory font-bold shadow-xs'
                    : 'bg-peach/40 border border-line-medium text-coral hover:bg-peach/70'
                }`}
              >
                ⚖️ Dual Perspectives View
              </button>
            </div>
          </div>

          {/* Perspective View: Where Money Goes vs What Money Means */}
          {activeTab === 'PERSPECTIVES' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Where Money Goes */}
              <div className="p-5 rounded-2xl bg-ivory border-2 border-line-medium space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-line-light">
                  <div>
                    <h5 className="font-editorial text-xl text-ink font-semibold">Where Your Money Goes</h5>
                    <span className="text-[11px] text-ink-muted">Ranked strictly by monetary cost (₹ / month)</span>
                  </div>
                  <span className="text-xs font-accent uppercase text-ink-muted font-bold">1. Financial Cost</span>
                </div>

                <div className="space-y-3">
                  {valueModel.rankedByCost.map((item, idx) => (
                    <div key={item.id} className="p-3 rounded-xl bg-cream/50 border border-line-light flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-xs font-accent text-ink-muted font-bold">#{idx + 1}</span>
                        <span className="text-xl">{item.emoji}</span>
                        <div>
                          <div className="font-bold text-xs text-ink">{item.name}</div>
                          <div className="text-[10px] text-ink-muted">{item.transactionCount} transactions · avg {formatINR(item.avgAmount)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-ink num-tabular">{formatINR(item.monthlyCost)}/mo</div>
                        <span className="text-[10px] text-ink-muted">{Math.round((item.monthlyCost / Math.max(1, totalMonthlyDiscretionary)) * 100)}% of total</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* What Money Means */}
              <div className="p-5 rounded-2xl bg-ivory border-2 border-coral/30 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-line-light">
                  <div>
                    <h5 className="font-editorial text-xl text-ink font-semibold">What Money Means To You</h5>
                    <span className="text-[11px] text-coral font-medium">Ranked by learned Personal Value Score (0–100)</span>
                  </div>
                  <span className="text-xs font-accent uppercase text-coral font-bold">2. Personal Value</span>
                </div>

                <div className="space-y-3">
                  {valueModel.rankedByValue.map((item, idx) => (
                    <div key={item.id} className="p-3 rounded-xl bg-cream/50 border border-line-light flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-xs font-accent text-coral font-bold">#{idx + 1}</span>
                        <span className="text-xl">{item.emoji}</span>
                        <div>
                          <div className="font-bold text-xs text-ink">{item.name}</div>
                          <div className="text-[10px] text-ink-muted">{item.quadrant?.title}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs num-tabular">
                          <Heart className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                          <span>{item.personalValueScore} / 100</span>
                        </div>
                        <span className="text-[10px] text-ink-subtle block mt-0.5">{item.confidence} confidence</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Quadrant Cluster Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayClusters.map((cluster) => {
                const q = cluster.quadrant;
                const isRatedValuable = cluster.userRating === VALUE_RATINGS.VALUABLE;
                const isRatedNeutral = cluster.userRating === VALUE_RATINGS.NEUTRAL;
                const isRatedNotWorthIt = cluster.userRating === VALUE_RATINGS.NOT_WORTH_IT;

                return (
                  <div
                    key={cluster.id}
                    className="p-5 rounded-2xl bg-ivory border-2 border-line-medium hover:border-coral/60 transition-all shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-accent uppercase tracking-wider font-bold border"
                          style={{
                            backgroundColor: q.bgColor,
                            color: q.color,
                            borderColor: q.borderColor
                          }}
                        >
                          {q.emoji} {q.title}
                        </span>

                        <span className="text-[10px] font-sans text-ink-muted bg-cream px-2 py-0.5 rounded-full border border-line-light">
                          {cluster.confidence === 'LOW' ? 'It looks like...' : `${cluster.confidence} Confidence`}
                        </span>
                      </div>

                      {/* Title & Cost */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{cluster.emoji}</span>
                          <div>
                            <h4 className="font-bold text-sm text-ink">{cluster.name}</h4>
                            <p className="text-[11px] text-ink-muted">{cluster.defaultDescription}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold text-sm text-ink num-tabular">
                            {formatINR(cluster.monthlyCost)}
                            <span className="text-[10px] text-ink-muted font-normal">/mo</span>
                          </div>
                          <span className="text-[10px] text-ink-subtle">
                            {cluster.transactionCount}x · ~{formatINR(cluster.avgAmount)}/order
                          </span>
                        </div>
                      </div>

                      {/* Personal Value Meter */}
                      <div className="mt-3.5 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-sans">
                          <span className="text-ink-muted font-medium">Personal Value Score:</span>
                          <span className="font-bold text-ink num-tabular">{cluster.personalValueScore} / 100</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-line-light overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${cluster.personalValueScore}%`,
                              backgroundColor: cluster.personalValueScore >= 70 ? '#059669' : cluster.personalValueScore >= 50 ? '#2563EB' : cluster.personalValueScore >= 35 ? '#D97706' : '#DC2626'
                            }}
                          />
                        </div>
                        <div className="text-[10px] text-ink-subtle italic">
                          {cluster.feedbackImpact}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Feedback Loop (Train the AI) */}
                    <div className="pt-3 border-t border-line-light/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-accent uppercase tracking-wider text-ink-muted font-bold">
                          Is this worth your money?
                        </span>
                        {cluster.userRating && (
                          <span className="text-[10px] text-emerald-700 font-semibold">Trained ✓</span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRateCluster(cluster.id, VALUE_RATINGS.VALUABLE)}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-sans font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            isRatedValuable
                              ? 'bg-emerald-600 text-ivory border-emerald-700 shadow-xs scale-102'
                              : 'bg-ivory border-line-medium text-ink-muted hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                          }`}
                        >
                          <span>❤️</span>
                          <span>Valuable</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRateCluster(cluster.id, VALUE_RATINGS.NEUTRAL)}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-sans font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            isRatedNeutral
                              ? 'bg-ink text-ivory border-ink shadow-xs scale-102'
                              : 'bg-ivory border-line-medium text-ink-muted hover:text-ink hover:border-line-dark hover:bg-cream/50'
                          }`}
                        >
                          <span>😐</span>
                          <span>Neutral</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRateCluster(cluster.id, VALUE_RATINGS.NOT_WORTH_IT)}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-sans font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            isRatedNotWorthIt
                              ? 'bg-rose-600 text-ivory border-rose-700 shadow-xs scale-102'
                              : 'bg-ivory border-line-medium text-ink-muted hover:text-rose-700 hover:border-rose-300 hover:bg-rose-50/50'
                          }`}
                        >
                          <span>❌</span>
                          <span>Not Worth It</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Privacy & Safety Guarantee */}
          <div className="p-4 rounded-2xl bg-ivory border border-line-light text-[11px] font-sans text-ink-subtle flex items-start gap-2.5">
            <Info className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
            <p>
              <strong>Privacy & Non-Judgmental Intelligence:</strong> PaisaPulse never infers health, religion, or personal lifestyle traits. Scores represent mathematical behavioral consistency and your explicit ratings. We never label spending "wasteful"—only "low-value according to your feedback".
            </p>
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-line-light bg-cream/40 flex items-center justify-between gap-4">
          <div className="text-xs font-sans text-ink-muted">
            {clusters.filter(c => c.userRating).length} of {clusters.length} categories trained by you
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playSuccess();
              onClose();
            }}
            className="px-5 py-2.5 rounded-full bg-ink text-ivory hover:bg-coral text-xs font-sans font-bold transition-all shadow-xs cursor-pointer hover:scale-102"
          >
            Apply & Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
