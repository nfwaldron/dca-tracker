/** Shape returned by the Yahoo Finance proxy endpoint */
export interface QuoteResult {
  symbol: string;
  price: number;
  ma200: number;
  h52: number;
  dailyChange: number;
  dailyChangePct: number;
  yearChangePct: number;
}

/**
 * Fetch live quotes for the given tickers from the Yahoo Finance proxy.
 * Pure function — no side effects, no store coupling.
 */
export async function fetchQuotes(tickers: string[]): Promise<QuoteResult[]> {
  const symbols = tickers.filter(Boolean);
  if (symbols.length === 0) return [];

  const res = await fetch(`/api/yahoo-quote?symbols=${encodeURIComponent(symbols.join(','))}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any[] = await res.json();

  return raw
    .filter(item => item?.symbol)
    .map(item => ({
      symbol: item.symbol,
      price: item.regularMarketPrice ?? 0,
      ma200: item.twoHundredDayAverage ?? 0,
      h52: item.fiftyTwoWeekHigh ?? 0,
      dailyChange: item.regularMarketChange ?? 0,
      dailyChangePct: item.regularMarketChangePercent ?? 0,
      yearChangePct: (item.fiftyTwoWeekChange ?? 0) * 100,
    }));
}
