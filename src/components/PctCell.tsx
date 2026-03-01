import { Td } from './ui/Table';
import { formatPercent } from '../utils/format';

export function PctCell({ value }: { value: number | null }) {
  if (value === null)
    return (
      <Td $num $muted>
        —
      </Td>
    );
  return (
    <Td $num style={{ color: value >= 0 ? 'var(--green)' : 'var(--red)' }}>
      {formatPercent(value)}
    </Td>
  );
}
