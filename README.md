# DCA Tracker

A personal portfolio tracker built around Tom's **2× DCA + Double Down** strategy. Track your core holdings, monitor double-down triggers, and see exactly how your bi-weekly budget gets allocated across every pay period.

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
- **Portfolio view** — market value, cost basis, G/L, and allocation pie across all holdings
- **Manage tab** — add / edit / delete holdings with per-broker position breakdown
- **Live prices** — Yahoo Finance integration refreshed on demand; 52-week high is floor-tracked so it never shrinks due to Yahoo's rolling window
- **Persistent storage** — all data stored locally in IndexedDB via Dexie; no account or server required

---

## The Manage Tab

The **Manage** tab is where you maintain the data the rest of the app runs on.

### Holdings table

Every holding in your portfolio is listed here. Columns show ticker, name, role, category, total shares (across all brokers), weighted average cost, ATH, and whether the Double Down flag is enabled.

**Adding a holding** — click **Add Holding** at the top of the table. A form expands inline with these fields:

| Field | Notes |
|---|---|
| Ticker | Uppercase symbol (e.g. `AMZN`). Cannot be changed after saving — it doubles as the ID. |
| Name | Display name (e.g. "Amazon") |
| Role | Free-text label for your mental model (e.g. "Landlord", "Power Grid") |
| Category | `core` — included in DCA slot math; `extra` — held but not DCA'd; `watchlist` — not yet owned |
| ATH $ | Optional all-time high override. When set, the Double Down trigger uses `max(ATH, 52W high)` as the high reference. |
| Double Down | Pre-seeds the opt-in toggle. Can also be toggled live from the DCA Planner. |
| Broker Positions | One row per broker — enter the broker name, number of shares held, and average cost per share. Click **Add Broker** to add more rows; the trash icon removes a row. Positions with a blank broker name are ignored on save. |

Click **Save** to confirm, **Cancel** to discard.

**Editing a holding** — click the pencil icon on any row. The same form opens pre-filled with current values. The ticker field is read-only when editing.

**Deleting a holding** — click the trash icon. A confirmation dialog appears before anything is removed. Deleting a holding also strips it from any DCA buckets that contained it; buckets that become empty are removed automatically.

**Broker breakdown** — click the chevron (›) on any row to expand a nested table showing each broker position with its shares, average cost, and total cost basis.

### Price table

Below the holdings table, a separate **Price** section shows the live data for each ticker: current price, 200-day MA, 52-week high, daily change, and year-to-date change. Prices are fetched from Yahoo Finance and refresh on demand.

### Settings

At the top of the Manage tab, two settings apply globally:

- **Pay Frequency** — weekly, bi-weekly (default), or monthly. Controls the number of trading days used in all "per period" calculations.
- **DCA Table columns** — toggle which time horizons (Daily, Weekly, Bi-weekly, Monthly) appear as columns in the DCA Planner. At least one must remain selected.

### Export / Import

Two buttons at the top allow full data portability:

- **Export JSON** — downloads the entire app state (holdings, prices, buckets, settings) as a dated `.json` file.
- **Import JSON** — loads a previously exported file. The snapshot replaces all current data via `LOAD_SNAPSHOT`. The importer also handles the legacy `{ shares, avgCost }` format so old exports still work.

---

## Tech Stack

| Layer | Library |
|---|---|
| UI | React 19 + TypeScript |
| Bundler | Vite 7 |
| Styling | Styled Components 6 |
| Charts | Recharts 3 |
| Storage | Dexie 4 (IndexedDB) |
| Prices | yahoo-finance2 |
| Tests | Vitest + Testing Library |

---

## Getting Started

```bash
npm install
npm run dev        # start dev server
npm run test       # run tests in watch mode
npm run test:run   # single test run (CI)
npm run build      # production build
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
| `TOGGLE_DOUBLE_DOWN` | Reducer action that flips the `doubleDown` flag on a holding |
| `SET_DOUBLE_DOWN_BUDGET` | Reducer action that updates the extra budget |
| `effectiveSlots` | Solo core holdings + buckets — the denominator for per-slot budget math |
| `perSlotDailyAmt` | `budget ÷ effectiveSlots ÷ daysInPayPeriod` |
