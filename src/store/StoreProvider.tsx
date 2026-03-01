import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  type Dispatch,
} from 'react';
import type { DBState, Action, PriceRow, PayFrequency, DisplayPeriod } from '../types';
import { db } from '../db';
import { SEED_HOLDINGS, SEED_PRICES, SEED_ROLES } from '../seed';
import { reducer, INITIAL_STATE } from './reducer';

interface StoreCtx {
  state: DBState;
  dispatch: Dispatch<Action>;
  loaded: boolean;
}

const StoreContext = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [loaded, setLoaded] = useState(false);

  // ── Load from IndexedDB on mount ──────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const holdings = await db.holdings.toArray();
        const priceRecords = await db.prices.toArray();

        // Seed prices are the h52 floor — always applied first so known highs
        // survive even if the DB is freshly populated from a Yahoo response
        const prices: Record<string, PriceRow> = {};
        for (const [ticker, seedRow] of Object.entries(SEED_PRICES)) {
          prices[ticker] = { ...seedRow };
        }
        // Overlay live DB values; preserve whichever h52 is higher
        for (const { ticker, price, ma200, h52 } of priceRecords) {
          const floorH52 = prices[ticker]?.h52 ?? 0;
          prices[ticker] = {
            price,
            ma200,
            h52: Math.max(h52, floorH52),
            dailyChange: 0,
            dailyChangePct: 0,
            yearChangePct: 0,
          };
        }

        const biWeeklyRec = await db.settings.get('biWeeklyBudget');
        const biWeeklyBudget = (biWeeklyRec?.value as number) ?? 300;
        const ddRec = await db.settings.get('doubleDownBudget');
        const legacyDDRec = !ddRec ? await db.settings.get('extraBudget') : null;
        const doubleDownBudget = ((ddRec ?? legacyDDRec)?.value as number) ?? 0;
        const buckets = await db.buckets.toArray();
        const payFreqRec = await db.settings.get('payFrequency');
        const payFrequency = (payFreqRec?.value as PayFrequency) ?? 'biweekly';
        const dispPeriodsRec = await db.settings.get('displayPeriods');
        const displayPeriods: DisplayPeriod[] = dispPeriodsRec?.value
          ? JSON.parse(dispPeriodsRec.value as string)
          : ['biweekly'];
        const rolesRec = await db.settings.get('roles');
        const roles: string[] = rolesRec?.value
          ? JSON.parse(rolesRec.value as string)
          : SEED_ROLES;

        dispatch({
          type: 'LOAD_SNAPSHOT',
          payload: {
            holdings: holdings.length > 0 ? holdings : SEED_HOLDINGS,
            prices,
            biWeeklyBudget,
            doubleDownBudget,
            buckets,
            payFrequency,
            displayPeriods,
            roles,
          },
        });
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // ── Sync to IndexedDB on every state change ───────────────────
  useEffect(() => {
    if (!loaded) return;
    db.transaction('rw', db.holdings, db.prices, db.settings, db.buckets, async () => {
      await db.holdings.clear();
      await db.holdings.bulkPut(state.holdings);

      await db.prices.clear();
      await db.prices.bulkPut(
        Object.entries(state.prices).map(([ticker, row]) => ({ ticker, ...row })),
      );

      await db.settings.put({ key: 'biWeeklyBudget', value: state.biWeeklyBudget });
      await db.settings.put({ key: 'doubleDownBudget', value: state.doubleDownBudget });
      await db.settings.put({ key: 'payFrequency', value: state.payFrequency });
      await db.settings.put({ key: 'displayPeriods', value: JSON.stringify(state.displayPeriods) });
      await db.settings.put({ key: 'roles', value: JSON.stringify(state.roles) });

      await db.buckets.clear();
      await db.buckets.bulkPut(state.buckets);
    });
  }, [state, loaded]);

  return (
    <StoreContext.Provider value={{ state, dispatch, loaded }}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreCtx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}
