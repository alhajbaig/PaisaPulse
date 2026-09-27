// Groq & Qwen AI Integration Service for PaisaPulse
// High-performance personal finance intelligence powered by LLM with dynamic English and Hinglish language support
import { formatINR } from './cashflowEngine.js';
import { maskSensitiveFinancialData } from '../services/ai/aiClient.js';
import { getActiveLanguage } from '../services/i18n.jsx';

const GROQ_API_KEY = 
  (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_GROQ_API_KEY || process.env?.VITE_GROQ_API_KEY)) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY) || 
  '';

const GROQ_MODELS = [
  (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_GROQ_MODEL || process.env?.VITE_GROQ_MODEL)) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_MODEL) || 
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b'
];
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Builds the comprehensive Indian financial context prompt with Language Directive (English / Hinglish)
 */
export function buildFinancialSystemPrompt(context, language = getActiveLanguage()) {
  const {
    userName = 'Alhaj',
    currentBalance = 0,
    safeToSpendToday = 0,
    upcomingIncome = [],
    upcomingCommitments = [],
    safetyBuffer = 3000,
    forecastRisk = 'Stable',
    minProjectedBalance = 0,
    shortfallDay = null,
    recentTransactions = [],
    learnedPreferences = {}
  } = context;

  const nextIncome = upcomingIncome[0];
  const commitmentsSummary = upcomingCommitments.length > 0
    ? upcomingCommitments.map(c => `• ${c.title || c.name}: ${formatINR(c.amount)} due in ${c.daysAway || 2} days (${c.essential ? 'Essential' : 'Discretionary'})`).join('\n')
    : 'No fixed commitments scheduled';

  const transactionsSummary = recentTransactions.slice(0, 5).map(t => 
    `• ${t.date}: ${t.type === 'income' ? '+' : '-'}${formatINR(t.amount)} (${t.description || t.merchant}, ${t.category})`
  ).join('\n');

  const isHinglish = language === 'hinglish';

  const languageDirective = isHinglish
    ? `
LANGUAGE DIRECTIVE: HINGLISH (CRITICAL MANDATORY REQUIREMENT)
- The user has chosen HINGLISH mode. You MUST answer entirely in natural, modern, conversational Roman Hinglish (the Hindi + English blend spoken by Indian college students, young professionals, and interns).
- Use natural expressions: "Bhai, tension mat lo...", "Aapka Safe-to-Spend limit ₹${safeToSpendToday}/day hai", "Swiggy pe ₹350 kharcha mat karo kyunki agle hafte rent due hai", "Hostel mess ya ghar ka khana khao 2-3 din", "Stipend aane tak emergency buffer ko touch mat hone dena", "Arre suno...".
- Do NOT use Devanagari script; write strictly in Roman script (Latin letters).
- Keep all numbers (₹ amounts, dates, percentages) mathematically exact.
- Always provide clear verdicts like: **Verdict: Safe to Spend (Bindaas kharcha karo)** or **Verdict: High Risk (Ruko, kharcha mat karo)**.
`
    : `
LANGUAGE DIRECTIVE: ENGLISH
- The user has chosen ENGLISH mode. You MUST answer in clear, empathetic, direct English tailored for Indian college students and young professionals.
- Use authentic Indian financial terminology (₹, UPI, GPay, Swiggy, Zomato, PG Rent, Splitwise).
- Always provide clear verdicts: **Verdict: Safe to Spend**, **Verdict: Caution**, or **Verdict: High Risk**.
`;

  return `You are PaisaPulse Guardian, a world-class, sharp, empathetic Indian Personal AI Financial Guardian.
You advise Indian college students, interns, and young professionals on cashflow, discretionary spending, commitments, and avoiding shortfalls.

${languageDirective}

${context.spendValueInsights ? `SPEND VALUE INTELLIGENCE ("What Is Actually Worth Your Money" - Money Cost != Personal Value):
- PROTECTED / DO NOT CUT (High Personal Value): ${context.spendValueInsights.dontCutItem ? context.spendValueInsights.dontCutItem.name + ' (~₹' + context.spendValueInsights.dontCutItem.monthlyCost + '/mo) - ' + context.spendValueInsights.dontCutReason : 'Daily tea & fitness are high value.'}
- PRIMARY CUT / OPTIMIZATION TARGET (Low Value / High Cost): ${context.spendValueInsights.cutItem ? context.spendValueInsights.cutItem.name + ' (~₹' + context.spendValueInsights.cutItem.monthlyCost + '/mo) - ' + context.spendValueInsights.cutAdvice : 'Weekend food delivery & impulse shopping.'}
- LIFESTYLE PRESERVATION DIRECTIVE: If the user asks where to cut expenses ("kaha spending cut karni chahiye?", "can I cut tea?", "how to save money"), DO NOT tell them to cut their daily tea or gym! Defend their daily high-value routine and recommend trimming low-value/high-cost orders instead.

` : ''}USER'S LIVE FINANCIAL REALITY (Single Source of Truth):
- User Name: ${userName}
- Current Liquid Bank Balance: ${formatINR(currentBalance)}
- Safe-to-Spend Limit Today: ${formatINR(safeToSpendToday)}/day
- Safety Buffer Target: ${formatINR(safetyBuffer)} (never to be breached for discretionary spends)
- Next Scheduled Inflow: ${nextIncome ? `${formatINR(nextIncome.amount)} (${nextIncome.title || nextIncome.source}) in ${nextIncome.daysAway} days` : 'None scheduled'}
- Scheduled Commitments Due:
${commitmentsSummary}
- 14-Day Cashflow Risk State: ${forecastRisk.toUpperCase()}
- Projected Minimum Balance in Window: ${formatINR(minProjectedBalance)}
${shortfallDay ? `- SHORTFALL ALERT: Deficit of ${formatINR(shortfallDay.deficit || shortfallDay.gap || 201)} projected around ${shortfallDay.dayLabel || 'Day 4'}!` : '- No shortfall currently projected.'}

Recent Transactions (last 5):
${transactionsSummary || 'None recorded yet'}

User's Learned Behavioral Preferences:
- Subscription Protection: ${learnedPreferences.subscriptionProtectionWeight > 0.7 ? 'High (Protects Netflix/Spotify; do not suggest cancelling unless critical)' : 'Moderate'}
- Dining Flexibility: ${learnedPreferences.discretionaryCapFlexibility > 0.6 ? 'High (Willing to reduce Swiggy/Zomato/dining out)' : 'Moderate'}
- Peer Splits: ${learnedPreferences.peerSplitAggressiveness > 0.7 ? 'Active (Prefers recovering pending Splitwise/roommate dues)' : 'Standard'}

CORE INSTRUCTIONS FOR YOUR ANSWERS:
1. ALWAYS answer the user's specific question directly! Do NOT just repeat a generic warning.
2. If the user asks whether they can afford a purchase (e.g. "Can I afford a ₹350 Swiggy dinner tonight?", "Can I spend ₹1,200?"):
   - Calculate the exact math: Current balance (${formatINR(currentBalance)}) minus the purchase, compared against their Safe-to-Spend (${formatINR(safeToSpendToday)}) and buffer.
   - Explain what remains for the day.
3. If they ask how to avoid a shortfall:
   - Provide 3 concrete Indian student action steps (e.g. collect pending roommate Splitwise dues, cap Swiggy orders, stick to college canteen/hostel mess for 3-4 days).
4. If they ask about salary or stipend delays:
   - Calculate how many days their current cash (${formatINR(currentBalance)}) will last at their daily burn before hitting the buffer.
5. Format with clean markdown (bold numbers, concise bullet points). Keep answers focused, engaging, and under 180 words.`;
}

