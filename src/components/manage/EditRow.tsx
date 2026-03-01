import { useState } from 'react';
import { Group, Stack, SimpleGrid, Text, Checkbox, ActionIcon, Alert } from '@mantine/core';
import { BsTrash, BsPlus } from 'react-icons/bs';
import { InfoTip } from '../ui/InfoTip';
import { InputCell, SelectCell } from '../ui/Input';
import { BtnPrimary, BtnGhost } from '../ui/Button';
import type { Holding, BrokerPosition } from '../../types';

type PositionDraft = { broker: string; shares: string; avgCost: string };

export type EditState = {
  id: string;
  ticker: string;
  name: string;
  role: string;
  category: Holding['category'];
  positions: PositionDraft[];
  athStr: string;
  doubleDown: boolean;
};

export function holdingToEdit(h: Holding): EditState {
  return {
    id: h.id,
    ticker: h.ticker,
    name: h.name,
    role: h.role,
    category: h.category,
    positions:
      h.positions.length > 0
        ? h.positions.map(p => ({
            broker: p.broker,
            shares: String(p.shares),
            avgCost: String(p.avgCost),
          }))
        : [{ broker: '', shares: '', avgCost: '' }],
    athStr: h.ath !== null ? String(h.ath) : '',
    doubleDown: h.doubleDown,
  };
}

export function editToHolding(e: EditState): Holding {
  const positions: BrokerPosition[] = e.positions
    .filter(p => p.broker.trim() && (parseFloat(p.shares) > 0 || parseFloat(p.avgCost) > 0))
    .map(p => ({
      broker: p.broker.trim(),
      shares: parseFloat(p.shares) || 0,
      avgCost: parseFloat(p.avgCost) || 0,
    }));
  return {
    id: e.id,
    ticker: e.ticker.toUpperCase(),
    name: e.name,
    role: e.role,
    category: e.category,
    positions,
    ath: e.athStr ? parseFloat(e.athStr) : null,
    doubleDown: e.doubleDown,
  };
}

export const BLANK_EDIT: EditState = {
  id: '',
  ticker: '',
  name: '',
  role: '',
  category: 'core',
  positions: [{ broker: '', shares: '', avgCost: '' }],
  athStr: '',
  doubleDown: false,
};

