import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryCard } from '../SummaryCard';

describe('SummaryCard', () => {
  it('renders the label and value', () => {
    render(<SummaryCard label="Bi-Weekly Budget" value="$500.00" />);
    expect(screen.getByText('Bi-Weekly Budget')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
  });

  it('renders the sub text when provided', () => {
    render(<SummaryCard label="Budget" value="$500.00" sub="8 core · 8 slots" />);
    expect(screen.getByText('8 core · 8 slots')).toBeInTheDocument();
  });

  it('renders only label and value when sub is omitted', () => {
    render(<SummaryCard label="Budget" value="$500.00" />);
    // The Card div is the direct parent of the CardLabel div
    const card = screen.getByText('Budget').parentElement!;
    expect(card.children).toHaveLength(2);
  });

  it('applies an inline color style to the value when color prop is provided', () => {
    render(<SummaryCard label="G/L" value="-$138.17" color="var(--red)" />);
    const value = screen.getByText('-$138.17');
    expect(value).toHaveStyle({ color: 'var(--red)' });
  });
});
