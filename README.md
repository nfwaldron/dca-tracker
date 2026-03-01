# DCA Tracker

A personal portfolio tracker built around **Tom's 2× DCA + Double Down strategy**. Track your core holdings, monitor double-down triggers, and see exactly how your budget gets allocated across every pay period. Fully cloud-synced — sign in on any device and your data follows you.

---

## The Strategy

### 1. Dollar-Cost Averaging (DCA)

Invest a **fixed amount** into each core holding on every pay cycle — weekly, bi-weekly, or monthly — regardless of what the market is doing. This removes emotional guesswork, lowers your average cost basis over time, and keeps you consistently in the market.

Your total DCA budget is split evenly across **slots**:

- Each solo core holding = 1 slot
- Each bucket (a group of core holdings sharing one slot) = 1 slot
- Holdings inside a bucket split that slot's dollar amount equally

### 2. The Double Down

When a core holding meets either trigger condition, it becomes eligible for a **Double Down** — an additional allocation on top of its normal DCA:

| Trigger | Condition |
|---|---|
| Below 200-day MA | Price < 200-day moving average |
| Off 52-week high | Price ≥ 20% below the 52-week high (or recorded ATH) |

Triggering alone does nothing — you **opt in** per holding by toggling "Double Down" in the DCA Planner. This keeps you in control and forces a deliberate conviction check before deploying extra capital.

A separate **Double-Down Budget** funds these extra allocations. If the budget covers all opted-in holdings, each gets an equal share. If it falls short, the planner shows you the shortfall so you can adjust.

### 3. Discipline Over Emotion

The system is designed so you **never have to decide in the moment**:

- DCA runs automatically on a schedule
- Double-down triggers are price-driven, not gut-driven
- The opt-in toggle keeps impulsive over-allocation in check
- Periodic check-ups (quarterly) are enough — resist daily portfolio refreshes

---

## Features

- **DCA Planner** — full allocation table per core holding with configurable display periods (daily / weekly / bi-weekly / monthly)
- **Double-Down tracking** — triggered holdings flagged automatically; opt in per stock; budget coverage and shortfall shown in real time
- **Bucket Manager** — group related holdings into a single DCA slot to concentrate exposure
- **Portfolio view** — market value, cost basis, G/L, and allocation pie; period toggle between Today / 1 Year / All Time
- **Share Portfolio** — generate a read-only link to your portfolio snapshot, shareable without requiring others to log in
- **Manage tab** — add / edit / delete holdings with per-broker position breakdown; load an example portfolio or clear all holdings in one click
- **Auto company name** — type a ticker and tab away; the company name is fetched and filled in automatically
- **Live prices** — Yahoo Finance integration refreshed on demand; 52-week high is floor-tracked so it never shrinks due to Yahoo's rolling window
- **Cloud sync** — data stored in Supabase; sign in from any device to access your portfolio
- **Roles** — create custom thematic labels (e.g. "Landlord", "Power Grid") and assign them to holdings
- **Glossary** — plain-English definitions for every term in the app

---

## The Manage Tab

The **Manage** tab is where you maintain the data the rest of the app runs on.

### Toolbar

Four action buttons sit at the top:

| Button | What it does |
|---|---|
| **Export JSON** | Downloads the entire app state (holdings, prices, buckets, settings) as a dated `.json` backup file |
| **Import JSON** | Loads a previously exported `.json` file. Replaces all current data. Shows a preview before confirming. |
| **Load Example Portfolio** | Fetches a curated example portfolio (`public/template.json`) with 15 tickers already categorized and assigned roles. Positions are empty — just the structure to explore the app. |
| **Clear All Holdings** | Deletes all holdings and buckets in one step. Settings and roles are kept. Disabled when there are no holdings. |

### Holdings table

Every holding in your portfolio is listed here. Columns show ticker, name, role, category, total shares (across all brokers), weighted average cost, ATH, and whether the Double Down flag is enabled.

**Adding a holding** — click **Add Holding** at the top of the table. A form expands with these fields:

| Field | Notes |
|---|---|
| Ticker | Uppercase symbol (e.g. `AMZN`). Cannot be changed after saving. Tab away to auto-fill the company name. |
| Name | Display name — auto-filled from Yahoo Finance when you tab away from Ticker. Can be overridden. |
| Role | Pick from your managed roles list (e.g. "Landlord", "Power Grid") |
| Category | `core` — DCA'd each pay period; `extra` — held but not DCA'd; `watchlist` — tracking only |
| ATH $ | Optional all-time high override for holdings whose true ATH is older than 52 weeks |
| Double Down | Pre-seeds the opt-in toggle. Can also be toggled live from the DCA Planner. |
| Broker Positions | One row per broker — broker name, shares held, average cost per share |

