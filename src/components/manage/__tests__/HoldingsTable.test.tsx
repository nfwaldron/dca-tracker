import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HoldingsTable } from '../HoldingsTable';
import { makeHolding } from '../../../test/fixtures';

describe('HoldingsTable', () => {
  let dispatch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    dispatch = vi.fn();
  });

  it('renders each holding ticker and name', () => {
    const holdings = [
      makeHolding({ id: 'AMZN', ticker: 'AMZN', name: 'Amazon' }),
      makeHolding({ id: 'NVDA', ticker: 'NVDA', name: 'Nvidia' }),
    ];
    render(<HoldingsTable holdings={holdings} dispatch={dispatch} />);
    expect(screen.getByText('AMZN')).toBeInTheDocument();
    expect(screen.getByText('Amazon')).toBeInTheDocument();
    expect(screen.getByText('NVDA')).toBeInTheDocument();
    expect(screen.getByText('Nvidia')).toBeInTheDocument();
  });

  it('shows an "Add Holding" button', () => {
    render(<HoldingsTable holdings={[]} dispatch={dispatch} />);
    expect(screen.getByRole('button', { name: /add holding/i })).toBeInTheDocument();
  });

  it('opens the add form when "Add Holding" is clicked', async () => {
    const user = userEvent.setup();
    render(<HoldingsTable holdings={[]} dispatch={dispatch} />);
    await user.click(screen.getByRole('button', { name: /add holding/i }));
    expect(screen.getByPlaceholderText('TICKER')).toBeInTheDocument();
  });

  it('dispatches DELETE_HOLDING after confirming deletion', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    const holdings = [makeHolding({ id: 'AMZN', ticker: 'AMZN' })];
    render(<HoldingsTable holdings={holdings} dispatch={dispatch} />);
    // Buttons in order: [Add Holding, Chevron, Edit, Trash]
    const allBtns = screen.getAllByRole('button');
    await user.click(allBtns.at(-1)!); // last = trash
    expect(dispatch).toHaveBeenCalledWith({ type: 'DELETE_HOLDING', payload: 'AMZN' });
  });

  it('does not dispatch DELETE_HOLDING when confirmation is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    const holdings = [makeHolding({ id: 'AMZN', ticker: 'AMZN' })];
    render(<HoldingsTable holdings={holdings} dispatch={dispatch} />);
    const allBtns = screen.getAllByRole('button');
    await user.click(allBtns[allBtns.length - 1]);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('shows broker breakdown when the chevron is clicked', async () => {
    const user = userEvent.setup();
    const h = makeHolding({
      id: 'AMZN',
      positions: [
        { broker: 'Robinhood', shares: 5, avgCost: 100 },
        { broker: 'Moomoo', shares: 3, avgCost: 120 },
      ],
    });
    render(<HoldingsTable holdings={[h]} dispatch={dispatch} />);
    // Chevron has title "Show broker breakdown"; "Add Holding" button has no title
    const chevron = screen.getByTitle('Show broker breakdown');
    await user.click(chevron);
    expect(screen.getByText('Robinhood')).toBeInTheDocument();
    expect(screen.getByText('Moomoo')).toBeInTheDocument();
  });

  it('disables the expand button when the holding has no positions', () => {
    const h = makeHolding({ id: 'EMPTY', positions: [] });
    render(<HoldingsTable holdings={[h]} dispatch={dispatch} />);
    const chevron = screen.getByTitle('Show broker breakdown');
    expect(chevron).toBeDisabled();
  });

  it('sorts holdings by category order', () => {
    const holdings = [
      makeHolding({ id: 'W', ticker: 'W', category: 'wishlist' }),
      makeHolding({ id: 'E', ticker: 'E', category: 'extra' }),
      makeHolding({ id: 'C', ticker: 'C', category: 'core' }),
    ];
    render(<HoldingsTable holdings={holdings} dispatch={dispatch} />);
    const tickers = screen.getAllByText(/^[CWE]$/).map(el => el.textContent);
    expect(tickers).toEqual(['C', 'E', 'W']);
  });
});
