// PaisaPulse — PaisaTwin AI Explainer Service
// Translates the deterministic PaisaTwin model into concise, human-grounded financial intelligence with actionable solutions
// Fully supports English and Hinglish

import { formatINR } from '../../engine/cashflowEngine.js';
import { executeAIPrompt } from './aiClient.js';
import { getActiveLanguage } from '../i18n.jsx';

/**
 * Deterministic offline fallback explanation generator
 * Adheres strictly to the calculated numbers — never fabricates.
 * Generates diagnosis AND concrete, actionable recovery solutions in English or Hinglish.
 */
export function generateDeterministicReadMyMoney(context, language = getActiveLanguage()) {
  const {
    current_cash = 0,
    confirmed_income = 0,
    uncertain_income = 0,
    mandatory_commitments = 0,
    safety_buffer = 3000,
    average_daily_spend = 540,
    safe_to_spend = 620,
    minimum_projected_balance = 0,
    minimum_projected_date = 'upcoming',
    minimum_projected_reason = '',
    financial_health_state = 'WATCH MODE'
  } = context;

  const isHinglish = language === 'hinglish';
  const committedTotal = mandatory_commitments + safety_buffer;

  if (isHinglish) {
    let stateIntro = '';
    if (financial_health_state === 'CHILL MODE') {
      stateIntro = "Aap abhi **CHILL MODE** mein hain. Aapka cashflow aane wale commitments aur poore safety buffer ko aasaani se cover karta hai.";
    } else if (financial_health_state === 'WATCH MODE') {
      stateIntro = "Aap abhi **WATCH MODE** mein hain. Cashflow manageable hai, lekin daily kharche par thoda dhyan rakhna zaroori hai.";
    } else if (financial_health_state === 'TIGHT MODE') {
      stateIntro = "Aap abhi **TIGHT MODE** mein hain. Aane wale bills aur rent aapke available cash par direct pressure daal rahe hain.";
    } else {
      stateIntro = "Aap abhi **PANIC MODE** mein hain! Haath mein cash kam hai aur aane wale mandatory kharche stipend/salary se pehle due hain.";
    }

    const diagnosisParagraphs = [
      stateIntro,
      `Aapke paas abhi sirf **${formatINR(current_cash)}** cash bacha hai, jabki **${formatINR(committedTotal)}** pehle se locked hai (**${formatINR(mandatory_commitments)}** fixed bills/rent ke liye + **${formatINR(safety_buffer)}** protected emergency buffer). Iska matlab hai daily kharche se pehle hi aapke paas deficit gap ban raha hai.`,
      `Aapka rozana kharcha **${formatINR(average_daily_spend)}/day** chal raha hai, jabki safe limit sirf **${formatINR(safe_to_spend)}/day** hai. Halanki **${formatINR(confirmed_income)}** ka confirmed income aane wala hai, asli problem timing ki hai: aapke bills income aane se *pehle* cut hone wale hain.`,
      minimum_projected_balance < 0
        ? `Sabse critical point: **${minimum_projected_date}** ko aapka balance gir kar **-${formatINR(Math.abs(minimum_projected_balance))}** tak pahuch sakta hai kyunki ${minimum_projected_reason || 'rent salary credit se pehle due hai'}.`
        : `Lowest projected balance **${formatINR(minimum_projected_balance)}** tak aayega on **${minimum_projected_date}** (${minimum_projected_reason || 'scheduled bills'}).`
    ];

    if (uncertain_income > 0) {
      diagnosisParagraphs.push(`Note: Aapka **${formatINR(uncertain_income)}** freelance/prize money aana baaki hai, lekin PaisaTwin isko tab tak guaranteed spend mein count nahi karta jab tak bank mein na aa jaye.`);
    }

    const solutions = [];
    if (minimum_projected_balance < 0) {
      const deficit = Math.abs(minimum_projected_balance);
      solutions.push(`1. **Landlord Se Rent Stagger / Delay Ki Baat Karo**: Apne landlord ya PG owner ko inform karein ki stipend **${minimum_projected_date}** ke baad credit hoga. Unse request karein ki **${formatINR(deficit)}** ka balance stipend aane par clear karne dein. Good faith ke liye abhi **${formatINR(Math.min(current_cash, 2000))}** partial pay kar dein.`);
      solutions.push(`2. **Zero-Spend Freeze (Roz Ka Kharcha ₹0)**: Agle 3-4 dino ke liye bahar ka khana (Swiggy/Zomato) aur travel kharche bilkul rok dein. Roz ka **${formatINR(average_daily_spend)}** bachaane se aapka **${formatINR(current_cash)}** cash safe rahega.`);
      solutions.push(`3. **Emergency Buffer Ka Tactical Use**: Aapke paas **${formatINR(safety_buffer)}** ka emergency buffer rakha hua hai. Auto-debit bounce aur penalty se bachne ke liye temporarily **${formatINR(Math.min(deficit, safety_buffer))}** use karein, aur stipend aate hi sabse pehle buffer wapas bharein.`);
    } else if (minimum_projected_balance < safety_buffer) {
      solutions.push(`1. **Safe Limit Ke Andar Kharcha Rakhein**: Discretionary kharcha strictly **${formatINR(safe_to_spend)}/day** ke andar hi rakhein taaki buffer safe rahe.`);
      solutions.push(`2. **Auto-Debits Audit Karein**: Sabhi scheduled bills (**${formatINR(mandatory_commitments)}**) ki exact dates check karein taaki achanak deduct na ho.`);
      solutions.push(`3. **Pending Dues Claim Karein**: Dosto ya room partner se pending Splitwise paise turant request karein.`);
    } else {
      solutions.push(`1. **Safe Spend Discipline Banaye Rakhein**: Rozana kharcha **${formatINR(safe_to_spend)}/day** ke andar hi chalate rahein.`);
      solutions.push(`2. **Surplus Cash Ko Auto-Save Karein**: **${formatINR(safety_buffer)}** buffer ke upar bacha surplus kisi high-interest digital vault mein transfer karein.`);
      solutions.push(`3. **Agla Mahina Pre-Fund Karein**: Aane wale **${formatINR(confirmed_income)}** mein se agle rent ka hissa pehle hi alag account mein rakh lein.`);
    }

    return `${diagnosisParagraphs.join('\n\n')}\n\n### 💡 Recommended Solutions & Action Plan\n\n${solutions.join('\n\n')}`;
  }

  // English implementation
  let stateIntro = '';
  if (financial_health_state === 'CHILL MODE') {
    stateIntro = "You are currently in **CHILL MODE**. Your cashflow comfortably covers upcoming commitments with full safety buffer intact.";
  } else if (financial_health_state === 'WATCH MODE') {
    stateIntro = "You are currently in **WATCH MODE**. Cashflow is manageable, but your spending rate requires steady attention.";
  } else if (financial_health_state === 'TIGHT MODE') {
    stateIntro = "You are currently in **TIGHT MODE**. Upcoming commitments are putting direct pressure on your available cash.";
  } else {
    stateIntro = "You are currently in **PANIC MODE**. Your immediate cash position is critically tight because mandatory commitments land before your next income.";
  }

  const diagnosisParagraphs = [
    stateIntro,
    `You have **${formatINR(current_cash)}** in immediate liquid cash, but **${formatINR(committedTotal)}** is already earmarked (**${formatINR(mandatory_commitments)}** for fixed commitments + **${formatINR(safety_buffer)}** protected emergency buffer). That leaves an immediate pre-commitment gap before daily living costs.`,
    `Your current burn rate is **${formatINR(average_daily_spend)}/day**, compared to your calculated safe-to-spend limit of **${formatINR(safe_to_spend)}/day**. While confirmed income of **${formatINR(confirmed_income)}** is scheduled, the issue is timing: your expenses land *before* your income credits.`,
    minimum_projected_balance < 0
      ? `Critical point: your balance is projected to bottom out at **-${formatINR(Math.abs(minimum_projected_balance))} on ${minimum_projected_date}** because ${minimum_projected_reason || 'mandatory commitments land before salary credit'}.`
      : `Lowest projected balance is expected to hit **${formatINR(minimum_projected_balance)} on ${minimum_projected_date}** (${minimum_projected_reason || 'scheduled bills'}).`
  ];

  if (uncertain_income > 0) {
    diagnosisParagraphs.push(`Note: You have **${formatINR(uncertain_income)}** in expected freelance/prize income, but PaisaTwin conservatively excludes it from guaranteed spend until cleared.`);
  }

  const solutions = [];
  if (minimum_projected_balance < 0) {
    const deficit = Math.abs(minimum_projected_balance);
    solutions.push(`1. **Stagger / Defer Mandatory Due Date**: Contact your landlord or provider to shift the payment due on **${minimum_projected_date}** by 3-5 days so it coincides with your **${formatINR(confirmed_income)}** income credit. Paying even a partial token of **${formatINR(Math.min(current_cash, 2000))}** now prevents full default.`);
    solutions.push(`2. **Emergency Discretionary Freeze**: Drop daily discretionary spending from **${formatINR(average_daily_spend)}/day** to **₹0** immediately. Halting non-essential food deliveries and outings preserves your **${formatINR(current_cash)}** reserve.`);
    solutions.push(`3. **Tactical Cushion Buffer Utilization**: You have **${formatINR(safety_buffer)}** earmarked in your protected buffer. Use up to **${formatINR(Math.min(deficit, safety_buffer))}** temporarily to avoid bank auto-debit bounce penalties, and replenish it the second your **${formatINR(confirmed_income)}** income arrives.`);
  } else if (minimum_projected_balance < safety_buffer) {
    solutions.push(`1. **Cap Daily Outflow at Safe Limit**: Keep discretionary spending strictly below **${formatINR(safe_to_spend)}/day** until **${minimum_projected_date}** to protect your buffer.`);
    solutions.push(`2. **Audit Auto-Debits**: Verify all recurring payments totaling **${formatINR(mandatory_commitments)}** to prevent surprise early debits.`);
    solutions.push(`3. **Accelerate Inflows**: If possible, request early settlement for any pending freelance or project dues.`);
  } else {
    solutions.push(`1. **Maintain Steady Velocity**: Continue spending at or below **${formatINR(safe_to_spend)}/day** to protect your financial health.`);
    solutions.push(`2. **Automate Surplus Savings**: Transfer excess cash above your **${formatINR(safety_buffer)}** buffer into a high-interest savings or liquid fund.`);
    solutions.push(`3. **Set Up Sinking Fund**: Start pre-funding future commitments early to avoid lump-sum pressure.`);
  }

  return `${diagnosisParagraphs.join('\n\n')}\n\n### 💡 Recommended Solutions & Action Plan\n\n${solutions.join('\n\n')}`;
}

