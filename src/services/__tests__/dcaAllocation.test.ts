import { describe, it, expect } from 'vitest';
import { computeDcaAllocation } from '../dcaAllocation';
import { makeHolding, makePriceRow, makeBucket } from '../../test/fixtures';
import type { Holding, PriceRow } from '../../types';

const BI_WEEKLY_DAYS = 10;

// ── Helpers ─────────────────────────────────────────────────────────────────

function prices(...tickers: string[]): Record<string, PriceRow> {
  return Object.fromEntries(
    tickers.map(t => [t, makePriceRow({ price: 60, ma200: 55, h52: 90 })]),
  );
}

function coreHoldings(...ids: string[]): Holding[] {
  return ids.map(id => makeHolding({ id, ticker: id, category: 'core' }));
}

// ── Slot layout ──────────────────────────────────────────────────────────────

describe('slot layout', () => {
  it('assigns one slot per solo core holding', () => {
    const result = computeDcaAllocation(
      coreHoldings('A', 'B', 'C'),
      [],
      prices('A', 'B', 'C'),
      300,
      0,
      BI_WEEKLY_DAYS,
    );
    expect(result.effectiveSlots).toBe(3);
  });

  it('assigns one slot per bucket (regardless of ticker count)', () => {
    const holdings = coreHoldings('A', 'B', 'C', 'D');
    const bucket = makeBucket({ id: 'b1', tickers: ['C', 'D'] });
    const result = computeDcaAllocation(
      holdings,
      [bucket],
      prices('A', 'B', 'C', 'D'),
      400,
      0,
      BI_WEEKLY_DAYS,
    );
    // 2 solo (A, B) + 1 bucket = 3 slots
    expect(result.effectiveSlots).toBe(3);
  });

  it('returns effectiveSlots of 0 when there are no core holdings', () => {
    const wishlist = [makeHolding({ id: 'W', ticker: 'W', category: 'wishlist' })];
    const result = computeDcaAllocation(wishlist, [], {}, 300, 0, BI_WEEKLY_DAYS);
    expect(result.effectiveSlots).toBe(0);
  });
});

// ── Per-slot budget ──────────────────────────────────────────────────────────

describe('per-slot daily amount', () => {
  it('divides budget evenly across slots and days', () => {
    // $300 / 3 slots / 10 days = $10/slot/day
    const result = computeDcaAllocation(
      coreHoldings('A', 'B', 'C'),
      [],
      prices('A', 'B', 'C'),
      300,
      0,
      BI_WEEKLY_DAYS,
    );
    expect(result.perSlotDailyAmt).toBeCloseTo(10);
  });

  it('returns 0 when there are no slots', () => {
    const result = computeDcaAllocation([], [], {}, 300, 0, BI_WEEKLY_DAYS);
    expect(result.perSlotDailyAmt).toBe(0);
  });

  it('splits a bucket slot equally among its tickers', () => {
    const holdings = coreHoldings('A', 'B');
    const bucket = makeBucket({ id: 'b1', tickers: ['A', 'B'] });
    // $200 / 1 slot / 10 days = $20/slot/day → $10/stock/day
    const result = computeDcaAllocation(holdings, [bucket], prices('A', 'B'), 200, 0, BI_WEEKLY_DAYS);
    expect(result.soloEnriched).toHaveLength(0);
    expect(result.allCore[0].baseDaily).toBeCloseTo(10);
    expect(result.allCore[1].baseDaily).toBeCloseTo(10);
  });
});

// ── Slot breakdown string ────────────────────────────────────────────────────

describe('slotBreakdown', () => {
  it('shows solo count and total slots', () => {
    const result = computeDcaAllocation(
      coreHoldings('A', 'B'),
      [],
      prices('A', 'B'),
      200,
      0,
      BI_WEEKLY_DAYS,
    );
    expect(result.slotBreakdown).toBe('2 solo · 2 slots');
  });

  it('includes bucket count when buckets are present', () => {
    const holdings = coreHoldings('A', 'B', 'C');
    const bucket = makeBucket({ id: 'b1', tickers: ['B', 'C'] });
    const result = computeDcaAllocation(holdings, [bucket], prices('A', 'B', 'C'), 200, 0, BI_WEEKLY_DAYS);
    expect(result.slotBreakdown).toBe('1 solo · 1 bucket · 2 slots');
  });

  it('pluralises "buckets" correctly', () => {
    const holdings = coreHoldings('A', 'B', 'C', 'D');
    const buckets = [
      makeBucket({ id: 'b1', tickers: ['A', 'B'] }),
      makeBucket({ id: 'b2', tickers: ['C', 'D'] }),
    ];
    const result = computeDcaAllocation(holdings, buckets, prices('A', 'B', 'C', 'D'), 200, 0, BI_WEEKLY_DAYS);
    expect(result.slotBreakdown).toBe('0 solo · 2 buckets · 2 slots');
  });
});

