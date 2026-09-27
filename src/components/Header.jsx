"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  Volume2,
  VolumeX,
  ChevronDown,
  User,
  Settings,
  Shield,
  Cloud,
  LogOut,
  PlayCircle,
  ArrowUpRight,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { soundFX } from '../engine/audioEffects';
import { useLanguage } from '../services/i18n.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import { isSupabaseConfigured } from '../services/supabaseClient.js';

export default function Header({
  currentUser,
  activeTab = 'dashboard',
  onOpenAuthModal,
  onOpenOnboarding,
  onOpenSupabase,
  onLogout,
  onToggleDemoBar,
  demoBarOpen,
  onOpenNotifications,
  unreadAlertCount = 0,
  setActiveTab,
  isSyncing = false,
  onManualSync,
  onSwitchToPhoneAccount
}) {
  const { t, language } = useLanguage();
  const [muted, setMuted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const tabTitles = {
    dashboard: language === 'hinglish' ? 'Dashboard (हिसाब)' : 'Dashboard',
    paisatwin: language === 'hinglish' ? 'PaisaTwin 🧬 (डिजिटल ट्विन)' : 'PaisaTwin',
    twin: language === 'hinglish' ? 'PaisaTwin 🧬 (डिजिटल ट्विन)' : 'PaisaTwin',
    transactions: language === 'hinglish' ? 'Transactions (लेन-देन)' : 'Transactions',
    forecast: language === 'hinglish' ? '14-Day Forecast (भविष्य)' : 'Forecast',
    scenarios: language === 'hinglish' ? 'What-If Scenarios (अनुमान)' : 'What-If Scenarios',
    guardian: language === 'hinglish' ? 'Guardian AI (रक्षक)' : 'Guardian AI',
    insights: language === 'hinglish' ? 'Insights & Spend Value (अंदर का सच)' : 'Insights',
    actions: language === 'hinglish' ? 'Actions & Sikho (कदम)' : 'Interventions'
  };

  const toggleSound = () => {
    const isMuted = soundFX.toggleMute();
    setMuted(isMuted);
    if (!isMuted) soundFX.playClick();
  };

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const userName = currentUser?.name || 'Account';
  const userEmail = currentUser?.email || '';
  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Account';
  const userAvatar = currentUser?.avatar || (currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U');

  return (
    <header className="h-16 px-6 sm:px-8 border-b border-line-light bg-ivory/85 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between transition-colors">
      {/* LEFT: Clean Brand / Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link 
          href="/" 
          className="text-xs font-accent text-ink-muted hover:text-coral transition-colors tracking-widest uppercase flex items-center gap-1"
        >
          <span>PaisaPulse</span>
          <span className="text-line-medium">/</span>
        </Link>
        <span className="font-editorial text-lg text-ink font-normal">
          {tabTitles[activeTab] || 'Dashboard'}
        </span>
      </div>

      {/* RIGHT: Restrained, Essential Controls */}
      <div className="flex items-center gap-4">
        {/* Subtle Language Switcher */}
        <LanguageSwitcher />

        {/* Interactive Tour / Demo toggle (Understated) */}
        <button
          onClick={() => {
            soundFX.playClick();
            onToggleDemoBar();
          }}
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans transition-all border ${
            demoBarOpen 
              ? 'bg-coral/10 border-coral/30 text-coral font-medium' 
              : 'bg-ivory border-line-medium text-ink-muted hover:text-ink hover:border-line-dark'
          }`}
          title="Toggle interactive scenario tour"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>{demoBarOpen 
            ? (language === 'hinglish' ? 'Demo Chhupayein' : 'Hide Scenario Tour') 
            : (language === 'hinglish' ? 'Live Demo' : 'Demo Tour')}</span>
        </button>

        {/* Sound toggle (Subtle) */}
        <button 
          onClick={toggleSound}
          className="p-2 text-ink-muted hover:text-ink transition-colors"
          title={muted ? 'Enable sound' : 'Mute sound'}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

                {/* Sync Cloud button */}
        <button
          onClick={() => {
            soundFX.playClick();
            if (onManualSync) onManualSync();
          }}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans transition-all border bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 disabled:opacity-50"
          title="Synchronize live mobile app & cloud transactions"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="font-medium hidden sm:inline">
            {isSyncing 
              ? (language === 'hinglish' ? 'Sync Ho Raha...' : 'Syncing...') 
              : (language === 'hinglish' ? 'Cloud Sync' : 'Sync Cloud')}
          </span>
        </button>

        {/* Notifications */}
        <button 
          onClick={() => {
            soundFX.playClick();
            onOpenNotifications();
          }}
          className="relative p-2 text-ink-muted hover:text-ink transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral ring-2 ring-ivory" />
          )}
        </button>

        {/* Minimal Profile Trigger: [avatar] Kartik ▾ */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-cream/60 transition-colors focus:outline-none"
            aria-label="User profile menu"
          >
            <div className="w-7 h-7 rounded-full bg-ink text-ivory flex items-center justify-center text-xs font-bold font-sans">
              {userAvatar}
            </div>
            <span className="font-sans text-xs font-semibold text-ink hidden sm:inline">
              {firstName}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-ink-muted transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Minimal Editorial Profile Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-ivory border border-line-medium shadow-[0_8px_32px_rgba(23,21,18,0.06)] p-3 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
              {/* User Identity */}
              <div className="px-3 py-2">
                <div className="font-sans font-semibold text-sm text-ink">{userName}</div>
                <div className="font-accent text-xs text-ink-muted truncate">{userEmail}</div>
              </div>

              <div className="h-[1px] bg-line-light my-2" />

              {/* Menu items matching prompt spec */}
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    if (onOpenOnboarding) onOpenOnboarding();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-sans text-ink hover:bg-cream/70 transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5 text-ink-muted" />
                  <span>{language === 'hinglish' ? 'Profile & Onboarding' : 'Profile & Onboarding'}</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    if (onOpenAuthModal) onOpenAuthModal('login');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-sans text-ink hover:bg-cream/70 transition-colors text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-ink-muted" />
                  <span>{language === 'hinglish' ? 'Account Badlein / Switch' : 'Switch Account'}</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    if (onOpenNotifications) onOpenNotifications();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-sans text-ink hover:bg-cream/70 transition-colors text-left"
                >
                  <Bell className="w-3.5 h-3.5 text-ink-muted" />
                  <span>{language === 'hinglish' ? 'Notifications (सूचनाएं)' : 'Notifications'}</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    if (onOpenSupabase) onOpenSupabase();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans text-ink hover:bg-cream/70 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Cloud className="w-3.5 h-3.5 text-ink-muted" />
                    <span>{language === 'hinglish' ? 'Connected Bank Accounts' : 'Connected Accounts'}</span>
                  </div>
                  <span className={`text-[10px] font-accent uppercase ${isSupabaseConfigured() ? 'text-emerald-700 font-semibold' : 'text-ink-subtle'}`}>
                    {isSupabaseConfigured() ? 'Supabase Live' : 'Offline'}
                  </span>
                </button>
              </div>

              <div className="h-[1px] bg-line-light my-2" />

              {/* Sign out */}
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  if (onLogout) onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-sans text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === 'hinglish' ? 'Sign out (लॉग आउट)' : 'Sign out'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
