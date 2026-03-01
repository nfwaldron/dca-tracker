import { describe, it, expect } from 'vitest';
import { reducer, INITIAL_STATE } from '../reducer';
import { makeHolding, makeBucket, makeDBState } from '../../test/fixtures';
import type { DBState } from '../../types';

const state = (): DBState => ({ ...INITIAL_STATE });

// ── UPSERT_HOLDING ──────────────────────────────────────────────────────────

describe('UPSERT_HOLDING', () => {
  it('adds a new holding when the id does not exist', () => {
    const holding = makeHolding({ id: 'AMZN', ticker: 'AMZN' });
    const next = reducer(state(), { type: 'UPSERT_HOLDING', payload: holding });
    expect(next.holdings).toHaveLength(1);
    expect(next.holdings[0].ticker).toBe('AMZN');
  });

  it('updates an existing holding in place', () => {
    const original = makeHolding({ id: 'AMZN', name: 'Amazon' });
    const withHolding = reducer(state(), { type: 'UPSERT_HOLDING', payload: original });
    const updated = makeHolding({ id: 'AMZN', name: 'Amazon Updated' });
    const next = reducer(withHolding, { type: 'UPSERT_HOLDING', payload: updated });
    expect(next.holdings).toHaveLength(1);
    expect(next.holdings[0].name).toBe('Amazon Updated');
  });

  it('does not mutate the original state', () => {
    const s = state();
    const next = reducer(s, { type: 'UPSERT_HOLDING', payload: makeHolding() });
    expect(s.holdings).toHaveLength(0);
    expect(next.holdings).toHaveLength(1);
  });
});

// ── DELETE_HOLDING ──────────────────────────────────────────────────────────

describe('DELETE_HOLDING', () => {
  it('removes the holding with the given id', () => {
    const s = makeDBState({ holdings: [makeHolding({ id: 'AMZN' }), makeHolding({ id: 'NVDA' })] });
    const next = reducer(s, { type: 'DELETE_HOLDING', payload: 'AMZN' });
    expect(next.holdings).toHaveLength(1);
    expect(next.holdings[0].id).toBe('NVDA');
  });

  it('strips the deleted ticker from buckets that contained it', () => {
    const s = makeDBState({
      holdings: [makeHolding({ id: 'AMZN', ticker: 'AMZN' }), makeHolding({ id: 'NVDA', ticker: 'NVDA' })],
      buckets: [makeBucket({ tickers: ['AMZN', 'NVDA'] })],
    });
    const next = reducer(s, { type: 'DELETE_HOLDING', payload: 'AMZN' });
    expect(next.buckets[0].tickers).toEqual(['NVDA']);
  });

  it('removes a bucket entirely when all its tickers are deleted', () => {
    const s = makeDBState({
      holdings: [makeHolding({ id: 'SOLO', ticker: 'SOLO' })],
      buckets: [makeBucket({ tickers: ['SOLO'] })],
    });
    const next = reducer(s, { type: 'DELETE_HOLDING', payload: 'SOLO' });
    expect(next.buckets).toHaveLength(0);
  });

  it('keeps a bucket when it still has 2+ tickers after deletion', () => {
    const s = makeDBState({
      holdings: [
        makeHolding({ id: 'AMZN', ticker: 'AMZN' }),
        makeHolding({ id: 'NVDA', ticker: 'NVDA' }),
        makeHolding({ id: 'PLTR', ticker: 'PLTR' }),
      ],
      buckets: [makeBucket({ tickers: ['AMZN', 'NVDA', 'PLTR'] })],
    });
    const next = reducer(s, { type: 'DELETE_HOLDING', payload: 'AMZN' });
    expect(next.buckets).toHaveLength(1);
    expect(next.buckets[0].tickers).toEqual(['NVDA', 'PLTR']);
  });
});

// ── TOGGLE_DOUBLE_DOWN ──────────────────────────────────────────────────────

describe('TOGGLE_DOUBLE_DOWN', () => {
  it('toggles doubleDown from false to true', () => {
    const s = makeDBState({ holdings: [makeHolding({ id: 'AMZN', doubleDown: false })] });
    const next = reducer(s, { type: 'TOGGLE_DOUBLE_DOWN', payload: 'AMZN' });
    expect(next.holdings[0].doubleDown).toBe(true);
  });

  it('toggles doubleDown from true to false', () => {
    const s = makeDBState({ holdings: [makeHolding({ id: 'AMZN', doubleDown: true })] });
    const next = reducer(s, { type: 'TOGGLE_DOUBLE_DOWN', payload: 'AMZN' });
    expect(next.holdings[0].doubleDown).toBe(false);
  });
});

// ── UPSERT_PRICE ────────────────────────────────────────────────────────────

describe('UPSERT_PRICE', () => {
  it('adds a price for a new ticker', () => {
    const next = reducer(state(), {
      type: 'UPSERT_PRICE',
      payload: { ticker: 'AMZN', price: 200, ma200: 180, h52: 220, dailyChange: 1, dailyChangePct: 0.5, yearChangePct: 10 },
    });
    expect(next.prices['AMZN'].price).toBe(200);
  });

  it('always preserves the highest h52 ever seen', () => {
    let s = state();
    // First price update with h52=220
    s = reducer(s, {
      type: 'UPSERT_PRICE',
      payload: { ticker: 'AMZN', price: 200, ma200: 180, h52: 220, dailyChange: 0, dailyChangePct: 0, yearChangePct: 0 },
    });
    // Second update with a lower h52=190 (Yahoo's rolling window shrank)
    s = reducer(s, {
      type: 'UPSERT_PRICE',
      payload: { ticker: 'AMZN', price: 195, ma200: 182, h52: 190, dailyChange: 0, dailyChangePct: 0, yearChangePct: 0 },
    });
    expect(s.prices['AMZN'].h52).toBe(220);
  });

  it('uses the current price as h52 floor if it exceeds the stored h52', () => {
    let s = state();
    s = reducer(s, {
      type: 'UPSERT_PRICE',
      payload: { ticker: 'AMZN', price: 250, ma200: 200, h52: 220, dailyChange: 0, dailyChangePct: 0, yearChangePct: 0 },
    });
    // price (250) > h52 (220) → h52 should be set to 250
    expect(s.prices['AMZN'].h52).toBe(250);
  });
});