/**
 * Calls Groq API with conversation messages and real-time user financial context
 */
export async function queryGroqGuardian({
  messages,
  financialContext,
  language = getActiveLanguage(),
  temperature = 0.4,
  maxTokens = 280
}) {
  const lastUserMessage = messages[messages.length - 1]?.text || '';

  // Clamped output tokens: Groq on-demand has a strict 1,000 OTPM rate limit per request window
  const safeMaxTokens = Math.min(Math.max(Number(maxTokens) || 280, 80), 320);

  // If no API key configured, use intelligent dynamic rule engine
  if (!GROQ_API_KEY) {
    return {
      text: generateLocalFallbackResponse(lastUserMessage, financialContext, language),
      modelUsed: `PaisaPulse Dynamic Engine (${language === 'hinglish' ? 'Hinglish' : 'English'})`,
      success: true,
      isDeterministicFallback: true
    };
  }

  const systemPrompt = buildFinancialSystemPrompt(financialContext, language);

  // Keep message history concise to protect token window
  const recentMessages = messages.slice(-6);

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...recentMessages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: typeof m.text === 'string' ? m.text : (m.structured?.summary || JSON.stringify(m.structured))
    }))
  ];

  // Try available models sequentially
  for (const modelId of GROQ_MODELS) {
    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: modelId,
          messages: apiMessages,
          temperature,
          max_tokens: safeMaxTokens
        })
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.warn(`Groq model ${modelId} failed (${response.status}):`, errText);
        continue;
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content;
      if (reply) {
        return {
          text: reply.trim(),
          modelUsed: `Groq LPU (${modelId})`,
          success: true
        };
      }
    } catch (err) {
      console.warn(`Groq request error on model ${modelId}:`, err);
    }
  }

  // Graceful dynamic fallback if all models fail
  return {
    text: generateLocalFallbackResponse(lastUserMessage, financialContext, language),
    modelUsed: 'PaisaPulse Dynamic Engine (Live)',
    success: true,
    isDeterministicFallback: true
  };
}

