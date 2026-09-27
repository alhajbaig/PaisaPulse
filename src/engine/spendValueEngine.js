// PaisaPulse — Spend Value Intelligence Engine
// "What is actually worth your money?"
// Core principle: Money Cost ≠ Personal Value
// Learns user spending priorities from transactions & feedback and maps into Value × Cost Matrix

import { formatINR } from './cashflowEngine.js';
import { resolveTransactionCategory } from './types.js';

export const VALUE_RATINGS = {
  VALUABLE: 'valuable',
  NEUTRAL: 'neutral',
  NOT_WORTH_IT: 'not_worth_it'
};

export const QUADRANTS = {
  HIGH_VALUE_LOW_COST: {
    id: 'HIGH_VALUE_LOW_COST',
    title: 'Keep — High Personal Value',
    shortLabel: 'High Value / Low Cost',
    emoji: '❤️',
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    description: 'Cherished low-cost rituals & daily joy. PaisaPulse explicitly protects these from budget cuts.',
    actionDirective: 'DO_NOT_CUT'
  },
  HIGH_VALUE_HIGH_COST: {
    id: 'HIGH_VALUE_HIGH_COST',
    title: 'Meaningful Spending',
    shortLabel: 'High Value / High Cost',
    emoji: '💎',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    description: 'Takes a significant part of your budget, but appears highly valuable to your lifestyle, health, or growth.',
    actionDirective: 'MAINTAIN_WITH_AWARENESS'
  },
  LOW_VALUE_LOW_COST: {
    id: 'LOW_VALUE_LOW_COST',
    title: 'Small Leaks',
    shortLabel: 'Low Value / Low Cost',
    emoji: '⚠️',
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    description: 'Small impulse spends or unnoticed micro-charges that quietly add up across the month.',
    actionDirective: 'PLUG_GRADUALLY'
  },
  LOW_VALUE_HIGH_COST: {
    id: 'LOW_VALUE_HIGH_COST',
    title: 'Review These First',
    shortLabel: 'Low Value / High Cost',
    emoji: '🚨',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    description: 'Primary candidates for optimization. High monetary expense with low perceived personal return.',
    actionDirective: 'PRIMARY_CUT_TARGET'
  }
};

