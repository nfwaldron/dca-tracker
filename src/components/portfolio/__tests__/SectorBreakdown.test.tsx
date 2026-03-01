import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/utils';
import { SectorBreakdown } from '../SectorBreakdown';
import { makeEnrichedHolding } from '../../../test/fixtures';

describe('SectorBreakdown', () => {
  it('renders nothing when holdings list is empty', () => {
    render(<SectorBreakdown holdings={[]} totalValue={1000} />);
    expect(screen.queryByText('By Sector')).toBeNull();
  });

  it('renders nothing when totalValue is 0', () => {
    const h = makeEnrichedHolding({ sector: 'Technology' });
    render(<SectorBreakdown holdings={[h]} totalValue={0} />);
    expect(screen.queryByText('By Sector')).toBeNull();
  });

  it('renders the "By Sector" section title', () => {
    const h = makeEnrichedHolding({ sector: 'Technology' });
    render(<SectorBreakdown holdings={[h]} totalValue={h.mktVal} />);
    expect(screen.getByText('By Sector')).toBeInTheDocument();
  });

  it('renders one row per sector group', () => {
    const tech = makeEnrichedHolding({ id: 'NVDA', ticker: 'NVDA', mktVal: 1000, sector: 'Technology' });
    const energy = makeEnrichedHolding({ id: 'BE', ticker: 'BE', mktVal: 500, sector: 'Energy' });
    render(<SectorBreakdown holdings={[tech, energy]} totalValue={1500} />);
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Energy')).toBeInTheDocument();
  });

  it('groups multiple holdings in the same sector into one row', () => {
    const nvda = makeEnrichedHolding({ id: 'NVDA', ticker: 'NVDA', mktVal: 600, sector: 'Technology' });
    const anet = makeEnrichedHolding({ id: 'ANET', ticker: 'ANET', mktVal: 400, sector: 'Technology' });
    render(<SectorBreakdown holdings={[nvda, anet]} totalValue={1000} />);
    // Only one "Technology" row — if duplicated the query would throw
    expect(screen.getByText('Technology')).toBeInTheDocument();
    // Both tickers should appear together in the holdings cell
    expect(screen.getByText(/NVDA.*ANET|ANET.*NVDA/)).toBeInTheDocument();
  });

  it('falls back to "Other" for holdings with no sector', () => {
    const h = makeEnrichedHolding({ id: 'ETF', ticker: 'ETF', mktVal: 800, sector: undefined });
    render(<SectorBreakdown holdings={[h]} totalValue={800} />);
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('sorts sectors by market value descending', () => {
    const small = makeEnrichedHolding({ id: 'A', ticker: 'A', mktVal: 200, sector: 'Energy' });
    const large = makeEnrichedHolding({ id: 'B', ticker: 'B', mktVal: 800, sector: 'Technology' });
    render(<SectorBreakdown holdings={[small, large]} totalValue={1000} />);
    const rows = screen.getAllByRole('row');
    // rows[0] = thead, rows[1] = first data row, rows[2] = second data row
    expect(rows[1]).toHaveTextContent('Technology'); // larger value first
    expect(rows[2]).toHaveTextContent('Energy');
  });

  it('places "Other" last even when it has a higher market value', () => {
    const tech = makeEnrichedHolding({ id: 'NVDA', ticker: 'NVDA', mktVal: 500, sector: 'Technology' });
    const other = makeEnrichedHolding({ id: 'ETF', ticker: 'ETF', mktVal: 1000, sector: undefined });
    render(<SectorBreakdown holdings={[tech, other]} totalValue={1500} />);
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Technology');
    expect(rows[2]).toHaveTextContent('Other');
  });

  it('shows the ticker count in parentheses', () => {
    const a = makeEnrichedHolding({ id: 'NVDA', ticker: 'NVDA', mktVal: 400, sector: 'Technology' });
    const b = makeEnrichedHolding({ id: 'ANET', ticker: 'ANET', mktVal: 400, sector: 'Technology' });
    render(<SectorBreakdown holdings={[a, b]} totalValue={800} />);
    expect(screen.getByText(/\(2\)/)).toBeInTheDocument();
  });
});