/**
 * Truly dynamic contextual engine that tailors the answer to the exact question asked in English or Hinglish
 */
export function generateLocalFallbackResponse(query, context, language = getActiveLanguage()) {
  const q = (query || '').toLowerCase().trim();
  const {
    currentBalance = 0,
    safeToSpendToday = 0,
    upcomingIncome = [],
    upcomingCommitments = [],
    safetyBuffer = 3000,
    forecastRisk = 'Stable',
    minProjectedBalance = 0,
    shortfallDay = null
  } = context;

  const isHinglish = language === 'hinglish';
  const nextInc = upcomingIncome?.[0];
  const commitmentsTotal = upcomingCommitments.reduce((sum, c) => sum + (c.amount || 0), 0);

  // 1. AFFORDABILITY & PURCHASE QUESTIONS
  if (q.includes('afford') || q.includes('spend') || q.includes('buy') || q.includes('order') || q.includes('swiggy') || q.includes('zomato') || q.includes('dinner') || q.includes('kharcha') || q.includes('khareed')) {
    const match = query.match(/(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i);
    let amount = match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
    if (isNaN(amount) || amount === 0) {
      if (q.includes('swiggy') || q.includes('dinner') || q.includes('food')) amount = 350;
    }

    if (amount > 0) {
      const remainingBalance = currentBalance - amount;
      const exceedsSafeLimit = safeToSpendToday > 0 ? amount > safeToSpendToday : true;
      const breachesBuffer = remainingBalance < safetyBuffer;

      if (!exceedsSafeLimit && !breachesBuffer) {
        if (isHinglish) {
          return `**Verdict: Safe to Spend (Bindaas Kharcha Karo!)**\n\nHaan bhai, aap aasaani se **${formatINR(amount)}** spend kar sakte ho.\n\n• **Pocket Cash Available**: ${formatINR(currentBalance)}\n• **Kharcha Karne Ke Baad**: ${formatINR(remainingBalance)}\n• **Aaj Ka Safe Limit**: ${formatINR(safeToSpendToday)}\n\nYe kharcha aapki daily **${formatINR(safeToSpendToday)}/day** safe spending limit ke andar fit baithta hai. Aapka **${formatINR(safetyBuffer)} emergency buffer** aur scheduled bills bilkul safe hain. Enjoy your meal!`;
        }
        return `**Verdict: Safe to Spend**\n\nYes, you can comfortably spend **${formatINR(amount)}**.\n\n• **Liquid Cash Available**: ${formatINR(currentBalance)}\n• **Remaining Today**: ${formatINR(remainingBalance)}\n• **Daily Safe Cap**: ${formatINR(safeToSpendToday)}\n\nThis purchase fits safely inside your daily discretionary limit of **${formatINR(safeToSpendToday)}/day**. Your scheduled commitments and **${formatINR(safetyBuffer)} emergency buffer** remain 100% protected. Enjoy your meal!`;
      } else if (!breachesBuffer) {
        if (isHinglish) {
          return `**Verdict: Caution (Daily Limit Se Zyada Hai)**\n\nAapke account mein **${formatINR(amount)}** dene jitna paisa (${formatINR(currentBalance)}) hai, lekin ye aapke recommended **${formatINR(safeToSpendToday)}/day** limit se zyada hai.\n\n• **Kharcha Karne Ke Baad**: ${formatINR(remainingBalance)}\n• **Protected Buffer**: ${formatINR(safetyBuffer)}\n• **Aane Wale Bills**: ${formatINR(commitmentsTotal)}\n\nAgar aaj ye kharcha karte ho, toh kal thoda haath tight rakhna taaki month-end pe koi dikkat na aaye.`;
        }
        return `**Verdict: Caution (Exceeds Daily Cap)**\n\nYou have enough liquid cash (${formatINR(currentBalance)}) to cover **${formatINR(amount)}**, but it exceeds your recommended safe daily limit of **${formatINR(safeToSpendToday)}**.\n\n• **Balance After Spend**: ${formatINR(remainingBalance)}\n• **Protected Safety Buffer**: ${formatINR(safetyBuffer)}\n• **Committed Outflows**: ${formatINR(commitmentsTotal)}\n\nIf you proceed, consider keeping your discretionary spending minimal tomorrow to keep your month-end trajectory on track.`;
      } else {
        if (isHinglish) {
          return `**Verdict: High Risk (Ruko, Buffer Khatre Mein Hai!)**\n\nAgar abhi **${formatINR(amount)}** kharcha kiya, toh aapka balance **${formatINR(remainingBalance)}** pe aa jayega, jo ki aapke **${formatINR(safetyBuffer)} emergency buffer** se kam hai.\n\nAage **${formatINR(commitmentsTotal)}** ke bills due hain. Abhi ye kharcha karna bank balance ko negative mein daal sakta hai. Better hai jab tak salary/stipend na aaye, ye kharcha postpone karo!`;
        }
        return `**Verdict: High Risk (Buffer Pressure)**\n\nSpending **${formatINR(amount)}** will push your balance down to **${formatINR(remainingBalance)}**, which is below your protected **${formatINR(safetyBuffer)} safety reserve**.\n\nWith upcoming commitments of **${formatINR(commitmentsTotal)}** due before your next income, spending this now risks putting your bank balance into deficit. We recommend postponing non-essential purchases until after your next income arrives.`;
      }
    }
  }

  // 2. SHORTFALL / DEFICIT MITIGATION
  if (q.includes('avoid') || q.includes('shortfall') || q.includes('deficit') || q.includes('crisis') || q.includes('bachein') || q.includes('kam pad')) {
    const deficitAmt = shortfallDay?.deficit || shortfallDay?.gap || 201;
    if (isHinglish) {
      return `**Upcoming Shortfall Se Kaise Bachein**:\n\nAapke live cashflow ke hisaab se **${shortfallDay?.dayLabel || 'Oct 14'}** ko lagbhag **${formatINR(deficitAmt)}** ki shortage aa sakti hai.\n\nBachne ke liye 3 seedhe desi steps:\n1. **Roommate / Dosto Ka Splitwise Vasoolo**: Dosto pe pending dues claim karo (approx +₹850 recovery).\n2. **Swiggy / Zomato Band**: Agle 3-4 din mess ya canteen mein khao, seedha ${formatINR(safeToSpendToday * 2)} cash bachega.\n3. **Actions Tab Mein Mitigation Lagao**: **Actions & Sikho** tab mein jaakar auto-cap activate kar lo.\n\nYe 3 steps follow karne se shortfall 100% khatam ho jayega aur aapka ${formatINR(safetyBuffer)} buffer safe rahega!`;
    }
    return `**How to Avoid Your Upcoming Shortfall**:\n\nBased on your live cashflow, you have a projected gap of **${formatINR(deficitAmt)}** around **${shortfallDay?.dayLabel || 'Oct 14'}**.\n\nHere is your immediate 3-step action plan:\n1. **Recover Roommate Dues**: Nudge friends on Splitwise/UPI for pending shared expenses (+₹850 recovery).\n2. **Cap Dining Out**: Shift to hostel mess or home meals for 3-4 days to preserve approximately ${formatINR(safeToSpendToday * 2)} liquid cash.\n3. **Deploy Mitigation Plan**: Head to the **Actions & Learning** tab to lock in the automated spending cap.\n\nFollowing these steps completely closes the gap and keeps you comfortably above your ${formatINR(safetyBuffer)} safety cushion!`;
  }

  // 3. EXPENSE CUTS
  if (q.includes('cut') || q.includes('reduce') || q.includes('save') || q.includes('trim') || q.includes('band') || q.includes('rok')) {
    if (isHinglish) {
      return `**Turant Konsa Kharcha Band Karein**:\n\n1. **Food Delivery (Swiggy / Zomato)**: Roz ka bahar se khana sabse bada leak hota hai. Isko rokne se seedha **₹200–₹400/day** bach jayega.\n2. **OTT & Subscriptions**: Netflix, Prime jaisi apps ka auto-debit pause kar do jab tak stipend credit na ho.\n3. **Cabs & Autos**: Metro ya bus use karo agle 5 dino ke liye.\n\nSirf in teen cheezon se agle ek hafte mein **₹1,200–₹1,800** cash bachega!`;
    }
    return `**Top Expenses to Trim Immediately**:\n\n1. **Food Delivery & Cafes (Swiggy/Zomato)**: Discretionary dining is typically the fastest lever. Capping daily food orders recovers **₹200–₹400/day** immediately.\n2. **Non-Essential Subscriptions**: Pause auto-debits on entertainment services (e.g. Netflix, Prime) until your next confirmed salary/stipend clears.\n3. **Cabs & Auto-rickshaws**: Switch to metro, bus, or shared rides for the next 5 days.\n\nFocusing on these preserves approximately **₹1,200–₹1,800** in liquid cash over the next week.`;
  }

  // 4. INCOME DELAY QUESTIONS
  if (q.includes('delay') || q.includes('late') || q.includes('delayed') || q.includes('postponed') || q.includes('der')) {
    const dailyBurn = Math.max(300, safeToSpendToday || 450);
    const cushionDays = Math.max(1, Math.floor((currentBalance - safetyBuffer) / dailyBurn));
    if (isHinglish) {
      return `**Agar Stipend / Salary Late Hui Toh**:\n\n• **Current Cash**: ${formatINR(currentBalance)}\n• **Protected Buffer**: ${formatINR(safetyBuffer)}\n• **Runway**: Current kharche par lagbhag **${cushionDays} din** nikal sakte hain.\n\nAgar 4 din salary late aayi, toh balance ${formatINR(safetyBuffer)} buffer tak dip karega. Safe rehne ke liye rozana kharcha **${formatINR(Math.round(safeToSpendToday * 0.7))}** ke andar rakhein.`;
    }
    return `**Impact of Delayed Income**:\n\n• **Current Liquid Balance**: ${formatINR(currentBalance)}\n• **Protected Safety Buffer**: ${formatINR(safetyBuffer)}\n• **Available Runway**: Approximately **${cushionDays} days** at your current burn rate.\n\nIf your income is delayed by 4–5 days, your balance will draw down near your ${formatINR(safetyBuffer)} safety floor. To stay completely safe, limit daily spending to under **${formatINR(Math.round(safeToSpendToday * 0.7))}** until the credit confirmation arrives.`;
  }

  // 5. MATHEMATICAL FORMULA
  if (q.includes('formula') || q.includes('math') || q.includes('calculate') || q.includes('samjhao') || q.includes('kaise')) {
    const days = nextInc?.daysAway || 7;
    if (isHinglish) {
      return `**Safe-to-Spend Ka Asli Formula**:\n\n$$\\text{Safe Daily Spend} = \\frac{\\text{Current Cash} - \\text{Fixed Bills} - \\text{Buffer}}{\\text{Next Income Mein Bache Din}} \\times 0.85$$\n\n**Aapke Data Ka Live Hisaab**:\n• Pocket Cash: **${formatINR(currentBalance)}**\n• Aane Wale Bills: -**${formatINR(commitmentsTotal)}**\n• Emergency Buffer: -**${formatINR(safetyBuffer)}**\n• Bachne Wala Free Paisa: **${formatINR(Math.max(0, currentBalance - commitmentsTotal - safetyBuffer))}**\n• ${days} dino mein divide karke = **${formatINR(safeToSpendToday)}/day** (15% volatility buffer safety ke saath).`;
    }
    return `**Safe-to-Spend Mathematical Formula**:\n\n$$\\text{Safe Daily Spend} = \\frac{\\text{Current Cash} - \\text{Committed Bills} - \\text{Safety Buffer}}{\\text{Days Until Next Income}} \\times 0.85$$\n\n**Your Live Ledger Math**:\n• Current Cash: **${formatINR(currentBalance)}**\n• Upcoming Bills: -**${formatINR(commitmentsTotal)}**\n• Protected Buffer: -**${formatINR(safetyBuffer)}**\n• Discretionary Cash: **${formatINR(Math.max(0, currentBalance - commitmentsTotal - safetyBuffer))}**\n• Divided over ${days} days = **${formatINR(safeToSpendToday)}/day** (includes a 15% volatility buffer).`;
  }

  // 6. RENT / COMMITMENTS / AUTO-DEBIT BOUNCE
  if (q.includes('bounce') || q.includes('rent') || q.includes('auto-debit') || q.includes('commitment')) {
    const isSafe = currentBalance >= commitmentsTotal + safetyBuffer;
    if (isHinglish) {
      return `**Rent & Auto-Debit Check**:\n\n• **Total Bills Due**: ${formatINR(commitmentsTotal)}\n• **Current Balance**: ${formatINR(currentBalance)}\n• **Verdict**: ${isSafe ? '**Koi Bounce Risk Nahi Hai**' : '**Tight Liquidity / Deficit Risk**'}\n\n${isSafe 
        ? `Aapke account mein ${formatINR(currentBalance)} hai jo bills cover karne ke liye kaafi hai.` 
        : `Aapka balance shortfall date ke aas-paas ${formatINR(minProjectedBalance)} tak gir sakta hai. Auto-debit hit hone se pehle account mein kam se kam ${formatINR(commitmentsTotal)} maintain karein.`}`;
    }
    return `**Auto-Debit & Rent Safety Check**:\n\n• **Total Scheduled Commitments**: ${formatINR(commitmentsTotal)}\n• **Liquid Balance**: ${formatINR(currentBalance)}\n• **Verdict**: ${isSafe ? '**No Bounce Risk**' : '**Tight Liquidity / Deficit Risk**'}\n\n${isSafe 
      ? `Your bank balance of ${formatINR(currentBalance)} is sufficient to cover your scheduled commitments without bouncing.` 
      : `Your balance is projected to reach ${formatINR(minProjectedBalance)} around the shortfall date. Ensure you maintain at least ${formatINR(commitmentsTotal)} liquid in your primary bank account before auto-debit triggers.`}`;
  }

  // 7. DEFAULT CONTEXTUAL RESPONSE
  if (isHinglish) {
    return `**PaisaPulse Guardian Live Insights**:\n\n• **Pocket Cash**: ${formatINR(currentBalance)}\n• **Safe Daily Spend**: **${formatINR(safeToSpendToday)}/day**\n• **Cashflow State**: **${forecastRisk}**\n• **Emergency Buffer**: ${formatINR(safetyBuffer)}\n\nMain aapke bank account aur bills pe nazar rakh raha hu. Poochhein kuch bhi (jaise *"Kya main ₹800 spend kar sakta hu?"* ya *"Shortfall se kaise bachein?"*)!`;
  }
  return `**PaisaPulse Guardian Insights**:\n\n• **Liquid Cash**: ${formatINR(currentBalance)}\n• **Safe-to-Spend**: **${formatINR(safeToSpendToday)}/day**\n• **Risk State**: **${forecastRisk}**\n• **Buffer Target**: ${formatINR(safetyBuffer)}\n\nI am actively watching your bank account and commitments. Feel free to ask about specific purchases (e.g. *"Can I spend ₹800 tonight?"*), salary delays, or expense trimming plans!`;
}

/**
 * Dynamic prompt suggestions tailored to live risk level and language
 */
export function getSmartPromptSuggestions(financialContext, language = getActiveLanguage()) {
  const { forecastRisk = 'Stable', safeToSpendToday = 0, shortfallDay } = financialContext;
  const isHinglish = language === 'hinglish';

  if (forecastRisk === 'Shortfall Risk' || shortfallDay) {
    if (isHinglish) {
      return [
        'Upcoming shortfall se kaise bachein?',
        'Kya shortfall date pe mera rent auto-debit bounce hoga?',
        'Konsa daily kharcha turant band karein?',
        'Kya main aaj raat ₹350 ka Swiggy dinner afford kar sakta hu?',
        'Safe-to-spend ka exact mathematical formula samjhao',
        'Agar stipend 4 din late aaye to kya hoga?'
      ];
    }
    return [
      'How do I avoid my upcoming shortfall?',
      'Can I afford a ₹350 Swiggy dinner tonight?',
      'Which daily expenses should I cut immediately?',
      'Will my rent auto-debit bounce on the shortfall date?',
      'Show exact mathematical formula for safe-to-spend',
      'What happens if my stipend is delayed by 4 days?'
    ];
  }

  if (isHinglish) {
    return [
      `Kya main iss weekend ${formatINR(Math.max(500, safeToSpendToday * 2))} spend kar sakta hu?`,
      'Mera safe-to-spend itna kam kyun calculate hua?',
      'Agar meri agli stipend 5 din delay ho jaye toh kya hoga?',
      'Kya main dosto ke sath trip afford kar sakta hu?',
      'Konsa aane wala bill sabse zyada risky hai?',
      'Apna emergency buffer kaise badhayein?'
    ];
  }

  return [
    `Can I safely spend ${formatINR(Math.max(500, safeToSpendToday * 2))} this weekend?`,
    'Why is my safe-to-spend calculated as it is?',
    'What if my next salary / stipend is delayed by 5 days?',
    'Can I afford a weekend trip with friends?',
    'Which upcoming commitments carry the most risk?',
    'How do I build a larger liquidity cushion?'
  ];
}
