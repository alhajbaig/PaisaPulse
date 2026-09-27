// PaisaPulse Transaction Analyzer & Data Quality Engine
// Detects anomalies, duplicate-looking transactions, missing information, and discovers recurring patterns

import { CATEGORIES } from '../../engine/types.js';
import { formatINR } from '../../engine/cashflowEngine.js';

/**
 * 1. Analyzes transactions for spending anomalies (Unusual / Needs Review)
 * Compares against historical category baseline without false fraud alarms.
 */
export function analyzeSpendingAnomalies(transactions = []) {
  // Compute average per-transaction spend by category
  const categoryStats = {};

  transactions.forEach(t => {
    if (t.type !== 'expense' || t.isBalanceSnapshot) return;
    const cat = t.category || 'Other';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { total: 0, count: 0, amounts: [] };
    }
    categoryStats[cat].total += Math.abs(t.amount);
    categoryStats[cat].count += 1;
    categoryStats[cat].amounts.push(Math.abs(t.amount));
  });

  const categoryAverages = {};
  Object.keys(categoryStats).forEach(cat => {
    const stat = categoryStats[cat];
    const avg = stat.total / stat.count;
    categoryAverages[cat] = {
      avg,
      count: stat.count,
      // Default typical thresholds if not enough history
      highThreshold: Math.max(avg * 3.0, (CATEGORIES[cat]?.typicalDailyRange?.[1] || 500) * 3.5)
    };
  });

  return transactions.map(tx => {
    if (tx.type !== 'expense' || tx.isBalanceSnapshot) return tx;

    const cat = tx.category || 'Other';
    const stats = categoryAverages[cat];
    const amt = Math.abs(tx.amount);

    if (stats && stats.highThreshold && amt > stats.highThreshold && amt > 1000) {
      return {
        ...tx,
        isUnusual: true,
        unusualReason: `Unusual / Needs Review: ₹${amt.toLocaleString('en-IN')} is significantly higher than your typical ${cat} spending (avg ~₹${Math.round(stats.avg).toLocaleString('en-IN')}).`
      };
    }

    return tx;
  });
}

/**
 * 2. Discovers recurring patterns across transactions (Income & Subscriptions)
 * e.g., ₹5,000 around 5th of each month, or Netflix ₹649
 */
export function detectRecurringPatterns(transactions = []) {
  const recurringPatterns = [];
  const groups = {};

  // Group by merchant and similar amount safely
  (transactions || []).forEach(t => {
    if (!t || typeof t !== 'object' || t.isBalanceSnapshot) return;
    const name = String(t.merchant || t.description || 'Unknown').toLowerCase().trim();
    const amt = Math.round(Math.abs(Number(t.amount) || 0));
    const key = `${name}_${amt}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  Object.keys(groups).forEach(key => {
    const list = groups[key];
    if (list.length >= 2) {
      const sample = list[0];
      const isIncome = sample.type === 'income';
      recurringPatterns.push({
        title: sample.merchant || sample.description,
        amount: Math.abs(sample.amount),
        type: sample.type,
        category: sample.category,
        count: list.length,
        description: isIncome 
          ? `Likely recurring income of ₹${Math.abs(sample.amount).toLocaleString('en-IN')} detected from ${sample.merchant}`
          : `Recurring obligation detected: ₹${Math.abs(sample.amount).toLocaleString('en-IN')} (${sample.category})`
      });
    }
  });

  return recurringPatterns;
}

/**
 * 3. Identifies missing or incomplete information in transactions
 */
export function auditDataQuality(transactions = []) {
  let missingCategoryCount = 0;
  let missingDateCount = 0;
  let duplicateCount = 0;
  let unusualCount = 0;

  const audited = transactions.map(t => {
    const issues = [];
    if (!t.category || t.category === 'Other') {
      missingCategoryCount++;
      issues.push('Category unconfirmed');
    }
    if (!t.date) {
      missingDateCount++;
      issues.push('Missing transaction date');
    }
    if (t.isDuplicateSuspect) {
      duplicateCount++;
      issues.push('Duplicate-looking entry');
    }
    if (t.isUnusual) {
      unusualCount++;
      issues.push('Unusual amount');
    }

    return {
      ...t,
      dataQualityIssues: issues
    };
  });

  return {
    transactions: audited,
    stats: {
      total: transactions.length,
      missingCategoryCount,
      missingDateCount,
      duplicateCount,
      unusualCount,
      qualityScore: Math.max(0, 100 - (missingCategoryCount * 4 + duplicateCount * 8 + missingDateCount * 10))
    }
  };
}

/**
 * 4. Identifies duplicate-looking transactions for interactive review
 * Matches identical amounts, dates, and similar merchant/description.
 */
export function detectDuplicateGroups(transactions = []) {
  const groups = [];
  const visited = new Set();

  for (let i = 0; i < transactions.length; i++) {
    const t1 = transactions[i];
    if (visited.has(t1.id) || t1.isBalanceSnapshot) continue;

    const group = [t1];
    for (let j = i + 1; j < transactions.length; j++) {
      const t2 = transactions[j];
      if (!t2 || visited.has(t2.id) || t2.isBalanceSnapshot) continue;

      const sameAmount = Math.abs(Number(t1.amount) || 0) === Math.abs(Number(t2.amount) || 0);
      const sameDate = String(t1.date || '').trim() === String(t2.date || '').trim();
      const sameType = String(t1.type || '').toLowerCase().trim() === String(t2.type || '').toLowerCase().trim();
      const desc1 = String(t1.description || '').toLowerCase().trim();
      const desc2 = String(t2.description || '').toLowerCase().trim();
      const merch1 = String(t1.merchant || '').toLowerCase().trim();
      const merch2 = String(t2.merchant || '').toLowerCase().trim();

      const similarDesc = (desc1 && desc2 && desc1 === desc2) || (merch1 && merch2 && merch1 === merch2) || t1.isDuplicateSuspect || t2.isDuplicateSuspect;

      if (sameAmount && sameDate && sameType && similarDesc) {
        group.push(t2);
        visited.add(t2.id);
      }
    }

    if (group.length > 1) {
      visited.add(t1.id);
      groups.push({
        id: `dup_group_${t1.id || i}`,
        amount: Math.abs(Number(t1.amount) || 0),
        date: t1.date || '',
        description: t1.description || 'Transaction',
        merchant: t1.merchant || '',
        transactions: group
      });
    }
  }

  return groups;
}