/**
 * Main AI "Read My Money" function
 * Passes structured financial JSON context to LLM with deterministic fallback in English or Hinglish
 */
export async function readMyMoneyAI(structuredContext, language = getActiveLanguage()) {
  if (!structuredContext) {
    return {
      text: language === 'hinglish' 
        ? "Aapke paas abhi itna data nahi hai ki model ban sake. Transactions aur bills add karein." 
        : "I don't have enough data yet to model your financial situation. Please add your transactions and commitments.",
      source: 'fallback'
    };
  }

  const isHinglish = language === 'hinglish';
  const languageDirective = isHinglish
    ? `LANGUAGE REQUIREMENT: HINGLISH (CRITICAL MANDATORY REQUIREMENT).
You MUST respond entirely in natural, modern, conversational Roman Hinglish (the Hindi + English blend spoken by Indian college students, e.g. "Arre yaar, suno, abhi aapki financial health **PANIC MODE** mein hai", "Aapke paas abhi sirf **₹1,500** cash hai...", "Landlord se rent stagger karne ki baat karo...", "Daily spend ko ₹0 freeze karo..."). Do not use Devanagari script. Bold all numbers.`
    : `LANGUAGE REQUIREMENT: ENGLISH.
Generate the response in sharp, empathetic, direct English tailored for Indian college students. Bold all numbers.`;

  const prompt = `You are the PaisaTwin Financial Digital Twin for an Indian college student / intern.
Analyze the user's financial health and provide a clear diagnosis followed by concrete, actionable recovery/optimization solutions using ONLY the following calculated financial data:

Financial Data:
${JSON.stringify(structuredContext, null, 2)}

${languageDirective}

Strict Instructions:
1. DIAGNOSIS (2-3 concise, empathetic paragraphs):
   - State their financial mode clearly (e.g. **${structuredContext.financial_health_state}**).
   - Explain immediate liquid cash (**${formatINR(structuredContext.current_cash)}**) vs locked money (**${formatINR(structuredContext.mandatory_commitments + structuredContext.safety_buffer)}** for commitments + buffer).
   - Contrast their burn rate (**${formatINR(structuredContext.average_daily_spend)}/day**) with safe limit (**${formatINR(structuredContext.safe_to_spend)}/day**) and explain the timing gap with their confirmed income (**${formatINR(structuredContext.confirmed_income)}**).
   - Highlight the lowest balance point: **${structuredContext.minimum_projected_balance < 0 ? '-' : ''}${formatINR(Math.abs(structuredContext.minimum_projected_balance))} on ${structuredContext.minimum_projected_date}** and state the exact reason (${structuredContext.minimum_projected_reason}).

2. RECOMMENDED SOLUTIONS & ACTION PLAN:
   - Provide a section titled "### 💡 Recommended Solutions & Action Plan" with exactly 3 numbered, realistic, high-impact solutions for an Indian student/intern.
   - For deficit/panic mode: Include negotiating/staggering rent or payment due dates to align with stipend, enacting an immediate zero-spend freeze on discretionary Swiggy/outings, and utilizing the safety buffer safely to avoid bounce charges.
   - For positive modes: Include maintaining safe spend velocity and building emergency funds.
   - Each solution MUST have a bold action title and specific guidance mentioning exact numbers.

3. Formatting & Style:
   - Bold all key numbers and dates (e.g. **${formatINR(structuredContext.current_cash)}**, **${structuredContext.minimum_projected_date}**).
   - Tone: Sharp, Gen-Z friendly, respectful, empowering, and direct.
   - Never truncate sentences. Finish all thoughts completely.`;

  const aiResult = await executeAIPrompt({
    systemPrompt: `You are PaisaTwin, an empathetic and mathematically rigorous personal financial digital twin. ${isHinglish ? 'Always converse in authentic Roman Hinglish.' : 'Always diagnose clearly and deliver practical, high-impact solutions.'}`,
    userPrompt: prompt,
    maxTokens: 300
  });

  if (aiResult.success && aiResult.text) {
    return {
      text: aiResult.text.trim(),
      source: 'ai'
    };
  }

  return {
    text: generateDeterministicReadMyMoney(structuredContext, language),
    source: 'deterministic'
  };
}