// Known semantic spending clusters for Indian young professionals and students
const CLUSTER_PATTERNS = [
  {
    id: 'cluster_chai_coffee',
    name: 'Daily Tea, Chai & Coffee',
    category: 'Food',
    emoji: '☕',
    keywords: ['chai', 'tea', 'tapri', 'coffee', 'nescafe', 'canteen', 'starbucks', 'cafe', 'blue tokai', 'third wave'],
    isDailyRitual: true,
    baseValueScore: 82,
    defaultDescription: 'Daily refreshment & social break'
  },
  {
    id: 'cluster_alcohol_nightlife',
    name: 'Daily Alcohol Consumption',
    category: 'Alcohol & Nightlife',
    emoji: '🍷',
    keywords: [
      'alcohol', 'liquor', 'wine', 'beer', 'whisky', 'whiskey', 'vodka', 'rum', 'gin',
      'brandy', 'scotch', 'bourbon', 'theka', 'tasmac', 'madhushala', 'madira', 'sharab',
      'living liquidz', 'tonique', 'bira', 'bira91', 'kingfisher', 'carlsberg', 'budweiser',
      'tuborg', 'heineken', 'corona', 'simba', 'white owl', 'bacardi', 'smirnoff', 'absolut',
      'old monk', 'blenders pride', 'royal stag', 'signature', 'antiquity', 'mcdowell',
      'oaksmith', 'pub', 'brewery', 'microbrewery', 'bar', 'lounge', 'cocktail', 'cocktails',
      'tavern', 'booze', 'spirits', 'drinks', 'social bar', 'toit', 'ironhill', 'byg brewski',
      'wines', 'beverages'
    ],
    isDailyRitual: true,
    baseValueScore: 58,
    defaultDescription: 'Daily alcohol consumption, social drinks & nightlife'
  },
  {
    id: 'cluster_fitness_gym',
    name: 'Gym & Fitness Wellness',
    category: 'Health',
    emoji: '🏋️',
    keywords: ['gym', 'cult', 'fitness', 'gold\'s', 'anytime', 'protein', 'yoga', 'workout', 'swimming'],
    isDailyRitual: false,
    baseValueScore: 88,
    defaultDescription: 'Physical health, energy & well-being'
  },
  {
    id: 'cluster_food_delivery',
    name: 'Online Food Delivery',
    category: 'Food',
    emoji: '🍔',
    keywords: ['swiggy', 'zomato', 'eatclub', 'mcdonalds', 'kfc', 'dominos', 'burger king', 'pizza', 'biryani'],
    isDailyRitual: false,
    baseValueScore: 48,
    defaultDescription: 'Convenience meals & late-night orders'
  },
  {
    id: 'cluster_daily_commute',
    name: 'Daily Commute & Transit',
    category: 'Transport',
    emoji: '🚆',
    keywords: ['metro', 'uber', 'ola', 'rapido', 'auto', 'petrol', 'fuel', 'bus', 'train', 'irctc'],
    isDailyRitual: true,
    baseValueScore: 72,
    defaultDescription: 'Work & college travel mobility'
  },
  {
    id: 'cluster_subscriptions',
    name: 'Streaming & Media Subscriptions',
    category: 'Entertainment',
    emoji: '🎬',
    keywords: ['netflix', 'spotify', 'prime', 'hotstar', 'youtube', 'apple music', 'disney', 'subscription'],
    isDailyRitual: false,
    baseValueScore: 62,
    defaultDescription: 'Downtime entertainment & music'
  },
  {
    id: 'cluster_impulse_shopping',
    name: 'Online Retail & Shopping',
    category: 'Shopping',
    emoji: '🛍️',
    keywords: ['amazon', 'flipkart', 'myntra', 'zara', 'h&m', 'ajio', 'meesho', 'nykaa', 'shopping'],
    isDailyRitual: false,
    baseValueScore: 38,
    defaultDescription: 'Apparel, gadgets & impulse carts'
  },
  {
    id: 'cluster_education_learning',
    name: 'Books, Courses & Upskilling',
    category: 'Education',
    emoji: '📚',
    keywords: ['coursera', 'udemy', 'book', 'course', 'exam', 'cert', 'kindle', 'learning', 'college', 'tuition'],
    isDailyRitual: false,
    baseValueScore: 85,
    defaultDescription: 'Career advancement & knowledge'
  },
  {
    id: 'cluster_weekend_outings',
    name: 'Weekend Outings & Hangouts',
    category: 'Entertainment',
    emoji: '🍿',
    keywords: ['pvr', 'inox', 'cinema', 'movie', 'bowling', 'gaming', 'bistro', 'arcade', 'billiards'],
    isDailyRitual: false,
    baseValueScore: 68,
    defaultDescription: 'Socializing with friends & unwinding'
  },
  {
    id: 'cluster_groceries_essentials',
    name: 'Quick Commerce & Groceries',
    category: 'Food',
    emoji: '🛒',
    keywords: ['blinkit', 'zepto', 'instamart', 'bigbasket', 'dmart', 'grocery', 'milk', 'vegetables', 'supermarket'],
    isDailyRitual: true,
    baseValueScore: 78,
    defaultDescription: 'Essential household groceries & snacks'
  }
];

// In-memory feedback store fallback
const localFeedbackCache = {};

/**
 * Retrieves explicit user ratings for clusters
 */
