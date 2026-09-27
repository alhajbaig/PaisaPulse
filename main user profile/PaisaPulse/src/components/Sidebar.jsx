import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  TrendingUp, 
  Sliders, 
  Dna, 
  ShieldAlert, 
  Sparkles,
  Zap,
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '../services/i18n.jsx';

export default function Sidebar({ activeTab, setActiveTab, shortfallRisk, pendingActionsCount }) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('nav_dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'paisatwin', label: t('nav_paisatwin', 'PaisaTwin 🧬'), icon: Dna },
    { id: 'transactions', label: t('nav_transactions', 'Transactions'), icon: ArrowLeftRight },
    { id: 'forecast', label: t('nav_forecast', 'Forecast'), icon: TrendingUp },
    { id: 'scenarios', label: t('nav_scenarios', 'Scenarios'), icon: Sliders },
    { id: 'insights', label: t('nav_insights', 'Insights'), icon: Sparkles },
    { 
      id: 'actions', 
      label: t('nav_actions', 'Actions & Learning'), 
      icon: ShieldAlert,
      badge: pendingActionsCount > 0 ? pendingActionsCount : (shortfallRisk === 'Shortfall Risk' ? '!' : null),
      badgeDanger: shortfallRisk === 'Shortfall Risk'
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-badge">
          <Zap size={20} strokeWidth={2.5} />
        </div>
        <div className="logo-text">
          Paisa<span>Pulse</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`nav-badge ${item.badgeDanger ? 'danger' : ''}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Floating Guardian Card at bottom */}
      <div 
        className="sidebar-guardian-card"
        onClick={() => setActiveTab('guardian')}
        style={{ cursor: 'pointer' }}
        title="Open AI Guardian Chat"
      >
        <div className="guardian-icon-pill">
          <Sparkles size={16} />
        </div>
        <div className="guardian-title">{t('sidebar_guardian_title', 'Your AI Financial Guardian')}</div>
        <div className="guardian-subtitle">
          {t('sidebar_guardian_sub', 'Always watching, always looking ahead. Click to ask questions.')}
        </div>
      </div>
    </aside>
  );
}
