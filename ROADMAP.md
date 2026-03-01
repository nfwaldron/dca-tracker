# DCA Tracker — Product Roadmap

> Last updated: February 2026
> This document captures the current state of the app, identified gaps from the UX audit, and a phased plan for growing from a personal tool into a deployable multi-user product.

---

## Current State

The app is a **single-user, localStorage-only** React SPA. It runs entirely in the browser — no backend, no accounts, no sync. Data lives in `localStorage` and is exported/imported manually via JSON files.

**Tech stack today:**
- React 19 + TypeScript + Vite
- Mantine v7 (UI)
- Recharts (pie chart)
- Styled-components (table only, being phased out)
- Yahoo Finance (price fetch via CORS proxy)
- localStorage (persistence)

---

## Phase 1 — UX & Polish (Current App, No Backend)

*Goal: Make the app usable for someone who has never heard of DCA. No infrastructure changes required.*

### ~~1.1 Onboarding Flow~~

**Problem:** New users land on DCA Planner and see an empty blue banner with text instructions. There is no clickable path to take action.

**Solution:**
- Convert the welcome banner into a **3-step progress indicator** with a real button: "Add your first holding →" that switches the active tab to Manage
- Add a persistent "Setup incomplete" badge on the Manage tab until the user has at least one core holding and a budget set
- Consider a one-time "Welcome" modal on first load (detected via `localStorage` flag) that explains what DCA is in two sentences and shows the workflow visually

**Files:** `src/pages/DcaPlanner.tsx`, `src/App.tsx`

---

### ~~1.2 Save Confirmations & Feedback~~

**Problem:** Adding or editing a holding closes the modal silently. Users don't know if their data was saved.

**Solution:**
- Add `notifications.show({ color: 'green', message: 'Holding saved' })` after `handleSave` in `HoldingsTable.tsx`
- Add `notifications.show({ color: 'green', message: 'Prices updated' })` when the refresh completes in `usePrices.ts`
- Add `notifications.show({ color: 'blue', message: 'Settings saved' })` when pay frequency or display periods change in `Manage.tsx`
- Show a visible warning (not just a `title` tooltip) before the Import button: "This replaces all current data"

**Files:** `src/components/manage/HoldingsTable.tsx`, `src/hooks/usePrices.ts`, `src/pages/Manage.tsx`

---

### ~~1.3 Input Validation~~

**Problem:** The app accepts invalid tickers, zero shares, and negative budgets without warning.

**Solution:**
- After a price fetch, check if any tickers returned `price: 0` and show a warning: "Could not fetch prices for: ASDF. Check that the ticker is correct."
- In `EditRow.tsx`: require `shares > 0` and `avgCost > 0` for broker positions; show inline error
- In `BudgetInput`: clamp to `min={0}` and show error if the field is empty on blur
- On `EditRow` ticker field: uppercase-force input and strip whitespace

**Files:** `src/components/manage/EditRow.tsx`, `src/pages/DcaPlanner.tsx`, `src/hooks/usePrices.ts`

---

### ~~1.4 Glossary & Plain-English Labels~~

**Problem:** Terms like "slot," "bucket," "trigger," "core," and "ATH" assume financial literacy that casual investors don't have.

**Solution:**
- Add a **Glossary modal** (question-mark icon in the header) with plain-English definitions:

| Term | Plain English |
|---|---|
| Core holding | A stock you invest in every paycheck |
| Extra | A stock you own but don't DCA into |
| Wishlist | Tracking only — not yet bought |
| Slot | One equal share of your total DCA budget |
| Bucket | A group of stocks sharing one slot |
| Triggered | Price is 20%+ below its peak, or below its 200-day trend — a potential buy signal |
| Double Down | Deploying extra money into a triggered stock on purpose |
| 200-day MA | The stock's average price over the past 200 trading days (trend indicator) |
| Cost Basis | Total money spent on a stock across all purchases |
| ATH | All-Time High — the highest price a stock has ever traded at |

