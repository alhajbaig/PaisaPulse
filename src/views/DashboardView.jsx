"use client";

import React, { useState, useMemo } from 'react';
import { 
  ArrowRight,
  ArrowUpRight,
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Plus,
  Calendar,
  Sparkles,
  Sliders,
  CheckCircle2,
  Clock,
  ChevronRight,
  Trash2,
  Zap,
  Home,
  Film,
  CreditCard,
  GraduationCap,
  Receipt,
  X,
  Check,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  FileSpreadsheet,
  Cpu,
  MessageSquare,
  Dna,
  Wallet,
  CornerDownRight,
  RefreshCw,
  ShoppingBag,
  Car,
  Utensils,
  Wine
} from 'lucide-react';
import CashflowChart from '../components/CashflowChart';
import SpendValueCard from '../components/SpendValueCard';
import { formatINR } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { resolveTransactionCategory } from '../engine/types.js';
import { generateBestActions, recordActionFeedback } from '../services/ai/recommendationEngine.js';
import { explainWhatChanged } from '../services/ai/financialExplainer.js';
import { useLanguage } from '../services/i18n.jsx';

export default function DashboardView({ 
  currentPersona, 
  forecastResult, 
  safeToSpendResult,
  twinModel,
  horizonDays = 14,
  onHorizonChange,
  onNavigateToPaisaTwin,
  onViewForecast, 
  onViewCommitments,
  onNavigateToTransactions,
  onNavigateToScenarios,
  onOpenAddTransaction,
  onOpenGuardian,
  onOpenManageCommitments,
  onOpenCanIAfford,
  onOpenWhyThisNumber,
  onOpenOnboarding,
  onOpenSpendValueMap,
  onAddCommitment,
  onDeleteCommitment,
  onUpdateFinancialProfile
}) {
  const { t, language } = useLanguage();

  const {
    timeline = [],
    riskLevel = { label: 'Stable', color: '#10B981', bg: '#ECFDF5', text: 'All good' },
    shortfallDay,
    shortfallAmount = 0,
    minProjectedBalance = 0,
    minBalanceDate = 'Day 4',
    totalExpectedIncome = 0,
    totalExpectedExpenses = 0,
    headroom = 0
  } = forecastResult || {};

  const {
    safeToSpendToday = 0,
    effectiveCurrentBalance = 0,
    safetyBuffer = 3000,
    commitmentsBeforeIncome = 0,
    nextIncomeDays = 7,
    nextIncomeAmount = 0,
    reliableIncome = 0,
    potentialIncome = 0
  } = safeToSpendResult || {};

  const [appliedActionIds, setAppliedActionIds] = useState(new Set());
  const [dismissedActionIds, setDismissedActionIds] = useState(new Set());

  // Quick-Add Upcoming Bill/Expense State
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [billTitle, setBillTitle] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDaysAway, setBillDaysAway] = useState('3');
  const [billCategory, setBillCategory] = useState('Utilities');
  const [billEssential, setBillEssential] = useState(true);
  const [billSuccessMsg, setBillSuccessMsg] = useState(null);

  // Quick-Add Income State
  const [isAddingSalary, setIsAddingSalary] = useState(false);
  const [salaryTitle, setSalaryTitle] = useState('');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [salaryDaysAway, setSalaryDaysAway] = useState('7');
  const [salaryCategory, setSalaryCategory] = useState('Salary');
  const [salarySuccessMsg, setSalarySuccessMsg] = useState(null);

  // Feed Filter: 'all' | 'commitments' | 'income'
  const [feedFilter, setFeedFilter] = useState('all');

  const BILL_PRESETS = [
    { label: '⚡ Electricity', title: 'Electricity Bill', cat: 'Utilities', defaultAmount: '1200' },
    { label: '🏠 Rent / PG', title: 'House / PG Rent', cat: 'Rent/Hostel', defaultAmount: '8500' },
    { label: '📶 Wi-Fi Fiber', title: 'Wi-Fi Broadband', cat: 'Utilities', defaultAmount: '999' },
    { label: '💳 Credit Card', title: 'Credit Card Bill', cat: 'EMI/Loan', defaultAmount: '3500' },
    { label: '🍿 OTT / Subs', title: 'Netflix & Spotify', cat: 'Subscriptions', defaultAmount: '649' },
    { label: '🛵 Bike EMI', title: 'Vehicle EMI', cat: 'EMI/Loan', defaultAmount: '2400' },
  ];

  const SALARY_PRESETS = [
    { label: '💼 Monthly Salary', title: 'Monthly Salary', cat: 'Salary', defaultAmount: '35000' },
    { label: '🎓 Tech Stipend', title: 'Internship Stipend', cat: 'Stipend', defaultAmount: '15000' },
    { label: '🎨 Freelance Milestone', title: 'Client Payout', cat: 'Freelance', defaultAmount: '20000' },
    { label: '👨‍👩‍👦 Family Allowance', title: 'Home Transfer', cat: 'Family Transfer', defaultAmount: '5000' },
  ];

  const handleApplyPreset = (preset) => {
    soundFX.playClick();
    setBillTitle(preset.title);
    setBillCategory(preset.cat);
    if (!billAmount) {
      setBillAmount(preset.defaultAmount);
    }
  };

  const handleApplySalaryPreset = (preset) => {
    soundFX.playClick();
    setSalaryTitle(preset.title);
    setSalaryCategory(preset.cat);
    if (!salaryAmount) {
      setSalaryAmount(preset.defaultAmount);
    }
  };

  const handleCreateBill = (e) => {
    e.preventDefault();
    if (!billTitle.trim() || !billAmount || isNaN(billAmount) || parseFloat(billAmount) <= 0) {
      return;
    }

    soundFX.playSuccess();
    if (onAddCommitment) {
      onAddCommitment({
        title: billTitle.trim(),
        amount: parseFloat(billAmount),
        daysAway: parseInt(billDaysAway, 10) || 1,
        category: billCategory,
        essential: billEssential
      });
    }

    setBillSuccessMsg(`Added "${billTitle.trim()}" (${formatINR(parseFloat(billAmount))}) to scheduled commitments!`);
    setTimeout(() => setBillSuccessMsg(null), 3500);

    setBillTitle('');
    setBillAmount('');
    setIsAddingBill(false);
  };

  const handleSaveSalary = (e) => {
    e.preventDefault();
    if (!salaryTitle.trim() || !salaryAmount || isNaN(salaryAmount) || parseFloat(salaryAmount) <= 0) {
      return;
    }

    soundFX.playSuccess();
    const amountNum = parseFloat(salaryAmount);
    const daysNum = parseInt(salaryDaysAway, 10) || 1;
    const currentIncomes = Array.isArray(currentPersona.upcomingIncome) ? [...currentPersona.upcomingIncome] : [];

    const newIncome = {
      id: `inc_${Date.now()}`,
      title: salaryTitle.trim(),
      amount: amountNum,
      daysAway: daysNum,
      category: salaryCategory,
      certainty: 'confirmed',
      date: `In ${daysNum} days`
    };

    if (onUpdateFinancialProfile) {
      onUpdateFinancialProfile({
        upcomingIncome: [...currentIncomes, newIncome]
      });
    }

    setSalarySuccessMsg(`Added "${salaryTitle.trim()}" (+${formatINR(amountNum)}) to expected inflows!`);
    setTimeout(() => setSalarySuccessMsg(null), 3500);

    setSalaryTitle('');
    setSalaryAmount('');
    setIsAddingSalary(false);
  };

  const getCategoryIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('alcohol') || cat.includes('wine') || cat.includes('beer') || cat.includes('liquor') || cat.includes('nightlife') || cat.includes('bar')) return <Wine className="w-3.5 h-3.5 text-amber-800" />;
    if (cat.includes('chai') || cat.includes('tea') || cat.includes('coffee') || cat.includes('snack')) return <Utensils className="w-3.5 h-3.5 text-amber-600" />;
    if (cat.includes('delivery') || cat.includes('swiggy') || cat.includes('zomato')) return <Utensils className="w-3.5 h-3.5 text-orange-600" />;
    if (cat.includes('grocer') || cat.includes('zepto') || cat.includes('blinkit')) return <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />;
    if (cat.includes('rent') || cat.includes('hostel')) return <Home className="w-3.5 h-3.5 text-coral" />;
    if (cat.includes('util') || cat.includes('bill') || cat.includes('electric') || cat.includes('power') || cat.includes('water') || cat.includes('recharge')) return <Zap className="w-3.5 h-3.5 text-amber-600" />;
    if (cat.includes('sub') || cat.includes('stream') || cat.includes('ott') || cat.includes('music')) return <Film className="w-3.5 h-3.5 text-purple-600" />;
    if (cat.includes('gym') || cat.includes('fit') || cat.includes('health') || cat.includes('pharm')) return <Heart className="w-3.5 h-3.5 text-emerald-600" />;
    if (cat.includes('emi') || cat.includes('loan') || cat.includes('credit') || cat.includes('card')) return <CreditCard className="w-3.5 h-3.5 text-blue-600" />;
    if (cat.includes('edu') || cat.includes('fee') || cat.includes('course')) return <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />;
    if (cat.includes('food') || cat.includes('dining') || cat.includes('mess')) return <Utensils className="w-3.5 h-3.5 text-orange-500" />;
    if (cat.includes('transport') || cat.includes('commute') || cat.includes('ride') || cat.includes('fuel')) return <Car className="w-3.5 h-3.5 text-blue-600" />;
    if (cat.includes('shop')) return <ShoppingBag className="w-3.5 h-3.5 text-rose-500" />;
    return <Receipt className="w-3.5 h-3.5 text-stone-500" />;
  };

  const userName = currentPersona?.name || 'User';
  const firstName = currentPersona?.name ? currentPersona.name.split(' ')[0] : 'User';
  const isSevereCrisis = riskLevel.label === 'Shortfall Risk' || minProjectedBalance < 0;

  // Recommendations Engine
  const bestActions = generateBestActions({
    forecastResult,
    safeToSpendResult,
    currentPersona,
    empiricalDailyBurn: 420
  }).filter(a => !dismissedActionIds.has(a.id));

  const handleApplyAction = (action) => {
    soundFX.playSuccess();
    recordActionFeedback(action.id, 'APPLY', action);
    setAppliedActionIds(prev => new Set(prev).add(action.id));
    if (onViewCommitments) onViewCommitments();
  };

  const handleDismissAction = (action) => {
    soundFX.playClick();
    recordActionFeedback(action.id, 'REJECT', action);
    setDismissedActionIds(prev => new Set(prev).add(action.id));
  };

  // Next money movements list (combines upcoming income and upcoming commitments sorted by daysAway)
  const nextMovements = [
    ...(currentPersona.upcomingIncome || []).map(inc => ({
      id: inc.id,
      title: inc.title,
      amount: inc.amount,
      daysAway: inc.daysAway,
      type: 'income',
      certainty: inc.certainty || 'confirmed',
      date: inc.date || `In ${inc.daysAway} days`
    })),
    ...(currentPersona.upcomingCommitments || []).map(com => ({
      id: com.id,
      title: com.title,
      amount: com.amount,
      daysAway: com.daysAway,
      type: 'expense',
      category: com.category || 'Rent/Hostel',
      essential: com.essential,
      date: com.date || `In ${com.daysAway} days`
    }))
  ].sort((a, b) => a.daysAway - b.daysAway);

  const filteredMovements = nextMovements.filter(m => {
    if (feedFilter === 'commitments') return m.type === 'expense';
    if (feedFilter === 'income') return m.type === 'income';
    return true;
  });

  // Category breakdown for right column
  const transactions = currentPersona?.transactions || [];
  const categorySummary = useMemo(() => {
    const map = {};
    let total = 0;
    transactions.forEach(t => {
      if ((t.type || '').toLowerCase() === 'expense') {
        const cat = resolveTransactionCategory(t);
        const amt = Math.abs(t.amount || 0);
        map[cat] = (map[cat] || 0) + amt;
        total += amt;
      }
    });

    const entries = Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      percent: total > 0 ? Math.round((amount / total) * 100) : 0
    })).sort((a, b) => b.amount - a.amount).slice(0, 4);

    return { entries, total };
  }, [transactions]);

  // Recent transactions preview (last 5)
  const recentTransactions = transactions.slice(0, 5);

  // Time of day greeting
  const hour = new Date().getHours();
  const timeGreeting = language === 'hinglish'
    ? (hour < 12 ? 'Shubh Prabhat' : hour < 17 ? 'Namaste' : 'Shubh Sandhya')
    : (hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');

  // Digital Twin state summary
  const twinStateLabel = twinModel?.healthMode?.label || (isSevereCrisis 
    ? (language === 'hinglish' ? 'KHATRA ALERT' : 'PANIC MODE') 
    : (language === 'hinglish' ? 'BINDAAS MODE' : 'CHILL MODE'));
  const twinStateColor = isSevereCrisis ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 text-left">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. EXECUTIVE COMMAND BAR & TOOLBAR                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="bg-ivory border border-line-medium rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-accent uppercase tracking-widest text-ink-muted font-bold">
              {language === 'hinglish' ? 'Live Cashflow Command Center · 14-Din Ka Hisaab' : 'Live Cashflow Command Center · 14-Day Permission'}
            </span>
            <span className={`text-[10px] font-accent uppercase font-bold px-2 py-0.5 rounded-full border ${twinStateColor}`}>
              {twinStateLabel}
            </span>
          </div>

          <h1 className="font-editorial text-2xl sm:text-3xl text-ink font-normal leading-snug">
            {timeGreeting}, <span className="font-semibold">{firstName}</span>.
            <span className="font-editorial-italic text-coral ml-2 text-xl sm:text-2xl font-normal">
              {isSevereCrisis 
                ? (language === 'hinglish' ? 'Aage paise kam padne ka khatra hai — dhyan dein.' : 'Liquidity compression ahead — mitigation recommended.')
                : (language === 'hinglish' ? 'Aapke saare bills aur emergency buffer bilkul safe hain.' : 'All scheduled commitments and buffer fully ring-fenced.')}
            </span>
          </h1>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenCanIAfford();
            }}
            className="px-4 py-2 rounded-full bg-ink text-ivory text-xs font-sans font-semibold hover:bg-coral transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>{language === 'hinglish' ? 'Kya Main Ye Khareed Sakta Hu?' : 'Can I Afford This?'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setIsAddingBill(true);
              setIsAddingSalary(false);
            }}
            className="px-3.5 py-2 rounded-full bg-cream border border-line-medium text-xs font-sans font-medium text-ink hover:border-coral transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-coral" />
            <span>{language === 'hinglish' ? 'Bill Jodein' : 'Add Bill'}</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setIsAddingSalary(true);
              setIsAddingBill(false);
            }}
            className="px-3.5 py-2 rounded-full bg-cream border border-line-medium text-xs font-sans font-medium text-ink hover:border-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'hinglish' ? 'Salary Jodein' : 'Add Salary'}</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              if (onOpenAddTransaction) onOpenAddTransaction();
            }}
            className="px-3.5 py-2 rounded-full bg-ivory border border-line-medium text-xs font-sans font-medium text-ink-muted hover:text-ink hover:border-line-dark transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5 text-ink-muted" />
            <span>{language === 'hinglish' ? 'Kharcha Dalein' : 'Record Txn'}</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              if (onNavigateToScenarios) onNavigateToScenarios();
            }}
            className="px-3.5 py-2 rounded-full bg-ivory border border-line-medium text-xs font-sans font-medium text-ink-muted hover:text-ink hover:border-line-dark transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-ink-muted" />
            <span>{language === 'hinglish' ? 'What-If (अनुमान)' : 'What-If'}</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. TOP BENTO KPI ROW (5 High-Density Financial Metrics)         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Card 1: Liquid Bank Balance */}
        <div className="p-4 rounded-xl bg-ivory border border-line-medium hover:border-line-dark transition-all">
          <div className="flex items-center justify-between text-ink-muted mb-1.5">
            <span className="text-[10px] font-accent uppercase tracking-wider font-bold">
              {language === 'hinglish' ? 'Pocket Mein Cash' : 'Liquid Balance'}
            </span>
            <Wallet className="w-3.5 h-3.5 text-ink-subtle" />
          </div>
          <div className="font-sans font-black text-xl sm:text-2xl text-ink num-tabular">
            {formatINR(effectiveCurrentBalance)}
          </div>
          <div className="text-[11px] text-ink-muted mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{language === 'hinglish' ? 'Bank aur UPI mein active cash' : 'Active liquid cash in bank & UPI'}</span>
          </div>
        </div>

        {/* Card 2: Safe-To-Spend Today (Hero Permission Metric) */}
        <div className="p-4 rounded-xl bg-coral/10 border-2 border-coral/40 relative overflow-hidden group">
          <div className="flex items-center justify-between text-coral mb-1.5">
            <span className="text-[10px] font-accent uppercase tracking-wider font-extrabold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{language === 'hinglish' ? 'Safe Kharcha' : 'Safe To Spend'}</span>
            </span>
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenWhyThisNumber();
              }}
              className="text-[10px] font-accent text-coral font-bold underline cursor-pointer hover:text-coral-hover"
            >
              {language === 'hinglish' ? 'Kyun?' : 'Why?'}
            </button>
          </div>
          <div className="font-sans font-black text-xl sm:text-2xl text-coral num-tabular">
            {formatINR(safeToSpendToday)}
            <span className="text-xs font-normal text-ink-muted ml-1 font-sans">
              {language === 'hinglish' ? '/din' : '/day'}
            </span>
          </div>
          <div className="text-[11px] text-ink font-medium mt-1">
            {language === 'hinglish' ? 'Agli income tak bindaas kharcha karo' : 'Spend guilt-free before next credit'}
          </div>
        </div>

        {/* Card 3: Ring-Fenced Obligations */}
        <div className="p-4 rounded-xl bg-ivory border border-line-medium hover:border-line-dark transition-all">
          <div className="flex items-center justify-between text-coral mb-1.5">
            <span className="text-[10px] font-accent uppercase tracking-wider font-bold">
              {language === 'hinglish' ? 'Locked Paisa' : 'Ring-Fenced'}
            </span>
            <Receipt className="w-3.5 h-3.5 text-coral" />
          </div>
          <div className="font-sans font-black text-xl sm:text-2xl text-coral num-tabular">
            − {formatINR(commitmentsBeforeIncome)}
          </div>
          <div className="text-[11px] text-ink-muted mt-1 truncate">
            {language === 'hinglish' 
              ? `${(currentPersona.upcomingCommitments || []).length} aane wale bills ke liye reserved` 
              : `${(currentPersona.upcomingCommitments || []).length} scheduled obligations reserved`}
          </div>
        </div>

        {/* Card 4: Untouchable Emergency Buffer */}
        <div className="p-4 rounded-xl bg-ivory border border-line-medium hover:border-line-dark transition-all">
          <div className="flex items-center justify-between text-emerald-800 mb-1.5">
            <span className="text-[10px] font-accent uppercase tracking-wider font-bold">
              {language === 'hinglish' ? 'Emergency Buffer' : 'Emergency Buffer'}
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="font-sans font-black text-xl sm:text-2xl text-emerald-800 num-tabular">
            {formatINR(safetyBuffer)}
          </div>
          <div className="text-[11px] text-ink-muted mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>{language === 'hinglish' ? '100% Safe · Chhu nahi sakte' : '100% Intact · Zero overdraft floor'}</span>
          </div>
        </div>

        {/* Card 5: Next Scheduled Inflow */}
        <div className="col-span-2 md:col-span-1 p-4 rounded-xl bg-ivory border border-line-medium hover:border-line-dark transition-all">
          <div className="flex items-center justify-between text-ink-muted mb-1.5">
            <span className="text-[10px] font-accent uppercase tracking-wider font-bold">
              {language === 'hinglish' ? 'Aane Wala Paisa' : 'Next Inflow'}
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="font-sans font-black text-xl sm:text-2xl text-emerald-700 num-tabular">
            +{formatINR(nextIncomeAmount)}
          </div>
          <div className="text-[11px] text-ink-muted mt-1 truncate">
            {language === 'hinglish'
              ? `${nextIncomeDays} dino mein (${currentPersona.upcomingIncome?.[0]?.title || 'Salary/Stipend'})`
              : `Due in ${nextIncomeDays} days (${currentPersona.upcomingIncome?.[0]?.title || 'Salary/Stipend'})`}
          </div>
        </div>
      </div>

      {/* Critical Shortfall Callout if high risk */}
      {isSevereCrisis && (
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-rose-300 bg-rose-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-sans font-bold text-sm text-rose-950">
                {language === 'hinglish' ? 'Khatra: Paise Kam Padne Ka Risk Detect Hua' : 'Critical Cashflow Deficit Detected Ahead'}
              </div>
              <p className="font-sans text-xs text-rose-800 mt-0.5 leading-relaxed">
                {language === 'hinglish' 
                  ? <>{shortfallDay?.dayLabel || minBalanceDate} ko projected balance <strong className="font-black num-tabular">{formatINR(minProjectedBalance)}</strong> tak gir sakta hai. Fixed bills bounce na ho isliye faltu kharcha rokna zaroori hai.</>
                  : <>Projected minimum balance drops to <strong className="font-black num-tabular">{formatINR(minProjectedBalance)}</strong> on {shortfallDay?.dayLabel || minBalanceDate}. Scheduled commitments risk bouncing unless discretionary spend is paused.</>}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFX.playClick();
              if (onViewCommitments) onViewCommitments();
            }}
            className="px-5 py-2.5 rounded-full bg-rose-600 text-white text-xs font-sans font-bold hover:bg-rose-700 transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            {language === 'hinglish' ? 'Bachav Ke Kadam Dekhein' : 'Review Protective Actions'}
          </button>
        </div>
      )}

      {/* Inline Forms Drawer (Salary or Bill) */}
      {(isAddingBill || isAddingSalary) && (
        <div className="p-5 rounded-2xl bg-cream/70 border border-coral/30 shadow-sm animate-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line-medium pb-3 mb-4">
            <div className="flex items-center gap-2">
              {isAddingBill ? (
                <>
                  <Receipt className="w-4 h-4 text-coral" />
                  <span className="font-sans font-bold text-sm text-ink">Add Scheduled Obligation / Bill</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  <span className="font-sans font-bold text-sm text-ink">Add Expected Income / Payout</span>
                </>
              )}
            </div>
            <button
              onClick={() => {
                setIsAddingBill(false);
                setIsAddingSalary(false);
              }}
              className="p-1 text-ink-muted hover:text-ink cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bill Form */}
          {isAddingBill && (
            <form onSubmit={handleCreateBill} className="space-y-4">
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-accent uppercase text-ink-subtle font-bold mr-1">Presets:</span>
                {BILL_PRESETS.map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2.5 py-1 rounded-lg text-xs bg-ivory border border-line-medium text-ink hover:border-coral transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-accent uppercase font-bold text-ink-muted">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. BESCOM Electricity or Flat Rent"
                    value={billTitle}
                    onChange={(e) => setBillTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-ivory border border-line-medium text-xs text-ink focus:outline-none focus:border-coral"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-accent uppercase font-bold text-ink-muted">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="1500"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-ivory border border-line-medium text-xs font-bold text-coral num-tabular focus:outline-none focus:border-coral"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-accent uppercase font-bold text-ink-muted">Due In (Days)</label>
                  <select
                    value={billDaysAway}
                    onChange={(e) => setBillDaysAway(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-ivory border border-line-medium text-xs text-ink focus:outline-none focus:border-coral cursor-pointer"
                  >
                    <option value="1">Due Tomorrow (1 day)</option>
                    <option value="2">In 2 days</option>
                    <option value="3">In 3 days</option>
                    <option value="5">In 5 days</option>
                    <option value="7">In 1 week (7 days)</option>
                    <option value="14">In 2 weeks (14 days)</option>
                    <option value="30">In 30 days</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="dashBillEssential"
                    checked={billEssential}
                    onChange={(e) => setBillEssential(e.target.checked)}
                    className="rounded text-coral focus:ring-coral cursor-pointer"
                  />
                  <label htmlFor="dashBillEssential" className="text-xs text-ink cursor-pointer">
                    <span className="font-semibold">Essential Obligation</span>
                    <span className="text-ink-muted ml-1.5">(Safe-to-Spend ring-fences this cash automatically)</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingBill(false)}
                    className="px-3 py-1.5 rounded-full text-xs text-ink-muted hover:text-ink cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-full bg-coral text-white text-xs font-semibold hover:bg-coral-hover cursor-pointer"
                  >
                    Save Commitment
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Salary Form */}
          {isAddingSalary && (
            <form onSubmit={handleSaveSalary} className="space-y-4">
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-accent uppercase text-ink-subtle font-bold mr-1">Presets:</span>
                {SALARY_PRESETS.map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleApplySalaryPreset(p)}
                    className="px-2.5 py-1 rounded-lg text-xs bg-ivory border border-line-medium text-ink hover:border-emerald-700 transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-accent uppercase font-bold text-ink-muted">Title / Source</label>
                  <input
                    type="text"
                    placeholder="e.g. Monthly Corporate Salary"
                    value={salaryTitle}
                    onChange={(e) => setSalaryTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-ivory border border-line-medium text-xs text-ink focus:outline-none focus:border-emerald-700"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-accent uppercase font-bold text-ink-muted">Expected Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="35000"
                    value={salaryAmount}
                    onChange={(e) => setSalaryAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-ivory border border-line-medium text-xs font-bold text-emerald-800 num-tabular focus:outline-none focus:border-emerald-700"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-accent uppercase font-bold text-ink-muted">Expected In (Days)</label>
                  <select
                    value={salaryDaysAway}
                    onChange={(e) => setSalaryDaysAway(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-ivory border border-line-medium text-xs text-ink focus:outline-none focus:border-emerald-700 cursor-pointer"
                  >
                    <option value="2">In 2 days</option>
                    <option value="3">In 3 days</option>
                    <option value="5">In 5 days</option>
                    <option value="7">In 1 week (7 days)</option>
                    <option value="10">In 10 days</option>
                    <option value="14">In 2 weeks (14 days)</option>
                    <option value="30">In 30 days</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSalary(false)}
                  className="px-3 py-1.5 rounded-full text-xs text-ink-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 cursor-pointer"
                >
                  Save Expected Inflow
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Success Toasts */}
      {(billSuccessMsg || salarySuccessMsg) && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{billSuccessMsg || salarySuccessMsg}</span>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. CORE TWO-COLUMN COMMAND CENTER (8 cols / 4 cols)            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN (8 COLS) ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card A: 30-Day Forward Cashflow Horizon */}
          <div className="p-5 sm:p-6 rounded-2xl bg-ivory border border-line-medium shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-accent uppercase tracking-widest text-ink-subtle font-bold block">
                  Continuous Simulation Matrix
                </span>
                <h2 className="font-editorial text-2xl text-ink font-normal mt-0.5">
                  Forward Cashflow Projection
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {/* Horizon Switcher */}
                <div className="inline-flex p-1 rounded-full bg-cream border border-line-medium gap-0.5">
                  {[7, 14, 30].map(days => (
                    <button
                      key={days}
                      onClick={() => {
                        soundFX.playClick();
                        if (onHorizonChange) onHorizonChange(days);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-sans transition-all cursor-pointer ${
                        horizonDays === days 
                          ? 'bg-ink text-ivory font-semibold shadow-xs' 
                          : 'text-ink-muted hover:text-ink'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>

                <button
                  onClick={onViewForecast}
                  className="px-3 py-1.5 rounded-full border border-line-medium text-xs font-sans text-coral hover:border-coral transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Full View</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Cashflow Chart Embedded */}
            <div className="py-1">
              <CashflowChart 
                timeline={timeline}
                safetyBuffer={safetyBuffer}
                showConfidenceRange={true}
                height={220}
              />
            </div>

            {/* Bottom Horizon Insights Bar */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-line-light text-left">
              <div>
                <span className="text-[10px] font-accent uppercase text-ink-subtle block font-semibold">Minimum Dip</span>
                <span className={`font-sans font-bold text-sm num-tabular block ${minProjectedBalance < 0 ? 'text-rose-600' : 'text-ink'}`}>
                  {formatINR(minProjectedBalance)}
                </span>
                <span className="text-[10px] text-ink-muted block">{minBalanceDate}</span>
              </div>

              <div>
                <span className="text-[10px] font-accent uppercase text-ink-subtle block font-semibold">Total Inflows</span>
                <span className="font-sans font-bold text-sm text-emerald-800 num-tabular block">
                  +{formatINR(totalExpectedIncome)}
                </span>
                <span className="text-[10px] text-ink-muted block">{horizonDays}-day window</span>
              </div>

              <div>
                <span className="text-[10px] font-accent uppercase text-ink-subtle block font-semibold">Total Outflows</span>
                <span className="font-sans font-bold text-sm text-coral num-tabular block">
                  −{formatINR(totalExpectedExpenses)}
                </span>
                <span className="text-[10px] text-ink-muted block">Bills + variable burn</span>
              </div>
            </div>
          </div>

          {/* Card B: Upcoming Scheduled Commitments & Inflows Feed */}
          <div className="p-5 sm:p-6 rounded-2xl bg-ivory border border-line-medium shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line-medium pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-accent uppercase tracking-widest text-ink-subtle font-bold">
                    Forward Ledger Schedule
                  </span>
                  <span className="text-[10px] font-accent uppercase bg-coral/10 text-coral font-bold px-2 py-0.5 rounded-full">
                    {(currentPersona.upcomingCommitments || []).length} obligations · {formatINR(commitmentsBeforeIncome)}
                  </span>
                </div>
                <h3 className="font-editorial text-2xl text-ink font-normal mt-0.5">
                  Scheduled Commitments & Inflows
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Filter Pills */}
                <div className="inline-flex p-0.5 rounded-lg bg-cream border border-line-medium text-[11px] font-sans">
                  <button
                    onClick={() => setFeedFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${feedFilter === 'all' ? 'bg-ivory text-ink font-bold shadow-xs' : 'text-ink-muted hover:text-ink'}`}
                  >
                    All ({nextMovements.length})
                  </button>
                  <button
                    onClick={() => setFeedFilter('commitments')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${feedFilter === 'commitments' ? 'bg-ivory text-coral font-bold shadow-xs' : 'text-ink-muted hover:text-ink'}`}
                  >
                    Bills ({(currentPersona.upcomingCommitments || []).length})
                  </button>
                  <button
                    onClick={() => setFeedFilter('income')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${feedFilter === 'income' ? 'bg-ivory text-emerald-800 font-bold shadow-xs' : 'text-ink-muted hover:text-ink'}`}
                  >
                    Inflows ({(currentPersona.upcomingIncome || []).length})
                  </button>
                </div>

                <button
                  onClick={onOpenManageCommitments}
                  className="text-xs font-sans text-coral hover:text-coral-hover underline pl-2 cursor-pointer"
                >
                  Manage All
                </button>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2">
              {filteredMovements.length === 0 ? (
                <div className="py-8 text-center text-ink-muted space-y-2">
                  <Receipt className="w-8 h-8 mx-auto text-ink-subtle opacity-60" />
                  <p className="text-xs font-sans">No items match the selected filter.</p>
                </div>
              ) : (
                filteredMovements.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-ivory hover:bg-cream/40 border border-line-light hover:border-line-medium transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                        item.type === 'income' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-cream border-line-medium'
                      }`}>
                        {item.type === 'income' ? <TrendingUp className="w-4 h-4" /> : getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-ink">{item.title}</span>
                          {item.essential && (
                            <span className="text-[9px] font-accent uppercase text-coral font-bold bg-coral/10 px-1.5 py-0.5 rounded">
                              Essential
                            </span>
                          )}
                          {item.type === 'income' && (
                            <span className="text-[9px] font-accent uppercase text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                              Confirmed Inflow
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-ink-muted block mt-0.5">
                          {item.date || `Due in ${item.daysAway} days`} · {item.category || (item.type === 'income' ? 'Income' : 'Utilities')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-sm sm:text-base num-tabular ${item.type === 'income' ? 'text-emerald-700' : 'text-coral'}`}>
                        {item.type === 'income' ? '+' : '−'} {formatINR(item.amount)}
                      </span>
                      {item.type === 'expense' && onDeleteCommitment && (
                        <button
                          type="button"
                          onClick={() => onDeleteCommitment(item.id)}
                          className="p-1.5 text-ink-muted/40 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 cursor-pointer"
                          title="Delete obligation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card C: Recent Transactions & Live Stream Activity Feed */}
          <div className="p-5 sm:p-6 rounded-2xl bg-ivory border border-line-medium shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-line-medium pb-3">
              <div>
                <span className="text-[10px] font-accent uppercase tracking-widest text-ink-subtle font-bold block">
                  Live Ledger Stream
                </span>
                <h3 className="font-editorial text-2xl text-ink font-normal mt-0.5">
                  Recent Transaction Activity
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundFX.playClick();
                    if (onOpenAddTransaction) onOpenAddTransaction();
                  }}
                  className="px-3 py-1.5 rounded-full bg-cream border border-line-medium text-xs font-sans text-ink hover:border-coral transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-coral" />
                  <span>Add Transaction</span>
                </button>

                <button
                  onClick={() => {
                    soundFX.playClick();
                    if (onNavigateToTransactions) onNavigateToTransactions();
                  }}
                  className="text-xs font-sans text-coral hover:text-coral-hover underline pl-2 cursor-pointer"
                >
                  View All ({transactions.length}) →
                </button>
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-2">
              {recentTransactions.length === 0 ? (
                <div className="p-6 rounded-xl bg-cream/40 border border-line-medium text-center space-y-2">
                  <FileSpreadsheet className="w-7 h-7 mx-auto text-ink-muted opacity-60" />
                  <p className="font-sans font-semibold text-xs text-ink">No transactions recorded in ledger yet</p>
                  <p className="text-[11px] font-sans text-ink-muted max-w-sm mx-auto">
                    Record your daily expenses or import a bank statement CSV to calibrate empirical daily burn.
                  </p>
                </div>
              ) : (
                recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-ivory hover:bg-cream/40 border border-line-light hover:border-line-medium transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-cream border border-line-medium flex items-center justify-center shrink-0">
                        {getCategoryIcon(resolveTransactionCategory(tx))}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-ink">{tx.description || tx.merchant || 'Transaction'}</span>
                          {tx.isDuplicateSuspect && (
                            <span className="text-[9px] font-accent uppercase bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                              Duplicate?
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-ink-muted block mt-0.5">
                          {tx.date} · {resolveTransactionCategory(tx)} · {tx.paymentMethod || 'UPI'}
                        </span>
                      </div>
                    </div>

                    <span className={`font-bold text-xs sm:text-sm num-tabular ${tx.type === 'income' ? 'text-emerald-700' : 'text-ink'}`}>
                      {tx.type === 'income' ? '+' : '−'} {formatINR(tx.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (4 COLS) ================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card D: PaisaTwin Financial Digital Twin Radar */}
          <div className="p-5 rounded-2xl bg-ivory border border-line-medium shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-line-medium pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-accent uppercase text-coral font-bold tracking-wider">
                <Dna className="w-4 h-4 text-coral" />
                <span>PaisaTwin Digital Twin</span>
              </div>
              <span className="text-[10px] font-accent uppercase text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                94% Confident
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-cream/50 border border-line-medium space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Posture State</span>
                <span className={`text-[10px] font-accent uppercase font-black px-2 py-0.5 rounded-full border ${twinStateColor}`}>
                  {twinStateLabel}
                </span>
              </div>
              <p className="text-xs font-sans text-ink-muted leading-relaxed">
                {twinModel?.healthMode?.summary || 'Cashflow comfortably covers upcoming commitments with emergency buffer 100% intact.'}
              </p>
            </div>

            <div className="space-y-2 text-xs font-sans pt-1">
              <div className="flex items-center justify-between text-ink py-1 border-b border-line-light">
                <span className="text-ink-muted">Daily Burn Velocity:</span>
                <span className="font-bold num-tabular">{formatINR(twinModel?.averageDailyBurn || 420)}/day</span>
              </div>
              <div className="flex items-center justify-between text-ink py-1 border-b border-line-light">
                <span className="text-ink-muted">Recommended Daily Cap:</span>
                <span className="font-bold num-tabular text-coral">{formatINR(safeToSpendToday)}/day</span>
              </div>
              <div className="flex items-center justify-between text-ink py-1">
                <span className="text-ink-muted">30-Day Outlook Dip:</span>
                <span className="font-bold num-tabular">{formatINR(minProjectedBalance)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                soundFX.playClick();
                if (onNavigateToPaisaTwin) onNavigateToPaisaTwin();
              }}
              className="w-full py-2.5 rounded-xl bg-cream hover:bg-cream/90 border border-line-medium text-xs font-sans font-semibold text-ink flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Inspect Full Digital Twin</span>
              <ArrowRight className="w-3.5 h-3.5 text-coral" />
            </button>
          </div>

          {/* Spend Value Intelligence: "What is Actually Worth Your Money?" */}
          <SpendValueCard 
            spendValueModel={twinModel?.spendValueModel}
            onOpenFullMap={onOpenSpendValueMap}
          />

          {/* Card E: Guardian AI Financial Assistant */}
          <div className="p-5 rounded-2xl bg-cream/40 border border-line-medium shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-line-medium pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-accent uppercase text-coral font-bold tracking-wider">
                <Cpu className="w-4 h-4 text-coral" />
                <span>Guardian AI</span>
              </div>
              <span className="text-[10px] font-accent uppercase text-ink-muted font-bold">
                Groq Qwen Active
              </span>
            </div>

            <blockquote className="font-editorial text-lg text-ink leading-relaxed">
              &ldquo;{isSevereCrisis 
                ? (language === 'hinglish'
                    ? 'Day 4 ke paas balance girne ka khatra hai. Agle 4 din ke liye dining out ya optional kharche pause karna behtar rahega.'
                    : 'Your projected balance dips near zero around Day 4. Consider pausing optional subscriptions or capping dining out for 4 days.')
                : (language === 'hinglish'
                    ? 'Aapke saare aane wale bills safe hain. Safe-to-spend limit ke hisaab se discretionary kharcha karein bina rent reserve ko chhue.'
                    : 'You are covered for all upcoming commitments. Your safe-to-spend limit allows discretionary purchases without touching your rent reserve.')}&rdquo;
            </blockquote>

            {/* Quick Prompt Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-accent uppercase tracking-wider text-ink-subtle block font-bold">
                {language === 'hinglish' ? 'Guardian Se Poochhein:' : 'Ask Guardian:'}
              </span>
              <div className="flex flex-col gap-1.5">
                {[
                  language === 'hinglish' ? 'Kya main aaj raat ₹450 ka Swiggy afford kar sakta hu?' : 'Can I afford a ₹450 Swiggy dinner tonight?',
                  language === 'hinglish' ? 'Agar salary 5 din late aayi toh kya hoga?' : 'What if salary is delayed by 5 days?',
                  language === 'hinglish' ? 'Roommates se pending splits kaise lu?' : 'How do I collect pending roommate splits?'
                ].map(q => (
                  <button
                    key={q}
                    onClick={() => {
                      soundFX.playClick();
                      if (onOpenGuardian) onOpenGuardian();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-ivory border border-line-light hover:border-coral text-[11px] font-sans text-ink transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate pr-2">{q}</span>
                    <ChevronRight className="w-3 h-3 text-coral shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                soundFX.playClick();
                if (onOpenGuardian) onOpenGuardian();
              }}
              className="w-full py-2.5 rounded-xl bg-ink text-ivory text-xs font-sans font-semibold hover:bg-coral transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{language === 'hinglish' ? 'Guardian AI Se Baat Karein' : 'Launch Guardian Chat'}</span>
            </button>
          </div>

          {/* Card F: Spending DNA & Category Velocity */}
          <div className="p-5 rounded-2xl bg-ivory border border-line-medium shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-line-medium pb-2.5">
              <span className="text-[10px] font-accent uppercase tracking-widest text-ink-subtle font-bold">
                Category Distribution
              </span>
              <span className="text-[10px] font-accent font-bold text-ink-muted">
                {categorySummary.total > 0 ? formatINR(categorySummary.total) : '₹0'} Total
              </span>
            </div>

            <div className="space-y-3">
              {categorySummary.entries.length === 0 ? (
                <p className="text-xs font-sans text-ink-muted py-2">
                  No expense breakdown yet. Record transactions to see your financial DNA.
                </p>
              ) : (
                categorySummary.entries.map((cat, idx) => {
                  const colors = ['#FF6244', '#059669', '#2563EB', '#D97706'];
                  const barColor = colors[idx % colors.length];
                  return (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-sans">
                        <span className="font-semibold text-ink">{cat.name}</span>
                        <span className="font-bold text-ink num-tabular">{formatINR(cat.amount)} ({cat.percent}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-cream overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, cat.percent)}%`, backgroundColor: barColor }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Card G: Recommended Adjustments / Action Engine */}
          {bestActions.length > 0 && (
            <div className="p-5 rounded-2xl bg-ivory border border-line-medium shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-line-medium pb-2.5">
                <span className="text-[10px] font-accent uppercase tracking-widest text-coral font-bold">
                  Recommended Adjustments
                </span>
                <span className="text-[10px] font-sans text-ink-muted">
                  {bestActions.length} available
                </span>
              </div>

              <div className="space-y-3">
                {bestActions.slice(0, 2).map(action => (
                  <div key={action.id} className="p-3.5 rounded-xl bg-cream/40 border border-line-light space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-accent uppercase text-coral font-bold tracking-wider">
                        {action.type?.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 num-tabular">
                        +{formatINR(action.amount)}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-ink">{action.title}</div>
                    <p className="text-[11px] text-ink-muted leading-relaxed">{action.impact || action.problem}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleApplyAction(action)}
                        className="px-3 py-1 rounded-full bg-ink text-ivory text-[11px] font-semibold hover:bg-coral transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => handleDismissAction(action)}
                        className="text-[11px] text-ink-muted hover:text-ink cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
