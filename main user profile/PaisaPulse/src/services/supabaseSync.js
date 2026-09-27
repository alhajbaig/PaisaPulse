import { getSupabase, isSupabaseConfigured } from './supabaseClient.js';

/**
 * Syncs a full user state (profile, transactions, commitments, incomes) into Supabase.
 * Uses atomic upserts to avoid data collisions.
 */
export async function syncUserToSupabase(user) {
  if (!isSupabaseConfigured() || !user || !user.email) {
    return { success: false, reason: 'Supabase not configured or invalid user' };
  }

  const client = getSupabase();
  if (!client) return { success: false, reason: 'Client unavailable' };

  try {
    const userId = user.id || `usr_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // 1. Upsert Profile
    const profilePayload = {
      id: userId,
      email: user.email.toLowerCase().trim(),
      name: user.name || 'User',
      role: user.role || 'Young Working Professional',
      avatar: user.avatar || (user.name ? user.name[0].toUpperCase() : 'U'),
      avatar_bg: user.avatarBg || '#EA580C',
      initial_balance: Number(user.initialBalance) || 0,
      safety_buffer: Number(user.safetyBuffer) || 3000,
      burn_rate_daily: Number(user.burnRateDaily) || 420,
      updated_at: new Date().toISOString()
    };

    const { error: profileError } = await client
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'email' });

    if (profileError) {
      console.warn('Supabase profile upsert error:', profileError.message);
      return { success: false, error: profileError.message };
    }

    // 2. Upsert Transactions (if any)
    if (Array.isArray(user.transactions) && user.transactions.length > 0) {
      const txPayloads = user.transactions.map(t => ({
        id: t.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        user_id: userId,
        date: t.date || new Date().toISOString().split('T')[0],
        description: t.description || 'Transaction',
        amount: Math.abs(Number(t.amount) || 0),
        category: t.category || 'Other',
        type: (t.type || 'expense').toLowerCase(),
        merchant: t.merchant || null,
        payment_method: t.paymentMethod || 'UPI',
        recurring: Boolean(t.recurring),
        essential: Boolean(t.essential),
        source: t.source || 'manual'
      }));

      // Upsert in batches of 100 to avoid payload limits
      for (let i = 0; i < txPayloads.length; i += 100) {
        const batch = txPayloads.slice(i, i + 100);
        const { error: txError } = await client
          .from('transactions')
          .upsert(batch, { onConflict: 'id' });
        if (txError) {
          console.warn('Supabase transactions batch upsert warning:', txError.message);
        }
      }
    }

    // 3. Upsert Commitments (if any)
    if (Array.isArray(user.upcomingCommitments) && user.upcomingCommitments.length > 0) {
      const comPayloads = user.upcomingCommitments.map(c => ({
        id: c.id || `com_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        user_id: userId,
        title: c.title || 'Scheduled Commitment',
        amount: Number(c.amount) || 0,
        category: c.category || 'Rent/Hostel',
        due_day_of_month: c.dueDayOfMonth || null,
        days_away: Number(c.daysAway) || 0,
        date: c.date || null,
        frequency: c.frequency || 'monthly',
        is_active: c.isActive !== false
      }));

      const { error: comError } = await client
        .from('commitments')
        .upsert(comPayloads, { onConflict: 'id' });
      if (comError) {
        console.warn('Supabase commitments upsert warning:', comError.message);
      }
    }

    // 4. Upsert Upcoming Incomes (if any)
    if (Array.isArray(user.upcomingIncome) && user.upcomingIncome.length > 0) {
      const incPayloads = user.upcomingIncome.map(inc => ({
        id: inc.id || `inc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        user_id: userId,
        title: inc.title || 'Income Source',
        amount: Number(inc.amount) || 0,
        category: inc.category || 'Stipend',
        day_of_month: inc.dayOfMonth || null,
        certainty: inc.certainty || 'confirmed',
        days_away: Number(inc.daysAway) || 0,
        date: inc.date || null
      }));

      const { error: incError } = await client
        .from('incomes')
        .upsert(incPayloads, { onConflict: 'id' });
      if (incError) {
        console.warn('Supabase incomes upsert warning:', incError.message);
      }
    }

    return { success: true, syncedAt: new Date().toISOString() };
  } catch (err) {
    console.error('Failed to sync user data to Supabase:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches user profile, transactions, commitments, and incomes from Supabase.
 */
export async function fetchUserFromSupabase(email) {
  if (!isSupabaseConfigured() || !email) return null;

  const client = getSupabase();
  if (!client) return null;

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Fetch profile
    const { data: profile, error: profileErr } = await client
      .from('profiles')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (profileErr || !profile) {
      return null;
    }

    const userId = profile.id;

    // 2. Fetch transactions
    const { data: txList } = await client
      .from('transactions')
      .select('*')
      .or(`user_id.eq.${userId},user_id.eq.${normalizedEmail}`)
      .order('date', { ascending: false });

    // 3. Fetch commitments
    const { data: comList } = await client
      .from('commitments')
      .select('*')
      .or(`user_id.eq.${userId},user_id.eq.${normalizedEmail}`);

    // 4. Fetch incomes
    const { data: incList } = await client
      .from('incomes')
      .select('*')
      .or(`user_id.eq.${userId},user_id.eq.${normalizedEmail}`);

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      avatar: profile.avatar,
      avatarBg: profile.avatar_bg,
      initialBalance: Number(profile.initial_balance) || 0,
      safetyBuffer: Number(profile.safety_buffer) || 3000,
      burnRateDaily: Number(profile.burn_rate_daily) || 420,
      transactions: (txList || []).map(t => ({
        id: t.id,
        date: t.date,
        description: t.description,
        amount: Number(t.amount),
        category: t.category,
        type: t.type,
        merchant: t.merchant,
        paymentMethod: t.payment_method,
        recurring: t.recurring,
        essential: t.essential,
        source: t.source
      })),
      upcomingCommitments: (comList || []).map(c => ({
        id: c.id,
        title: c.title,
        amount: Number(c.amount),
        category: c.category,
        dueDayOfMonth: c.due_day_of_month,
        daysAway: Number(c.days_away),
        date: c.date,
        frequency: c.frequency,
        isActive: c.is_active
      })),
      upcomingIncome: (incList || []).map(inc => ({
        id: inc.id,
        title: inc.title,
        amount: Number(inc.amount),
        category: inc.category,
        dayOfMonth: inc.day_of_month,
        certainty: inc.certainty,
        daysAway: Number(inc.days_away),
        date: inc.date
      })),
      updatedAt: profile.updated_at
    };
  } catch (err) {
    console.error('Error fetching user from Supabase:', err);
    return null;
  }
}

/**
 * Saves a PaisaTwin digital twin snapshot to Supabase
 */
export async function saveTwinSnapshotToSupabase(userId, twinModel) {
  if (!isSupabaseConfigured() || !userId || !twinModel) return;

  const client = getSupabase();
  if (!client) return;

  try {
    await client.from('paisa_twin_snapshots').insert({
      user_id: userId,
      liquid_cash: Number(twinModel.currentCash) || 0,
      confirmed_inflow: Number(twinModel.confirmedIncome) || 0,
      uncertain_inflow: Number(twinModel.uncertainIncome) || 0,
      mandatory_commitments: Number(twinModel.mandatoryCommitments) || 0,
      safety_buffer: Number(twinModel.safetyBuffer) || 3000,
      safe_daily_spend: Number(twinModel.safeDailySpend) || 0,
      health_mode: twinModel.healthMode?.status || 'STABLE',
      horizon_7d: Number(twinModel.projectedBalance7d) || 0,
      horizon_14d: Number(twinModel.projectedBalance14d) || 0,
      horizon_30d: Number(twinModel.projectedBalance30d) || 0
    });
  } catch (e) {
    console.warn('Failed to insert twin snapshot:', e);
  }
}
