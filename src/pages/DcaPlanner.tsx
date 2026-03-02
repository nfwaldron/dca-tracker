import { useMemo, useState, useEffect } from 'react';
import { COLOR_GAIN, COLOR_LOSS, COLOR_AMBER, MC_BLUE_5, MC_DARK_4 } from '../components/ui/colors';
import {
  Paper,
  Group,
  Stack,
  Text,
  SimpleGrid,
  Accordion,
  Box,
  NumberInput,
  Button,
} from '@mantine/core';
import { useStore } from '../store';
import { formatDollars, formatPercent } from '../utils/format';
import { PERIOD_DAYS, FREQ_LABELS } from '../constants/periods';
import { computeDcaAllocation } from '../utils/dcaAllocation';
import { SummaryCard } from '../components/SummaryCard';
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
      <Text size="xs" tt="uppercase" fw={600} style={{ letterSpacing: '0.05em' }}>
        {label}
      </Text>
      <NumberInput
        value={parseFloat(str) || 0}
        onChange={v => setStr(String(v))}
        onBlur={() => {
          const n = parseFloat(str);
          const committed = !isNaN(n) && n >= 0 ? n : 0;
          onCommit(committed);
          setStr(String(committed));
        }}
        min={0}
        step={10}
        prefix="$"
        decimalScale={2}
        hideControls
        size="sm"
        style={{ width: '100%', maxWidth: 200 }}
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
    coverageRatio,
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
        <Paper withBorder p="lg" radius="md" mb="lg" style={{ borderLeft: `3px solid ${MC_BLUE_5}` }}>
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
                    background: i === 0 ? MC_BLUE_5 : MC_DARK_4,
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

      {/* Account overview — stats strip */}
      <SectionTitle>Account overview</SectionTitle>
      <SectionDesc>
        Live snapshot of your total portfolio value, cost basis, and unrealized gains. Prices
        refresh when you click <strong>Refresh Prices</strong> in the header.
      </SectionDesc>
      <SimpleGrid cols={{ base: 2, sm: 4 }} mb="lg">
        <SummaryCard
          label="Portfolio value"
          value={totalValue > 0 ? formatDollars(totalValue) : '—'}
          sub="Total market value"
        />
        <SummaryCard
          label="Invested"
          value={totalInvested > 0 ? formatDollars(totalInvested) : '—'}
          sub="Total cost basis"
        />
        <SummaryCard
          label="All-time G/L"
          value={totalValue > 0 ? `${formatDollars(totalGL)} (${formatPercent(totalGLPct)})` : '—'}
          sub="Unrealized P&L"
          color={totalValue > 0 ? (totalGL >= 0 ? COLOR_GAIN : COLOR_LOSS) : undefined}
        />
        <SummaryCard
          label="Today's change"
          value={totalValue > 0 ? `${formatDollars(dailyChange$)} (${formatPercent(dailyChangePct)})` : '—'}
          color={totalValue > 0 ? (dailyChange$ >= 0 ? COLOR_GAIN : COLOR_LOSS) : undefined}
        />
      </SimpleGrid>

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
            hint={`${slotBreakdown} · ${formatDollars(perSlotPeriodAmt, 0)}/slot/${freqLabel.toLowerCase()} · ${formatDollars(perSlotDailyAmt)}/slot/day`}
          />
          <BudgetInput
            label={`Double-down budget / ${freqLabel.toLowerCase()}`}
            value={state.doubleDownBudget}
            onCommit={n => dispatch({ type: 'SET_DOUBLE_DOWN_BUDGET', payload: n })}
            hint={
              doubleDownActive.length > 0
                ? `${formatDollars(extraNeededPeriod)} needed · ${doubleDownActive.length} stock${doubleDownActive.length > 1 ? 's' : ''}`
                : 'Set a budget to see your per-stock target'
            }
          />
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
          <SummaryCard
            label={`${freqLabel} budget`}
            value={formatDollars(state.biWeeklyBudget)}
            sub={`${allCore.length} core · ${alloc.effectiveSlots} slots`}
          />
          <SummaryCard
            label={`Per slot / ${freqLabel.toLowerCase()}`}
            value={formatDollars(perSlotPeriodAmt)}
            sub={`${formatDollars(perSlotDailyAmt)}/slot/day`}
          />
          <SummaryCard
            label={`Active ${freqLabel.toLowerCase()}`}
            value={formatDollars(activePeriodTotal)}
            sub={
              activePeriodTotal > state.biWeeklyBudget
                ? `Incl. ${formatDollars(activePeriodTotal - state.biWeeklyBudget)} double-down`
                : 'Base only'
            }
          />
          {triggeredAll.length > 0 && (
            <SummaryCard
              label="Double-down budget"
              value={extraAvailable > 0 ? formatDollars(actualExtraTotal) : formatDollars(extraNeededPeriod)}
              sub={
                extraAvailable === 0
                  ? `${formatDollars(extraNeededPeriod)} needed — set double-down budget above`
                  : canFullyCover
                    ? 'Fully covered'
                    : `Short ${formatDollars(shortfall)} · ${Math.round(coverageRatio * 100)}% covered`
              }
              color={
                extraAvailable === 0
                  ? COLOR_AMBER
                  : canFullyCover
                    ? COLOR_GAIN
                    : COLOR_LOSS
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

      <SectionTitle>Core holdings — DCA schedule</SectionTitle>
      <SectionDesc>
        Your regular DCA allocations per stock, plus Double Down amounts when active. Click any
        row to expand cost basis and gain/loss details.
      </SectionDesc>

      {/* Trigger explanation guide */}
      <Accordion variant="default" mb="sm" styles={{ content: { paddingLeft: 0, paddingRight: 0 } }}>
        <Accordion.Item value="guide">
          <Accordion.Control>
            <Text size="xs">How do triggers and Double Down work?</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Box fz="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
              <Text size="sm" mb="xs">
                <strong>Trigger condition</strong> — a stock is "triggered" when its price is <strong>20% or more below its 52-week high</strong> (or ATH if you've set one).
              </Text>
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
