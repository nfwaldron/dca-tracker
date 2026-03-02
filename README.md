# DCA Tracker

A portfolio tracker built around a disciplined **Dollar-Cost Averaging + Double Down strategy**: invest a fixed amount every pay period, then deploy extra capital when a stock is genuinely on sale.

**Live app:** [https://dca-tracker-gold.vercel.app](https://dca-tracker-gold.vercel.app)

---

## Credit

The strategy implemented in this app was created by **Tom Nash** — investor, educator, and one of the clearest voices in retail investing. Tom shares his full Enhanced DCA strategy freely with his community. This app is purely a tool to make that strategy easier to execute day-to-day. All credit for the approach belongs to him.

- **YouTube** — [Strategy announcement video](https://www.youtube.com/watch?v=GzTpIeT3prY)
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

When a core holding meets either condition, it becomes eligible for a **Double Down** — an extra allocation on top of its regular DCA slot:

| Trigger | Condition |
|---|---|
| Below 200-day MA | Price is below the long-term trend line |
| Off 52-week high | Price is ≥ 20% below its recent high |

Triggering alone does nothing — you **opt in** per holding in the DCA Planner. This forces a deliberate conviction check before deploying extra capital and keeps impulsive over-allocation in check.

A separate **Double-Down Budget** funds these extra allocations, entirely independent of your core DCA budget.

### Discipline Over Emotion

The system is designed so you never have to decide in the moment:

- DCA runs on a fixed schedule regardless of price
- Double-down triggers are price-driven, not gut-driven
- Quarterly check-ups are enough — resist daily portfolio refreshes

---

## Try It

**No account required.** Click **"Try without an account"** on the landing page to use the full app immediately. Your data saves to your browser locally. If you later decide to create an account, your portfolio migrates automatically.

**Create a free account** to sync your portfolio across devices. Sign up takes under a minute — Google sign-in is supported.

**Share your portfolio** — generate a read-only snapshot link from the Portfolio tab. Anyone can view it with no login required.

---

## Features

- **DCA Planner** — per-holding allocation table; configurable pay periods (daily / weekly / bi-weekly / monthly); double-down alert banner for unacknowledged triggers
- **Double-Down tracking** — triggered holdings flagged automatically; opt in per stock; budget coverage and shortfall shown in real time
- **Bucket Manager** — group related holdings into a single DCA slot
- **Portfolio view** — market value, cost basis, gain/loss, and allocation pie; period toggle between Today / 1 Year / All Time
- **Share Portfolio** — read-only snapshot link, no login required for the recipient
- **Manage tab** — add / edit / delete holdings with per-broker position breakdown
- **Setup Wizard** — guided first-run flow for new users
- **Auto company name** — type a ticker and tab away; company name fills in automatically
- **Live prices** — Yahoo Finance data refreshed on demand
- **Roles** — create custom thematic labels (e.g. "Landlord", "Power Grid") and assign them to holdings
- **Glossary** — plain-English definitions for every term in the app

---

## Holdings Categories

| Category | Meaning |
|---|---|
| **Core** | Actively DCA'd — receives a budget allocation each pay period |
| **Extra** | Held but not on a DCA schedule — tracked for P&L only |
| **Watchlist** | Stocks you're watching but haven't bought yet |

---

## Disclaimer

For informational purposes only — not financial advice. Data sourced from Yahoo Finance. Always do your own research.
