/// PaisaPulse User Accounts & Persistent Storage Service
// Handles user registration, password authentication, and automatic data syncing

import { INITIAL_PERSONAS } from './mockData.js';
import { syncUserToSupabase, fetchUserFromSupabase, fetchAllProfilesFromSupabase } from '../services/supabaseSync.js';
import { getSupabase, isSupabaseConfigured } from '../services/supabaseClient.js';

export const USERS_STORAGE_KEY = 'paisapulse_registered_users';
export const ACTIVE_USER_KEY = 'paisapulse_active_user';

export const DEMO_CREDENTIALS = [
  {
    key: 'vicky',
    name: 'Vicky (Mobile App)',
    email: 'vicky@gmail.com',
    password: 'password123',
    role: 'Young Working Professional',
    balance: '₹0',
    description: 'Active mobile user on Android device'
  },
  {
    key: 'kamal',
    name: 'Kamal (Mobile Phone)',
    email: 'kamal@gmail.com',
    password: 'password123',
    role: 'Android Device User',
    balance: '₹8,500',
    description: 'Android app user with live Room SQLite & Supabase sync'
  },
  {
    key: 'kartik',
    name: 'Kartik Sharma',
    email: 'kartik@pulse.in',
    password: 'password123',
    role: 'College Student & Tech Intern',
    balance: '₹12,480',
    description: 'Student with internship stipend, PG rent & food expenses'
  },
  {
    key: 'ananya',
    name: 'Ananya Roy',
    email: 'ananya@design.in',
    password: 'password123',
    role: 'Freelance UI/UX Designer',
    balance: '₹24,500',
    description: 'Freelancer with client milestone invoices & co-working desk bills'
  }
];

function getStorage() {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    return window.localStorage;
  }
  return null;
}

export function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('paisapulse_auth_change'));
    } catch {}
  }
}

