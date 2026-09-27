import React from 'react';
import { 
  X, 
  HelpCircle, 
  ShieldCheck, 
  Calendar, 
  ArrowRight, 
  CheckCircle2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { formatINR } from '../engine/cashflowEngine';
import { soundFX } from '../engine/audioEffects';
import { useLanguage } from '../services/i18n.jsx';

export default function WhyThisNumberModal({
  isOpen,
  onClose,
  safeToSpendResult
}) {
  const { t, language } = useLanguage();
  if (!isOpen || !safeToSpendResult) return null;

  const breakdown = safeToSpendResult.whyBreakdown || {};
  const currentCash = breakdown.currentCash || safeToSpendResult.effectiveCurrentBalance || 0;
  const commitments = breakdown.upcomingCommitments || safeToSpendResult.commitmentsBeforeIncome || 0;
  const safetyBuffer = breakdown.safetyBuffer || safeToSpendResult.safetyBuffer || 3000;
  const protectedMoney = breakdown.protectedMoney || (commitments + safetyBuffer);
  const spendableLiquidity = breakdown.spendableLiquidity || (currentCash - protectedMoney);
  const daysToNext = breakdown.daysToNextIncome || safeToSpendResult.nextIncomeDays || 7;
  const dailyRecommended = safeToSpendResult.safeToSpendToday || 0;
  const committedItems = safeToSpendResult.committedItems || [];
  const reliableIncome = safeToSpendResult.reliableIncome || 0;
  const potentialIncome = safeToSpendResult.potentialIncome || 0;

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
              background: '#EA580C',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1C1917', lineHeight: 1.2 }}>
                {t('modal_why_title', 'How We Calculated This Number')}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#78716C' }}>
                {t('modal_why_sub', '100% transparent, mathematical single source of truth')}
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
          {/* Result Card */}
          <div style={{
            background: '#FFF7ED',
            borderRadius: '14px',
            padding: '16px',
            border: '1.5px solid #FFEDD5',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Recommended Safe Discretionary Limit
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#EA580C', margin: '4px 0' }}>
              {formatINR(dailyRecommended)}
              <span style={{ fontSize: '0.9rem', color: '#78716C', fontWeight: 600 }}> / day</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#78716C' }}>
              Calibrated across the next {daysToNext} days until your next confirmed income.
            </p>
          </div>

          {/* Mathematical Ledger Breakdown */}
          <div style={{
            background: '#FAF8F4',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #EFE8DF',
            marginBottom: '20px'
          }}>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1C1917', marginBottom: '14px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Exact Calculation Breakdown
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: '#44403C' }}>Current Available Cash</span>
                <span style={{ fontWeight: 800, color: '#1C1917' }}>{formatINR(currentCash)}</span>
              </div>

              {reliableIncome > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#059669' }}>+ Reliable Upcoming Income (Confirmed)</span>
                  <span style={{ fontWeight: 800, color: '#059669' }}>+{formatINR(reliableIncome)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: '#DC2626' }}>- Mandatory Upcoming Commitments</span>
                <span style={{ fontWeight: 800, color: '#DC2626' }}>-{formatINR(commitments)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: '#059669' }}>- Protected Emergency Safety Buffer</span>
                <span style={{ fontWeight: 800, color: '#059669' }}>-{formatINR(safetyBuffer)}</span>
              </div>

              <div style={{ height: '1px', background: '#D6CCC2', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                <span style={{ fontWeight: 800, color: '#1C1917' }}>Net Spendable Headroom</span>
                <span style={{ fontWeight: 900, color: spendableLiquidity >= 0 ? '#10B981' : '#EF4444' }}>
                  {formatINR(spendableLiquidity)}
                </span>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#78716C', marginTop: '6px' }}>
                Allocated across <strong>{daysToNext} days</strong> with a conservative 85% safety coefficient:
                <br />
                <code style={{ background: '#EFE8DF', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', marginTop: '4px', display: 'inline-block' }}>
                  {formatINR(spendableLiquidity)} ÷ {daysToNext} days × 0.85 = {formatINR(dailyRecommended)}
                </code>
              </div>
            </div>
          </div>

          {/* Protected Bills List */}
          {committedItems.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1C1917', marginBottom: '8px' }}>
                Commitments Locked & Protected in this Window:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {committedItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#FAF8F4', borderRadius: '8px', fontSize: '0.82rem' }}>
                    <span style={{ color: '#44403C' }}>{item.title} (due in {item.daysAway} days)</span>
                    <span style={{ fontWeight: 700, color: '#EF4444' }}>-{formatINR(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conservative Policy Notice */}
          {potentialIncome > 0 && (
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '0.78rem',
              color: '#92400E',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              <AlertCircle size={16} color="#D97706" style={{ flexShrink: 0 }} />
              <div>
                <strong>Conservative Finance Note:</strong> {formatINR(potentialIncome)} in uncertain/freelance income is excluded from this daily calculation until approved by your client.
              </div>
            </div>
          )}
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
            {t('modal_why_close', 'Understood')}
          </button>
        </div>
      </div>
    </div>
  );
}
