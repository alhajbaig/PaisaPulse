// Realistic Indian Financial Personas with Initial Balances and Baseline Transactions

export const INITIAL_PERSONAS = {
  kartik: {
    id: 'kartik',
    name: 'Kartik Sharma',
    role: 'College Student & Tech Intern',
    email: 'kartik@pulse.in',
    avatar: 'K',
    avatarBg: '#1C1917',
    initialBalance: 12480, // User's initial starting balance
    safetyBuffer: 3000,
    upcomingIncome: [
      { id: 'inc_1', title: 'Internship Stipend', amount: 8000, daysAway: 3, probability: 0.95, date: '24 Sep', source: 'Razorpay / TechCorp', notes: 'Scheduled corporate payout' }
    ],
    upcomingCommitments: [
      { id: 'com_1', title: 'PG Rent', amount: 5000, daysAway: 2, category: 'Rent', essential: true, date: '23 Sep' },
      { id: 'com_2', title: 'Netflix Premium', amount: 649, daysAway: 4, category: 'Subscriptions', essential: false, date: '25 Sep' },
      { id: 'com_3', title: 'Phone Bill (Airtel)', amount: 799, daysAway: 6, category: 'Utilities', essential: true, date: '27 Sep' },
      { id: 'com_4', title: 'Gym Membership', amount: 999, daysAway: 8, category: 'Entertainment', essential: false, date: '29 Sep' }
    ],
    transactions: [
      { 
        id: 'tx_1', 
        date: '2025-09-20', 
        description: 'Swiggy Dinner Delivery', 
        merchant: 'Swiggy', 
        amount: 450, 
        type: 'expense', 
        category: 'Food', 
        paymentMethod: 'UPI @icici', 
        recurring: false, 
        essential: false, 
        confidence: 0.98, 
        source: 'manual' 
      },
      { 
        id: 'tx_dup', 
        date: '2025-09-20', 
        description: 'Swiggy Dinner Delivery', 
        merchant: 'Swiggy', 
        amount: 450, 
        type: 'expense', 
        category: 'Food', 
        paymentMethod: 'UPI @icici', 
        recurring: false, 
        essential: false, 
        confidence: 0.98, 
        source: 'manual', 
        isDuplicateSuspect: true, 
        duplicateReason: 'Identical amount & merchant within 4 mins' 
      },
      { 
        id: 'tx_2', 
        date: '2025-09-19', 
        description: 'Stipend Bonus Credit', 
        merchant: 'TechCorp Internshala', 
        amount: 25000, 
        type: 'income', 
        category: 'Stipend', 
        paymentMethod: 'IMPS Direct Deposit', 
        recurring: true, 
        essential: true, 
        confidence: 0.99, 
        source: 'demo' 
      },
      { 
        id: 'tx_3', 
        date: '2025-09-18', 
        description: 'Amazon Tech Accessories', 
        merchant: 'Amazon India', 
        amount: 1299, 
        type: 'expense', 
        category: 'Shopping', 
        paymentMethod: 'HDFC Debit Card', 
        recurring: false, 
        essential: false, 
        confidence: 0.95, 
        source: 'manual' 
      },
      { 
        id: 'tx_4', 
        date: '2025-09-17', 
        description: 'Uber Ride to College', 
        merchant: 'Uber India', 
        amount: 230, 
        type: 'expense', 
        category: 'Transport', 
        paymentMethod: 'UPI @okhdfcbank', 
        recurring: false, 
        essential: true, 
        confidence: 0.97, 
        source: 'manual' 
      },
      { 
        id: 'tx_5', 
        date: '2025-09-16', 
        description: 'Netflix 4K Subscription', 
        merchant: 'Netflix India', 
        amount: 649, 
        type: 'expense', 
        category: 'Subscriptions', 
        paymentMethod: 'Auto-Debit', 
        recurring: true, 
        essential: false, 
        confidence: 0.99, 
        source: 'demo' 
      },
      { 
        id: 'tx_6', 
        date: '2025-09-15', 
        description: 'Family Support Transfer', 
        merchant: 'Papa', 
        amount: 3000, 
        type: 'income', 
        category: 'Family Transfer', 
        paymentMethod: 'UPI from SBI', 
        recurring: false, 
        essential: true, 
        confidence: 0.99, 
        source: 'demo' 
      },
      { 
        id: 'tx_7', 
        date: '2025-09-14', 
        description: 'Zomato Campus Lunch', 
        merchant: 'Zomato', 
        amount: 320, 
        type: 'expense', 
        category: 'Food', 
        paymentMethod: 'UPI @paytm', 
        recurring: false, 
        essential: false, 
        confidence: 0.98, 
        source: 'manual' 
      },
      { 
        id: 'tx_8', 
        date: '2025-09-13', 
        description: 'University Semester Exam Fee', 
        merchant: 'College Exam Portal', 
        amount: 4500, 
        type: 'expense', 
        category: 'Education', 
        paymentMethod: 'NetBanking Gateway', 
        recurring: false, 
        essential: true, 
        confidence: 0.96, 
        source: 'manual' 
      },
      { 
        id: 'tx_atm_init', 
        date: '2025-09-12', 
        description: 'SBI ATM Cash Withdrawal', 
        merchant: 'SBI ATM Koramangala', 
        amount: 2500, 
        type: 'expense', 
        category: 'Cash Withdrawal', 
        paymentMethod: 'Debit Card ATM', 
        recurring: false, 
        essential: true, 
        confidence: 0.98, 
        source: 'manual' 
      }
    ]
  },
  ananya: {
    id: 'ananya',
    name: 'Ananya Roy',
    role: 'Freelance UI/UX Designer',
    email: 'ananya@design.in',
    avatar: 'A',
    avatarBg: '#7C3AED',
    initialBalance: 24500,
    safetyBuffer: 6000,
    upcomingIncome: [
      { id: 'inc_a1', title: 'SaaS Client Milestone', amount: 35000, daysAway: 6, probability: 0.85, date: '27 Sep', source: 'Stripe Payout', notes: 'Pending client sign-off' }
    ],
    upcomingCommitments: [
      { id: 'com_a1', title: 'Co-working Desk', amount: 8000, daysAway: 3, category: 'Rent', essential: true, date: '24 Sep' },
      { id: 'com_a2', title: 'Figma & Adobe CC', amount: 3200, daysAway: 5, category: 'Subscriptions', essential: true, date: '26 Sep' }
    ],
    transactions: [
      { id: 'tx_a1', date: '2025-09-20', description: 'Blue Tokai Coffee', merchant: 'Blue Tokai', amount: 380, type: 'expense', category: 'Food', paymentMethod: 'UPI @icici', recurring: false, essential: false, confidence: 0.95, source: 'manual' },
      { id: 'tx_a2', date: '2025-09-19', description: 'Retainer Fee Credit', merchant: 'SaaS Corp US', amount: 40000, type: 'income', category: 'Freelance', paymentMethod: 'NEFT Payout', recurring: true, essential: true, confidence: 0.99, source: 'demo' }
    ]
  }
};
