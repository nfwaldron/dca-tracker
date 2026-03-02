import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/utils';
import { TriggerBadge } from '../TriggerBadge';
import { makeEnrichedHolding } from '../../../test/fixtures';

describe('TriggerBadge', () => {
  it('shows "No Data" when price is 0', () => {
    const h = makeEnrichedHolding({ price: 0, triggered: false });
    render(<TriggerBadge h={h} />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  it('shows "Triggered" when the holding is triggered', () => {
    const h = makeEnrichedHolding({ price: 40, triggered: true, ma200: 55 });
    render(<TriggerBadge h={h} />);
    expect(screen.getByText(/Triggered/i)).toBeInTheDocument();
  });

  it('shows "Clear" when the holding has a price but is not triggered', () => {
    const h = makeEnrichedHolding({ price: 90, triggered: false });
    render(<TriggerBadge h={h} />);
    expect(screen.getByText(/Clear/i)).toBeInTheDocument();
  });

  it('includes "≥20% off ATH" in the title when ath exceeds h52', () => {
    // price = 70, ath = 100, h52 = 80 → high-water = 100, 30% off ATH
    const h = makeEnrichedHolding({ price: 70, triggered: true, ma200: 60, ath: 100, h52: 80 });
    render(<TriggerBadge h={h} />);
    expect(screen.getByTitle(/≥20% off ATH/)).toBeInTheDocument();
  });

  it('includes "≥20% off 52W High" in the title when h52 exceeds ath', () => {
    // price = 70, ath = 80, h52 = 100 → high-water = 100 (52W), 30% off 52W High
    const h = makeEnrichedHolding({ price: 70, triggered: true, ma200: 60, ath: 80, h52: 100 });
    render(<TriggerBadge h={h} />);
    expect(screen.getByTitle(/≥20% off 52W High/)).toBeInTheDocument();
  });
});
