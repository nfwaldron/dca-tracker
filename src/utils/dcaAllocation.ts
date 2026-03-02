import type { Holding, DcaBucket, EnrichedHolding, PriceRow } from '../types';
import { enrichHolding } from './holding';

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
  coverageRatio: number; // 0–1: how much of the needed extra the budget covers
  shortfall: number;
}

/**
 * Mirror of the trigger check inside enrichHolding — used to compute proportional
 * extra allocations before the full enrichment pass.
 */
function isTriggered(h: Holding, prices: Record<string, PriceRow>): boolean {
  const p = prices[h.ticker];
  if (!p || p.price === 0) return false;
  const highRef = Math.max(h.ath ?? 0, p.h52);
  const belowATH = highRef > 0 && (highRef - p.price) / highRef >= 0.2;
  return belowATH;
}

/**
 * Pure computation of all DCA allocation figures.
 *
 * @param holdings      Full holdings list from state
 * @param buckets       Bucket definitions from state
 * @param prices        Current price map from state
 * @param budget        Per-pay-period DCA budget (stored as biWeeklyBudget in state)
 * @param doubleDownBudget  Per-pay-period extra budget for double-downs
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

  // ── Per-ticker base daily allocation ───────────────────────────
  // Bucketed stocks share one slot equally; solo core stocks get a full slot each.
  const dailyAmtByTicker: Record<string, number> = {};
  for (const h of holdings) {
    if (h.category !== 'core') {
      dailyAmtByTicker[h.ticker] = 0;
      continue;
    }
    const bucket = buckets.find(b => b.tickers.includes(h.ticker));
    dailyAmtByTicker[h.ticker] = bucket ? perSlotDailyAmt / bucket.tickers.length : perSlotDailyAmt;
  }

  // ── Double-down coverage ratio (pre-enrichment) ────────────────
  // Which core holdings are actually triggered AND opted in right now?
  // We compute this before enrichHolding so we can pass proportional extra amounts in.
  const ddEntries = holdings.filter(
    h => h.category === 'core' && h.doubleDown && isTriggered(h, prices),
  );
  // Total "weight" = sum of each opted-in stock's base daily amount.
  // Bucketed stocks already have a smaller base (1/N of the slot), so the extra
  // they need is proportionally smaller — matching the user's intent.
  const totalDDWeight = ddEntries.reduce((s, h) => s + (dailyAmtByTicker[h.ticker] ?? 0), 0);
  const extraNeededPeriod = totalDDWeight * daysInPayPeriod;
  const canFullyCover = doubleDownBudget >= extraNeededPeriod;
  const actualExtraTotal = Math.min(doubleDownBudget, extraNeededPeriod);
  const coverageRatio = totalDDWeight > 0
    ? Math.min(1, doubleDownBudget / daysInPayPeriod / totalDDWeight)
    : 1;
  const shortfall = Math.max(0, extraNeededPeriod - doubleDownBudget);

  // Per-ticker extra daily = base × coverageRatio (only for opted-in + triggered stocks).
  // enrichHolding still gates on triggered && doubleDown internally, so passing 0 for
  // non-qualifying stocks is safe.
  const ddSet = new Set(ddEntries.map(h => h.ticker));
  const extraDailyByTicker: Record<string, number> = {};
  for (const h of holdings) {
    extraDailyByTicker[h.ticker] = ddSet.has(h.ticker)
      ? (dailyAmtByTicker[h.ticker] ?? 0) * coverageRatio
      : 0;
  }

  // ── Enriched views ─────────────────────────────────────────────
  const enriched = holdings.map(h =>
    enrichHolding(
      h,
      prices,
      dailyAmtByTicker[h.ticker] ?? 0,
      extraDailyByTicker[h.ticker] ?? 0,
    ),
  );
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

  // ── Double-down groups (from enriched holdings) ────────────────
  const triggeredAll = allCore.filter(h => h.triggered);
  const doubleDownActive = allCore.filter(h => h.triggered && h.doubleDown);
  const doubleDownPending = allCore.filter(h => h.triggered && !h.doubleDown);

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
    coverageRatio,
    shortfall,
  };
}