- Replace the category selector in `EditRow.tsx` with descriptive labels below each option
- Add a numeric slot example to the Budget section: "Budget ÷ slots = per-slot amount"

**Files:** New `src/components/ui/GlossaryModal.tsx`, `src/App.tsx`, `src/components/manage/EditRow.tsx`, `src/pages/DcaPlanner.tsx`

---

### ~~1.5 Import / Export Improvements~~

**Problem:** The destructive Import warning is buried in a `title` attribute. Users can accidentally wipe their data.

**Solution:**
- Replace the Import button's silent `title` warning with a `modals.openConfirmModal` that says: "Importing will replace ALL your current holdings, prices, and settings. This cannot be undone. Do you want to continue?" with a red confirm button
- Show a JSON preview (first 5 holdings) in the confirm modal so the user can verify they selected the right file
- After successful export, show a toast: "Exported to dca-tracker-YYYY-MM-DD.json"

**Files:** `src/pages/Manage.tsx`

---

### ~~1.6 Double Down Terminology Consistency~~

**Problem:** CoreTable says "Double Down" / "2× Active" but BucketManager says "2×?" — different labels for the same concept.

**Solution:** Standardize to "2× Active" when on and "Double Down" when off across both CoreTable and BucketManager.

**Files:** `src/components/dca-planner/CoreTable.tsx`, `src/components/dca-planner/BucketManager.tsx`

---

## Phase 2 — Deployment (Public, Still Single-User per Device)

*Goal: Anyone can open a URL and use the app. Data still lives locally in their browser. No accounts required.*

### ~~2.1 Hosting~~

The app is a static SPA — it requires no server to run. Best options:

| Platform | Cost | Custom Domain | Notes |
|---|---|---|---|
| **Vercel** | Free | Yes | Easiest — connect GitHub repo, auto-deploys on push |
| **Netlify** | Free | Yes | Same as Vercel, slightly more config options |
| **Cloudflare Pages** | Free | Yes | Fastest CDN globally, good for latency-sensitive apps |
| **GitHub Pages** | Free | Yes (via CNAME) | Most friction to set up, no preview deploys |

**Recommendation: Vercel.** Connect the GitHub repo, set build command to `npm run build`, output dir to `dist`. Every push to `main` deploys automatically. Preview URLs for every pull request.

### ~~2.2 CORS Proxy for Yahoo Finance~~

**Problem:** Yahoo Finance doesn't allow direct browser requests (CORS). Today the app presumably relies on a proxy or workaround that may break.

