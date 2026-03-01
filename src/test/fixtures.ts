import type { Holding, EnrichedHolding, PriceRow, DcaBucket, DBState } from '../types';

// ── Primitive factories ─────────────────────────────────────────────────────

export function makePriceRow(overrides: Partial<PriceRow> = {}): PriceRow {
  return {
    price: 60,
    ma200: 55,
    h52: 90,
    dailyChange: 1,
    dailyChangePct: 1.7,
    yearChangePct: 20,
    ...overrides,
  };
}

export function makeHolding(overrides: Partial<Holding> = {}): Holding {
  return {
    id: 'TEST',
    ticker: 'TEST',
    name: 'Test Company',
    role: 'Test Role',
    category: 'core',
    positions: [{ broker: 'Robinhood', shares: 10, avgCost: 50 }],
    ath: 100,
    doubleDown: false,
    ...overrides,
  };
}

export function makeEnrichedHolding(overrides: Partial<EnrichedHolding> = {}): EnrichedHolding {
  return {
    ...makeHolding(),
    totalShares: 10,
    weightedAvg: 50,
    triggered: false,
    baseDaily: 5,
    extraDaily: 0,
    totalDaily: 5,
    weeklyTotal: 25,
    mktVal: 600,
    costBasis: 500,
    gl: 100,
    glPct: 20,
    price: 60,
    ma200: 55,
    h52: 90,
    vsMA: 9.09,
    vsATH: -40,
    dailyChange: 1,
    dailyChangePct: 1.7,
    yearChangePct: 20,
    ...overrides,
  };
}

export function makeBucket(overrides: Partial<DcaBucket> = {}): DcaBucket {
  return {
    id: 'bucket-1',
    name: 'Test Bucket',
    tickers: ['AAPL', 'MSFT'],
    ...overrides,
  };
}

export function makeDBState(overrides: Partial<DBState> = {}): DBState {
  return {
    holdings: [],
    prices: {},
    biWeeklyBudget: 500,
    doubleDownBudget: 0,
    buckets: [],
    payFrequency: 'biweekly',
    displayPeriods: ['biweekly'],
    roles: [],
    ...overrides,
  };
}

// ── Scenario helpers ────────────────────────────────────────────────────────

/** A core holding whose price is below the 200-MA → triggers double-down */
export const triggeredHolding = makeHolding({
  id: 'AMZN',
  ticker: 'AMZN',
  name: 'Amazon',
  doubleDown: true,
});
export const triggeredPrice = makePriceRow({ price: 40, ma200: 55, h52: 90 });

/** A holding that is ≥20% off its ATH → also triggers */
export const athTriggeredHolding = makeHolding({
  id: 'PLTR',
  ticker: 'PLTR',
  ath: 100,
  doubleDown: false,
});
export const athTriggeredPrice = makePriceRow({ price: 75, ma200: 60, h52: 100 });

/** A holding with no price data yet */
export const noPriceHolding = makeHolding({ id: 'NEW', ticker: 'NEW' });
