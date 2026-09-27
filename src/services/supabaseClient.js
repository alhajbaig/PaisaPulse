import { createClient } from '@supabase/supabase-js';

const STORAGE_SUPABASE_URL_KEY = 'paisapulse_supabase_url';
const STORAGE_SUPABASE_ANON_KEY = 'paisapulse_supabase_anon_key';

// Read from Next.js env, Vite env or user localStorage configuration
export function getSupabaseConfig() {
  const envUrl = 
    (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_SUPABASE_URL || process.env?.VITE_SUPABASE_URL)) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    '';

  const envKey = 
    (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_ANON_KEY)) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_SUPABASE_URL_KEY) || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_SUPABASE_ANON_KEY) || '' : '';

  const rawUrl = (storedUrl || envUrl).trim();
  const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  const cleanKey = (storedKey || envKey).trim();

  return {
    url: cleanUrl,
    anonKey: cleanKey,
    isCustomConfigured: Boolean(storedUrl && storedKey),
    isEnvConfigured: Boolean(envUrl && envKey),
    isConfigured: Boolean(cleanUrl && cleanKey)
  };
}

export function saveSupabaseConfig(url, anonKey) {
  if (typeof window !== 'undefined') {
    if (url && anonKey) {
      localStorage.setItem(STORAGE_SUPABASE_URL_KEY, url.trim());
      localStorage.setItem(STORAGE_SUPABASE_ANON_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(STORAGE_SUPABASE_URL_KEY);
      localStorage.removeItem(STORAGE_SUPABASE_ANON_KEY);
    }
  }
  // Re-instantiate client
  initSupabaseClient();
}

let supabaseInstance = null;
let lastConfigKey = '';

export function initSupabaseClient(force = false) {
  const { url, anonKey } = getSupabaseConfig();
  const currentKey = `${url}:${anonKey}`;

  if (!force && supabaseInstance && lastConfigKey === currentKey) {
    return supabaseInstance;
  }

  if (url && anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      lastConfigKey = currentKey;
      return supabaseInstance;
    } catch (e) {
      console.error('Failed to create Supabase client:', e);
      supabaseInstance = null;
    }
  } else {
    supabaseInstance = null;
    lastConfigKey = '';
  }
  return supabaseInstance;
}

// Initial client creation
initSupabaseClient();

export function getSupabase() {
  if (!supabaseInstance) {
    initSupabaseClient();
  }
  return supabaseInstance;
}

export function isSupabaseConfigured() {
  const { isConfigured } = getSupabaseConfig();
  return isConfigured && Boolean(supabaseInstance);
}

// Test live connectivity against Supabase
export async function testSupabaseConnection() {
  const client = getSupabase();
  if (!client) {
    return {
      connected: false,
      error: 'Supabase URL or Anon Public Key is missing.'
    };
  }

  const startTime = Date.now();
  try {
    // Try pinging profiles table or check auth health
    const { data, error } = await client.from('profiles').select('id').limit(1);
    const latency = Date.now() - startTime;

    if (error && error.code !== 'PGRST116') {
      // Table might not exist yet, check if auth endpoint responds
      const authCheck = await client.auth.getSession();
      if (!authCheck.error) {
        return {
          connected: true,
          latency,
          needsSchema: true,
          message: 'Connected to Supabase project! (Run SQL schema to create tables).'
        };
      }
      return {
        connected: false,
        latency,
        error: error.message || 'Failed to query Supabase database.'
      };
    }

    return {
      connected: true,
      latency,
      needsSchema: false,
      message: `Successfully connected to Supabase (${latency}ms latency).`
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message || 'Network error reaching Supabase.'
    };
  }
}
