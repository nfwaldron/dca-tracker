import React, { useState } from 'react';
import type { Dispatch } from 'react';
import { Modal, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus, IconChevron } from '../icons';
import { enrich, fmt$, fmtShares } from '../../selectors';
import { InfoTip } from '../ui/InfoTip';
import { CAT_HEX, CAT_ORDER } from '../../constants/categories';
import { TableWrap, DataTable, Th, Td, TbodyRow, TickerMain } from '../ui/Table';
import { CategoryBadge, BadgeGreen, BadgeGray } from '../ui/Badge';
import { BtnPrimary, BtnGhost, BtnDanger } from '../ui/Button';
import { EditRow, holdingToEdit, BLANK_EDIT } from './EditRow';
import type { Holding, Action } from '../../types';
import type { EditState } from './EditRow';
import styled from 'styled-components';

const ChevronBtn = styled.button`
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { color: var(--text); }
  &:disabled { cursor: default; }
`;

const ExpandTd = styled.td`
  padding: 0;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
`;

const BrokerBreakdown = styled.div`
  padding: 0.6rem 2.5rem 0.75rem;
`;

const BrokerTable = styled.table`
  width: auto;
  border-collapse: collapse;
  font-size: 0.78rem;
`;

const BrokerTh = styled.th`
  padding: 0.2rem 1rem 0.2rem 0;
  text-align: right;
  font-weight: 600;
  color: var(--muted);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  &:first-child { text-align: left; }
`;

const BrokerTd = styled.td`
  padding: 0.2rem 1rem 0.2rem 0;
  text-align: right;
  color: var(--muted);
  &:first-child { text-align: left; font-weight: 600; color: var(--text); }
`;

const COLS = 10;

export function HoldingsTable({
  holdings,
  dispatch,
  roles = [],
}: {
  holdings: Holding[];
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
                ATH
                <InfoTip text="All-Time High override. When set, the Double Down trigger uses max(ATH, 52W High) as the reference price." />
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
              const { totalShares, weightedAvg } = enrich(h, {}, 0, 0);

              return (
                <React.Fragment key={h.id}>
                  <TbodyRow>
                    <Td>
                      <ChevronBtn
                        onClick={() => toggleExpand(h.id)}
                        title={isExpanded ? 'Collapse' : 'Show broker breakdown'}
                        disabled={h.positions.length === 0}
                        style={{ opacity: h.positions.length === 0 ? 0.2 : 1 }}
                      >
                        <IconChevron open={isExpanded} />
                      </ChevronBtn>
                    </Td>
                    <Td><TickerMain>{h.ticker}</TickerMain></Td>
                    <Td>{h.name}</Td>
                    <Td $muted>{h.role}</Td>
                    <Td>
                      <CategoryBadge $hex={CAT_HEX[h.category]}>{h.category}</CategoryBadge>
                    </Td>
                    <Td $num>
                      {fmtShares(totalShares)}
                      {h.positions.length > 1 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginLeft: 5 }}>
                          ({h.positions.length} brokers)
                        </span>
                      )}
                    </Td>
                    <Td $num $muted>{weightedAvg > 0 ? fmt$(weightedAvg) : '—'}</Td>
                    <Td $num $muted>{h.ath !== null ? fmt$(h.ath) : '—'}</Td>
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
                      <ExpandTd colSpan={COLS}>
                        <BrokerBreakdown>
                          <BrokerTable>
                            <thead>
                              <tr>
                                <BrokerTh>Broker</BrokerTh>
                                <BrokerTh>Shares</BrokerTh>
                                <BrokerTh>Avg Cost</BrokerTh>
                                <BrokerTh>Cost Basis</BrokerTh>
                              </tr>
                            </thead>
                            <tbody>
                              {h.positions.map((p, i) => (
                                <tr key={i}>
                                  <BrokerTd>{p.broker || '—'}</BrokerTd>
                                  <BrokerTd>{fmtShares(p.shares)}</BrokerTd>
                                  <BrokerTd>{fmt$(p.avgCost)}</BrokerTd>
                                  <BrokerTd>{fmt$(p.shares * p.avgCost)}</BrokerTd>
                                </tr>
                              ))}
                            </tbody>
                          </BrokerTable>
                        </BrokerBreakdown>
                      </ExpandTd>
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
