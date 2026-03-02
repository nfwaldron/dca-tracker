import { useState, useCallback, type Dispatch } from 'react';
import type { Action } from '../types';
import { fetchQuotes } from '../services/yahooFinance';
import { notifications } from '@mantine/notifications';

export interface UsePricesResult {
  loading: boolean;
  lastUpdated: Date | null;
  error: string | null;
  refresh: () => void;
}

export function usePrices(tickers: string[], dispatch: Dispatch<Action>): UsePricesResult {
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const quotes = await fetchQuotes(tickers);
      for (const q of quotes) {
        dispatch({
          type: 'UPSERT_PRICE',
          payload: {
            ticker: q.symbol,
            price: q.price,
            ma200: q.ma200,
            h52: q.h52,
            dailyChange: q.dailyChange,
            dailyChangePct: q.dailyChangePct,
            yearChangePct: q.yearChangePct,
          },
        });
      }

      // Detect tickers with no data returned or a zero price (likely invalid symbol)
      const returnedSymbols = new Set(quotes.map(q => q.symbol.toUpperCase()));
      const missing = tickers.filter(t => t && !returnedSymbols.has(t.toUpperCase()));
      const zeroPriced = quotes.filter(q => q.price === 0).map(q => q.symbol);
      const problematic = [...new Set([...missing, ...zeroPriced])];

      if (problematic.length > 0) {
        notifications.show({
          color: 'yellow',
          title: 'Price data unavailable',
          message: `Could not fetch prices for: ${problematic.join(', ')}. Check that these ticker symbols are correct.`,
          autoClose: 8000,
        });
      } else {
        notifications.show({
          color: 'green',
          title: 'Prices updated',
          message: `Fetched latest prices for ${tickers.length} holding${tickers.length !== 1 ? 's' : ''}.`,
          autoClose: 3000,
        });
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Price fetch failed');
    } finally {
      setLoading(false);
    }
  }, [tickers, dispatch]);

  return { loading, lastUpdated, error, refresh };
}
