import { useMemo, useState, useEffect } from 'react';
import {
  Paper,
  Group,
  Stack,
  Text,
  Divider,
  SimpleGrid,
  Accordion,
  Box,
  NumberInput,
  Button,
} from '@mantine/core';
import { useStore } from '../store';
import { fmt$, fmtPct, PERIOD_DAYS, FREQ_LABELS } from '../selectors';
import { computeDcaAllocation } from '../services/dcaAllocation';
import { SummaryCard } from '../components/SummaryCard';
import { InfoTip } from '../components/ui/InfoTip';
import { CoreTable } from '../components/dca-planner/CoreTable';
import { WishlistChips } from '../components/dca-planner/WishlistChips';
import { BucketManager } from '../components/dca-planner/BucketManager';
import { TabContent, AlertBanner, SectionTitle, SectionDesc } from '../components/ui/Layout';

function BudgetInput({
  value,
  onCommit,
  hint,
  label,
}: {
  value: number;
  onCommit: (n: number) => void;
  hint?: string;
  label: string;
}) {
  const [str, setStr] = useState(() => String(value));
  useEffect(() => {
    setStr(String(value));
  }, [value]);

  return (
    <Stack gap={4}>
      <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>
        {label}
      </Text>
      <NumberInput
        value={parseFloat(str) || 0}
        onChange={v => setStr(String(v))}
        onBlur={() => {
          const n = parseFloat(str);
          if (!isNaN(n) && n >= 0) onCommit(n);
          else setStr(String(value));
        }}
        min={0}
        step={10}
        prefix="$"
        decimalScale={2}
        hideControls
        size="sm"
        style={{ width: 160 }}
      />
      {hint && (
        <Text size="xs" c="dimmed" mt={2}>
          {hint}
        </Text>
      )}
    </Stack>
  );
}

