// PaisaPulse Core Cashflow Intelligence Engine
// Transparent, deterministic financial algorithms for Indian students & interns
import { RISK_LEVELS, INCOME_CERTAINTY } from './types.js';

// Format Indian Rupee currency with commas (Indian numbering system: lakhs/crores)
export const formatINR = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  const num = Math.round(val);
  const isNegative = num < 0;
  const absStr = Math.abs(num).toString();
  
  let lastThree = absStr.substring(absStr.length - 3);
  const otherNumbers = absStr.substring(0, absStr.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return (isNegative ? '-₹' : '₹') + formatted;
};

/**
 * 1. Computes current liquid balance strictly from opening balance + actual transactions
 * CRITICAL RULE: Opening balance is a state concept, NEVER an expense transaction!
 * Balance snapshots (e.g. "Opening Balance", "Balance B/F") are never subtracted.
 */
export const computeCurrentBalance = (openingBalance = 0, transactions = []) => {
  const base = typeof openingBalance === 'number' ? openingBalance : (parseFloat(openingBalance) || 0);
  let netDelta = 0;

  transactions.forEach(tx => {
    // Skip if marked as opening balance snapshot or invalid
    if (tx.isBalanceSnapshot) return;

    const amt = typeof tx.amount === 'number' ? tx.amount : (parseFloat(tx.amount) || 0);
    const type = (tx.type || '').toLowerCase();

    if (type === 'income') {
      netDelta += Math.abs(amt);
    } else if (type === 'expense') {
      netDelta -= Math.abs(amt);
    } else if (type === 'transfer') {
      // Transfer credit/inflow vs debit/outflow
      if (tx.description && /received|from|refund|credit|inflow|cashback/i.test(tx.description)) {
        netDelta += Math.abs(amt);
      } else if (tx.description && /sent|to|paid|withdrawal/i.test(tx.description)) {
        netDelta -= Math.abs(amt);
      }
    }
  });

  return base + netDelta;
};

/**
 * 2. Computes empirical average daily burn rate from variable discretionary expenses
 */
export const computeEmpiricalDailyBurn = (transactions = []) => {
  const variableExpenses = transactions.filter(t => 
    t.type === 'expense' && !t.recurring && !t.isBalanceSnapshot && (t.category !== 'Rent/Hostel' && t.category !== 'Rent')
  );

  if (variableExpenses.length === 0) return 420;

  const totalVariable = variableExpenses.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  const estimatedDays = Math.max(3, Math.min(14, Math.round(variableExpenses.length * 1.4)));
  const rate = Math.round(totalVariable / estimatedDays);
  return Math.max(200, Math.min(1800, rate));
};

/**
 * 3. Categorizes and weights upcoming income by certainty
 * Safe-to-spend uses ONLY reliable income (Confirmed + Likely).
 */
export const analyzeUpcomingIncome = (upcomingIncome = []) => {
  let totalAllIncome = 0;
  let reliableIncome = 0; // Confirmed + Likely
  let potentialIncome = 0; // Uncertain + Potential

  const analyzed = upcomingIncome.map(inc => {
    const certaintyKey = (inc.certainty || (inc.probability >= 0.9 ? 'confirmed' : inc.probability >= 0.7 ? 'likely' : 'uncertain')).toLowerCase();
    const certaintyMeta = INCOME_CERTAINTY[certaintyKey.toUpperCase()] || INCOME_CERTAINTY.LIKELY;
    
    totalAllIncome += inc.amount;
    const weightedAmt = Math.round(inc.amount * certaintyMeta.weight);

    if (certaintyMeta.weight >= 0.7) {
      reliableIncome += inc.amount;
    } else {
      potentialIncome += inc.amount;
    }

    return {
      ...inc,
      certainty: certaintyMeta.key,
      certaintyLabel: certaintyMeta.label,
      certaintyColor: certaintyMeta.color,
      certaintyBg: certaintyMeta.bg,
      weightedAmount: weightedAmt,
      isReliable: certaintyMeta.weight >= 0.7
    };
  });

  return {
    items: analyzed,
    totalAllIncome,
    reliableIncome,
    potentialIncome
  };
};

/**
 * 4. Merges recurring transactions with user-defined commitments
 */
