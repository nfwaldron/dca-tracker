import type { SupabaseClient } from '@supabase/supabase-js';
import type { DBState, Holding, PriceRow, DcaBucket } from '../types';
import { SEED_PRICES, SEED_HOLDINGS, SEED_ROLES } from '../seed';
import { makeSupabase } from './supabase';

// ── Row mappers ──────────────────────────────────────────────────────────────

function holdingToRow(h: Holding, userId: string) {
  return {
    id: h.id,
    user_id: userId,
    ticker: h.ticker,
    name: h.name,
    role: h.role,
    category: h.category,
    positions: h.positions,
    ath: h.ath,
    double_down: h.doubleDown ?? false,
  };
}

function rowToHolding(r: Record<string, unknown>): Holding {
  return {
    id: r.id as string,
    ticker: r.ticker as string,
    name: r.name as string,
    role: r.role as string,
    category: r.category as 'core' | 'extra' | 'wishlist',
    positions: r.positions as Holding['positions'],
    ath: r.ath as number | null,
    doubleDown: (r.double_down ?? false) as boolean,
  };
}

// ── Load ─────────────────────────────────────────────────────────────────────

/** Load full portfolio for a user from Supabase. Returns a complete DBState. */
export async function loadPortfolio(sb: SupabaseClient, userId: string): Promise<DBState> {
  const [holdingsRes, pricesRes, bucketsRes, settingsRes] = await Promise.all([
    sb.from('holdings').select('*').eq('user_id', userId),
    sb.from('prices').select('*'),
    sb.from('buckets').select('*').eq('user_id', userId),
    sb.from('settings').select('*').eq('user_id', userId),
  ]);

  // Holdings: use seed data if this is a new user with no rows yet
  const holdings: Holding[] =
    holdingsRes.data && holdingsRes.data.length > 0
      ? holdingsRes.data.map(rowToHolding)
      : SEED_HOLDINGS;

  // Prices: seed provides h52 floors; live DB values overlay on top
  const priceMap: Record<string, PriceRow> = {};
  for (const [ticker, seedRow] of Object.entries(SEED_PRICES)) {
    priceMap[ticker] = { ...seedRow };
  }
  for (const row of pricesRes.data ?? []) {
    priceMap[row.ticker] = {
      price: row.price,
      ma200: row.ma200,
      h52: Math.max(row.h52, priceMap[row.ticker]?.h52 ?? 0),
      dailyChange: row.daily_change,
      dailyChangePct: row.daily_change_pct,
      yearChangePct: row.year_change_pct,
    };
  }

  const buckets: DcaBucket[] = (bucketsRes.data ?? []).map(r => ({
    id: r.id as string,
    name: r.name as string,
    tickers: r.tickers as string[],
  }));

  // Settings: parse key-value rows
  const settings = Object.fromEntries(
    (settingsRes.data ?? []).map(r => [r.key, r.value]),
  );

  return {
    holdings,
    prices: priceMap,
    buckets,
    biWeeklyBudget: Number(settings.biWeeklyBudget ?? 300),
    doubleDownBudget: Number(settings.doubleDownBudget ?? 0),
    payFrequency: (settings.payFrequency as DBState['payFrequency']) ?? 'biweekly',
    displayPeriods: settings.displayPeriods
      ? (JSON.parse(settings.displayPeriods) as DBState['displayPeriods'])
      : ['biweekly'],
    roles: settings.roles ? (JSON.parse(settings.roles) as string[]) : SEED_ROLES,
  };
}

// ── Save ─────────────────────────────────────────────────────────────────────

/** Persist the full portfolio state to Supabase. */
export async function savePortfolio(
  sb: SupabaseClient,
  userId: string,
  state: DBState,
): Promise<void> {
  const holdingRows = state.holdings.map(h => holdingToRow(h, userId));
  const bucketRows = state.buckets.map(b => ({ ...b, user_id: userId }));
  const settingRows = [
    { user_id: userId, key: 'biWeeklyBudget', value: String(state.biWeeklyBudget) },
    { user_id: userId, key: 'doubleDownBudget', value: String(state.doubleDownBudget) },
    { user_id: userId, key: 'payFrequency', value: state.payFrequency },
    { user_id: userId, key: 'displayPeriods', value: JSON.stringify(state.displayPeriods) },
    { user_id: userId, key: 'roles', value: JSON.stringify(state.roles) },
  ];
  const priceRows = Object.entries(state.prices).map(([ticker, p]) => ({
    ticker,
    price: p.price,
    ma200: p.ma200,
    h52: p.h52,
    daily_change: p.dailyChange,
    daily_change_pct: p.dailyChangePct,
    year_change_pct: p.yearChangePct,
    fetched_at: new Date().toISOString(),
  }));

  // Upsert all data in parallel
  await Promise.all([
    sb.from('holdings').upsert(holdingRows),
    sb.from('buckets').upsert(bucketRows),
    sb.from('settings').upsert(settingRows),
    priceRows.length > 0
      ? sb.from('prices').upsert(priceRows, { onConflict: 'ticker' })
      : Promise.resolve(),
  ]);

  // Delete holdings no longer in state
  if (state.holdings.length > 0) {
    const ids = state.holdings.map(h => h.id);
    await sb.from('holdings').delete().eq('user_id', userId).not('id', 'in', `(${ids.map(id => `'${id}'`).join(',')})`);
  } else {
    await sb.from('holdings').delete().eq('user_id', userId);
  }

  // Delete buckets no longer in state
  if (state.buckets.length > 0) {
    const ids = state.buckets.map(b => b.id);
    await sb.from('buckets').delete().eq('user_id', userId).not('id', 'in', `(${ids.map(id => `'${id}'`).join(',')})`);
  } else {
    await sb.from('buckets').delete().eq('user_id', userId);
  }
}

// ── Share links ───────────────────────────────────────────────────────────────

/**
 * Save a portfolio snapshot to Supabase and return a shareable token.
 * Each user has at most one active share (upsert on user_id).
 */
export async function saveShare(
  sb: SupabaseClient,
  userId: string,
  state: DBState,
): Promise<string> {
  const token = crypto.randomUUID();
  await sb.from('shares').upsert(
    { token, user_id: userId, snapshot: state },
    { onConflict: 'user_id' },
  );
  return token;
}

/** Delete the user's active share link. */
export async function revokeShare(sb: SupabaseClient, userId: string): Promise<void> {
  await sb.from('shares').delete().eq('user_id', userId);
}

/**
 * Load a shared portfolio snapshot by token (no auth required).
 * Returns null if the token does not exist.
 */
export async function loadShare(token: string): Promise<{ snapshot: DBState; createdAt: string } | null> {
  const sb = makeSupabase(null);
  const { data, error } = await sb
    .from('shares')
    .select('snapshot, created_at')
    .eq('token', token)
    .maybeSingle();
  if (error || !data) return null;
  return { snapshot: data.snapshot as DBState, createdAt: data.created_at as string };
}
