import { getSupabase, isSupabaseConfigured } from './supabaseClient.js';
import { resolveTransactionCategory } from '../engine/types.js';

/**
 * Syncs a full user state (profile, transactions, commitments, incomes) into Supabase.
 * Uses atomic upserts and deletes obsolete items to prevent sync drift.
 */
export async function syncUserToSupabase(user) {
  if (!isSupabaseConfigured() || !user || !user.email) {
    return { success: false, reason: 'Supabase not configured or invalid user' };
  }

  const client = getSupabase();
  if (!client) return { success: false, reason: 'Client unavailable' };

  try {
    let userId = user.id;
    if (!userId || String(userId).startsWith('usr_')) {
      try {
        const { data: authData } = await client.auth.getUser();
        if (authData?.user?.id && authData.user.email?.toLowerCase() === user.email.toLowerCase()) {
          userId = authData.user.id;
          user.id = userId;
        }
      } catch (_) {}
    }
    userId = userId || `usr_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;

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
        description: t.description || `${t.merchant || ''} ${t.paymentMethod || ''}`.trim() || 'Transaction',
        amount: Math.abs(Number(t.amount) || 0),
        category: resolveTransactionCategory(t),
        type: (t.type || 'expense').toLowerCase(),
        merchant: t.merchant || null,
        payment_method: t.paymentMethod || 'UPI',
        recurring: Boolean(t.recurring),
        essential: Boolean(t.essential),
        source: t.source || 'manual',
        source_type: t.sourceType || 'MANUAL',
        category_source: t.categorySource || 'MANUAL',
        note: t.note || '',
        currency: t.currency || 'INR',
        is_deleted: Boolean(t.isDeleted)
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

    // 3. Upsert Commitments (and purge removed commitments)
    if (Array.isArray(user.upcomingCommitments)) {
      if (user.upcomingCommitments.length > 0) {
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

        // Clean up deleted commitments
        const activeComIds = comPayloads.map(c => c.id);
        const { data: existingComs } = await client
          .from('commitments')
          .select('id')
          .or(`user_id.eq.${userId},user_id.eq.${user.email.toLowerCase().trim()}`);
        if (existingComs) {
          const toDelete = existingComs.filter(ec => !activeComIds.includes(ec.id)).map(ec => ec.id);
          if (toDelete.length > 0) {
            await client.from('commitments').delete().in('id', toDelete);
          }
        }
      } else {
        await client.from('commitments').delete().or(`user_id.eq.${userId},user_id.eq.${user.email.toLowerCase().trim()}`);
      }
    }

    // 4. Upsert Upcoming Incomes / Salary (and purge removed incomes)
    if (Array.isArray(user.upcomingIncome)) {
      if (user.upcomingIncome.length > 0) {
        const incPayloads = user.upcomingIncome.map(inc => ({
          id: inc.id || `inc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          user_id: userId,
          title: inc.title || 'Salary / Income',
          amount: Number(inc.amount) || 0,
          category: inc.category || 'Salary',
          day_of_month: inc.dayOfMonth || null,
          certainty: inc.certainty || 'confirmed',
          days_away: Number(inc.daysAway) || 0,
          date: inc.date || `In ${inc.daysAway || 7} days`
        }));

        const { error: incError } = await client
          .from('incomes')
          .upsert(incPayloads, { onConflict: 'id' });
        if (incError) {
          console.warn('Supabase incomes upsert warning:', incError.message);
        }

        // Clean up deleted incomes
        const activeIncIds = incPayloads.map(i => i.id);
        const { data: existingIncs } = await client
          .from('incomes')
          .select('id')
          .or(`user_id.eq.${userId},user_id.eq.${user.email.toLowerCase().trim()}`);
        if (existingIncs) {
          const toDelete = existingIncs.filter(ei => !activeIncIds.includes(ei.id)).map(ei => ei.id);
          if (toDelete.length > 0) {
            await client.from('incomes').delete().in('id', toDelete);
          }
        }
      } else {
        await client.from('incomes').delete().or(`user_id.eq.${userId},user_id.eq.${user.email.toLowerCase().trim()}`);
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

    // 2. Fetch active transactions (exclude soft-deleted)
    const { data: txList } = await client
      .from('transactions')
      .select('*')
      .or(`user_id.eq.${userId},user_id.eq.${normalizedEmail}`)
      .eq('is_deleted', false)
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
        description: t.description || `${t.merchant || ''} ${t.payment_method || ''}`.trim() || 'Transaction',
        amount: Number(t.amount),
        category: resolveTransactionCategory(t),
        type: (t.type || 'expense').toLowerCase(),
        merchant: t.merchant || '',
        paymentMethod: t.payment_method || 'UPI',
        recurring: Boolean(t.recurring),
        essential: Boolean(t.essential),
        source: t.source || 'manual',
        sourceType: t.source_type || 'MANUAL',
        categorySource: t.category_source || 'AUTO',
        note: t.note || ''
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
        date: inc.date || `In ${inc.days_away} days`
      })),
      updatedAt: profile.updated_at
    };
  } catch (err) {
    console.error('Error fetching user from Supabase:', err);
    return null;
  }
}