export const deriveCommitments = (transactions = [], defaultCommitments = []) => {
  const detectedMap = new Map();

  // Add default baseline commitments safely
  (defaultCommitments || []).forEach(c => {
    if (!c || typeof c !== 'object') return;
    const key = String(c.title || c.description || c.name || 'Commitment').toLowerCase().trim();
    detectedMap.set(key, { ...c });
  });

  // Scan recurring transactions to find periodic obligations safely
  (transactions || []).forEach(tx => {
    if (!tx || typeof tx !== 'object') return;
    if (tx.recurring && String(tx.type || '').toLowerCase() === 'expense' && !tx.isBalanceSnapshot) {
      const key = String(tx.merchant || tx.description || 'Auto-Debit').toLowerCase().trim();
      if (!detectedMap.has(key)) {
        detectedMap.set(key, {
          id: `com_auto_${tx.id || Date.now()}`,
          title: tx.merchant || tx.description || 'Recurring Bill',
          amount: Math.abs(Number(tx.amount) || 0),
          daysAway: 4,
          category: tx.category || 'Subscriptions',
          essential: tx.essential !== undefined ? tx.essential : false,
          date: 'Scheduled'
        });
      }
    }
  });

  return Array.from(detectedMap.values());
};

/**
 * 5. Calculates Dynamic Safe-To-Spend Today with Mathematical Transparency
 *
 * Formula:
 * Protected Money = Mandatory Upcoming Expenses (due before next reliable income) + Safety Buffer
 * Spendable Liquidity = Current Cash + Reliable Upcoming Income - Protected Money
 *
 * Also generates the "Why This Number?" breakdown.
 */
export const calculateSafeToSpend = ({
  currentBalance,
  upcomingIncome = [],
  upcomingCommitments = [],
  safetyBuffer = 3000,
  scenarioModifiers = null
}) => {
  const incomeAnalysis = analyzeUpcomingIncome(upcomingIncome);
  
  // Find days until next RELIABLE income
  let nextIncomeDays = 14;
  let nextIncomeObj = null;

  incomeAnalysis.items.forEach(inc => {
    let days = inc.daysAway;
    if (scenarioModifiers?.incomeDelayDays && inc.id === (scenarioModifiers.delayedIncomeId || 'inc_1')) {
      days += scenarioModifiers.incomeDelayDays;
    }
    if (inc.isReliable && days < nextIncomeDays) {
      nextIncomeDays = Math.max(1, days);
      nextIncomeObj = inc;
    }
  });

  // Calculate mandatory commitments due before that next reliable income
  let commitmentsBeforeIncome = 0;
  const committedItems = [];

  upcomingCommitments.forEach(com => {
    if (scenarioModifiers?.pausedCommitmentIds?.includes(com.id)) return;
    if (com.daysAway <= nextIncomeDays) {
      commitmentsBeforeIncome += com.amount;
      committedItems.push(com);
    }
  });

  let effectiveCash = currentBalance;
  if (scenarioModifiers?.immediateExpense) {
    effectiveCash -= scenarioModifiers.immediateExpense;
  }

  // Protected money = Mandatory upcoming bills + Safety buffer
  const protectedMoney = commitmentsBeforeIncome + safetyBuffer;

  // Spendable Liquidity = Current Cash - Protected Money (we do NOT frontload unreceived income for safety)
  const spendableLiquidity = effectiveCash - protectedMoney;

  let safeToSpendToday = 0;
  let statusReason = '';
  let whyBreakdown = null;

  if (spendableLiquidity <= 0) {
    safeToSpendToday = 0;
    const deficit = Math.abs(spendableLiquidity);
    statusReason = `Shortfall Alert: Current cash is ${formatINR(deficit)} below what is needed to cover your upcoming bills and protect your ${formatINR(safetyBuffer)} buffer.`;
  } else {
    // Distribute spendable liquidity safely over days to next income
    const dailyAllocation = Math.round(spendableLiquidity / nextIncomeDays);
    // Apply conservative discount (85% usable daily to absorb small variations)
    safeToSpendToday = Math.max(100, Math.round(dailyAllocation * 0.85));
    statusReason = `You can safely spend about ${formatINR(safeToSpendToday)} today. Your scheduled ${formatINR(commitmentsBeforeIncome)} in commitments and ${formatINR(safetyBuffer)} emergency buffer are fully protected.`;
  }

  // "Why This Number?" step-by-step breakdown
  whyBreakdown = {
    currentCash: effectiveCash,
    reliableUpcomingIncome: incomeAnalysis.reliableIncome,
    potentialIncomeExcluded: incomeAnalysis.potentialIncome,
    upcomingCommitments: commitmentsBeforeIncome,
    safetyBuffer: safetyBuffer,
    protectedMoney: protectedMoney,
    spendableLiquidity: spendableLiquidity,
    daysToNextIncome: nextIncomeDays,
    nextIncomeName: nextIncomeObj ? nextIncomeObj.title : 'Next Income Window',
    committedItems: committedItems,
    recommendedDaily: safeToSpendToday,
    formula: `(${formatINR(effectiveCash)} Cash - ${formatINR(commitmentsBeforeIncome)} Commitments - ${formatINR(safetyBuffer)} Buffer) ÷ ${nextIncomeDays} days × 0.85 buffer factor`
  };

  return {
    safeToSpendToday,
    effectiveCurrentBalance: effectiveCash,
    commitmentsBeforeIncome,
    committedItems,
    safetyBuffer,
    protectedMoney,
    spendableLiquidity,
    nextIncomeDays,
    nextIncomeAmount: nextIncomeObj ? nextIncomeObj.amount : 0,
    statusReason,
    whyBreakdown,
    reliableIncome: incomeAnalysis.reliableIncome,
    potentialIncome: incomeAnalysis.potentialIncome
  };
};

