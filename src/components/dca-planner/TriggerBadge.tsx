import { IconCheck } from '../icons';
import { BadgeGreen, BadgeRed, BadgeGray } from '../ui/Badge';
import type { EnrichedHolding } from '../../types';

export function TriggerBadge({ h }: { h: EnrichedHolding }) {
  if (h.price === 0) return <BadgeGray>No Data</BadgeGray>;
  if (h.triggered) {
    const highWater = Math.max(h.ath ?? 0, h.h52);
    const reason = highWater > 0 && (highWater - h.price) / highWater >= 0.2
      ? ((h.ath ?? 0) >= h.h52 ? '≥20% off ATH' : '≥20% off 52W High')
      : '';
    return <BadgeRed title={reason}>⚡ Triggered</BadgeRed>;
  }
  return (
    <BadgeGreen>
      <IconCheck /> Clear
    </BadgeGreen>
  );
}
