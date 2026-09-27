-- ==============================================================================
-- PaisaPulse: AI Cashflow Guardian & PaisaTwin Database Schema for Supabase
-- ==============================================================================
-- Run this script in your Supabase SQL Editor:
-- https://app.supabase.com/project/_/sql

-- 1. PROFILES TABLE (Stores user financial profile & preferences)
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

-- 2. TRANSACTIONS TABLE (Single source of truth ledger)
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

-- Index for speedy ledger lookups by user and date
CREATE INDEX IF NOT EXISTS idx_tx_user_date ON public.transactions(user_id, date);

-- 3. COMMITMENTS TABLE (Fixed scheduled obligations like PG rent, subscriptions)
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

CREATE INDEX IF NOT EXISTS idx_commitments_user ON public.commitments(user_id);

-- 4. UPCOMING INCOMES TABLE (Guaranteed salary/stipend vs uncertain freelance)
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

CREATE INDEX IF NOT EXISTS idx_incomes_user ON public.incomes(user_id);

-- 5. PAISATWIN DIGITAL TWIN SNAPSHOTS TABLE
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
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_twin_user_time ON public.paisa_twin_snapshots(user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paisa_twin_snapshots ENABLE ROW LEVEL SECURITY;

-- Development & Prototype Policies (Allows read/write with anon key)
DROP POLICY IF EXISTS "Public access to profiles" ON public.profiles;
CREATE POLICY "Public access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to transactions" ON public.transactions;
CREATE POLICY "Public access to transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to commitments" ON public.commitments;
CREATE POLICY "Public access to commitments" ON public.commitments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to incomes" ON public.incomes;
CREATE POLICY "Public access to incomes" ON public.incomes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to twin snapshots" ON public.paisa_twin_snapshots;
CREATE POLICY "Public access to twin snapshots" ON public.paisa_twin_snapshots FOR ALL USING (true) WITH CHECK (true);
