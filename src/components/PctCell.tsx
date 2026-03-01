import { Td } from './ui/Table';
import { formatPercent } from '../utils/format';

export function PctCell({ value, hideBelow }: { value: number | null; hideBelow?: number }) {
  if (value === null)
    return (
      <Td $num $muted $hideBelow={hideBelow}>
        —
      </Td>
    );
  return (
    <Td $num $hideBelow={hideBelow} style={{ color: value >= 0 ? 'var(--green)' : 'var(--red)' }}>
      {formatPercent(value)}
    </Td>
  );
}
