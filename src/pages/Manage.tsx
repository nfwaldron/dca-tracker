import React, { useRef, useState } from 'react';
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
import { ManageHoldingsTable } from '../components/manage/ManageHoldingsTable';
import { PriceTable } from '../components/manage/PriceTable';
import { RolesManager } from '../components/manage/RolesManager';
import { SetupWizard } from '../components/manage/SetupWizard';
import { TabContent, SectionTitle, SectionDesc } from '../components/ui/Layout';
import { InfoTip } from '../components/ui/InfoTip';
import { BsDownload, BsUpload, BsLayoutTextWindow, BsTrash } from 'react-icons/bs';
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
  const [wasInitiallyEmpty] = useState(() => state.holdings.length === 0);
  const [skipWizard, setSkipWizard] = useState(false);
  const showWizard = wasInitiallyEmpty && !skipWizard;

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

  function loadTemplate() {
    fetch('/template.json')
      .then(r => r.json())
      .then(data => {
        const total = (data.holdings as { ticker?: string }[]).length;
        const preview = (data.holdings as { ticker?: string }[]).slice(0, 5).map(h => h.ticker ?? '?').join(', ');
        modals.openConfirmModal({
          title: 'Load example portfolio',
          children: (
            <Stack gap="sm">
              <Text size="sm">
                This will <strong>replace ALL</strong> your current holdings, prices, and settings with the example portfolio.
                Each position has 10 shares at a realistic average cost — adjust them to match your own holdings.
              </Text>
              <Text size="xs" c="dimmed">
                {preview}{total > 5 ? ` … and ${total - 5} more` : ''} ({total} holdings)
              </Text>
            </Stack>
          ),
          labels: { confirm: 'Load example', cancel: 'Cancel' },
          confirmProps: { color: 'blue' },
          onConfirm: () => {
            dispatch({ type: 'LOAD_SNAPSHOT', payload: data });
            notifications.show({ color: 'green', title: 'Example loaded', message: 'Add your own positions to get started.', autoClose: 4000 });
          },
        });
      })
      .catch(() => notifications.show({ color: 'red', message: 'Could not load example portfolio.' }));
  }

  function clearAllHoldings() {
    modals.openConfirmModal({
      title: 'Clear all holdings',
      children: (
        <Text size="sm">
          This will permanently delete all {state.holdings.length} holding{state.holdings.length !== 1 ? 's' : ''}.
          Your settings and roles will be kept. This cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete all', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        dispatch({ type: 'LOAD_SNAPSHOT', payload: { ...state, holdings: [], buckets: [] } });
        notifications.show({ color: 'green', title: 'Cleared', message: 'All holdings deleted. Ready for a fresh start.', autoClose: 3000 });
      },
    });
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

  if (showWizard) {
    return (
      <TabContent>
        <SetupWizard onSkip={() => setSkipWizard(true)} />
      </TabContent>
    );
  }

  return (
    <TabContent>
      <Group mb="md" gap="sm" wrap="wrap">
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
        <Button
          variant="default"
          size="sm"
          leftSection={<BsLayoutTextWindow />}
          onClick={loadTemplate}
          title="Load a pre-built example portfolio to explore the app — positions are empty, just tickers and roles"
        >
          Load example portfolio
        </Button>
        <Button
          variant="subtle"
          color="red"
          size="sm"
          leftSection={<BsTrash />}
          onClick={clearAllHoldings}
          disabled={state.holdings.length === 0}
          title="Delete all holdings and start fresh — settings and roles are kept"
        >
          Clear all holdings
        </Button>
        <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
      </Group>

      <Text size="sm" c="dimmed" mb="lg" style={{ lineHeight: 1.5 }}>
        Your data hub — add holdings, configure settings, and manage roles. Everything here flows
        directly into the <strong>DCA Planner</strong> and <strong>Portfolio</strong> tabs.
      </Text>

      <Tabs defaultValue="holdings">
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
                  Pay frequency
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
                  DCA table — display columns
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
          <SectionTitle>All holdings</SectionTitle>
          <SectionDesc>
            Every stock you own or are tracking. <strong>Core</strong> holdings receive DCA
            allocations each pay period — <strong>extra</strong> = held but not DCA'd,{' '}
            <strong>wishlist</strong> = not yet owned, tracked but excluded from allocation math.
            Click the chevron on any row to see per-broker positions.
          </SectionDesc>
          <ManageHoldingsTable holdings={state.holdings} prices={state.prices} dispatch={dispatch} roles={state.roles} />
        </Tabs.Panel>

        <Tabs.Panel value="prices">
          <SectionDesc>
            Prices are fetched from Yahoo Finance when you click <strong>Refresh prices</strong> in
            the header. If a value looks wrong or the API is unavailable, you can manually override
            any field here — overrides persist until the next successful refresh.
          </SectionDesc>
          <PriceTable holdings={state.holdings} prices={state.prices} dispatch={dispatch} />
        </Tabs.Panel>

        <Tabs.Panel value="roles">
          <RolesManager roles={state.roles} dispatch={dispatch} />
        </Tabs.Panel>
      </Tabs>
    </TabContent>
  );
}
