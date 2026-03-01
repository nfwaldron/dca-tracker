import type { Holding, PriceRow, EnrichedHolding } from '../types';

/** Compute all derived metrics for a holding — market value, G/L, DCA allocations, trigger status. */
export function enrichHolding(
  holding: Holding,
  prices: Record<string, PriceRow>,
  baseDailyAmt = 5,
  extraDailyAmt = 5,
): EnrichedHolding {
  const totalShares = holding.positions.reduce((s, p) => s + p.shares, 0);
  const costBasis = holding.positions.reduce((s, p) => s + p.shares * p.avgCost, 0);
  const weightedAvg = totalShares > 0 ? costBasis / totalShares : 0;

  const priceRow = prices[holding.ticker] ?? {
    price: 0,
    ma200: 0,
    h52: 0,
    dailyChange: 0,
    dailyChangePct: 0,
    yearChangePct: 0,
  };
  const { price, ma200, h52, dailyChange, dailyChangePct, yearChangePct } = priceRow;

  // Best known high: explicit ATH if set, otherwise h52 — take whichever is higher
  const highRef = Math.max(holding.ath ?? 0, h52);

  const belowMA = ma200 > 0 && price > 0 && price < ma200;
  const belowATH = highRef > 0 && price > 0 && (highRef - price) / highRef >= 0.2;
  const triggered = belowMA || belowATH;

  const baseDaily = holding.category === 'core' ? baseDailyAmt : 0;
  const extraDaily = triggered && holding.doubleDown ? extraDailyAmt : 0;
  const totalDaily = baseDaily + extraDaily;
  const weeklyTotal = totalDaily * 5;

  const mktVal = totalShares * price;
  const gl = mktVal - costBasis;
  const glPct = costBasis > 0 ? (gl / costBasis) * 100 : 0;

  const vsMA = ma200 > 0 && price > 0 ? ((price - ma200) / ma200) * 100 : null;
  const vsATH = highRef > 0 && price > 0 ? ((price - highRef) / highRef) * 100 : null;

  return {
    ...holding,
    totalShares,
    weightedAvg,
    triggered,
    baseDaily,
    extraDaily,
    totalDaily,
    weeklyTotal,
    mktVal,
    costBasis,
    gl,
    glPct,
    price,
    ma200,
    h52,
    vsMA,
    vsATH,
    dailyChange,
    dailyChangePct,
    yearChangePct,
  };
}
