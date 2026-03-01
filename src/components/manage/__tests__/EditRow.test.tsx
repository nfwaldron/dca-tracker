import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditRow, holdingToEdit, editToHolding, BLANK_EDIT } from '../EditRow';
import { makeHolding } from '../../../test/fixtures';
import type { Holding } from '../../../types';

// ── Pure helper functions ────────────────────────────────────────────────────

describe('holdingToEdit', () => {
  it('maps a holding to the edit state shape', () => {
    const h = makeHolding({
      positions: [{ broker: 'Robinhood', shares: 5, avgCost: 100 }],
      ath: 200,
    });
    const result = holdingToEdit(h);
    expect(result.ticker).toBe(h.ticker);
    expect(result.positions[0]).toEqual({ broker: 'Robinhood', shares: '5', avgCost: '100' });
    expect(result.athStr).toBe('200');
    expect(result.doubleDown).toBe(h.doubleDown);
  });

  it('inserts a blank position row when the holding has no positions', () => {
    const h = makeHolding({ positions: [] });
    const result = holdingToEdit(h);
    expect(result.positions).toHaveLength(1);
    expect(result.positions[0]).toEqual({ broker: '', shares: '0', avgCost: '0' });
  });

  it('sets athStr to empty string when ath is null', () => {
    const h = makeHolding({ ath: null });
    expect(holdingToEdit(h).athStr).toBe('');
  });
});

describe('editToHolding', () => {
  it('converts edit state back to a Holding', () => {
    const state = {
      ...BLANK_EDIT,
      id: 'AMZN',
      ticker: 'amzn',
      name: 'Amazon',
      role: 'Compounder',
      category: 'core' as const,
      positions: [{ broker: 'Robinhood', shares: '10', avgCost: '150' }],
      athStr: '230',
      doubleDown: true,
    };
    const result = editToHolding(state);
    expect(result.ticker).toBe('AMZN'); // uppercased
    expect(result.positions[0]).toEqual({ broker: 'Robinhood', shares: 10, avgCost: 150 });
    expect(result.ath).toBe(230);
    expect(result.doubleDown).toBe(true);
  });

  it('filters out positions where broker is blank', () => {
    const state = {
      ...BLANK_EDIT,
      positions: [
        { broker: '', shares: '5', avgCost: '100' },
        { broker: 'Robinhood', shares: '5', avgCost: '100' },
      ],
    };
    const result = editToHolding(state);
    expect(result.positions).toHaveLength(1);
    expect(result.positions[0].broker).toBe('Robinhood');
  });

  it('sets ath to null when athStr is empty', () => {
    const state = { ...BLANK_EDIT, athStr: '' };
    expect(editToHolding(state).ath).toBeNull();
  });
});

// ── EditRow component ────────────────────────────────────────────────────────

function renderInTable(ui: React.ReactElement) {
  // EditRow renders a <tr> which must live inside a <table><tbody>
  return render(
    <table>
      <tbody>{ui}</tbody>
    </table>,
  );
}

describe('EditRow', () => {
  it('pre-fills fields from the init prop', () => {
    const h = makeHolding({ name: 'Amazon', role: 'Compounder' });
    renderInTable(
      <EditRow isNew={false} colSpan={10} init={holdingToEdit(h)} onSave={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByDisplayValue('Amazon')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Compounder')).toBeInTheDocument();
  });

  it('calls onSave with the converted holding when Save is clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const h = makeHolding({ name: 'Amazon' });
    renderInTable(
      <EditRow isNew={false} colSpan={10} init={holdingToEdit(h)} onSave={onSave} onCancel={vi.fn()} />,
    );
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(onSave).toHaveBeenCalledOnce();
    const saved: Holding = onSave.mock.calls[0][0];
    expect(saved.ticker).toBe('TEST');
  });

  it('calls onCancel when the Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderInTable(
      <EditRow isNew colSpan={10} init={BLANK_EDIT} onSave={vi.fn()} onCancel={onCancel} />,
    );
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('allows typing a new name', async () => {
    const user = userEvent.setup();
    renderInTable(
      <EditRow isNew colSpan={10} init={BLANK_EDIT} onSave={vi.fn()} onCancel={vi.fn()} />,
    );
    const nameInput = screen.getByPlaceholderText('Company name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Nvidia');
    expect(nameInput).toHaveValue('Nvidia');
  });

  it('uppercases the ticker when isNew', async () => {
    const user = userEvent.setup();
    renderInTable(
      <EditRow isNew colSpan={10} init={BLANK_EDIT} onSave={vi.fn()} onCancel={vi.fn()} />,
    );
    const tickerInput = screen.getByPlaceholderText('TICKER');
    await user.type(tickerInput, 'nvda');
    expect(tickerInput).toHaveValue('NVDA');
  });

  it('adds a new broker position row when "Add Broker" is clicked', async () => {
    const user = userEvent.setup();
    const h = makeHolding({ positions: [{ broker: 'Robinhood', shares: 5, avgCost: 100 }] });
    renderInTable(
      <EditRow isNew={false} colSpan={10} init={holdingToEdit(h)} onSave={vi.fn()} onCancel={vi.fn()} />,
    );
    const before = screen.getAllByPlaceholderText('Broker name').length;
    await user.click(screen.getByRole('button', { name: /add broker/i }));
    expect(screen.getAllByPlaceholderText('Broker name')).toHaveLength(before + 1);
  });
});
