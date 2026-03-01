import { useEffect, useState } from 'react';
import {
  Center,
  Stack,
  Loader,
  Text,
  Title,
  Badge,
  Paper,
  Group,
} from '@mantine/core';
import { loadShare } from '../services/db';
import { enrichHolding } from '../utils/holding';
import { formatDollars, formatPercent } from '../utils/format';
import { AllocationPie, PIE_COLORS } from '../components/portfolio/AllocationPie';
import { HoldingsTable } from '../components/portfolio/HoldingsTable';
import { SummaryCard } from '../components/SummaryCard';
import { TabContent, CardsGrid, SectionTitle } from '../components/ui/Layout';
import type { DBState } from '../types';

export function ShareView({ token }: { token: string }) {
  const [snapshot, setSnapshot] = useState<DBState | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    loadShare(token)
      .then(result => {
        if (!result) {
          setInvalid(true);
        } else {
          setSnapshot(result.snapshot);
          setCreatedAt(result.createdAt);
        }
      })
      .catch(err => {
        console.error('[ShareView] failed to load share:', err);
        setInvalid(true);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="sm">
          <Loader size="md" />
          <Text size="sm" c="dimmed">Loading shared portfolio…</Text>
        </Stack>
      </Center>
    );
  }

  if (invalid || !snapshot) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="xs">
          <Text size="xl">🔗</Text>
          <Title order={3}>Link not found</Title>
          <Text size="sm" c="dimmed">This share link is invalid or has been removed.</Text>
        </Stack>
      </Center>
    );
  }

  const enriched = snapshot.holdings.map(h => enrichHolding(h, snapshot.prices, 0, 0));
  const active = enriched.filter(h => h.totalShares > 0);

  const totalValue = active.reduce((s, h) => s + h.mktVal, 0);
  const totalInvested = active.reduce((s, h) => s + h.costBasis, 0);
  const totalGL = totalValue - totalInvested;
  const totalGLPct = totalInvested > 0 ? (totalGL / totalInvested) * 100 : 0;

  const pieData = active
    .filter(h => h.mktVal > 0)
    .map((h, i) => ({
      name: h.ticker,
      value: parseFloat(h.mktVal.toFixed(2)),
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));

  const sharedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <>
      {/* Header */}
      <Paper
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '0 1.5rem',
          height: 56,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Group justify="space-between" w="100%">
          <Group gap="sm">
            <Text fw={700} size="lg" style={{ letterSpacing: '-0.02em' }}>DCA Tracker</Text>
            <Badge variant="light" color="blue">Shared Portfolio</Badge>
          </Group>
          <Group gap="sm">
            {sharedDate && <Text size="xs" c="dimmed">Snapshot from {sharedDate}</Text>}
            <Text size="xs" c="dimmed">View only</Text>
          </Group>
        </Group>
      </Paper>

      {/* Content */}
      <TabContent>
        <CardsGrid>
          <SummaryCard label="Portfolio Value" value={formatDollars(totalValue)} sub="total market value" />
          <SummaryCard label="Invested" value={formatDollars(totalInvested)} sub="total cost basis" />
          <SummaryCard
            label="All-Time Gain / Loss"
            value={`${formatDollars(totalGL)} (${formatPercent(totalGLPct)})`}
            sub="unrealized P&L"
            color={totalGL >= 0 ? 'var(--green)' : 'var(--red)'}
          />
        </CardsGrid>

        {pieData.length > 0 && <AllocationPie data={pieData} />}

        <SectionTitle>Holdings</SectionTitle>
        <HoldingsTable holdings={active} totalValue={totalValue} period="alltime" />
      </TabContent>
    </>
  );
}
