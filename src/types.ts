export type PayFrequency = 'weekly' | 'biweekly' | 'monthly';
export type DisplayPeriod = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface BrokerPosition {
  broker: string;
  shares: number;
  avgCost: number; // per-share average cost
}

export interface Holding {
  id: string;
  ticker: string;
  name: string;
  role: string;
  category: 'core' | 'extra' | 'wishlist';
  positions: BrokerPosition[]; // one entry per broker; empty = no shares yet
  ath: number | null;
  doubleDown: boolean;
}

export interface PriceRow {
  price: number;
  ma200: number;
  h52: number;
  dailyChange: number; // $ change today per share
  dailyChangePct: number; // % change today (e.g. 1.5 = +1.5%)
  yearChangePct: number; // % change over past 52 weeks (e.g. 25 = +25%)
}

export interface DcaBucket {
  id: string;
  name: string;
  tickers: string[]; // must all be core holdings, min 2
  // budget = 1 slot of biWeeklyBudget ÷ effectiveSlots, split among tickers
}

export interface DBState {
  holdings: Holding[];
  prices: Record<string, PriceRow>;
  biWeeklyBudget: number; // total $ to DCA per pay period across all core stocks
  doubleDownBudget: number; // extra $ available per pay period for double-down allocations
  buckets: DcaBucket[];
  payFrequency: PayFrequency; // how often the user gets paid
  displayPeriods: DisplayPeriod[]; // which time-period columns to show in the DCA table
  roles: string[]; // managed list of role labels (ordered)
}

export interface EnrichedHolding extends Holding {
  totalShares: number;
  weightedAvg: number;
  triggered: boolean;
  baseDaily: number;
  extraDaily: number;
  totalDaily: number;
  weeklyTotal: number;
  mktVal: number;
  costBasis: number;
  gl: number;
  glPct: number;
  price: number;
  ma200: number;
  h52: number;
  vsMA: number | null;
  vsATH: number | null;
  dailyChange: number;
  dailyChangePct: number;
  yearChangePct: number;
}

export type Action =
  | { type: 'UPSERT_HOLDING'; payload: Holding }
  | { type: 'DELETE_HOLDING'; payload: string }
  | { type: 'TOGGLE_DOUBLE_DOWN'; payload: string }
  | { type: 'UPSERT_PRICE'; payload: { ticker: string } & PriceRow }
  | { type: 'SET_BIWEEKLY_BUDGET'; payload: number }
  | { type: 'SET_DOUBLE_DOWN_BUDGET'; payload: number }
  | { type: 'UPSERT_BUCKET'; payload: DcaBucket }
  | { type: 'DELETE_BUCKET'; payload: string }
  | { type: 'SET_PAY_FREQUENCY'; payload: PayFrequency }
  | { type: 'SET_DISPLAY_PERIODS'; payload: DisplayPeriod[] }
  | { type: 'ADD_ROLE'; payload: string }
  | { type: 'RENAME_ROLE'; payload: { oldName: string; newName: string } }
  | { type: 'DELETE_ROLE'; payload: string }
  | { type: 'LOAD_SNAPSHOT'; payload: DBState };
