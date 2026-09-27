// PaisaPulse Recommendation Engine
// Generates realistic, actionable cashflow interventions with tradeoff analysis and feedback learning

import { formatINR } from '../../engine/cashflowEngine.js';

const PREFERENCES_KEY = 'paisapulse_learned_preferences';

// Load or initialize user's behavioral preference profile
export function getUserPreferences() {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  return {
    subscription_protection: 0.8, // 0.0 to 1.0 (High = refuses to cancel Netflix/Spotify)
    dining_flexibility: 0.6,      // 0.0 to 1.0 (High = willing to reduce food delivery)
    purchase_delay_tolerance: 0.5,
    buffer_preference: 0.9,       // High = prioritizes safety buffer strictly
    feedbackHistory: []
  };
}

// Record user feedback and adapt behavioral preferences
export function recordActionFeedback(actionId, decision, details = {}) {
  const prefs = getUserPreferences();
  const timestamp = new Date().toISOString();

  if (actionId === 'cap_dining') {
    if (decision === 'APPLY') {
      prefs.dining_flexibility = Math.min(1.0, prefs.dining_flexibility + 0.15);
    } else if (decision === 'REJECT') {
      prefs.dining_flexibility = Math.max(0.1, prefs.dining_flexibility - 0.25);
    }
  } else if (actionId === 'pause_subscription') {
    if (decision === 'REJECT') {
      prefs.subscription_protection = Math.min(1.0, prefs.subscription_protection + 0.20);
    } else if (decision === 'APPLY') {
      prefs.subscription_protection = Math.max(0.2, prefs.subscription_protection - 0.20);
    }
  } else if (actionId === 'delay_purchase') {
    if (decision === 'APPLY') {
      prefs.purchase_delay_tolerance = Math.min(1.0, prefs.purchase_delay_tolerance + 0.15);
    }
  }

  prefs.feedbackHistory.unshift({
    actionId,
    decision,
    details,
    timestamp
  });

  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences:', e);
  }

  return prefs;
}

/**
 * Generates Top 1-2 Best Actions for Dashboard Decision Center
 */
export function generateBestActions({
  forecastResult,
  safeToSpendResult,
  currentPersona,
  empiricalDailyBurn = 420
}) {
  const prefs = getUserPreferences();
  const { minProjectedBalance, shortfallAmount, shortfallDay } = forecastResult;
  const buffer = currentPersona.safetyBuffer || 3000;
  const isShortfall = minProjectedBalance < buffer;

  const candidateActions = [];

  // Action 1: Discretionary Dining Budget Cap
  const currentDiningAvg = Math.max(250, Math.round(empiricalDailyBurn * 0.65));
  const suggestedCap = Math.round(currentDiningAvg * 0.65);
  const dailySavings = currentDiningAvg - suggestedCap;
  const durationDays = shortfallDay ? Math.min(7, Math.max(3, shortfallDay.day)) : 4;
  const totalDiningRecovered = dailySavings * durationDays;

  candidateActions.push({
    id: 'cap_dining',
    title: 'Temporary Dining Budget Cap',
    badge: 'Discretionary Adjustment',
    problem: isShortfall 
      ? `Projected balance drops ${formatINR(shortfallAmount)} below safety buffer on ${shortfallDay?.dayLabel || 'Day 4'}.`
      : 'Weekend dining velocity is currently +28% higher than weekday baseline.',
    action: `Reduce food delivery / cafe spend from ${formatINR(currentDiningAvg)}/day to ${formatINR(suggestedCap)}/day for the next ${durationDays} days.`,
    liquidityImpact: `+${formatINR(totalDiningRecovered)} liquidity retained`,
    tradeoff: `Stick to home / hostel mess food for ${durationDays} days.`,
    score: 80 * prefs.dining_flexibility,
    type: 'cap_dining',
    simulatedEffect: { burnRateMultiplier: 0.65 }
  });

  // Action 2: Collect Roommate / Peer Splitwise Dues
  candidateActions.push({
    id: 'peer_split',
    title: 'Recover Pending Peer Splitwise Dues',
    badge: 'Immediate Cash Recovery',
    problem: 'Shared food and utility bills from last week are still uncollected from friends.',
    action: 'Send a quick UPI payment reminder to roommates for pending ₹850 split dues.',
    liquidityImpact: '+₹850 immediate cash inflow',
    tradeoff: 'Zero lifestyle sacrifice; simply requires following up on money already owed to you.',
    score: 85,
    type: 'peer_split',
    simulatedEffect: { instantRecovery: 850 }
  });

  // Action 3: Pause Non-Essential Subscriptions (only if user doesn't strictly protect them)
  if (prefs.subscription_protection < 0.85) {
    candidateActions.push({
      id: 'pause_subscription',
      title: 'Pause Non-Essential Subscriptions for 1 Billing Cycle',
      badge: 'Fixed Bill Deferral',
      problem: 'Upcoming subscription auto-debit falls right before your next stipend arrives.',
      action: 'Temporarily pause Netflix Premium or gym subscription before next auto-debit.',
      liquidityImpact: '+₹649 protected buffer',
      tradeoff: 'Loss of streaming access until next salary cycle.',
      score: 50 * (1.0 - prefs.subscription_protection),
      type: 'pause_subscription',
      simulatedEffect: { pausedCommitmentIds: ['com_2'] }
    });
  }

  // Sort by score taking into account learned preferences
  return candidateActions.sort((a, b) => b.score - a.score).slice(0, 2);
}
