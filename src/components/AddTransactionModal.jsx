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
    <div className="fixed inset-0 bg-[#171512]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-ivory border border-line-medium rounded-2xl w-full max-w-lg shadow-lifted overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-6 border-b border-line-medium flex items-start justify-between bg-ivory">
          <div className="space-y-1">
            <span className="text-[11px] font-accent uppercase tracking-widest text-coral font-bold block">
              Ledger Entry
            </span>
            <h3 className="font-editorial text-2xl text-ink font-normal">
              Quick-Add Transaction
            </h3>
            <p className="font-sans text-xs text-ink-muted">
              Instantly recalibrates current balance, safe-to-spend, and timeline forecast.
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick presets */}
          <div>
            <span className="text-[11px] font-accent uppercase tracking-wider text-ink-muted font-bold block mb-2">
              Quick Presets
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => injectPreset({ desc: 'Swiggy Dinner', merch: 'Swiggy', amt: 450, type: 'expense', cat: 'Food', channel: 'UPI @icici', rec: false, ess: false })}
                className="px-3 py-1 rounded-full text-xs font-accent bg-ivory border border-line-medium text-ink-muted hover:border-line-dark hover:text-ink transition-colors cursor-pointer"
              >
                Swiggy ₹450
              </button>
              <button
                type="button"
                onClick={() => injectPreset({ desc: 'Uber Campus Ride', merch: 'Uber', amt: 230, type: 'expense', cat: 'Transport', channel: 'UPI @okhdfcbank', rec: false, ess: true })}
                className="px-3 py-1 rounded-full text-xs font-accent bg-ivory border border-line-medium text-ink-muted hover:border-line-dark hover:text-ink transition-colors cursor-pointer"
              >
                Uber ₹230
              </button>
              <button
                type="button"
                onClick={() => injectPreset({ desc: 'Netflix Auto-Debit', merch: 'Netflix India', amt: 649, type: 'expense', cat: 'Subscriptions', channel: 'Auto-Debit', rec: true, ess: false })}
                className="px-3 py-1 rounded-full text-xs font-accent bg-ivory border border-line-medium text-ink-muted hover:border-line-dark hover:text-ink transition-colors cursor-pointer"
              >
                Netflix ₹649
              </button>
              <button
                type="button"
                onClick={() => injectPreset({ desc: 'Internship Stipend', merch: 'TechCorp', amt: 25000, type: 'income', cat: 'Stipend', channel: 'IMPS Direct Deposit', rec: true, ess: true })}
                className="px-3 py-1 rounded-full text-xs font-accent bg-ivory border border-line-medium text-ink-muted hover:border-line-dark hover:text-ink transition-colors cursor-pointer"
              >
                Stipend +₹25k
              </button>
            </div>
          </div>

          {/* Duplicate Warning */}
          {isDuplicateSuspect && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-sans text-amber-900 flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
              <span>A transaction with this amount and merchant already exists today.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans font-semibold text-ink mb-1.5">
                Description / Item *
              </label>
              <input 
                type="text"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="e.g. Swiggy Gourmet Burger"
                required
                className="w-full px-3 py-2 rounded-xl border border-line-medium bg-cream text-ink font-sans text-sm focus:outline-none focus:border-coral transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-semibold text-ink mb-1.5">
                Amount (₹) *
              </label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 450"
                required
                className="w-full px-3 py-2 rounded-xl border border-line-medium bg-cream text-ink font-accent font-semibold text-base focus:outline-none focus:border-coral transition-colors num-tabular"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans font-semibold text-ink mb-1.5">
                Merchant / Counterparty
              </label>
              <input 
                type="text"
                value={merchant}
                onChange={handleMerchantChange}
                placeholder="e.g. Swiggy"
                className="w-full px-3 py-2 rounded-xl border border-line-medium bg-cream text-ink font-sans text-sm focus:outline-none focus:border-coral transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-semibold text-ink mb-1.5">
                Type *
              </label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-line-medium bg-cream text-ink font-sans text-sm focus:outline-none focus:border-coral transition-colors"
              >
                <option value="expense">Expense (-)</option>
                <option value="income">Income (+)</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-sans font-semibold text-ink mb-1.5">
                <span>Category</span>
                <Sparkles size={11} className="text-coral" />
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-line-medium bg-cream text-ink font-sans text-sm focus:outline-none focus:border-coral transition-colors"
              >
                {Object.keys(CATEGORIES).map(catKey => (
                  <option key={catKey} value={catKey}>{catKey}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-sans font-semibold text-ink mb-1.5">
                Payment Method
              </label>
              <input 
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="UPI @okhdfcbank"
                className="w-full px-3 py-2 rounded-xl border border-line-medium bg-cream text-ink font-sans text-sm focus:outline-none focus:border-coral transition-colors"
              />
            </div>
          </div>

          {/* Toggles for Recurring & Essential */}
          <div className="flex flex-col sm:flex-row gap-3 bg-cream/40 p-3 rounded-xl border border-line-medium">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-ink">
              <input 
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="rounded accent-coral"
              />
              <Repeat size={13} className="text-coral" />
              <span>Recurring Commitment</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-ink sm:ml-4">
              <input 
                type="checkbox"
                checked={essential}
                onChange={(e) => setEssential(e.target.checked)}
                className="rounded accent-coral"
              />
              <ShieldCheck size={13} className="text-emerald-700" />
              <span>Essential Need</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-line-medium text-xs font-sans text-ink-muted hover:text-ink hover:border-line-dark transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 rounded-full bg-coral text-white text-xs font-sans font-semibold hover:bg-coral-dark transition-all flex items-center gap-1.5 cursor-pointer shadow-subtle"
            >
              <PlusCircle size={14} />
              <span>Add to Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