// ── SET_BIWEEKLY_BUDGET ─────────────────────────────────────────────────────

describe('SET_BIWEEKLY_BUDGET', () => {
  it('updates the biWeeklyBudget', () => {
    const next = reducer(state(), { type: 'SET_BIWEEKLY_BUDGET', payload: 750 });
    expect(next.biWeeklyBudget).toBe(750);
  });
});

// ── SET_DOUBLE_DOWN_BUDGET ───────────────────────────────────────────────────

describe('SET_DOUBLE_DOWN_BUDGET', () => {
  it('updates the doubleDownBudget', () => {
    const next = reducer(state(), { type: 'SET_DOUBLE_DOWN_BUDGET', payload: 200 });
    expect(next.doubleDownBudget).toBe(200);
  });
});

// ── UPSERT_BUCKET ───────────────────────────────────────────────────────────

describe('UPSERT_BUCKET', () => {
  it('adds a new bucket', () => {
    const bucket = makeBucket({ id: 'b1' });
    const next = reducer(state(), { type: 'UPSERT_BUCKET', payload: bucket });
    expect(next.buckets).toHaveLength(1);
  });

  it('updates an existing bucket by id', () => {
    const original = makeBucket({ id: 'b1', name: 'Original' });
    const s = reducer(state(), { type: 'UPSERT_BUCKET', payload: original });
    const updated = makeBucket({ id: 'b1', name: 'Updated' });
    const next = reducer(s, { type: 'UPSERT_BUCKET', payload: updated });
    expect(next.buckets).toHaveLength(1);
    expect(next.buckets[0].name).toBe('Updated');
  });
});

// ── DELETE_BUCKET ───────────────────────────────────────────────────────────

describe('DELETE_BUCKET', () => {
  it('removes the bucket with the given id', () => {
    const s = makeDBState({ buckets: [makeBucket({ id: 'b1' }), makeBucket({ id: 'b2' })] });
    const next = reducer(s, { type: 'DELETE_BUCKET', payload: 'b1' });
    expect(next.buckets).toHaveLength(1);
    expect(next.buckets[0].id).toBe('b2');
  });
});

// ── SET_PAY_FREQUENCY ───────────────────────────────────────────────────────

describe('SET_PAY_FREQUENCY', () => {
  it('updates payFrequency', () => {
    const next = reducer(state(), { type: 'SET_PAY_FREQUENCY', payload: 'weekly' });
    expect(next.payFrequency).toBe('weekly');
  });
});

// ── SET_DISPLAY_PERIODS ─────────────────────────────────────────────────────

describe('SET_DISPLAY_PERIODS', () => {
  it('updates displayPeriods', () => {
    const next = reducer(state(), { type: 'SET_DISPLAY_PERIODS', payload: ['daily', 'weekly'] });
    expect(next.displayPeriods).toEqual(['daily', 'weekly']);
  });
});

// ── LOAD_SNAPSHOT ───────────────────────────────────────────────────────────

describe('LOAD_SNAPSHOT', () => {
  it('replaces state with the snapshot', () => {
    const snapshot = makeDBState({ biWeeklyBudget: 1000, payFrequency: 'monthly' });
    const next = reducer(state(), { type: 'LOAD_SNAPSHOT', payload: snapshot });
    expect(next.biWeeklyBudget).toBe(1000);
    expect(next.payFrequency).toBe('monthly');
  });

  it('defaults missing optional fields', () => {
    const minimal = { holdings: [], prices: {}, biWeeklyBudget: 300 } as any;
    const next = reducer(state(), { type: 'LOAD_SNAPSHOT', payload: minimal });
    expect(next.buckets).toEqual([]);
    expect(next.doubleDownBudget).toBe(0);
    expect(next.payFrequency).toBe('biweekly');
    expect(next.displayPeriods).toEqual(['biweekly']);
  });

  it('migrates legacy holdings from the old { shares, avgCost } format', () => {
    const legacy = {
      id: 'AMZN',
      ticker: 'AMZN',
      name: 'Amazon',
      role: '',
      category: 'core',
      doubleDown: false,
      ath: null,
      shares: { robinhood: 5, moomoo: 3 },
      avgCost: { robinhood: 100, moomoo: 120 },
    };
    const snapshot = { ...makeDBState(), holdings: [legacy] } as any;
    const next = reducer(state(), { type: 'LOAD_SNAPSHOT', payload: snapshot });
    expect(next.holdings[0].positions).toHaveLength(2);
    expect(next.holdings[0].positions[0]).toEqual({ broker: 'Robinhood', shares: 5, avgCost: 100 });
    expect(next.holdings[0].positions[1]).toEqual({ broker: 'Moomoo', shares: 3, avgCost: 120 });
  });

  it('keeps modern holdings untouched during migration', () => {
    const modern = makeHolding({ id: 'AMZN', ticker: 'AMZN' });
    const snapshot = makeDBState({ holdings: [modern] });
    const next = reducer(state(), { type: 'LOAD_SNAPSHOT', payload: snapshot });
    expect(next.holdings[0]).toEqual(modern);
  });
});
