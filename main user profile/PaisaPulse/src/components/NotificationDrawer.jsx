import React from 'react';
import { 
  X, 
  AlertTriangle, 
  Bell, 
  ShieldCheck, 
  Info, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { soundFX } from '../engine/audioEffects';

export default function NotificationDrawer({ 
  isOpen, 
  onClose, 
  alerts, 
  onDismissAlert, 
  onSelectAction 
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(28, 25, 23, 0.4)',
      backdropFilter: 'blur(3px)',
      zIndex: 90,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        height: '100%',
        background: '#FFFFFF',
        boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.25s ease'
      }}>
        {/* Header */}
        <div style={{
          padding: '22px 24px',
          borderBottom: '1px solid #EFE8DF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FCFAF7'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FEEEDD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
              <Bell size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1C1917' }}>Guardian Notifications</h3>
              <p style={{ fontSize: '0.78rem', color: '#78716C' }}>Live liquidity & shortfall alerts</p>
            </div>
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

        {/* Alerts list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#A8A29E' }}>
              <ShieldCheck size={48} color="#10B981" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 700, color: '#44403C' }}>All Clear!</p>
              <p style={{ fontSize: '0.82rem' }}>No active cashflow alerts or shortfall threats detected.</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div 
                key={alert.id}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: `1px solid ${alert.severity === 'high' ? '#FECACA' : '#EFE8DF'}`,
                  background: alert.severity === 'high' ? '#FEF2F2' : '#FFFDF9',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {alert.severity === 'high' ? (
                      <AlertTriangle size={16} color="#EF4444" />
                    ) : (
                      <Sparkles size={16} color="#EA580C" />
                    )}
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: alert.severity === 'high' ? '#DC2626' : '#1C1917' }}>
                      {alert.title}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      soundFX.playClick();
                      onDismissAlert(alert.id);
                    }}
                    style={{ color: '#A8A29E', fontSize: '0.75rem' }}
                  >
                    <X size={14} />
                  </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#57534E', lineHeight: '1.45', marginBottom: '10px' }}>
                  {alert.message}
                </p>
                {alert.actionLabel && (
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      onSelectAction(alert.actionId);
                      onClose();
                    }}
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: alert.severity === 'high' ? '#EF4444' : '#EA580C',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{alert.actionLabel}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