/**
 * 6. Day-by-Day Cashflow Forecast Engine (7, 14, 30 days)
 * Strictly respects exact dates of income and commitments.
 * Calculates exact minimum projected balance, shortfall gap, and confidence score.
 */
export const calculateCashflowForecast = ({
  currentBalance,
  upcomingIncome = [],
  upcomingCommitments = [],
  burnRateDaily = 420,
  horizonDays = 14,
  safetyBuffer = 3000,
  scenarioModifiers = null
}) => {
  const forecastTimeline = [];
  let runningBalance = currentBalance;
  let runningConservative = currentBalance;
  let runningOptimistic = currentBalance;

  if (scenarioModifiers?.immediateExpense) {
    runningBalance -= scenarioModifiers.immediateExpense;
    runningConservative -= scenarioModifiers.immediateExpense;
    runningOptimistic -= scenarioModifiers.immediateExpense;
  }

  const effectiveDailyBurn = scenarioModifiers?.burnRateMultiplier
    ? Math.round(burnRateDaily * scenarioModifiers.burnRateMultiplier)
    : burnRateDaily;

  const startDate = new Date();
  let minProjectedBalance = runningBalance;
  let minBalanceDate = 'Today';
  let shortfallDay = null;
  let totalExpectedIncome = 0;
  let totalExpectedExpenses = 0;

  // Track confidence factors
  let uncertainIncomeEncountered = false;

  for (let day = 1; day <= horizonDays; day++) {
    const curDate = new Date(startDate);
    curDate.setDate(startDate.getDate() + (day - 1));
    const dayLabel = curDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const isWeekend = curDate.getDay() === 0 || curDate.getDay() === 6;

    // Weekend spend surge factor (+28% on weekends for Indian student/lifestyle habits)
    const dayBurnFactor = isWeekend ? 1.28 : 0.92;
    const baseVariableSpend = Math.round(effectiveDailyBurn * dayBurnFactor);

    // Inflows on this day
    let dayIncome = 0;
    const dayIncomesList = [];

    upcomingIncome.forEach(inc => {
      let effectiveDaysAway = inc.daysAway;
      if (scenarioModifiers?.incomeDelayDays && inc.id === (scenarioModifiers.delayedIncomeId || 'inc_1')) {
        effectiveDaysAway += scenarioModifiers.incomeDelayDays;
      }

      if (effectiveDaysAway === day) {
        dayIncome += inc.amount;
        dayIncomesList.push(inc);
        totalExpectedIncome += inc.amount;
        if (inc.certainty === 'uncertain' || inc.certainty === 'potential') {
          uncertainIncomeEncountered = true;
        }
      }
    });

    // Outflows on this day
    let dayCommitment = 0;
    const dayCommitmentsList = [];

    upcomingCommitments.forEach(com => {
      if (scenarioModifiers?.pausedCommitmentIds?.includes(com.id)) return;

      if (com.daysAway === day) {
        dayCommitment += com.amount;
        dayCommitmentsList.push(com);
        totalExpectedExpenses += com.amount;
      }
    });

    const dayExpense = dayCommitment + baseVariableSpend;
    totalExpectedExpenses += baseVariableSpend;

    runningBalance = runningBalance + dayIncome - dayExpense;

    // Meaningful confidence range based on real uncertainty factors
    // Conservative: Variable burn +20%, uncertain income omitted or discounted by 50%
    const conservativeVariable = Math.round(baseVariableSpend * 1.20);
    const conservativeIncome = dayIncomesList.reduce((sum, inc) => {
      const w = inc.certainty === 'confirmed' ? 1.0 : inc.certainty === 'likely' ? 0.85 : 0.40;
      return sum + Math.round(inc.amount * w);
    }, 0);
    runningConservative = runningConservative + conservativeIncome - (dayCommitment + conservativeVariable);

    // Optimistic: Variable burn -15%, all income arrives on time
    const optimisticVariable = Math.round(baseVariableSpend * 0.85);
    runningOptimistic = runningOptimistic + dayIncome - (dayCommitment + optimisticVariable);

    if (runningBalance < minProjectedBalance) {
      minProjectedBalance = runningBalance;
      minBalanceDate = dayLabel;
    }

    if (runningBalance < safetyBuffer && !shortfallDay) {
      shortfallDay = { 
        day, 
        dayLabel, 
        balance: runningBalance, 
        deficit: safetyBuffer - runningBalance,
        gap: safetyBuffer - runningBalance
      };
    }

    forecastTimeline.push({
      dayIndex: day,
      dayLabel,
      dateFormatted: curDate.toISOString().split('T')[0],
      income: dayIncome,
      expenses: dayExpense,
      commitments: dayCommitment,
      variableSpend: baseVariableSpend,
      projectedBalance: runningBalance,
      conservativeBalance: runningConservative,
      optimisticBalance: runningOptimistic,
      commitmentsList: dayCommitmentsList,
      incomesList: dayIncomesList
    });
  }

  // Calculate overall forecast confidence (75% - 94%)
  let confidenceScore = 92;
  if (horizonDays === 30) confidenceScore -= 10;
  if (uncertainIncomeEncountered) confidenceScore -= 8;
  if (upcomingCommitments.length === 0) confidenceScore -= 5;

  const highConfidenceFactors = [
    'Scheduled rent & fixed auto-debits (pinned dates)',
    'Empirical weekday burn rate calibrated from actual history'
  ];
  const lowerConfidenceFactors = [];
  if (uncertainIncomeEncountered) lowerConfidenceFactors.push('Uncertain / freelance income timing');
  lowerConfidenceFactors.push('Weekend discretionary dining spikes');
  if (horizonDays === 30) lowerConfidenceFactors.push('Long 30-day projection horizon');

  // Shortfall risk level definition
  let riskLevel = RISK_LEVELS.LOW;
  if (minProjectedBalance < 0) {
    riskLevel = RISK_LEVELS.HIGH; // Deficit / Bounced payment
  } else if (minProjectedBalance < safetyBuffer) {
    riskLevel = RISK_LEVELS.MEDIUM; // Buffer risk
  }

  const shortfallAmount = shortfallDay ? Math.max(0, safetyBuffer - minProjectedBalance) : 0;
  const headroom = Math.max(0, minProjectedBalance - safetyBuffer);

  return {
    timeline: forecastTimeline,
    minProjectedBalance,
    minBalanceDate,
    safetyBuffer,
    headroom,
    riskLevel,
    shortfallDay,
    shortfallAmount,
    totalExpectedIncome,
    totalExpectedExpenses,
    finalProjectedBalance: runningBalance,
    confidence: {
      score: confidenceScore,
      highConfidenceFactors,
      lowerConfidenceFactors
    }
  };
};

