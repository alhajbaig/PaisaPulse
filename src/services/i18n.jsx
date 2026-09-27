"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { soundFX } from '../engine/audioEffects.js';

const STORAGE_KEY = 'paisapulse_user_language';

// Global accessor for non-React files (Groq service, engine, etc.)
let currentGlobalLanguage = typeof window !== 'undefined' 
  ? (localStorage.getItem(STORAGE_KEY) || 'en')
  : 'en';

export function getActiveLanguage() {
  return currentGlobalLanguage;
}

export function setActiveLanguageGlobal(lang) {
  currentGlobalLanguage = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
    try {
      window.dispatchEvent(new CustomEvent('paisapulse_language_change', { detail: lang }));
    } catch (_) {}
  }
}

export const translations = {
  en: {
    // Brand & Tagline
    app_name: 'PaisaPulse',
    app_subtitle: 'AI Cashflow Guardian',
    app_motto: '“Your money. Your future. One digital twin.”',

    // Language Toggle
    lang_toggle_label: 'Language',
    lang_english: 'English',
    lang_hinglish: 'Hinglish',

    // Sidebar & Navigation
    nav_dashboard: 'Dashboard',
    nav_paisatwin: 'PaisaTwin 🧬',
    nav_transactions: 'Transactions',
    nav_forecast: 'Forecast',
    nav_scenarios: 'Scenarios',
    nav_insights: 'Insights',
    nav_actions: 'Actions & Learning',
    nav_guardian: 'Guardian Chat',
    sidebar_guardian_title: 'Your AI Financial Guardian',
    sidebar_guardian_sub: 'Always watching, looking ahead. Click to ask.',

    // Header
    header_greeting: 'Hello, {name}! Welcome to PaisaPulse',
    header_role_badge: 'Dynamic Liquidity Guardian • {role}',
    btn_live_demo: 'Live Demo Scenario (1–8)',
    btn_hide_demo: 'Hide Scenario Tour',
    btn_login_switch: 'Log In / Switch',
    btn_signup: 'Sign Up',
    btn_logout: 'Log Out',
    btn_explore_twin: 'Explore Twin',

    // Financial Reality Hero Bar
    safe_to_spend_title: 'Safe-to-Spend Today',
    safe_to_spend_desc: 'Discretionary money you can safely spend before next income without bouncing scheduled auto-debits.',
    status_stable: 'Stable Cashflow',
    status_tight: 'Tight Cashflow',
    status_panic: 'Severe Shortfall Risk',
    status_watch: 'Watch Mode',
    status_chill: 'Chill Mode',
    available_cash: 'Available Cash',
    available_cash_sub: 'Current liquid balance in hand',
    confirmed_inflow: 'Confirmed Incoming',
    confirmed_inflow_sub: 'Guaranteed salary / stipend credit',
    protected_money: 'Protected Money',
    protected_money_sub: 'Fixed rent & bills + safety buffer',
    daily_burn: 'Average Daily Burn',
    daily_burn_sub: 'Variable discretionary velocity',
    safe_daily_spend: 'Safe-to-Spend Limit',
    safe_daily_spend_sub: 'Recommended daily discretionary cap',
    next_pressure: 'Next Pressure',
    no_bills_due: 'No critical bills due soon',
    due_in_days: 'in {days} days',

    // Actions & Buttons
    btn_can_i_afford: 'Can I Afford This?',
    btn_why_this_number: 'Why This Number?',
    btn_add_transaction: '+ Add Transaction',
    btn_import_csv: 'Import Bank CSV',
    btn_manage_commitments: 'Manage Commitments',
    btn_reset_data: 'Reset to Sample Data',

    // PaisaTwin View
    twin_hero_title: 'PaisaTwin',
    twin_hero_sub: '“Your money. Your future. One digital twin.”',
    read_my_money_title: 'Read My Money — AI Interpretation & Solutions',
    read_my_money_sub: 'Synthesizes your balances, commitments, and burn velocity into a direct, human summary with actionable recovery steps.',
    btn_generate_summary: '✨ Generate Fresh Summary',
    btn_analyzing_summary: 'Analyzing via Groq AI...',
    solutions_header: 'Recommended Solutions & Action Plan',
    solutions_header_sub: 'Tailored to your exact Indian bank commitments',
    copy_script_btn: 'Copy WhatsApp Script for Landlord',
    script_copied: 'WhatsApp Message Copied!',
    simulate_scenario_btn: 'Simulate in What-If Scenarios',
    ask_guardian_btn: 'Ask Guardian AI',
    horizon_title: '🔮 If You Keep Spending Like This...',
    horizon_sub: 'Projected balances assuming your normal burn rate continues without intervention:',
    days_7: '7 Days',
    days_14: '14 Days',
    days_30: '30 Days',
    lowest_point_title: 'Lowest Projected Point:',
    expected_on: 'Expected: {date}',
    confidence_title: '🎯 PaisaTwin Confidence',
    confidence_high: 'High Reliability',
    money_timeline_title: '⏳ Your Money Timeline',
    money_timeline_sub: 'Chronological sequence of all upcoming financial movements:',
    where_money_going_title: '🧐 Where Is My Money Going?',
    where_money_going_sub: 'Breakdown of upcoming committed and projected variable outflow by category.',
    twin_uncertain_note: 'Uncertain / freelance income is never used in guaranteed Safe-to-Spend.',
    twin_chart_title: '📈 30-Day Visual Cashflow Outlook',
    twin_chart_sub: 'Day-by-day projected cash balance factoring in scheduled bills, incomes, and daily burn rate.',
    twin_safety_floor: 'Safety Buffer Floor:',
    twin_today: 'Today',
    twin_in_days: 'In {days} days ({date})',
    twin_potential: 'Potential',

    // Dashboard View
    dash_brief_title: "TODAY'S DECISION BRIEF",
    dash_single_truth: "Single Source of Truth",
    dash_good_day: "Good day, {name}! 👋",
    dash_can_i_afford_btn: "Can I Afford Something?",
    dash_setup_guide: "Setup Guide",
    dash_avail_cash: "Available Liquid Cash",
    dash_safe_today: "Safe Discretionary Today",
    dash_why_btn: "Why?",
    dash_next_event: "Next Critical Event",
    dash_cashflow_health: "Cashflow Health",
    dash_deficit_alert: "Deficit alert around {day}",
    dash_protected_status: "Protected — No shortfall expected",
    dash_q1_title: "1. How Much Can I Spend Today?",
    dash_q1_why: "Why this number?",
    dash_q1_per_day: "/ today",
    dash_q1_desc: "You can spend up to approximately {amount} today without putting your upcoming rent, bills, or safety buffer at risk.",
    dash_q1_next_income: "Next Income: in {days} days",
    dash_q1_test_btn: "Test a specific purchase →",
    dash_q2_title: "2. Why? (Guaranteed Protections)",
    dash_q2_cash: "Current available cash:",
    dash_q2_income: "Salary/Stipend in {days} days:",
    dash_q2_bills: "Mandatory bills protected:",
    dash_q2_buffer: "Untouchable emergency buffer:",
    dash_q2_weekend: "Weekend spending surge calibrated (+28%)",
    dash_q3_title: "3. What is Coming? (Next Movements)",
    dash_q3_edit: "+ Edit Bills",
    dash_q3_none: "No scheduled cash movements added yet.",
    dash_q4_title: "4. Is There a Problem?",
    dash_q4_buffer_breach: "Buffer Breach Risk Detected",
    dash_q4_shortfall_text: "Projected low of {min} on {date}. You may dip {amount} below your {buffer} safety floor.",
    dash_q4_caution: "Status: Caution Required",
    dash_q4_no_shortfall: "No Shortfall Expected",
    dash_q4_safe_text: "Lowest projected balance is {min} on {date}.",
    dash_q4_buffer_label: "Safety Buffer: {buffer}",
    dash_q4_headroom: "Headroom: +{amount}",
    dash_q5_title: "5. Your Next Best Action (AI Cashflow Optimization)",
    dash_q5_sim_badge: "Simulated / Plan Only",
    dash_q5_no_action: "No immediate protective actions required. Your daily cashflow plan is optimal.",
    dash_q5_in_plan: "✓ In Active Plan",
    dash_q5_apply: "Apply to Plan",
    dash_q5_not_relevant: "Not Relevant",
    dash_what_changed: "What Changed in Your Cashflow?",
    dash_forecast_chart_title: "7-Day Cashflow Projection",
    dash_fixed_commitments: "Fixed Commitments",
    dash_add_edit: "Add / Edit",
    dash_no_bills: "No upcoming bills added",
    dash_no_bills_sub: "Add your scheduled rent or subscriptions so the Guardian can protect them.",
    dash_add_bills_btn: "+ Add Fixed Bills",

    // Modals
    modal_afford_title: "Can I Afford This Purchase?",
    modal_afford_sub: "Instant liquidity & safety buffer impact simulator",
    modal_afford_amount_label: "Planned Purchase Amount (₹)",
    modal_afford_item_label: "Item or Expense Description",
    modal_afford_cat_label: "Expense Category",
    modal_afford_yes: "YES, YOU CAN SAFELY AFFORD THIS",
    modal_afford_no: "CAUTION: HIGH RISK OF SHORTFALL",
    modal_afford_safe_limit: "Your safe limit today:",
    modal_afford_simulate_btn: "Simulate & Check Cashflow Impact",
    modal_afford_close: "Close",
    modal_why_title: "How We Calculated This Number",
    modal_why_sub: "100% transparent, mathematical single source of truth",
    modal_why_formula: "The Mathematical Formula:",
    modal_why_close: "Got It, Keep Me Safe",

    // Chatbot / Guardian AI
    chat_view_title: 'Personalised AI Financial Guardian',
    chat_model_badge: 'Groq LPU • Qwen 27B Active',
    chat_view_sub: 'Real-time conversational financial intelligence personalized to your exact Indian bank statement and scheduled commitments.',
    chat_reality_title: 'Live Financial Reality',
    chat_reality_liquid: 'Liquid Balance:',
    chat_reality_safe: 'Safe-To-Spend:',
    chat_reality_buffer: 'Protected Buffer:',
    chat_suggested_title: 'Suggested Questions',
    chat_input_placeholder: 'Ask anything: "Can I spend ₹1,200 on dinner tonight?", "What if salary is late?", "How to avoid shortfall?"',
    chat_looming_commitments: 'LOOMING COMMITMENTS TO CLEAR:',
    chat_no_commitments: 'No fixed commitments scheduled',
    chat_reset_btn: 'Reset Chat',
    chat_sq_1: 'How do I avoid my upcoming shortfall?',
    chat_sq_2: 'Will my rent auto-debit bounce on the shortfall date?',
    chat_sq_3: 'Which daily expenses should I cut immediately?',
    chat_sq_4: 'Can I afford a ₹350 Swiggy dinner tonight?',
    chat_sq_5: 'Show exact mathematical formula for safe-to-spend',
    chat_sq_6: 'What happens if my stipend is delayed by 4 days?',
    chat_greeting_shortfall: 'Namaste {name}! Shortfall Alert Detected.\n\nYour projected minimum balance is forecasted to reach {minBalance} around {date}. Your current daily Safe-to-Spend limit is {safeSpend}/day.\n\nI am your Groq-powered Personal AI Financial Guardian. Ask me anything—from calculating whether you can afford an expense (e.g. "Can I afford a ₹350 Swiggy dinner tonight?") to building an emergency recovery plan!',
    chat_greeting_normal: 'Namaste {name}! I am your PaisaPulse AI Financial Guardian.\n\nI am actively watching your bank account ({balance} liquid balance) and commitments. Your current Safe-to-Spend limit is {safeSpend} today.\n\nAsk me about upcoming purchases, salary delays, or how to optimize your spending!',

    // Floating Chat
    floating_chat_title: 'AI Financial Guardian',
    floating_chat_placeholder: 'Ask: "Can I afford dinner tonight?"...',

    // Forecast View
    forecast_title: '14-Day Dynamic Cashflow Forecast',
    forecast_sub: 'Continuous daily projection factoring in fixed commitments, typical variable burn, and confirmed inflows.',
    forecast_chart_title: 'Projected Daily Balance Horizon',
    shortfall_banner_title: 'Shortfall Danger Warning',

    // Scenarios View
    scenarios_title: 'What-If Cashflow Simulator',
    scenarios_sub: 'Simulate financial stress-tests: salary delays, sudden expenses, or weekend splurges to test your runway.',

    // Insights View
    insights_title: 'Behavioral Insights & Audit',
    insights_sub: 'AI detection of stealth recurring subscriptions, weekend burn spikes, and duplicate transactions.',

    // Actions View
    actions_title: 'Action Center & AI Learning Hub',
    actions_sub: 'Execute recommended recovery maneuvers and train the system on your personal trade-offs.'
  },

  hinglish: {
    // Brand & Tagline
    app_name: 'PaisaPulse',
    app_subtitle: 'AI Cashflow Guardian',
    app_motto: '“Aapka paisa. Aapka future. Ek digital twin.”',

    // Language Toggle
    lang_toggle_label: 'Bhasha',
    lang_english: 'English',
    lang_hinglish: 'Hinglish',

    // Sidebar & Navigation
    nav_dashboard: 'Dashboard',
    nav_paisatwin: 'PaisaTwin 🧬 (Digital Twin)',
    nav_transactions: 'Transactions (Kharcha & Inflow)',
    nav_forecast: '14-Day Forecast',
    nav_scenarios: 'What-If Scenarios',
    nav_insights: 'Smart Insights',
    nav_actions: 'Actions & Sikho',
    nav_guardian: 'Guardian AI Chat',
    sidebar_guardian_title: 'Aapka AI Financial Guardian',
    sidebar_guardian_sub: 'Harr kharche pe nazar, aage ka hisaab. Click karke baat karein.',

    // Header
    header_greeting: 'Namaste, {name}! PaisaPulse mein swagat hai',
    header_role_badge: 'Aapka Personal Cashflow Guardian • {role}',
    btn_live_demo: 'Live Demo Dekhein (1–8)',
    btn_hide_demo: 'Demo Chhupayein',
    btn_login_switch: 'Log In / Account Badlein',
    btn_signup: 'Naya Account Banayein',
    btn_logout: 'Logout Karein',
    btn_explore_twin: 'Twin Dekhein',

    // Financial Reality Hero Bar
    safe_to_spend_title: 'Aaj Ka Safe Kharcha',
    safe_to_spend_desc: 'Bina kisi rent ya bill ke bounce hue aap aaj aasaani se itna kharcha kar sakte ho.',
    status_stable: 'Cashflow Mast Hai',
    status_tight: 'Haath Thoda Tight Hai',
    status_panic: 'Kharcha Khatra / Deficit Alert',
    status_watch: 'Watch Mode (Dhyan Rakho)',
    status_chill: 'Chill Mode (Bindaas)',
    available_cash: 'Pocket Mein Paisa',
    available_cash_sub: 'Current account mein available balance',
    confirmed_inflow: 'Aane Wala Paisa',
    confirmed_inflow_sub: 'Pakka salary / stipend credit',
    protected_money: 'Locked Paisa (Buffer + Bills)',
    protected_money_sub: 'Rent, bills aur emergency buffer',
    daily_burn: 'Roz Ka Kharcha (Burn Rate)',
    daily_burn_sub: 'Average daily variable spending',
    safe_daily_spend: 'Safe Daily Limit',
    safe_daily_spend_sub: 'Rozana itne ke andar hi kharcha karo',
    next_pressure: 'Agla Bada Bill',
    no_bills_due: 'Agle kuch dino mein koi bada bill nahi hai',
    due_in_days: '{days} dino mein due',

    // Actions & Buttons
    btn_can_i_afford: 'Kya Main Ye Khareed Sakta Hu?',
    btn_why_this_number: 'Ye Number Kaise Aaya?',
    btn_add_transaction: '+ Kharcha / Income Jodein',
    btn_import_csv: 'Bank Statement CSV Dalein',
    btn_manage_commitments: 'Bills & Rent Manage Karein',
    btn_reset_data: 'Sample Data Reset Karein',

    // PaisaTwin View
    twin_hero_title: 'PaisaTwin',
    twin_hero_sub: '“Aapka paisa. Aapka future. Ek digital twin.”',
    read_my_money_title: 'Mera Paisa Samjhao — AI Diagnosis & Solutions',
    read_my_money_sub: 'Aapke balance, rent, bills aur daily kharche ko analyze karke desi style mein seedha solution deta hai.',
    btn_generate_summary: '✨ Naya AI Summary Banayein',
    btn_analyzing_summary: 'Groq AI Se Analyze Ho Raha Hai...',
    solutions_header: 'Zaroori Solutions & Action Plan',
    solutions_header_sub: 'Aapke Indian bank commitments ke hisaab se ready solutions',
    copy_script_btn: 'Landlord Ke Liye WhatsApp Message Copy Karein',
    script_copied: 'WhatsApp Message Copy Ho Gaya!',
    simulate_scenario_btn: 'What-If Scenarios Mein Test Karein',
    ask_guardian_btn: 'Guardian AI Se Baat Karein',
    horizon_title: '🔮 Agar Aise Hi Kharcha Chalta Raha...',
    horizon_sub: 'Agle dino mein aapka balance kitna bachega agar bina soche samjhe kharcha hota raha:',
    days_7: '7 Din',
    days_14: '14 Din',
    days_30: '30 Din',
    lowest_point_title: 'Sabse Kam Balance Kab Hoga:',
    expected_on: 'Kab expected hai: {date}',
    confidence_title: '🎯 PaisaTwin Confidence Score',
    confidence_high: 'Pakki Information',
    money_timeline_title: '⏳ Aapke Paise Ki Timeline',
    money_timeline_sub: 'Aane wale dino mein kahan se paisa aayega aur kahan katega:',
    where_money_going_title: '🧐 Mera Paisa Kahan Jaa Raha Hai?',
    where_money_going_sub: 'Category ke hisaab se fixed bills aur roz ke kharche ka breakdown.',
    twin_uncertain_note: 'Uncertain / freelance income ko guaranteed Safe-to-Spend mein kabhi nahi joda jata.',
    twin_chart_title: '📈 30 Dino Ka Cashflow Outlook',
    twin_chart_sub: 'Rozana ka projected balance factoring in bills, aane wala paisa, aur daily burn rate.',
    twin_safety_floor: 'Safety Buffer Ka Minimum Level:',
    twin_today: 'Aaj',
    twin_in_days: '{days} dino mein ({date})',
    twin_potential: 'Kachha / Uncertain',

    // Dashboard View
    dash_brief_title: "AAJ KA FAISLA BRIEF",
    dash_single_truth: "Sachha Hisaab",
    dash_good_day: "Namaste, {name}! 👋",
    dash_can_i_afford_btn: "Kya Main Ye Khareed Sakta Hu?",
    dash_setup_guide: "Setup Guide",
    dash_avail_cash: "Pocket Mein Available Paisa",
    dash_safe_today: "Aaj Ka Safe Kharcha",
    dash_why_btn: "Kyun?",
    dash_next_event: "Agla Bada Kharcha/Bill",
    dash_cashflow_health: "Cashflow Ki Sehat",
    dash_deficit_alert: "{day} ke paas paise kam padne ka khatra",
    dash_protected_status: "Safe Hai — Koi shortfall nahi aayegi",
    dash_q1_title: "1. Aaj Kitna Kharcha Kar Sakta Hu?",
    dash_q1_why: "Ye number kaise aaya?",
    dash_q1_per_day: "/ aaj ke liye",
    dash_q1_desc: "Aap aaj lagbhag {amount} aasaani se kharcha kar sakte ho bina kisi rent, bill ya safety buffer ke khatre ke.",
    dash_q1_next_income: "Agli Income: {days} dino mein",
    dash_q1_test_btn: "Koi specific kharcha check karein →",
    dash_q2_title: "2. Kyun? (Locked Protections)",
    dash_q2_cash: "Pocket mein available cash:",
    dash_q2_income: "Salary/Stipend {days} dino mein:",
    dash_q2_bills: "Fixed bills jo safe rakhe hain:",
    dash_q2_buffer: "Emergency buffer jo koi chhu nahi sakta:",
    dash_q2_weekend: "Weekend kharche ka extra hisaab (+28%)",
    dash_q3_title: "3. Aage Kya Aane Wala Hai? (Next Movements)",
    dash_q3_edit: "+ Bills Badlein",
    dash_q3_none: "Abhi tak koi scheduled payment nahi hai.",
    dash_q4_title: "4. Kya Koi Khatra Hai?",
    dash_q4_buffer_breach: "Buffer Tutne Ka Khatra Detected",
    dash_q4_shortfall_text: "{date} ko balance girkar {min} ho sakta hai. Aap safety floor se {amount} neeche jaa sakte hain.",
    dash_q4_caution: "Status: Dhyan Rakhne Ki Zaroorat Hai",
    dash_q4_no_shortfall: "Sab Control Mein Hai (No Shortfall)",
    dash_q4_safe_text: "Sabse kam projected balance {date} ko {min} rahega.",
    dash_q4_buffer_label: "Safety Buffer: {buffer}",
    dash_q4_headroom: "Extra Headroom: +{amount}",
    dash_q5_title: "5. Aapka Agla Best Action (AI Cashflow Optimization)",
    dash_q5_sim_badge: "Simulation / Sirf Plan",
    dash_q5_no_action: "Abhi koi action lene ki zaroorat nahi hai. Aapka daily kharcha sahi chal raha hai.",
    dash_q5_in_plan: "✓ Plan Mein Add Hua",
    dash_q5_apply: "Plan Mein Lagayein",
    dash_q5_not_relevant: "Zaroorat Nahi",
    dash_what_changed: "Aapke Cashflow Mein Kya Badla?",
    dash_forecast_chart_title: "7 Dino Ka Cashflow Projection",
    dash_fixed_commitments: "Fixed Bills & Commitments",
    dash_add_edit: "Jodein / Badlein",
    dash_no_bills: "Koi aane wale bills nahi hain",
    dash_no_bills_sub: "Apna rent ya subscriptions dalein taaki Guardian unhe safe rakh sake.",
    dash_add_bills_btn: "+ Fixed Bills Jodein",

    // Modals
    modal_afford_title: "Kya Main Ye Kharcha Kar Sakta Hu?",
    modal_afford_sub: "UPI ya swipe karne se pehle instant reality check",
    modal_afford_amount_label: "Kitne Ka Kharcha Karna Chahte Ho? (₹)",
    modal_afford_item_label: "Kharcha Kis Cheez Ka Hai?",
    modal_afford_cat_label: "Kharche Ki Category",
    modal_afford_yes: "HAAN, AAP ISSE AASAANI SE AFFORD KAR SAKTE HO",
    modal_afford_no: "RUKO: ISSE SHORTFALL / DEFICIT KA KHATRA HAI",
    modal_afford_safe_limit: "Aaj ka safe spending limit:",
    modal_afford_simulate_btn: "Check Karein: Safe Hai Ya Asar Padega?",
    modal_afford_close: "Band Karein",
    modal_why_title: "Ye Number Kaise Aaya?",
    modal_why_sub: "100% transparent ganit jo dikhata hai ki spending cap kaise bani",
    modal_why_formula: "Mathematical Formula:",
    modal_why_close: "Samajh Gaya, Safe Rakho",

    // Chatbot / Guardian AI
    chat_view_title: 'Aapka Personal AI Financial Guardian',
    chat_model_badge: 'Groq LPU • Qwen 27B Active (Hinglish)',
    chat_view_sub: 'Aapke Indian bank statement aur fixed commitments ke hisaab se real-time Hinglish financial intelligence.',
    chat_reality_title: 'Live Financial Reality',
    chat_reality_liquid: 'Current Balance:',
    chat_reality_safe: 'Safe Roz Ka Kharcha:',
    chat_reality_buffer: 'Emergency Buffer:',
    chat_suggested_title: 'Aap Ye Poochh Sakte Hain',
    chat_input_placeholder: 'Kuch bhi poochhein: "Kya aaj ₹500 party pe spend karu?", "Stipend late hua toh?", "Shortfall kaise rokein?"',
    chat_looming_commitments: 'AANE WALE ZAROORI BILLS:',
    chat_no_commitments: 'Koi fixed bills pending nahi hain',
    chat_reset_btn: 'Chat Clear Karein',
    chat_sq_1: 'Upcoming shortfall se kaise bachein?',
    chat_sq_2: 'Kya shortfall date pe mera rent auto-debit bounce hoga?',
    chat_sq_3: 'Konsa daily kharcha turant band karein?',
    chat_sq_4: 'Kya main aaj raat ₹350 ka Swiggy afford kar sakta hu?',
    chat_sq_5: 'Safe-to-spend ka exact mathematical formula samjhao',
    chat_sq_6: 'Agar stipend 4 din late aaye to kya hoga?',
    chat_greeting_shortfall: 'Namaste {name} bhai! Warning: Shortfall Risk detect hua hai.\n\nAapka projected minimum balance lagbhag {date} ko {minBalance} tak girne ka khatra hai. Aaj ka aapka Safe-to-Spend limit sirf {safeSpend}/day hai.\n\nMain aapka Groq-powered Personal AI Financial Guardian hu. Poochhein kuch bhi—kya Swiggy pe kharcha karna safe hai, ya emergency recovery plan kaise banayein!',
    chat_greeting_normal: 'Namaste {name} bhai! Main aapka PaisaPulse AI Financial Guardian hu.\n\nMain aapke bank account ({balance} current balance) aur upcoming bills pe nazar rakh raha hu. Aaj ka aapka Safe-to-Spend limit {safeSpend} hai.\n\nKuch bhi poochhein—kya naya kharcha afford kar sakte hain, ya salary delay ho toh kya karein!',

    // Floating Chat
    floating_chat_title: 'AI Financial Guardian (Hinglish)',
    floating_chat_placeholder: 'Poochhein: "Kya main aaj dinner afford kar sakta hu?"...',

    // Forecast View
    forecast_title: '14-Day Dynamic Cashflow Forecast',
    forecast_sub: 'Aane wale 14 dino ka daily cashflow projection, factoring in fixed bills, typical burn rate, aur stipend/salary.',
    forecast_chart_title: 'Rozana Balance Ka Graph',
    shortfall_banner_title: 'Khatra Warning: Paisa Kam Pad Sakta Hai!',

    // Scenarios View
    scenarios_title: 'What-If Cashflow Simulator',
    scenarios_sub: 'Alag-alag scenarios simulate karein: agar salary late hui, ya achanak koi kharcha aa gaya toh kya hoga.',

    // Insights View
    insights_title: 'Smart Behavioral Insights',
    insights_sub: 'AI dwara hidden subscriptions, weekend pe kharche ka badhna, aur duplicate payments ka pata lagayein.',

    // Actions View
    actions_title: 'Action Center & AI Sikho Hub',
    actions_sub: 'Kharche control karne ke recommended action steps lein aur AI ko apni aadat sikhaayein.'
  }
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key, fallback, replacements) => fallback || key
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    }
    return 'en';
  });

  const setLanguage = (newLang) => {
    if (newLang !== 'en' && newLang !== 'hinglish') return;
    soundFX.playClick();
    setLanguageState(newLang);
    setActiveLanguageGlobal(newLang);
  };

  const toggleLanguage = () => {
    const next = language === 'en' ? 'hinglish' : 'en';
    setLanguage(next);
  };

  useEffect(() => {
    setActiveLanguageGlobal(language);
  }, [language]);

  /**
   * Translates a key according to active language with interpolation support
   */
  const t = (key, fallback = '', replacements = {}) => {
    const langDict = translations[language] || translations.en;
    let text = langDict[key] || translations.en[key] || fallback || key;

    if (replacements && typeof text === 'string') {
      Object.keys(replacements).forEach((placeholder) => {
        text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), replacements[placeholder]);
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
