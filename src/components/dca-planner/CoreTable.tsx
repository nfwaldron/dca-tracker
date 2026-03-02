import React, { useState } from 'react';
import type { Dispatch } from 'react';
import { Group, Stack, Text, Button, Box } from '@mantine/core';
import { IconCheck, IconChevron } from '../icons';
import { InfoTip } from '../ui/InfoTip';
import { PctCell } from '../PctCell';
import { formatDollars, formatPercent, formatShares } from '../../utils/format';
import { PERIOD_DAYS, PERIOD_COL_LABELS } from '../../constants/periods';
import { TriggerBadge } from './TriggerBadge';
import { getDdState, DD_COLOR } from '../../utils/ddDisplay';
import { COLOR_GAIN, COLOR_LOSS, COLOR_MUTED, COLOR_BG, COLOR_BORDER } from '../ui/colors';
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
// Per period: $/period [+ extra/period + total/period when any DD opted in] = 1 or 3 each
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
  // Only show Extra/Total columns when at least one holding has double-down opted in
  const showDdCols = holdings.some(h => h.doubleDown);
  const perPeriodCols = showDdCols ? 3 : 1;
  const COLS = FIXED_COLS + periods.length * perPeriodCols + TRAIL_COLS;

  const totalMktVal = holdings.reduce((s, h) => s + h.mktVal, 0);

  return (
    <TableWrap>
      <DataTable>
        <thead>
          <tr>
            <Th style={{ width: 28 }} />
            <Th>Ticker</Th>
            <Th $hideBelow={768}>Role</Th>
            <Th $num>Shares</Th>
            <Th $num>Price</Th>
            <Th>
              Trigger
              <InfoTip text="Met when the stock's price is 20%+ below its 52-week high (or ATH if set). Triggered stocks are eligible for a Double Down." />
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
                {showDdCols && (
                  <>
                    <Th $num>
                      Extra/{PERIOD_COL_LABELS[p]}
                      <InfoTip text="Additional allocation from the Double-Down Budget. Only shown when Double Down is active for this stock." />
                    </Th>
                    <Th $num>Total/{PERIOD_COL_LABELS[p]}</Th>
                  </>
                )}
              </React.Fragment>
            ))}
            <Th $num $hideBelow={768}>
              vs 200-MA
              <InfoTip text="How far the current price is above or below the 200-day moving average. Negative = below the long-term trend. One of the two Double Down trigger conditions." />
            </Th>
            <Th $num $hideBelow={768}>
              vs 52W High
              <InfoTip text="How far the current price is below the 52-week high (or ATH if set). A drop of 20% or more triggers the Double Down condition." />
            </Th>
          </tr>
        </thead>
        <tbody>
          {holdings.map(h => {
            const isExpanded = expandedId === h.id;
            const glColor = h.gl >= 0 ? COLOR_GAIN : COLOR_LOSS;
            const alloc = totalMktVal > 0 ? (h.mktVal / totalMktVal) * 100 : 0;

            const ddState = getDdState(h);

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
                        color: COLOR_MUTED,
                      }}
                    >
                      <IconChevron open={isExpanded} />
                    </Box>
                  </Td>
                  <Td>
                    <TickerMain>{h.ticker}</TickerMain>
                    <TickerSub>{h.name}</TickerSub>
                  </Td>
                  <Td $muted $hideBelow={768}>{h.role}</Td>
                  <Td $num>{h.totalShares > 0 ? formatShares(h.totalShares) : <Muted>—</Muted>}</Td>
                  <Td $num>{h.price > 0 ? formatDollars(h.price) : <Muted>—</Muted>}</Td>
                  <Td>
                    <TriggerBadge h={h} />
                  </Td>
                  <Td>
                    {(() => {
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
                          onClick={e => {
                            e.stopPropagation();
                            dispatch({ type: 'TOGGLE_DOUBLE_DOWN', payload: h.id });
                          }}
                        >
                          {label}
                        </Button>
                      );
                    })()}
                  </Td>
                  {periods.map(p => {
                    const days = PERIOD_DAYS[p];
                    const extraDisplay = ddState === 'funded'   ? h.extraDaily * days
                                       : ddState === 'unfunded' ? h.baseDaily  * days
                                       : 0;
                    const extraColor = ddState !== 'inactive' ? DD_COLOR[ddState] : COLOR_MUTED;
                    const totalDisplay = ddState === 'unfunded' ? h.baseDaily * 2 * days : h.totalDaily * days;
                    const totalColor   = ddState === 'unfunded' ? DD_COLOR.unfunded : undefined;
                    return (
                      <React.Fragment key={p}>
                        <Td $num>{formatDollars(h.baseDaily * days)}</Td>
                        {showDdCols && (
                          <>
                            <Td $num style={{ color: extraColor }}>
                              {formatDollars(extraDisplay)}
                              {ddState === 'unfunded' && (
                                <span style={{ fontSize: '0.65rem', marginLeft: 3 }}>unfunded</span>
                              )}
                            </Td>
                            <Td $num $bold style={{ color: totalColor }}>
                              {formatDollars(totalDisplay)}
                            </Td>
                          </>
                        )}
                      </React.Fragment>
                    );
                  })}
                  <PctCell value={h.vsMA} hideBelow={768} />
                  <PctCell value={h.vsATH} hideBelow={768} />
                </TbodyRow>

                {isExpanded && (
                  <tr>
                    <td
                      colSpan={COLS}
                      style={{
                        padding: 0,
                        background: COLOR_BG,
                        borderBottom: `1px solid ${COLOR_BORDER}`,
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
                            borderRight: `1px solid ${COLOR_BORDER}`,
                            paddingTop: '0.35rem',
                            paddingBottom: '0.35rem',
                          }}
                        >
                          <Stack gap={2}>
                            <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>Current price</Text>
                            <Text size="sm" fw={600}>{h.price > 0 ? formatDollars(h.price) : '—'}</Text>
                          </Stack>
                          <Stack gap={2}>
                            <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>Wtd avg cost</Text>
                            <Text size="sm" fw={600}>{h.weightedAvg > 0 ? formatDollars(h.weightedAvg) : '—'}</Text>
                          </Stack>
                          <Stack gap={2}>
                            <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>Cost basis</Text>
                            <Text size="sm" fw={600}>{formatDollars(h.costBasis)}</Text>
                          </Stack>
                        </Group>

                        <Group
                          gap="xl"
                          pr="xl"
                          mr="xl"
                          style={{
                            borderRight: `1px solid ${COLOR_BORDER}`,
                            paddingTop: '0.35rem',
                            paddingBottom: '0.35rem',
                          }}
                        >
                          <Stack gap={2}>
                            <Text size="xs" tt="uppercase" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>Mkt value</Text>
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
                  {showDdCols && (
                    <>
                      <TotalTd $num>
                        {formatDollars(holdings.reduce((s, h) => s + h.extraDaily * days, 0))}
                      </TotalTd>
                      <TotalTd $num>
                        {formatDollars(holdings.reduce((s, h) => s + h.totalDaily * days, 0))}
                      </TotalTd>
                    </>
                  )}
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
