import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  ShoppingBag,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { simulateAffordability, formatINR } from '../engine/cashflowEngine';
import { soundFX } from '../engine/audioEffects';
import { useLanguage } from '../services/i18n.jsx';

export default function CanIAffordModal({
  isOpen,
  onClose,
  currentBalance,
  upcomingIncome = [],
  upcomingCommitments = [],
  safetyBuffer = 3000,
  burnRateDaily = 420
}) {
  const { t, language } = useLanguage();
  const [spendAmount, setSpendAmount] = useState('3500');
  const [itemTitle, setItemTitle] = useState('New Headphones / Sneakers');
  const [itemCategory, setItemCategory] = useState('Shopping');

  if (!isOpen) return null;

  const numAmount = parseFloat(spendAmount) || 0;
  const simulation = simulateAffordability({
    amount: numAmount,
    category: itemCategory,
    title: itemTitle,
    currentBalance,
    upcomingIncome,
    upcomingCommitments,
    safetyBuffer,
    burnRateDaily
  });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(28, 25, 23, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 120,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '540px',
        maxHeight: '90vh',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
        border: '1px solid #EFE8DF',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'modalSlideIn 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #EFE8DF',
          background: '#FCFAF7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1C1917', lineHeight: 1.2 }}>
                {t('modal_afford_title', 'Can I Afford This Purchase?')}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#78716C' }}>
                {t('modal_afford_sub', 'Instant liquidity & safety buffer impact simulator')}
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#F5EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={15} color="#78716C" />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
          {/* Input Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                {t('modal_afford_amount_label', 'How much do you want to spend? (₹) *')}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#EA580C', fontSize: '1.1rem' }}>
                  ₹
                </span>
                <input 
                  type="number"
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  placeholder="3500"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 30px',
                    borderRadius: '10px',
                    border: '1.5px solid #D6CCC2',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#1C1917',
                    background: '#FAF8F4',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                {t('modal_afford_cat_label', 'Category')}
              </label>
              <select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #D6CCC2',
                  fontSize: '0.86rem',
                  background: '#FAF8F4',
                  outline: 'none'
                }}
              >
                <option value="Shopping">Shopping / Gadgets</option>
                <option value="Food">Food / Dining Out</option>
                <option value="Travel">Travel / Trip</option>
                <option value="Entertainment">Entertainment / Leisure</option>
                <option value="Other">Other Discretionary</option>
              </select>
            </div>
          </div>

          {/* Quick preset chips */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {[800, 1500, 3500, 6000, 10000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setSpendAmount(val.toString());
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: numAmount === val ? '#EA580C' : '#F5EFE6',
                  color: numAmount === val ? '#FFF' : '#57534E',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                ₹{val.toLocaleString('en-IN')}
              </button>
            ))}
          </div>

          {/* SIMULATION VERDICT BOX */}
          <div style={{
            background: simulation.bufferImpact === 'CRITICAL' ? '#FEF2F2' : simulation.bufferImpact === 'HIGH' ? '#FFFBEB' : '#ECFDF5',
            border: `1.5px solid ${simulation.bufferImpact === 'CRITICAL' ? '#FECACA' : simulation.bufferImpact === 'HIGH' ? '#FDE68A' : '#A7F3D0'}`,
            borderRadius: '16px',
            padding: '16px 18px',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {simulation.bufferImpact === 'CRITICAL' ? (
                  <AlertTriangle size={20} color="#EF4444" />
                ) : simulation.bufferImpact === 'HIGH' ? (
                  <AlertTriangle size={20} color="#D97706" />
                ) : (
                  <CheckCircle2 size={20} color="#059669" />
                )}
                <span style={{ fontSize: '1rem', fontWeight: 900, color: simulation.verdictColor }}>
                  {simulation.verdict}
                </span>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                background: simulation.bufferImpact === 'CRITICAL' ? '#EF4444' : simulation.bufferImpact === 'HIGH' ? '#F59E0B' : '#10B981',
                color: '#FFF'
              }}>
                Buffer Impact: {simulation.bufferImpact}
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#1C1917', lineHeight: 1.45, fontWeight: 600, marginBottom: '10px' }}>
              {simulation.reasoning}
            </p>

            <div style={{
              background: '#FFFFFF',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '0.8rem',
              color: '#44403C',
              border: '1px solid rgba(0,0,0,0.06)'
            }}>
              <strong style={{ color: '#1C1917' }}>PaisaPulse Recommendation:</strong> {simulation.recommendation}
            </div>
          </div>

          {/* Mathematical Impact Breakdown */}
          <div style={{
            background: '#FAF8F4',
            borderRadius: '14px',
            padding: '14px 16px',
            border: '1px solid #EFE8DF'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1C1917', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={14} color="#EA580C" />
              <span>Cashflow Timeline Impact</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '8px 10px', background: '#FFF', borderRadius: '8px', border: '1px solid #EFE8DF' }}>
                <span style={{ fontSize: '0.72rem', color: '#78716C', display: 'block' }}>Lowest Balance (Baseline)</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10B981' }}>
                  {formatINR(simulation.baselineMin)}
                </span>
              </div>

              <div style={{ padding: '8px 10px', background: '#FFF', borderRadius: '8px', border: '1px solid #EFE8DF' }}>
                <span style={{ fontSize: '0.72rem', color: '#78716C', display: 'block' }}>Lowest Balance (If Bought)</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: simulation.newMin < safetyBuffer ? '#EF4444' : '#10B981' }}>
                  {formatINR(simulation.newMin)}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '0.74rem', color: '#78716C' }}>
              Your protected safety buffer is set to <strong>{formatINR(safetyBuffer)}</strong>.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #EFE8DF',
          background: '#FCFAF7',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button 
            className="btn-primary"
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            style={{ fontSize: '0.86rem', padding: '8px 18px' }}
          >
            {t('modal_afford_close', 'Got It, Close Simulator')}
          </button>
        </div>
      </div>
    </div>
  );
}
