import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stepper,
  Stack,
  Text,
  Group,
  Button,
  NumberInput,
  TextInput,
  NativeSelect,
  Badge,
  ThemeIcon,
  Alert,
  Anchor,
  Collapse,
  Loader,
  ActionIcon,
  SimpleGrid,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useStore } from '../../store';
import { fetchCompanyName } from '../../services/yahooFinance';
import { FREQ_LABELS } from '../../constants/periods';
import { IconCheck, IconX, IconPlus } from '../icons';
import type { PayFrequency, Holding } from '../../types';

const TOTAL_STEPS = 3;

const PAY_OPTIONS: { value: PayFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function SetupWizard({ onSkip }: { onSkip: () => void }) {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // ── Step 0 state ───────────────────────────────────────────────────────
  const [budgetStr, setBudgetStr] = useState(() => String(state.biWeeklyBudget));
  const [ddBudgetStr, setDdBudgetStr] = useState(() => String(state.doubleDownBudget));
  const [showDdBudget, setShowDdBudget] = useState(false);

  // ── Step 1 state ───────────────────────────────────────────────────────
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [nameFetching, setNameFetching] = useState(false);
  const [category, setCategory] = useState<Holding['category']>('core');
  const [broker, setBroker] = useState('');
  const [sharesStr, setSharesStr] = useState('');
  const [avgCostStr, setAvgCostStr] = useState('');
  const [formError, setFormError] = useState('');

  // ── Budget helpers ─────────────────────────────────────────────────────
  function commitBudget() {
    const n = parseFloat(budgetStr);
    const committed = !isNaN(n) && n >= 0 ? n : 0;
    dispatch({ type: 'SET_BIWEEKLY_BUDGET', payload: committed });
    setBudgetStr(String(committed));
  }

  function commitDdBudget() {
    const n = parseFloat(ddBudgetStr);
    const committed = !isNaN(n) && n >= 0 ? n : 0;
    dispatch({ type: 'SET_DOUBLE_DOWN_BUDGET', payload: committed });
    setDdBudgetStr(String(committed));
  }

  // ── Add stock ──────────────────────────────────────────────────────────
  async function handleTickerBlur() {
    const t = ticker.trim().toUpperCase();
    if (!t || name.trim()) return;
    setNameFetching(true);
    const fetched = await fetchCompanyName(t);
    if (fetched) setName(fetched);
    setNameFetching(false);
  }

  function addStock() {
    const t = ticker.trim().toUpperCase();
    if (!t) { setFormError('Ticker symbol is required.'); return; }
    if (!name.trim()) { setFormError('Company name is required — tab out of Ticker to auto-fill.'); return; }
    if (state.holdings.some(h => h.ticker === t)) {
      setFormError(`${t} is already added.`);
      return;
    }
    setFormError('');

    const shares = parseFloat(sharesStr) || 0;
    const avgCost = parseFloat(avgCostStr) || 0;
    const hasPosition = broker.trim() && (shares > 0 || avgCost > 0);

    const holding: Holding = {
      id: t,
      ticker: t,
      name: name.trim(),
      role: '',
      category,
      positions: hasPosition ? [{ broker: broker.trim(), shares, avgCost }] : [],
      ath: null,
      doubleDown: false,
    };

    dispatch({ type: 'UPSERT_HOLDING', payload: holding });

    // Clear form for next stock
    setTicker('');
    setName('');
    setCategory('core');
    setBroker('');
    setSharesStr('');
    setAvgCostStr('');

    notifications.show({
      color: 'green',
      message: `${t} added.`,
      autoClose: 1500,
    });
  }

  function removeStock(id: string) {
    dispatch({ type: 'DELETE_HOLDING', payload: id });
  }

  const coreCount = state.holdings.filter(h => h.category === 'core').length;

  return (
    <Stack gap="xl" style={{ maxWidth: 600, margin: '0 auto', paddingTop: '1rem', position: 'relative' }}>
      <ActionIcon
        variant="subtle"
        color="gray"
        size="sm"
        title="Skip setup — open full Manage page"
        onClick={onSkip}
        style={{ position: 'absolute', top: 0, right: 0 }}
        aria-label="Skip setup"
      >
        <IconX />
      </ActionIcon>

      <Stepper active={step} size="sm" styles={{ stepLabel: { fontSize: '0.78rem' } }}>
        <Stepper.Step label="Set budget" />
        <Stepper.Step label="Add stocks" />
        <Stepper.Step label="All set!" />
      </Stepper>

      {/* ── Step 0: Budget & Schedule ────────────────────────────────────── */}
      {step === 0 && (
        <Stack gap="lg">
          <Stack gap={4}>
            <Text fw={700} size="lg">How much will you invest each pay period?</Text>
            <Text size="sm" c="dimmed">
              Your budget divides equally across all Core stocks — you can change this anytime.
            </Text>
          </Stack>

          <Stack gap="xs">
            <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
              Pay frequency
            </Text>
            <Group gap="xs" wrap="wrap">
              {PAY_OPTIONS.map(opt => (
                <Button
                  key={opt.value}
                  size="xs"
                  variant={state.payFrequency === opt.value ? 'filled' : 'default'}
                  onClick={() => dispatch({ type: 'SET_PAY_FREQUENCY', payload: opt.value })}
                >
                  {opt.label}
                </Button>
              ))}
            </Group>
          </Stack>

          <Stack gap="xs">
            <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
              {FREQ_LABELS[state.payFrequency]} DCA budget
            </Text>
            <NumberInput
              value={parseFloat(budgetStr) || 0}
              onChange={v => setBudgetStr(String(v))}
              onBlur={commitBudget}
              min={0}
              step={10}
              prefix="$"
              decimalScale={2}
              hideControls
              size="sm"
              style={{ maxWidth: 200 }}
            />
          </Stack>

          <Stack gap="xs">
            <Anchor
              component="button"
              size="xs"
              onClick={() => setShowDdBudget(v => !v)}
            >
              {showDdBudget ? '− Hide double-down budget' : '+ Add double-down budget (optional)'}
            </Anchor>
            <Collapse in={showDdBudget}>
              <Stack gap="xs">
                <Text size="xs" c="dimmed">
                  Funds extra purchases when a stock is 20% or more below its 52-week high (or ATH if set).
                </Text>
                <NumberInput
                  value={parseFloat(ddBudgetStr) || 0}
                  onChange={v => setDdBudgetStr(String(v))}
                  onBlur={commitDdBudget}
                  min={0}
                  step={10}
                  prefix="$"
                  decimalScale={2}
                  hideControls
                  size="sm"
                  style={{ maxWidth: 200 }}
                />
              </Stack>
            </Collapse>
          </Stack>
        </Stack>
      )}

      {/* ── Step 1: Add Your Stocks ──────────────────────────────────────── */}
      {step === 1 && (
        <Stack gap="lg">
          <Stack gap={4}>
            <Text fw={700} size="lg">Add your stocks</Text>
            <Text size="sm" c="dimmed">
              Fill in a ticker and click <strong style={{ color: 'inherit' }}>Add Stock</strong> — repeat for each holding you want to DCA. Positions (shares + cost) are optional.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <Stack gap={4}>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
                Ticker
              </Text>
              <TextInput
                placeholder="e.g. AAPL"
                size="xs"
                value={ticker}
                onChange={e => setTicker(e.target.value.toUpperCase())}
                onBlur={handleTickerBlur}
                styles={{ input: { fontSize: '0.83rem' } }}
              />
            </Stack>

            <Stack gap={4}>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
                Company name
              </Text>
              <TextInput
                placeholder={nameFetching ? 'Looking up…' : 'Auto-filled on tab'}
                size="xs"
                value={name}
                onChange={e => setName(e.target.value)}
                rightSection={nameFetching ? <Loader size="xs" /> : undefined}
                styles={{ input: { fontSize: '0.83rem' } }}
              />
            </Stack>

            <Stack gap={4}>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
                Category
              </Text>
              <NativeSelect
                size="xs"
                value={category}
                onChange={e => setCategory(e.target.value as Holding['category'])}
                data={[
                  { value: 'core', label: 'Core — DCA every paycheck' },
                  { value: 'extra', label: "Extra — owned, not DCA'd" },
                  { value: 'wishlist', label: 'Watchlist — not yet bought' },
                ]}
                styles={{ input: { fontSize: '0.83rem' } }}
              />
            </Stack>

            <Stack gap={4}>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
                Broker (optional)
              </Text>
              <TextInput
                placeholder="e.g. Fidelity"
                size="xs"
                value={broker}
                onChange={e => setBroker(e.target.value)}
                styles={{ input: { fontSize: '0.83rem' } }}
              />
            </Stack>

            <Stack gap={4}>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
                Shares (optional)
              </Text>
              <TextInput
                placeholder="e.g. 10"
                size="xs"
                value={sharesStr}
                onChange={e => setSharesStr(e.target.value)}
                type="number"
                min="0"
                styles={{ input: { fontSize: '0.83rem' } }}
              />
            </Stack>

            <Stack gap={4}>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
                Avg cost / share (optional)
              </Text>
              <TextInput
                placeholder="e.g. 142.50"
                size="xs"
                value={avgCostStr}
                onChange={e => setAvgCostStr(e.target.value)}
                type="number"
                min="0"
                styles={{ input: { fontSize: '0.83rem' } }}
              />
            </Stack>
          </SimpleGrid>

          {formError && (
            <Text size="xs" c="red">{formError}</Text>
          )}

          <Button
            size="sm"
            leftSection={<IconPlus />}
            onClick={addStock}
            style={{ alignSelf: 'flex-start' }}
          >
            Add Stock
          </Button>

          {state.holdings.length > 0 && (
            <Stack gap="xs">
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: '0.05em' }}>
                Added ({state.holdings.length})
              </Text>
              <Group gap="xs">
                {state.holdings.map(h => (
                  <Badge
                    key={h.id}
                    color={h.category === 'core' ? 'blue' : h.category === 'extra' ? 'violet' : 'gray'}
                    variant="light"
                    rightSection={
                      <ActionIcon
                        size="xs"
                        variant="transparent"
                        color={h.category === 'core' ? 'blue' : h.category === 'extra' ? 'violet' : 'gray'}
                        onClick={() => removeStock(h.id)}
                        aria-label={`Remove ${h.ticker}`}
                      >
                        <IconX />
                      </ActionIcon>
                    }
                  >
                    {h.ticker}
                  </Badge>
                ))}
              </Group>
            </Stack>
          )}

          <Text size="xs" c="dimmed">
            You can add more stocks and broker positions anytime from Manage → Holdings.
          </Text>
        </Stack>
      )}

      {/* ── Step 2: Done ─────────────────────────────────────────────────── */}
      {step === 2 && (
        <Stack gap="lg" align="center" py="md">
          <ThemeIcon size={72} radius="xl" color="green" variant="light">
            <IconCheck />
          </ThemeIcon>

          <Stack gap={4} align="center">
            <Text fw={700} size="xl">You're all set!</Text>
            <Text size="sm" c="dimmed" ta="center">
              <strong>${state.biWeeklyBudget}</strong> {FREQ_LABELS[state.payFrequency].toLowerCase()}
              {coreCount > 0 && ` · ${coreCount} core stock${coreCount !== 1 ? 's' : ''}`}
            </Text>
          </Stack>

          <Alert color="blue" variant="light" style={{ width: '100%', maxWidth: 400 }}>
            <Text size="sm">
              Hit <strong>Refresh prices</strong> in the header to load live data for your holdings.
            </Text>
          </Alert>

          <Button size="md" onClick={() => navigate('/planner')}>
            Open DCA Planner →
          </Button>

          <Text size="xs" c="dimmed">
            Add more stocks or change settings in{' '}
            <Anchor component="button" size="xs" onClick={onSkip}>
              Manage
            </Anchor>
          </Text>
        </Stack>
      )}

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      {step < TOTAL_STEPS - 1 && (
        <Stack gap={4} mt="sm">
          <Group justify="space-between">
            <Button
              variant="subtle"
              color="gray"
              disabled={step === 0}
              onClick={() => setStep(s => s - 1)}
            >
              Back
            </Button>
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && state.holdings.length === 0}
            >
              {step === TOTAL_STEPS - 2 ? 'Continue →' : 'Next →'}
            </Button>
          </Group>
          {step === 1 && state.holdings.length === 0 && (
            <Text size="xs" c="dimmed" ta="right">
              Add at least one stock above to continue
            </Text>
          )}
        </Stack>
      )}

      <Text size="xs" c="dimmed" ta="center" mt="xs">
        Prefer to configure manually?{' '}
        <Anchor component="button" size="xs" onClick={onSkip}>
          Open the full Manage page
        </Anchor>
      </Text>
    </Stack>
  );
}
