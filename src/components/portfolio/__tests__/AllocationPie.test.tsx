import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/utils';
import { AllocationPie, type PieSlice } from '../AllocationPie';

const SLICES: PieSlice[] = [
  { name: 'NVDA', value: 500, color: '#3b82f6' },
  { name: 'PLTR', value: 300, color: '#22c55e' },
  { name: 'AMZN', value: 200, color: '#f59e0b' },
];

describe('AllocationPie', () => {
  describe('legend', () => {
    it('renders a legend item for each slice', () => {
      render(<AllocationPie data={SLICES} />);
      expect(screen.getByText(/NVDA/)).toBeInTheDocument();
      expect(screen.getByText(/PLTR/)).toBeInTheDocument();
      expect(screen.getByText(/AMZN/)).toBeInTheDocument();
    });

    it('shows correct percentages for each slice', () => {
      render(<AllocationPie data={SLICES} />);
      // Total = 1000; NVDA = 50%, PLTR = 30%, AMZN = 20%
      expect(screen.getByText(/50\.0%/)).toBeInTheDocument();
      expect(screen.getByText(/30\.0%/)).toBeInTheDocument();
      expect(screen.getByText(/20\.0%/)).toBeInTheDocument();
    });

    it('renders an "Allocation" section title in non-compact mode', () => {
      render(<AllocationPie data={SLICES} />);
      expect(screen.getByText('Allocation')).toBeInTheDocument();
    });

    it('does not render a section title in compact mode', () => {
      render(<AllocationPie data={SLICES} compact />);
      expect(screen.queryByText('Allocation')).toBeNull();
    });

    it('renders legend for a single-slice dataset with 100%', () => {
      const single: PieSlice[] = [{ name: 'NVDA', value: 1000, color: '#3b82f6' }];
      render(<AllocationPie data={single} />);
      expect(screen.getByText(/100\.0%/)).toBeInTheDocument();
    });

    it('renders legend items with correct color swatches', () => {
      const { container } = render(<AllocationPie data={SLICES} />);
      // Each legend item has a colored swatch div; check that the first color is present
      const swatches = container.querySelectorAll('[style*="background: rgb(59, 130, 246)"]');
      expect(swatches.length).toBeGreaterThan(0);
    });
  });

  describe('empty data', () => {
    it('renders the chart container without crashing when data is empty', () => {
      const { container } = render(<AllocationPie data={[]} />);
      expect(container).toBeTruthy();
    });
  });
});
