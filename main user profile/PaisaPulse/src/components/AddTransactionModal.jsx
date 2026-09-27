import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Sparkles, 
  AlertTriangle,
  Repeat,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { inferCategoryAndType } from '../engine/csvParser';
import { CATEGORIES } from '../engine/types';
import { formatINR } from '../engine/cashflowEngine';
import { soundFX } from '../engine/audioEffects';

export default function AddTransactionModal({ 
  isOpen, 
  onClose, 
  onAddTransaction,
  existingTransactions = [] 
}) {
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [paymentMethod, setPaymentMethod] = useState('UPI @okhdfcbank');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurring, setRecurring] = useState(false);
  const [essential, setEssential] = useState(false);
  const [confidence, setConfidence] = useState(0.95);

  if (!isOpen) return null;

  // Real-time auto-categorization as user types
  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    setDescription(val);
    if (!merchant || merchant === description) {
      setMerchant(val);
    }
    const inferred = inferCategoryAndType(val, merchant, type, parseFloat(amount) || 0);
    setCategory(inferred.category);
    setType(inferred.type);
    setRecurring(inferred.recurring);
    setEssential(inferred.essential);
    setConfidence(inferred.confidence);
  };

  const handleMerchantChange = (e) => {
    const val = e.target.value;
    setMerchant(val);
    const inferred = inferCategoryAndType(description, val, type, parseFloat(amount) || 0);
    setCategory(inferred.category);
    setType(inferred.type);
  };

  // Real-time duplicate check
  const isDuplicateSuspect = existingTransactions.some(tx => {
    if (!amount || !description) return false;
    return (
      (tx.description.toLowerCase().trim() === description.toLowerCase().trim() ||
       tx.merchant.toLowerCase().trim() === merchant.toLowerCase().trim()) &&
      Math.abs(tx.amount) === Math.abs(parseFloat(amount) || 0) &&
      tx.date === date
    );
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmt = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmt) || parsedAmt <= 0) return;

    soundFX.playSuccess();

    const newTx = {
      id: `tx_man_${Date.now()}`,
      date,
      description: description.trim(),
      merchant: (merchant || description).trim(),
      amount: parsedAmt,
      type,
      category,
      paymentMethod,
      recurring,
      essential,
      confidence,
      source: 'manual',
      isDuplicateSuspect
    };

    onAddTransaction(newTx);
    onClose();
  };

  // Quick preset shortcuts
  const injectPreset = (preset) => {
    setDescription(preset.desc);
    setMerchant(preset.merch);
    setAmount(preset.amt.toString());
    setType(preset.type);
    setCategory(preset.cat);
    setPaymentMethod(preset.channel);
    setRecurring(!!preset.rec);
    setEssential(!!preset.ess);
    soundFX.playClick();
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
      zIndex: 105,
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #EFE8DF',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 26px',
          borderBottom: '1px solid #EFE8DF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FCFAF7'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1C1917' }}>
              Quick-Add Manual Transaction
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#78716C' }}>
              Immediately updates current balance, safe-to-spend & forecast
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

        <form onSubmit={handleSubmit} style={{ padding: '20px 26px 24px' }}>
          {/* Quick presets */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#78716C', textTransform: 'uppercase' }}>
              Quick Indian Presets:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => injectPreset({ desc: 'Swiggy Dinner', merch: 'Swiggy', amt: 450, type: 'expense', cat: 'Food', channel: 'UPI @icici', rec: false, ess: false })}
                style={{ fontSize: '0.74rem', background: '#FFF7ED', color: '#EA580C', border: '1px solid #FFEDD5', padding: '4px 10px', borderRadius: '999px', fontWeight: 700 }}
              >
                Swiggy ₹450
              </button>
              <button
                type="button"
                onClick={() => injectPreset({ desc: 'Uber Campus Ride', merch: 'Uber', amt: 230, type: 'expense', cat: 'Transport', channel: 'UPI @okhdfcbank', rec: false, ess: true })}
                style={{ fontSize: '0.74rem', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '4px 10px', borderRadius: '999px', fontWeight: 700 }}
              >
                Uber ₹230
              </button>
              <button
                type="button"
                onClick={() => injectPreset({ desc: 'Netflix Auto-Debit', merch: 'Netflix India', amt: 649, type: 'expense', cat: 'Subscriptions', channel: 'Auto-Debit', rec: true, ess: false })}
                style={{ fontSize: '0.74rem', background: '#FCE7F3', color: '#DB2777', border: '1px solid #FBCFE8', padding: '4px 10px', borderRadius: '999px', fontWeight: 700 }}
              >
                Netflix ₹649
              </button>
              <button
                type="button"
                onClick={() => injectPreset({ desc: 'Internship Stipend', merch: 'TechCorp', amt: 25000, type: 'income', cat: 'Stipend', channel: 'IMPS Direct Deposit', rec: true, ess: true })}
                style={{ fontSize: '0.74rem', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: '999px', fontWeight: 700 }}
              >
                Stipend +₹25k
              </button>
            </div>
          </div>

          {/* Duplicate Warning in real-time */}
          {isDuplicateSuspect && (
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '0.78rem',
              color: '#92400E',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px'
            }}>
              <AlertTriangle size={15} />
              <span>Warning: A transaction with this amount and merchant already exists today.</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                Description / Item *
              </label>
              <input 
                type="text"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="e.g. Swiggy Gourmet Burger"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #EFE8DF',
                  background: '#FAF8F4',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                Amount (₹) *
              </label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 450"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #EFE8DF',
                  background: '#FAF8F4',
                  outline: 'none',
                  fontWeight: 800,
                  fontSize: '1.05rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                Merchant / Counterparty
              </label>
              <input 
                type="text"
                value={merchant}
                onChange={handleMerchantChange}
                placeholder="e.g. Swiggy"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #EFE8DF',
                  background: '#FAF8F4',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                Type *
              </label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #EFE8DF',
                  background: '#FAF8F4',
                  outline: 'none',
                  fontWeight: 700
                }}
              >
                <option value="expense">Expense (-)</option>
                <option value="income">Income (+)</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                <span>Category (14 Supported)</span>
                <Sparkles size={12} color="#EA580C" />
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #EFE8DF',
                  background: '#FAF8F4',
                  outline: 'none',
                  fontWeight: 600
                }}
              >
                {Object.keys(CATEGORIES).map(catKey => (
                  <option key={catKey} value={catKey}>{catKey}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                Payment Method
              </label>
              <input 
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="UPI @okhdfcbank"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #EFE8DF',
                  background: '#FAF8F4',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Toggles for Recurring & Essential */}
          <div style={{
            display: 'flex',
            gap: '16px',
            background: '#FAF8F4',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid #EFE8DF',
            marginBottom: '20px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#1C1917' }}>
              <input 
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
              />
              <Repeat size={15} color="#EA580C" />
              <span>Recurring Commitment (e.g. Rent, Sub)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#1C1917' }}>
              <input 
                type="checkbox"
                checked={essential}
                onChange={(e) => setEssential(e.target.checked)}
              />
              <ShieldCheck size={15} color="#10B981" />
              <span>Essential Need (Protected in Buffer)</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              type="button" 
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
            >
              <PlusCircle size={16} />
              <span>Add & Recalculate Dashboard</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
