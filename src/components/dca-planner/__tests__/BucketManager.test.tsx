import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BucketManager } from '../BucketManager';
import { makeHolding, makeEnrichedHolding, makeBucket } from '../../../test/fixtures';
import type { DcaBucket, Holding, EnrichedHolding } from '../../../types';

// ── Default props ────────────────────────────────────────────────────────────

const coreHoldings: Holding[] = [
  makeHolding({ id: 'AMZN', ticker: 'AMZN', name: 'Amazon', category: 'core' }),
  makeHolding({ id: 'NVDA', ticker: 'NVDA', name: 'Nvidia', category: 'core' }),
  makeHolding({ id: 'PLTR', ticker: 'PLTR', name: 'Palantir', category: 'core' }),
];

const enrichedCore: EnrichedHolding[] = coreHoldings.map(h =>
  makeEnrichedHolding({ ...h }),
);

function renderBucketManager(
  buckets: DcaBucket[] = [],
  dispatch = vi.fn(),
) {
  return render(
    <BucketManager
      buckets={buckets}
      coreHoldings={coreHoldings}
      enrichedCore={enrichedCore}
      perSlotDailyAmt={10}
      payFrequency="biweekly"
      dispatch={dispatch}
    />,
  );
}

// ── Rendering ────────────────────────────────────────────────────────────────

describe('BucketManager', () => {
  it('returns null when there are no core holdings', () => {
    const { container } = render(
      <BucketManager
        buckets={[]}
        coreHoldings={[]}
        enrichedCore={[]}
        perSlotDailyAmt={10}
        payFrequency="biweekly"
        dispatch={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows the "DCA Buckets" section heading', () => {
    renderBucketManager();
    expect(screen.getByText('DCA Buckets')).toBeInTheDocument();
  });

  it('shows an "+ Add Bucket" button by default', () => {
    renderBucketManager();
    expect(screen.getByRole('button', { name: /add bucket/i })).toBeInTheDocument();
  });

  it('renders each existing bucket by name', () => {
    const buckets = [
      makeBucket({ id: 'b1', name: 'Cloud Pair', tickers: ['AMZN', 'NVDA'] }),
    ];
    renderBucketManager(buckets);
    expect(screen.getByText('Cloud Pair')).toBeInTheDocument();
  });

  // ── Create form ────────────────────────────────────────────────────────────

  describe('create form', () => {
    it('opens when "+ Add Bucket" is clicked', async () => {
      const user = userEvent.setup();
      renderBucketManager();
      await user.click(screen.getByRole('button', { name: /add bucket/i }));
      expect(screen.getByText('New Bucket')).toBeInTheDocument();
    });

    it('shows all core tickers as selectable chips', async () => {
      const user = userEvent.setup();
      renderBucketManager();
      await user.click(screen.getByRole('button', { name: /add bucket/i }));
      expect(screen.getByText('AMZN')).toBeInTheDocument();
      expect(screen.getByText('NVDA')).toBeInTheDocument();
      expect(screen.getByText('PLTR')).toBeInTheDocument();
    });

    it('shows a validation error when name is empty on save', async () => {
      const user = userEvent.setup();
      renderBucketManager();
      await user.click(screen.getByRole('button', { name: /add bucket/i }));
      await user.click(screen.getByRole('button', { name: /save bucket/i }));
      expect(screen.getByText(/bucket name is required/i)).toBeInTheDocument();
    });

    it('shows a validation error when fewer than 2 tickers are selected', async () => {
      const user = userEvent.setup();
      renderBucketManager();
      await user.click(screen.getByRole('button', { name: /add bucket/i }));
      await user.type(screen.getByPlaceholderText(/cybersecurity pair/i), 'My Bucket');
      // Select only 1 ticker
      await user.click(screen.getByText('AMZN'));
      await user.click(screen.getByRole('button', { name: /save bucket/i }));
      expect(screen.getByText(/select at least 2 stocks/i)).toBeInTheDocument();
    });

    it('dispatches UPSERT_BUCKET when the form is valid', async () => {
      const user = userEvent.setup();
      const dispatch = vi.fn();
      render(
        <BucketManager
          buckets={[]}
          coreHoldings={coreHoldings}
          enrichedCore={enrichedCore}
          perSlotDailyAmt={10}
          payFrequency="biweekly"
          dispatch={dispatch}
        />,
      );
      await user.click(screen.getByRole('button', { name: /add bucket/i }));
      await user.type(screen.getByPlaceholderText(/cybersecurity pair/i), 'Cloud Pair');
      await user.click(screen.getByText('AMZN'));
      await user.click(screen.getByText('NVDA'));
      await user.click(screen.getByRole('button', { name: /save bucket/i }));
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'UPSERT_BUCKET',
          payload: expect.objectContaining({ name: 'Cloud Pair', tickers: ['AMZN', 'NVDA'] }),
        }),
      );
    });

    it('closes the form when Cancel is clicked', async () => {
      const user = userEvent.setup();
      renderBucketManager();
      await user.click(screen.getByRole('button', { name: /add bucket/i }));
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByText('New Bucket')).toBeNull();
    });
  });

  // ── Delete ─────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('dispatches DELETE_BUCKET after confirming', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const user = userEvent.setup();
      const dispatch = vi.fn();
      const buckets = [makeBucket({ id: 'b1', name: 'Cloud Pair', tickers: ['AMZN', 'NVDA'] })];
      render(
        <BucketManager
          buckets={buckets}
          coreHoldings={coreHoldings}
          enrichedCore={enrichedCore}
          perSlotDailyAmt={10}
          payFrequency="biweekly"
          dispatch={dispatch}
        />,
      );
      await user.click(screen.getByRole('button', { name: /remove/i }));
      expect(dispatch).toHaveBeenCalledWith({ type: 'DELETE_BUCKET', payload: 'b1' });
    });

    it('does not dispatch when deletion is cancelled', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const user = userEvent.setup();
      const dispatch = vi.fn();
      const buckets = [makeBucket({ id: 'b1', name: 'Cloud Pair', tickers: ['AMZN', 'NVDA'] })];
      render(
        <BucketManager
          buckets={buckets}
          coreHoldings={coreHoldings}
          enrichedCore={enrichedCore}
          perSlotDailyAmt={10}
          payFrequency="biweekly"
          dispatch={dispatch}
        />,
      );
      await user.click(screen.getByRole('button', { name: /remove/i }));
      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});
