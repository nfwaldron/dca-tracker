import React, { useRef } from 'react';
import {
  Tabs,
  Group,
  Paper,
  Stack,
  Text,
  Button,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useStore } from '../store';
import { HoldingsTable } from '../components/manage/HoldingsTable';
import { PriceTable } from '../components/manage/PriceTable';
import { RolesManager } from '../components/manage/RolesManager';
import { TabContent, SectionTitle, SectionDesc } from '../components/ui/Layout';
import { InfoTip } from '../components/ui/InfoTip';
import { BsDownload, BsUpload } from 'react-icons/bs';
import type { PayFrequency, DisplayPeriod } from '../types';

const PAY_OPTIONS: { value: PayFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const DISPLAY_OPTIONS: { value: DisplayPeriod; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function Manage() {
  const { state, dispatch } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  function exportData() {
    const json = JSON.stringify(state, null, 2);
    const blob = new URL(URL.createObjectURL(new Blob([json], { type: 'application/json' })));
    const filename = `dca-tracker-${new Date().toISOString().split('T')[0]}.json`;
    const a = Object.assign(document.createElement('a'), { href: blob.href, download: filename });
    a.click();
    URL.revokeObjectURL(blob.href);
    notifications.show({ color: 'blue', title: 'Exported', message: `${filename} downloaded.`, autoClose: 3000 });
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(data.holdings)) {
          notifications.show({ color: 'red', title: 'Import failed', message: 'Invalid file: missing holdings array.' });
          return;
        }
        const total = data.holdings.length;
        const preview = (data.holdings as { ticker?: string }[]).slice(0, 5).map(h => h.ticker ?? '?').join(', ');
        modals.openConfirmModal({
          title: 'Import data?',
          children: (
            <Stack gap="sm">
              <Text size="sm">
                Importing will <strong>replace ALL</strong> your current holdings, prices, and settings. This cannot be undone.
              </Text>
              <Text size="xs" c="dimmed">
                Preview: {preview}{total > 5 ? ` … and ${total - 5} more` : ''} ({total} holding{total !== 1 ? 's' : ''})
              </Text>
            </Stack>
          ),
          labels: { confirm: 'Import & Replace', cancel: 'Cancel' },
          confirmProps: { color: 'red' },
          onConfirm: () => {
            dispatch({ type: 'LOAD_SNAPSHOT', payload: data });
            notifications.show({ color: 'green', title: 'Imported', message: `${total} holding${total !== 1 ? 's' : ''} loaded.`, autoClose: 3000 });
          },
        });
      } catch {
        notifications.show({ color: 'red', title: 'Import failed', message: 'Invalid JSON file.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function toggleDisplayPeriod(period: DisplayPeriod) {
    const current = state.displayPeriods;
    const next = current.includes(period)
      ? current.filter(p => p !== period)
      : [...current, period];
    if (next.length === 0) return;
    dispatch({ type: 'SET_DISPLAY_PERIODS', payload: next });
    notifications.show({ color: 'blue', title: 'Settings saved', message: 'Display columns updated.', autoClose: 2000 });
  }

  return (
    <TabContent>
      <Group mb="md" gap="sm">
        <Button
          variant="default"
          size="sm"
          leftSection={<BsDownload />}
          onClick={exportData}
          title="Download all your holdings, prices, buckets, and settings as a JSON backup file"
        >
          Export JSON
        </Button>
        <Button
          variant="default"
          size="sm"
          leftSection={<BsUpload />}
          onClick={() => fileRef.current?.click()}
          title="Restore from a previously exported file — WARNING: replaces ALL current data"
        >
          Import JSON
        </Button>
        <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
      </Group>

      <Text size="sm" c="dimmed" mb="lg" style={{ lineHeight: 1.5 }}>
        Your data hub — add holdings, configure settings, and manage roles. Everything here flows
        directly into the <strong>DCA Planner</strong> and <strong>Portfolio</strong> tabs.
      </Text>

      <Tabs defaultValue="settings">
        <Tabs.List mb="lg">
          <Tabs.Tab value="settings">Settings</Tabs.Tab>
          <Tabs.Tab value="holdings">Holdings</Tabs.Tab>
          <Tabs.Tab value="prices">Price Data</Tabs.Tab>
          <Tabs.Tab value="roles">Roles</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="settings">
          <SectionDesc>
            These settings affect all calculations across the app — change them whenever your
            situation changes.
          </SectionDesc>
          <Paper withBorder p="lg" radius="md">
            <Stack gap="xl">
              <Stack gap="xs">
                <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.06em' }}>
                  Pay Frequency
                  <InfoTip text="How often you get paid. Controls the pay-period length used for all DCA allocation math — changes here immediately update every $/period column in the DCA Planner." />
                </Text>
                <Text size="xs" c="dimmed">How often you invest (your pay cycle)</Text>
                <Group gap="xs">
                  {PAY_OPTIONS.map(opt => (
                    <Button
                      key={opt.value}
                      size="xs"
                      variant={state.payFrequency === opt.value ? 'filled' : 'default'}
                      onClick={() => {
                        dispatch({ type: 'SET_PAY_FREQUENCY', payload: opt.value });
                        notifications.show({ color: 'blue', title: 'Settings saved', message: `Pay frequency set to ${opt.label}.`, autoClose: 2000 });
                      }}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </Group>
              </Stack>

              <Stack gap="xs">
                <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.06em' }}>
                  DCA Table — Display Columns
                  <InfoTip text="Which time-horizon columns to show in the Core Holdings table on the DCA Planner tab. Toggle multiple on to compare daily vs. bi-weekly vs. monthly amounts side by side." />
                </Text>
                <Text size="xs" c="dimmed">Time horizons shown in the DCA Planner table</Text>
                <Group gap="xs">
                  {DISPLAY_OPTIONS.map(opt => (
                    <Button
                      key={opt.value}
                      size="xs"
                      variant={state.displayPeriods.includes(opt.value) ? 'filled' : 'default'}
                      onClick={() => toggleDisplayPeriod(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </Group>
              </Stack>
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="holdings">
          <SectionTitle>All Holdings</SectionTitle>
          <SectionDesc>
            Every stock you own or are tracking. <strong>Core</strong> holdings receive DCA
            allocations each pay period — <strong>extra</strong> = held but not DCA'd,{' '}
            <strong>wishlist</strong> = not yet owned, tracked but excluded from allocation math.
            Click the chevron on any row to see per-broker positions.
          </SectionDesc>
          <HoldingsTable holdings={state.holdings} dispatch={dispatch} roles={state.roles} />
        </Tabs.Panel>

        <Tabs.Panel value="prices">
          <PriceTable holdings={state.holdings} prices={state.prices} dispatch={dispatch} />
        </Tabs.Panel>

        <Tabs.Panel value="roles">
          <RolesManager roles={state.roles} dispatch={dispatch} />
        </Tabs.Panel>
      </Tabs>
    </TabContent>
  );
}
