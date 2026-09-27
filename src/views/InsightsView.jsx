import React, { useState, useMemo } from 'react';
import { 
  Dna, 
  TrendingUp, 
  Utensils, 
  ShoppingBag, 
  Car, 
  Tv, 
  GraduationCap, 
  MoreHorizontal, 
  Calendar, 
  Sparkles, 
  ArrowUpRight,
  Banknote,
  Briefcase,
  Users,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Heart,
  ArrowRight,
  Scissors,
  Shield
} from 'lucide-react';
import Sparkline from '../components/Sparkline';
import { formatINR } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { CATEGORIES, resolveTransactionCategory } from '../engine/types.js';
import { useLanguage } from '../services/i18n.jsx';
import { computeSpendValueMap, getSpendValueFeedback } from '../engine/spendValueEngine.js';
import { isBalanceSnapshotNarration } from '../engine/csvParser.js';

export default function InsightsView({ currentPersona, twinModel, onOpenSpendValueMap }) {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeframe, setTimeframe] = useState('All Time');
  const [hoveredCat, setHoveredCat] = useState(null);

  const transactions = currentPersona?.transactions || [];
  const userName = currentPersona?.name || 'User';
  const firstName = userName.split(' ')[0] || 'User';

  // Spend Value Intelligence Engine Model (Resilient to null/undefined)
  const spendValueModel = useMemo(() => {
    if (twinModel?.spendValueModel) return twinModel.spendValueModel;
    const uid = currentPersona?.id || currentPersona?.email || 'default_user';
    const feedback = getSpendValueFeedback(uid);
    return computeSpendValueMap(transactions, feedback);
  }, [twinModel, transactions, currentPersona]);

  const topCostItem = spendValueModel?.rankedByCost?.[0] || { name: 'Food Delivery', clusterName: 'Food Delivery', monthlyCost: 2200, personalValueScore: 50 };
  const highValItems = (spendValueModel?.rankedByValue || []).filter(c => (c.personalValueScore || 0) >= 60).slice(0, 3);
  const highValText = highValItems.map(c => (c.name || c.clusterName || '').toLowerCase()).filter(Boolean).join(', ') || 'daily chai, fitness, and learning';

  const topCostName = topCostItem?.name || topCostItem?.clusterName || 'Discretionary Spending';
  const isSingleCluster = (spendValueModel?.rankedByCost?.length || 0) <= 1 || (topCostItem?.id && highValItems.length === 1 && highValItems[0].id === topCostItem.id);
  const insightSentence = spendValueModel?.insights?.perspectiveInsight || 
    (isSingleCluster 
      ? `${topCostName} is your primary spending habit at ${formatINR(topCostItem?.monthlyCost || 2200)}/month (${topCostItem?.personalValueScore || 60}/100 value score). PaisaPulse respects your lifestyle and helps you protect what you value most.` 
      : `${topCostName} is your largest spending area at ${formatINR(topCostItem?.monthlyCost || 2200)}/month — but your strongest personal value comes from your ${highValText}.`);

  // Helper: Filter real expenses, explicitly excluding balance snapshots & starting cash
  const isRealExpense = (t) => {
    if (!t) return false;
    const type = (t.type || '').toLowerCase();
    if (type !== 'expense') return false;
    if (t.isBalanceSnapshot) return false;
    if (isBalanceSnapshotNarration(t.description || '') || isBalanceSnapshotNarration(t.merchant || '')) return false;
    return true;
  };

  // 1. DYNAMIC CATEGORY AGGREGATION FROM REAL TRANSACTIONS USING RESOLVED CATEGORIES
  const categoryStats = useMemo(() => {
    const expenseTx = transactions.filter(isRealExpense);
    const totalExpenses = expenseTx.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    const map = {};
    expenseTx.forEach(t => {
      // Intelligently resolve category so transactions are not dumped into "Other"
      const cat = resolveTransactionCategory(t);
      if (!map[cat]) map[cat] = { amount: 0, count: 0 };
      map[cat].amount += Math.abs(t.amount || 0);
      map[cat].count++;
    });

    const list = Object.entries(map).map(([name, data]) => {
      const percent = totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 100) : 0;
      const catDef = CATEGORIES[name] || CATEGORIES['Food & Dining'] || CATEGORIES.Other;
      return {
        name,
        amount: data.amount,
        count: data.count,
        percent,
        color: catDef.color || '#64748B',
        icon: catDef.icon || MoreHorizontal
      };
    }).sort((a, b) => b.amount - a.amount);

    if (list.length === 0) {
      return [
        { name: 'Daily Tea & Snacks', amount: 420, percent: 10, color: '#D97706', icon: Utensils },
        { name: 'Food Delivery', amount: 2200, percent: 38, color: '#EA580C', icon: Utensils },
        { name: 'Commute & Rides', amount: 1100, percent: 20, color: '#2563EB', icon: Car },
        { name: 'Fitness & Wellness', amount: 1200, percent: 21, color: '#059669', icon: Heart },
        { name: 'Digital Subscriptions', amount: 649, percent: 11, color: '#9333EA', icon: Sparkles }
      ];
    }

    return list;
  }, [transactions]);

  // 2. DYNAMIC REAL-TIME WEEKEND SPEND VELOCITY
  const weekendMetrics = useMemo(() => {
    const expenseTx = transactions.filter(t => isRealExpense(t) && !t.recurring);
    if (expenseTx.length === 0) return { diffPercent: 28, isHigher: true, weekendAvg: 650, weekdayAvg: 480 };

    let weekendSum = 0;
    let weekendCount = 0;
    let weekdaySum = 0;
    let weekdayCount = 0;

    expenseTx.forEach(t => {
      const d = new Date(t.date || Date.now());
      const day = d.getDay();
      const amt = Math.abs(t.amount || 0);
      if (day === 0 || day === 6) {
        weekendSum += amt;
        weekendCount++;
      } else {
        weekdaySum += amt;
        weekdayCount++;
      }
    });

    const weekendAvg = weekendCount > 0 ? Math.round(weekendSum / weekendCount) : 600;
    const weekdayAvg = weekdayCount > 0 ? Math.round(weekdaySum / weekdayCount) : 450;
    const diff = weekdayAvg > 0 ? Math.round(((weekendAvg - weekdayAvg) / weekdayAvg) * 100) : 28;

    return {
      diffPercent: Math.abs(diff) || 28,
      isHigher: weekendAvg >= weekdayAvg,
      weekendAvg,
      weekdayAvg
    };
  }, [transactions]);

  // 3. DYNAMIC AVERAGE DAILY SPEND & VOLATILITY
  const dailySpendMetrics = useMemo(() => {
    const expenseTx = transactions.filter(isRealExpense);
    if (expenseTx.length === 0) return { avgDaily: 480, sparkline: [400, 450, 480, 520] };

    const total = expenseTx.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    const uniqueDates = new Set(expenseTx.map(t => t.date)).size;
    const avgDaily = Math.round(total / Math.max(1, uniqueDates));

    const sparkline = expenseTx.slice(0, 6).map(t => Math.abs(t.amount)).reverse();
    if (sparkline.length < 3) sparkline.push(avgDaily, avgDaily * 1.1);

    return { avgDaily, sparkline };
  }, [transactions]);

  // 4. TOP MERCHANTS IN REAL TIME
  const topMerchants = useMemo(() => {
    const map = {};
    transactions.filter(isRealExpense).forEach(t => {
      const merch = t.merchant || t.description || 'Unknown Store';
      const resolvedCat = resolveTransactionCategory(t);
      if (!map[merch]) map[merch] = { amount: 0, count: 0, category: resolvedCat };
      map[merch].amount += Math.abs(t.amount || 0);
      map[merch].count++;
    });

    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  // 5. SVG DONUT CALCULATION
  let cumulativePercent = 0;
  const radius = 78;
  const cx = 105;
  const cy = 105;

  const donutSlices = categoryStats.slice(0, 6).map((cat) => {
    const p = Math.max(0.5, cat.percent);
    const startAngle = (cumulativePercent / 100) * 360;
    cumulativePercent += p;
    const rawEnd = (cumulativePercent / 100) * 360;
    const endAngle = Math.min(rawEnd, startAngle + 359.9);

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArcFlag = p > 50 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`
    ].join(' ');

    return {
      ...cat,
      pathData
    };
  });

  return (
    <div className="space-y-6">
      {/* Editorial Header (Prompt Section 29) */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-line-medium pb-6 pt-2">
        <div className="space-y-1">
          <span className="text-xs font-accent uppercase tracking-widest text-coral font-bold block">
            {language === 'hinglish' ? 'Smart Insights (अंदर का सच)' : 'Insights'}
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-ink font-normal">
            {language === 'hinglish' ? 'Aapke kharche ka asal sach' : 'What PaisaPulse sees in your spending'}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-ink-muted">
            {language === 'hinglish' 
              ? 'Aapki UPI transactions, roz ki aadat aur cashflow ka AI dwara deep hisaab.' 
              : 'Dynamically analyzed from your active transaction history, UPI frequency, and cashflow patterns.'}
          </p>
        </div>

        <div className="inline-flex p-1 rounded-full bg-cream border border-line-medium gap-1">
          {['All Time', 'This Month', 'Recent Feed'].map(t => (
            <button
              key={t}
              onClick={() => {
                soundFX.playClick();
                setTimeframe(t);
              }}
              className={`px-3 py-1 rounded-full text-xs font-sans transition-all ${
                timeframe === t 
                  ? 'bg-ink text-ivory font-semibold shadow-xs' 
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {language === 'hinglish' 
                ? (t === 'All Time' ? 'Pura Hisaab' : t === 'This Month' ? 'Is Mahine' : 'Haal Ka Feed') 
                : t}
            </button>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SPEND VALUE INTELLIGENCE: "WHERE YOUR MONEY MATTERS"           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-7 rounded-2xl bg-ivory border border-line-medium shadow-xs space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line-medium pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-accent uppercase tracking-widest text-coral font-bold bg-coral/10 px-2 py-0.5 rounded-full">
                {language === 'hinglish' ? 'Spend Value Intelligence' : 'Spend Value Intelligence'}
              </span>
              <span className="text-xs font-sans text-ink-muted">
                {language === 'hinglish' ? 'Kharcha ≠ Khushi' : 'Money Cost ≠ Personal Value'}
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-ink font-normal tracking-tight mt-1">
              {language === 'hinglish' ? 'Aapka Paisa Kahan Zaroori Hai' : 'Where Your Money Matters'}
            </h2>
          </div>

          {onOpenSpendValueMap && (
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenSpendValueMap();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink text-ivory text-xs font-sans font-semibold hover:bg-coral transition-colors cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
            >
              <span>{language === 'hinglish' ? 'Value Map Dekhein (4 Quadrants)' : 'Explore Value Map (4 Quadrants)'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Section 4: The Core Differentiating Insight Callout */}
        <div className="p-4 sm:p-5 rounded-xl bg-cream/70 border border-line-medium space-y-2">
          <div className="flex items-center gap-2 text-coral font-bold text-xs font-accent uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-coral shrink-0" />
            <span>{language === 'hinglish' ? 'Asal Kharcha Insight' : 'Core Behavioral Insight'}</span>
          </div>
          <p className="font-editorial text-lg sm:text-xl text-ink leading-snug">
            &ldquo;{insightSentence}&rdquo;
          </p>
          <p className="text-xs font-sans text-ink-muted leading-relaxed">
            {language === 'hinglish' 
              ? 'PaisaPulse har rupaye ko ek barabar nahi maanta. Aapke roz ke chote sukoon (chai, fitness) ko bachaya jata hai, aur faltu ke leaks ko aasaani se roka jata hai.' 
              : 'PaisaPulse refuses to treat every rupee equally. We protect the small daily routines that fuel your wellbeing while helping you effortlessly trim the invisible leaks.'}
          </p>
        </div>

        {/* Section 5: Dual Perspectives (Where Money Goes vs What Money Means) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Perspective 1: Where Your Money Goes (Financial Cost) */}
          <div className="p-4 sm:p-5 rounded-xl bg-cream/30 border border-line-light space-y-3.5">
            <div className="flex items-center justify-between border-b border-line-light pb-2">
              <span className="text-xs font-sans font-bold text-ink flex items-center gap-1.5">
                <span>{language === 'hinglish' ? '📊 Paisa Kahan Jaa Raha Hai' : '📊 Where Your Money Goes'}</span>
              </span>
              <span className="text-[10px] font-accent uppercase text-ink-muted font-bold">
                {language === 'hinglish' ? 'Kharche Ke Hisaab Se' : 'Ranked by Total Cost'}
              </span>
            </div>

            <div className="space-y-2.5">
              {(spendValueModel?.rankedByCost || []).slice(0, 5).map((c, i) => (
                <div key={c.id || c.clusterId || i} className="flex items-center justify-between p-2.5 rounded-lg bg-ivory border border-line-light">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-sm shrink-0">{c.emoji || c.icon || '📦'}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-ink truncate">{c.name || c.clusterName}</div>
                      <div className="text-[10px] text-ink-muted">
                        {c.transactionCount || 0} {language === 'hinglish' ? 'transactions' : 'transactions'} · {c.isDailyRitual ? (language === 'hinglish' ? 'Rozana Ki Aadat' : 'Daily Ritual') : (language === 'hinglish' ? 'Mahina' : 'Monthly')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-ink num-tabular">
                      {formatINR(c.monthlyCost)}{language === 'hinglish' ? '/mahina' : '/mo'}
                    </div>
                    <div className="text-[10px] text-ink-muted">Rank #{i + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Perspective 2: What Your Money Means to You (Personal Value Score) */}
          <div className="p-4 sm:p-5 rounded-xl bg-cream/30 border border-line-light space-y-3.5">
            <div className="flex items-center justify-between border-b border-line-light pb-2">
              <span className="text-xs font-sans font-bold text-coral flex items-center gap-1.5">
                <span>{language === 'hinglish' ? '❤️ Aapke Liye Kitna Zaroori Hai' : '❤️ What Your Money Means'}</span>
              </span>
              <span className="text-[10px] font-accent uppercase text-coral font-bold">
                {language === 'hinglish' ? 'Personal Value Score' : 'Personal Value Score'}
              </span>
            </div>

            <div className="space-y-2.5">
              {(spendValueModel?.rankedByValue || []).slice(0, 5).map((c, i) => (
                <div key={c.id || c.clusterId || i} className="flex items-center justify-between p-2.5 rounded-lg bg-ivory border border-line-light">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-sm shrink-0">{c.emoji || c.icon || '❤️'}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-ink truncate">{c.name || c.clusterName}</span>
                        <span 
                          className="text-[9px] font-accent uppercase font-bold px-1.5 py-0.2 rounded"
                          style={{
                            backgroundColor: c.quadrant?.bgColor || c.quadrantDef?.bgColor || '#FEF3C7',
                            color: c.quadrant?.color || c.quadrantDef?.color || '#92400E'
                          }}
                        >
                          {c.quadrant?.shortLabel || c.quadrantDef?.shortLabel || 'Active'}
                        </span>
                      </div>
                      <div className="text-[10px] text-ink-muted">
                        {language === 'hinglish' ? 'Confidence: Pakka' : `Confidence: ${c.confidence || 'HIGH'}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-coral num-tabular">{c.personalValueScore} / 100</div>
                    <div className="w-16 h-1.5 bg-cream rounded-full overflow-hidden mt-1 ml-auto">
                      <div className="h-full bg-coral rounded-full" style={{ width: `${c.personalValueScore}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 6 & 7: Companion Intelligence Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Don't Cut This */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800">
              <Shield className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="text-xs font-accent uppercase tracking-wider font-bold">
                {language === 'hinglish' ? '“Isko Bilkul Mat Roko” Protection' : '“Don\'t Cut This” Protection'}
              </span>
            </div>
            <p className="text-xs text-emerald-950 font-sans leading-relaxed">
              {spendValueModel?.dontCutReason || spendValueModel?.insights?.dontCutReason || 
                (language === 'hinglish' 
                  ? 'Aapki rozana chai ya routine ka kharcha kam hai par khushi sabse zyada deta hai. PaisaPulse isse kabhi band karne nahi kahega.'
                  : 'Your daily chai routine costs little but delivers high personal joy. PaisaPulse will never ask you to cut this.')}
            </p>
          </div>

          {/* Where Should I Cut */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-900">
              <Scissors className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-xs font-accent uppercase tracking-wider font-bold">
                {language === 'hinglish' ? '“Yahan Paisa Bacha Sakte Ho” Opportunity' : '“Where Should I Cut?” Opportunity'}
              </span>
            </div>
            <p className="text-xs text-amber-950 font-sans leading-relaxed">
              {spendValueModel?.cutAdvice || spendValueModel?.insights?.cutAdvice || 
                (language === 'hinglish'
                  ? 'Weekend pe 2 food delivery orders kam karne se lagbhag ₹500 bachenge bina aapki zaroori routine ko chhue.'
                  : 'Reducing weekend food delivery by 2 orders saves approx ₹500 without touching your high-value routines.')}
            </p>
          </div>
        </div>
      </div>

      {/* ACTIONABLE CASHFLOW LEAK CARD (Answering: So What Should I Do?) */}
      {categoryStats[0] && (
        <div style={{
          background: '#FFF7ED',
          border: '1.5px solid #FED7AA',
          borderRadius: '16px',
          padding: '18px 22px',
          marginBottom: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#EA580C" />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {language === 'hinglish' ? 'AAPKA SABSE BADA CASHFLOW LEAK' : 'YOUR BIGGEST CASHFLOW LEAK'}
              </span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1C1917', marginTop: '3px' }}>
              {categoryStats[0].name}: {formatINR(categoryStats[0].amount)} ({categoryStats[0].percent}% {language === 'hinglish' ? 'kul kharche ka' : 'of total spend'})
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#78716C', marginTop: '4px' }}>
              {language === 'hinglish' 
                ? <>Agar 20% kam karein: Toh har mahine lagbhag <strong style={{ color: '#059669' }}>+{formatINR(Math.round(categoryStats[0].amount * 0.20))}/mahina</strong> emergency liquidity bacha sakte hain.</>
                : <>If reduced by 20%: You could retain approximately <strong style={{ color: '#059669' }}>+{formatINR(Math.round(categoryStats[0].amount * 0.20))}/month</strong> in emergency liquidity.</>}
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              soundFX.playSuccess();
              alert(language === 'hinglish' 
                ? `Kharche Ka Niyam Set Hua: agle 30 dino ke liye ${categoryStats[0].name} ki limit ${formatINR(Math.round(categoryStats[0].amount * 0.80))} fix kardi gayi hai.`
                : `Spending Rule Created: Safe cap on ${categoryStats[0].name} set at ${formatINR(Math.round(categoryStats[0].amount * 0.80))} for next 30 days.`);
            }}
            style={{ fontSize: '0.82rem', padding: '9px 18px' }}
          >
            {language === 'hinglish' ? 'Kharcha Niyam Lagayein' : 'Create Spending Rule'}
          </button>
        </div>
      )}

      {/* 3 Top Highlight Cards (Dynamic Real-Time) */}
      <div className="dna-highlights-row" style={{ marginBottom: '24px' }}>
        {/* Weekend Spending Velocity */}
        <div className="card dna-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#78716C' }}>
              {language === 'hinglish' ? 'Weekend Pe Kharche Ka Ufaan' : 'Weekend Spend Surge'}
            </span>
            <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '24px' }}>
              <div style={{ width: '4px', height: '10px', background: '#FED7AA', borderRadius: '2px' }} />
              <div style={{ width: '4px', height: '12px', background: '#FED7AA', borderRadius: '2px' }} />
              <div style={{ width: '4px', height: '14px', background: '#FED7AA', borderRadius: '2px' }} />
              <div style={{ width: '4px', height: '18px', background: '#EA580C', borderRadius: '2px' }} />
              <div style={{ width: '4px', height: '24px', background: '#EA580C', borderRadius: '2px' }} />
            </div>
          </div>
          <div className="dna-stat-val" style={{ color: '#EA580C' }}>
            +{weekendMetrics.diffPercent}%
          </div>
          <div className="dna-stat-sub">
            {language === 'hinglish'
              ? `Weekends pe avg ${formatINR(weekendMetrics.weekendAvg)} vs weekdays pe ${formatINR(weekendMetrics.weekdayAvg)}`
              : `Avg ${formatINR(weekendMetrics.weekendAvg)} on weekends vs ${formatINR(weekendMetrics.weekdayAvg)} weekdays`}
          </div>
        </div>

        {/* Top Spending Category */}
        <div className="card dna-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#78716C' }}>
              {language === 'hinglish' ? 'Sabse Bada Expense Driver' : 'Primary Expense Driver'}
            </span>
            <div style={{ width: '70px', height: '24px' }}>
              <Sparkline data={dailySpendMetrics.sparkline} color="#F97316" height={24} strokeWidth={2} />
            </div>
          </div>
          <div className="dna-stat-val" style={{ color: categoryStats[0]?.color || '#F97316' }}>
            {categoryStats[0]?.name || 'Food'} ({categoryStats[0]?.percent || 0}%)
          </div>
          <div className="dna-stat-sub">
            {language === 'hinglish'
              ? `Kul ${formatINR(categoryStats[0]?.amount || 0)} is category mein kharch hue`
              : `Total ${formatINR(categoryStats[0]?.amount || 0)} allocated to this category`}
          </div>
        </div>

        {/* Average Daily Spend */}
        <div className="card dna-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#78716C' }}>
              {language === 'hinglish' ? 'Rozana Ka Kharcha (Daily Burn)' : 'Average Daily Burn'}
            </span>
            <div style={{ width: '70px', height: '24px' }}>
              <Sparkline data={dailySpendMetrics.sparkline} color="#10B981" height={24} strokeWidth={2} />
            </div>
          </div>
          <div className="dna-stat-val">
            {formatINR(dailySpendMetrics.avgDaily)}{language === 'hinglish' ? '/din' : '/day'}
          </div>
          <div className="dna-stat-sub">
            {language === 'hinglish'
              ? `${transactions.length} active transactions ke hisaab se calculated`
              : `Calculated across ${transactions.length} active transactions`}
          </div>
        </div>
      </div>

      {/* 2 Visual Charts Split Grid (Real-time SVG Donut + Top Merchants) */}
      <div className="charts-split-grid" style={{ marginBottom: '24px' }}>
        {/* Dynamic Category Donut Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <h3 className="card-title" style={{ margin: 0, fontSize: '1.15rem' }}>
                {language === 'hinglish' ? 'Category Ke Hisaab Se Kharche Ka Batwara' : 'Spending Distribution by Category'}
              </h3>
              <p style={{ fontSize: '0.76rem', color: '#78716C', margin: '3px 0 0 0' }}>
                {language === 'hinglish'
                  ? `${categoryStats.reduce((sum, c) => sum + (c.count || 1), 0)} kharche ${categoryStats.length} categories mein analyze hue`
                  : `${categoryStats.reduce((sum, c) => sum + (c.count || 1), 0)} expenses analyzed across ${categoryStats.length} active categories`}
              </p>
            </div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              background: '#FAF6F0',
              border: '1px solid #EAE3D6',
              padding: '4px 10px',
              borderRadius: '999px',
              color: '#1C1917'
            }} className="num-tabular">
              <span style={{ color: '#78716C', fontWeight: 500, marginRight: '4px' }}>
                {language === 'hinglish' ? 'Kul Kharcha:' : 'Total Outflow:'}
              </span>
              {formatINR(categoryStats.reduce((sum, c) => sum + c.amount, 0))}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: '210px', height: '210px', flexShrink: 0 }}>
              <svg width="210" height="210" viewBox="0 0 210 210" style={{ transform: 'rotate(-0.001deg)' }}>
                {/* Background Ring */}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={radius} 
                  fill="none" 
                  stroke="#F5EFE6" 
                  strokeWidth="18" 
                />
                {/* Dynamic Slices */}
                {donutSlices.map((slice, i) => {
                  const isSliceHovered = hoveredCat?.name === slice.name;
                  return (
                    <path
                      key={i}
                      d={slice.pathData}
                      fill="none"
                      stroke={slice.color}
                      strokeWidth={isSliceHovered ? '22' : '18'}
                      strokeLinecap="butt"
                      onMouseEnter={() => setHoveredCat(slice)}
                      onMouseLeave={() => setHoveredCat(null)}
                      style={{ 
                        transition: 'all 0.25s ease',
                        cursor: 'pointer',
                        opacity: hoveredCat && !isSliceHovered ? 0.45 : 1
                      }}
                    />
                  );
                })}
              </svg>

              {/* Perfectly Centered Content with Guaranteed Padding and No Collision */}
              {(() => {
                const activeFocus = hoveredCat || categoryStats[0] || { name: 'None', percent: 0, amount: 0 };
                return (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '8px',
                    pointerEvents: 'none'
                  }}>
                    <span style={{ 
                      fontSize: '0.64rem', 
                      fontWeight: 800, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.06em', 
                      color: '#78716C', 
                      marginBottom: '2px' 
                    }}>
                      {hoveredCat 
                        ? (language === 'hinglish' ? 'Chuna Hua' : 'Selected') 
                        : (language === 'hinglish' ? 'Sabse Bada' : 'Top Driver')}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 800, 
                        color: '#1C1917',
                        lineHeight: '1.2',
                        maxWidth: '108px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        marginBottom: '2px'
                      }}
                      title={activeFocus.name}
                    >
                      {activeFocus.name}
                    </span>
                    <span style={{ 
                      fontSize: '1.25rem', 
                      fontFamily: 'var(--font-instrument, serif)', 
                      fontWeight: 700, 
                      color: '#1C1917', 
                      lineHeight: '1.1' 
                    }} className="num-tabular">
                      {activeFocus.percent}%
                    </span>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      color: '#78716C', 
                      fontWeight: 600, 
                      marginTop: '1px' 
                    }} className="num-tabular">
                      {formatINR(activeFocus.amount)}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Dynamic Legend */}
            <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categoryStats.slice(0, 5).map((cat, i) => {
                const isHovered = hoveredCat?.name === cat.name;
                return (
                  <div 
                    key={i} 
                    onMouseEnter={() => setHoveredCat(cat)}
                    onMouseLeave={() => setHoveredCat(null)}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      background: isHovered ? '#FAF5EE' : '#FAF8F4',
                      border: isHovered ? `1px solid ${cat.color}70` : '1px solid #F0EAE1',
                      boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, flex: 1 }}>
                        <div 
                          style={{ 
                            width: '10px', 
                            height: '10px', 
                            borderRadius: '50%', 
                            background: cat.color,
                            flexShrink: 0,
                            boxShadow: `0 0 0 2px #FFFFFF, 0 1px 3px ${cat.color}40`
                          }} 
                        />
                        <span 
                          style={{ 
                            fontSize: '0.84rem', 
                            fontWeight: 700, 
                            color: '#1C1917',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={cat.name}
                        >
                          {cat.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1C1917' }} className="num-tabular">
                          {formatINR(cat.amount)}
                        </span>
                        <span 
                          style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 700, 
                            color: '#57534E', 
                            background: '#FFFFFF',
                            border: '1px solid #E7E2D8',
                            padding: '1.5px 7px',
                            borderRadius: '999px',
                            minWidth: '36px', 
                            textAlign: 'center' 
                          }}
                          className="num-tabular"
                        >
                          {cat.percent}%
                        </span>
                      </div>
                    </div>

                    {/* Progress track */}
                    <div style={{ width: '100%', height: '3px', background: '#EAE4DA', borderRadius: '999px', marginTop: '6px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${Math.min(100, Math.max(3, cat.percent))}%`, 
                          background: cat.color,
                          borderRadius: '999px',
                          transition: 'width 0.4s ease'
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Spending Outlets / Merchants */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 className="card-title" style={{ marginBottom: '18px' }}>
            {language === 'hinglish' ? 'Top Dukaandar aur Counterparties' : 'Top Outlets & Counterparties'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topMerchants.length > 0 ? (
              topMerchants.map((m, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #EFE8DF',
                    background: '#FFFFFF'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#FFF7ED',
                      color: '#EA580C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.8rem'
                    }}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1C1917' }}>{m.name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#78716C' }}>
                        {m.count} {language === 'hinglish' ? 'payments' : 'payments'} • {m.category}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#DC2626' }}>
                    -{formatINR(m.amount)}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.84rem', color: '#78716C' }}>
                {language === 'hinglish' ? 'Abhi tak koi kharcha record nahi hua hai.' : 'No expense transactions recorded yet.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
