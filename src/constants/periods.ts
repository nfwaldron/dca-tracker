import type { PayFrequency, DisplayPeriod } from '../types';

/** Trading days in each pay / display period */
export const PERIOD_DAYS: Record<PayFrequency | DisplayPeriod, number> = {
  daily: 1,
  weekly: 5,
  biweekly: 10,
  monthly: 21,
};

/** Short column header label for each display period */
export const PERIOD_COL_LABELS: Record<DisplayPeriod, string> = {
  daily: 'Day',
  weekly: 'Wk',
  biweekly: 'Bi-wk',
  monthly: 'Mo',
};

/** Full label for pay frequency (used in input labels, summary cards) */
export const FREQ_LABELS: Record<PayFrequency, string> = {
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
};