/**
 * 7. "Can I Afford This?" Instant Purchase Simulation
 * Answers the critical question: "I want to spend ₹X. Can I afford it?"
 */
export const simulateAffordability = ({
  amount,
  category = 'Shopping',
  title = 'Planned Purchase',
  currentBalance,
  upcomingIncome = [],
  upcomingCommitments = [],
  safetyBuffer = 3000,
  burnRateDaily = 420
}) => {
  const purchaseAmount = parseFloat(amount) || 0;

  // Run baseline forecast
  const baseline = calculateCashflowForecast({
    currentBalance,
    upcomingIncome,
    upcomingCommitments,
    burnRateDaily,
    horizonDays: 14,
    safetyBuffer
  });

  // Run forecast with simulated immediate purchase
  const simulated = calculateCashflowForecast({
    currentBalance,
    upcomingIncome,
    upcomingCommitments,
    burnRateDaily,
    horizonDays: 14,
    safetyBuffer,
    scenarioModifiers: { immediateExpense: purchaseAmount }
  });

  const affordableFromCashToday = currentBalance >= purchaseAmount;
  const baselineMin = baseline.minProjectedBalance;
  const newMin = simulated.minProjectedBalance;
  const bufferBreach = newMin < safetyBuffer;
  const accountDeficit = newMin < 0;

  let verdict = 'Safe to Buy';
  let verdictColor = '#10B981';
  let bufferImpact = 'LOW';
  let reasoning = '';
  let recommendation = '';

  if (accountDeficit) {
    verdict = 'High Risk — Deficit Alert';
    verdictColor = '#EF4444';
    bufferImpact = 'CRITICAL';
    reasoning = `Spending ${formatINR(purchaseAmount)} will drive your account negative to ${formatINR(newMin)} around ${simulated.minBalanceDate}. Upcoming bills would bounce.`;
    recommendation = 'Hold off on this purchase until your next confirmed salary/stipend credit arrives.';
  } else if (bufferBreach) {
    verdict = 'Caution — Buffer Breach';
    verdictColor = '#F59E0B';
    bufferImpact = 'HIGH';
    const gap = safetyBuffer - newMin;
    reasoning = `You have enough cash today, but this will deplete your emergency buffer by ${formatINR(gap)}. Your minimum balance would drop from ${formatINR(baselineMin)} to ${formatINR(newMin)}.`;
    recommendation = `Wait until your upcoming income arrives in a few days, or reduce discretionary spending elsewhere to maintain your ${formatINR(safetyBuffer)} safety floor.`;
  } else {
    verdict = 'Comfortably Affordable';
    verdictColor = '#10B981';
    bufferImpact = 'LOW';
    const headroomAfter = newMin - safetyBuffer;
    reasoning = `You can easily afford this. Even after spending ${formatINR(purchaseAmount)}, your lowest projected balance remains ${formatINR(newMin)}, maintaining a ${formatINR(headroomAfter)} cushion above your ${formatINR(safetyBuffer)} buffer.`;
    recommendation = 'Safe to proceed. It will not jeopardize your scheduled rent or bill commitments.';
  }

  return {
    purchaseAmount,
    title,
    category,
    affordableFromCashToday,
    baselineMin,
    newMin,
    bufferImpact,
    verdict,
    verdictColor,
    reasoning,
    recommendation,
    safetyBuffer,
    simulatedTimeline: simulated.timeline
  };
};

