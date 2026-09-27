import { MERCHANT_PATTERNS, CATEGORIES } from './types.js';

/**
 * Universal CSV Parser that handles quoted values, commas inside quotes,
 * and different line endings (\r\n or \n).
 */
export function parseRawCSV(csvText) {
  if (!csvText || !csvText.trim()) {
    throw new Error('CSV content is empty');
  }

  const lines = [];
  let row = [];
  let currentToken = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentToken += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentToken.trim());
      currentToken = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n of \r\n
      }
      row.push(currentToken.trim());
      currentToken = '';
      if (row.some(cell => cell.length > 0)) {
        lines.push(row);
      }
      row = [];
    } else {
      currentToken += char;
    }
  }

  if (currentToken.length > 0 || row.length > 0) {
    row.push(currentToken.trim());
    if (row.some(cell => cell.length > 0)) {
      lines.push(row);
    }
  }

  if (lines.length < 2) {
    throw new Error('CSV must have a header row and at least one data row');
  }

  const headers = lines[0].map(h => h.replace(/^["']|["']$/g, '').trim());
  const rows = lines.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = r[idx] !== undefined ? r[idx] : '';
    });
    return obj;
  });

  return { headers, rows, format: 'csv' };
}

/**
 * Universal JSON Parser for transaction statements (arrays or { transactions: [...] })
 */
export function parseRawJSON(jsonText) {
  if (!jsonText || !jsonText.trim()) {
    throw new Error('JSON content is empty');
  }

  const parsed = JSON.parse(jsonText);
  let arrayData = [];

  if (Array.isArray(parsed)) {
    arrayData = parsed;
  } else if (parsed && typeof parsed === 'object') {
    if (Array.isArray(parsed.transactions)) {
      arrayData = parsed.transactions;
    } else if (Array.isArray(parsed.data)) {
      arrayData = parsed.data;
    } else if (Array.isArray(parsed.statement)) {
      arrayData = parsed.statement;
    } else {
      const arrKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
      if (arrKey) {
        arrayData = parsed[arrKey];
      } else {
        throw new Error('JSON must contain an array of transaction objects');
      }
    }
  }

  if (arrayData.length === 0) {
    throw new Error('No transactions found in JSON file');
  }

  const headerSet = new Set();
  arrayData.forEach(item => {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach(k => headerSet.add(k));
    }
  });

  const headers = Array.from(headerSet);
  const rows = arrayData.map(item => {
    const obj = {};
    headers.forEach(h => {
      obj[h] = item[h] !== undefined ? item[h] : '';
    });
    return obj;
  });

  return { headers, rows, format: 'json' };
}

/**
 * Auto-detects statement format (CSV or JSON) and parses
 */
export function detectAndParseStatement(rawContent) {
  const trimmed = (rawContent || '').trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      return parseRawJSON(trimmed);
    } catch {
      return parseRawCSV(trimmed);
    }
  }
  return parseRawCSV(trimmed);
}

/**
 * Heuristics to auto-detect best column mappings from arbitrary headers
 */
export function autoDetectMappings(headers) {
  const mapping = {
    date: '',
    description: '',
    amount: '',
    type: '',
    merchant: '',
    category: '',
    withdrawal: '',
    deposit: ''
  };

  const lowerHeaders = headers.map(h => ({ raw: h, lower: h.toLowerCase().replace(/[^a-z0-9]/g, '') }));

  // Date
  const dateMatch = lowerHeaders.find(h => /date|time|txn_date|transdate|posteddate|txndate|valuedate/.test(h.lower));
  if (dateMatch) mapping.date = dateMatch.raw;

  // Description / Narration
  const descMatch = lowerHeaders.find(h => /desc|narration|particular|detail|remark|memo|title|note/.test(h.lower));
  if (descMatch) mapping.description = descMatch.raw;

  // Withdrawal / Debit Column
  const withdrawMatch = lowerHeaders.find(h => /withdrawal|debit|outflow|dr|spent/.test(h.lower));
  if (withdrawMatch) mapping.withdrawal = withdrawMatch.raw;

  // Deposit / Credit Column
  const depositMatch = lowerHeaders.find(h => /deposit|credit|inflow|cr|received/.test(h.lower));
  if (depositMatch) mapping.deposit = depositMatch.raw;

  // Amount
  const amtMatch = lowerHeaders.find(h => /amount|amt|total|inr|price|netamount|value/.test(h.lower));
  if (amtMatch) {
    mapping.amount = amtMatch.raw;
  } else if (mapping.withdrawal) {
    mapping.amount = mapping.withdrawal;
  }

  // Type (Debit/Credit or Income/Expense)
  const typeMatch = lowerHeaders.find(h => /type|drcr|trxtype|crdr|categorytype|flow/.test(h.lower));
  if (typeMatch) mapping.type = typeMatch.raw;

  // Merchant
  const merchMatch = lowerHeaders.find(h => /merchant|payee|beneficiary|vendor|store|counterparty|channel/.test(h.lower));
  if (merchMatch) mapping.merchant = merchMatch.raw;

  // Category
  const catMatch = lowerHeaders.find(h => /cat|category|tag|group|classification/.test(h.lower));
  if (catMatch) mapping.category = catMatch.raw;

  if (!mapping.merchant && mapping.description) {
    mapping.merchant = mapping.description;
  }

  return mapping;
}

