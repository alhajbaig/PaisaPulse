import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  PlayCircle, 
  Sparkles,
  LogIn,
  LogOut,
  UserPlus,
  ChevronDown,
  UserCheck,
  Compass,
  Database
} from 'lucide-react';
import { soundFX } from '../engine/audioEffects';
import { useLanguage } from '../services/i18n.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import { isSupabaseConfigured } from '../services/supabaseClient.js';

export default function Header({ 
  currentUser,
  onOpenAuthModal,
  onOpenOnboarding,
  onOpenSupabase,
  onLogout,
  onToggleDemoBar, 
  demoBarOpen,
  onOpenNotifications,
  unreadAlertCount = 2,
  setActiveTab
}) {
  const { t, language } = useLanguage();
  const [muted, setMuted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

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

  const userName = currentUser?.name || 'Kartik Sharma';
  const userEmail = currentUser?.email || 'kartik@pulse.in';
  const firstName = userName.split(' ')[0] || 'Kartik';
  const userRole = currentUser?.role || 'College Student & Tech Intern';
  const userAvatar = currentUser?.avatar || userName.charAt(0) || 'K';
  const avatarBg = currentUser?.avatarBg || '#1C1917';

  return (
    <header className="top-header">
      <div className="header-greeting">
        <h1>
          {t('header_greeting', `Hello, ${firstName}! Welcome to PaisaPulse`, { name: firstName })}
        </h1>
        <p>{t('header_role_badge', `Dynamic Liquidity Guardian • ${userRole}`, { role: userRole })}</p>
      </div>

      <div className="header-actions">
        {/* Prominent Dual Language Switcher: English / Hinglish */}
        <LanguageSwitcher />

        {/* Supabase Cloud DB Connection Button */}
        <button
          onClick={() => {
            soundFX.playClick();
            if (onOpenSupabase) onOpenSupabase();
          }}
          className="btn-secondary"
          style={{
            padding: '6px 12px',
            fontSize: '0.8rem',
            gap: '6px',
            borderColor: isSupabaseConfigured() ? '#A7F3D0' : '#EFE8DF',
            background: isSupabaseConfigured() ? '#ECFDF5' : '#FFFFFF',
            color: isSupabaseConfigured() ? '#065F46' : '#57534E'
          }}
          title="Supabase Cloud Database Status & Configuration"
        >
          <Database size={15} color={isSupabaseConfigured() ? '#059669' : '#EA580C'} />
          <span>{isSupabaseConfigured() ? 'Supabase Live' : (language === 'hinglish' ? 'DB Connect' : 'Connect DB')}</span>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: isSupabaseConfigured() ? '#10B981' : '#F59E0B'
          }} />
        </button>

        {/* Prominent Live Demonstration Button */}
        <button 
          className="live-demo-btn"
          onClick={() => {
            soundFX.playClick();
            onToggleDemoBar();
          }}
          title="Open interactive 8-step live scenario demonstration"
        >
          <PlayCircle size={17} />
          <span>{demoBarOpen ? t('btn_hide_demo', 'Hide Scenario Tour') : t('btn_live_demo', 'Live Demo Scenario (1–8)')}</span>
        </button>

        {/* Switch / Login Button */}
        <button 
          className="btn-secondary"
          onClick={() => {
            soundFX.playClick();
            onOpenAuthModal('login');
          }}
          style={{ padding: '6px 14px', fontSize: '0.82rem', gap: '6px' }}
          title="Log In or Switch Account"
        >
          <LogIn size={15} color="#EA580C" />
          <span>{t('btn_login_switch', 'Log In / Switch')}</span>
        </button>

        {/* Quick Sign Up Button */}
        <button 
          className="btn-secondary"
          onClick={() => {
            soundFX.playClick();
            onOpenAuthModal('signup');
          }}
          style={{ padding: '6px 14px', fontSize: '0.82rem', gap: '6px' }}
          title="Create a new account"
        >
          <UserPlus size={15} color="#059669" />
          <span>{t('btn_signup', 'Sign Up')}</span>
        </button>

        {/* 5-Step Setup Guide Trigger */}
        {onOpenOnboarding && (
          <button 
            className="btn-secondary"
            onClick={() => {
              soundFX.playClick();
              onOpenOnboarding();
            }}
            style={{ padding: '6px 12px', fontSize: '0.82rem', gap: '6px', borderColor: '#FED7AA', background: '#FFFDFB' }}
            title="Open 5-step guided money setup"
          >
            <Compass size={15} color="#EA580C" />
            <span>Setup Guide</span>
          </button>
        )}

        {/* AI Guardian Direct Trigger */}
        <button 
          className="header-icon-btn"
          onClick={() => {
            soundFX.playClick();
            setActiveTab('guardian');
          }}
          title="Open AI Guardian Chat"
        >
          <Sparkles size={18} color="#EA580C" />
        </button>

        {/* Sound toggle */}
        <button 
          className="header-icon-btn"
          onClick={toggleSound}
          title={muted ? 'Enable sound feedback' : 'Mute sound feedback'}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Notifications */}
        <button 
          className="header-icon-btn"
          onClick={() => {
            soundFX.playClick();
            onOpenNotifications();
          }}
          title="View Notifications & Risk Alerts"
        >
          <Bell size={18} />
          {unreadAlertCount > 0 && <span className="header-icon-badge" />}
        </button>

        {/* User Profile with Dropdown Menu */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <div 
            className="header-user-avatar"
            onClick={() => {
              soundFX.playClick();
              setUserMenuOpen(!userMenuOpen);
            }}
            style={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px',
              borderRadius: '20px',
              background: userMenuOpen ? 'rgba(0,0,0,0.05)' : 'transparent',
              transition: 'background 0.2s'
            }}
            title="User Profile & Account Options"
          >
            <div 
              className="user-avatar-circle"
              style={{ backgroundColor: avatarBg }}
            >
              {userAvatar}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span className="user-name" style={{ lineHeight: 1.2 }}>{userName}</span>
              <span style={{ fontSize: '0.7rem', color: '#78716C' }}>{userEmail}</span>
            </div>
            <ChevronDown size={14} color="#78716C" style={{ marginLeft: '2px' }} />
          </div>

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              width: '260px',
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 12px 32px -4px rgba(28, 25, 23, 0.18)',
              border: '1px solid #EFE8DF',
              padding: '12px',
              zIndex: 90,
              animation: 'modalSlideIn 0.15s ease-out'
            }}>
              {/* Profile summary */}
              <div style={{ 
                padding: '8px 10px 12px', 
                borderBottom: '1px solid #EFE8DF',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div 
                    style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      background: avatarBg, 
                      color: '#FFF', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem'
                    }}
                  >
                    {userAvatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1C1917' }}>{userName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#78716C' }}>{userEmail}</div>
                    <div style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 600, marginTop: '2px' }}>{userRole}</div>
                  </div>
                </div>
              </div>

              {/* Menu Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenAuthModal('login');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#1C1917',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FAF7F2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogIn size={16} color="#EA580C" />
                  <span>Log In to Another Account</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenAuthModal('signup');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#1C1917',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FAF7F2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <UserPlus size={16} color="#059669" />
                  <span>Sign Up (New Account)</span>
                </button>

                <div style={{ height: '1px', background: '#EFE8DF', margin: '4px 0' }} />

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#DC2626',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={16} color="#DC2626" />
                  <span>Log Out of Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