export default function DcaPlanner({ onNavigateToManage }: { onNavigateToManage?: () => void }) {
  const { state, dispatch } = useStore();

  const daysInPayPeriod = PERIOD_DAYS[state.payFrequency];
  const freqLabel = FREQ_LABELS[state.payFrequency];

  const alloc = useMemo(
    () =>
      computeDcaAllocation(
        state.holdings,
        state.buckets,
        state.prices,
        state.biWeeklyBudget,
        state.doubleDownBudget,
        daysInPayPeriod,
      ),
    [
      state.holdings,
      state.buckets,
      state.prices,
      state.biWeeklyBudget,
      state.doubleDownBudget,
      daysInPayPeriod,
    ],
  );

  const {
    allEnriched,
    soloEnriched,
    allCore,
    wishlist,
    perSlotDailyAmt,
    perSlotPeriodAmt,
    activePeriodTotal,
    slotBreakdown,
    triggeredAll,
    doubleDownActive,
    doubleDownPending,
    extraNeededPeriod,
    canFullyCover,
    actualExtraTotal,
    actualPerStock,
    shortfall,
  } = alloc;

  const active = useMemo(() => allEnriched.filter(h => h.totalShares > 0), [allEnriched]);
  const totalValue = active.reduce((s, h) => s + h.mktVal, 0);
  const totalInvested = active.reduce((s, h) => s + h.costBasis, 0);
  const totalGL = totalValue - totalInvested;
  const totalGLPct = totalInvested > 0 ? (totalGL / totalInvested) * 100 : 0;
  const dailyChange$ = active.reduce((s, h) => s + h.totalShares * h.dailyChange, 0);
  const dailyChangePct =
    totalValue > 0 ? (dailyChange$ / Math.max(totalValue - dailyChange$, 1)) * 100 : 0;

  const extraAvailable = state.doubleDownBudget;

  return (
    <TabContent>
      {/* Empty-state onboarding card */}
      {allCore.length === 0 && (
        <Paper withBorder p="lg" radius="md" mb="lg" style={{ borderLeft: '3px solid var(--mantine-color-blue-5)' }}>
          <Text fw={700} mb="xs">Welcome to DCA Tracker</Text>
          <Text size="sm" c="dimmed" mb="md">
            You don't have any core holdings yet. Follow these 3 steps to get started:
          </Text>
          <Stack gap="sm" mb="md">
            {[
              { label: 'Go to Manage and click Add Holding to enter your stocks and broker positions.' },
              { label: 'Set each stock\'s category to Core to include it in your DCA plan.' },
              { label: 'Return here to set your budget and see your per-stock DCA schedule.' },
            ].map((step, i) => (
              <Group key={i} gap="sm" align="flex-start">
                <Box
                  w={22} h={22}
                  style={{
                    borderRadius: '50%',
                    background: i === 0 ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-dark-4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <Text size="xs" fw={700} c="white">{i + 1}</Text>
                </Box>
                <Text size="sm">{step.label}</Text>
              </Group>
            ))}
          </Stack>
          <Button size="sm" onClick={onNavigateToManage}>Add your first holding →</Button>
        </Paper>
      )}

      {/* Account Overview — stats strip */}
      <SectionTitle>Account Overview</SectionTitle>
      <SectionDesc>
        Live snapshot of your total portfolio value, cost basis, and unrealized gains. Prices
        refresh when you click <strong>Refresh Prices</strong> in the header.
      </SectionDesc>
      <Group gap={0} pb="lg" wrap="wrap">
        <Stack gap={2} pr="xl" style={{ whiteSpace: 'nowrap' }}>
          <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>
            Portfolio Value
          </Text>
          <Text size="2rem" fw={700} lh={1}>
            {fmt$(totalValue)}
          </Text>
        </Stack>
        <Divider orientation="vertical" h={36} style={{ alignSelf: 'center' }} mx="xl" />
        <Stack gap={2} mr="xl" style={{ whiteSpace: 'nowrap' }}>
          <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>
            Invested
          </Text>
          <Text size="sm" fw={600}>{fmt$(totalInvested)}</Text>
        </Stack>
        <Divider orientation="vertical" h={36} style={{ alignSelf: 'center' }} mx="xl" />
        <Stack gap={2} mr="xl" style={{ whiteSpace: 'nowrap' }}>
          <Group gap={4}>
            <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>
              All-Time G/L
            </Text>
            <InfoTip text="Gain/Loss since your first purchase — market value minus total cost basis across all holdings." />
          </Group>
          <Text size="sm" fw={600} c={totalGL >= 0 ? 'green' : 'red'}>
            {fmt$(totalGL)} ({fmtPct(totalGLPct)})
          </Text>
        </Stack>
        <Divider orientation="vertical" h={36} style={{ alignSelf: 'center' }} mx="xl" />
        <Stack gap={2} style={{ whiteSpace: 'nowrap' }}>
          <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>
            Today's Change
          </Text>
          <Text size="sm" fw={600} c={dailyChange$ >= 0 ? 'green' : 'red'}>
            {fmt$(dailyChange$)} ({fmtPct(dailyChangePct)})
          </Text>
        </Stack>
      </Group>

      {/* Budget — full width */}
      <Paper withBorder p="lg" radius="md" mb="lg">
        <SectionTitle>Budget</SectionTitle>
        <SectionDesc>
          Set how much to invest each pay period. Your total DCA budget is split evenly across
          slots — one slot per solo core holding, one slot per bucket (group of holdings).
        </SectionDesc>
        <Group gap="xl" mb="lg" align="flex-end" wrap="wrap">
          <BudgetInput
            label={`${freqLabel} DCA budget`}
            value={state.biWeeklyBudget}
            onCommit={n => dispatch({ type: 'SET_BIWEEKLY_BUDGET', payload: n })}
            hint={`${slotBreakdown} · ${fmt$(perSlotPeriodAmt, 0)}/slot/${freqLabel.toLowerCase()} · ${fmt$(perSlotDailyAmt)}/slot/day`}
          />
          <Divider orientation="vertical" h={40} style={{ alignSelf: 'center' }} />
          <BudgetInput
            label={`Double-Down budget / ${freqLabel.toLowerCase()}`}
            value={state.doubleDownBudget}
            onCommit={n => dispatch({ type: 'SET_DOUBLE_DOWN_BUDGET', payload: n })}
            hint={
              doubleDownActive.length > 0
                ? `${fmt$(extraNeededPeriod)} needed · ${doubleDownActive.length} stock${doubleDownActive.length > 1 ? 's' : ''}`
                : 'set a budget to see your per-stock target'
            }
          />
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
          <SummaryCard
            label={`${freqLabel} Budget`}
            value={fmt$(state.biWeeklyBudget)}
            sub={`${allCore.length} core · ${alloc.effectiveSlots} slots`}
          />
          <SummaryCard
            label={`Per Slot / ${freqLabel}`}
            value={fmt$(perSlotPeriodAmt)}
            sub={`${fmt$(perSlotDailyAmt)}/slot/day`}
          />
          <SummaryCard
            label={`Active ${freqLabel}`}
            value={fmt$(activePeriodTotal)}
            sub={
              activePeriodTotal > state.biWeeklyBudget
                ? `incl. ${fmt$(activePeriodTotal - state.biWeeklyBudget)} double-down`
                : 'base only'
            }
          />
          {triggeredAll.length > 0 && (
            <SummaryCard
              label="Double-Down Budget"
              value={extraAvailable > 0 ? fmt$(actualExtraTotal) : fmt$(extraNeededPeriod)}
              sub={
                extraAvailable === 0
                  ? `${fmt$(extraNeededPeriod)} needed — set double-down budget above`
                  : canFullyCover
                    ? `fully covered · ${fmt$(actualPerStock)}/stock`
                    : `short ${fmt$(shortfall)} · ${fmt$(actualPerStock)}/stock`
              }
              color={
                extraAvailable === 0
                  ? 'var(--amber)'
                  : canFullyCover
                    ? 'var(--green)'
                    : 'var(--red)'
              }
            />
          )}
        </SimpleGrid>
      </Paper>

      {doubleDownPending.length > 0 && (
        <AlertBanner>
          <strong>
            {doubleDownPending.length} stock{doubleDownPending.length > 1 ? 's' : ''}
          </strong>{' '}
          triggered but not doubling down: {doubleDownPending.map(h => h.ticker).join(', ')}
          <Text size="xs" c="dimmed" mt={4}>
            Toggle "Double Down" below to activate 2× extra
          </Text>
        </AlertBanner>
      )}

      <BucketManager
        buckets={state.buckets}
        coreHoldings={state.holdings.filter(h => h.category === 'core')}
        enrichedCore={allCore}
        perSlotDailyAmt={perSlotDailyAmt}
        payFrequency={state.payFrequency}
        dispatch={dispatch}
      />

      <SectionTitle>Core Holdings — DCA Schedule</SectionTitle>
      <SectionDesc>
        Your regular DCA allocations per stock, plus Double Down amounts when active. Click any
        row to expand cost basis and gain/loss details.
      </SectionDesc>

      {/* Trigger explanation guide */}
      <Accordion variant="default" mb="sm" styles={{ content: { paddingLeft: 0, paddingRight: 0 } }}>
        <Accordion.Item value="guide">
          <Accordion.Control>
            <Text size="xs" c="dimmed">How do triggers and Double Down work?</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Box fz="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
              <Text size="sm" mb="xs">
                <strong>Trigger conditions</strong> — a stock is "triggered" when either of these is true:
              </Text>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>Price is <strong>below its 200-day moving average</strong> (trading below long-term trend)</li>
                <li>Price is <strong>20% or more below its 52-week high</strong> (or ATH if you've set one)</li>
              </ul>
              <Text size="sm" mb="xs">
                <strong>Double Down</strong> — triggering alone does nothing. You opt in per stock by
                clicking the "Double Down" button in the table below. When active, the stock receives
                an extra allocation from your separate Double-Down Budget on top of its regular DCA
                share. This is intentional: it forces a deliberate conviction check before deploying
                extra capital.
              </Text>
              <Text size="sm">
                <strong>Slots</strong> — your total DCA budget is divided into equal slots. Solo core
                holdings each occupy one slot. A bucket (a group of holdings) also occupies one slot,
                with that slot's amount split among the bucket's members.
              </Text>
            </Box>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <CoreTable
        holdings={soloEnriched}
        displayPeriods={state.displayPeriods}
        dispatch={dispatch}
      />

      <WishlistChips holdings={wishlist} />
    </TabContent>
  );
}
