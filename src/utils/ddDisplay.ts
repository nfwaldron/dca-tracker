import type { EnrichedHolding } from '../types';
import { COLOR_AMBER, COLOR_MUTED, MC_RED_5 } from '../components/ui/colors';

export type DdState = 'funded' | 'unfunded' | 'inactive';

/** Derives the three-state display status for a holding's double-down. */
export function getDdState(h: EnrichedHolding): DdState {
  if (!h.doubleDown || !h.triggered) return 'inactive';
  return h.extraDaily > 0 ? 'funded' : 'unfunded';
}

/** The daily amount to show for the holding given its DD state. */
export function getDdDisplayDaily(h: EnrichedHolding): number {
  const s = getDdState(h);
  if (s === 'funded') return h.totalDaily;
  if (s === 'unfunded') return h.baseDaily * 2;
  return h.baseDaily;
}

/** CSS color variable for each DD state. */
export const DD_COLOR: Record<DdState, string> = {
  funded:   COLOR_AMBER,
  unfunded: MC_RED_5,
  inactive: COLOR_MUTED,
};
