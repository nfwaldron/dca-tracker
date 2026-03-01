import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'yahoo-finance-proxy',
      configureServer(server) {
        server.middlewares.use('/api/yahoo-quote', async (req, res) => {
          const params  = new URLSearchParams(req.url!.split('?')[1] ?? '');
          const symbols = (params.get('symbols') ?? '').split(',').filter(Boolean);

          if (symbols.length === 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'No symbols provided' }));
            return;
          }

          try {
            const results = await Promise.allSettled(
              symbols.map(s => yahooFinance.quote(s)),
            );

            const quotes = results
              .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
              .map(r => r.value);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(quotes));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      },
    },
  ],
})