export function getSpendValueFeedback(userId = 'default') {
  if (typeof window === 'undefined') return localFeedbackCache[userId] || {};
  try {
    const raw = localStorage.getItem(`paisapulse_spend_value_feedback_${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.debug('Error reading spend value feedback:', e);
  }
  return localFeedbackCache[userId] || {};
}

/**
 * Saves explicit user rating (❤️ valuable, 😐 neutral, ❌ not_worth_it)
 */
export function saveSpendValueFeedback(userId = 'default', clusterId, rating) {
  if (!clusterId) return;
  const current = getSpendValueFeedback(userId);
  current[clusterId] = rating;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`paisapulse_spend_value_feedback_${userId}`, JSON.stringify(current));
    } catch (e) {
      console.error('Failed to save spend value feedback to localStorage:', e);
    }
  }
  localFeedbackCache[userId] = current;
  return current;
}

/**
 * Analyzes transaction ledger and derives the complete Spend Value Map
 */
export function computeSpendValueMap(transactions = [], userFeedback = {}, options = {}) {
  const expenseTx = transactions.filter(t => (t.type || '').toLowerCase() === 'expense' && !t.isBalanceSnapshot);

  // Default cluster accumulator
  const clusters = CLUSTER_PATTERNS.map(pattern => ({
    ...pattern,
    totalSpent: 0,
    monthlyCost: 0,
    transactionCount: 0,
    matchedTransactions: [],
    avgAmount: 0,
    frequencyDaysSpan: 0,
    dates: []
  }));

  // Catch-all bucket for unclassified expenses
  const unclassified = {
    id: 'cluster_other_discretionary',
    name: 'Other Discretionary Expenses',
    category: 'Other',
    emoji: '📦',
    keywords: [],
    baseValueScore: 45,
    defaultDescription: 'Miscellaneous everyday spending',
    totalSpent: 0,
    monthlyCost: 0,
    transactionCount: 0,
    matchedTransactions: [],
    avgAmount: 0,
    dates: []
  };

  // Match transactions into clusters
  expenseTx.forEach(tx => {
    const resolvedCat = resolveTransactionCategory(tx);
    const desc = `${tx.description || ''} ${tx.merchant || ''} ${tx.category || ''} ${resolvedCat}`.toLowerCase();
    const amount = Math.abs(Number(tx.amount) || 0);

    let matched = false;
    for (const cluster of clusters) {
      const isMatch = cluster.keywords.some(kw => desc.includes(kw));
      if (isMatch) {
        cluster.totalSpent += amount;
        cluster.transactionCount++;
        cluster.matchedTransactions.push(tx);
        if (tx.date) cluster.dates.push(tx.date);
        matched = true;
        break;
      }
    }

    if (!matched) {
      unclassified.totalSpent += amount;
      unclassified.transactionCount++;
      unclassified.matchedTransactions.push(tx);
      if (tx.date) unclassified.dates.push(tx.date);
    }
  });

  const activeClusters = clusters.filter(c => c.transactionCount > 0);
  if (unclassified.transactionCount > 0) {
    activeClusters.push(unclassified);
  }

  // If user has zero or few expenses (fresh account), provide realistic baseline clusters from common Indian student patterns
  if (activeClusters.length === 0) {
    return getSyntheticBaselineValueMap(userFeedback);
  }

  // Calculate monthly normalized cost for each cluster
  const now = new Date();
  activeClusters.forEach(cluster => {
    cluster.avgAmount = cluster.transactionCount > 0 ? Math.round(cluster.totalSpent / cluster.transactionCount) : 0;
    
    // Dynamic habit detection for regular/daily consumption
    const uniqueDates = new Set((cluster.dates || []).map(d => String(d).split('T')[0])).size;
    const hasDailyToken = (cluster.matchedTransactions || []).some(t => /daily/i.test(`${t.description || ''} ${t.merchant || ''} ${t.category || ''} ${t.note || ''}`));
    const isDaily = cluster.isDailyRitual || uniqueDates >= 4 || cluster.transactionCount >= 4 || hasDailyToken;

    if (cluster.id === 'cluster_alcohol_nightlife') {
      cluster.isDailyRitual = isDaily;
      cluster.name = isDaily ? 'Daily Alcohol Consumption' : 'Alcohol & Social Drinks';
      cluster.frequencyLabel = isDaily ? 'Daily Consumption' : `${cluster.transactionCount} outings/mo`;
    }

    // Normalize to 30-day monthly burn
    if (cluster.isDailyRitual) {
      if (cluster.transactionCount >= 10) {
        cluster.monthlyCost = Math.round(cluster.totalSpent);
      } else {
        cluster.monthlyCost = Math.round(cluster.avgAmount * 28);
      }
    } else if (cluster.transactionCount >= 10) {
      cluster.monthlyCost = Math.round(cluster.totalSpent);
    } else if (cluster.avgAmount >= 800 || cluster.id.includes('fitness') || cluster.id.includes('subscriptions')) {
      // Monthly subscriptions or passes (e.g. Gym ₹1,000/mo, Netflix ₹649/mo)
      cluster.monthlyCost = Math.round(cluster.avgAmount);
    } else {
      // Occasional dining or shopping (e.g. 2-4 times a month)
      const estimatedTimesPerMonth = Math.min(8, Math.max(2, cluster.transactionCount * 2));
      cluster.monthlyCost = Math.round(cluster.avgAmount * estimatedTimesPerMonth);
    }
  });

  // Calculate total monthly discretionary spend across active clusters
  const totalMonthlyDiscretionary = activeClusters.reduce((sum, c) => sum + c.monthlyCost, 0);
  const costThreshold = Math.max(500, Math.round(totalMonthlyDiscretionary * 0.15));

  // Determine Value Scores, Quadrants, and Confidence for each cluster
  const evaluatedClusters = activeClusters.map(cluster => {
    const feedback = userFeedback[cluster.id] || null;

    // 1. Habitual Frequency & Consistency Score
    let frequencyBonus = 0;
    if (cluster.transactionCount >= 12 || cluster.isDailyRitual) {
      frequencyBonus = 18; // Strong routine signal
    } else if (cluster.transactionCount >= 5) {
      frequencyBonus = 8;
    }

    // 2. Base score from category & intrinsic value
    let score = cluster.baseValueScore + frequencyBonus;

    // 3. User feedback modifier (highest authority)
    let feedbackImpact = 'Inferred from transaction pattern & recurrence';
    if (feedback === VALUE_RATINGS.VALUABLE) {
      score = Math.min(98, score + 25);
      feedbackImpact = 'Marked as "Very Valuable" by you (❤️)';
    } else if (feedback === VALUE_RATINGS.NOT_WORTH_IT) {
      score = Math.max(10, score - 45);
      feedbackImpact = 'Marked as "Not Worth It" by you (❌)';
    } else if (feedback === VALUE_RATINGS.NEUTRAL) {
      score = Math.max(30, Math.min(65, score - 10));
      feedbackImpact = 'Marked as "Sometimes / Neutral" by you (😐)';
    }

    // Strictly normalize between 0 and 100
    score = Math.min(100, Math.max(0, Math.round(score)));

    // 4. Confidence level
    let confidence = 'MEDIUM';
    let confidenceReason = 'Observed across multiple recent transactions';
    if (feedback) {
      confidence = 'HIGH';
      confidenceReason = 'Confirmed with your explicit rating';
    } else if (cluster.transactionCount >= 8) {
      confidence = 'HIGH';
      confidenceReason = `Consistent habit across ${cluster.transactionCount} transactions`;
    } else if (cluster.transactionCount <= 2) {
      confidence = 'LOW';
      confidenceReason = 'Limited history (only 1–2 transactions detected)';
    }

    // 5. Quadrant Assignment (Value × Cost Matrix)
    // Value Threshold: 60 | Cost Threshold: costThreshold
    const isHighValue = score >= 60;
    const isHighCost = cluster.monthlyCost >= costThreshold;

    let quadrant = null;
    if (isHighValue && !isHighCost) {
      quadrant = QUADRANTS.HIGH_VALUE_LOW_COST;
    } else if (isHighValue && isHighCost) {
      quadrant = QUADRANTS.HIGH_VALUE_HIGH_COST;
    } else if (!isHighValue && !isHighCost) {
      quadrant = QUADRANTS.LOW_VALUE_LOW_COST;
    } else {
      quadrant = QUADRANTS.LOW_VALUE_HIGH_COST;
    }

    return {
      ...cluster,
      clusterId: cluster.id,
      clusterName: cluster.name,
      icon: cluster.emoji,
      quadrantDef: quadrant,
      frequencyLabel: cluster.frequencyLabel || (cluster.isDailyRitual ? 'Daily Ritual' : `${cluster.transactionCount} transactions/mo`),
      personalValueScore: score,
      userRating: feedback,
      confidence,
      confidenceReason,
      quadrant,
      feedbackImpact
    };
  });

  // Sort: 1) by Value Score descending for "What Matters", 2) by Monthly Cost descending for "Where Money Goes"
  const rankedByValue = [...evaluatedClusters].sort((a, b) => b.personalValueScore - a.personalValueScore);
  const rankedByCost = [...evaluatedClusters].sort((a, b) => b.monthlyCost - a.monthlyCost);

  // Group by Quadrant
  const quadrantMap = {
    HIGH_VALUE_LOW_COST: evaluatedClusters.filter(c => c.quadrant?.id === 'HIGH_VALUE_LOW_COST'),
    HIGH_VALUE_HIGH_COST: evaluatedClusters.filter(c => c.quadrant?.id === 'HIGH_VALUE_HIGH_COST'),
    LOW_VALUE_LOW_COST: evaluatedClusters.filter(c => c.quadrant?.id === 'LOW_VALUE_LOW_COST'),
    LOW_VALUE_HIGH_COST: evaluatedClusters.filter(c => c.quadrant?.id === 'LOW_VALUE_HIGH_COST')
  };

  // Generate "Don't Cut This" & "Where Should I Cut?" Intelligence
  const intelligenceInsights = generateSpendValueInsights(evaluatedClusters, quadrantMap, totalMonthlyDiscretionary);

  return {
    clusters: evaluatedClusters,
    rankedByValue: rankedByValue || [],
    rankedByCost: rankedByCost || [],
    quadrants: quadrantMap,
    totalMonthlyDiscretionary,
    costThreshold,
    insights: intelligenceInsights,
    dontCutItem: intelligenceInsights?.dontCutItem,
    dontCutReason: intelligenceInsights?.dontCutReason,
    cutItem: intelligenceInsights?.cutItem,
    cutAdvice: intelligenceInsights?.cutAdvice,
    potentialMonthlySavings: intelligenceInsights?.potentialMonthlySavings,
    perspectiveInsight: intelligenceInsights?.perspectiveInsight,
    calculatedAt: new Date().toISOString()
  };
}

/**
 * Generates transparent, companion-style financial insights
 */
function generateSpendValueInsights(clusters, quadrantMap, totalMonthlyDiscretionary) {
  // 1. "Don't Cut This" Candidate
  // Prioritize High Value / Low Cost routines (e.g. Daily Chai, Gym, Learning)
  const highValueLowCost = quadrantMap.HIGH_VALUE_LOW_COST[0];
  const highValueMeaningful = quadrantMap.HIGH_VALUE_HIGH_COST[0];
  const protectedHero = highValueLowCost || highValueMeaningful || (clusters[0] && clusters[0].personalValueScore >= 50 ? clusters[0] : null);

  let dontCutReason = '';
  if (protectedHero) {
    if (protectedHero.id.includes('chai') || protectedHero.id.includes('tea')) {
      dontCutReason = `Your daily tea costs ~${formatINR(protectedHero.monthlyCost)}/month, but it's a consistent part of your daily routine. Compared with other discretionary spending, this appears highly valuable to you. No need to optimize this first.`;
    } else if (protectedHero.id.includes('fitness') || protectedHero.id.includes('gym')) {
      dontCutReason = `Your fitness spending (${formatINR(protectedHero.monthlyCost)}/month) is a high-value pillar of your health and focus. Keep this protected—PaisaPulse will look for savings in low-value areas first.`;
    } else if (protectedHero.id.includes('alcohol')) {
      const isDaily = protectedHero.isDailyRitual || protectedHero.name.toLowerCase().includes('daily');
      dontCutReason = `${isDaily ? 'Your daily alcohol consumption' : 'Alcohol & social drinks'} costs ~${formatINR(protectedHero.monthlyCost)}/month and represents a regular relaxation priority for you (${protectedHero.personalValueScore}/100 value score). PaisaPulse respects what brings you joy and protects it while looking for savings in low-value areas first.`;
    } else {
      dontCutReason = `You spend ${formatINR(protectedHero.monthlyCost)}/month on ${protectedHero.name}, which ranks in your highest personal value tier (${protectedHero.personalValueScore}/100). Do not cut this routine to balance your budget.`;
    }
  }

  // 2. "Where Should I Cut?" Candidate
  // Prioritize Low Value / High Cost (Quadrant 4) or Low Value / Low Cost (Quadrant 3)
  let primeCutTarget = quadrantMap.LOW_VALUE_HIGH_COST[0] || quadrantMap.LOW_VALUE_LOW_COST[0] || null;

  // If only 1 cluster exists and it's already protected, don't flag it as cutTarget simultaneously!
  if (primeCutTarget && protectedHero && primeCutTarget.id === protectedHero.id) {
    if (protectedHero.personalValueScore >= 55) {
      primeCutTarget = null;
    } else {
      // If low value, let cut advice take precedence
      dontCutReason = '';
    }
  }

  let cutAdvice = '';
  let potentialMonthlySavings = 0;

  if (primeCutTarget) {
    if (primeCutTarget.id.includes('food_delivery')) {
      potentialMonthlySavings = Math.round(primeCutTarget.monthlyCost * 0.28);
      cutAdvice = `Food delivery is your highest-cost discretionary habit (~${formatINR(primeCutTarget.monthlyCost)}/month), but carries a moderate personal value score (${primeCutTarget.personalValueScore}/100). Reducing weekend food delivery by just 2 orders/month could save ~${formatINR(potentialMonthlySavings)} without touching the spending you care most about.`;
    } else if (primeCutTarget.id.includes('shopping')) {
      potentialMonthlySavings = Math.round(primeCutTarget.monthlyCost * 0.35);
      cutAdvice = `Online retail & impulse cart purchases total ${formatINR(primeCutTarget.monthlyCost)}/month with low value durability (${primeCutTarget.personalValueScore}/100). Implementing a 48-hour cart pause on non-essentials can unlock ~${formatINR(potentialMonthlySavings)}/month.`;
    } else if (primeCutTarget.id.includes('alcohol')) {
      potentialMonthlySavings = Math.round(primeCutTarget.monthlyCost * 0.25);
      const isDaily = primeCutTarget.isDailyRitual || primeCutTarget.name.toLowerCase().includes('daily');
      cutAdvice = `${isDaily ? 'Daily alcohol consumption' : 'Alcohol & social drinks'} accounts for ${formatINR(primeCutTarget.monthlyCost)}/month (${primeCutTarget.personalValueScore}/100 value score). If you wish to optimize cashflow, moderating frequency by 15–20% can unlock ~${formatINR(potentialMonthlySavings)}/month without giving up your favorite social downtime.`;
    } else {
      potentialMonthlySavings = Math.round(primeCutTarget.monthlyCost * 0.3);
      cutAdvice = `${primeCutTarget.name} takes ${formatINR(primeCutTarget.monthlyCost)}/month with lower perceived personal return (${primeCutTarget.personalValueScore}/100). Trimming 25% here frees ~${formatINR(potentialMonthlySavings)}/month while preserving all high-value habits.`;
    }
  } else {
    cutAdvice = 'Your spending is currently well-aligned with your personal values. Continue monitoring small incidental leaks.';
  }

  // 3. Overall Perspective Contrast ("Where Money Goes" vs "What Money Means")
  const biggestMonetary = clusters.slice().sort((a, b) => b.monthlyCost - a.monthlyCost)[0];
  const highestValue = clusters.slice().sort((a, b) => b.personalValueScore - a.personalValueScore)[0];

  let perspectiveInsight = 'PaisaPulse separates monetary cost from what actually brings you personal satisfaction.';
  if (biggestMonetary && highestValue) {
    if (biggestMonetary.id === highestValue.id) {
      perspectiveInsight = `${biggestMonetary.name} is your tracked spending focus at ${formatINR(biggestMonetary.monthlyCost)}/month (${biggestMonetary.personalValueScore}/100 value score). Rate it (❤️, 😐, ❌) to let PaisaPulse fine-tune your recommendations.`;
    } else {
      perspectiveInsight = `${biggestMonetary.name} is your largest spending area at ${formatINR(biggestMonetary.monthlyCost)}/month — but your strongest personal value comes from your ${highestValue.name} (${highestValue.personalValueScore}/100 value score).`;
    }
  }

  return {
    dontCutItem: dontCutReason ? protectedHero : null,
    dontCutReason,
    cutItem: primeCutTarget,
    cutAdvice,
    potentialMonthlySavings,
    perspectiveInsight
  };
}

