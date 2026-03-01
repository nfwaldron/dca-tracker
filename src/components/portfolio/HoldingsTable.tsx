import { formatDollars, formatPercent, formatShares } from '../../utils/format';
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
  const totalGL = holdings.reduce((s, h) => s + periodGL(h, period).dollar, 0);

  return (
    <TableWrap>
      <DataTable>
        <thead>
          <tr>
            <Th>Ticker</Th>
            <Th>
              Cat
              <InfoTip text="Category: core = actively DCA'd; extra = held but not DCA'd; wishlist = not yet owned." />
            </Th>
            <Th $num $hideBelow={768}>Total Shares</Th>
            <Th $num $hideBelow={768}>
              Wtd Avg
              <InfoTip text="Weighted Average Cost — total cost basis ÷ total shares. Accounts for purchases at different prices across multiple brokers." />
            </Th>
            <Th $num>Price</Th>
            <Th $num>
              52W High
              <InfoTip text="Highest price reached in the past 52 weeks (or ATH if set and higher). Used to calculate the Double Down trigger condition." />
            </Th>
            <Th $num>
              Mkt Val
              <InfoTip text="Market Value — total shares × current price." />
            </Th>
            <Th $num $hideBelow={768}>
              Cost Basis
              <InfoTip text="Total amount invested — sum of (shares × average cost) across all broker positions." />
            </Th>
            <Th $num>
              G/L $
              <InfoTip text="Gain/Loss in dollars — market value minus cost basis. Positive = unrealized profit, negative = unrealized loss." />
            </Th>
            <Th $num>
              G/L %
              <InfoTip text="Gain/Loss as a percentage of cost basis." />
            </Th>
            <Th $num>
              Alloc %
              <InfoTip text="This holding's market value as a percentage of your total portfolio value." />
            </Th>
          </tr>
        </thead>
        <tbody>
          {holdings.map(h => {
            const alloc = totalValue > 0 ? (h.mktVal / totalValue) * 100 : 0;
            const gl = periodGL(h, period);
            const glColor = gl.dollar >= 0 ? 'var(--green)' : 'var(--red)';
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
                                color: pct >= 0 ? 'var(--green)' : 'var(--red)',
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
            <TotalTd $num $bold style={{ color: totalGL >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {formatDollars(totalGL)}
            </TotalTd>
            <TotalTd colSpan={2} />
          </tr>
        </tfoot>
      </DataTable>
    </TableWrap>
  );
}
