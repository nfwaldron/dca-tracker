import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadPortfolio, savePortfolio, saveShare, revokeShare, loadShare } from '../db';
import type { DBState } from '../../types';

// ── Mock makeSupabase (used by loadShare internally) ─────────────────────────

vi.mock('../supabase', () => ({ makeSupabase: vi.fn() }));
import { makeSupabase } from '../supabase';

// ── Chain mock helpers ────────────────────────────────────────────────────────

type QResult = { data: unknown; error: { message: string } | null };

/**
 * Creates a chainable, thenable Supabase query mock.
 * All fluent methods (select, upsert, delete, eq, not, maybeSingle) return the
 * same chain. Awaiting the chain resolves to { data, error }.
 */
function qr(data: unknown, errorMsg: string | null = null) {
  const result: QResult = { data, error: errorMsg ? { message: errorMsg } : null };
  const chain: Record<string, unknown> = {
    data: result.data,
    error: result.error,
    // Make thenable so `await chain` works
    then: (resolve: (v: QResult) => unknown, reject?: (v: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
    catch: (reject: (v: unknown) => unknown) => Promise.resolve(result).catch(reject),
    finally: (fn: () => void) => Promise.resolve(result).finally(fn),
  };
  for (const m of ['select', 'upsert', 'delete', 'eq', 'not', 'maybeSingle', 'insert']) {
    chain[m] = (..._: unknown[]) => chain;
  }
  return chain;
}

/** Creates a minimal Supabase client mock with per-table result overrides. */
function makeClient(overrides: Record<string, ReturnType<typeof qr>> = {}) {
  const ok = qr([]);
  return { from: (table: string) => overrides[table] ?? ok };
}

/** Minimal valid DBState for save operations. */
function minimalState(): DBState {
  return {
    holdings: [],
    prices: {},
    buckets: [],
    biWeeklyBudget: 300,
    doubleDownBudget: 0,
    payFrequency: 'biweekly',
    displayPeriods: ['biweekly'],
    roles: [],
  };
}

// ── loadPortfolio ─────────────────────────────────────────────────────────────

describe('loadPortfolio', () => {
  it('throws when a query errors', async () => {
    const sb = makeClient({ holdings: qr(null, 'DB down') });
    await expect(loadPortfolio(sb as any, 'user1')).rejects.toThrow('DB down');
  });

  it('throws when prices query errors', async () => {
    const sb = makeClient({
      holdings: qr([]),
      prices: qr(null, 'Prices table unavailable'),
    });
    await expect(loadPortfolio(sb as any, 'user1')).rejects.toThrow('Prices table unavailable');
  });

  it('maps double_down column to doubleDown field', async () => {
    const row = {
      id: 'AMZN', ticker: 'AMZN', name: 'Amazon', role: 'Landlord',
      category: 'core', positions: [], ath: null, double_down: true,
    };
    const sb = makeClient({
      holdings: qr([row]),
      prices: qr([]),
      buckets: qr([]),
      settings: qr([]),
    });
    const state = await loadPortfolio(sb as any, 'user1');
    expect(state.holdings[0].doubleDown).toBe(true);
  });

  it('defaults doubleDown to false when double_down is null', async () => {
    const row = {
      id: 'AMZN', ticker: 'AMZN', name: 'Amazon', role: 'Landlord',
      category: 'core', positions: [], ath: null, double_down: null,
    };
    const sb = makeClient({
      holdings: qr([row]),
      prices: qr([]),
      buckets: qr([]),
      settings: qr([]),
    });
    const state = await loadPortfolio(sb as any, 'user1');
    expect(state.holdings[0].doubleDown).toBe(false);
  });
});

// ── savePortfolio ─────────────────────────────────────────────────────────────

describe('savePortfolio', () => {
  it('throws when a holdings upsert errors', async () => {
    const sb = makeClient({ holdings: qr(null, 'Upsert failed') });
    await expect(savePortfolio(sb as any, 'user1', minimalState())).rejects.toThrow(
      'Upsert failed',
    );
  });

  it('throws when a holdings delete errors', async () => {
    const okChain = qr([]);
    const errChain = qr(null, 'Delete failed');
    // holdings: upsert ok, delete fails
    const holdingsChain = { ...qr([]), upsert: () => okChain, delete: () => errChain };
    const sb = makeClient({
      holdings: holdingsChain as ReturnType<typeof qr>,
      buckets: okChain,
      settings: okChain,
    });
    await expect(savePortfolio(sb as any, 'user1', minimalState())).rejects.toThrow(
      'Delete failed',
    );
  });

  it('includes double_down: false in upserted rows when doubleDown is undefined', async () => {
    const upsertSpy = vi.fn().mockReturnValue(qr([]));
    const okChain = qr([]);
    const sb = {
      from: (table: string) => {
        if (table === 'holdings') return { upsert: upsertSpy, delete: () => okChain };
        return okChain;
      },
    };
    const state: DBState = {
      ...minimalState(),
      holdings: [
        {
          id: 'NVDA', ticker: 'NVDA', name: 'NVIDIA', role: 'GPU',
          category: 'core', positions: [], ath: null,
          doubleDown: undefined as unknown as boolean,
        },
      ],
    };
    await savePortfolio(sb as any, 'user1', state);
    const [rows] = upsertSpy.mock.calls[0] as [Record<string, unknown>[]];
    expect(rows[0].double_down).toBe(false);
  });
});

// ── saveShare ─────────────────────────────────────────────────────────────────

describe('saveShare', () => {
  it('throws when upsert errors', async () => {
    const sb = makeClient({ shares: qr(null, 'Network error') });
    await expect(saveShare(sb as any, 'user1', minimalState())).rejects.toThrow(
      'Network error',
    );
  });

  it('returns a UUID token on success', async () => {
    const sb = makeClient({ shares: qr([]) });
    const token = await saveShare(sb as any, 'user1', minimalState());
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});

// ── revokeShare ───────────────────────────────────────────────────────────────

describe('revokeShare', () => {
  it('throws when delete errors', async () => {
    const sb = makeClient({ shares: qr(null, 'Delete error') });
    await expect(revokeShare(sb as any, 'user1')).rejects.toThrow('Delete error');
  });

  it('resolves without error on success', async () => {
    const sb = makeClient({ shares: qr([]) });
    await expect(revokeShare(sb as any, 'user1')).resolves.toBeUndefined();
  });
});

// ── loadShare ─────────────────────────────────────────────────────────────────

describe('loadShare', () => {
  beforeEach(() => {
    vi.mocked(makeSupabase).mockClear();
  });

  it('returns null and logs when the query errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(makeSupabase).mockReturnValue(makeClient({ shares: qr(null, 'Not found') }) as any);

    const result = await loadShare('bad-token');

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('[loadShare]', 'Not found');
    consoleSpy.mockRestore();
  });

  it('returns null when data is null (token not found)', async () => {
    vi.mocked(makeSupabase).mockReturnValue(makeClient({ shares: qr(null) }) as any);
    const result = await loadShare('unknown-token');
    expect(result).toBeNull();
  });

  it('returns snapshot and createdAt on success', async () => {
    const snapshot = minimalState();
    vi.mocked(makeSupabase).mockReturnValue(
      makeClient({ shares: qr({ snapshot, created_at: '2024-01-01T00:00:00Z' }) }) as any,
    );
    const result = await loadShare('valid-token');
    expect(result?.snapshot).toEqual(snapshot);
    expect(result?.createdAt).toBe('2024-01-01T00:00:00Z');
  });
});
