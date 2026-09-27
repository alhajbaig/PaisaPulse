// Transaction Model Types, Categories, and Financial Constants for PaisaPulse
import { 
  Utensils, 
  Car, 
  GraduationCap, 
  Home, 
  ShoppingBag, 
  Tv, 
  Sparkles, 
  HeartPulse, 
  Zap, 
  Briefcase, 
  FileSpreadsheet, 
  Laptop, 
  Users, 
  MoreHorizontal,
  Banknote,
  AlertTriangle,
  Receipt,
  Wine,
  Beer
} from 'lucide-react';

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer'
};

// Income Certainty Levels - Safe-to-Spend only depends on reliable income
export const INCOME_CERTAINTY = {
  CONFIRMED: {
    key: 'confirmed',
    label: 'Confirmed',
    weight: 1.0,
    color: '#059669',
    bg: '#ECFDF5',
    description: 'Corporate payroll, verified salary, or guaranteed deposit'
  },
  LIKELY: {
    key: 'likely',
    label: 'Likely',
    weight: 0.85,
    color: '#0D9488',
    bg: '#F0FDFA',
    description: 'Family monthly transfer, recurring stipend'
  },
  UNCERTAIN: {
    key: 'uncertain',
    label: 'Uncertain',
    weight: 0.50,
    color: '#F59E0B',
    bg: '#FFFBEB',
    description: 'Freelance client invoice pending approval, irregular gig'
  },
  POTENTIAL: {
    key: 'potential',
    label: 'Potential',
    weight: 0.0,
    color: '#64748B',
    bg: '#F1F5F9',
    description: 'Hackathon prize, speculative bonus (Excluded from safe-to-spend)'
  }
};

export const CATEGORIES = {
  // Food & Sustenance (Subdivided for Spend Value clarity)
  'Daily Tea & Snacks': { name: 'Daily Tea & Snacks', color: '#D97706', bg: '#FEF3C7', icon: Utensils, typicalDailyRange: [20, 100] },
  'Food Delivery': { name: 'Food Delivery', color: '#EA580C', bg: '#FFEDD5', icon: Utensils, typicalDailyRange: [200, 600] },
  'Groceries & Essentials': { name: 'Groceries & Essentials', color: '#16A34A', bg: '#DCFCE7', icon: ShoppingBag, typicalDailyRange: [150, 800] },
  'Food & Dining': { name: 'Food & Dining', color: '#F97316', bg: '#FFEDD5', icon: Utensils, typicalDailyRange: [150, 450] },
  Food: { name: 'Food & Dining', color: '#F97316', bg: '#FFEDD5', icon: Utensils, typicalDailyRange: [150, 450] },

  // Alcohol, Nightlife & Social Drinks
  'Alcohol & Nightlife': { name: 'Alcohol & Nightlife', color: '#9A3412', bg: '#FFEDD5', icon: Wine, typicalDailyRange: [150, 1200] },
  'Alcohol': { name: 'Alcohol & Nightlife', color: '#9A3412', bg: '#FFEDD5', icon: Wine, typicalDailyRange: [150, 1200] },
  'Liquor': { name: 'Alcohol & Nightlife', color: '#9A3412', bg: '#FFEDD5', icon: Wine, typicalDailyRange: [150, 1200] },
  'Daily Alcohol': { name: 'Alcohol & Nightlife', color: '#9A3412', bg: '#FFEDD5', icon: Wine, typicalDailyRange: [150, 1200] },
  'Drinks & Nightlife': { name: 'Alcohol & Nightlife', color: '#9A3412', bg: '#FFEDD5', icon: Wine, typicalDailyRange: [150, 1200] },

  // Mobility & Transit
  'Commute & Rides': { name: 'Commute & Rides', color: '#2563EB', bg: '#DBEAFE', icon: Car, typicalDailyRange: [50, 300] },
  Travel: { name: 'Commute & Rides', color: '#2563EB', bg: '#DBEAFE', icon: Car, typicalDailyRange: [50, 300] },
  Transport: { name: 'Commute & Rides', color: '#2563EB', bg: '#DBEAFE', icon: Car, typicalDailyRange: [50, 300] },

  // Living & Utilities
  'Rent & Housing': { name: 'Rent & Housing', color: '#DC2626', bg: '#FEE2E2', icon: Home, isFixed: true },
  'Rent/Hostel': { name: 'Rent & Housing', color: '#DC2626', bg: '#FEE2E2', icon: Home, isFixed: true },
  Rent: { name: 'Rent & Housing', color: '#DC2626', bg: '#FEE2E2', icon: Home, isFixed: true },
  'Bills & Recharges': { name: 'Bills & Recharges', color: '#CA8A04', bg: '#FEF9C3', icon: Receipt, isFixed: true },
  Bills: { name: 'Bills & Recharges', color: '#CA8A04', bg: '#FEF9C3', icon: Receipt, isFixed: true },
  Utilities: { name: 'Bills & Recharges', color: '#CA8A04', bg: '#FEF9C3', icon: Zap, isFixed: true },

  // Lifestyle & Wellbeing
  'Digital Subscriptions': { name: 'Digital Subscriptions', color: '#9333EA', bg: '#F3E8FF', icon: Sparkles, isFixed: true },
  Subscriptions: { name: 'Digital Subscriptions', color: '#9333EA', bg: '#F3E8FF', icon: Sparkles, isFixed: true },
  'Fitness & Wellness': { name: 'Fitness & Wellness', color: '#059669', bg: '#ECFDF5', icon: HeartPulse },
  'Shopping & Retail': { name: 'Shopping & Retail', color: '#7C3AED', bg: '#EDE9FE', icon: ShoppingBag },
  Shopping: { name: 'Shopping & Retail', color: '#7C3AED', bg: '#EDE9FE', icon: ShoppingBag },
  'Entertainment & Leisure': { name: 'Entertainment & Leisure', color: '#DB2777', bg: '#FCE7F3', icon: Tv },
  Entertainment: { name: 'Entertainment & Leisure', color: '#DB2777', bg: '#FCE7F3', icon: Tv },
  'Education & Career': { name: 'Education & Career', color: '#4F46E5', bg: '#EEF2FF', icon: GraduationCap },
  Education: { name: 'Education & Career', color: '#4F46E5', bg: '#EEF2FF', icon: GraduationCap },
  'Healthcare & Medical': { name: 'Healthcare & Medical', color: '#0D9488', bg: '#CCFBF1', icon: HeartPulse },
  Healthcare: { name: 'Healthcare & Medical', color: '#0D9488', bg: '#CCFBF1', icon: HeartPulse },
  'Peer Transfers & Splits': { name: 'Peer Transfers & Splits', color: '#0284C7', bg: '#E0F2FE', icon: Users },

  // Inflows
  Salary: { name: 'Salary', color: '#059669', bg: '#ECFDF5', icon: Briefcase, isIncome: true },
  Stipend: { name: 'Stipend', color: '#0D9488', bg: '#CCFBF1', icon: FileSpreadsheet, isIncome: true },
  Freelance: { name: 'Freelance', color: '#0284C7', bg: '#E0F2FE', icon: Laptop, isIncome: true },
  'Family Transfer': { name: 'Family Transfer', color: '#059669', bg: '#F0FDFA', icon: Users, isIncome: true },
  'Cash Withdrawal': { name: 'Cash Withdrawal', color: '#475569', bg: '#F1F5F9', icon: Banknote },
  Other: { name: 'Other Discretionary', color: '#64748B', bg: '#F8FAFC', icon: MoreHorizontal }
};

