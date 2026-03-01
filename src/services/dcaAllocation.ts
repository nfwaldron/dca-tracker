import type { Holding, DcaBucket, EnrichedHolding, PriceRow } from '../types';
import { enrichHolding } from '../utils/holding';

export interface DcaAllocation {
  // ── Holdings slices ────────────────────────────────────────────
  allEnriched: EnrichedHolding[];
  soloCore: Holding[];
  soloEnriched: EnrichedHolding[];
  allCore: EnrichedHolding[];
  wishlist: EnrichedHolding[];

  // ── Budget ─────────────────────────────────────────────────────
  effectiveSlots: number;
  perSlotDailyAmt: number;
  perSlotPeriodAmt: number; // = budget / effectiveSlots
  activePeriodTotal: number; // sum of totalDaily * daysInPayPeriod across all core
  slotBreakdown: string; // human-readable, e.g. "5 solo · 1 bucket · 6 slots"

  // ── Double-down groups ─────────────────────────────────────────
  triggeredAll: EnrichedHolding[];
  doubleDownActive: EnrichedHolding[]; // triggered AND opted in
  doubleDownPending: EnrichedHolding[]; // triggered but NOT opted in

  // ── Affordability ──────────────────────────────────────────────
  extraNeededPeriod: number;
  canFullyCover: boolean;
  actualExtraTotal: number;
  actualPerStock: number;
  shortfall: number;
}

/**
 * Pure computation of all DCA allocation figures.
 *
 * @param holdings      Full holdings list from state
 * @param buckets       Bucket definitions from state
 * @param prices        Current price map from state
 * @param budget        Per-pay-period DCA budget (stored as biWeeklyBudget in state)
 * @param extraBudget   Per-pay-period extra budget for double-downs
 * @param daysInPayPeriod  Trading days in the user's pay period (5/10/21)
 */
export function computeDcaAllocation(
  holdings: Holding[],
  buckets: DcaBucket[],
  prices: Record<string, PriceRow>,
  budget: number,
  doubleDownBudget: number,
  daysInPayPeriod: number,
): DcaAllocation {
  // ── Slot layout ────────────────────────────────────────────────
  const bucketedTickers = new Set(buckets.flatMap(b => b.tickers));
  const soloCore = holdings.filter(h => h.category === 'core' && !bucketedTickers.has(h.ticker));
  const effectiveSlots = soloCore.length + buckets.length;
  const perSlotDailyAmt = effectiveSlots > 0 ? budget / effectiveSlots / daysInPayPeriod : 0;

  // ── Per-ticker daily allocation ────────────────────────────────
  const dailyAmtByTicker: Record<string, number> = {};
  for (const h of holdings) {
    if (h.category !== 'core') {
      dailyAmtByTicker[h.ticker] = 0;
      continue;
    }
    const bucket = buckets.find(b => b.tickers.includes(h.ticker));
    dailyAmtByTicker[h.ticker] = bucket ? perSlotDailyAmt / bucket.tickers.length : perSlotDailyAmt;
  }

  // ── Enriched views ─────────────────────────────────────────────
  const enriched = holdings.map(h => {
    const daily = dailyAmtByTicker[h.ticker] ?? 0;
    return enrichHolding(h, prices, daily, daily);
  });
  const soloEnriched = enriched.filter(
    h => h.category === 'core' && !bucketedTickers.has(h.ticker),
  );
  const allCore = enriched.filter(h => h.category === 'core');
  const wishlist = enriched.filter(h => h.category === 'wishlist');

  // ── Budget summaries ───────────────────────────────────────────
  const perSlotPeriodAmt = perSlotDailyAmt * daysInPayPeriod;
  const activePeriodTotal = allCore.reduce((s, h) => s + h.totalDaily * daysInPayPeriod, 0);

  const slotBreakdown = [
    `${soloCore.length} solo`,
    ...(buckets.length > 0 ? [`${buckets.length} bucket${buckets.length > 1 ? 's' : ''}`] : []),
    `${effectiveSlots} slots`,
  ].join(' · ');

  // ── Double-down groups ─────────────────────────────────────────
  const triggeredAll = allCore.filter(h => h.triggered);
  const doubleDownActive = allCore.filter(h => h.triggered && h.doubleDown);
  const doubleDownPending = allCore.filter(h => h.triggered && !h.doubleDown);

  // ── Affordability ──────────────────────────────────────────────
  const extraNeededPeriod = doubleDownActive.reduce((s, h) => s + h.baseDaily * daysInPayPeriod, 0);
  const canFullyCover = doubleDownBudget >= extraNeededPeriod;
  const actualExtraTotal = Math.min(doubleDownBudget, extraNeededPeriod);
  const actualPerStock = doubleDownActive.length > 0 ? actualExtraTotal / doubleDownActive.length : 0;
  const shortfall = extraNeededPeriod - doubleDownBudget;

  return {
    allEnriched: enriched,
    soloCore,
    soloEnriched,
    allCore,
    wishlist,
    effectiveSlots,
    perSlotDailyAmt,
    perSlotPeriodAmt,
    activePeriodTotal,
    slotBreakdown,
    triggeredAll,
    doubleDownActive,
    doubleDownPending,
    extraNeededPeriod,
    canFullyCover,
    actualExtraTotal,
    actualPerStock,
    shortfall,
  };
}