// Check if a user is actively authenticated
export function isUserLoggedIn() {
  const storage = getStorage();
  if (!storage) return false;
  try {
    const isLoggedOut = storage.getItem('paisapulse_logged_out') === 'true';
    if (isLoggedOut) return false;
    const raw = storage.getItem(ACTIVE_USER_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return !!(parsed && parsed.email);
  } catch {
    return false;
  }
}

// Initialize users registry from localStorage (pure user data, no fake seeds)
export function getRegisteredUsers() {
  const storage = getStorage();
  if (storage) {
    try {
      const raw = storage.getItem(USERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load registered users from localStorage:', e);
    }
  }
  return {};
}

// Find user by email (case-insensitive)
export function findUserByEmail(email) {
  if (!email) return null;
  const users = getRegisteredUsers();
  const normalized = email.trim().toLowerCase();
  return users[normalized] || null;
}

// Register a new user
export function registerUser({
  id = "",
  name,
  email,
  password,
  phone = '',
  mobile = '',
  role = 'Young Working Professional',
  initialBalance = 0,
  safetyBuffer = 3000,
  upcomingIncome = [],
  upcomingCommitments = []
}) {
  if (!email || !email.trim()) {
    return { success: false, error: 'Email address is required.' };
  }
  if (!password || password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters long.' };
  }
  if (!name || !name.trim()) {
    return { success: false, error: 'Full name is required.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = findUserByEmail(normalizedEmail);
  if (existing) {
    return {
      success: false,
      error: 'An account with this email address already exists. Please log in instead.'
    };
  }

  const avatarBgOptions = ['#EA580C', '#2563EB', '#059669', '#7C3AED', '#DB2777', '#0891B2'];
  const randomBg = avatarBgOptions[Math.floor(Math.random() * avatarBgOptions.length)];

  const cleanPhone = String(mobile || phone || '').trim();

  const canonicalId = id || `usr_${Date.now()}`;

  const newUser = {
    id: canonicalId,
    name: name.trim(),
    email: normalizedEmail,
    phone: cleanPhone,
    mobile: cleanPhone,
    password: password,
    role: role || 'Young Working Professional',
    avatar: (name.trim().charAt(0) || 'U').toUpperCase(),
    avatarBg: randomBg,
    initialBalance: Math.max(0, Number(initialBalance) || 0),
    safetyBuffer: Math.max(0, Number(safetyBuffer) || 0),
    transactions: [], // clean starting transaction ledger: no hardcoded or dummy data!
    upcomingIncome: upcomingIncome || [],
    upcomingCommitments: upcomingCommitments || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Save into users store
  const users = getRegisteredUsers();
  users[normalizedEmail] = newUser;
  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem('paisapulse_logged_out');
      storage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      storage.setItem(ACTIVE_USER_KEY, JSON.stringify(newUser));
      notifyAuthChange();
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  // Trigger Supabase cloud backup in background
  syncUserToSupabase(newUser).catch(err => console.warn('Supabase auto-sync error on signup:', err));

  return { success: true, user: newUser };
}

// Log in an existing user
export function loginUser(email, password) {
  if (!email || !email.trim()) {
    return { success: false, error: 'Please enter your email address.' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = findUserByEmail(normalizedEmail);

  if (!user) {
    return {
      success: false,
      error: 'No account found with this email address.',
      suggestSignup: true,
      email: normalizedEmail
    };
  }

  if (user.password && user.password !== password) {
    return {
      success: false,
      error: 'Incorrect password. Please verify your credentials and try again.'
    };
  }

  // Update active user in localStorage
  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem('paisapulse_logged_out');
      storage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
      notifyAuthChange();
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  // Background fetch from Supabase to keep freshest ledger without resetting local records
  fetchUserFromSupabase(normalizedEmail).then(cloudUser => {
    if (cloudUser) {
      const localTx = user.transactions || [];
      const cloudTx = cloudUser.transactions || [];
      const mergedTx = cloudTx.length > 0
        ? (localTx.length > 0
            ? [...cloudTx, ...localTx.filter(lt => !cloudTx.some(ct => ct.id === lt.id))]
            : cloudTx)
        : localTx;

      const canonicalId = cloudUser.id || user.id;
      saveUserData({
        ...user,
        ...cloudUser,
        id: canonicalId,
        transactions: mergedTx,
        password: user.password
      });
    }
  }).catch(() => {});

  return { success: true, user };
}

// Save active user's current data back to registered users store
export function saveUserData(user) {
  if (!user || !user.email) return;

  const normalizedEmail = user.email.trim().toLowerCase();
  const users = getRegisteredUsers();

  const existing = users[normalizedEmail] || {};
  const updatedUser = {
    ...existing,
    ...user,
    email: normalizedEmail,
    updatedAt: new Date().toISOString()
  };

  users[normalizedEmail] = updatedUser;

  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      storage.setItem(ACTIVE_USER_KEY, JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Failed to sync user data to localStorage:', e);
    }
  }

  // Trigger background cloud sync to Supabase
  syncUserToSupabase(updatedUser).catch(err => {
    // Silent fail in dev if offline or not configured
    console.debug('Supabase background sync status:', err);
  });

  return updatedUser;
}

// Get demo user preloaded with realistic dataset
export function getDemoUser(personaKey) {
  const users = getRegisteredUsers();
  const email = personaKey === 'ananya' ? 'ananya@design.in' : (personaKey === 'kamal' ? 'kamal@gmail.com' : (personaKey === 'vicky' ? 'vicky@gmail.com' : 'kartik@pulse.in'));
  const storage = getStorage();
  
  if (users[email]) {
    const user = users[email];
    if (storage) {
      try {
        storage.removeItem('paisapulse_logged_out');
        storage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
        notifyAuthChange();
      } catch {}
    }
    return user;
  }

  const fallback = INITIAL_PERSONAS[personaKey] || INITIAL_PERSONAS.kartik;
  const user = {
    ...fallback,
    password: 'password123'
  };
  if (storage) {
    try {
      storage.removeItem('paisapulse_logged_out');
      storage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
      notifyAuthChange();
    } catch {}
  }
  return user;
}

// Log out active user
export function logoutUser() {
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem('paisapulse_logged_out', 'true');
      storage.removeItem(ACTIVE_USER_KEY);
      notifyAuthChange();
    } catch (e) {
      console.error('Failed to clear active user:', e);
    }
  }
}

// Get active session user
export function getActiveUser() {
  const storage = getStorage();
  if (storage) {
    try {
      const isLoggedOut = storage.getItem('paisapulse_logged_out') === 'true';
      if (isLoggedOut) {
        return null;
      }

      const raw = storage.getItem(ACTIVE_USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.email) {
          // Look up freshest record from registered users to ensure up-to-date data
          const fresh = findUserByEmail(parsed.email);
          return fresh || parsed;
        }
      }

      // First-time visitor who hasn't explicitly logged out: default to Kartik demo persona
      return getDemoUser('kartik');
    } catch (e) {
      console.error('Failed to read active user from localStorage:', e);
    }
  }

  // Fallback for SSR or non-browser environment
  return null;
}

// Asynchronous cloud-aware user login
export async function loginUserAsync(email, password) {
  if (!email || !email.trim()) {
    return { success: false, error: 'Please enter your email address.' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = findUserByEmail(normalizedEmail);

  // 1. Try Supabase Auth verification if client is configured
  let supaAuthSuccess = false;
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabase();
      if (client) {
        const supaRes = await client.auth.signInWithPassword({
          email: normalizedEmail,
          password: password,
        });
        if (supaRes?.data?.user && !supaRes?.error) {
          supaAuthSuccess = true;
        }
      }
    } catch (_) {}
  }

  // 2. Fetch full profile and ledger from Supabase if not in local store or if auth succeeded
  if (!user || supaAuthSuccess) {
    try {
      const cloudUser = await fetchUserFromSupabase(normalizedEmail);
      if (cloudUser) {
        user = {
          ...(user || {}),
          ...cloudUser,
          id: cloudUser.id || user?.id,
          password: password,
          transactions: cloudUser.transactions || user?.transactions || [],
          upcomingCommitments: cloudUser.upcomingCommitments || user?.upcomingCommitments || [],
          upcomingIncome: cloudUser.upcomingIncome || user?.upcomingIncome || []
        };
        const users = getRegisteredUsers();
        users[normalizedEmail] = user;
        const storage = getStorage();
        if (storage) {
          storage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
      }
    } catch (_) {}
  }

  // 3. Fallback to demo credentials if not yet cached
  if (!user) {
    const demo = DEMO_CREDENTIALS.find(d => d.email.toLowerCase() === normalizedEmail);
    if (demo) {
      user = getDemoUser(demo.key);
    }
  }

  if (!user) {
    return {
      success: false,
      error: `No account found for "${email}". Please verify the email or click Create Account.`,
      suggestSignup: true,
      email: normalizedEmail
    };
  }

  // 4. Validate password:
  // - Accepted if verified via Supabase Auth
  // - Accepted if matches user's local password
  // - Accepted if standard universal demo/hackathon password 'password123'
  // - Accepted if cloud profile was never given a local password yet
  const isMatch = supaAuthSuccess ||
    (user.password && user.password === password) ||
    password === 'password123' ||
    !user.password;

  if (!isMatch) {
    return {
      success: false,
      error: 'Incorrect password. Please verify your credentials and try again.'
    };
  }

  // Save validated password locally
  user.password = password;

  // Set active user session
  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem('paisapulse_logged_out');
      storage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
      const users = getRegisteredUsers();
      users[normalizedEmail] = user;
      storage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      notifyAuthChange();
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  // Refresh latest state from Supabase in background
  fetchUserFromSupabase(normalizedEmail).then(fresh => {
    if (fresh) {
      saveUserData({ ...user, ...fresh, password });
    }
  }).catch(() => {});

  return { success: true, user };
}

// 1-Click user switch helper
export async function switchUserByEmail(email) {
  if (!email) return null;
  const normalizedEmail = email.trim().toLowerCase();
  let user = findUserByEmail(normalizedEmail);

  try {
    const cloudUser = await fetchUserFromSupabase(normalizedEmail);
    if (cloudUser) {
      user = {
        ...(user || {}),
        ...cloudUser,
        id: cloudUser.id || user?.id,
        transactions: cloudUser.transactions || user?.transactions || [],
        upcomingCommitments: cloudUser.upcomingCommitments || user?.upcomingCommitments || [],
        upcomingIncome: cloudUser.upcomingIncome || user?.upcomingIncome || []
      };
      const users = getRegisteredUsers();
      users[normalizedEmail] = user;
      const storage = getStorage();
      if (storage) {
        storage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }
    }
  } catch (_) {}

  if (!user) {
    const demo = DEMO_CREDENTIALS.find(d => d.email.toLowerCase() === normalizedEmail);
    if (demo) {
      user = getDemoUser(demo.key);
    }
  }

  if (user) {
    const storage = getStorage();
    if (storage) {
      try {
        storage.removeItem('paisapulse_logged_out');
        storage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
        notifyAuthChange();
      } catch (_) {}
    }
    return user;
  }
  return null;
}
