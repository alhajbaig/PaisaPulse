// Continuous Learning Engine for PaisaPulse AI Cashflow Guardian
// Demonstrates how user feedback (Accept, Reject, Modify) refines future risk & protective behaviors

export class ContinuousLearningEngine {
  constructor() {
    this.memory = {
      userPreferences: {
        subscriptionProtectionWeight: 0.3, // initially neutral
        discretionaryCapFlexibility: 0.5,
        peerSplitAggressiveness: 0.4,
        bufferCompromiseTolerance: 0.2
      },
      decisionHistory: [
        {
          id: 'hist_init',
          cycle: 'Baseline',
          timestamp: '2025-09-15 14:20',
          actionType: 'notification_frequency',
          title: 'Daily morning liquidity brief',
          decision: 'ACCEPTED',
          feedbackText: 'Enabled 8:00 AM WhatsApp/Push summary',
          impact: 'Alert responsiveness calibrated'
        }
      ],
      currentCycle: 1, // Cycle 1 -> Cycle 2 demonstration
      learningInsights: [
        "Guardian has learned your typical weekend spending is 31% higher than weekdays.",
        "Subscription auto-debit dates are pinned to essential liquidity buffers."
      ]
    };
  }

  getPreferences() {
    return this.memory.userPreferences;
  }

  getDecisionHistory() {
    return this.memory.decisionHistory;
  }

  getCycle() {
    return this.memory.currentCycle;
  }

  // Record user decision on a proposed protective intervention
  recordDecision({ actionId, actionType, title, decision, modificationDetails = null }) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today';
    
    let impactSummary = '';

    if (decision === 'REJECTED') {
      if (actionType === 'pause_subscription') {
        // User rejects pausing subscription (Cycle 1 demonstration)
        this.memory.userPreferences.subscriptionProtectionWeight = 0.95; // Strongly protect subscriptions
        impactSummary = 'Learned: High emotional priority on streaming/subscriptions. Will avoid suggesting subscription pauses in future shortfalls.';
        this.memory.learningInsights.unshift(
          "Learning Cycle 1 Complete: User strictly protects subscriptions. Weight increased to 0.95."
        );
        this.memory.currentCycle = 2; // Advanced to Cycle 2!
      } else if (actionType === 'cap_dining') {
        this.memory.userPreferences.discretionaryCapFlexibility = 0.15;
        impactSummary = 'Learned: Food budget cannot be compressed below current baseline.';
      }
    } else if (decision === 'ACCEPTED') {
      if (actionType === 'cap_dining') {
        this.memory.userPreferences.discretionaryCapFlexibility = 0.85;
        impactSummary = 'Learned: High willingness to adjust dining/delivery expenses during tight windows.';
        this.memory.learningInsights.unshift(
          "Adaptive Rule: Dining flex cap preferred over fixed commitment changes."
        );
      } else if (actionType === 'peer_split') {
        this.memory.userPreferences.peerSplitAggressiveness = 0.9;
        impactSummary = 'Learned: Proactively remind roommate/friend splits when liquidity dips below safety buffer.';
        this.memory.learningInsights.unshift(
          "Learning Cycle 2 Active: Guardian prioritizes peer split reminders & discretionary deferrals."
        );
      }
    } else if (decision === 'MODIFIED') {
      impactSummary = `Learned: User customized parameters (${modificationDetails || 'adjusted amount'}). Model threshold calibrated.`;
      this.memory.currentCycle = Math.max(this.memory.currentCycle, 2);
    }

    const entry = {
      id: `hist_${Date.now()}`,
      cycle: `Cycle ${this.memory.currentCycle}`,
      timestamp,
      actionId,
      actionType,
      title,
      decision,
      modificationDetails,
      impact: impactSummary
    };

    this.memory.decisionHistory.unshift(entry);
    return entry;
  }

  // Rank and filter protective actions based on learned preferences
  filterAndRankActions(candidateActions) {
    const prefs = this.memory.userPreferences;
    
    return candidateActions
      .map(action => {
        let score = action.baseScore || 50;

        if (action.type === 'pause_subscription') {
          // If user previously rejected, heavily penalize or suppress!
          if (prefs.subscriptionProtectionWeight > 0.7) {
            score -= 60; // Demote heavily
            action.suppressedReason = "Suppressed: You previously indicated keeping subscriptions active is non-negotiable.";
          }
        }

        if (action.type === 'cap_dining') {
          if (prefs.discretionaryCapFlexibility > 0.6) {
            score += 35; // Boost preferred mitigation
            action.recommendedBadge = "Learned Match: Fits your habit of dining budget flexibility";
          }
        }

        if (action.type === 'peer_split') {
          if (prefs.peerSplitAggressiveness > 0.7) {
            score += 40;
            action.recommendedBadge = "Learned Match: Fastest cash recovery with zero lifestyle cut";
          }
        }

        return { ...action, currentScore: score };
      })
      .sort((a, b) => b.currentScore - a.currentScore);
  }

  resetLearning() {
    this.memory.userPreferences = {
      subscriptionProtectionWeight: 0.3,
      discretionaryCapFlexibility: 0.5,
      peerSplitAggressiveness: 0.4,
      bufferCompromiseTolerance: 0.2
    };
    this.memory.currentCycle = 1;
    this.memory.decisionHistory = [
      {
        id: 'hist_init',
        cycle: 'Baseline',
        timestamp: 'Initial state',
        actionType: 'notification_frequency',
        title: 'Daily morning liquidity brief',
        decision: 'ACCEPTED',
        impact: 'Baseline preferences loaded'
      }
    ];
    this.memory.learningInsights = [
      "Guardian observed: Weekend spending is 31% higher than weekdays.",
      "Subscription auto-debit dates are pinned to essential liquidity buffers."
    ];
  }
}

export const globalLearningEngine = new ContinuousLearningEngine();
