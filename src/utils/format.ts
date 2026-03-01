/** Format a number as a USD dollar string, e.g. formatDollars(1234.5) → "$1,234.50" */
export function formatDollars(n: number, digits = 2): string {
  return (
    '$' +
    n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
  );
}

/** Format a percentage with a leading sign, e.g. formatPercent(1.5) → "+1.50%" */
export function formatPercent(n: number | null): string {
  if (n === null) return '—';
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

/** Format a share count with up to 4 decimal places, e.g. formatShares(1.2345) → "1.2345" */
export function formatShares(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
}