/**
 * Synthetic baseline value map for demonstration and initial zero-transaction state
 */
function getSyntheticBaselineValueMap(userFeedback = {}) {
  const syntheticList = [
    {
      id: 'cluster_chai_coffee',
      name: 'Daily Tea & Tapri Chai',
      category: 'Food',
      emoji: '☕',
      totalSpent: 300,
      monthlyCost: 300,
      transactionCount: 28,
      avgAmount: 10,
      baseValueScore: 92,
      isDailyRitual: true,
      defaultDescription: 'Daily morning & evening tea ritual'
    },
    {
      id: 'cluster_fitness_gym',
      name: 'Gym & Fitness Membership',
      category: 'Health',
      emoji: '🏋️',
      totalSpent: 1200,
      monthlyCost: 1200,
      transactionCount: 1,
      avgAmount: 1200,
      baseValueScore: 88,
      isDailyRitual: false,
      defaultDescription: 'Fitness routine & health'
    },
    {
      id: 'cluster_daily_commute',
      name: 'Metro & Auto Commute',
      category: 'Transport',
      emoji: '🚆',
      totalSpent: 1100,
      monthlyCost: 1100,
      transactionCount: 24,
      avgAmount: 45,
      baseValueScore: 74,
      isDailyRitual: true,
      defaultDescription: 'College & office transit'
    },
    {
      id: 'cluster_food_delivery',
      name: 'Weekend Food Delivery',
      category: 'Food',
      emoji: '🍔',
      totalSpent: 2200,
      monthlyCost: 2200,
      transactionCount: 8,
      avgAmount: 275,
      baseValueScore: 42,
      isDailyRitual: false,
      defaultDescription: 'Late-night weekend Swiggy/Zomato orders'
    },
    {
      id: 'cluster_subscriptions',
      name: 'Streaming Subscriptions',
      category: 'Entertainment',
      emoji: '🎬',
      totalSpent: 649,
      monthlyCost: 649,
      transactionCount: 2,
      avgAmount: 325,
      baseValueScore: 64,
      isDailyRitual: false,
      defaultDescription: 'Netflix & Spotify'
    },
    {
      id: 'cluster_impulse_shopping',
      name: 'Online Retail & Impulse Carts',
      category: 'Shopping',
      emoji: '🛍️',
      totalSpent: 1800,
      monthlyCost: 1800,
      transactionCount: 4,
      avgAmount: 450,
      baseValueScore: 32,
      isDailyRitual: false,
      defaultDescription: 'Amazon & quick commerce impulse orders'
    }
  ];

  const totalMonthlyDiscretionary = syntheticList.reduce((sum, c) => sum + c.monthlyCost, 0);
  const costThreshold = 800;

  const evaluated = syntheticList.map(cluster => {
    const feedback = userFeedback[cluster.id] || null;
    let score = cluster.baseValueScore;

    let feedbackImpact = 'Derived from daily frequency and behavioral stability';
    if (feedback === VALUE_RATINGS.VALUABLE) {
      score = Math.min(98, score + 25);
      feedbackImpact = 'Marked as "Very Valuable" by you (❤️)';
    } else if (feedback === VALUE_RATINGS.NOT_WORTH_IT) {
      score = Math.max(12, score - 35);
      feedbackImpact = 'Marked as "Not Worth It" by you (❌)';
    } else if (feedback === VALUE_RATINGS.NEUTRAL) {
      score = 50;
      feedbackImpact = 'Marked as "Neutral" by you (😐)';
    }

    const isHighValue = score >= 60;
    const isHighCost = cluster.monthlyCost >= costThreshold;

    let quadrant = null;
    if (isHighValue && !isHighCost) quadrant = QUADRANTS.HIGH_VALUE_LOW_COST;
    else if (isHighValue && isHighCost) quadrant = QUADRANTS.HIGH_VALUE_HIGH_COST;
    else if (!isHighValue && !isHighCost) quadrant = QUADRANTS.LOW_VALUE_LOW_COST;
    else quadrant = QUADRANTS.LOW_VALUE_HIGH_COST;

    return {
      ...cluster,
      clusterId: cluster.id,
      clusterName: cluster.name,
      icon: cluster.emoji,
      quadrantDef: quadrant,
      frequencyLabel: cluster.isDailyRitual ? 'Daily Ritual' : `${cluster.transactionCount} transactions/mo`,
      personalValueScore: score,
      userRating: feedback,
      confidence: feedback ? 'HIGH' : 'MEDIUM',
      confidenceReason: feedback ? 'Confirmed by your explicit feedback' : 'Standard verified pattern',
      quadrant,
      feedbackImpact
    };
  });

  const rankedByValue = [...evaluated].sort((a, b) => b.personalValueScore - a.personalValueScore);
  const rankedByCost = [...evaluated].sort((a, b) => b.monthlyCost - a.monthlyCost);

  const quadrantMap = {
    HIGH_VALUE_LOW_COST: evaluated.filter(c => c.quadrant?.id === 'HIGH_VALUE_LOW_COST'),
    HIGH_VALUE_HIGH_COST: evaluated.filter(c => c.quadrant?.id === 'HIGH_VALUE_HIGH_COST'),
    LOW_VALUE_LOW_COST: evaluated.filter(c => c.quadrant?.id === 'LOW_VALUE_LOW_COST'),
    LOW_VALUE_HIGH_COST: evaluated.filter(c => c.quadrant?.id === 'LOW_VALUE_HIGH_COST')
  };

  const insights = generateSpendValueInsights(evaluated, quadrantMap, totalMonthlyDiscretionary);

  return {
    clusters: evaluated,
    rankedByValue: rankedByValue || [],
    rankedByCost: rankedByCost || [],
    quadrants: quadrantMap,
    totalMonthlyDiscretionary,
    costThreshold,
    insights,
    dontCutItem: insights?.dontCutItem,
    dontCutReason: insights?.dontCutReason,
    cutItem: insights?.cutItem,
    cutAdvice: insights?.cutAdvice,
    potentialMonthlySavings: insights?.potentialMonthlySavings,
    perspectiveInsight: insights?.perspectiveInsight,
    calculatedAt: new Date().toISOString()
  };
}
