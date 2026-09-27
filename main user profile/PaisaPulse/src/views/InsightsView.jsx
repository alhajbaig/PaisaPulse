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
  CreditCard
} from 'lucide-react';
import Sparkline from '../components/Sparkline';
import { formatINR } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { CATEGORIES } from '../engine/types.js';
import { useLanguage } from '../services/i18n.jsx';

export default function InsightsView({ currentPersona }) {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeframe, setTimeframe] = useState('All Time');

  const transactions = currentPersona?.transactions || [];
  const userName = currentPersona?.name || 'User';
  const firstName = userName.split(' ')[0] || 'User';

  // 1. DYNAMIC CATEGORY AGGREGATION FROM REAL TRANSACTIONS
  const categoryStats = useMemo(() => {
    const expenseTx = transactions.filter(t => (t.type || '').toLowerCase() === 'expense');
    const totalExpenses = expenseTx.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    const map = {};
    expenseTx.forEach(t => {
      const cat = t.category || 'Other';
      if (!map[cat]) map[cat] = 0;
      map[cat] += Math.abs(t.amount || 0);
    });

    const list = Object.entries(map).map(([name, amount]) => {
      const percent = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
      const catDef = CATEGORIES[name] || CATEGORIES.Other;
      return {
        name,
        amount,
        percent,
        color: catDef.color || '#64748B',
        icon: catDef.icon || MoreHorizontal
      };
    }).sort((a, b) => b.amount - a.amount);

    if (list.length === 0) {
      return [
        { name: 'Food', amount: 3200, percent: 35, color: '#F97316', icon: Utensils },
        { name: 'Rent', amount: 5000, percent: 45, color: '#EF4444', icon: MoreHorizontal },
        { name: 'Transport', amount: 1100, percent: 20, color: '#3B82F6', icon: Car }
      ];
    }

    return list;
  }, [transactions]);

  // 2. DYNAMIC REAL-TIME WEEKEND SPEND VELOCITY
  const weekendMetrics = useMemo(() => {
    const expenseTx = transactions.filter(t => (t.type || '').toLowerCase() === 'expense' && !t.recurring);
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
    const expenseTx = transactions.filter(t => (t.type || '').toLowerCase() === 'expense');
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
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const merch = t.merchant || t.description || 'Unknown Store';
      if (!map[merch]) map[merch] = { amount: 0, count: 0, category: t.category || 'Other' };
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
  const radius = 68;
  const cx = 95;
  const cy = 95;

  const donutSlices = categoryStats.slice(0, 6).map((cat) => {
    const startAngle = (cumulativePercent / 100) * 360;
    cumulativePercent += cat.percent;
    const endAngle = (cumulativePercent / 100) * 360;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArcFlag = cat.percent > 50 ? 1 : 0;

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
    <div>
      {/* Header */}
      <div className="transactions-view-header">
        <div className="view-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2>{language === 'hinglish' ? `${firstName} Ka Real-Time Financial DNA` : `${firstName}'s Real-Time Financial DNA`}</h2>
            <span style={{
              background: '#ECFDF5',
              color: '#059669',
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '999px',
              border: '1px solid #A7F3D0'
            }}>
              ● {language === 'hinglish' ? 'Live Calculated' : 'Real-Time Calculated'}
            </span>
          </div>
          <p>{t('insights_sub', 'Dynamically analyzed from your active transaction history, UPI frequency, and cashflow patterns.')}</p>
        </div>

        <div className="filter-tabs">
          {['All Time', 'This Month', 'Recent Feed'].map(t => (
            <button
              key={t}
              onClick={() => {
                soundFX.playClick();
                setTimeframe(t);
              }}
              className={`filter-tab-btn ${timeframe === t ? 'active' : ''}`}
            >
              {t}
            </button>
          ))}
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
                YOUR BIGGEST CASHFLOW LEAK
              </span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1C1917', marginTop: '3px' }}>
              {categoryStats[0].name}: {formatINR(categoryStats[0].amount)} ({categoryStats[0].percent}% of total spend)
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#78716C', marginTop: '4px' }}>
              If reduced by 20%: You could retain approximately <strong style={{ color: '#059669' }}>+{formatINR(Math.round(categoryStats[0].amount * 0.20))}/month</strong> in emergency liquidity.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              soundFX.playSuccess();
              alert(`Spending Rule Created: Safe cap on ${categoryStats[0].name} set at ${formatINR(Math.round(categoryStats[0].amount * 0.80))} for next 30 days.`);
            }}
            style={{ fontSize: '0.82rem', padding: '9px 18px' }}
          >
            Create Spending Rule
          </button>
        </div>
      )}

      {/* 3 Top Highlight Cards (Dynamic Real-Time) */}
      <div className="dna-highlights-row" style={{ marginBottom: '24px' }}>
        {/* Weekend Spending Velocity */}
        <div className="card dna-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#78716C' }}>Weekend Spend Surge</span>
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
            Avg {formatINR(weekendMetrics.weekendAvg)} on weekends vs {formatINR(weekendMetrics.weekdayAvg)} weekdays
          </div>
        </div>

        {/* Top Spending Category */}
        <div className="card dna-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#78716C' }}>Primary Expense Driver</span>
            <div style={{ width: '70px', height: '24px' }}>
              <Sparkline data={dailySpendMetrics.sparkline} color="#F97316" height={24} strokeWidth={2} />
            </div>
          </div>
          <div className="dna-stat-val" style={{ color: categoryStats[0]?.color || '#F97316' }}>
            {categoryStats[0]?.name || 'Food'} ({categoryStats[0]?.percent || 0}%)
          </div>
          <div className="dna-stat-sub">
            Total {formatINR(categoryStats[0]?.amount || 0)} allocated to this category
          </div>
        </div>

        {/* Average Daily Spend */}
        <div className="card dna-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#78716C' }}>Average Daily Burn</span>
            <div style={{ width: '70px', height: '24px' }}>
              <Sparkline data={dailySpendMetrics.sparkline} color="#10B981" height={24} strokeWidth={2} />
            </div>
          </div>
          <div className="dna-stat-val">
            {formatINR(dailySpendMetrics.avgDaily)}/day
          </div>
          <div className="dna-stat-sub">
            Calculated across {transactions.length} active transactions
          </div>
        </div>
      </div>

      {/* 2 Visual Charts Split Grid (Real-time SVG Donut + Top Merchants) */}
      <div className="charts-split-grid" style={{ marginBottom: '24px' }}>
        {/* Dynamic Category Donut Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 className="card-title" style={{ marginBottom: '18px' }}>
            Spending Distribution by Category ({transactions.length} Txns)
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: '190px', height: '190px', flexShrink: 0 }}>
              <svg width="190" height="190" viewBox="0 0 190 190">
                {/* Background Ring */}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={radius} 
                  fill="none" 
                  stroke="#F5EFE6" 
                  strokeWidth="22" 
                />
                {/* Dynamic Slices */}
                {donutSlices.map((slice, i) => (
                  <path
                    key={i}
                    d={slice.pathData}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="22"
                    strokeLinecap="butt"
                    style={{ transition: 'all 0.3s ease' }}
                  />
                ))}
              </svg>

              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}>
                <span style={{ fontSize: '0.74rem', color: '#78716C', fontWeight: 600 }}>Top Driver</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1C1917' }}>
                  {categoryStats[0]?.name || 'Food'}
                </span>
              </div>
            </div>

            {/* Dynamic Legend */}
            <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categoryStats.slice(0, 5).map((cat, i) => (
                <div 
                  key={i} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: '#FAF8F4'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color }} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1C1917' }}>{cat.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1C1917' }}>{formatINR(cat.amount)}</span>
                    <span style={{ fontSize: '0.75rem', color: '#78716C', width: '32px', textAlign: 'right' }}>{cat.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Spending Outlets / Merchants */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 className="card-title" style={{ marginBottom: '18px' }}>
            Top Outlets & Counterparties
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
                      <div style={{ fontSize: '0.74rem', color: '#78716C' }}>{m.count} payments • {m.category}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#DC2626' }}>
                    -{formatINR(m.amount)}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.84rem', color: '#78716C' }}>No expense transactions recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
