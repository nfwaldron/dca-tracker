import React, { useState } from 'react';
import type { Dispatch } from 'react';
import { Modal, Group, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus, IconChevron } from '../icons';
import { enrichHolding } from '../../utils/holding';
import { COLOR_MUTED, COLOR_BG, COLOR_BORDER, COLOR_TEXT } from '../ui/colors';
import { formatDollars, formatShares } from '../../utils/format';
import { InfoTip } from '../ui/InfoTip';
import { CAT_HEX, CAT_ORDER } from '../../constants/categories';
import { TableWrap, DataTable, Th, Td, TbodyRow, TickerMain } from '../ui/Table';
import { CategoryBadge, BadgeGreen, BadgeGray } from '../ui/Badge';
import { BtnPrimary, BtnGhost, BtnDanger } from '../ui/Button';
import { EditRow, holdingToEdit, BLANK_EDIT } from './EditRow';
import type { Holding, Action, PriceRow } from '../../types';
import type { EditState } from './EditRow';

const brokerThStyle: React.CSSProperties = {
  padding: '0.2rem 1rem 0.2rem 0',
  textAlign: 'right',
  fontWeight: 600,
  color: COLOR_MUTED,
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};
const brokerTdStyle: React.CSSProperties = {
  padding: '0.2rem 1rem 0.2rem 0',
  textAlign: 'right',
  color: COLOR_MUTED,
};

const COLS = 10;

