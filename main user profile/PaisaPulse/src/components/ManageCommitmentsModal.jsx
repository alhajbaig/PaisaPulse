import React, { useState } from 'react';
import { 
  X, 
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
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(28, 25, 23, 0.55)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #EFE8DF',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid #EFE8DF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FCFAF7'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1C1917' }}>
              Financial Profile & Commitments Setup
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#78716C' }}>
              Define your actual starting balance, upcoming expected incomes, and scheduled bills.
            </p>
          </div>
          <button 
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F5EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', padding: '14px 28px 0', gap: '8px' }}>
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('income');
            }}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 700,
              background: activeTab === 'income' ? '#18181B' : '#F5EFE6',
              color: activeTab === 'income' ? '#FFFFFF' : '#78716C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <TrendingUp size={15} />
            <span>Upcoming Incomes ({incomes.length})</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('commitments');
            }}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 700,
              background: activeTab === 'commitments' ? '#18181B' : '#F5EFE6',
              color: activeTab === 'commitments' ? '#FFFFFF' : '#78716C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Calendar size={15} />
            <span>Scheduled Bills / Rent ({commitments.length})</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('balance');
            }}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 700,
              background: activeTab === 'balance' ? '#18181B' : '#F5EFE6',
              color: activeTab === 'balance' ? '#FFFFFF' : '#78716C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Wallet size={15} />
            <span>Initial Balance & Buffer</span>
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          {/* TAB 1: UPCOMING INCOMES */}
          {activeTab === 'income' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1C1917', marginBottom: '4px' }}>
                  When will you receive your next income?
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#78716C' }}>
                  Add your expected stipend, salary, freelance payout, or family transfer. If you don't have any incoming funds expected soon, leave this empty.
                </p>
              </div>

              {/* Add Income Form */}
              <form onSubmit={handleAddIncome} style={{
                background: '#FAF8F4',
                padding: '16px',
                borderRadius: '14px',
                border: '1px solid #EFE8DF',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 1fr auto',
                gap: '10px',
                alignItems: 'flex-end'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#57534E', marginBottom: '3px' }}>
                    Income Title
                  </label>
                  <input 
                    type="text"
                    value={newIncomeTitle}
                    onChange={(e) => setNewIncomeTitle(e.target.value)}
                    placeholder="e.g. Salary, Stipend, Upwork"
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #D6CCC2', background: '#FFF' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#57534E', marginBottom: '3px' }}>
                    Amount (₹)
                  </label>
                  <input 
                    type="number"
                    value={newIncomeAmount}
                    onChange={(e) => setNewIncomeAmount(e.target.value)}
                    placeholder="e.g. 25000"
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #D6CCC2', background: '#FFF', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#57534E', marginBottom: '3px' }}>
                    Arrives In (Days)
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="60"
                    value={newIncomeDays}
                    onChange={(e) => setNewIncomeDays(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #D6CCC2', background: '#FFF' }}
                  />
                </div>

                <button 
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 14px', height: '40px' }}
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </form>

              {/* List of active upcoming incomes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {incomes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: '#A8A29E', background: '#FAF8F4', borderRadius: '12px' }}>
                    <p style={{ fontWeight: 700, color: '#57534E' }}>No upcoming income scheduled</p>
                    <p style={{ fontSize: '0.78rem' }}>Guardian will budget your liquidity on a standard 7-day rolling cycle.</p>
                  </div>
                ) : (
                  incomes.map(inc => (
                    <div 
                      key={inc.id}
                      style={{
                        padding: '12px 16px',
                        background: '#FFF',
                        borderRadius: '12px',
                        border: '1px solid #EFE8DF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TrendingUp size={16} />
                        </div>
                        <div>
                          <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1C1917' }}>{inc.title}</h5>
                          <span style={{ fontSize: '0.74rem', color: '#78716C' }}>Expected in {inc.daysAway} days</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#10B981' }}>
                          +{formatINR(inc.amount)}
                        </span>
                        <button 
                          onClick={() => handleDeleteIncome(inc.id)}
                          style={{ color: '#EF4444', padding: '4px' }}
                          title="Delete income"
                        >
                          <Trash2 size={15} />
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
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1C1917', marginBottom: '4px' }}>
                  What recurring bills or commitments do you have?
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#78716C' }}>
                  Add commitments that will debit automatically before your next income (e.g. PG rent, WiFi, Spotify, gym). Safe-to-spend protects these funds first.
                </p>
              </div>

              {/* Add Commitment Form */}
              <form onSubmit={handleAddCommitment} style={{
                background: '#FAF8F4',
                padding: '16px',
                borderRadius: '14px',
                border: '1px solid #EFE8DF',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr 1fr 1fr auto',
                gap: '10px',
                alignItems: 'flex-end'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#57534E', marginBottom: '3px' }}>
                    Title
                  </label>
                  <input 
                    type="text"
                    value={newComTitle}
                    onChange={(e) => setNewComTitle(e.target.value)}
                    placeholder="e.g. PG Rent, WiFi"
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #D6CCC2', background: '#FFF' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#57534E', marginBottom: '3px' }}>
                    Amount (₹)
                  </label>
                  <input 
                    type="number"
                    value={newComAmount}
                    onChange={(e) => setNewComAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #D6CCC2', background: '#FFF', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#57534E', marginBottom: '3px' }}>
                    Due In (Days)
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="30"
                    value={newComDays}
                    onChange={(e) => setNewComDays(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #D6CCC2', background: '#FFF' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#57534E', marginBottom: '3px' }}>
                    Category
                  </label>
                  <select
                    value={newComCategory}
                    onChange={(e) => setNewComCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #D6CCC2', background: '#FFF' }}
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
                  className="btn-primary"
                  style={{ padding: '8px 14px', height: '40px' }}
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </form>

              {/* List of active commitments */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {commitments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: '#A8A29E', background: '#FAF8F4', borderRadius: '12px' }}>
                    <p style={{ fontWeight: 700, color: '#57534E' }}>No recurring commitments added</p>
                    <p style={{ fontSize: '0.78rem' }}>Add your monthly rent or bills to ensure they are protected from accidental spending.</p>
                  </div>
                ) : (
                  commitments.map(c => (
                    <div 
                      key={c.id}
                      style={{
                        padding: '12px 16px',
                        background: '#FFF',
                        borderRadius: '12px',
                        border: '1px solid #EFE8DF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEEEDD', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Calendar size={16} />
                        </div>
                        <div>
                          <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1C1917' }}>{c.title}</h5>
                          <span style={{ fontSize: '0.74rem', color: '#78716C' }}>
                            Due in {c.daysAway} days • {c.category}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1C1917' }}>
                          {formatINR(c.amount)}
                        </span>
                        <button 
                          onClick={() => handleDeleteCommitment(c.id)}
                          style={{ color: '#EF4444', padding: '4px' }}
                          title="Delete commitment"
                        >
                          <Trash2 size={15} />
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
            <div>
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1C1917', marginBottom: '4px' }}>
                  Starting Bank Balance & Safety Cushion
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#78716C' }}>
                  Your live balance is strictly: <code>Starting Balance + Incomes - Expenses</code>. Adjust your baseline here at any time.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#FAF8F4', padding: '16px', borderRadius: '14px', border: '1px solid #EFE8DF' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#1C1917', marginBottom: '6px' }}>
                    Starting Bank Balance (₹)
                  </label>
                  <input 
                    type="number"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6CCC2', fontSize: '1.2rem', fontWeight: 800, color: '#1C1917' }}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#78716C', marginTop: '4px', display: 'block' }}>
                    Current liquid bank account balance
                  </span>
                </div>

                <div style={{ background: '#FAF8F4', padding: '16px', borderRadius: '14px', border: '1px solid #EFE8DF' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#1C1917', marginBottom: '6px' }}>
                    Safety Buffer Target (₹)
                  </label>
                  <input 
                    type="number"
                    value={safetyBuffer}
                    onChange={(e) => setSafetyBuffer(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6CCC2', fontSize: '1.2rem', fontWeight: 800, color: '#10B981' }}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#78716C', marginTop: '4px', display: 'block' }}>
                    Protected emergency buffer (never spent)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid #EFE8DF',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          background: '#FCFAF7'
        }}>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSaveAndClose}>
            <Check size={16} />
            <span>Save Profile & Recalculate Cashflow</span>
          </button>
        </div>
      </div>
    </div>
  );
}