/**
 * Fetches all registered cloud user profiles for seamless cross-account switching
 */
export async function fetchAllProfilesFromSupabase() {
  if (!isSupabaseConfigured()) return [];
  const client = getSupabase();
  if (!client) return [];
  try {
    const { data: profiles } = await client
      .from('profiles')
      .select('id, email, name, role, avatar, avatar_bg, initial_balance, safety_buffer')
      .order('name');
    return profiles || [];
  } catch {
    return [];
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

/**
 * Subscribes to real-time Postgres changes for transactions, commitments, incomes, and profiles.
 * Enables zero-latency live sync between the Android mobile app and the website.
 */

let activeRealtimeChannel = null;

/**
 * Broadcasts an instant transaction event to all connected clients (e.g. Android app).
 */
export async function broadcastTransactionEvent(userId, action, transaction) {
  if (!userId || !transaction) return;
  const client = getSupabase();
  if (!client) return;

  try {
    const channelName = `paisa_sync_${userId}`;
    const channel = activeRealtimeChannel || client.channel(channelName, {
      config: { broadcast: { ack: true, self: false } }
    });

    await channel.send({
      type: 'broadcast',
      event: 'TRANSACTION_EVENT',
      payload: {
        action: action.toUpperCase(),
        userId,
        transaction: {
          id: transaction.id,
          user_id: userId,
          date: transaction.date || new Date().toISOString().split('T')[0],
          description: transaction.description || `${transaction.merchant || ''} ${transaction.paymentMethod || ''}`.trim(),
          amount: Math.abs(Number(transaction.amount) || 0),
          category: transaction.category || 'Other',
          type: (transaction.type || 'expense').toLowerCase(),
          merchant: transaction.merchant || transaction.description,
          payment_method: transaction.paymentMethod || transaction.payment_method || 'UPI',
          recurring: Boolean(transaction.recurring),
          essential: Boolean(transaction.essential),
          source_type: transaction.sourceType || 'MANUAL',
          category_source: transaction.categorySource || 'MANUAL',
          note: transaction.note || '',
          currency: transaction.currency || 'INR',
          is_deleted: Boolean(transaction.isDeleted || transaction.is_deleted || action === 'DELETE')
        }
      }
    });
  } catch (err) {
    console.debug('Failed to send realtime broadcast:', err);
  }
}

/**
 * Explicitly marks a transaction as deleted in Supabase.
 */
export async function deleteTransactionFromSupabase(userId, txId) {
  if (!isSupabaseConfigured() || !txId) return false;
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('transactions')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', txId);

    if (error) {
      console.warn('Error soft-deleting transaction in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception deleting transaction in Supabase:', e);
    return false;
  }
}

/**
 * Updates details of a single transaction in Supabase.
 */
export async function updateTransactionInSupabase(userId, txId, updates) {
  if (!isSupabaseConfigured() || !txId) return false;
  const client = getSupabase();
  if (!client) return false;

  try {
    const patch = {
      updated_at: new Date().toISOString()
    };
    if (updates.merchant !== undefined) patch.merchant = updates.merchant;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.category !== undefined) patch.category = updates.category;
    if (updates.categorySource !== undefined) patch.category_source = updates.categorySource;
    if (updates.amount !== undefined) patch.amount = Math.abs(Number(updates.amount) || 0);
    if (updates.type !== undefined) patch.type = updates.type.toLowerCase();
    if (updates.paymentMethod !== undefined) patch.payment_method = updates.paymentMethod;
    if (updates.note !== undefined) patch.note = updates.note;
    if (updates.isDeleted !== undefined) patch.is_deleted = Boolean(updates.isDeleted);

    const { error } = await client
      .from('transactions')
      .update(patch)
      .eq('id', txId);

    return !error;
  } catch (e) {
    console.error('Exception updating transaction in Supabase:', e);
    return false;
  }
}

/**
 * Inserts a single transaction into Supabase.
 */
export async function insertTransactionToSupabase(userId, tx) {
  if (!isSupabaseConfigured() || !tx) return false;
  const client = getSupabase();
  if (!client) return false;

  try {
    const payload = {
      id: tx.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      user_id: userId,
      date: tx.date || new Date().toISOString().split('T')[0],
      description: tx.description || `${tx.merchant || ''} ${tx.paymentMethod || ''}`.trim(),
      amount: Math.abs(Number(tx.amount) || 0),
      category: resolveTransactionCategory(tx),
      type: (tx.type || 'expense').toLowerCase(),
      merchant: tx.merchant || tx.description || 'Transaction',
      payment_method: tx.paymentMethod || 'UPI',
      recurring: Boolean(tx.recurring),
      essential: Boolean(tx.essential),
      source: tx.source || 'manual',
      source_type: tx.sourceType || 'MANUAL',
      category_source: tx.categorySource || 'MANUAL',
      note: tx.note || '',
      currency: tx.currency || 'INR',
      is_deleted: false
    };

    const { error } = await client
      .from('transactions')
      .upsert(payload, { onConflict: 'id' });

    return !error;
  } catch (e) {
    console.error('Exception inserting transaction to Supabase:', e);
    return false;
  }
}

export function subscribeToRealtimeSync(email, userId, onDataChanged) {
  if (!isSupabaseConfigured() || (!email && !userId)) {
    return () => {};
  }

  const client = getSupabase();
  if (!client || typeof client.channel !== 'function') {
    return () => {};
  }

  const cleanEmail = email ? email.toLowerCase().trim() : '';
  const channelKey = `paisa_sync_${userId || cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

  try {
    if (activeRealtimeChannel) {
      try { client.removeChannel(activeRealtimeChannel); } catch (_) {}
    }

    const channel = client
      .channel(channelKey, {
        config: {
          broadcast: { ack: true, self: false }
        }
      })
      .on('broadcast', { event: 'TRANSACTION_EVENT' }, (payload) => {
        const data = payload?.payload;
        if (data) {
          const action = (data.action || 'CREATE').toUpperCase();
          const tx = data.transaction;
          if (tx) {
            if (typeof onDataChanged === 'function') {
              onDataChanged({
                table: 'transactions',
                eventType: action === 'DELETE' ? 'DELETE' : action === 'UPDATE' ? 'UPDATE' : 'INSERT',
                action: action,
                row: tx,
                old: { id: tx.id }
              });
            }
          }
        }
      })
      .on('broadcast', { event: 'FINANCIAL_PROFILE_EVENT' }, () => {
        if (typeof onDataChanged === 'function') {
          onDataChanged({ table: 'profiles', eventType: 'UPDATE' });
        }
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          const row = payload.new || payload.old;
          if (row && (row.user_id === userId || (cleanEmail && row.user_id === cleanEmail))) {
            if (typeof onDataChanged === 'function') {
              onDataChanged({ table: 'transactions', eventType: payload.eventType, row: payload.new, old: payload.old });
            }
          }
        }
      )
      .subscribe((status) => {
        console.debug(`Realtime channel ${channelKey} status: ${status}`);
      });

    activeRealtimeChannel = channel;

    return () => {
      try {
        client.removeChannel(channel);
        if (activeRealtimeChannel === channel) activeRealtimeChannel = null;
      } catch (_) {}
    };
  } catch (err) {
    console.warn('Realtime subscription init warning:', err);
    return () => {};
  }
}