/**
 * Checks if a narration represents an Opening / Closing balance snapshot rather than an actual expense
 */
export function isBalanceSnapshotNarration(text = '') {
  return /opening\s*bal|balance\s*b\/f|balance\s*brought\s*forward|available\s*(today|balance)|opening\s*balance|ledger\s*bal|closing\s*bal/i.test(text);
}

/**
 * Cleans messy Indian bank narrations and extracts recognizable merchant names & payment channels
 * e.g. "UPI/529182/SWIGGY/OKHDFC" -> merchant: "Swiggy", paymentMethod: "UPI @okhdfcbank"
 */
export function cleanIndianNarration(rawNarration = '') {
  const text = (rawNarration || '').trim();
  if (!text) return { cleanedDescription: 'Transaction', cleanedMerchant: 'Unknown Store', paymentMethod: 'UPI' };

  let paymentMethod = 'UPI';
  let cleanedMerchant = text;

  // Detect payment channel
  if (/atm|cash\s*wdl|atm-cash/i.test(text)) {
    paymentMethod = 'ATM Cash Withdrawal';
  } else if (/neft|rtgs/i.test(text)) {
    paymentMethod = 'NEFT/RTGS Bank Transfer';
  } else if (/imps/i.test(text)) {
    paymentMethod = 'IMPS Direct Deposit';
  } else if (/mandate|nach|auto-debit|e-mandate/i.test(text)) {
    paymentMethod = 'Auto-Debit e-Mandate';
  } else if (/pos|card|visa|mastercard|rupay/i.test(text)) {
    paymentMethod = 'Debit Card POS';
  } else if (/upi|@ok|@paytm|@ybl|@axl|@icici/i.test(text)) {
    const handleMatch = text.match(/@([a-zA-Z0-9]+)/);
    paymentMethod = handleMatch ? `UPI @${handleMatch[1]}` : 'UPI';
  }

  // Extract clean merchant name from common Indian SMS/Bank format
  const upiParts = text.split(/[/|-]/).map(s => s.trim()).filter(Boolean);
  if (upiParts.length >= 3) {
    const foundWord = upiParts.find(p => p.length > 2 && !/^\d+$/.test(p) && !/^(upi|cr|dr|rev|pos|txn|inr|sms)$/i.test(p));
    if (foundWord) {
      cleanedMerchant = foundWord.charAt(0).toUpperCase() + foundWord.slice(1).toLowerCase();
    }
  }

  // Format known merchant names cleanly
  const knownMerchants = [
    'Swiggy', 'Zomato', 'Blinkit', 'Zepto', 'Instamart', 'Uber', 'Ola', 'Rapido', 
    'Netflix', 'Spotify', 'Amazon', 'Flipkart', 'Apollo Pharmacy', 'Airtel', 'Jio', 
    'Cult.fit', 'Hotstar', 'BookMyShow', 'SBI ATM', 'HDFC Bank ATM', 'TCS', 'Infosys', 
    'Razorpay', 'Papa', 'Mummy'
  ];

  for (const km of knownMerchants) {
    if (new RegExp(km, 'i').test(text)) {
      cleanedMerchant = km;
      break;
    }
  }

  return {
    cleanedDescription: text,
    cleanedMerchant,
    paymentMethod
  };
}