// Automatic categorization patterns for Indian UPI, merchant names, ATM cash, and banks
export const MERCHANT_PATTERNS = [
  // Cash withdrawals
  { match: /atm\s*(cash|wdl|withdrawal)|cash\s*wdl|sbi\s*atm|hdfc\s*atm|icici\s*atm|axis\s*atm|cash\s*withdrawal|self\s*wdl|atm-cash/i, category: 'Cash Withdrawal', type: 'expense' },

  // Alcohol, Liquor Stores, Theka, Tasmac, Breweries, Bars & Social Drinks
  { 
    match: /\b(alcohol|liquor|wine|beer|whisky|whiskey|vodka|rum|gin|brandy|scotch|bourbon|theka|tasmac|madhushala|madira|sharab|living\s*liquidz|tonique|bira|bira91|kingfisher|carlsberg|budweiser|tuborg|heineken|corona|simba|white\s*owl|bacardi|smirnoff|absolut|old\s*monk|blenders\s*pride|royal\s*stag|signature|antiquity|mcdowell|oaksmith|glenfiddich|jameson|jagermeister|baileys|magic\s*moments|pub\b|brewery|microbrewery|bar\b|bar\s*&|lounge|cocktail|cocktails|tavern|booze|spirits|drinks|social\s*bar|toit|ironhill|byg\s*brewski|arbor\s*brewing|windmills\s*craftworks|effingut|doolally|prost|liquor\s*mart|wine\s*shop|wines|beverages)\b/i, 
    category: 'Alcohol & Nightlife', 
    type: 'expense' 
  },

  // Daily Tea, Chai & Coffee
  { match: /chai|tapri|tea\s*stall|chaayos|chai\s*point|nescafe|starbucks|blue\s*tokai|third\s*wave|coffee|cafe|canteen|samosa|bakery/i, category: 'Daily Tea & Snacks', type: 'expense' },

  // Online Food Delivery
  { match: /swiggy|zomato|eatclub|behrouz|box8|faasos|mcdonald|kfc|domino|burger\s*king|pizza\s*hut|subway|biryani/i, category: 'Food Delivery', type: 'expense' },

  // Groceries & Quick Commerce
  { match: /blinkit|zepto|instamart|bigbasket|bb\s*daily|dmart|supermarket|kirana|grocery|groceries|milk|mother\s*dairy|amul|nature's\s*basket|country\s*delight|dunzo/i, category: 'Groceries & Essentials', type: 'expense' },

  // Commute, Transit & Fuel
  { match: /uber|ola|rapido|metro|dmrc|bmrc|irctc|redbus|petrol|fuel|indianoil|hpcl|bpcl|shell|bus|rail|yulu|auto\s*fare|toll|fastag|makemytrip|cleartrip|goibibo/i, category: 'Commute & Rides', type: 'expense' },

  // Fitness & Gym
  { match: /gym|cult\.fit|cult|anytime\s*fitness|gold's\s*gym|yoga|protein|workout|decathlon|sports|fitness/i, category: 'Fitness & Wellness', type: 'expense' },

  // Digital & OTT Subscriptions
  { match: /netflix|spotify|youtube|hotstar|prime|disney|chatgpt|openai|apple\.bill|google\s*play|icloud|github|discord|sonyliv|zee5|canva|notion/i, category: 'Digital Subscriptions', type: 'expense', recurring: true },

  // Shopping & Retail
  { match: /amazon|flipkart|myntra|ajio|meesho|zara|h&m|croma|reliance\s*digital|nykaa|tata\s*cliq|cloth|footwear|mall|retail/i, category: 'Shopping & Retail', type: 'expense' },

  // Utility Bills & Recharges
  { match: /airtel|jio|vi\s*bill|bescom|electricity|water|wifi|broadband|act\s*fiber|tata\s*play|dth|cylinder|gas|bill\s*desk|recharge/i, category: 'Bills & Recharges', type: 'expense', recurring: true, essential: true },

  // Education & Courses
  { match: /college|university|tuition|coursera|udemy|books|exam|fees|allen|unacademy|xerox|stationery|printing/i, category: 'Education & Career', type: 'expense' },

  // Medical & Health
  { match: /apollo|medplus|pharmacy|1mg|pharmeasy|doctor|clinic|hospital|medicine|practo|diagnostic|pathology/i, category: 'Healthcare & Medical', type: 'expense', essential: true },

  // Rent & Accommodation
  { match: /hostel|pg\s*rent|stanza|nestaway|flat|landlord|rent|brokerage|nobroker|society|maintenance|mess\s*fee/i, category: 'Rent & Housing', type: 'expense', recurring: true, essential: true },

  // Movies & Leisure (Pubs/Bars routed to Alcohol & Nightlife above)
  { match: /pvr|inox|bookmyshow|movies|gaming|steam|playstation|cinepolis|bowling|concert|theater|theatre/i, category: 'Entertainment & Leisure', type: 'expense' },

  // Peer Transfers & Roommate Splits
  { match: /split|roommate|friend|repay|settle|transfer\s*to|upi\/p2p|sent\s*to|paid\s*to/i, category: 'Peer Transfers & Splits', type: 'expense' },

  // Salary Credits
  { match: /salary|payroll|direct\s*deposit|corporate\s*credit|tcs|infosys|wipro|accenture|cognizant/i, category: 'Salary', type: 'income', recurring: true, certainty: 'confirmed' },

  // Stipend Credits
  { match: /stipend|internshala|intern\s*payout|fellowship/i, category: 'Stipend', type: 'income', recurring: true, certainty: 'confirmed' },

  // Freelance Inflows
  { match: /upwork|fiverr|freelance|client|invoice|razorpay\s*payout|stripe|paypal/i, category: 'Freelance', type: 'income', certainty: 'uncertain' },

  // Family Transfers
  { match: /papa|mummy|dad|mom|family|brother|sister|home\s*transfer|allowance/i, category: 'Family Transfer', type: 'income', certainty: 'likely' },

  // General Restaurant / Food fallback
  { match: /restaurant|dhaba|diner|kitchen|mess|food|lunch|dinner|breakfast|canteen|bites/i, category: 'Food & Dining', type: 'expense' },

  // Opening Balance Identifiers - NOT EXPENSES
  { match: /opening\s*bal|balance\s*b\/f|balance\s*brought\s*forward|available\s*(today|balance)|opening\s*balance|ledger\s*bal|starting\s*(account\s*)?balance|initial\s*(account\s*)?balance/i, isBalanceSnapshot: true }
];

/**
 * Intelligent category resolver that upgrades generic "Other" and "Food"
 * into accurate, granular Indian lifestyle categories.
 */
export function resolveTransactionCategory(tx) {
  if (!tx) return 'Other Discretionary';
  const desc = `${tx.description || ''} ${tx.merchant || ''} ${tx.note || ''}`.toLowerCase();
  const current = tx.category;

  // 1. Refine Alcohol & Nightlife
  if (current === 'Alcohol' || current === 'Liquor' || current === 'Nightlife' || current === 'Alcohol & Nightlife' || current === 'Daily Alcohol' || current === 'Drinks & Nightlife') {
    return 'Alcohol & Nightlife';
  }
  if (/\b(alcohol|liquor|wine|beer|whisky|whiskey|vodka|rum|gin|brandy|scotch|bourbon|theka|tasmac|madhushala|madira|sharab|living\s*liquidz|tonique|bira|bira91|kingfisher|carlsberg|budweiser|tuborg|heineken|corona|simba|bacardi|smirnoff|absolut|old\s*monk|blenders\s*pride|royal\s*stag|signature|antiquity|mcdowell|pub\b|brewery|microbrewery|bar\b|lounge|cocktail|cocktails|spirits|drinks|booze|wines)\b/i.test(desc)) {
    return 'Alcohol & Nightlife';
  }

  // 2. Refine generic "Food" if it matches Tea, Delivery, or Groceries
  if (current === 'Food' || current === 'Food & Dining') {
    if (/chai|tapri|tea|coffee|nescafe|starbucks|blue\s*tokai|third\s*wave|cafe|canteen|samosa|bakery/i.test(desc)) {
      return 'Daily Tea & Snacks';
    }
    if (/swiggy|zomato|eatclub|behrouz|box8|faasos|mcdonald|kfc|domino|burger|pizza|subway|biryani/i.test(desc)) {
      return 'Food Delivery';
    }
    if (/blinkit|zepto|instamart|bigbasket|bb\s*daily|dmart|supermarket|kirana|grocery|groceries|milk/i.test(desc)) {
      return 'Groceries & Essentials';
    }
    return 'Food & Dining';
  }

  // 3. Refine generic "Travel" / "Transport"
  if (current === 'Travel' || current === 'Transport') {
    return 'Commute & Rides';
  }

  // 4. Refine generic "Rent/Hostel" / "Rent"
  if (current === 'Rent/Hostel' || current === 'Rent') {
    return 'Rent & Housing';
  }

  // 5. Refine generic "Bills" / "Utilities"
  if (current === 'Bills' || current === 'Utilities') {
    return 'Bills & Recharges';
  }

  // 6. Refine generic "Subscriptions"
  if (current === 'Subscriptions') {
    return 'Digital Subscriptions';
  }

  // 7. Refine generic "Shopping"
  if (current === 'Shopping') {
    return 'Shopping & Retail';
  }

  // 8. Refine generic "Entertainment"
  if (current === 'Entertainment') {
    return 'Entertainment & Leisure';
  }

  // 9. Refine generic "Healthcare"
  if (current === 'Healthcare') {
    return 'Healthcare & Medical';
  }

  // 10. Refine generic "Education"
  if (current === 'Education') {
    return 'Education & Career';
  }

  // If current is an already specific category in CATEGORIES, keep it!
  if (current && current !== 'Other' && current !== 'Other Discretionary' && current !== 'general' && current !== 'General') {
    if (CATEGORIES[current]) return CATEGORIES[current].name || current;
  }

  // 11. Otherwise, match description and merchant against MERCHANT_PATTERNS
  for (const pattern of MERCHANT_PATTERNS) {
    if (pattern.match && pattern.match.test(desc)) {
      return pattern.category;
    }
  }

  // 12. Heuristics for UPI / Micro-spends
  const amt = Math.abs(Number(tx.amount) || 0);
  if (amt > 0 && amt <= 30 && (/tea|chai|tapri|pan|stall|upi/i.test(desc) || !desc)) {
    return 'Daily Tea & Snacks';
  }
  if (/split|share|room|bhai|settle/i.test(desc)) {
    return 'Peer Transfers & Splits';
  }

  return 'Other Discretionary';
}

export const RISK_LEVELS = {
  LOW: { 
    label: 'Stable', 
    color: '#10B981', 
    bg: '#ECFDF5', 
    border: '#A7F3D0', 
    text: "Everything looks good. You're safely on track with no liquidity shortfalls projected." 
  },
  MEDIUM: { 
    label: 'Caution', 
    color: '#F59E0B', 
    bg: '#FFFBEB', 
    border: '#FDE68A', 
    text: "Tight cashflow expected. Safety buffer may be partly compromised around commitment dates." 
  },
  HIGH: { 
    label: 'Shortfall Risk', 
    color: '#EF4444', 
    bg: '#FEF2F2', 
    border: '#FECACA', 
    text: "CRITICAL: High probability of account deficit or bouncing auto-debit commitments before next income!" 
  }
};