// ── Holdings slices ──────────────────────────────────────────────────────────

describe('holdings slices', () => {
  it('separates solo core from bucketed core', () => {
    const holdings = [
      ...coreHoldings('A', 'B'),
      makeHolding({ id: 'C', ticker: 'C', category: 'core' }),
    ];
    const bucket = makeBucket({ id: 'b1', tickers: ['B', 'C'] });
    const result = computeDcaAllocation(holdings, [bucket], {}, 300, 0, BI_WEEKLY_DAYS);
    expect(result.soloCore.map(h => h.ticker)).toEqual(['A']);
    expect(result.allCore).toHaveLength(3);
  });

  it('separates wishlist holdings from core', () => {
    const holdings = [
      makeHolding({ id: 'W', ticker: 'W', category: 'wishlist' }),
      makeHolding({ id: 'C', ticker: 'C', category: 'core' }),
    ];
    const result = computeDcaAllocation(holdings, [], {}, 200, 0, BI_WEEKLY_DAYS);
    expect(result.wishlist).toHaveLength(1);
    expect(result.wishlist[0].ticker).toBe('W');
    expect(result.allCore).toHaveLength(1);
  });
});

// ── Double-down groups ───────────────────────────────────────────────────────

describe('double-down groups', () => {
  it('identifies triggered holdings', () => {
    // price below ma200 → triggered
    const holdings = [makeHolding({ id: 'A', ticker: 'A', category: 'core', doubleDown: false })];
    const priceMap = { A: makePriceRow({ price: 40, ma200: 55 }) };
    const result = computeDcaAllocation(holdings, [], priceMap, 100, 0, BI_WEEKLY_DAYS);
    expect(result.triggeredAll).toHaveLength(1);
  });

  it('puts opted-in triggered holdings in doubleDownActive', () => {
    const holdings = [makeHolding({ id: 'A', ticker: 'A', category: 'core', doubleDown: true })];
    const priceMap = { A: makePriceRow({ price: 40, ma200: 55 }) };
    const result = computeDcaAllocation(holdings, [], priceMap, 100, 0, BI_WEEKLY_DAYS);
    expect(result.doubleDownActive).toHaveLength(1);
    expect(result.doubleDownPending).toHaveLength(0);
  });

  it('puts non-opted triggered holdings in doubleDownPending', () => {
    const holdings = [makeHolding({ id: 'A', ticker: 'A', category: 'core', doubleDown: false })];
    const priceMap = { A: makePriceRow({ price: 40, ma200: 55 }) };
    const result = computeDcaAllocation(holdings, [], priceMap, 100, 0, BI_WEEKLY_DAYS);
    expect(result.doubleDownPending).toHaveLength(1);
    expect(result.doubleDownActive).toHaveLength(0);
  });
});

// ── Affordability ────────────────────────────────────────────────────────────

describe('affordability', () => {
  it('marks canFullyCover true when doubleDownBudget covers all double-downs', () => {
    const holdings = [makeHolding({ id: 'A', ticker: 'A', category: 'core', doubleDown: true })];
    const priceMap = { A: makePriceRow({ price: 40, ma200: 55 }) };
    // $100 budget / 1 slot / 10 days = $10/day needed per active stock per period = $100
    const result = computeDcaAllocation(holdings, [], priceMap, 100, 200, BI_WEEKLY_DAYS);
    expect(result.canFullyCover).toBe(true);
    expect(result.shortfall).toBeLessThan(0); // over-funded
  });

  it('marks canFullyCover false when doubleDownBudget is insufficient', () => {
    const holdings = [makeHolding({ id: 'A', ticker: 'A', category: 'core', doubleDown: true })];
    const priceMap = { A: makePriceRow({ price: 40, ma200: 55 }) };
    // $100 budget / 1 slot / 10 days = $10/day → extraNeeded = $100, but we only have $50
    const result = computeDcaAllocation(holdings, [], priceMap, 100, 50, BI_WEEKLY_DAYS);
    expect(result.canFullyCover).toBe(false);
    expect(result.shortfall).toBeGreaterThan(0);
  });

  it('returns actualPerStock of 0 when no active double-down stocks', () => {
    const result = computeDcaAllocation(coreHoldings('A'), [], prices('A'), 100, 50, BI_WEEKLY_DAYS);
    expect(result.actualPerStock).toBe(0);
  });

  it('caps actualExtraTotal at extraNeededPeriod even if budget exceeds it', () => {
    const holdings = [makeHolding({ id: 'A', ticker: 'A', category: 'core', doubleDown: true })];
    const priceMap = { A: makePriceRow({ price: 40, ma200: 55 }) };
    const result = computeDcaAllocation(holdings, [], priceMap, 100, 9999, BI_WEEKLY_DAYS);
    expect(result.actualExtraTotal).toBe(result.extraNeededPeriod);
  });
});