/**
 * Intelligent categorizer & metadata inferrer with confidence score
 */
export function inferCategoryAndType(description = '', merchant = '', inputType = '', amount = 0) {
  const text = `${description} ${merchant}`.toLowerCase();

  // Pattern search
  for (const item of MERCHANT_PATTERNS) {
    if (item.match.test(text)) {
      return {
        category: item.category || 'Other',
        type: item.type || (amount < 0 ? 'expense' : 'income'),
        recurring: !!item.recurring,
        essential: !!item.essential,
        confidence: 0.96,
        isBalanceSnapshot: !!item.isBalanceSnapshot
      };
    }
  }

  // Type inference fallback
  let inferredType = 'expense';
  if (inputType) {
    const lowerType = inputType.toLowerCase();
    if (/cr|credit|income|inflow|deposit/.test(lowerType)) {
      inferredType = 'income';
    } else if (/transfer|xfer/.test(lowerType)) {
      inferredType = 'transfer';
    }
  } else if (amount > 0 && /salary|stipend|freelance|bonus|received|credit|from papa|from mom|allowance/i.test(text)) {
    inferredType = 'income';
  }

  let inferredCategory = inferredType === 'income' ? 'Salary' : 'Other';

  return {
    category: inferredCategory,
    type: inferredType,
    recurring: false,
    essential: false,
    confidence: 0.70,
    isBalanceSnapshot: isBalanceSnapshotNarration(text)
  };
}

/**
 * Normalizes, repairs incomplete data, and validates mapped statement rows
 * CRITICAL FIX: Identifies Opening Balance rows and NEVER treats them as expenses!
 */
