import { describe, it, expect } from 'vitest';
import { enrichHolding } from '../utils/holding';
import { formatDollars, formatPercent, formatShares } from '../utils/format';
import { PERIOD_DAYS, FREQ_LABELS } from '../constants/periods';
import { makeHolding, makePriceRow } from '../test/fixtures';

// ── formatDollars ────────────────────────────────────────────────────────────────────

describe('formatDollars', () => {
  it('formats a positive number with 2 decimal places', () => {
    expect(formatDollars(1234.56)).toBe('$1,234.56');
  });

  it('formats zero', () => {
    expect(formatDollars(0)).toBe('$0.00');
  });

  it('formats a large number with commas', () => {
    expect(formatDollars(1000000)).toBe('$1,000,000.00');
  });

  it('respects a custom digit count', () => {
    expect(formatDollars(62.5, 0)).toBe('$63');
  });

  it('formats a negative number', () => {
    expect(formatDollars(-138.17)).toBe('$-138.17');
  });
});

// ── formatPercent ──────────────────────────────────────────────────────────────────

describe('formatPercent', () => {
  it('returns an em dash for null', () => {
    expect(formatPercent(null)).toBe('—');
  });

  it('prefixes positive values with a plus sign', () => {
    expect(formatPercent(1.5)).toBe('+1.50%');
  });

  it('does not add a plus for negative values', () => {
    expect(formatPercent(-0.55)).toBe('-0.55%');
  });

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('+0.00%');
  });
});

// ── formatShares ───────────────────────────────────────────────────────────────

describe('formatShares', () => {
  it('formats whole shares without decimals', () => {
    expect(formatShares(100)).toBe('100');
  });

  it('formats fractional shares up to 4 decimal places', () => {
    expect(formatShares(1.2345)).toBe('1.2345');
  });

  it('formats large share counts with commas', () => {
    expect(formatShares(10000)).toBe('10,000');
  });
});

// ── PERIOD_DAYS / FREQ_LABELS constants ────────────────────────────────────

describe('PERIOD_DAYS', () => {
  it('has correct trading days per period', () => {
    expect(PERIOD_DAYS.daily).toBe(1);
    expect(PERIOD_DAYS.weekly).toBe(5);
    expect(PERIOD_DAYS.biweekly).toBe(10);
    expect(PERIOD_DAYS.monthly).toBe(21);
  });
});

describe('FREQ_LABELS', () => {
  it('maps frequency keys to display labels', () => {
    expect(FREQ_LABELS.weekly).toBe('Weekly');
    expect(FREQ_LABELS.biweekly).toBe('Bi-weekly');
    expect(FREQ_LABELS.monthly).toBe('Monthly');
  });
});

// ── enrich ──────────────────────────────────────────────────────────────────

