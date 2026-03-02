import { useState, useMemo } from 'react';
import { formatDollars, formatPercent, formatShares } from '../../utils/format';
import { COLOR_GAIN, COLOR_LOSS } from '../ui/colors';
import { InfoTip } from '../ui/InfoTip';
import { CAT_HEX } from '../../constants/categories';
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
import { CategoryBadge } from '../ui/Badge';
import { Muted } from '../ui/Layout';
import type { EnrichedHolding } from '../../types';

export type Period = 'daily' | 'year' | 'alltime';

type SortKey = 'ticker' | 'price' | 'mktVal' | 'gl' | 'glPct' | 'alloc';
type SortDir = 'asc' | 'desc';

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span style={{ marginLeft: 4, opacity: active ? 1 : 0.25, fontSize: '0.7rem' }}>
      {active ? (dir === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  );
}

function periodGL(h: EnrichedHolding, period: Period) {
  switch (period) {
    case 'daily':
      return { dollar: h.totalShares * h.dailyChange, pct: h.dailyChangePct };
    case 'year': {
      const pct = h.yearChangePct;
      const dollar = h.mktVal > 0 && pct !== 0 ? (h.mktVal * pct) / (100 + pct) : 0;
      return { dollar, pct };
    }
    case 'alltime':
      return { dollar: h.gl, pct: h.glPct };
  }
}

