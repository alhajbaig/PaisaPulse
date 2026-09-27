import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  UploadCloud, 
  AlertTriangle, 
  Trash2,
  MoreHorizontal,
  Check,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { CATEGORIES, resolveTransactionCategory } from '../engine/types.js';
import { formatINR } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { analyzeSpendingAnomalies, detectDuplicateGroups } from '../services/ai/transactionAnalyzer.js';
import { categorizeTransactionOffline } from '../services/ai/categorizer.js';
import { useLanguage } from '../services/i18n.jsx';

export default function TransactionsView({ 
  transactions = [], 
  onAddTransactionClick,
  onOpenCSVImport,
  onResolveDuplicate,
  onUpdateTransaction,
  onDeleteTransaction 
}) {
  const { t, language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxIds, setSelectedTxIds] = useState([]);
  const [dismissedAnomalies, setDismissedAnomalies] = useState(new Set());

  // Run Data Quality & Anomaly Analysis
  const analyzedTransactions = useMemo(() => {
    const withAnomalies = analyzeSpendingAnomalies(transactions);
    return withAnomalies.map(tx => {
      // If user dismissed anomaly, ignore
      if (dismissedAnomalies.has(tx.id)) {
        return { ...tx, isUnusual: false };
      }
      return tx;
    });
  }, [transactions, dismissedAnomalies]);

  const duplicateGroups = useMemo(() => {
    return detectDuplicateGroups(analyzedTransactions);
  }, [analyzedTransactions]);

  const unusualTransactions = useMemo(() => {
    return analyzedTransactions.filter(t => t.isUnusual && !dismissedAnomalies.has(t.id));
  }, [analyzedTransactions, dismissedAnomalies]);

  // Filter transactions
  const filtered = analyzedTransactions.filter(tx => {
    if (activeFilter !== 'All') {
      const lowerType = (tx.type || '').toLowerCase();
      if (activeFilter === 'Income' && lowerType !== 'income') return false;
      if (activeFilter === 'Expense' && lowerType !== 'expense') return false;
      if (activeFilter === 'Transfer' && lowerType !== 'transfer') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = (tx.description || '').toLowerCase().includes(q);
      const resolvedCat = resolveTransactionCategory(tx);
      const matchCat = (tx.category || '').toLowerCase().includes(q) || resolvedCat.toLowerCase().includes(q);
      const matchAmount = (tx.amount || '').toString().includes(q);
      if (!matchDesc && !matchMerch && !matchCat && !matchAmount) return false;
    }
    return true;
  });

  const duplicateSuspects = transactions.filter(t => t.isDuplicateSuspect);

  const toggleSelectAll = () => {
    if (selectedTxIds.length === filtered.length) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(filtered.map(t => t.id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedTxIds.includes(id)) {
      setSelectedTxIds(selectedTxIds.filter(x => x !== id));
    } else {
      setSelectedTxIds([...selectedTxIds, id]);
    }
  };

  // Export as CSV
  const handleExportCSV = () => {
    soundFX.playClick();
    const headers = 'ID,Date,Description,Merchant,Category,Type,Amount,PaymentMethod,Recurring,Essential,Source\n';
    const rows = filtered.map(t => 
      `"${t.id}","${t.date}","${t.description}","${t.merchant || ''}","${t.category}","${t.type}","${t.amount}","${t.paymentMethod || ''}","${!!t.recurring}","${!!t.essential}","${t.source || 'manual'}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PaisaPulse_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header (Prompt Section 29) */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-line-medium pb-6 pt-2">
        <div className="space-y-1">
          <span className="text-xs font-accent uppercase tracking-widest text-coral font-bold block">
            Transactions
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-ink font-normal">
            Where your money went
          </h1>
          <p className="font-sans text-xs sm:text-sm text-ink-muted">
            Single source of truth: all dashboard balances and forecasts derive from this ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            className="px-4 py-2 rounded-full bg-ivory border border-line-medium text-xs font-sans text-ink hover:border-line-dark transition-all flex items-center gap-2"
            onClick={onOpenCSVImport}
            title="Upload CSV statement with custom column mapping"
          >
            <UploadCloud size={14} className="text-coral" />
            <span>Import CSV</span>
          </button>

          <button 
            className="px-4 py-2 rounded-full bg-ivory border border-line-medium text-xs font-sans text-ink hover:border-line-dark transition-all flex items-center gap-2"
            onClick={handleExportCSV}
            title="Export filtered records as CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button 
            className="px-5 py-2 rounded-full bg-ink text-ivory text-xs font-sans font-semibold hover:bg-coral transition-all shadow-sm flex items-center gap-2"
            onClick={() => {
              soundFX.playClick();
              onAddTransactionClick();
            }}
          >
            <Plus size={14} />
            <span>Manual Add</span>
          </button>
        </div>
      </div>

      {/* 1. Duplicate Groups Review Banner */}
      {duplicateGroups.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {duplicateGroups.map((group) => (
            <div key={group.id} className="dup-alert-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={18} color="#D97706" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Possible duplicate detected:</strong> These transactions look similar ({formatINR(group.amount)} for "{group.description}" on {group.date}).
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => {
                    soundFX.playSuccess();
                    // Merge: keep first, remove second
                    const toRemove = group.transactions.slice(1);
                    toRemove.forEach(t => onResolveDuplicate(t.id, 'merge'));
                  }}
                  style={{
                    background: '#EA580C',
                    color: '#FFFFFF',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}
                  title="Remove duplicate and keep verified entry"
                >
                  Merge
                </button>
                <button
                  onClick={() => {
                    soundFX.playSuccess();
                    group.transactions.forEach(t => onResolveDuplicate(t.id, 'keep_both'));
                  }}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #FCD34D',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#92400E'
                  }}
                >
                  Keep Both
                </button>
                <button
                  onClick={() => {
                    soundFX.playClick();
                    group.transactions.forEach(t => onResolveDuplicate(t.id, 'dismiss'));
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '5px 8px',
                    fontSize: '0.78rem',
                    color: '#78716C',
                    cursor: 'pointer'
                  }}
                >
                  Ignore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Unusual Spending Anomaly Banner */}
      {unusualTransactions.length > 0 && (
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#92400E' }}>Unusual transaction detected:</strong>{' '}
              <span style={{ color: '#78350F', fontSize: '0.86rem' }}>
                {unusualTransactions[0].unusualReason || `${formatINR(unusualTransactions[0].amount)} on ${unusualTransactions[0].category} is significantly higher than your typical baseline.`}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              soundFX.playClick();
              setDismissedAnomalies(prev => new Set([...prev, unusualTransactions[0].id]));
            }}
            style={{
              background: '#FFFFFF',
              border: '1px solid #FCD34D',
              color: '#92400E',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Mark Reviewed
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="tx-filter-bar">
        <div className="filter-tabs">
          {['All', 'Income', 'Expense', 'Transfer'].map(tab => (
            <button
              key={tab}
              onClick={() => {
                soundFX.playClick();
                setActiveFilter(tab);
              }}
              className={`filter-tab-btn ${activeFilter === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="tx-search-box">
            <Search size={16} color="#A8A29E" />
            <input 
              type="text" 
              placeholder="Search by merchant, note, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="btn-secondary" style={{ padding: '8px 12px' }}>
            <Filter size={15} />
            <span>{filtered.length} Items</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="data-table-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input 
                  type="checkbox"
                  checked={selectedTxIds.length > 0 && selectedTxIds.length === filtered.length}
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th>Date</th>
              <th>Description / Merchant</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Source / Channel</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px 20px', color: '#A8A29E' }}>
                  No transactions recorded yet. Add one manually, upload a CSV, or trigger the live simulation stream!
                </td>
              </tr>
            ) : (
              filtered.map(tx => {
                const resolvedCat = resolveTransactionCategory(tx);
                const catDef = CATEGORIES[resolvedCat] || CATEGORIES[tx.category] || CATEGORIES.Other;
                const CatIcon = catDef.icon || MoreHorizontal;
                const isSelected = selectedTxIds.includes(tx.id);
                const isIncome = (tx.type || '').toLowerCase() === 'income';

                return (
                  <tr 
                    key={tx.id}
                    style={{
                      backgroundColor: tx.isDuplicateSuspect ? '#FFFBEB' : (isSelected ? '#FAF6F0' : 'transparent')
                    }}
                  >
                    <td>
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(tx.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ color: '#78716C', whiteSpace: 'nowrap' }}>
                      {tx.date}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: '#1C1917' }}>{tx.description}</span>
                        {tx.isUnusual && (
                          <span 
                            style={{
                              fontSize: '0.68rem',
                              background: '#FEF2F2',
                              color: '#DC2626',
                              border: '1px solid #FECACA',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontWeight: 800,
                              cursor: 'help'
                            }}
                            title={tx.unusualReason || 'Unusual / Needs Review'}
                          >
                            ⚠ Unusual / Needs Review
                          </span>
                        )}
                        {tx.isDuplicateSuspect && (
                          <span style={{
                            fontSize: '0.68rem',
                            background: '#FEF3C7',
                            color: '#B45309',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontWeight: 800
                          }}>
                            Suspect Duplicate
                          </span>
                        )}
                        {tx.recurring && (
                          <span style={{
                            fontSize: '0.68rem',
                            background: '#FEEEDD',
                            color: '#EA580C',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontWeight: 700
                          }}>
                            Recurring
                          </span>
                        )}
                      </div>
                      {tx.merchant && tx.merchant !== tx.description && (
                        <span style={{ fontSize: '0.74rem', color: '#78716C' }}>
                          Merchant: {tx.merchant}
                        </span>
                      )}
                    </td>
                    <td>
                      {(() => {
                        const isOther = !tx.category || tx.category === 'Other';
                        const aiSuggestion = isOther ? categorizeTransactionOffline(tx.description || tx.merchant || '') : null;
                        const hasAiSuggestion = aiSuggestion && aiSuggestion.category !== 'Other';

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                            <div 
                              className="cat-pill"
                              style={{
                                backgroundColor: catDef.bg,
                                color: catDef.color
                              }}
                            >
                              <CatIcon size={13} />
                              <span>{catDef.name}</span>
                            </div>

                            {hasAiSuggestion && onUpdateTransaction && (
                              <button
                                type="button"
                                onClick={() => {
                                  soundFX.playSuccess();
                                  onUpdateTransaction(tx.id, { 
                                    category: aiSuggestion.category, 
                                    confidence: aiSuggestion.confidence,
                                    confidenceReason: aiSuggestion.reason
                                  });
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.68rem',
                                  background: '#FAF5FF',
                                  border: '1px solid #E9D5FF',
                                  color: '#7E22CE',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: 700
                                }}
                                title={`AI suggested based on merchant: ${aiSuggestion.category} (${Math.round((aiSuggestion.confidence || 0.8) * 100)}% confidence)`}
                              >
                                <Sparkles size={10} />
                                <span>AI: {aiSuggestion.category}</span>
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      <span className={`type-pill ${isIncome ? 'income' : 'expense'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td>
                      <span className={isIncome ? 'amount-income' : 'amount-expense'}>
                        {isIncome ? '+' : '-'} {formatINR(tx.amount)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          background: tx.source === 'csv' ? '#EFF6FF' : (tx.source === 'simulated' ? '#FEEEDD' : '#F5EFE6'),
                          color: tx.source === 'csv' ? '#2563EB' : (tx.source === 'simulated' ? '#EA580C' : '#57534E'),
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          {tx.source || 'manual'}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#A8A29E' }}>
                          {tx.paymentMethod || 'UPI'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={() => {
                          soundFX.playClick();
                          onDeleteTransaction(tx.id);
                        }}
                        title="Delete transaction"
                        style={{ color: '#A8A29E', padding: '4px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
