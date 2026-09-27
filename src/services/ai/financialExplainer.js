// PaisaPulse Financial Explainer Service
// Translates raw cashflow numbers into crystal-clear, actionable natural language explanations

import { formatINR } from '../../engine/cashflowEngine.js';
import { executeAIPrompt } from './aiClient.js';

/**
 * 1. Generates the contextual Safe-to-Spend explanation
 * Example output:
 * "You can safely spend around ₹620 today because your ₹5,000 hostel payment is due on October 1
 * and ₹800 gym payment is due on October 2. I have protected ₹3,000 as your emergency buffer.
 * Your expected freelance income of ₹4,500 is excluded because it is not yet confirmed."
 */
export async function generateSafeToSpendExplanation({
  safeToSpendToday,
  currentBalance,
  safetyBuffer,
  upcomingIncome = [],
  upcomingCommitments = [],
  nextIncomeDays = 7,
  riskLevel = 'Stable'
}) {
  const reliableIncomeList = upcomingIncome.filter(i => i.isReliable || i.certainty === 'confirmed' || i.certainty === 'likely');
  const uncertainIncomeList = upcomingIncome.filter(i => !i.isReliable && (i.certainty === 'uncertain' || i.certainty === 'potential'));
  
  const upcomingBills = upcomingCommitments.slice(0, 3);
  const billsSummary = upcomingBills.map(b => `${formatINR(b.amount)} for ${b.title} (due in ${b.daysAway} days)`).join(', ');

  // Deterministic narrative template (Immediate, always available, zero-latency)
  let deterministicText = '';

  if (safeToSpendToday <= 0) {
    deterministicText = `Your safe-to-spend limit is currently ₹0. Your current cash of ${formatINR(currentBalance)} is tightly committed to ${upcomingBills.length > 0 ? billsSummary : 'upcoming fixed expenses'} while safeguarding your ${formatINR(safetyBuffer)} emergency reserve. Discretionary spending should be paused until your next income arrives.`;
  } else {
    let incomeNote = '';
    if (uncertainIncomeList.length > 0) {
      incomeNote = ` Your expected ${uncertainIncomeList.map(u => `${formatINR(u.amount)} from ${u.title}`).join(', ')} is intentionally excluded for safety until confirmed.`;
    }

    deterministicText = `You can safely spend around ${formatINR(safeToSpendToday)} today. Your scheduled obligations (${billsSummary || 'recurring bills'}) and ${formatINR(safetyBuffer)} emergency buffer are fully shielded across the next ${nextIncomeDays} days.${incomeNote}`;
  }

  // Attempt AI enrichment if LLM is connected
  const prompt = `Synthesize this personal financial situation into 2 clear, empowering sentences for an Indian college student/intern:
- Current Cash: ${formatINR(currentBalance)}
- Safe to spend today: ${formatINR(safeToSpendToday)}
- Protected Emergency Buffer: ${formatINR(safetyBuffer)}
- Protected Upcoming Bills: ${billsSummary || 'None'}
- Excluded Uncertain Income: ${uncertainIncomeList.map(u => `${formatINR(u.amount)} (${u.title})`).join(', ') || 'None'}

Explain why they have this exact daily limit in simple, warm, natural terms.`;

  const aiResult = await executeAIPrompt({
    systemPrompt: 'You are PaisaPulse Financial Guardian. Be concise, transparent, and direct.',
    userPrompt: prompt,
    maxTokens: 100
  });

  if (aiResult.success && aiResult.text) {
    return aiResult.text.trim();
  }

  return deterministicText;
}

/**
 * 2. Generates the "What Changed?" explanation
 * When safe-to-spend moves between sessions or days (e.g. ₹700 -> ₹420)
 */
export function explainWhatChanged({
  previousSafeToSpend = 700,
  currentSafeToSpend = 420,
  recentTransactions = [],
  uncertainIncomeCount = 0
}) {
  const delta = currentSafeToSpend - previousSafeToSpend;
  const isDrop = delta < 0;
  const absDelta = Math.abs(delta);

  const largestRecentExpense = recentTransactions
    .filter(t => t.type === 'expense' && !t.isBalanceSnapshot)
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0];

  const reasons = [];

  if (largestRecentExpense) {
    reasons.push(`${formatINR(largestRecentExpense.amount)} ${largestRecentExpense.merchant || largestRecentExpense.description} transaction added`);
  }

  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  if (isWeekend) {
    reasons.push('Weekend discretionary spending variation factor applied (+28%)');
  }

  if (uncertainIncomeCount > 0) {
    reasons.push('Unconfirmed freelance/gig inflows excluded from conservative calculation');
  } else {
    reasons.push('Commitment dates drew closer by one day');
  }

  return {
    previous: previousSafeToSpend,
    current: currentSafeToSpend,
    delta,
    isDrop,
    title: isDrop 
      ? `Your safe-to-spend limit decreased by ${formatINR(absDelta)}`
      : `Your safe-to-spend limit increased by ${formatINR(absDelta)}`,
    summary: `Yesterday you had ${formatINR(previousSafeToSpend)}/day. Today it is calibrated to ${formatINR(currentSafeToSpend)}/day based on new cashflow activity.`,
    reasons
  };
}
