import React, { useState } from 'react';
import type { Dispatch } from 'react';
import { Group, Stack, Text, Button, Box } from '@mantine/core';
import { IconCheck, IconChevron } from '../icons';
import { InfoTip } from '../ui/InfoTip';
import { PctCell } from '../PctCell';
import { formatDollars, formatPercent, formatShares } from '../../utils/format';
import { PERIOD_DAYS, PERIOD_COL_LABELS } from '../../constants/periods';
import { TriggerBadge } from './TriggerBadge';
import {
  TableWrap,
  DataTable,
  Th,
  Td,
  TbodyRow,
  TotalTd,
  TickerMain,
  TickerSub,
} from '../ui/Table';
import { Muted } from '../ui/Layout';
import type { EnrichedHolding, Action, DisplayPeriod } from '../../types';

// Fixed columns: chevron + ticker + role + shares + price + trigger + double-down = 7
// Per period: $/period + extra/period + total/period = 3 each
// Trailing: vsMA + vsATH = 2
const FIXED_COLS = 7;
const TRAIL_COLS = 2;

export function CoreTable({
  holdings,
  displayPeriods,
  dispatch,
}: {
  holdings: EnrichedHolding[];
  displayPeriods: DisplayPeriod[];
  dispatch: Dispatch<Action>;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const periods = displayPeriods.length > 0 ? displayPeriods : ['biweekly' as DisplayPeriod];
  const COLS = FIXED_COLS + periods.length * 3 + TRAIL_COLS;

  const totalMktVal = holdings.reduce((s, h) => s + h.mktVal, 0);

  return (
    <TableWrap>
      <DataTable>
        <thead>
          <tr>
            <Th style={{ width: 28 }} />
            <Th>Ticker</Th>
            <Th>Role</Th>
            <Th $num>Shares</Th>
            <Th $num>Price</Th>
            <Th>
              Trigger
              <InfoTip text="Met when the stock's price is BELOW its 200-day moving average OR is 20%+ below its 52-week high (or ATH if set). Triggered stocks are eligible for a Double Down." />
            </Th>
            <Th>
              Double Down
              <InfoTip text="When toggled on, this stock receives an extra allocation from your Double-Down Budget on top of its regular DCA share. Only triggered stocks should be doubled down." />
            </Th>
            {periods.map(p => (
              <React.Fragment key={p}>
                <Th $num>
                  $/{PERIOD_COL_LABELS[p]}
                  <InfoTip text="Your regular DCA allocation for this stock — base budget ÷ number of slots, scaled to the selected time period." />
                </Th>
                <Th $num>
                  Extra/{PERIOD_COL_LABELS[p]}
                  <InfoTip text="Additional allocation from the Double-Down Budget. Only shown when Double Down is active for this stock." />
                </Th>
                <Th $num>Total/{PERIOD_COL_LABELS[p]}</Th>
              </React.Fragment>
            ))}
            <Th $num>
              vs 200-MA
              <InfoTip text="How far the current price is above or below the 200-day moving average. Negative = below the long-term trend. One of the two Double Down trigger conditions." />
            </Th>
            <Th $num>
              vs 52W High
              <InfoTip text="How far the current price is below the 52-week high (or ATH if set). A drop of 20% or more triggers the Double Down condition." />
            </Th>
          </tr>
        </thead>
        <tbody>
          {holdings.map(h => {
            const isExpanded = expandedId === h.id;
            const glColor = h.gl >= 0 ? 'var(--green)' : 'var(--red)';
            const alloc = totalMktVal > 0 ? (h.mktVal / totalMktVal) * 100 : 0;

            return (
              <React.Fragment key={h.id}>
                <TbodyRow
                  $triggered={h.triggered}
                  onClick={() => setExpandedId(prev => (prev === h.id ? null : h.id))}
                  style={{ cursor: 'pointer' }}
                  title={isExpanded ? 'Collapse' : 'Click to show financials'}
                >
                  <Td>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--muted)',
                      }}
                    >
                      <IconChevron open={isExpanded} />
                    </Box>
                  </Td>
                  <Td>
                    <TickerMain>{h.ticker}</TickerMain>
                    <TickerSub>{h.name}</TickerSub>
                  </Td>
                  <Td $muted>{h.role}</Td>
                  <Td $num>{h.totalShares > 0 ? formatShares(h.totalShares) : <Muted>—</Muted>}</Td>
                  <Td $num>{h.price > 0 ? formatDollars(h.price) : <Muted>—</Muted>}</Td>
                  <Td>
                    <TriggerBadge h={h} />
                  </Td>
                  <Td>
                    <Button
                      size="compact-xs"
                      variant={h.doubleDown ? 'light' : 'default'}
                      color={h.doubleDown ? 'green' : 'gray'}
                      leftSection={h.doubleDown ? <IconCheck /> : null}
                      onClick={e => {
                        e.stopPropagation();
                        dispatch({ type: 'TOGGLE_DOUBLE_DOWN', payload: h.id });
                      }}
                    >
                      {h.doubleDown ? '2× Active' : 'Double Down'}
                    </Button>
                  </Td>
                  {periods.map(p => {
                    const days = PERIOD_DAYS[p];
                    return (
                      <React.Fragment key={p}>
                        <Td $num>{formatDollars(h.baseDaily * days)}</Td>
                        <Td
                          $num
                          style={{ color: h.extraDaily > 0 ? 'var(--amber)' : 'var(--muted)' }}
                        >
                          {formatDollars(h.extraDaily * days)}
                        </Td>
                        <Td $num $bold>
                          {formatDollars(h.totalDaily * days)}
                        </Td>
                      </React.Fragment>
                    );
                  })}
                  <PctCell value={h.vsMA} />
                  <PctCell value={h.vsATH} />
                </TbodyRow>

                {isExpanded && (
                  <tr>
                    <td
                      colSpan={COLS}
                      style={{
                        padding: 0,
                        background: 'var(--bg)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <Group
                        gap={0}
                        wrap="wrap"
                        style={{ padding: '0.75rem 1rem 0.75rem 2.5rem' }}
                      >
                        <Group
                          gap="xl"
                          pr="xl"
                          mr="xl"
                          style={{
                            borderRight: '1px solid var(--border)',
                            paddingTop: '0.35rem',
                            paddingBottom: '0.35rem',
                          }}
                        >
                          <Stack gap={2}>
                            <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>Current Price</Text>
                            <Text size="sm" fw={600}>{h.price > 0 ? formatDollars(h.price) : '—'}</Text>
                          </Stack>
                          <Stack gap={2}>
                            <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>Wtd Avg Cost</Text>
                            <Text size="sm" fw={600}>{h.weightedAvg > 0 ? formatDollars(h.weightedAvg) : '—'}</Text>
                          </Stack>
                          <Stack gap={2}>
                            <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>Cost Basis</Text>
                            <Text size="sm" fw={600}>{formatDollars(h.costBasis)}</Text>
                          </Stack>
                        </Group>

                        <Group
                          gap="xl"
                          pr="xl"
                          mr="xl"
                          style={{
                            borderRight: '1px solid var(--border)',
                            paddingTop: '0.35rem',
                            paddingBottom: '0.35rem',
                          }}
                        >
                          <Stack gap={2}>
                            <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>Mkt Value</Text>
                            <Text size="sm" fw={600}>{h.mktVal > 0 ? formatDollars(h.mktVal) : '—'}</Text>
                          </Stack>
                          <Stack gap={2}>
                            <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>G/L $</Text>
                            <Text
                              size="sm"
                              fw={600}
                              style={h.price > 0 ? { color: glColor } : undefined}
                            >
                              {h.price > 0 ? formatDollars(h.gl) : '—'}
                            </Text>
                          </Stack>
                          <Stack gap={2}>
                            <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>G/L %</Text>
                            <Text
                              size="sm"
                              fw={600}
                              style={h.price > 0 ? { color: glColor } : undefined}
                            >
                              {h.price > 0 ? formatPercent(h.glPct) : '—'}
                            </Text>
                          </Stack>
                          {totalMktVal > 0 && h.mktVal > 0 && (
                            <Stack gap={2}>
                              <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>Alloc</Text>
                              <Text size="sm" fw={600} c="dimmed">{alloc.toFixed(1)}%</Text>
                            </Stack>
                          )}
                        </Group>

                        <Group
                          gap="xl"
                          style={{ paddingTop: '0.35rem', paddingBottom: '0.35rem' }}
                        >
                          <Stack gap={2}>
                            <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>52W High</Text>
                            <Text size="sm" fw={600}>{h.h52 > 0 ? formatDollars(h.h52) : '—'}</Text>
                          </Stack>
                          <Stack gap={2}>
                            <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>200-MA</Text>
                            <Text size="sm" fw={600}>{h.ma200 > 0 ? formatDollars(h.ma200) : '—'}</Text>
                          </Stack>
                        </Group>
                      </Group>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <TotalTd colSpan={FIXED_COLS}>
              <strong>Totals</strong>
            </TotalTd>
            {periods.map(p => {
              const days = PERIOD_DAYS[p];
              return (
                <React.Fragment key={p}>
                  <TotalTd $num>
                    {formatDollars(holdings.reduce((s, h) => s + h.baseDaily * days, 0))}
                  </TotalTd>
                  <TotalTd $num>
                    {formatDollars(holdings.reduce((s, h) => s + h.extraDaily * days, 0))}
                  </TotalTd>
                  <TotalTd $num>
                    {formatDollars(holdings.reduce((s, h) => s + h.totalDaily * days, 0))}
                  </TotalTd>
                </React.Fragment>
              );
            })}
            <TotalTd colSpan={TRAIL_COLS} />
          </tr>
        </tfoot>
      </DataTable>
    </TableWrap>
  );
}
