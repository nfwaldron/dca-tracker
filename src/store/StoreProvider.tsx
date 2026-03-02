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
import { notifications } from '@mantine/notifications';
import type { DBState, Action } from '../types';
import { makeSupabase } from '../services/supabase';
import { loadPortfolio, savePortfolio } from '../services/db';
import { reducer, INITIAL_STATE } from './reducer';
import { notifyError } from '../utils/notify';
import { useAppAuth } from './AuthProvider';

const GUEST_STATE_KEY = 'dca-guest-state';

interface StoreCtx {
  state: DBState;
  dispatch: Dispatch<Action>;
  loaded: boolean;
}

const StoreContext = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { userId, getToken } = useAppAuth();
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track previous userId to detect guest → signed-in transition
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  /** Get an authenticated Supabase client using the active Clerk session JWT. */
  const getSupabase = useCallback(async () => {
    const token = await getToken();
    return makeSupabase(token);
  }, [getToken]);

  // ── Load from localStorage (guest) or Supabase (signed-in) ───────────────
  useEffect(() => {
    const wasGuest = prevUserIdRef.current === null;
    prevUserIdRef.current = userId ?? null;

    (async () => {
      try {
        if (!userId) {
          // Guest mode — load from localStorage
          const raw = localStorage.getItem(GUEST_STATE_KEY);
          if (raw) {
            try {
              dispatch({ type: 'LOAD_SNAPSHOT', payload: JSON.parse(raw) });
            } catch {
              // Corrupted data — start fresh
              localStorage.removeItem(GUEST_STATE_KEY);
            }
          }
          setLoaded(true);
          return;
        }

        const sb = await getSupabase();

        if (wasGuest) {
          // Guest just signed in — check for guest data to migrate
          const raw = localStorage.getItem(GUEST_STATE_KEY);
          if (raw) {
            try {
              const cloud = await loadPortfolio(sb, userId);
              if (cloud.holdings.length === 0) {
                // New account → migrate guest state automatically
                const guestState = JSON.parse(raw) as DBState;
                await savePortfolio(sb, userId, guestState);
                dispatch({ type: 'LOAD_SNAPSHOT', payload: guestState });
                localStorage.removeItem(GUEST_STATE_KEY);
                localStorage.removeItem('dca-guest-mode');
                notifications.show({
                  color: 'green',
                  message: 'Your guest portfolio has been saved to your account.',
                  autoClose: 4000,
                });
                setLoaded(true);
                return;
              }
            } catch {
              // Migration failed — fall through to normal cloud load
            }
            // Existing account or migration failed — clear guest data
            localStorage.removeItem(GUEST_STATE_KEY);
            localStorage.removeItem('dca-guest-mode');
          }
        }

        const snapshot = await loadPortfolio(sb, userId);
        dispatch({ type: 'LOAD_SNAPSHOT', payload: snapshot });
      } catch (err) {
        if (userId) notifyError('Failed to load portfolio', err);
      } finally {
        setLoaded(true);
      }
    })();
  }, [userId, getSupabase]);

  // ── Save to localStorage (guest) or Supabase (signed-in) ─────────────────
  useEffect(() => {
    if (!loaded) return;

    if (!userId) {
      // Guest mode — save to localStorage immediately (no debounce needed)
      try {
        localStorage.setItem(GUEST_STATE_KEY, JSON.stringify(state));
      } catch {
        // QuotaExceededError — silently swallow; will retry on next state change
      }
      return;
    }

    // Signed-in — debounced Supabase save
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
