import type { DBState, Action } from '../types';

export const INITIAL_STATE: DBState = {
  holdings: [],
  prices: {},
  biWeeklyBudget: 300,
  doubleDownBudget: 0,
  buckets: [],
  payFrequency: 'biweekly',
  displayPeriods: ['biweekly'],
  roles: [],
};

/**
 * Pure reducer — no React, no side effects, no DB access.
 * Receives the current state and an action, returns the next state.
 */
export function reducer(state: DBState, action: Action): DBState {
  switch (action.type) {
    case 'UPSERT_HOLDING': {
      const exists = state.holdings.some(h => h.id === action.payload.id);
      return {
        ...state,
        holdings: exists
          ? state.holdings.map(h => (h.id === action.payload.id ? action.payload : h))
          : [...state.holdings, action.payload],
      };
    }

    case 'DELETE_HOLDING':
      return {
        ...state,
        holdings: state.holdings.filter(h => h.id !== action.payload),
        // Strip the deleted ticker from any buckets; remove now-empty buckets
        buckets: state.buckets
          .map(b => ({ ...b, tickers: b.tickers.filter(t => t !== action.payload) }))
          .filter(b => b.tickers.length > 0),
      };

    case 'TOGGLE_DOUBLE_DOWN':
      return {
        ...state,
        holdings: state.holdings.map(h =>
          h.id === action.payload ? { ...h, doubleDown: !h.doubleDown } : h,
        ),
      };

    case 'UPSERT_PRICE': {
      const { ticker, ...row } = action.payload;
      const prev = state.prices[ticker];
      // Always keep the highest h52 ever seen — guards against Yahoo's rolling window
      const h52 = Math.max(prev?.h52 ?? 0, row.h52, row.price);
      return { ...state, prices: { ...state.prices, [ticker]: { ...row, h52 } } };
    }

    case 'SET_BIWEEKLY_BUDGET':
      return { ...state, biWeeklyBudget: action.payload };

    case 'SET_DOUBLE_DOWN_BUDGET':
      return { ...state, doubleDownBudget: action.payload };

    case 'UPSERT_BUCKET': {
      const exists = state.buckets.some(b => b.id === action.payload.id);
      return {
        ...state,
        buckets: exists
          ? state.buckets.map(b => (b.id === action.payload.id ? action.payload : b))
          : [...state.buckets, action.payload],
      };
    }

    case 'DELETE_BUCKET':
      return { ...state, buckets: state.buckets.filter(b => b.id !== action.payload) };

    case 'SET_PAY_FREQUENCY':
      return { ...state, payFrequency: action.payload };

    case 'SET_DISPLAY_PERIODS':
      return { ...state, displayPeriods: action.payload };

    case 'ADD_ROLE': {
      const label = action.payload.trim();
      if (!label || state.roles.includes(label)) return state;
      return { ...state, roles: [...state.roles, label] };
    }

    case 'RENAME_ROLE': {
      const { oldName, newName } = action.payload;
      const trimmed = newName.trim();
      if (!trimmed || trimmed === oldName || state.roles.includes(trimmed)) return state;
      return {
        ...state,
        roles: state.roles.map(r => (r === oldName ? trimmed : r)),
        // Walk all holdings atomically so role references stay consistent
        holdings: state.holdings.map(h => (h.role === oldName ? { ...h, role: trimmed } : h)),
      };
    }

    case 'DELETE_ROLE': {
      return { ...state, roles: state.roles.filter(r => r !== action.payload) };
    }

    case 'LOAD_SNAPSHOT': {
      // Migrate any holdings still in the legacy { shares, avgCost } format
      const migratedHoldings = (action.payload.holdings as any[]).map(h => {
        if (h.positions) return h;
        const positions: Array<{ broker: string; shares: number; avgCost: number }> = [];
        if ((h.shares?.robinhood ?? 0) > 0)
          positions.push({
            broker: 'Robinhood',
            shares: h.shares.robinhood,
            avgCost: h.avgCost?.robinhood ?? 0,
          });
        if ((h.shares?.moomoo ?? 0) > 0)
          positions.push({
            broker: 'Moomoo',
            shares: h.shares.moomoo,
            avgCost: h.avgCost?.moomoo ?? 0,
          });
        const { shares: _s, avgCost: _a, ...rest } = h;
        return { ...rest, positions };
      });
      return {
        ...action.payload,
        holdings: migratedHoldings,
        buckets: action.payload.buckets ?? [],
        doubleDownBudget: (action.payload as any).doubleDownBudget ?? (action.payload as any).extraBudget ?? 0,
        payFrequency: action.payload.payFrequency ?? 'biweekly',
        displayPeriods: action.payload.displayPeriods ?? ['biweekly'],
        roles: action.payload.roles ?? [],
      };
    }

    default:
      return state;
  }
}
