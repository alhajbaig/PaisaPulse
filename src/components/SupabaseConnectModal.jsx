import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Copy, 
  ExternalLink, 
  Key, 
  Globe, 
  UploadCloud, 
  DownloadCloud, 
  Check,
  Shield
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection, 
  isSupabaseConfigured 
} from '../services/supabaseClient.js';
import { syncUserToSupabase, fetchUserFromSupabase } from '../services/supabaseSync.js';
import { saveUserData } from '../engine/userStore.js';
import { soundFX } from '../engine/audioEffects.js';
import { useLanguage } from '../services/i18n.jsx';

export default function SupabaseConnectModal({ isOpen, onClose, currentUser, onUserUpdated }) {
  const { language } = useLanguage();
  const isHinglish = language === 'hinglish';

  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'schema'

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url || '');
      setAnonKey(cfg.anonKey || '');
      setTestResult(null);
      setSyncStatus(null);
      if (cfg.isConfigured) {
        handleTestConnection(cfg.url, cfg.anonKey);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async (testUrl = url, testKey = anonKey) => {
    if (!testUrl || !testKey) {
      setTestResult({
        connected: false,
        error: isHinglish ? 'Kripya Supabase URL aur Anon Key dono bharein.' : 'Please enter both Supabase URL and Anon Key.'
      });
      return;
    }

    // Save temporary so client can test
    saveSupabaseConfig(testUrl, testKey);
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
      if (res.connected) {
        soundFX.playSuccess();
      } else {
        soundFX.playWarning();
      }
    } catch (err) {
      setTestResult({ connected: false, error: err.message });
      soundFX.playWarning();
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    soundFX.playClick();
    saveSupabaseConfig(url, anonKey);
    await handleTestConnection(url, anonKey);
    if (onClose) onClose();
  };

  const handleCloudSync = async () => {
    if (!currentUser) return;
    soundFX.playClick();
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const res = await syncUserToSupabase(currentUser);
      if (res.success) {
        soundFX.playSuccess();
        setSyncStatus({
          type: 'success',
          msg: isHinglish 
            ? `Success! ${currentUser.name} ka ledger aur commitments Supabase cloud pe sync ho gaya!` 
            : `Success! ${currentUser.name}'s profile, transactions & commitments synced to Supabase!`
        });
      } else {
        soundFX.playWarning();
        setSyncStatus({
          type: 'error',
          msg: res.error || (isHinglish ? 'Sync nahi ho paya. SQL schema check karein.' : 'Sync failed. Verify SQL schema has been created.')
        });
      }
    } catch (e) {
      setSyncStatus({ type: 'error', msg: e.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromCloud = async () => {
    if (!currentUser || !currentUser.email) return;
    soundFX.playClick();
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const cloudData = await fetchUserFromSupabase(currentUser.email);
      if (cloudData) {
        const updated = saveUserData({ ...currentUser, ...cloudData });
        if (onUserUpdated) onUserUpdated(updated);
        soundFX.playSuccess();
        setSyncStatus({
          type: 'success',
          msg: isHinglish 
            ? `Supabase se freshest cloud data pull ho gaya!` 
            : `Successfully pulled latest data from Supabase!`
        });
      } else {
        setSyncStatus({
          type: 'error',
          msg: isHinglish ? 'Cloud pe is email ka data nahi mila.' : 'No cloud data found for this user email yet.'
        });
      }
    } catch (e) {
      setSyncStatus({ type: 'error', msg: e.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySchema = () => {
    soundFX.playClick();
    const schemaSql = `-- PaisaPulse Supabase Tables Schema
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Young Working Professional',
  avatar TEXT DEFAULT 'U',
  avatar_bg TEXT DEFAULT '#EA580C',
  initial_balance NUMERIC(12, 2) DEFAULT 0,
  safety_buffer NUMERIC(12, 2) DEFAULT 3000,
  burn_rate_daily NUMERIC(12, 2) DEFAULT 420,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  merchant TEXT,
  payment_method TEXT DEFAULT 'UPI',
  recurring BOOLEAN DEFAULT FALSE,
  essential BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.commitments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT DEFAULT 'Rent/Hostel',
  due_day_of_month INT,
  days_away INT DEFAULT 0,
  date TEXT,
  frequency TEXT DEFAULT 'monthly',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.incomes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT DEFAULT 'Stipend',
  day_of_month INT,
  certainty TEXT DEFAULT 'confirmed' CHECK (certainty IN ('confirmed', 'probable', 'uncertain')),
  days_away INT DEFAULT 0,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.paisa_twin_snapshots (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  liquid_cash NUMERIC(12, 2) NOT NULL,
  confirmed_inflow NUMERIC(12, 2) DEFAULT 0,
  uncertain_inflow NUMERIC(12, 2) DEFAULT 0,
  mandatory_commitments NUMERIC(12, 2) DEFAULT 0,
  safety_buffer NUMERIC(12, 2) DEFAULT 3000,
  safe_daily_spend NUMERIC(12, 2) DEFAULT 0,
  health_mode TEXT DEFAULT 'STABLE',
  horizon_7d NUMERIC(12, 2) DEFAULT 0,
  horizon_14d NUMERIC(12, 2) DEFAULT 0,
  horizon_30d NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paisa_twin_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to commitments" ON public.commitments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to incomes" ON public.incomes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to twin snapshots" ON public.paisa_twin_snapshots FOR ALL USING (true) WITH CHECK (true);`;

    navigator.clipboard.writeText(schemaSql);
    setCopiedSchema(true);
    soundFX.playSuccess();
    setTimeout(() => setCopiedSchema(false), 3000);
  };

  const isConnected = testResult?.connected || isSupabaseConfigured();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(28, 25, 23, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 140,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '580px',
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
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1C1917', margin: 0 }}>
                  {isHinglish ? 'Supabase Database Connection' : 'Supabase Cloud Database'}
                </h3>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: isConnected ? '#ECFDF5' : '#FEF2F2',
                  color: isConnected ? '#059669' : '#DC2626',
                  border: `1px solid ${isConnected ? '#A7F3D0' : '#FECACA'}`
                }}>
                  {isConnected ? (isHinglish ? '● Connected' : '● Live Cloud') : (isHinglish ? 'Offline / Local' : 'Local Fallback')}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#78716C', margin: '2px 0 0 0' }}>
                {isHinglish 
                  ? 'Real-time PostgreSQL cloud sync: users, bank ledger, bills & PaisaTwin.' 
                  : 'Enterprise Postgres database synchronization for profiles, transactions & twin models.'}
              </p>
            </div>
          </div>

          <button 
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#F5EFE6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={15} color="#78716C" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #EFE8DF', padding: '0 24px', background: '#FFFFFF' }}>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'settings' ? '2.5px solid #059669' : '2.5px solid transparent',
              color: activeTab === 'settings' ? '#059669' : '#78716C',
              fontWeight: activeTab === 'settings' ? 800 : 600,
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            {isHinglish ? 'Credentials & Status' : 'Project Credentials'}
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'schema' ? '2.5px solid #059669' : '2.5px solid transparent',
              color: activeTab === 'schema' ? '#059669' : '#78716C',
              fontWeight: activeTab === 'schema' ? 800 : 600,
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            {isHinglish ? 'SQL Schema (Ready-to-Run)' : 'SQL Schema Setup'}
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
          {activeTab === 'settings' ? (
            <div>
              {/* Status Banner */}
              {testResult && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  background: testResult.connected ? '#ECFDF5' : '#FEF2F2',
                  border: `1.5px solid ${testResult.connected ? '#A7F3D0' : '#FECACA'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  {testResult.connected ? <CheckCircle2 size={18} color="#059669" /> : <AlertTriangle size={18} color="#DC2626" />}
                  <div style={{ fontSize: '0.82rem', color: testResult.connected ? '#065F46' : '#991B1B' }}>
                    <strong>{testResult.connected ? (isHinglish ? 'Connection Success!' : 'Connected!') : (isHinglish ? 'Connection Failed' : 'Connection Error')}:</strong> {testResult.message || testResult.error}
                  </div>
                </div>
              )}

              {/* Input: Project URL */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#44403C', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={14} color="#059669" />
                    <span>Supabase Project URL</span>
                  </div>
                </label>
                <input 
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzabcdefg.supabase.co"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #D6CCC2',
                    fontSize: '0.86rem',
                    color: '#1C1917',
                    background: '#FAF8F4',
                    outline: 'none',
                    fontFamily: 'monospace'
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: '#78716C', marginTop: '4px', display: 'block' }}>
                  {isHinglish ? 'Supabase Dashboard > Project Settings > API > Project URL' : 'Found in Supabase Dashboard > Project Settings > API > Project URL'}
                </span>
              </div>

              {/* Input: Anon Public Key */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#44403C', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Key size={14} color="#059669" />
                    <span>Supabase Anon Public API Key</span>
                  </div>
                </label>
                <input 
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #D6CCC2',
                    fontSize: '0.86rem',
                    color: '#1C1917',
                    background: '#FAF8F4',
                    outline: 'none',
                    fontFamily: 'monospace'
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: '#78716C', marginTop: '4px', display: 'block' }}>
                  {isHinglish ? 'Supabase Dashboard > Project Settings > API > anon public' : 'Found in Supabase Dashboard > Project Settings > API > anon (public) key'}
                </span>
              </div>

              {/* Sync Actions Box */}
              <div style={{
                background: '#FAF8F4',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #EFE8DF',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1C1917', marginBottom: '4px' }}>
                  {isHinglish ? 'Live Cloud Sync & Backup' : 'Live Cloud Sync & Backup'}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#78716C', marginBottom: '12px' }}>
                  {isHinglish 
                    ? `Aapke account (${currentUser?.name}) ke saare transactions aur commitments ko Supabase cloud mein sync karein.` 
                    : `Sync current active user (${currentUser?.name}) and their full ledger into Supabase.`}
                </p>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleCloudSync}
                    disabled={isSyncing || (!url && !isSupabaseConfigured())}
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: '#FFF',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: isSyncing ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <UploadCloud size={15} />
                    <span>{isSyncing ? (isHinglish ? 'Syncing...' : 'Syncing...') : (isHinglish ? 'Cloud Pe Upload Karein' : 'Sync to Supabase')}</span>
                  </button>

                  <button
                    onClick={handlePullFromCloud}
                    disabled={isSyncing || (!url && !isSupabaseConfigured())}
                    style={{
                      background: '#FFFFFF',
                      color: '#1C1917',
                      border: '1px solid #D6CCC2',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: isSyncing ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <DownloadCloud size={15} />
                    <span>{isHinglish ? 'Cloud Se Pull Karein' : 'Pull From Cloud'}</span>
                  </button>
                </div>

                {syncStatus && (
                  <div style={{
                    marginTop: '10px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    color: syncStatus.type === 'success' ? '#059669' : '#DC2626'
                  }}>
                    {syncStatus.msg}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <p style={{ fontSize: '0.8rem', color: '#57534E', margin: 0 }}>
                  {isHinglish 
                    ? 'Isko copy karein aur Supabase ke SQL Editor mein paste karke "Run" dabayein:' 
                    : 'Copy this SQL and click "Run" in your Supabase SQL Editor to initialize all 5 tables:'}
                </p>
                <button
                  onClick={handleCopySchema}
                  style={{
                    background: copiedSchema ? '#059669' : '#EA580C',
                    color: '#FFF',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {copiedSchema ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedSchema ? (isHinglish ? 'Copied!' : 'Copied!') : (isHinglish ? 'SQL Copy Karein' : 'Copy SQL')}</span>
                </button>
              </div>

              <div style={{
                background: '#1C1917',
                color: '#A7F3D0',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontFamily: 'monospace',
                maxHeight: '260px',
                overflowY: 'auto',
                lineHeight: 1.5
              }}>
                <pre style={{ margin: 0 }}>
{`-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Young Working Professional',
  initial_balance NUMERIC(12, 2) DEFAULT 0,
  safety_buffer NUMERIC(12, 2) DEFAULT 3000,
  burn_rate_daily NUMERIC(12, 2) DEFAULT 420,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  payment_method TEXT DEFAULT 'UPI',
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Commitments Table
CREATE TABLE IF NOT EXISTS public.commitments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT DEFAULT 'Rent/Hostel',
  days_away INT DEFAULT 0,
  frequency TEXT DEFAULT 'monthly',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Incomes Table
CREATE TABLE IF NOT EXISTS public.incomes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT DEFAULT 'Stipend',
  certainty TEXT DEFAULT 'confirmed',
  days_away INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PaisaTwin Snapshots Table
CREATE TABLE IF NOT EXISTS public.paisa_twin_snapshots (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  liquid_cash NUMERIC(12, 2) NOT NULL,
  confirmed_inflow NUMERIC(12, 2) DEFAULT 0,
  mandatory_commitments NUMERIC(12, 2) DEFAULT 0,
  safe_daily_spend NUMERIC(12, 2) DEFAULT 0,
  health_mode TEXT DEFAULT 'STABLE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}
                </pre>
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
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => handleTestConnection(url, anonKey)}
            disabled={isTesting}
            style={{
              background: '#F5EFE6',
              color: '#44403C',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: isTesting ? 'wait' : 'pointer'
            }}
          >
            <RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} />
            <span>{isTesting ? (isHinglish ? 'Testing...' : 'Testing...') : (isHinglish ? 'Connection Test Karein' : 'Test Connection')}</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                soundFX.playClick();
                onClose();
              }}
              style={{
                background: 'transparent',
                color: '#78716C',
                border: '1px solid #D6CCC2',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isHinglish ? 'Band Karein' : 'Close'}
            </button>

            <button
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                cursor: 'pointer'
              }}
            >
              {isHinglish ? 'Save & Connect Karein' : 'Save & Connect'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
