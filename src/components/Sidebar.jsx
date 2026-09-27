"use client";

import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  TrendingUp, 
  Sliders, 
  Dna, 
  ShieldAlert, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../services/i18n.jsx';

export default function Sidebar({ activeTab, setActiveTab, shortfallRisk, pendingActionsCount }) {
  const { t, language } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('nav_dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'paisatwin', label: t('nav_paisatwin', 'PaisaTwin'), icon: Dna },
    { id: 'transactions', label: t('nav_transactions', 'Transactions'), icon: ArrowLeftRight },
    { id: 'forecast', label: t('nav_forecast', 'Forecast'), icon: TrendingUp },
    { id: 'scenarios', label: t('nav_scenarios', 'Scenarios'), icon: Sliders },
    { id: 'insights', label: t('nav_insights', 'Insights'), icon: Sparkles },
    { 
      id: 'actions', 
      label: t('nav_actions', 'Actions'), 
      icon: ShieldAlert,
      badge: pendingActionsCount > 0 ? pendingActionsCount : (shortfallRisk === 'Shortfall Risk' ? '!' : null),
      badgeDanger: shortfallRisk === 'Shortfall Risk'
    },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Logo — Matches Landing Page Navbar exactly */}
      <Link
        href="/"
        className="group flex items-center gap-2 text-ink focus:outline-none mb-8 px-2 py-1"
        title="Return to Landing Page"
      >
        <span className="font-accent text-xs tracking-[0.2em] uppercase font-bold text-ink">
          PAISAPULSE
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-coral transition-transform group-hover:scale-125" />
        <span className="text-[11px] font-accent text-ink-muted uppercase tracking-wider pl-2 border-l border-line-medium">
          Guardian
        </span>
      </Link>

      {/* Subtle section label */}
      <div className="px-2 mb-3 text-[10px] font-accent uppercase tracking-widest text-ink-subtle">
        {language === 'hinglish' ? 'Kharche Ka Hisaab' : 'Overview'}
      </div>

      {/* Navigation */}
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
              <Icon size={16} strokeWidth={isActive ? 2.2 : 1.7} />
              <span className="font-sans text-[13px]">{item.label}</span>
              {item.badge && (
                <span className={`nav-badge ${item.badgeDanger ? 'danger' : ''}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quiet, Editorial Guardian Link (Replaces heavy dark card) */}
      <div 
        onClick={() => setActiveTab('guardian')}
        className={`sidebar-guardian-link ${activeTab === 'guardian' ? 'border-coral/50 bg-cream' : ''}`}
        title="Open AI Guardian Chat"
      >
        <div className="guardian-title">
          <Sparkles size={12} className="text-coral" />
          <span>{language === 'hinglish' ? 'AI Guardian (रक्षक)' : 'AI Guardian'}</span>
        </div>
        <div className="guardian-subtitle">
          {language === 'hinglish'
            ? 'Poochhein sawaal, check karein purchase, cashflow test karein.'
            : 'Ask questions, test purchases, or simulate cashflow anytime.'}
        </div>
      </div>
    </aside>
  );
}