describe('enrich', () => {
  describe('share & cost calculations', () => {
    it('sums shares across broker positions', () => {
      const holding = makeHolding({
        positions: [
          { broker: 'Robinhood', shares: 5, avgCost: 40 },
          { broker: 'Moomoo', shares: 3, avgCost: 60 },
        ],
      });
      const result = enrichHolding(holding, {}, 0, 0);
      expect(result.totalShares).toBe(8);
    });

    it('computes weighted average cost', () => {
      const holding = makeHolding({
        positions: [
          { broker: 'A', shares: 10, avgCost: 50 },
          { broker: 'B', shares: 10, avgCost: 100 },
        ],
      });
      const result = enrichHolding(holding, {}, 0, 0);
      expect(result.weightedAvg).toBe(75);
    });

    it('returns weightedAvg of 0 when there are no shares', () => {
      const holding = makeHolding({ positions: [] });
      const result = enrichHolding(holding, {}, 0, 0);
      expect(result.weightedAvg).toBe(0);
      expect(result.totalShares).toBe(0);
    });

    it('computes cost basis from all positions', () => {
      const holding = makeHolding({
        positions: [{ broker: 'A', shares: 10, avgCost: 50 }],
      });
      const result = enrichHolding(holding, {}, 0, 0);
      expect(result.costBasis).toBe(500);
    });
  });

  describe('market value & G/L', () => {
    it('calculates market value from totalShares × price', () => {
      const holding = makeHolding({ positions: [{ broker: 'A', shares: 10, avgCost: 50 }] });
      const prices = { TEST: makePriceRow({ price: 80 }) };
      const result = enrichHolding(holding, prices, 0, 0);
      expect(result.mktVal).toBe(800);
    });

    it('calculates gain/loss correctly', () => {
      const holding = makeHolding({ positions: [{ broker: 'A', shares: 10, avgCost: 50 }] });
      const prices = { TEST: makePriceRow({ price: 60 }) };
      const result = enrichHolding(holding, prices, 0, 0);
      expect(result.gl).toBe(100); // (60 - 50) * 10
      expect(result.glPct).toBeCloseTo(20);
    });

    it('returns glPct of 0 when costBasis is 0', () => {
      const holding = makeHolding({ positions: [] });
      const result = enrichHolding(holding, {}, 0, 0);
      expect(result.glPct).toBe(0);
    });
  });

  describe('trigger logic', () => {
    it('triggers when price is ≥20% below 52-week high', () => {
      const holding = makeHolding({ ath: null });
      // price: 40, h52: 90 → (90-40)/90 = 55.6% off high → triggers
      const prices = { TEST: makePriceRow({ price: 40, h52: 90 }) };
      const result = enrichHolding(holding, prices, 0, 0);
      expect(result.triggered).toBe(true);
    });

    it('triggers when price is ≥20% below ATH', () => {
      const holding = makeHolding({ ath: 100 });
      // price is 75 → 25% below ATH, should trigger
      const prices = { TEST: makePriceRow({ price: 75, ma200: 60, h52: 100 }) };
      const result = enrichHolding(holding, prices, 0, 0);
      expect(result.triggered).toBe(true);
    });

    it('does not trigger when price is within 20% of the high reference', () => {
      const holding = makeHolding({ ath: 100 });
      const prices = { TEST: makePriceRow({ price: 90, ma200: 80, h52: 100 }) };
      const result = enrichHolding(holding, prices, 0, 0);
      expect(result.triggered).toBe(false);
    });

    it('does not trigger when price is 0', () => {
      const holding = makeHolding({ ath: null });
      const prices = { TEST: makePriceRow({ price: 0, h52: 90 }) };
      const result = enrichHolding(holding, prices, 0, 0);
      expect(result.triggered).toBe(false);
    });

    it('uses max of ath and h52 as the high reference', () => {
      // ATH lower than h52 — h52 should be used as high ref
      const holding = makeHolding({ ath: 80 });
      const prices = { TEST: makePriceRow({ price: 75, ma200: 60, h52: 100 }) };
      // vs h52: (100-75)/100 = 25% → should trigger
      const result = enrichHolding(holding, prices, 0, 0);
      expect(result.triggered).toBe(true);
    });
  });

  describe('daily allocation', () => {
    it('sets baseDaily for core holdings', () => {
      const holding = makeHolding({ category: 'core' });
      const result = enrichHolding(holding, {}, 10, 5);
      expect(result.baseDaily).toBe(10);
    });

    it('sets baseDaily to 0 for non-core holdings', () => {
      const holding = makeHolding({ category: 'wishlist' });
      const result = enrichHolding(holding, {}, 10, 5);
      expect(result.baseDaily).toBe(0);
    });

    it('adds extraDaily when triggered AND doubleDown is active', () => {
      const holding = makeHolding({ doubleDown: true });
      const prices = { TEST: makePriceRow({ price: 40, ma200: 55 }) };
      const result = enrichHolding(holding, prices, 10, 5);
      expect(result.extraDaily).toBe(5);
      expect(result.totalDaily).toBe(15);
    });

    it('does not add extraDaily when triggered but doubleDown is off', () => {
      const holding = makeHolding({ doubleDown: false });
      const prices = { TEST: makePriceRow({ price: 40, ma200: 55 }) };
      const result = enrichHolding(holding, prices, 10, 5);
      expect(result.extraDaily).toBe(0);
      expect(result.totalDaily).toBe(10);
    });

    it('does not add extraDaily when doubleDown is active but NOT triggered', () => {
      const holding = makeHolding({ doubleDown: true, ath: null });
      const prices = { TEST: makePriceRow({ price: 90, ma200: 80 }) };
      const result = enrichHolding(holding, prices, 10, 5);
      expect(result.extraDaily).toBe(0);
    });
  });

  describe('vs metrics', () => {
    it('calculates vsMA as percentage relative to 200-MA', () => {
      const holding = makeHolding();
      const prices = { TEST: makePriceRow({ price: 110, ma200: 100 }) };
      const result = enrichHolding(holding, prices, 0, 0);
      expect(result.vsMA).toBeCloseTo(10);
    });

    it('returns null for vsMA when price or ma200 is 0', () => {
      const holding = makeHolding();
      const prices = { TEST: makePriceRow({ price: 0, ma200: 100 }) };
      const result = enrichHolding(holding, prices, 0, 0);
      expect(result.vsMA).toBeNull();
    });

    it('returns null for vsATH when no high reference exists', () => {
      const holding = makeHolding({ ath: null });
      const prices = { TEST: makePriceRow({ price: 60, h52: 0 }) };
      const result = enrichHolding(holding, prices, 0, 0);
      expect(result.vsATH).toBeNull();
    });
  });

  describe('missing price data', () => {
    it('defaults all price fields to 0 when ticker not in prices map', () => {
      const holding = makeHolding();
      const result = enrichHolding(holding, {}, 0, 0);
      expect(result.price).toBe(0);
      expect(result.ma200).toBe(0);
      expect(result.h52).toBe(0);
      expect(result.dailyChange).toBe(0);
    });
  });

  describe('sector', () => {
    it('passes sector from the price row through to the enriched holding', () => {
      const holding = makeHolding();
      const prices = { TEST: makePriceRow({ sector: 'Technology' }) };
      const result = enrichHolding(holding, prices, 0, 0);
      expect(result.sector).toBe('Technology');
    });

    it('returns undefined sector when the price row has no sector', () => {
      const holding = makeHolding();
      const prices = { TEST: makePriceRow({ sector: undefined }) };
      const result = enrichHolding(holding, prices, 0, 0);
      expect(result.sector).toBeUndefined();
    });

    it('returns undefined sector when ticker is not in the prices map', () => {
      const holding = makeHolding();
      const result = enrichHolding(holding, {}, 0, 0);
      expect(result.sector).toBeUndefined();
    });
  });
});
