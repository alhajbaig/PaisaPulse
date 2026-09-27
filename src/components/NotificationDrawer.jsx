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
    <div className="fixed inset-0 bg-[#171512]/40 backdrop-blur-sm z-50 flex justify-end animate-fadeIn">
      <div className="w-full max-w-sm h-full bg-ivory border-l border-line-medium shadow-lifted flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="p-6 border-b border-line-medium flex items-center justify-between bg-ivory">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cream border border-line-light flex items-center justify-center text-coral">
              <Bell size={15} />
            </div>
            <div>
              <h3 className="font-editorial text-xl text-ink font-normal">Guardian Alerts</h3>
              <p className="font-sans text-[11px] text-ink-muted">Live liquidity & shortfall monitors</p>
            </div>
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

        {/* Alerts list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-16 text-ink-muted space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck size={20} />
              </div>
              <p className="font-sans text-xs font-semibold text-ink">All Clear</p>
              <p className="font-sans text-[11px] text-ink-muted">No active cashflow alerts or shortfall threats detected.</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  alert.severity === 'high' 
                    ? 'border-red-200 bg-red-50/30' 
                    : 'border-line-medium bg-ivory shadow-subtle'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {alert.severity === 'high' ? (
                      <AlertTriangle size={15} className="text-red-600 flex-shrink-0" />
                    ) : (
                      <Sparkles size={15} className="text-coral flex-shrink-0" />
                    )}
                    <span className="font-sans text-xs font-bold text-ink">
                      {alert.title}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      soundFX.playClick();
                      onDismissAlert(alert.id);
                    }}
                    className="text-ink-muted hover:text-ink transition-colors p-1 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>
                <p className="font-sans text-xs text-ink-muted leading-relaxed mb-3">
                  {alert.message}
                </p>
                {alert.actionLabel && (
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      onSelectAction(alert.actionId);
                      onClose();
                    }}
                    className="text-xs font-sans font-semibold text-coral hover:text-coral-dark inline-flex items-center gap-1 transition-colors cursor-pointer"
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
