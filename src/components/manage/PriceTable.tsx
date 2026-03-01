import { useState } from 'react';
import type { Dispatch } from 'react';
import { IconEdit, IconSave, IconX } from '../icons';
import { InfoTip } from '../ui/InfoTip';
import { formatDollars } from '../../utils/format';
import { CAT_ORDER } from '../../constants/categories';
import { TableWrap, DataTable, Th, Td, TbodyRow, TickerMain } from '../ui/Table';
import { BtnGhost, BtnPrimary } from '../ui/Button';
import { InputCell } from '../ui/Input';
import { SectionTitle, Muted } from '../ui/Layout';
import type { Holding, PriceRow, Action } from '../../types';

type PriceEditRow = { ticker: string; price: string; ma200: string; h52: string };

export function PriceTable({
  holdings,
  prices,
  dispatch,
}: {
  holdings: Holding[];
  prices: Record<string, PriceRow>;
  dispatch: Dispatch<Action>;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [priceForm, setPriceForm] = useState<PriceEditRow | null>(null);

  const sorted = [...holdings].sort(
    (a, b) => CAT_ORDER.indexOf(a.category) - CAT_ORDER.indexOf(b.category),
  );

  function startEdit(ticker: string) {
    const row = prices[ticker] ?? { price: 0, ma200: 0, h52: 0 };
    setEditId(ticker);
    setPriceForm({
      ticker,
      price: String(row.price),
      ma200: String(row.ma200),
      h52: String(row.h52),
    });
  }

  function saveEdit() {
    if (!priceForm) return;
    const existing = prices[priceForm.ticker] ?? {
      dailyChange: 0,
      dailyChangePct: 0,
      yearChangePct: 0,
    };
    dispatch({
      type: 'UPSERT_PRICE',
      payload: {
        ticker: priceForm.ticker,
        price: parseFloat(priceForm.price) || 0,
        ma200: parseFloat(priceForm.ma200) || 0,
        h52: parseFloat(priceForm.h52) || 0,
        dailyChange: existing.dailyChange ?? 0,
        dailyChangePct: existing.dailyChangePct ?? 0,
        yearChangePct: existing.yearChangePct ?? 0,
      },
    });
    setEditId(null);
    setPriceForm(null);
  }

  return (
    <>
      <SectionTitle style={{ marginTop: '2.5rem' }}>Price Data</SectionTitle>
      <Muted as="p" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
        Prices are fetched automatically from Yahoo Finance when the app loads and when you click{' '}
        <strong>Refresh Prices</strong> in the header. Use the Edit button to override any value
        manually — useful if Yahoo's data is delayed or you want to lock a specific 52W High.
      </Muted>
      <TableWrap>
        <DataTable>
          <thead>
            <tr>
              <Th>Ticker</Th>
              <Th $num>Price</Th>
              <Th $num>
                200-MA
                <InfoTip text="200-day Moving Average — the average closing price over the past 200 trading days. Used as one of the two Double Down trigger conditions (price below this = triggered)." />
              </Th>
              <Th $num>
                52W High
                <InfoTip text="Highest price in the past 52 weeks. The app tracks this as a floor — it never shrinks due to Yahoo's rolling window. A 20%+ drop from this (or ATH) triggers the Double Down condition." />
              </Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {sorted
              .filter(h => h.category !== 'wishlist' || prices[h.ticker])
              .map(h => {
                const row = prices[h.ticker] ?? { price: 0, ma200: 0, h52: 0 };
                const isEditing = editId === h.ticker;
                return (
                  <TbodyRow key={h.id}>
                    <Td>
                      <TickerMain>{h.ticker}</TickerMain>
                    </Td>
                    {isEditing && priceForm ? (
                      <>
                        <Td>
                          <InputCell
                            style={{ width: 90 }}
                            value={priceForm.price}
                            onChange={e =>
                              setPriceForm(f => (f ? { ...f, price: e.target.value } : f))
                            }
                          />
                        </Td>
                        <Td>
                          <InputCell
                            style={{ width: 90 }}
                            value={priceForm.ma200}
                            onChange={e =>
                              setPriceForm(f => (f ? { ...f, ma200: e.target.value } : f))
                            }
                          />
                        </Td>
                        <Td>
                          <InputCell
                            style={{ width: 90 }}
                            value={priceForm.h52}
                            onChange={e =>
                              setPriceForm(f => (f ? { ...f, h52: e.target.value } : f))
                            }
                          />
                        </Td>
                        <Td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <BtnPrimary $sm onClick={saveEdit} {...{ leftSection: <IconSave /> }}>
                              Save
                            </BtnPrimary>
                            <BtnGhost
                              $sm
                              onClick={() => {
                                setEditId(null);
                                setPriceForm(null);
                              }}
                            >
                              <IconX />
                            </BtnGhost>
                          </div>
                        </Td>
                      </>
                    ) : (
                      <>
                        <Td $num>{row.price > 0 ? formatDollars(row.price) : <Muted>—</Muted>}</Td>
                        <Td $num>{row.ma200 > 0 ? formatDollars(row.ma200) : <Muted>—</Muted>}</Td>
                        <Td $num>{row.h52 > 0 ? formatDollars(row.h52) : <Muted>—</Muted>}</Td>
                        <Td>
                          <BtnGhost $sm onClick={() => startEdit(h.ticker)} {...{ leftSection: <IconEdit /> }}>
                            Edit
                          </BtnGhost>
                        </Td>
                      </>
                    )}
                  </TbodyRow>
                );
              })}
          </tbody>
        </DataTable>
      </TableWrap>
    </>
  );
}