**Solution:** Set up a lightweight CORS proxy:
- **Option A:** Vercel Edge Function (`/api/prices.ts`) that proxies Yahoo Finance requests server-side. Free within Vercel's hobby tier.
- **Option B:** Use a dedicated financial data API like [Finnhub](https://finnhub.io) (free tier: 60 calls/minute) or [Alpha Vantage](https://www.alphavantage.co) (free tier: 25 calls/day — too low). Finnhub is the best free alternative.
- **Option C:** Continue with Yahoo but route through a self-hosted proxy (Cloudflare Worker, ~$0/month for low traffic).

**Recommendation: Vercel Edge Function proxying Yahoo.** Keeps the existing Yahoo data format, costs nothing, and runs close to the user.

### ~~2.3 Environment Configuration~~

Add a `.env` file pattern:
```
VITE_PRICE_API_URL=https://your-app.vercel.app/api/prices
VITE_APP_VERSION=1.0.0
```

---

## Phase 3 — User Accounts & Cloud Data

*Goal: Users can log in, access their data from any device, and optionally share portfolios.*

### ~~3.1 Authentication Options~~

| Option | Cost | Complexity | Features |
|---|---|---|---|
| **Clerk** | Free up to 10k MAU | Low — drop-in React SDK | Google/GitHub/email, MFA, user management dashboard |
| **Auth0** | Free up to 7.5k MAU | Medium | Same features, more enterprise-focused |
| **Supabase Auth** | Free (part of Supabase) | Low if using Supabase DB | Tight integration with Postgres DB |
| **Firebase Auth** | Free (Spark plan) | Low | Google ecosystem, real-time DB option |
| **Custom (NextAuth/Lucia)** | Free | High | Full control, more maintenance |

**Recommendation: Clerk + Supabase.** Clerk handles auth (login UI, sessions, tokens) and Supabase handles the database. Both have generous free tiers that easily cover hundreds of users. Clerk's React SDK is ~5 lines to integrate.

### ~~3.2 Database Design~~

When moving from localStorage to a real database, the data model maps cleanly:

```
users
  id (uuid, from Clerk)
  email
  created_at

portfolios
  id
  user_id (FK → users)
  name          -- future: support multiple portfolios
  pay_frequency
  biweekly_budget
  double_down_budget
  display_periods (json array)
  created_at
  updated_at

holdings
  id
  portfolio_id (FK → portfolios)
  ticker
  name
  category      -- core | extra | wishlist
  role
  ath
  double_down   -- boolean

positions
  id
  holding_id (FK → holdings)
  broker
  shares
  avg_cost

prices
  ticker (PK)
  price
  ma200
  h52
  daily_change
  daily_change_pct
  year_change_pct
  fetched_at    -- cache invalidation

buckets
  id
  portfolio_id
  name
  tickers (json array)

roles
  id
  portfolio_id
  label
```

**Key decisions:**
- **Prices are shared** across all users (same ticker = same price). Cache prices for 15 minutes server-side to avoid re-fetching for every user.
- **Portfolio data is per-user** and private by default.
- **Row-level security (RLS)** in Supabase ensures users can only read/write their own data — no custom auth middleware needed.

### 3.3 Migration Path (localStorage → Cloud)

Users who've been using the app locally should not lose their data when they sign up:

1. On first login, detect existing `localStorage` data
2. Show modal: "We found existing data in your browser. Would you like to import it to your account?"
3. On confirm, POST the JSON to the API which populates the database
4. Clear localStorage after successful migration
5. From that point, all reads/writes go through the API

### 3.4 API Layer

Build a thin REST or tRPC API layer between the React app and Supabase:

```
POST   /api/holdings        Create holding
PUT    /api/holdings/:id    Update holding
DELETE /api/holdings/:id    Delete holding
GET    /api/portfolio        Get full portfolio state
PUT    /api/portfolio/settings  Update pay frequency, budgets
GET    /api/prices?tickers=AAPL,MSFT  Fetch/return cached prices
POST   /api/import           Bulk import from JSON
GET    /api/export           Export as JSON
```

**Framework options:**
- **Next.js API routes** — If migrating from Vite to Next.js (worth considering for SEO and server-side rendering)
- **Hono** on Cloudflare Workers — Extremely fast, cheap, TypeScript-native
- **Supabase Edge Functions** — Serverless, co-located with the DB

---

## Phase 4 — Growth Features

*Goal: Features that differentiate the app and drive retention and word-of-mouth.*

### 4.1 CSV Import from Brokerages

Allow users to upload a CSV from Fidelity, Schwab, Robinhood, or E*Trade and auto-populate their holdings and positions. Each broker has a different CSV format — this is significant engineering but removes the biggest onboarding barrier.

Priority brokers: Fidelity, Schwab, Robinhood (largest US user bases).

### ~~4.2 Auto Company Name from Ticker~~

When a user types a ticker in `EditRow`, auto-fetch the company name from the price API and pre-fill the name field. Yahoo Finance returns the company name alongside price data — this is a free win.

### 4.3 DCA Schedule Notifications

Optional email or push notification: "Your bi-weekly DCA is coming up in 2 days — here's what to buy." Requires backend (email via Resend or SendGrid, push via web push API).

### 4.4 Historical Performance Tracking

Currently the app only shows current prices vs. cost basis. Add a "DCA Log" where users record each purchase, enabling:
- True DCA performance vs. lump-sum comparison
- "What would have happened if I'd started DCA'ing 1 year ago?"
- Cost basis update as new purchases are recorded

### 4.5 Sector / Thematic View

In Portfolio, show holdings grouped by sector (tech, energy, healthcare) with allocation percentages. Requires adding a sector field to holdings (auto-populated from Yahoo's sector data).

### ~~4.6 Starter Portfolio Template~~

Add a **"Load Starter Portfolio"** button in the Manage page that imports a curated example portfolio in one click — no download/upload needed.

**How it would work:**
- Maintain a `public/template.json` file (same format as the existing JSON export) containing a sample set of holdings
- The button fetches `/template.json` at runtime and dispatches the same `IMPORT_JSON` action the existing Import button uses
- Show a confirm modal first: "This will replace your current holdings with the starter portfolio. Continue?"
- A user who wants to start from the template but then customize it just loads it and edits from there

**Why this matters:** New users arrive to a blank Manage page with no holdings and no context for what the app does. A pre-populated template with realistic holdings and allocations shows the full UI immediately and gives a concrete starting point.

**Notes:**
- The template file is maintained by the app owner and updated via deployment (no DB required)
- Keep the existing Import (from file) and Export buttons — this is an additional convenience shortcut
- Could be extended to support multiple named templates (e.g., "Tech-heavy", "Balanced")

### ~~4.7 Shared / Read-Only Portfolio Links~~

Generate a read-only URL (`/p/abc123`) that shows a portfolio without login, like Notion's share links. Useful for:
- Showing a spouse or partner your allocation
- Community sharing in investing forums
- Financial advisors reviewing client portfolios

---

## Phase 5 — Monetization (Optional)

*Only relevant if the user base grows and infrastructure costs become non-trivial.*

### Tiered Model

| Tier | Price | Features |
|---|---|---|
| **Free** | $0 | 1 portfolio, up to 20 holdings, manual price refresh |
| **Plus** | $4/month | Unlimited holdings, auto-refresh prices, CSV import, email notifications |
| **Pro** | $12/month | Multiple portfolios, shared links, historical tracking, priority support |

**Implementation:** Stripe + Clerk's billing integration. Supabase RLS policies check the user's subscription tier before allowing writes beyond the free tier.

---

## Decision Log

These are the key architectural decisions and their rationale:

| Decision | Choice | Rationale |
|---|---|---|
| UI framework | Mantine v7 | No Tailwind dependency, first-class dark mode, great data app components |
| Auth provider | Clerk (when ready) | Fastest to integrate in React, handles OAuth + email, free up to 10k MAU |
| Database | Supabase (Postgres) | Row-level security removes need for custom auth middleware; free tier is generous; real-time subscriptions available if needed |
| Hosting | Vercel | Zero config, auto-deploys from GitHub, Edge Functions for price proxy |
| Price data | Yahoo Finance (via proxy) | Free, comprehensive, returns 200-MA + 52W high which are core to the Double Down logic |
| State management | Context + useReducer | Appropriate for current scale; Zustand would be the upgrade path when async data fetching is added |

---

## Open Questions

1. **Multi-portfolio support:** Should users be able to manage separate portfolios (e.g., personal vs. IRA)? The data model supports it from Phase 3, but the UI doesn't expose it yet.

2. **Price data reliability:** Yahoo Finance is not an official API and can break without notice. What's the fallback? Consider adding a secondary provider (Finnhub) that activates if Yahoo fails.

3. **Financial data regulations:** Depending on jurisdiction, displaying financial data and "signals" (like Double Down triggers) may require disclaimers or even licensing. Add a prominent disclaimer before Phase 2 deployment.

4. **Mobile app:** The web app is not mobile-optimized (CoreTable has 15+ columns). Is a React Native / Expo app on the roadmap, or do we optimize the web experience for mobile browsers first?

5. **Data privacy:** Portfolio data is sensitive. Before Phase 3, define and publish a privacy policy. Supabase is SOC 2 compliant; Clerk is also SOC 2 compliant.
