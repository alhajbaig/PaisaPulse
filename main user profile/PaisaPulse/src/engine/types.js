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
  Receipt
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
  Food: { name: 'Food', color: '#F97316', bg: '#FFEDD5', icon: Utensils, typicalDailyRange: [150, 450] },
  Travel: { name: 'Travel', color: '#3B82F6', bg: '#DBEAFE', icon: Car, typicalDailyRange: [50, 300] },
  Transport: { name: 'Travel', color: '#3B82F6', bg: '#DBEAFE', icon: Car, typicalDailyRange: [50, 300] },
  Education: { name: 'Education', color: '#6366F1', bg: '#E0E7FF', icon: GraduationCap },
  'Rent/Hostel': { name: 'Rent/Hostel', color: '#EF4444', bg: '#FEE2E2', icon: Home, isFixed: true },
  Rent: { name: 'Rent/Hostel', color: '#EF4444', bg: '#FEE2E2', icon: Home, isFixed: true },
  Shopping: { name: 'Shopping', color: '#8B5CF6', bg: '#EDE9FE', icon: ShoppingBag },
  Entertainment: { name: 'Entertainment', color: '#EC4899', bg: '#FCE7F3', icon: Tv },
  Subscriptions: { name: 'Subscriptions', color: '#D946EF', bg: '#FAE8FF', icon: Sparkles, isFixed: true },
  Bills: { name: 'Bills', color: '#EAB308', bg: '#FEF9C3', icon: Receipt, isFixed: true },
  Utilities: { name: 'Bills', color: '#EAB308', bg: '#FEF9C3', icon: Zap, isFixed: true },
  Healthcare: { name: 'Healthcare', color: '#10B981', bg: '#D1FAE5', icon: HeartPulse },
  Salary: { name: 'Salary', color: '#059669', bg: '#ECFDF5', icon: Briefcase, isIncome: true },
  Stipend: { name: 'Stipend', color: '#14B8A6', bg: '#CCFBF1', icon: FileSpreadsheet, isIncome: true },
  Freelance: { name: 'Freelance', color: '#0284C7', bg: '#E0F2FE', icon: Laptop, isIncome: true },
  'Family Transfer': { name: 'Family Transfer', color: '#0D9488', bg: '#F0FDFA', icon: Users, isIncome: true },
  'Cash Withdrawal': { name: 'Cash Withdrawal', color: '#6366F1', bg: '#EEF2FF', icon: Banknote },
  Other: { name: 'Other', color: '#64748B', bg: '#F1F5F9', icon: MoreHorizontal }
};

// Automatic categorization patterns for Indian UPI, merchant names, ATM cash, and banks
export const MERCHANT_PATTERNS = [
  // Cash withdrawals
  { match: /atm\s*(cash|wdl|withdrawal)|cash\s*wdl|sbi\s*atm|hdfc\s*atm|icici\s*atm|axis\s*atm|cash\s*withdrawal|self\s*wdl|atm-cash/i, category: 'Cash Withdrawal', type: 'expense' },
  
  // Food & Dining / Quick Commerce
  { match: /swiggy|zomato|eats|starbucks|mcdonalds|canteen|chai|cafe|burger|biryani|dominos|kfc|blinkit|zepto|instamart|bigbasket|dunzo|haldiram|chaayos|subway|pizza/i, category: 'Food', type: 'expense' },
  
  // Travel & Transport
  { match: /uber|ola|rapido|metro|irctc|redbus|petrol|fuel|indianoil|hpcl|bpcl|makemytrip|cleartrip|yulu|auto\s*fare|bus\s*pass/i, category: 'Travel', type: 'expense' },
  
  // Education & Exams
  { match: /college|university|tuition|exam\s*fee|coursera|udemy|fees|allen|unacademy|byjus|books|semester/i, category: 'Education', type: 'expense' },
  
  // Rent & Hostel
  { match: /hostel|pg\s*rent|nestaway|stanza|flat|landlord|rent|brokerage|nobroker|society\s*maintenance|mess\s*fee/i, category: 'Rent/Hostel', type: 'expense', recurring: true, essential: true },
  
  // E-commerce & Shopping
  { match: /amazon|flipkart|myntra|ajio|meesho|zara|h&m|decathlon|croma|reliance\s*digital|nykaa|tata\s*cliq|cloth/i, category: 'Shopping', type: 'expense' },
  
  // OTT & Digital Subscriptions
  { match: /netflix|spotify|prime|hotstar|youtube|disney|apple\.bill|cult\.fit|gym|sonyliv|zee5|canva|github|openai/i, category: 'Subscriptions', type: 'expense', recurring: true },
  
  // Bills & Utilities
  { match: /airtel|jio|vi\s*bill|electricity|water|wifi|broadband|bescom|gas|tatasky|tata\s*play|act\s*fibernet|recharge|dth/i, category: 'Bills', type: 'expense', recurring: true, essential: true },
  
  // Movies & Leisure
  { match: /pvr|inox|bookmyshow|movies|gaming|steam|playstation|cinepolis/i, category: 'Entertainment', type: 'expense' },
  
  // Medical & Health
  { match: /apollo|medplus|pharmacy|doctor|hospital|clinic|practo|pathology|1mg|pharmeasy|diagnostic|medicine/i, category: 'Healthcare', type: 'expense', essential: true },
  
  // Salary Credits
  { match: /salary|payroll|direct\s*deposit|corporate\s*credit|tcs\s*salary|infosys|wipro|accenture|cognizant|techcorp\s*salary/i, category: 'Salary', type: 'income', recurring: true, certainty: 'confirmed' },
  
  // Stipend Credits
  { match: /stipend|internshala|intern\s*payout|fellowship|research\s*grant/i, category: 'Stipend', type: 'income', recurring: true, certainty: 'confirmed' },
  
  // Freelance Inflows
  { match: /upwork|fiverr|freelance|client|invoice|razorpay\s*payout|stripe|paypal/i, category: 'Freelance', type: 'income', certainty: 'uncertain' },
  
  // Family & Home Transfers
  { match: /papa|mummy|dad|mom|family|brother|sister|home\s*transfer|allowance/i, category: 'Family Transfer', type: 'income', certainty: 'likely' },
  
  // Opening Balance Identifiers - NOT EXPENSES
  { match: /opening\s*bal|balance\s*b\/f|balance\s*brought\s*forward|available\s*(today|balance)|opening\s*balance|ledger\s*bal/i, isBalanceSnapshot: true }
];

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
