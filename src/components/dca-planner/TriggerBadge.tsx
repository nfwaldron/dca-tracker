import { IconCheck } from '../icons';
import { BadgeGreen, BadgeRed, BadgeGray } from '../ui/Badge';
import type { EnrichedHolding } from '../../types';

export function TriggerBadge({ h }: { h: EnrichedHolding }) {
  if (h.price === 0) return <BadgeGray>No Data</BadgeGray>;
  if (h.triggered) {
    const reasons: string[] = [];
    if (h.ma200 > 0 && h.price < h.ma200) reasons.push('< 200-MA');
    const highWater = Math.max(h.ath ?? 0, h.h52);
    if (highWater > 0 && (highWater - h.price) / highWater >= 0.2) {
      reasons.push((h.ath ?? 0) >= h.h52 ? '≥20% off ATH' : '≥20% off 52W High');
    }
    return <BadgeRed title={reasons.join(' & ')}>⚡ Triggered</BadgeRed>;
  }
  return (
    <BadgeGreen>
      <IconCheck /> Clear
    </BadgeGreen>
  );
}
