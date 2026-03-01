import { useMemo, useState } from 'react';
import { Button, Group } from '@mantine/core';
import { useStore } from '../store';
import { enrich, fmt$, fmtPct } from '../selectors';
import { SummaryCard } from '../components/SummaryCard';
import { AllocationPie, PIE_COLORS } from '../components/portfolio/AllocationPie';
import { HoldingsTable, type Period } from '../components/portfolio/HoldingsTable';
import { TabContent, CardsGrid, SectionTitle } from '../components/ui/Layout';

const PERIOD_LABELS: Record<Period, string> = {
  daily: 'Today',
  year: '1 Year',
  alltime: 'All Time',
};

export default function Portfolio() {
  const { state } = useStore();
  const [period, setPeriod] = useState<Period>('alltime');

  const enriched = useMemo(
    () => state.holdings.map(h => enrich(h, state.prices, 0, 0)),
    [state.holdings, state.prices],
  );

  const active = enriched.filter(h => h.totalShares > 0);

  const totalValue = active.reduce((s, h) => s + h.mktVal, 0);
  const totalInvested = active.reduce((s, h) => s + h.costBasis, 0);
  const totalGL = totalValue - totalInvested;
  const totalGLPct = totalInvested > 0 ? (totalGL / totalInvested) * 100 : 0;

  const periodTotals = useMemo(() => {
    const daily$ = active.reduce((s, h) => s + h.totalShares * h.dailyChange, 0);
    const year$ = active.reduce((s, h) => {
      const pct = h.yearChangePct;
      return s + (h.mktVal > 0 && pct !== 0 ? (h.mktVal * pct) / (100 + pct) : 0);
    }, 0);
    return {
      daily: {
        dollar: daily$,
        pct: totalValue > 0 ? (daily$ / Math.max(totalValue - daily$, 1)) * 100 : 0,
      },
      year: {
        dollar: year$,
        pct: totalValue > 0 ? (year$ / Math.max(totalValue - year$, 1)) * 100 : 0,
      },
      alltime: { dollar: totalGL, pct: totalGLPct },
    };
  }, [active, totalValue, totalGL, totalGLPct]);

  const gl = periodTotals[period];

  const pieData = active
    .filter(h => h.mktVal > 0)
    .map((h, i) => ({
      name: h.ticker,
      value: parseFloat(h.mktVal.toFixed(2)),
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));

  return (
    <TabContent>
      <Group gap="xs" mb="lg">
        {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
          <Button
            key={p}
            size="xs"
            variant={period === p ? 'filled' : 'default'}
            onClick={() => setPeriod(p)}
          >
            {PERIOD_LABELS[p]}
          </Button>
        ))}
      </Group>

      <CardsGrid>
        <SummaryCard label="Portfolio Value" value={fmt$(totalValue)} sub="total market value" />
        <SummaryCard label="Invested" value={fmt$(totalInvested)} sub="total cost basis" />
        <SummaryCard
          label={`Gain / Loss — ${PERIOD_LABELS[period]}`}
          value={`${fmt$(gl.dollar)} (${fmtPct(gl.pct)})`}
          sub="unrealized P&L"
          color={gl.dollar >= 0 ? 'var(--green)' : 'var(--red)'}
        />
      </CardsGrid>

      {pieData.length > 0 && <AllocationPie data={pieData} />}

      <SectionTitle>Holdings</SectionTitle>
      <HoldingsTable holdings={active} totalValue={totalValue} period={period} />
    </TabContent>
  );
}