export function HoldingsTable({
  holdings,
  totalValue,
  period,
}: {
  holdings: EnrichedHolding[];
  totalValue: number;
  period: Period;
}) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null);

  function handleSort(key: SortKey) {
    setSort(prev => {
      if (!prev || prev.key !== key) return { key, dir: 'desc' };
      if (prev.dir === 'desc') return { key, dir: 'asc' };
      return null;
    });
  }

  const sorted = useMemo(() => {
    if (!sort) return holdings;
    return [...holdings].sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      switch (sort.key) {
        case 'ticker':  av = a.ticker; bv = b.ticker; break;
        case 'price':   av = a.price;  bv = b.price;  break;
        case 'mktVal':  av = a.mktVal; bv = b.mktVal; break;
        case 'gl':      av = periodGL(a, period).dollar; bv = periodGL(b, period).dollar; break;
        case 'glPct':   av = periodGL(a, period).pct;    bv = periodGL(b, period).pct;    break;
        case 'alloc':   av = a.mktVal; bv = b.mktVal; break;
      }
      if (typeof av === 'string') {
        return sort.dir === 'asc'
          ? av.localeCompare(bv as string)
          : (bv as string).localeCompare(av);
      }
      return sort.dir === 'asc'
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }, [holdings, sort, period]);

  const totalGL = holdings.reduce((s, h) => s + periodGL(h, period).dollar, 0);

  const sortTh = (key: SortKey) => ({
    onClick: () => handleSort(key),
    style: { cursor: 'pointer', userSelect: 'none' as const },
  });

  return (
    <TableWrap>
      <DataTable>
        <thead>
          <tr>
            <Th {...sortTh('ticker')}>
              Ticker
              <SortIndicator active={sort?.key === 'ticker'} dir={sort?.dir ?? 'asc'} />
            </Th>
            <Th>
              Cat
              <InfoTip text="Category: core = actively DCA'd; extra = held but not DCA'd; wishlist = not yet owned." />
            </Th>
            <Th $num $hideBelow={768}>Total shares</Th>
            <Th $num $hideBelow={768}>
              Wtd avg
              <InfoTip text="Weighted Average Cost — total cost basis ÷ total shares. Accounts for purchases at different prices across multiple brokers." />
            </Th>
            <Th $num {...sortTh('price')}>
              Price
              <SortIndicator active={sort?.key === 'price'} dir={sort?.dir ?? 'asc'} />
            </Th>
            <Th $num>
              52W High
              <InfoTip text="Highest price reached in the past 52 weeks (or ATH if set and higher). Used to calculate the Double Down trigger condition." />
            </Th>
            <Th $num {...sortTh('mktVal')}>
              Mkt val
              <InfoTip text="Market Value — total shares × current price." />
              <SortIndicator active={sort?.key === 'mktVal'} dir={sort?.dir ?? 'asc'} />
            </Th>
            <Th $num $hideBelow={768}>
              Cost basis
              <InfoTip text="Total amount invested — sum of (shares × average cost) across all broker positions." />
            </Th>
            <Th $num {...sortTh('gl')}>
              G/L $
              <InfoTip text="Gain/Loss in dollars — market value minus cost basis. Positive = unrealized profit, negative = unrealized loss." />
              <SortIndicator active={sort?.key === 'gl'} dir={sort?.dir ?? 'asc'} />
            </Th>
            <Th $num {...sortTh('glPct')}>
              G/L %
              <InfoTip text="Gain/Loss as a percentage of cost basis." />
              <SortIndicator active={sort?.key === 'glPct'} dir={sort?.dir ?? 'asc'} />
            </Th>
            <Th $num {...sortTh('alloc')}>
              Alloc %
              <InfoTip text="This holding's market value as a percentage of your total portfolio value." />
              <SortIndicator active={sort?.key === 'alloc'} dir={sort?.dir ?? 'asc'} />
            </Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(h => {
            const alloc = totalValue > 0 ? (h.mktVal / totalValue) * 100 : 0;
            const gl = periodGL(h, period);
            const glColor = gl.dollar >= 0 ? COLOR_GAIN : COLOR_LOSS;
            return (
              <TbodyRow key={h.id}>
                <Td>
                  <TickerMain>{h.ticker}</TickerMain>
                  <TickerSub>{h.name}</TickerSub>
                </Td>
                <Td>
                  <CategoryBadge $hex={CAT_HEX[h.category]}>{h.category}</CategoryBadge>
                </Td>
                <Td $num $hideBelow={768}>{formatShares(h.totalShares)}</Td>
                <Td $num $hideBelow={768}>{h.weightedAvg > 0 ? formatDollars(h.weightedAvg) : '—'}</Td>
                <Td $num>{h.price > 0 ? formatDollars(h.price) : <Muted>—</Muted>}</Td>
                <Td $num>
                  {h.h52 > 0 ? (
                    <>
                      {formatDollars(h.h52)}
                      {h.price > 0 &&
                        (() => {
                          const pct = ((h.price - h.h52) / h.h52) * 100;
                          return (
                            <span
                              style={{
                                display: 'block',
                                fontSize: '0.7rem',
                                color: pct >= 0 ? COLOR_GAIN : COLOR_LOSS,
                              }}
                            >
                              {pct >= 0 ? '+' : ''}
                              {pct.toFixed(1)}%
                            </span>
                          );
                        })()}
                    </>
                  ) : (
                    <Muted>—</Muted>
                  )}
                </Td>
                <Td $num $bold>
                  {h.mktVal > 0 ? formatDollars(h.mktVal) : <Muted>—</Muted>}
                </Td>
                <Td $num $hideBelow={768}>{formatDollars(h.costBasis)}</Td>
                <Td $num $bold style={{ color: h.price > 0 ? glColor : undefined }}>
                  {h.price > 0 ? formatDollars(gl.dollar) : <Muted>—</Muted>}
                </Td>
                <Td $num style={{ color: h.price > 0 ? glColor : undefined }}>
                  {h.price > 0 ? formatPercent(gl.pct) : <Muted>—</Muted>}
                </Td>
                <Td $num $muted>
                  {h.mktVal > 0 ? alloc.toFixed(1) + '%' : '—'}
                </Td>
              </TbodyRow>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <TotalTd colSpan={6}>
              <strong>Total</strong>
            </TotalTd>
            <TotalTd $num $bold>
              {formatDollars(totalValue)}
            </TotalTd>
            <TotalTd $num>{formatDollars(holdings.reduce((s, h) => s + h.costBasis, 0))}</TotalTd>
            <TotalTd $num $bold style={{ color: totalGL >= 0 ? COLOR_GAIN : COLOR_LOSS }}>
              {formatDollars(totalGL)}
            </TotalTd>
            <TotalTd colSpan={2} />
          </tr>
        </tfoot>
      </DataTable>
    </TableWrap>
  );
}