export function ManageHoldingsTable({
  holdings,
  prices = {},
  dispatch,
  roles = [],
}: {
  holdings: Holding[];
  prices?: Record<string, PriceRow>;
  dispatch: Dispatch<Action>;
  roles?: string[];
}) {
  const [editTarget, setEditTarget] = useState<{ holding: Holding | null; isNew: boolean } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const sorted = [...holdings].sort(
    (a, b) => CAT_ORDER.indexOf(a.category) - CAT_ORDER.indexOf(b.category),
  );

  function openAdd() {
    setEditTarget({ holding: null, isNew: true });
    open();
  }

  function openEdit(h: Holding) {
    setEditTarget({ holding: h, isNew: false });
    open();
  }

  function handleSave(h: Holding) {
    if (!h.ticker) return;
    dispatch({ type: 'UPSERT_HOLDING', payload: { ...h, id: h.id || h.ticker } });
    close();
    notifications.show({
      color: 'green',
      title: 'Holding saved',
      message: `${h.ticker} has been saved.`,
      autoClose: 3000,
    });
  }

  function handleDelete(id: string, ticker: string) {
    modals.openConfirmModal({
      title: `Delete ${ticker}?`,
      children: 'This cannot be undone.',
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        dispatch({ type: 'DELETE_HOLDING', payload: id });
        if (expandedId === id) setExpandedId(null);
      },
    });
  }

  function toggleExpand(id: string) {
    setExpandedId(prev => (prev === id ? null : id));
  }

  const initState: EditState = editTarget?.holding
    ? holdingToEdit(editTarget.holding)
    : BLANK_EDIT;

  return (
    <>
      <Group justify="flex-end" mb="sm">
        <BtnPrimary onClick={openAdd} {...{ leftSection: <IconPlus /> }}>
          Add Holding
        </BtnPrimary>
      </Group>

      <Modal
        opened={opened}
        onClose={close}
        title={editTarget?.isNew ? 'Add Holding' : 'Edit Holding'}
        size="lg"
      >
        <EditRow
          key={editTarget?.holding?.id ?? 'new'}
          isNew={editTarget?.isNew}
          init={initState}
          roles={roles}
          onSave={handleSave}
          onCancel={close}
          onCreateRole={role => dispatch({ type: 'ADD_ROLE', payload: role })}
        />
      </Modal>

      <TableWrap>
        <DataTable>
          <thead>
            <tr>
              <Th style={{ width: 28 }} />
              <Th>Ticker</Th>
              <Th>Name</Th>
              <Th>Role</Th>
              <Th>Category</Th>
              <Th $num>Total Shares</Th>
              <Th $num>
                Wtd Avg
                <InfoTip text="Weighted Average Cost — total cost basis ÷ total shares across all broker positions." />
              </Th>
              <Th $num>
                52W High
                <InfoTip text="52-week high from Yahoo Finance. The Double Down trigger fires when price drops 20%+ below this value (or your manual ATH override if set)." />
              </Th>
              <Th>
                Double Down
                <InfoTip text="Pre-seeds the Double Down opt-in. You can also toggle this live from the DCA Planner." />
              </Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(h => {
              const isExpanded = expandedId === h.id;
              const { totalShares, weightedAvg } = enrichHolding(h, {}, 0, 0);

              return (
                <React.Fragment key={h.id}>
                  <TbodyRow>
                    <Td>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        onClick={() => toggleExpand(h.id)}
                        title={isExpanded ? 'Collapse' : 'Show broker breakdown'}
                        disabled={h.positions.length === 0}
                        style={{ opacity: h.positions.length === 0 ? 0.2 : 1 }}
                      >
                        <IconChevron open={isExpanded} />
                      </ActionIcon>
                    </Td>
                    <Td><TickerMain>{h.ticker}</TickerMain></Td>
                    <Td>{h.name}</Td>
                    <Td $muted>{h.role}</Td>
                    <Td>
                      <CategoryBadge $hex={CAT_HEX[h.category]}>{h.category}</CategoryBadge>
                    </Td>
                    <Td $num>
                      {formatShares(totalShares)}
                      {h.positions.length > 1 && (
                        <span style={{ fontSize: '0.7rem', color: COLOR_MUTED, marginLeft: 5 }}>
                          ({h.positions.length} brokers)
                        </span>
                      )}
                    </Td>
                    <Td $num $muted>{weightedAvg > 0 ? formatDollars(weightedAvg) : '—'}</Td>
                    <Td $num $muted>{prices[h.ticker]?.h52 ? formatDollars(prices[h.ticker].h52) : '—'}</Td>
                    <Td>{h.doubleDown ? <BadgeGreen>Yes</BadgeGreen> : <BadgeGray>No</BadgeGray>}</Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <BtnGhost $sm onClick={() => openEdit(h)}><IconEdit /></BtnGhost>
                        <BtnDanger $sm onClick={() => handleDelete(h.id, h.ticker)}><IconTrash /></BtnDanger>
                      </div>
                    </Td>
                  </TbodyRow>

                  {isExpanded && h.positions.length > 0 && (
                    <tr>
                      <td
                        colSpan={COLS}
                        style={{ padding: 0, background: COLOR_BG, borderBottom: `1px solid ${COLOR_BORDER}` }}
                      >
                        <div style={{ padding: '0.6rem 2.5rem 0.75rem' }}>
                          <table style={{ width: 'auto', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                            <thead>
                              <tr>
                                <th style={{ ...brokerThStyle, textAlign: 'left' }}>Broker</th>
                                <th style={brokerThStyle}>Shares</th>
                                <th style={brokerThStyle}>Avg Cost</th>
                                <th style={brokerThStyle}>
                                  Cost Basis
                                  <InfoTip text="Total amount invested in this position — shares × your average cost per share." />
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {h.positions.map((p, i) => (
                                <tr key={i}>
                                  <td style={{ ...brokerTdStyle, textAlign: 'left', fontWeight: 600, color: COLOR_TEXT }}>{p.broker || '—'}</td>
                                  <td style={brokerTdStyle}>{formatShares(p.shares)}</td>
                                  <td style={brokerTdStyle}>{formatDollars(p.avgCost)}</td>
                                  <td style={brokerTdStyle}>{formatDollars(p.shares * p.avgCost)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </DataTable>
      </TableWrap>
    </>
  );
}
