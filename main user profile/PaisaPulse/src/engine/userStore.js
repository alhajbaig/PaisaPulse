// PaisaPulse User Accounts & Persistent Storage Service
// Handles user registration, password authentication, and automatic data syncing

import { INITIAL_PERSONAS } from './mockData.js';
import { syncUserToSupabase, fetchUserFromSupabase } from '../services/supabaseSync.js';

export const USERS_STORAGE_KEY = 'paisapulse_registered_users';
export const ACTIVE_USER_KEY = 'paisapulse_active_user';

export const DEMO_CREDENTIALS = [
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

// Initialize users registry from localStorage or seed with default personas
export function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load registered users from localStorage:', e);
  }

  // Initial seed with Kartik and Ananya
  const seeded = {
    'kartik@pulse.in': {
      ...INITIAL_PERSONAS.kartik,
      password: 'password123',
      createdAt: '2025-09-01T00:00:00.000Z',
      updatedAt: '2025-09-20T00:00:00.000Z'
    },
    'ananya@design.in': {
      ...INITIAL_PERSONAS.ananya,
      password: 'password123',
      createdAt: '2025-09-01T00:00:00.000Z',
      updatedAt: '2025-09-20T00:00:00.000Z'
    }
  };

  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(seeded));
  } catch (e) {
    console.warn('Could not seed users into localStorage:', e);
  }

  return seeded;
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
  name,
  email,
  password,
  role = 'Young Working Professional',
  initialBalance = 15000,
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

  const newUser = {
    id: `usr_${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    password: password,
    role: role || 'Young Working Professional',
    avatar: (name.trim().charAt(0) || 'U').toUpperCase(),
    avatarBg: randomBg,
    initialBalance: Number(initialBalance) || 0,
    safetyBuffer: Number(safetyBuffer) || 0,
    transactions: [], // clean starting transaction ledger
    upcomingIncome: upcomingIncome || [],
    upcomingCommitments: upcomingCommitments || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Save into users store
  const users = getRegisteredUsers();
  users[normalizedEmail] = newUser;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(newUser));
  } catch (e) {
    console.error('Storage save error:', e);
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
  try {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Storage save error:', e);
  }

  // Background fetch from Supabase to keep freshest ledger
  fetchUserFromSupabase(normalizedEmail).then(cloudUser => {
    if (cloudUser) {
      saveUserData({ ...user, ...cloudUser });
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

  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(updatedUser));
  } catch (e) {
    console.error('Failed to sync user data to localStorage:', e);
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
  const email = personaKey === 'ananya' ? 'ananya@design.in' : 'kartik@pulse.in';
  
  if (users[email]) {
    const user = users[email];
    try {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    } catch {}
    return user;
  }

  const fallback = INITIAL_PERSONAS[personaKey] || INITIAL_PERSONAS.kartik;
  return {
    ...fallback,
    password: 'password123'
  };
}

// Log out active user
export function logoutUser() {
  try {
    localStorage.removeItem(ACTIVE_USER_KEY);
  } catch (e) {
    console.error('Failed to clear active user:', e);
  }
}

// Get active session user
export function getActiveUser() {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        // Look up freshest record from registered users to ensure up-to-date data
        const fresh = findUserByEmail(parsed.email);
        return fresh || parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read active user from localStorage:', e);
  }

  // Default initial session is Kartik
  return getDemoUser('kartik');
}
