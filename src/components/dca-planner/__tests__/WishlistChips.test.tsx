import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/utils';
import { WishlistChips } from '../WishlistChips';
import { makeEnrichedHolding } from '../../../test/fixtures';

describe('WishlistChips', () => {
  it('renders nothing when the holdings list is empty', () => {
    render(<WishlistChips holdings={[]} />);
    expect(screen.queryByText('Watchlist')).toBeNull();
  });

  it('renders a chip for each holding', () => {
    const holdings = [
      makeEnrichedHolding({ id: 'GOOGL', ticker: 'GOOGL', role: 'Growth' }),
      makeEnrichedHolding({ id: 'ASML', ticker: 'ASML', role: 'Semiconductor' }),
    ];
    render(<WishlistChips holdings={holdings} />);
    expect(screen.getByText('GOOGL')).toBeInTheDocument();
    expect(screen.getByText('ASML')).toBeInTheDocument();
  });

  it('shows the price when it is greater than 0', () => {
    const h = makeEnrichedHolding({ id: 'GOOGL', ticker: 'GOOGL', price: 175.5 });
    render(<WishlistChips holdings={[h]} />);
    expect(screen.getByText('$175.50')).toBeInTheDocument();
  });

  it('hides the price when it is 0', () => {
    const h = makeEnrichedHolding({ id: 'GOOGL', ticker: 'GOOGL', price: 0 });
    render(<WishlistChips holdings={[h]} />);
    expect(screen.queryByText(/\$/)).toBeNull();
  });

  it('renders the role for each chip', () => {
    const h = makeEnrichedHolding({ id: 'GOOGL', ticker: 'GOOGL', role: 'AI Play' });
    render(<WishlistChips holdings={[h]} />);
    expect(screen.getByText('AI Play')).toBeInTheDocument();
  });

  it('renders a "Watchlist" section heading', () => {
    const h = makeEnrichedHolding({ id: 'GOOGL', ticker: 'GOOGL' });
    render(<WishlistChips holdings={[h]} />);
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
  });
});
