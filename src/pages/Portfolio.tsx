import { useMemo, useState, useCallback } from 'react';
import { COLOR_GAIN, COLOR_LOSS } from '../components/ui/colors';
import { Button, Group, Modal, TextInput, CopyButton, Stack, Text, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '@clerk/clerk-react';
import { BsShareFill, BsClipboard, BsCheck, BsTrash } from 'react-icons/bs';
import { notifications } from '@mantine/notifications';
import { useStore } from '../store';
import { enrichHolding } from '../utils/holding';
import { formatDollars, formatPercent } from '../utils/format';
import { SummaryCard } from '../components/SummaryCard';
import { AllocationPie, PIE_COLORS } from '../components/portfolio/AllocationPie';
import { HoldingsTable, type Period } from '../components/portfolio/HoldingsTable';
import { TabContent, CardsGrid, SectionTitle } from '../components/ui/Layout';
import { makeSupabase } from '../services/supabase';
import { saveShare, revokeShare } from '../services/db';

const PERIOD_LABELS: Record<Period, string> = {
  daily: 'Today',
  year: '1 Year',
  alltime: 'All Time',
};

export default function Portfolio() {
  const { state } = useStore();
  const { userId, getToken } = useAuth();
  const [period, setPeriod] = useState<Period>('alltime');
  const [shareOpened, { open: openShare, close: closeShare }] = useDisclosure(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);

  const enriched = useMemo(
    () => state.holdings.map(h => enrichHolding(h, state.prices, 0, 0)),
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

  const handleShare = useCallback(async () => {
    if (!userId) return;
    setShareLoading(true);
    try {
      const token = await getToken({ template: 'supabase' });
      const sb = makeSupabase(token);
      const shareToken = await saveShare(sb, userId, state);
      const url = `${window.location.origin}${window.location.pathname}?share=${shareToken}`;
      setShareUrl(url);
      openShare();
    } catch {
      notifications.show({ color: 'red', message: 'Failed to generate share link.' });
    } finally {
      setShareLoading(false);
    }
  }, [userId, getToken, state, openShare]);

  const handleRevoke = useCallback(async () => {
    if (!userId) return;
    try {
      const token = await getToken({ template: 'supabase' });
      const sb = makeSupabase(token);
      await revokeShare(sb, userId);
      setShareUrl(null);
      closeShare();
      notifications.show({ color: 'green', message: 'Share link revoked.' });
    } catch {
      notifications.show({ color: 'red', message: 'Failed to revoke share link.' });
    }
  }, [userId, getToken, closeShare]);

  return (
    <TabContent>
      <Group justify="space-between" mb="lg">
        <Group gap="xs">
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
        <Button
          size="xs"
          variant="default"
          leftSection={<BsShareFill size={12} />}
          onClick={handleShare}
          loading={shareLoading}
        >
          Share
        </Button>
      </Group>

      <CardsGrid>
        <SummaryCard label="Portfolio value" value={formatDollars(totalValue)} sub="Total market value" />
        <SummaryCard label="Invested" value={formatDollars(totalInvested)} sub="Total cost basis" />
        <SummaryCard
          label={`Gain/loss — ${PERIOD_LABELS[period]}`}
          value={`${formatDollars(gl.dollar)} (${formatPercent(gl.pct)})`}
          sub="Unrealized P&L"
          color={gl.dollar >= 0 ? COLOR_GAIN : COLOR_LOSS}
        />
      </CardsGrid>

      {pieData.length > 0 && <AllocationPie data={pieData} />}

      <SectionTitle>Holdings</SectionTitle>
      <HoldingsTable holdings={active} totalValue={totalValue} period={period} />

      {/* Share modal */}
      <Modal
        opened={shareOpened}
        onClose={closeShare}
        title="Share portfolio"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Anyone with this link can view a read-only snapshot of your portfolio as it is right now.
            The snapshot will not update automatically — generate a new link to share fresh data.
          </Text>
          {shareUrl && (
            <CopyButton value={shareUrl}>
              {({ copied, copy }) => (
                <TextInput
                  value={shareUrl}
                  readOnly
                  rightSection={
                    <ActionIcon variant="subtle" color={copied ? 'green' : 'gray'} onClick={copy}>
                      {copied ? <BsCheck /> : <BsClipboard />}
                    </ActionIcon>
                  }
                  rightSectionWidth={36}
                  styles={{ input: { fontFamily: 'monospace', fontSize: '0.75rem' } }}
                />
              )}
            </CopyButton>
          )}
          <Group justify="flex-end">
            <Button
              size="xs"
              variant="subtle"
              color="red"
              leftSection={<BsTrash size={12} />}
              onClick={handleRevoke}
            >
              Revoke link
            </Button>
            <Button size="xs" variant="default" onClick={closeShare}>
              Close
            </Button>
          </Group>
        </Stack>
      </Modal>
    </TabContent>
  );
}
