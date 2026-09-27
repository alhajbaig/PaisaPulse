// Simulated Real-Time Transaction Stream Manager
// Emits real-world Indian events over time to test dynamic reactivity

export const SIMULATION_EVENTS = [
  {
    id: 'sim_salary',
    title: 'Salary / Stipend Received',
    description: 'Corporate Payroll Credit (TCS / TechCorp)',
    merchant: 'TechCorp / TCS Payroll',
    amount: 35000,
    type: 'income',
    category: 'Salary',
    paymentMethod: 'IMPS Direct Deposit',
    recurring: true,
    essential: true,
    confidence: 0.99,
    narrative: 'Monthly corporate salary payout credited to HDFC bank account.'
  },
  {
    id: 'sim_upi_food',
    title: 'Food Purchase via UPI',
    description: 'Swiggy Gourmet Dinner',
    merchant: 'Swiggy India',
    amount: 450,
    type: 'expense',
    category: 'Food',
    paymentMethod: 'UPI @okhdfcbank',
    recurring: false,
    essential: false,
    confidence: 0.98,
    narrative: 'Dinner ordered via Swiggy. Deducted instantly from live balance.'
  },
  {
    id: 'sim_atm_cash',
    title: 'ATM Cash Withdrawal',
    description: 'SBI ATM Cash Outflow',
    merchant: 'SBI ATM Koramangala',
    amount: 3000,
    type: 'expense',
    category: 'Cash Withdrawal',
    paymentMethod: 'Debit Card ATM WDL',
    recurring: false,
    essential: true,
    confidence: 0.97,
    narrative: 'Physical cash withdrawal for weekly offline expenses.'
  },
  {
    id: 'sim_upi_uber',
    title: 'Transport Commute via UPI',
    description: 'Uber Ride to Tech Park',
    merchant: 'Uber India',
    amount: 280,
    type: 'expense',
    category: 'Transport',
    paymentMethod: 'UPI @paytm',
    recurring: false,
    essential: true,
    confidence: 0.96,
    narrative: 'Morning commute auto-deducted via Paytm UPI.'
  },
  {
    id: 'sim_subscription',
    title: 'OTT Subscription Auto-Debit',
    description: 'Netflix & Spotify e-Mandate',
    merchant: 'Netflix India',
    amount: 649,
    type: 'expense',
    category: 'Subscriptions',
    paymentMethod: 'Auto-Debit e-Mandate',
    recurring: true,
    essential: false,
    confidence: 0.99,
    narrative: 'Recurring digital entertainment auto-debit executed.'
  },
  {
    id: 'sim_family',
    title: 'Family Transfer Received',
    description: 'Home Allowance from Papa',
    merchant: 'Family Transfer (Papa)',
    amount: 4000,
    type: 'income',
    category: 'Family Transfer',
    paymentMethod: 'UPI from SBI',
    recurring: false,
    essential: true,
    confidence: 0.98,
    narrative: 'Home monthly support transfer credited instantly.'
  },
  {
    id: 'sim_duplicate_glitch',
    title: 'Duplicate UPI Anomaly Glitch',
    description: 'Swiggy Gourmet Dinner (Double-Debit Glitch)',
    merchant: 'Swiggy India',
    amount: 450,
    type: 'expense',
    category: 'Food',
    paymentMethod: 'UPI @okhdfcbank',
    recurring: false,
    essential: false,
    confidence: 0.95,
    isDuplicateSuspect: true,
    duplicateReason: 'Identical amount and merchant processed at the same timestamp',
    narrative: 'Duplicate debit glitch detected: twin Swiggy debits at identical timestamp.'
  },
  {
    id: 'sim_severe_shock',
    title: 'CRITICAL LIQUIDITY SHOCK',
    description: 'Urgent Hostel/PG Deposit & Laptop Repair',
    merchant: 'PG Landlord & TechFix',
    amount: 12500,
    type: 'expense',
    category: 'Rent',
    paymentMethod: 'Instant UPI Scan',
    recurring: false,
    essential: true,
    confidence: 0.99,
    narrative: 'Sudden unexpected major debit of ₹12,500 that plunges user into immediate severe shortfall risk!'
  },
  {
    id: 'sim_chai',
    title: 'Daily Micro-Spend',
    description: 'Chai Point & Evening Samosas',
    merchant: 'Chai Point',
    amount: 120,
    type: 'expense',
    category: 'Food',
    paymentMethod: 'UPI QR scan',
    recurring: false,
    essential: false,
    confidence: 0.97,
    narrative: 'Evening tapri tea with college friends.'
  },
  {
    id: 'sim_splitwise',
    title: 'Roommate Split Settled via UPI',
    description: 'Splitwise Electricity & WiFi Share',
    merchant: 'Amit (Roommate)',
    amount: 1500,
    type: 'income',
    category: 'Utilities',
    paymentMethod: 'UPI @icici',
    recurring: false,
    essential: true,
    confidence: 0.94,
    narrative: 'Roommate settled pending utility split dues.'
  }
];

export class SimulationStreamController {
  constructor() {
    this.currentIndex = 0;
    this.timer = null;
    this.isRunning = false;
  }

  getSpecificEvent(eventId) {
    const raw = SIMULATION_EVENTS.find(e => e.id === eventId) || SIMULATION_EVENTS[0];
    return this._formatEvent(raw);
  }

  getNextEvent() {
    const raw = SIMULATION_EVENTS[this.currentIndex % SIMULATION_EVENTS.length];
    this.currentIndex++;
    return this._formatEvent(raw);
  }

  _formatEvent(raw) {
    const todayStr = new Date().toISOString().split('T')[0];

    const transaction = {
      id: `tx_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      date: todayStr,
      description: raw.description,
      merchant: raw.merchant,
      amount: raw.amount,
      type: raw.type,
      category: raw.category,
      paymentMethod: raw.paymentMethod,
      recurring: raw.recurring,
      essential: raw.essential,
      confidence: raw.confidence,
      isDuplicateSuspect: !!raw.isDuplicateSuspect,
      duplicateReason: raw.duplicateReason,
      source: 'simulated'
    };

    return {
      transaction,
      eventMeta: raw,
      currentIndex: this.currentIndex,
      totalEvents: SIMULATION_EVENTS.length
    };
  }

  startStream(onEventCallback, intervalMs = 4500) {
    if (this.isRunning) return;
    this.isRunning = true;

    this.timer = setInterval(() => {
      const eventData = this.getNextEvent();
      onEventCallback(eventData);
    }, intervalMs);
  }

  stopStream() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  toggleStream(onEventCallback, intervalMs = 4500) {
    if (this.isRunning) {
      this.stopStream();
      return false;
    } else {
      this.startStream(onEventCallback, intervalMs);
      return true;
    }
  }
}

export const globalSimulationStream = new SimulationStreamController();
