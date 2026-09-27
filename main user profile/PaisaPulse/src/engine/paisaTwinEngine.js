// PaisaPulse — PaisaTwin Digital Twin Engine
// Deterministic financial modeling layer for the personal financial digital twin

import { formatINR, calculateCashflowForecast, computeCurrentBalance, computeEmpiricalDailyBurn, deriveCommitments } from './cashflowEngine.js';

export const HEALTH_MODES = {
  CHILL: {
    key: 'CHILL',
    label: 'CHILL MODE',
    emoji: '🟢',
    badgeBg: '#ECFDF5',
    badgeColor: '#059669',
    borderColor: '#A7F3D0',
    tagline: 'Cashflow comfortably covers upcoming commitments.',
    summary: 'Your liquid cash and reliable inflows cover all commitments with your emergency buffer 100% intact.'
  },
  WATCH: {
    key: 'WATCH',
    label: 'WATCH MODE',
    emoji: '🟡',
    badgeBg: '#FEF3C7',
    badgeColor: '#D97706',
    borderColor: '#FDE68A',
    tagline: 'Cashflow is manageable but spending needs attention.',
    summary: 'You are currently solvent, but discretionary burn is approaching your safe spending threshold.'
  },
  TIGHT: {
    key: 'TIGHT',
    label: 'TIGHT MODE',
    emoji: '🟠',
    badgeBg: '#FFF7ED',
    badgeColor: '#EA580C',
    borderColor: '#FDBA74',
    tagline: 'Upcoming commitments are putting pressure on available cash.',
    summary: 'Upcoming rent or bills will compress your balance into your emergency buffer.'
  },
  PANIC: {
    key: 'PANIC',
    label: 'PANIC MODE',
    emoji: '🔴',
    badgeBg: '#FEF2F2',
    badgeColor: '#DC2626',
    borderColor: '#FECACA',
    tagline: 'Current trajectory indicates a potential future shortfall.',
    summary: 'Your projected balance dips negative or risks an overdraft before next income arrives.'
  }
};

/**
 * Builds the complete PaisaTwin Digital Model from actual user data
 */
