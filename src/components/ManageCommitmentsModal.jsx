import React, { useState } from 'react';
import {
  X,
  Edit2, 
  Plus, 
  Trash2, 
  Calendar, 
  Wallet, 
  ShieldCheck, 
  Check, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { formatINR } from '../engine/cashflowEngine';
import { CATEGORIES } from '../engine/types';
import { soundFX } from '../engine/audioEffects';

export default function ManageCommitmentsModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onUpdateFinancialProfile 
}) {
  const [activeTab, setActiveTab] = useState('income'); // 'income' | 'commitments' | 'balance'
  
  // Starting balance & safety buffer
  const [initialBalance, setInitialBalance] = useState(currentUser?.initialBalance?.toString() || '15000');
  const [safetyBuffer, setSafetyBuffer] = useState(currentUser?.safetyBuffer?.toString() || '3000');

  // Incomes list
  const [incomes, setIncomes] = useState(currentUser?.upcomingIncome || []);
  const [newIncomeTitle, setNewIncomeTitle] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');
  const [newIncomeDays, setNewIncomeDays] = useState('5');

  // Commitments list
  const [commitments, setCommitments] = useState(currentUser?.upcomingCommitments || []);
  const [newComTitle, setNewComTitle] = useState('');
  const [newComAmount, setNewComAmount] = useState('');
  const [newComDays, setNewComDays] = useState('3');
  const [newComCategory, setNewComCategory] = useState('Rent');
  const [newComEssential, setNewComEssential] = useState(true);

  React.useEffect(() => {
    if (isOpen && currentUser) {
      setInitialBalance(currentUser.initialBalance !== undefined ? currentUser.initialBalance.toString() : '15000');
      setSafetyBuffer(currentUser.safetyBuffer !== undefined ? currentUser.safetyBuffer.toString() : '3000');
      setIncomes(Array.isArray(currentUser.upcomingIncome) ? [...currentUser.upcomingIncome] : []);
      setCommitments(Array.isArray(currentUser.upcomingCommitments) ? [...currentUser.upcomingCommitments] : []);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Add Income
  const handleAddIncome = (e) => {
    e.preventDefault();
    if (!newIncomeTitle.trim() || !newIncomeAmount || isNaN(newIncomeAmount)) return;

    soundFX.playClick();
    const newInc = {
      id: `inc_${Date.now()}`,
      title: newIncomeTitle.trim(),
      amount: parseFloat(newIncomeAmount),
      daysAway: parseInt(newIncomeDays, 10) || 1,
      probability: 0.95,
      date: `In ${newIncomeDays} days`
    };

    const updated = [...incomes, newInc];
    setIncomes(updated);
    setNewIncomeTitle('');
    setNewIncomeAmount('');
  };

  const handleDeleteIncome = (id) => {
    soundFX.playClick();
    setIncomes(incomes.filter(inc => inc.id !== id));
  };

  // Add Commitment
  const handleAddCommitment = (e) => {
    e.preventDefault();
    if (!newComTitle.trim() || !newComAmount || isNaN(newComAmount)) return;

    soundFX.playClick();
    const newCom = {
      id: `com_${Date.now()}`,
      title: newComTitle.trim(),
      amount: parseFloat(newComAmount),
      daysAway: parseInt(newComDays, 10) || 1,
      category: newComCategory,
      essential: newComEssential,
      date: `In ${newComDays} days`
    };

    const updated = [...commitments, newCom];
    setCommitments(updated);
    setNewComTitle('');
    setNewComAmount('');
  };

  const handleDeleteCommitment = (id) => {
    soundFX.playClick();
    setCommitments(commitments.filter(c => c.id !== id));
  };

  // Save all changes
  const handleSaveAndClose = () => {
    soundFX.playSuccess();
    onUpdateFinancialProfile({
      initialBalance: parseFloat(initialBalance) || 0,
      safetyBuffer: parseFloat(safetyBuffer) || 0,
      upcomingIncome: incomes,
      upcomingCommitments: commitments
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#171512]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-ivory border border-line-medium rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-lifted flex flex-col overflow-hidden animate-slideUp">
        {/* Modal Header */}
        <div className="p-6 border-b border-line-medium flex items-start justify-between bg-ivory">
          <div className="space-y-1">
            <span className="text-[11px] font-accent uppercase tracking-widest text-coral font-bold block">
              Financial Baseline Setup
            </span>
            <h3 className="font-editorial text-2xl text-ink font-normal">
              Profile & Commitments
            </h3>
            <p className="font-sans text-xs text-ink-muted">
              Configure baseline starting balance, incoming paychecks, and scheduled mandatory expenses.
            </p>
          </div>
          <button 
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full border border-line-medium hover:border-line-dark flex items-center justify-center text-ink-muted hover:text-ink transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 p-4 px-6 border-b border-line-light bg-cream/40 overflow-x-auto">
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('income');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-sans transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
              activeTab === 'income'
                ? 'bg-ink text-ivory font-semibold shadow-subtle'
                : 'bg-ivory border border-line-medium text-ink-muted hover:border-line-dark hover:text-ink'
            }`}
          >
            <TrendingUp size={13} />
            <span>Upcoming Incomes ({incomes.length})</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('commitments');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-sans transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
              activeTab === 'commitments'
                ? 'bg-ink text-ivory font-semibold shadow-subtle'
                : 'bg-ivory border border-line-medium text-ink-muted hover:border-line-dark hover:text-ink'
            }`}
          >
            <Calendar size={13} />
            <span>Scheduled Bills ({commitments.length})</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('balance');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-sans transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
              activeTab === 'balance'
                ? 'bg-ink text-ivory font-semibold shadow-subtle'
                : 'bg-ivory border border-line-medium text-ink-muted hover:border-line-dark hover:text-ink'
            }`}
          >
            <Wallet size={13} />
            <span>Initial Balance & Buffer</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: UPCOMING INCOMES */}
          {activeTab === 'income' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-sans text-sm font-semibold text-ink">
                  When will you receive your next income?
                </h4>
                <p className="font-sans text-xs text-ink-muted mt-0.5">
                  Expected stipend, salary, freelance payout, or family transfer. If none are expected soon, leave empty.
                </p>
              </div>

              {/* Add Income Form */}
              <form onSubmit={handleAddIncome} className="bg-cream/40 p-4 rounded-xl border border-line-medium grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-sans font-semibold text-ink-muted mb-1">
                    Income Title
                  </label>
                  <input 
                    type="text"
                    value={newIncomeTitle}
                    onChange={(e) => setNewIncomeTitle(e.target.value)}
                    placeholder="e.g. Stipend"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-line-medium bg-ivory text-ink font-sans text-xs focus:outline-none focus:border-coral"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-sans font-semibold text-ink-muted mb-1">
                    Amount (₹)
                  </label>
                  <input 
                    type="number"
                    value={newIncomeAmount}
                    onChange={(e) => setNewIncomeAmount(e.target.value)}
                    placeholder="25000"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-line-medium bg-ivory text-ink font-accent font-semibold text-xs focus:outline-none focus:border-coral num-tabular"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-sans font-semibold text-ink-muted mb-1">
                    Arrives In (Days)
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="60"
                    value={newIncomeDays}
                    onChange={(e) => setNewIncomeDays(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-line-medium bg-ivory text-ink font-sans text-xs focus:outline-none focus:border-coral"
                  />
                </div>

                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-coral text-white text-xs font-sans font-semibold hover:bg-coral-dark transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-subtle h-[34px]"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </form>

              {/* List of active upcoming incomes */}
              <div className="space-y-2">
                {incomes.length === 0 ? (
                  <div className="text-center py-8 text-ink-muted bg-cream/30 rounded-xl border border-line-light">
                    <p className="font-sans text-xs font-semibold text-ink">No upcoming income scheduled</p>
                    <p className="font-sans text-[11px] text-ink-muted mt-0.5">Guardian will budget your liquidity on a standard 7-day rolling cycle.</p>
                  </div>
                ) : (
                  incomes.map(inc => (
                    <div 
                      key={inc.id}
                      className="p-3 bg-ivory rounded-xl border border-line-light flex items-center justify-between shadow-subtle"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                          <TrendingUp size={15} />
                        </div>
                        <div>
                          <div className="font-sans text-xs font-semibold text-ink">{inc.title}</div>
                          <span className="font-accent text-[11px] text-ink-muted">Expected in {inc.daysAway} days</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-accent text-sm font-semibold text-emerald-700 num-tabular">
                          +{formatINR(inc.amount)}
                        </span>
                        <button 
                          onClick={() => handleDeleteIncome(inc.id)}
                          className="text-ink-muted hover:text-red-600 transition-colors p-1 cursor-pointer"
                          title="Delete income"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULED BILLS / RENT */}
          {activeTab === 'commitments' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-sans text-sm font-semibold text-ink">
                  What recurring bills or commitments do you have?
                </h4>
                <p className="font-sans text-xs text-ink-muted mt-0.5">
                  Commitments that debit automatically before your next income. Safe-to-spend protects these funds first.
                </p>
              </div>

              {/* Add Commitment Form */}
              <form onSubmit={handleAddCommitment} className="bg-cream/40 p-4 rounded-xl border border-line-medium grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-sans font-semibold text-ink-muted mb-1">
                    Title
                  </label>
                  <input 
                    type="text"
                    value={newComTitle}
                    onChange={(e) => setNewComTitle(e.target.value)}
                    placeholder="e.g. Rent"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-line-medium bg-ivory text-ink font-sans text-xs focus:outline-none focus:border-coral"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-sans font-semibold text-ink-muted mb-1">
                    Amount (₹)
                  </label>
                  <input 
                    type="number"
                    value={newComAmount}
                    onChange={(e) => setNewComAmount(e.target.value)}
                    placeholder="5000"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-line-medium bg-ivory text-ink font-accent font-semibold text-xs focus:outline-none focus:border-coral num-tabular"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-sans font-semibold text-ink-muted mb-1">
                    Due In (Days)
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="30"
                    value={newComDays}
                    onChange={(e) => setNewComDays(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-line-medium bg-ivory text-ink font-sans text-xs focus:outline-none focus:border-coral"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-sans font-semibold text-ink-muted mb-1">
                    Category
                  </label>
                  <select
                    value={newComCategory}
                    onChange={(e) => setNewComCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-line-medium bg-ivory text-ink font-sans text-xs focus:outline-none focus:border-coral"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Utilities">Utilities / Bills</option>
                    <option value="Subscriptions">Subscriptions</option>
                    <option value="Education">Education Fee</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-coral text-white text-xs font-sans font-semibold hover:bg-coral-dark transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-subtle h-[34px]"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </form>

              {/* List of active commitments */}
              <div className="space-y-2">
                {commitments.length === 0 ? (
                  <div className="text-center py-8 text-ink-muted bg-cream/30 rounded-xl border border-line-light">
                    <p className="font-sans text-xs font-semibold text-ink">No recurring commitments added</p>
                    <p className="font-sans text-[11px] text-ink-muted mt-0.5">Add your monthly rent or bills to ensure they are protected from accidental spending.</p>
                  </div>
                ) : (
                  commitments.map(c => (
                    <div 
                      key={c.id}
                      className="p-3 bg-ivory rounded-xl border border-line-light flex items-center justify-between shadow-subtle"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-coral/10 text-coral flex items-center justify-center">
                          <Calendar size={15} />
                        </div>
                        <div>
                          <div className="font-sans text-xs font-semibold text-ink">{c.title}</div>
                          <span className="font-accent text-[11px] text-ink-muted">
                            Due in {c.daysAway} days · {c.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-accent text-sm font-semibold text-ink num-tabular">
                          {formatINR(c.amount)}
                        </span>
                        <button 
                          onClick={() => handleDeleteCommitment(c.id)}
                          className="text-ink-muted hover:text-red-600 transition-colors p-1 cursor-pointer"
                          title="Delete commitment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: INITIAL BALANCE & SAFETY BUFFER */}
          {activeTab === 'balance' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-sans text-sm font-semibold text-ink">
                  Starting Bank Balance & Safety Cushion
                </h4>
                <p className="font-sans text-xs text-ink-muted mt-0.5">
                  Your live balance is strictly: <code className="bg-cream px-1.5 py-0.5 rounded border border-line-light font-mono text-[10px]">Starting Balance + Incomes - Expenses</code>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-cream/40 p-4 rounded-xl border border-line-medium space-y-2">
                  <label className="block text-xs font-sans font-semibold text-ink">
                    Starting Bank Balance (₹)
                  </label>
                  <input 
                    type="number"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-line-medium bg-ivory text-ink font-accent font-semibold text-lg focus:outline-none focus:border-coral num-tabular"
                  />
                  <span className="text-[11px] font-sans text-ink-muted block">
                    Current liquid bank account balance
                  </span>
                </div>

                <div className="bg-cream/40 p-4 rounded-xl border border-line-medium space-y-2">
                  <label className="block text-xs font-sans font-semibold text-ink">
                    Safety Buffer Target (₹)
                  </label>
                  <input 
                    type="number"
                    value={safetyBuffer}
                    onChange={(e) => setSafetyBuffer(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-line-medium bg-ivory text-emerald-800 font-accent font-semibold text-lg focus:outline-none focus:border-coral num-tabular"
                  />
                  <span className="text-[11px] font-sans text-ink-muted block">
                    Protected emergency buffer (never spent)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-line-medium bg-ivory flex justify-end gap-3">
          <button 
            className="px-4 py-2 rounded-full border border-line-medium text-xs font-sans text-ink-muted hover:text-ink hover:border-line-dark transition-colors cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-5 py-2 rounded-full bg-coral text-white text-xs font-sans font-semibold hover:bg-coral-dark transition-all flex items-center gap-1.5 cursor-pointer shadow-subtle"
            onClick={handleSaveAndClose}
          >
            <Check size={14} />
            <span>Save Profile & Recalculate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
