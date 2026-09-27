// PaisaPulse Intelligent Hybrid Categorizer
// Combines Deterministic Rules + Known Indian Merchant DB + Historical User Corrections + LLM for Ambiguous Cases

import { MERCHANT_PATTERNS, CATEGORIES } from '../../engine/types.js';
import { executeAIPrompt } from './aiClient.js';

const USER_OVERRIDES_KEY = 'paisapulse_category_overrides';

// Get user-corrected merchant categories
export function getUserCategoryOverrides() {
  try {
    const raw = localStorage.getItem(USER_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Save a user's manual correction so the system learns permanently
export function saveUserCategoryOverride(merchantName, category) {
  if (!merchantName || !category) return;
  const key = merchantName.toLowerCase().trim();
  const overrides = getUserCategoryOverrides();
  overrides[key] = category;
  try {
    localStorage.setItem(USER_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch (e) {
    console.error('Failed to save category override:', e);
  }
}

/**
 * Hybrid Categorization Engine
 *
 * 1. Historical User Correction Check
 * 2. Deterministic Rule & Pattern Matching
 * 3. AI LLM Classification for Ambiguous Cases
 */
export async function categorizeTransaction({
  description = '',
  merchant = '',
  amount = 0,
  date = '',
  paymentMethod = 'UPI',
  rawType = ''
}) {
  const cleanMerchant = (merchant || description).toLowerCase().trim();
  const fullText = `${description} ${merchant}`.toLowerCase();

  // 1. Check Historical User Corrections
  const overrides = getUserCategoryOverrides();
  if (overrides[cleanMerchant] && CATEGORIES[overrides[cleanMerchant]]) {
    const cat = overrides[cleanMerchant];
    return {
      category: cat,
      confidence: 0.99,
      reason: 'Matched from your previous personal correction',
      recurring: false,
      type: CATEGORIES[cat]?.isIncome ? 'income' : 'expense'
    };
  }

  // 2. Deterministic Rule Matching (Fast, reliable, zero latency)
  for (const pattern of MERCHANT_PATTERNS) {
    if (pattern.match.test(fullText)) {
      return {
        category: pattern.category,
        confidence: 0.96,
        reason: `${pattern.category} merchant or keyword detected`,
        recurring: !!pattern.recurring,
        essential: !!pattern.essential,
        type: pattern.type || (amount < 0 ? 'expense' : 'income'),
        certainty: pattern.certainty || (pattern.type === 'income' ? 'confirmed' : undefined)
      };
    }
  }

  // 3. Fallback type inference
  let inferredType = 'expense';
  if (/cr|credit|deposit|salary|stipend|freelance|bonus|received/i.test(rawType || fullText)) {
    inferredType = 'income';
  } else if (/transfer|xfer|split/i.test(rawType || fullText)) {
    inferredType = 'transfer';
  }

  // 4. If transaction is ambiguous and LLM is enabled, call AI
  const prompt = `Classify this Indian bank transaction into exactly ONE of these categories:
Categories: Food, Travel, Education, Rent/Hostel, Shopping, Entertainment, Subscriptions, Bills, Healthcare, Salary, Stipend, Freelance, Family Transfer, Cash Withdrawal, Other.

Transaction Details:
Description: "${description}"
Merchant: "${merchant}"
Amount: ₹${Math.abs(amount)}
Payment Method: "${paymentMethod}"

Respond ONLY with valid JSON in this exact structure:
{"category": "Food", "confidence": 0.85, "reason": "Short reason", "recurring": false}`;

  const aiResult = await executeAIPrompt({
    systemPrompt: 'You are an Indian banking transaction classification system. Return only structured JSON.',
    userPrompt: prompt,
    maxTokens: 120
  });

  if (aiResult.success && aiResult.text) {
    try {
      const jsonMatch = aiResult.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (CATEGORIES[parsed.category]) {
          return {
            category: parsed.category,
            confidence: parsed.confidence || 0.88,
            reason: `AI: ${parsed.reason}`,
            recurring: !!parsed.recurring,
            type: inferredType
          };
        }
      }
    } catch {
      // Fall through to deterministic default
    }
  }

  // 5. Default Deterministic Fallback
  return {
    category: inferredType === 'income' ? 'Salary' : 'Other',
    confidence: 0.65,
    reason: 'General cashflow transaction',
    recurring: false,
    type: inferredType
  };
}

/**
 * Synchronous / offline category inference
 */
export function categorizeTransactionOffline(text = '') {
  const clean = (text || '').toLowerCase().trim();
  const overrides = getUserCategoryOverrides();
  if (overrides[clean] && CATEGORIES[overrides[clean]]) {
    return {
      category: overrides[clean],
      confidence: 0.99,
      reason: 'Matched from your previous personal correction'
    };
  }

  for (const pattern of MERCHANT_PATTERNS) {
    if (pattern.match.test(clean)) {
      return {
        category: pattern.category,
        confidence: 0.96,
        reason: `${pattern.category} merchant pattern detected`,
        recurring: !!pattern.recurring,
        essential: !!pattern.essential
      };
    }
  }

  return {
    category: 'Other',
    confidence: 0.5,
    reason: 'Unmatched transaction'
  };
}