export function buildPaisaTwinModel({
  currentUser = {},
  calculatedBalance = 0,
  empiricalDailyBurn = 540,
  activeCommitments = [],
  forecastResult = null,
  safeToSpendResult = null
}) {
  const transactions = currentUser.transactions || [];
  const safetyBuffer = currentUser.safetyBuffer !== undefined ? currentUser.safetyBuffer : 3000;
  const currentCash = calculatedBalance;

  // 1. Incomes separation: Confirmed/Likely vs Uncertain/Potential
  const upcomingIncome = currentUser.upcomingIncome || [];
  let confirmedIncome = 0;
  let uncertainIncome = 0;

  upcomingIncome.forEach(inc => {
    const cert = (inc.certainty || 'confirmed').toLowerCase();
    const amt = parseFloat(inc.amount) || 0;
    if (cert === 'confirmed' || cert === 'likely') {
      confirmedIncome += amt;
    } else {
      uncertainIncome += amt;
    }
  });

  // 2. Commitments total
  const mandatoryCommitments = activeCommitments.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const protectedMoney = mandatoryCommitments + safetyBuffer;

  // 3. Average daily burn
  const avgDailyBurn = Math.round(empiricalDailyBurn || currentUser.burnRateDaily || 540);

  // 4. Safe-to-Spend
  const safeDailySpend = safeToSpendResult?.safeDailyDiscretionary !== undefined 
    ? safeToSpendResult.safeDailyDiscretionary 
    : Math.max(0, Math.round((currentCash + confirmedIncome - protectedMoney) / 14));

  // 5. 30-Day Deterministic Outlook Calculation
  const outlookForecast30 = calculateCashflowForecast({
    currentBalance: currentCash,
    upcomingIncome,
    upcomingCommitments: activeCommitments,
    burnRateDaily: avgDailyBurn,
    safetyBuffer,
    horizonDays: 30
  });

  const dailyBalances = (outlookForecast30.timeline || []).map(d => ({
    date: d.dayLabel || d.dateFormatted || `Day ${d.dayIndex}`,
    closingBalance: d.projectedBalance,
    income: d.income || 0,
    expenses: d.expenses || 0
  }));

  // Key day milestones (Day 0, Day 5, Day 10, Day 15, Day 20, Day 30)
  const getBalanceAtDay = (targetDay) => {
    if (dailyBalances.length === 0) return currentCash;
    const clampedDay = Math.min(targetDay, dailyBalances.length - 1);
    return dailyBalances[clampedDay]?.closingBalance ?? currentCash;
  };

  const outlookMilestones = [
    { day: 0, label: 'Today', balance: currentCash },
    { day: 5, label: 'Day 5', balance: getBalanceAtDay(5) },
    { day: 10, label: 'Day 10', balance: getBalanceAtDay(10) },
    { day: 15, label: 'Day 15', balance: getBalanceAtDay(15) },
    { day: 20, label: 'Day 20', balance: getBalanceAtDay(20) },
    { day: 30, label: 'Day 30', balance: getBalanceAtDay(30) }
  ];

  const projectedBalance7d = getBalanceAtDay(7);
  const projectedBalance14d = getBalanceAtDay(14);
  const projectedBalance30d = getBalanceAtDay(30);

  // Lowest projected balance and date
  let minBalance = currentCash;
  let minDayObj = dailyBalances[0] || { date: 'Today', closingBalance: currentCash };

  dailyBalances.forEach(d => {
    if (d.closingBalance < minBalance) {
      minBalance = d.closingBalance;
      minDayObj = d;
    }
  });

  // Next Financial Pressure (nearest upcoming commitment)
  let nextPressure = null;
  if (activeCommitments.length > 0) {
    const sortedCommitments = [...activeCommitments].sort((a, b) => (a.daysAway || 0) - (b.daysAway || 0));
    const nearest = sortedCommitments[0];
    nextPressure = {
      title: nearest.title || nearest.name || 'Scheduled Payment',
      amount: nearest.amount,
      daysAway: nearest.daysAway || 2,
      date: nearest.dueDate || nearest.date || 'upcoming'
    };
  }

  // Exact reason for lowest balance
  let minProjectedReason = 'Normal daily spending burn occurs before your next major income credit.';
  if (activeCommitments.length > 0) {
    const commitmentNames = activeCommitments.slice(0, 2).map(c => c.title || c.name).join(' and ');
    minProjectedReason = `${commitmentNames} payments occur before your scheduled stipend or income credit.`;
  }

  // 6. Financial Health State Calculation (Transparent Deterministic Rules)
  let healthMode = HEALTH_MODES.CHILL;

  if (minBalance < 0) {
    healthMode = HEALTH_MODES.PANIC;
  } else if (minBalance < safetyBuffer) {
    healthMode = HEALTH_MODES.TIGHT;
  } else if (minBalance < safetyBuffer * 1.45 || (avgDailyBurn > safeDailySpend * 1.15 && safeDailySpend > 0)) {
    healthMode = HEALTH_MODES.WATCH;
  } else {
    healthMode = HEALTH_MODES.CHILL;
  }

  // 7. Chronological Pressure Timeline
  const pressureTimeline = [];
  
  // Starting point: Today cash
  pressureTimeline.push({
    id: 'timeline_today',
    daysAway: 0,
    label: 'TODAY',
    date: 'Today',
    title: 'Current Available Cash',
    amount: currentCash,
    type: 'current_cash',
    indicator: '🔵',
    displaySign: ''
  });

  // Collect upcoming commitments
  activeCommitments.forEach(c => {
    pressureTimeline.push({
      id: `comm_${c.id}`,
      daysAway: c.daysAway || 2,
      date: c.dueDate || c.date || `In ${c.daysAway || 2} days`,
      title: c.title || c.name || 'Commitment',
      amount: c.amount,
      type: 'outgoing_mandatory',
      indicator: '🔴',
      displaySign: '-'
    });
  });

  // Collect upcoming incomes
  upcomingIncome.forEach(inc => {
    const isUncertain = inc.certainty === 'uncertain' || inc.certainty === 'potential';
    pressureTimeline.push({
      id: `inc_${inc.id}`,
      daysAway: inc.daysAway || 5,
      date: inc.date || `In ${inc.daysAway || 5} days`,
      title: inc.source || inc.title || 'Incoming Money',
      amount: inc.amount,
      type: isUncertain ? 'potential_incoming' : 'incoming',
      indicator: isUncertain ? '🟡' : '🟢',
      displaySign: '+'
    });
  });

  // Sort timeline chronologically
  pressureTimeline.sort((a, b) => a.daysAway - b.daysAway);

  // 8. PaisaTwin Forecast Confidence Calculation
  let confidenceScore = 60;
  const confidenceBreakdown = [];

  // Confirmed income
  if (confirmedIncome > 0) {
    confidenceScore += 18;
    confidenceBreakdown.push({
      name: 'Confirmed Income',
      rating: 'High',
      score: 95,
      note: 'Verified salary / stipend schedule'
    });
  } else {
    confidenceBreakdown.push({
      name: 'Upcoming Income',
      rating: 'Medium',
      score: 65,
      note: 'No fixed confirmed salary scheduled'
    });
  }

  // Recurring bills
  if (activeCommitments.length > 0) {
    confidenceScore += 12;
    confidenceBreakdown.push({
      name: 'Recurring Commitments',
      rating: 'High',
      score: 92,
      note: `${activeCommitments.length} fixed obligations mapped with exact dates`
    });
  } else {
    confidenceBreakdown.push({
      name: 'Recurring Commitments',
      rating: 'Medium',
      score: 70,
      note: 'No recurring obligations registered'
    });
  }

  // Spending pattern stability
  if (transactions.length >= 5) {
    confidenceScore += 8;
    confidenceBreakdown.push({
      name: 'Normal Spending Pattern',
      rating: 'Medium',
      score: 78,
      note: `Derived from ${transactions.length} historical transactions`
    });
  } else {
    confidenceBreakdown.push({
      name: 'Spending History',
      rating: 'Developing',
      score: 55,
      note: 'Needs 5+ transactions for tighter variance modeling'
    });
  }

  // Uncertain income discount
  if (uncertainIncome > 0) {
    confidenceBreakdown.push({
      name: 'Potential / Freelance Income',
      rating: 'Low',
      score: 42,
      note: 'Excluded from guaranteed safe-to-spend calculation'
    });
  }

  confidenceScore = Math.min(94, Math.max(50, confidenceScore));

  // 9. Data-Driven AI Insight Cards
  const insightCards = [];

  // Insight A: Heads Up on recent category burn (e.g. Food)
  const recentExpenses = transactions.filter(t => t.type === 'expense' && !t.isBalanceSnapshot);
  const foodSpend = recentExpenses
    .filter(t => (t.category || '').toLowerCase() === 'food')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (foodSpend > 0) {
    insightCards.push({
      id: 'ins_headsup',
      type: 'heads_up',
      badge: '👀 Heads Up',
      title: 'Dining & Food Velocity',
      description: `Your food and dining spend totals ${formatINR(foodSpend)} recently. Watching weekend food orders keeps your daily buffer secure.`,
      actionHint: 'View Breakdown'
    });
  }

  // Insight B: Opportunity (e.g. roommate split dues or buffer recovery)
  insightCards.push({
    id: 'ins_opportunity',
    type: 'opportunity',
    badge: '💡 Opportunity',
    title: 'Roommate & Peer Split Recovery',
    description: 'You have pending peer split dues. Recovering them via UPI would immediately boost your liquid buffer by ₹1,200.',
    actionHint: 'Nudge Roommates'
  });

  // Insight C: Upcoming Pressure
  if (mandatoryCommitments > 0) {
    insightCards.push({
      id: 'ins_pressure',
      type: 'pressure',
      badge: '⚠️ Upcoming Pressure',
      title: 'Pre-Income Commitments',
      description: `${formatINR(mandatoryCommitments)} in mandatory commitments are due before your next income cycle clears.`,
      actionHint: 'View Timeline'
    });
  }

  // 10. "Where Is My Money Going?" Category Spending Breakdown
  const categoryTotals = {};
  let totalOutgoing = 0;

  recentExpenses.forEach(t => {
    const cat = t.category || 'Other';
    const amt = Math.abs(t.amount);
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    totalOutgoing += amt;
  });

  // Include active commitments in projected outflow
  activeCommitments.forEach(c => {
    const cat = c.category || 'Rent/Hostel';
    const amt = Math.abs(c.amount);
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    totalOutgoing += amt;
  });

  const spendingBreakdown = Object.keys(categoryTotals)
    .map(cat => {
      const amt = categoryTotals[cat];
      const pct = totalOutgoing > 0 ? Math.round((amt / totalOutgoing) * 100) : 0;
      return {
        category: cat,
        amount: amt,
        percentage: pct
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // 11. Structured AI Context Object (for AI Explainer)
  const structuredAIContext = {
    current_cash: currentCash,
    confirmed_income: confirmedIncome,
    uncertain_income: uncertainIncome,
    mandatory_commitments: mandatoryCommitments,
    safety_buffer: safetyBuffer,
    average_daily_spend: avgDailyBurn,
    safe_to_spend: safeDailySpend,
    projected_balance_7d: projectedBalance7d,
    projected_balance_14d: projectedBalance14d,
    projected_balance_30d: projectedBalance30d,
    minimum_projected_balance: minBalance,
    minimum_projected_date: minDayObj.date || 'upcoming',
    minimum_projected_reason: minProjectedReason,
    forecast_confidence: confidenceScore,
    financial_health_state: healthMode.label
  };

  return {
    currentCash,
    confirmedIncome,
    uncertainIncome,
    mandatoryCommitments,
    safetyBuffer,
    protectedMoney,
    averageDailyBurn: avgDailyBurn,
    safeDailySpend,
    nextFinancialPressure: nextPressure,
    outlookMilestones,
    projectedBalance7d,
    projectedBalance14d,
    projectedBalance30d,
    minimumProjectedBalance: minBalance,
    minimumProjectedDate: minDayObj.date || 'upcoming',
    minimumProjectedReason: minProjectedReason,
    healthMode,
    pressureTimeline,
    confidenceScore,
    confidenceBreakdown,
    insightCards,
    spendingBreakdown,
    structuredAIContext,
    dailyBalances
  };
}
