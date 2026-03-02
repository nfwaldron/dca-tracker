import { useState, type Dispatch } from 'react';
import {
  Paper,
  Group,
  Stack,
  Text,
  Button,
  TextInput,
  Modal,
  Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconCheck } from '../icons';
import { formatDollars } from '../../utils/format';
import { PERIOD_DAYS, FREQ_LABELS } from '../../constants/periods';
import { getDdState, getDdDisplayDaily, DD_COLOR } from '../../utils/ddDisplay';
import { MC_BLUE_5, MC_RED_5, MC_DARK_4, MC_DIMMED } from '../ui/colors';
import { SectionTitle, SectionDesc } from '../ui/Layout';
import type { DcaBucket, Holding, EnrichedHolding, Action, PayFrequency } from '../../types';

type FormState = { name: string; tickers: string[] };
const BLANK: FormState = { name: '', tickers: [] };

export function BucketManager({
  buckets,
  coreHoldings,
  enrichedCore,
  perSlotDailyAmt,
  payFrequency,
  dispatch,
}: {
  buckets: DcaBucket[];
  coreHoldings: Holding[];
  enrichedCore: EnrichedHolding[];
  perSlotDailyAmt: number;
  payFrequency: PayFrequency;
  dispatch: Dispatch<Action>;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);
  const [error, setError] = useState('');

  const enrichedMap = Object.fromEntries(enrichedCore.map(h => [h.ticker, h]));
  const takenTickers = new Set(buckets.filter(b => b.id !== editingId).flatMap(b => b.tickers));

  function openCreate() {
    setEditingId(null);
    setForm(BLANK);
    setError('');
    open();
  }

  function openEdit(b: DcaBucket) {
    setEditingId(b.id);
    setForm({ name: b.name, tickers: [...b.tickers] });
    setError('');
    open();
  }

  function cancel() {
    close();
    setEditingId(null);
    setForm(BLANK);
    setError('');
  }

  function toggleTicker(ticker: string) {
    if (takenTickers.has(ticker)) return;
    setForm(f => ({
      ...f,
      tickers: f.tickers.includes(ticker)
        ? f.tickers.filter(t => t !== ticker)
        : [...f.tickers, ticker],
    }));
  }

  function save() {
    const name = form.name.trim();
    if (!name) {
      setError('Bucket name is required.');
      return;
    }
    if (form.tickers.length < 2) {
      setError('Select at least 2 stocks.');
      return;
    }
    dispatch({
      type: 'UPSERT_BUCKET',
      payload: {
        id: editingId ?? `bucket-${Date.now()}`,
        name,
        tickers: form.tickers,
      },
    });
    cancel();
  }

  function deleteBucket(id: string, name: string) {
    modals.openConfirmModal({
      title: 'Remove bucket?',
      children: (
        <Text size="sm">
          Remove bucket "{name}"? Stocks will return to solo allocation.
        </Text>
      ),
      labels: { confirm: 'Remove', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => dispatch({ type: 'DELETE_BUCKET', payload: id }),
    });
  }

  if (coreHoldings.length === 0) return null;

  const daysInPeriod = PERIOD_DAYS[payFrequency];
  const freqLabel = FREQ_LABELS[payFrequency];
  const perStockInForm = form.tickers.length >= 2 ? perSlotDailyAmt / form.tickers.length : null;

  return (
    <Box mb="lg">
      {buckets.length > 0 && (
        <>
          <SectionTitle>DCA buckets</SectionTitle>
          <SectionDesc>
            Group related core holdings into one slot so they share a single allocation. Useful for
            sector pairs — e.g. two energy stocks that together get one slot's worth of DCA.
          </SectionDesc>
        </>
      )}

      {buckets.length > 0 && (
        <Group gap="sm" mb="sm" wrap="wrap">
          {buckets.map(b => {
            const perStock = perSlotDailyAmt / b.tickers.length;

            const ddStateOf = (t: string) => { const h = enrichedMap[t]; return h ? getDdState(h) : 'inactive' as const; };
            const anyFunded   = b.tickers.some(t => ddStateOf(t) === 'funded');
            const anyUnfunded = b.tickers.some(t => ddStateOf(t) === 'unfunded');
            const tickerDisplayDaily = (t: string) => {
              const h = enrichedMap[t];
              if (!h) return perStock;
              return getDdDisplayDaily(h);
            };
            const totalDisplayDaily = b.tickers.reduce((s, t) => s + tickerDisplayDaily(t), 0) || perSlotDailyAmt;
            const headerColor = anyFunded
              ? DD_COLOR.funded
              : anyUnfunded
                ? DD_COLOR.unfunded
                : MC_DIMMED;

            return (
              <Paper
                key={b.id}
                withBorder
                p="md"
                radius="md"
                style={{ borderLeft: `3px solid ${MC_BLUE_5}`, minWidth: 260 }}
              >
                <Text fw={700} size="sm" mb={2}>{b.name}</Text>
                <Text size="xs" mb="xs">
                  <span style={{ color: MC_DIMMED }}>1 slot · </span>
                  <span style={{ color: headerColor }}>
                    {formatDollars(totalDisplayDaily * daysInPeriod)}/{freqLabel.toLowerCase()}
                  </span>
                  <span style={{ color: MC_DIMMED }}> · </span>
                  <span style={{ color: headerColor }}>
                    {formatDollars(totalDisplayDaily / b.tickers.length)}/stock/day
                  </span>
                  {anyUnfunded && !anyFunded && (
                    <span style={{ color: MC_RED_5, marginLeft: 4 }}>· unfunded</span>
                  )}
                </Text>

                <Stack gap={6} mb="sm">
                  {b.tickers.map(ticker => {
                    const h = enrichedMap[ticker];
                    const ddState      = ddStateOf(ticker);
                    const displayDaily = tickerDisplayDaily(ticker);
                    const amtColor     = ddState !== 'inactive' ? DD_COLOR[ddState] : MC_DIMMED;
                    return (
                      <Group key={ticker} gap="xs">
                        <Box
                          w={7}
                          h={7}
                          style={{
                            borderRadius: '50%',
                            background: h?.triggered
                              ? MC_RED_5
                              : MC_DARK_4,
                            flexShrink: 0,
                          }}
                          title={h?.triggered ? 'Triggered' : 'Clear'}
                        />
                        <Text size="xs" fw={700} style={{ minWidth: 44 }}>{ticker}</Text>
                        <Text size="xs" style={{ flex: 1, color: amtColor }}>
                          {formatDollars(displayDaily)}/day
                          {ddState === 'funded' && h && (
                            <span style={{ color: MC_DIMMED, marginLeft: 4 }}>
                              ({formatDollars(h.baseDaily)} + {formatDollars(h.extraDaily)})
                            </span>
                          )}
                          {ddState === 'unfunded' && (
                            <span style={{ color: MC_DIMMED, marginLeft: 4 }}>unfunded</span>
                          )}
                        </Text>
                        {h && (() => {
                          const optedIn = h.doubleDown && !h.triggered;
                          const active  = h.doubleDown && h.triggered;
                          const label   = active ? '2× Active' : optedIn ? 'Opted In' : 'Double Down';
                          const tip     = active  ? undefined
                                        : optedIn ? 'Pre-set — will activate when stock triggers'
                                        : !h.triggered ? 'Enable to pre-set — will activate when stock triggers'
                                        : undefined;
                          return (
                            <Button
                              size="compact-xs"
                              variant={h.doubleDown ? 'light' : 'default'}
                              color={h.doubleDown ? 'green' : 'gray'}
                              leftSection={h.doubleDown ? <IconCheck /> : null}
                              title={tip}
                              style={optedIn ? { opacity: 0.65 } : !h.triggered ? { opacity: 0.45 } : undefined}
                              onClick={() => dispatch({ type: 'TOGGLE_DOUBLE_DOWN', payload: h.id })}
                            >
                              {label}
                            </Button>
                          );
                        })()}
                      </Group>
                    );
                  })}
                </Stack>

                <Group gap="xs">
                  <Button size="xs" variant="default" onClick={() => openEdit(b)}>Edit</Button>
                  <Button size="xs" variant="subtle" color="red" onClick={() => deleteBucket(b.id, b.name)}>
                    Remove
                  </Button>
                </Group>
              </Paper>
            );
          })}
        </Group>
      )}

      <Button size="xs" variant="default" onClick={openCreate}>+ Add bucket</Button>

      <Modal
        opened={opened}
        onClose={cancel}
        title={<Text fw={700} size="sm">{editingId ? 'Edit bucket' : 'New bucket'}</Text>}
        size="sm"
      >
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="e.g. Cybersecurity Pair"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            size="sm"
          />

          <Stack gap={6}>
            <Text size="xs" tt="uppercase" fw={600} style={{ letterSpacing: '0.05em' }}>
              Stocks (select 2+)
            </Text>
            <Group gap={6} wrap="wrap">
              {coreHoldings.map(h => {
                const taken = takenTickers.has(h.ticker);
                const selected = form.tickers.includes(h.ticker);
                return (
                  <Button
                    key={h.ticker}
                    size="compact-xs"
                    variant={selected ? 'filled' : 'default'}
                    color={selected ? 'blue' : 'gray'}
                    disabled={taken && !selected}
                    onClick={() => toggleTicker(h.ticker)}
                    title={taken ? 'Already in another bucket' : h.name}
                    style={{ opacity: taken && !selected ? 0.4 : 1 }}
                  >
                    {h.ticker}
                  </Button>
                );
              })}
            </Group>
          </Stack>

          {perStockInForm !== null && (
            <Text size="xs" c="dimmed">
              1 slot ÷ {form.tickers.length} stocks = {formatDollars(perStockInForm)}/stock/day &nbsp;·{' '}
              {formatDollars(perStockInForm * daysInPeriod)}/stock/{freqLabel.toLowerCase()}
            </Text>
          )}

          {error && <Text size="xs" c="red">{error}</Text>}

          <Group gap="xs">
            <Button size="sm" onClick={save}>Save bucket</Button>
            <Button size="sm" variant="default" onClick={cancel}>Cancel</Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
