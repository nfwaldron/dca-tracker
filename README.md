# DCA Tracker

A portfolio tracker built around a disciplined **Dollar-Cost Averaging + Double Down strategy**: invest a fixed amount every pay period, then deploy extra capital when a stock is genuinely on sale.

**Live app:** [https://dca-tracker-gold.vercel.app](https://dca-tracker-gold.vercel.app)

---

## Credit

The strategy implemented in this app was created by **Tom Nash** — investor, educator, and one of the clearest voices in retail investing. Tom shares his full Enhanced DCA strategy freely with his community. This app is purely a tool to make that strategy easier to execute day-to-day. All credit for the approach belongs to him.

- **YouTube** — [Tom Nash (@TomNashTV)](https://www.youtube.com/@TomNashTV)
- **Patreon** — [Full strategy, free](https://www.patreon.com/cw/tomnash)

---

## The Strategy

### Dollar-Cost Averaging (DCA)

Invest a **fixed amount** into each core holding every pay cycle — weekly, bi-weekly, or monthly — regardless of what the market is doing. This removes emotional guesswork, lowers your average cost basis over time, and keeps you consistently in the market.

Your total DCA budget is divided into equal **slots**:

- Each solo core holding = 1 slot
- Each bucket (a group of holdings sharing one slot) = 1 slot
- Holdings inside a bucket split that slot's dollar amount equally

**Example:** $300 bi-weekly ÷ 6 core holdings = $50 per holding per pay period. Add a new holding and everything re-balances automatically.

### The Double Down

When a core holding drops **20% or more below its 52-week high** (or all-time high if set), it becomes eligible for a **Double Down** — an extra allocation on top of its regular DCA slot.

Triggering alone does nothing — you **opt in** per holding in the DCA Planner. This forces a deliberate conviction check before deploying extra capital.

A separate **Double-Down Budget** funds these extra allocations, entirely independent of your core DCA budget.

### Discipline Over Emotion

The system is designed so you never have to decide in the moment:

- DCA runs on a fixed schedule regardless of price
- Double-down triggers are price-driven, not gut-driven
- Quarterly check-ups are enough — resist daily portfolio refreshes

---

## Get Started

| | Option | What you need |
|---|---|---|
| **Web app** | [dca-tracker-gold.vercel.app](https://dca-tracker-gold.vercel.app) | Nothing — open and use immediately |
| **Self-hosted** | Clone and run locally | Node.js — no accounts, no API keys |

### Web app

**No account required.** Click **"Try without an account"** on the landing page to use the full app immediately. Your data saves to your browser locally. If you later decide to create an account, your portfolio migrates automatically.

**Create a free account** to sync your portfolio across devices. Sign up takes under a minute — Google sign-in is supported.

**Share your portfolio** — generate a read-only snapshot link from the Portfolio tab. Anyone can view it with no login required.

### Run it yourself

```bash
git clone https://github.com/nfwaldron/dca-tracker.git
npm install
npm run dev   # opens at http://localhost:5173
```

That's it. The app runs in guest mode — data saves to your browser's localStorage. No Supabase, no Clerk, no API keys required. Live price refresh won't work without extra setup (see the Developer section below), but you can enter prices manually under Manage → Price Data.

---

## Features

- **DCA Planner** — per-holding allocation table; configurable pay periods; double-down alert banner for unacknowledged triggers
- **Double-Down tracking** — triggered holdings flagged automatically; opt in per stock; budget coverage and shortfall shown in real time
- **Bucket Manager** — group related holdings into a single DCA slot
- **Portfolio view** — market value, cost basis, gain/loss, and allocation pie; period toggle between Today / 1 Year / All Time
- **Share Portfolio** — read-only snapshot link, no login required for the recipient
- **Manage tab** — add / edit / delete holdings with per-broker position breakdown
- **Setup Wizard** — guided first-run flow for new users
- **Auto company name** — type a ticker and tab away; company name fills in automatically
- **Live prices** — Yahoo Finance data refreshed on demand
- **Roles** — custom thematic labels (e.g. "Landlord", "Power Grid") assignable to holdings
- **Glossary** — plain-English definitions for every term in the app

---

## Holdings Categories

| Category | Meaning |
|---|---|
| **Core** | Actively DCA'd — receives a budget allocation each pay period |
| **Extra** | Held but not on a DCA schedule — tracked for P&L only |
| **Watchlist** | Stocks you're watching but haven't bought yet |

---

## For Developers

<details>
<summary><strong>Running Locally</strong></summary>

### Zero setup (no accounts needed)

```bash
git clone <repo>
npm install
npm run dev   # http://localhost:5173
```

The app opens in guest mode — all data saves to your browser's localStorage. No external accounts or API keys required. The "Refresh prices" button won't work without the Vercel dev server (see below), but you can manually set prices under Manage → Price Data.

### Full stack (with live prices)

```bash
cp .env.example .env   # fill in your three keys (see Environment Variables below)
npx vercel dev         # runs the frontend + price proxy together
```

</details>

<details>
<summary><strong>Environment Variables</strong></summary>

Three variables are required for the full cloud experience. Copy `.env.example` to `.env` and fill them in. Add the same three to your Vercel project under Settings → Environment Variables.

| Variable | Notes |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key — safe to expose |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key — safe to expose; RLS enforces per-user isolation |

> The price proxy uses `yahoo-finance2` and requires no API key.

</details>

<details>
<summary><strong>Clerk Setup</strong></summary>

1. Create a project at [clerk.com](https://clerk.com)
2. Copy your **Publishable Key** → `VITE_CLERK_PUBLISHABLE_KEY`
3. In Clerk → **JWT Templates**, create a template named exactly **`supabase`** — required for the share link feature
4. To add Google sign-in: Clerk → User & Authentication → Social Connections → Google (no code changes needed)

</details>

<details>
<summary><strong>Supabase Setup</strong></summary>

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Authentication → Sign In Methods → Add provider → Clerk**. Paste your Clerk Frontend API URL. This lets Supabase verify Clerk JWTs natively.
3. Copy your **Project URL** and **anon key** from Settings → API
4. Run the following in the Supabase SQL Editor:

```sql
CREATE TABLE holdings (
  id          text NOT NULL,
  user_id     text NOT NULL,
  ticker      text NOT NULL,
  name        text NOT NULL,
  role        text,
  category    text NOT NULL,
  positions   jsonb NOT NULL DEFAULT '[]',
  ath         real,
  double_down boolean NOT NULL DEFAULT false,
  PRIMARY KEY (id, user_id)
);

CREATE TABLE prices (
  ticker           text PRIMARY KEY,
  price            real NOT NULL DEFAULT 0,
  ma200            real NOT NULL DEFAULT 0,
  h52              real NOT NULL DEFAULT 0,
  daily_change     real NOT NULL DEFAULT 0,
  daily_change_pct real NOT NULL DEFAULT 0,
  year_change_pct  real NOT NULL DEFAULT 0,
  fetched_at       timestamptz DEFAULT now()
);

CREATE TABLE buckets (
  id      text NOT NULL,
  user_id text NOT NULL,
  name    text NOT NULL,
  tickers jsonb NOT NULL DEFAULT '[]',
  PRIMARY KEY (id, user_id)
);

CREATE TABLE settings (
  user_id text NOT NULL,
  key     text NOT NULL,
  value   text NOT NULL,
  PRIMARY KEY (user_id, key)
);

CREATE TABLE shares (
  token      text PRIMARY KEY,
  user_id    text NOT NULL,
  snapshot   jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE buckets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices   ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own holdings"        ON holdings FOR ALL    USING (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "own buckets"         ON buckets  FOR ALL    USING (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "own settings"        ON settings FOR ALL    USING (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "prices public read"  ON prices   FOR SELECT USING (true);
CREATE POLICY "prices auth write"   ON prices   FOR ALL    USING (auth.jwt() ->> 'sub' IS NOT NULL);
CREATE POLICY "shares public read"  ON shares   FOR SELECT USING (true);
CREATE POLICY "own shares write"    ON shares   FOR ALL    USING (auth.jwt() ->> 'sub' = user_id);
```

> **Note:** RLS policies use `auth.jwt() ->> 'sub'` (not `auth.uid()`) because this is a Clerk JWT, not a native Supabase auth token.

</details>

<details>
<summary><strong>Architecture</strong></summary>

```
Browser (React SPA)
  │
  ├── Clerk          Auth — login, sessions, JWT
  │
  ├── Supabase       Database — Postgres with Row Level Security
  │
  └── Vercel         Hosting + /api/yahoo-quote price proxy
```

**Tech stack**

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript + Vite 7 |
| Components | Mantine v8 (dark mode default) |
| Charts | Recharts |
| Auth | Clerk |
| Database | Supabase (Postgres) |
| Hosting | Vercel |
| Prices | yahoo-finance2 (no API key) |
| State | Context + useReducer |

**Data flow**

- On load: Clerk JWT → authenticated Supabase client → portfolio loaded → prices auto-fetched from `/api/yahoo-quote`
- On change: reducer updates React state → 500ms debounce → Supabase upsert
- Guest mode: no external calls — state reads/writes go to `localStorage` directly
- Share links: anonymous Supabase query against the `shares` table (public SELECT policy)

**Deployment**

The app auto-deploys to Vercel on push to `main`. No build config needed beyond the three environment variables. The price proxy at `api/yahoo-quote.ts` is picked up automatically as a Vercel Serverless Function.

</details>

---

## Issues & Feedback

Found a bug or have a feature request? [Open an issue on GitHub](https://github.com/nfwaldron/dca-tracker/issues) — it's the best way to track and discuss problems.

---

## Support

This app is free and open source. If it's useful to you, a coffee is always appreciated — but never expected.

☕ **[Buy me a coffee](https://buymeacoffee.com/nfwaldron)**

---

## Disclaimer

For informational purposes only — not financial advice. Data sourced from Yahoo Finance. Always do your own research.
