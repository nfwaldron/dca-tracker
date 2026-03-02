import { describe, it, expect } from 'vitest';
import { getDdState, getDdDisplayDaily } from '../ddDisplay';
import { makeEnrichedHolding } from '../../test/fixtures';

describe('getDdState', () => {
  it('returns "inactive" when doubleDown is false', () => {
    const h = makeEnrichedHolding({ doubleDown: false, triggered: true, extraDaily: 5 });
    expect(getDdState(h)).toBe('inactive');
  });

  it('returns "inactive" when triggered is false', () => {
    const h = makeEnrichedHolding({ doubleDown: true, triggered: false, extraDaily: 5 });
    expect(getDdState(h)).toBe('inactive');
  });

  it('returns "inactive" when both doubleDown and triggered are false', () => {
    const h = makeEnrichedHolding({ doubleDown: false, triggered: false, extraDaily: 0 });
    expect(getDdState(h)).toBe('inactive');
  });

  it('returns "unfunded" when triggered and doubleDown are true but extraDaily is 0', () => {
    const h = makeEnrichedHolding({ doubleDown: true, triggered: true, extraDaily: 0 });
    expect(getDdState(h)).toBe('unfunded');
  });

  it('returns "funded" when triggered and doubleDown are true and extraDaily > 0', () => {
    const h = makeEnrichedHolding({ doubleDown: true, triggered: true, extraDaily: 10 });
    expect(getDdState(h)).toBe('funded');
  });
});

describe('getDdDisplayDaily', () => {
  it('returns baseDaily for inactive holdings', () => {
    const h = makeEnrichedHolding({ doubleDown: false, triggered: false, baseDaily: 7, totalDaily: 7 });
    expect(getDdDisplayDaily(h)).toBe(7);
  });

  it('returns baseDaily * 2 for unfunded holdings', () => {
    const h = makeEnrichedHolding({ doubleDown: true, triggered: true, extraDaily: 0, baseDaily: 6, totalDaily: 6 });
    expect(getDdDisplayDaily(h)).toBe(12);
  });

  it('returns totalDaily for funded holdings', () => {
    const h = makeEnrichedHolding({ doubleDown: true, triggered: true, extraDaily: 8, baseDaily: 5, totalDaily: 13 });
    expect(getDdDisplayDaily(h)).toBe(13);
  });
});