export function EditRow({
  init,
  onSave,
  onCancel,
  isNew,
  roles = [],
}: {
  init: EditState;
  onSave: (h: Holding) => void;
  onCancel: () => void;
  isNew?: boolean;
  colSpan?: number; // kept for backwards compat, unused
  roles?: string[];
}) {
  const [form, setForm] = useState<EditState>(init);
  const [errors, setErrors] = useState<string[]>([]);

  function validateAndSave() {
    const errs: string[] = [];
    if (!form.ticker.trim()) errs.push('Ticker symbol is required.');
    if (!form.name.trim()) errs.push('Company name is required.');
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    onSave(editToHolding(form));
  }

  const setField = (k: keyof Omit<EditState, 'positions'>, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const setPosition = (i: number, k: keyof PositionDraft, v: string) =>
    setForm(f => ({
      ...f,
      positions: f.positions.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)),
    }));

  const addPosition = () =>
    setForm(f => ({
      ...f,
      positions: [...f.positions, { broker: '', shares: '', avgCost: '' }],
    }));

  const removePosition = (i: number) =>
    setForm(f => ({ ...f, positions: f.positions.filter((_, idx) => idx !== i) }));

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
        <Stack gap={4}>
          <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
            Ticker
          </Text>
          <InputCell
            placeholder="TICKER"
            value={form.ticker}
            readOnly={!isNew}
            title={isNew ? undefined : 'Ticker cannot be changed'}
            onChange={e => {
              if (!isNew) return;
              setField('ticker', e.target.value.toUpperCase());
              setField('id', e.target.value.toUpperCase());
            }}
          />
        </Stack>

        <Stack gap={4}>
          <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
            Name
          </Text>
          <InputCell
            placeholder="Company name"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
          />
        </Stack>

        <Stack gap={4}>
          <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
            Role
          </Text>
          {roles.length > 0 ? (
            <SelectCell
              value={roles.includes(form.role) ? form.role : '__custom__'}
              onChange={e => {
                if (e.target.value !== '__custom__') setField('role', e.target.value);
              }}
            >
              {roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
              {!roles.includes(form.role) && form.role && (
                <option value="__custom__">{form.role} (custom)</option>
              )}
            </SelectCell>
          ) : (
            <InputCell
              placeholder="e.g. Landlord"
              value={form.role}
              onChange={e => setField('role', e.target.value)}
            />
          )}
        </Stack>

        <Stack gap={4}>
          <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
            Category
            <InfoTip text="core = DCA'd every pay period (appears in DCA Planner); extra = held but excluded from DCA; wishlist = not yet owned, tracked for reference only." />
          </Text>
          <SelectCell
            value={form.category}
            onChange={e => setField('category', e.target.value as Holding['category'])}
          >
            <option value="core">Core — invested every paycheck</option>
            <option value="extra">Extra — owned, not DCA'd</option>
            <option value="wishlist">Watchlist — tracking only</option>
          </SelectCell>
        </Stack>

        <Stack gap={4}>
          <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
            ATH $
            <InfoTip text="Optional all-time high override. If the stock's true ATH was more than 52 weeks ago, enter it here so the Double Down trigger (20%-off condition) stays accurate. Leave blank to use only the 52-week high." />
          </Text>
          <InputCell
            placeholder="—"
            value={form.athStr}
            onChange={e => setField('athStr', e.target.value)}
          />
        </Stack>

        <Stack gap={4}>
          <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
            Double Down
            <InfoTip text="Pre-seeds the Double Down opt-in for this stock. When checked and the stock is triggered, it will receive extra allocation from your Double-Down Budget. You can also toggle this live from the DCA Planner." />
          </Text>
          <div style={{ paddingTop: '0.35rem' }}>
            <Checkbox
              checked={form.doubleDown}
              onChange={e => setField('doubleDown', e.target.checked)}
            />
          </div>
        </Stack>
      </SimpleGrid>

      <Stack gap="xs">
        <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
          Broker Positions
          <InfoTip text="Enter where you hold this stock and how many shares at what average cost. Add one row per broker. Leave blank for watchlist stocks you don't own yet — positions are optional." />
        </Text>
        <Group gap="xs" align="center">
          <Text size="xs" c="dimmed" fw={600} style={{ width: 140 }}>Broker</Text>
          <Text size="xs" c="dimmed" fw={600} style={{ width: 90 }}>Shares</Text>
          <div style={{ width: 16 }} />
          <Text size="xs" c="dimmed" fw={600} style={{ width: 90 }}>Avg cost / share</Text>
        </Group>
        {form.positions.map((p, i) => (
          <Group key={i} gap="xs" align="center">
            <InputCell
              style={{ width: 140 }}
              placeholder="e.g. Fidelity"
              value={p.broker}
              onChange={e => setPosition(i, 'broker', e.target.value)}
            />
            <InputCell
              style={{ width: 90 }}
              placeholder="e.g. 10"
              value={p.shares}
              onChange={e => setPosition(i, 'shares', e.target.value)}
            />
            <Text size="sm" c="dimmed">@</Text>
            <InputCell
              style={{ width: 90 }}
              placeholder="e.g. $142.50"
              value={p.avgCost}
              onChange={e => setPosition(i, 'avgCost', e.target.value)}
            />
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              onClick={() => removePosition(i)}
            >
              <BsTrash />
            </ActionIcon>
          </Group>
        ))}
        <div>
          <BtnGhost $sm onClick={addPosition} {...{ leftSection: <BsPlus /> }}>
            Add Broker
          </BtnGhost>
        </div>
      </Stack>

      {errors.length > 0 && (
        <Alert color="red" variant="light">
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </Alert>
      )}
      <Group gap="sm">
        <BtnPrimary $sm onClick={validateAndSave}>
          Save
        </BtnPrimary>
        <BtnGhost $sm onClick={onCancel}>
          Cancel
        </BtnGhost>
      </Group>
    </Stack>
  );
}
