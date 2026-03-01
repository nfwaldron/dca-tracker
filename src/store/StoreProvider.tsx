import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useState,
  useCallback,
  type Dispatch,
} from 'react';
import { useAuth } from '@clerk/clerk-react';
import type { DBState, Action } from '../types';
import { makeSupabase } from '../services/supabase';
import { loadPortfolio, savePortfolio } from '../services/db';
import { reducer, INITIAL_STATE } from './reducer';
import { notifyError } from '../utils/notify';

interface StoreCtx {
  state: DBState;
  dispatch: Dispatch<Action>;
  loaded: boolean;
}

const StoreContext = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { userId, getToken } = useAuth();
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Get an authenticated Supabase client using the Clerk "supabase" JWT template. */
  const getSupabase = useCallback(async () => {
    const token = await getToken({ template: 'supabase' });
    return makeSupabase(token);
  }, [getToken]);

  // ── Load from Supabase on mount (once userId is available) ────────────────
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const sb = await getSupabase();
        const snapshot = await loadPortfolio(sb, userId);
        dispatch({ type: 'LOAD_SNAPSHOT', payload: snapshot });
      } catch (err) {
        notifyError('Failed to load portfolio', err);
      } finally {
        setLoaded(true);
      }
    })();
  }, [userId, getSupabase]);

  // ── Debounced save to Supabase on every state change ─────────────────────
  useEffect(() => {
    if (!loaded || !userId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const sb = await getSupabase();
        await savePortfolio(sb, userId, state);
      } catch (err) {
        notifyError('Save failed', err);
      }
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, loaded, userId, getSupabase]);

  return (
    <StoreContext.Provider value={{ state, dispatch, loaded }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreCtx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}