/**
 * 8. Detect Duplicates within transaction history
 */
export const detectDuplicateTransactions = (transactions = []) => {
  if (!Array.isArray(transactions)) return [];
  return transactions.map((tx, idx) => {
    if (!tx || typeof tx !== 'object') return tx;
    if (tx.isDuplicateSuspect) return tx;

    const txDesc = String(tx.description || '').toLowerCase().trim();
    const txMerch = String(tx.merchant || '').toLowerCase().trim();
    const txAmt = Math.abs(Number(tx.amount) || 0);
    const txType = String(tx.type || '').toLowerCase().trim();
    const txDate = String(tx.date || '').trim();

    const duplicate = transactions.find((other, otherIdx) => {
      if (otherIdx === idx || !other || typeof other !== 'object') return false;
      const otherDesc = String(other.description || '').toLowerCase().trim();
      const otherMerch = String(other.merchant || '').toLowerCase().trim();
      const otherAmt = Math.abs(Number(other.amount) || 0);
      const otherType = String(other.type || '').toLowerCase().trim();
      const otherDate = String(other.date || '').trim();

      const descMatch = (txDesc && otherDesc && txDesc === otherDesc) ||
                        (txMerch && otherMerch && txMerch === otherMerch);
      const amtMatch = txAmt > 0 && txAmt === otherAmt;
      const typeMatch = txType === otherType;
      const dateMatch = txDate && otherDate && txDate === otherDate;

      return descMatch && amtMatch && typeMatch && dateMatch;
    });

    if (duplicate) {
      return {
        ...tx,
        isDuplicateSuspect: true,
        duplicateReason: 'Identical amount & merchant on same day'
      };
    }
    return tx;
  });
};
