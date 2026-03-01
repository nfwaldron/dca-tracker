import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// Vercel Node.js serverless function — proxies Yahoo Finance quote requests.
// The frontend calls /api/yahoo-quote?symbols=AAPL,MSFT and this function
// fetches from Yahoo server-side (no CORS issues) and returns the raw quote objects.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any): Promise<void> {
  const symbolsParam: string = req.query?.symbols ?? '';
  const symbols: string[] = symbolsParam.split(',').filter(Boolean);

  if (symbols.length === 0) {
    res.status(400).json({ error: 'No symbols provided' });
    return;
  }

  try {
    const results = await Promise.allSettled(symbols.map((s: string) => yf.quote(s)));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotes = results
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);

    res.status(200).json(quotes);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