export function validateAndNormalizeCSVRows(rows, mapping, existingTransactions = []) {
  const seenInBatch = new Set();
  let detectedOpeningBalance = null;

  const normalizedRows = rows.map((rawRow, index) => {
    const errors = [];
    const warnings = [];
    let autoRepaired = false;

    // 1. Date Validation & Incomplete Repair
    const rawDate = (rawRow[mapping.date] || '').toString().trim();
    let parsedDate = '';
    
    if (!rawDate) {
      parsedDate = new Date().toISOString().split('T')[0];
      warnings.push('Incomplete data: Missing date auto-assigned to today');
      autoRepaired = true;
    } else {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) {
        const match = rawDate.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
        if (match) {
          const year = match[3].length === 2 ? `20${match[3]}` : match[3];
          parsedDate = `${year}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
        } else {
          parsedDate = new Date().toISOString().split('T')[0];
          warnings.push(`Irregular date "${rawDate}" normalized to today`);
          autoRepaired = true;
        }
      } else {
        parsedDate = d.toISOString().split('T')[0];
      }
    }

    // 2. Amount Validation
    let parsedAmount = 0;
    let inferredTypeFromSign = 'expense';

    const rawWithdrawal = mapping.withdrawal ? (rawRow[mapping.withdrawal] || '').toString().replace(/[^\d.-]/g, '') : '';
    const rawDeposit = mapping.deposit ? (rawRow[mapping.deposit] || '').toString().replace(/[^\d.-]/g, '') : '';

    if (rawWithdrawal && parseFloat(rawWithdrawal) > 0) {
      parsedAmount = Math.abs(parseFloat(rawWithdrawal));
      inferredTypeFromSign = 'expense';
    } else if (rawDeposit && parseFloat(rawDeposit) > 0) {
      parsedAmount = Math.abs(parseFloat(rawDeposit));
      inferredTypeFromSign = 'income';
    } else {
      const rawAmountStr = (rawRow[mapping.amount] || '').toString().replace(/[^\d.-]/g, '');
      parsedAmount = parseFloat(rawAmountStr);
      if (isNaN(parsedAmount) || parsedAmount === 0) {
        errors.push(`Invalid or zero amount: "${rawRow[mapping.amount] || ''}"`);
        parsedAmount = 0;
      } else if (parsedAmount < 0) {
        inferredTypeFromSign = 'expense';
        parsedAmount = Math.abs(parsedAmount);
      }
    }

    // 3. Description & Merchant Cleaning
    const rawDesc = (rawRow[mapping.description] || rawRow[mapping.merchant] || `Transaction #${index + 1}`).toString().trim();
    const { cleanedDescription, cleanedMerchant, paymentMethod } = cleanIndianNarration(rawDesc);
    const merchant = (rawRow[mapping.merchant] || cleanedMerchant).toString().trim();

    // CRITICAL: Check if this row is an Opening Balance / Available Cash snapshot
    const isSnapshot = isBalanceSnapshotNarration(rawDesc) || isBalanceSnapshotNarration(merchant);

    if (isSnapshot) {
      detectedOpeningBalance = parsedAmount;
      warnings.push(`Opening balance detected (₹${parsedAmount.toLocaleString('en-IN')}). Sets account starting cash, NOT an expense!`);
    }

    // 4. Type Validation
    let rawType = (rawRow[mapping.type] || '').toString().trim();
    let normalizedType = isSnapshot ? 'balance_snapshot' : inferredTypeFromSign;
    if (rawType && !isSnapshot) {
      const lower = rawType.toLowerCase();
      if (/cr|credit|income|deposit|inflow/.test(lower)) {
        normalizedType = 'income';
      } else if (/dr|debit|expense|withdrawal|outflow/.test(lower)) {
        normalizedType = 'expense';
      } else if (/transfer|xfer|split/.test(lower)) {
        normalizedType = 'transfer';
      }
    }

    // 5. Inferred category and metadata
    const categoryFromRow = rawRow[mapping.category];
    const categoryInfo = inferCategoryAndType(cleanedDescription, merchant, normalizedType, parsedAmount);
    let category = categoryFromRow && CATEGORIES[categoryFromRow] ? categoryFromRow : categoryInfo.category;
    if (isSnapshot) category = 'Other';

    // 6. Anomaly Detection (Unusual spending)
    let isUnusual = false;
    let unusualReason = '';
    const catRange = CATEGORIES[category]?.typicalDailyRange;
    if (normalizedType === 'expense' && catRange && parsedAmount > catRange[1] * 4 && parsedAmount > 2000) {
      isUnusual = true;
      unusualReason = `Unusual / Needs Review: ₹${parsedAmount.toLocaleString('en-IN')} is unusually high for ${category}`;
      warnings.push(unusualReason);
    }

    // 7. Duplicate-Looking Detection
    const matchesExisting = existingTransactions.some(tx => {
      const dateMatch = tx.date === parsedDate;
      const amtMatch = Math.abs(tx.amount) === Math.abs(parsedAmount);
      const descMatch = (tx.description || '').toLowerCase().trim() === cleanedDescription.toLowerCase().trim() ||
                        (tx.merchant || '').toLowerCase().trim() === merchant.toLowerCase().trim();
      return dateMatch && amtMatch && descMatch;
    });

    const batchKey = `${parsedDate}_${parsedAmount}_${merchant.toLowerCase()}`;
    const isBatchDuplicate = seenInBatch.has(batchKey);
    seenInBatch.add(batchKey);

    const isDuplicate = matchesExisting || isBatchDuplicate;
    if (isDuplicate) {
      warnings.push(isBatchDuplicate ? 'Duplicate-looking entry within statement' : 'Duplicate suspect: already exists in ledger');
    }

    const normalizedRecord = {
      id: `tx_imported_${Date.now()}_${index}`,
      date: parsedDate,
      description: cleanedDescription,
      merchant,
      amount: parsedAmount,
      type: normalizedType,
      category,
      paymentMethod: rawRow.Channel || rawRow.paymentMethod || paymentMethod,
      recurring: categoryInfo.recurring,
      essential: categoryInfo.essential,
      confidence: categoryInfo.confidence,
      source: 'imported',
      isBalanceSnapshot: isSnapshot,
      isUnusual,
      unusualReason
    };

    return {
      index,
      raw: rawRow,
      normalized: normalizedRecord,
      errors,
      warnings,
      isValid: errors.length === 0,
      isDuplicate,
      isBalanceSnapshot: isSnapshot,
      autoRepaired,
      selected: errors.length === 0 && !isDuplicate && !isSnapshot // do not import snapshot as expense
    };
  });

  return {
    rows: normalizedRows,
    detectedOpeningBalance
  };
}