**Editing a holding** — click the pencil icon. The same form opens pre-filled; the ticker field is read-only when editing.

**Deleting a holding** — click the trash icon. A confirmation dialog appears. Deleting a holding also removes it from any buckets; empty buckets are removed automatically.

**Broker breakdown** — click the chevron (›) on any row to expand a nested table of per-broker positions.

### Price table

Shows live data for each ticker: current price, 200-day MA, 52-week high, daily change, and 52-week return. Prices refresh from Yahoo Finance on demand.

### Settings

- **Pay Frequency** — weekly, bi-weekly (default), or monthly
- **DCA Table columns** — toggle which time horizons (Daily, Weekly, Bi-weekly, Monthly) appear in the DCA Planner. At least one must remain selected.

### Roles

Create, rename, and delete custom thematic labels. Holdings reference a role from this list. Renaming a role updates all holdings that use it simultaneously.

---

## Portfolio — Share Links

From the **Portfolio** tab, click **Share** to generate a read-only snapshot link:

- The current portfolio state is saved to Supabase as a point-in-time snapshot
- A unique URL is generated: `https://your-app.vercel.app/?share=TOKEN`
- Anyone with the link can view the portfolio — no account required
- The snapshot is static; generate a new link to share updated data
- **Revoke Link** in the modal deletes the snapshot from Supabase

---

## Architecture

### Overview

```
Browser (React SPA)
  │
  ├── Clerk          Auth — login, sessions, JWT
  │
  ├── Supabase       Database — holdings, prices, buckets, settings, shares
  │     (Postgres)   Row Level Security enforced via Clerk JWT
  │
  └── Vercel         Hosting + Edge Functions
        /api/yahoo-quote   Price proxy (server-side Yahoo Finance fetch)
```

### Why Vercel

The app is a static React SPA with one server-side requirement: **price fetching**. Yahoo Finance blocks direct browser requests (CORS), so a server-side proxy is needed. Vercel solves this with a single serverless function (`api/yahoo-quote.ts`) that runs on Node.js at the edge.

Everything else (the React bundle, static assets, `public/template.json`) is served as a static CDN deployment. Vercel connects to the GitHub repo and auto-deploys on every push to `main`, with preview URLs for branches.

### Why Supabase

Supabase provides a managed Postgres database with **Row Level Security (RLS)** built in. RLS is the key architectural decision: it enforces per-user data isolation at the database layer, which means the browser can query Supabase directly without a custom API server.

Without RLS, you'd need a server-side API layer to verify identity and filter data before returning it. With RLS, a policy like `auth.jwt() ->> 'sub' = user_id` is enough — Postgres refuses to return another user's rows even if the client tries.

The `shares` table uses a public SELECT policy so snapshot links work without login, while write operations still require an authenticated JWT.

**Tables:**

| Table | Scope | Notes |
|---|---|---|
| `holdings` | Per user | `positions` stored as JSONB |
| `prices` | Shared (all users) | One row per ticker, overwritten on each refresh |
| `buckets` | Per user | `tickers` stored as JSONB array |
| `settings` | Per user | Key-value pairs (`biWeeklyBudget`, `payFrequency`, etc.) |
| `shares` | Public read | Portfolio snapshots for share links; `snapshot` is JSONB |

### Why Clerk

Clerk handles the entire auth surface — login UI, OAuth providers, session management, JWTs — as a drop-in React SDK. The integration is ~5 lines in `main.tsx` and `App.tsx`.

The critical integration point is the **Supabase JWT template**: Clerk can issue JWTs that Supabase's RLS understands natively. When the app calls `getToken({ template: 'supabase' })`, Clerk issues a JWT containing the user's Clerk ID as `sub`. Supabase's RLS policies read this with `auth.jwt() ->> 'sub'` to identify the user without any custom auth middleware.

### Data Flow

**App load:**
```
Clerk authenticates user
  → getToken({ template: 'supabase' }) → Clerk JWT
  → makeSupabase(token) → authenticated Supabase client
  → loadPortfolio(sb, userId) → fetch holdings, prices, buckets, settings in parallel
  → dispatch(LOAD_SNAPSHOT) → React state populated
  → auto-fetch prices from /api/yahoo-quote
```

**State change (holding added, budget changed, etc.):**
```
User action → dispatch(action) → reducer returns new state
  → 500ms debounce timer resets
  → savePortfolio(sb, userId, state) → upsert all tables in parallel
```

