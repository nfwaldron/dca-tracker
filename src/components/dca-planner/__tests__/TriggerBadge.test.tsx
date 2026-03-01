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

  it('includes "< 200-MA" in the title when price is below the 200-MA', () => {
    const h = makeEnrichedHolding({ price: 40, triggered: true, ma200: 55, ath: null });
    render(<TriggerBadge h={h} />);
    expect(screen.getByTitle(/< 200-MA/)).toBeInTheDocument();
  });

  it('includes "≥20% off ATH" in the title when applicable', () => {
    // price = 70, ath = 100 → 30% off ATH
    const h = makeEnrichedHolding({ price: 70, triggered: true, ma200: 60, ath: 100 });
    render(<TriggerBadge h={h} />);
    expect(screen.getByTitle(/≥20% off ATH/)).toBeInTheDocument();
  });
});