**Share link:**
```
User clicks Share
  → saveShare(sb, userId, state) → upsert snapshot to shares table
  → return token → build URL → user copies link

Recipient opens /?share=TOKEN
  → App detects query param before auth gate renders
  → loadShare(token) → makeSupabase(null) → anonymous query
  → ShareView renders read-only snapshot
```

**Price fetch:**
```
Browser → GET /api/yahoo-quote?symbols=AAPL,MSFT,...
  → Vercel function → yahoo-finance2 → Yahoo Finance
  → raw quotes returned → browser maps to PriceRow shape
  → dispatch(UPSERT_PRICE) per ticker → state + Supabase updated
```

### State Management

No external state library. The app uses React's built-in `useReducer` + `createContext`:

- `StoreProvider` owns the state and the Supabase load/save side effects
- All components call `useStore()` to read state or dispatch actions
- The reducer (`src/store/reducer.ts`) is a pure function with no async code
- Supabase writes are debounced 500ms to batch rapid successive actions

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| UI Framework | React 19 + TypeScript | Component model, concurrent features |
| Build tool | Vite 7 | Fast HMR, ES module native |
| UI components | Mantine v8 | First-class dark mode, rich data app components, no Tailwind dependency |
| Charts | Recharts | Composable, works well with React 19 |
| Auth | Clerk | Drop-in React SDK; Supabase JWT template integration |
| Database | Supabase (Postgres) | RLS eliminates need for custom API; generous free tier |
| Hosting | Vercel | Zero-config deploys; Edge Functions for price proxy |
| Price data | yahoo-finance2 | Free; returns 200-day MA + 52W high needed for Double Down logic |
| State | Context + useReducer | Right-sized for current scale; no external dependency |

---

## Environment Variables

| Variable | Where used | Notes |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Client (browser) | Clerk publishable key — safe to expose |
| `VITE_SUPABASE_URL` | Client (browser) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Client (browser) | Supabase anon key — safe to expose; RLS enforces security |
| `TWELVE_DATA_API_KEY` | Server only (Vercel) | No `VITE_` prefix; never sent to browser |

Copy `.env.example` to `.env` and fill in your values. Also add all four to the Vercel dashboard under Project → Settings → Environment Variables.

---

## Getting Started (Local Development)

### Prerequisites

1. **Clerk account** — create a project at [clerk.com](https://clerk.com). Under JWT Templates, create a template named exactly `supabase`.
2. **Supabase project** — create one at [supabase.com](https://supabase.com). Run the schema SQL below in the SQL Editor.

### Supabase Schema

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

CREATE POLICY "own holdings"  ON holdings FOR ALL USING (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "own buckets"   ON buckets  FOR ALL USING (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "own settings"  ON settings FOR ALL USING (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "prices public read"  ON prices FOR SELECT USING (true);
CREATE POLICY "prices auth write"   ON prices FOR ALL   USING (auth.jwt() ->> 'sub' IS NOT NULL);
CREATE POLICY "shares public read"  ON shares FOR SELECT USING (true);
CREATE POLICY "own shares write"    ON shares FOR ALL   USING (auth.jwt() ->> 'sub' = user_id);
```

### Run Locally

```bash
npm install
cp .env.example .env   # fill in your keys
npm run dev            # http://localhost:5173
npm run build          # production build
```

---

## Key Concepts in the Code

| Term | Meaning |
|---|---|
| `doubleDown` | Boolean on a `Holding` — whether the user has opted this stock into extra allocation |
| `doubleDownBudget` | Extra per-period budget reserved exclusively for double-down allocations |
| `triggered` | Computed flag — true when price is below 200-MA **or** ≥20% off the high reference |
| `doubleDownActive` | Triggered holdings the user has opted into (receive extra allocation) |
| `doubleDownPending` | Triggered holdings not yet opted in (shown in the alert banner) |
| `effectiveSlots` | Solo core holdings + buckets — the denominator for per-slot budget math |
| `perSlotDailyAmt` | `budget ÷ effectiveSlots ÷ daysInPayPeriod` |
| `LOAD_SNAPSHOT` | Reducer action that wholesale-replaces all state — used by import, template load, and cloud load-on-login |
| `enrichHolding()` | Pure function in `src/utils/holding.ts` that computes all derived fields (totalShares, mktVal, gl, triggered, etc.) |

---

## Disclaimer

For informational purposes only — not financial advice. Data via Yahoo Finance. Always do your own research.
