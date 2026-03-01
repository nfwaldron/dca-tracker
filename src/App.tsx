import { useState, useEffect, useRef, useMemo } from 'react';
import {
  AppShell,
  Group,
  Text,
  Tabs,
  Badge,
  Button,
  Loader,
  Center,
  Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { BsQuestionCircle } from 'react-icons/bs';
import { useStore } from './store';
import { usePrices } from './hooks/usePrices';
import { IconRefresh } from './components/icons';
import DcaPlanner from './pages/DcaPlanner';
import Portfolio from './pages/Portfolio';
import Manage from './pages/Manage';
import StrategyGuide from './pages/StrategyGuide';
import { GlossaryModal } from './components/ui/GlossaryModal';

type Tab = 'planner' | 'portfolio' | 'manage' | 'guide';

export default function App() {
  const { state, dispatch, loaded } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('planner');
  const [glossaryOpened, { open: openGlossary, close: closeGlossary }] = useDisclosure(false);

  const tickers = useMemo(() => state.holdings.map(h => h.ticker), [state.holdings]);

  const { loading, lastUpdated, error, refresh } = usePrices(tickers, dispatch);

  const didAutoFetch = useRef(false);
  useEffect(() => {
    if (loaded && tickers.length > 0 && !didAutoFetch.current) {
      didAutoFetch.current = true;
      refresh();
    }
  }, [loaded, tickers.length, refresh]);

  const fmtTime = (d: Date | null) =>
    d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

  if (!loaded) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="sm">
          <Loader size="md" />
          <Text size="sm" c="dimmed">Loading portfolio…</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <AppShell
      header={{ height: 56 }}
      footer={{ height: 32 }}
      padding={0}
    >
      <AppShell.Header
        style={{
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.5rem',
        }}
      >
        <Group justify="space-between" w="100%">
          <Text fw={700} size="lg" style={{ letterSpacing: '-0.02em' }}>
            DCA Tracker
          </Text>
          <Group gap="sm">
            {error && (
              <Badge color="red" variant="light" title={error}>
                ⚠ Price fetch failed
              </Badge>
            )}
            {lastUpdated && !error && (
              <Text size="xs" c="dimmed">Prices: {fmtTime(lastUpdated)}</Text>
            )}
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              onClick={openGlossary}
              leftSection={<BsQuestionCircle />}
            >
              Glossary
            </Button>
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              onClick={refresh}
              disabled={loading}
              leftSection={<IconRefresh spinning={loading} />}
            >
              {loading ? 'Fetching…' : 'Refresh Prices'}
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ display: 'flex', flexDirection: 'column' }}>
        <Tabs
          value={activeTab}
          onChange={v => setActiveTab(v as Tab)}
          style={{
            borderBottom: '1px solid var(--border)',
            background: 'var(--card)',
            paddingLeft: '1rem',
          }}
        >
          <Tabs.List style={{ borderBottom: 'none', gap: '0.25rem' }}>
            <Tabs.Tab value="planner">DCA Planner</Tabs.Tab>
            <Tabs.Tab value="portfolio">Portfolio</Tabs.Tab>
            <Tabs.Tab value="manage">Manage</Tabs.Tab>
            <Tabs.Tab value="guide">Strategy Guide</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {activeTab === 'planner' && <DcaPlanner onNavigateToManage={() => setActiveTab('manage')} />}
          {activeTab === 'portfolio' && <Portfolio />}
          {activeTab === 'manage' && <Manage />}
          {activeTab === 'guide' && <StrategyGuide />}
        </div>
      </AppShell.Main>

      <AppShell.Footer
        style={{
          background: 'var(--card)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text size="xs" c="dimmed">
          For informational purposes only — not financial advice. Data via Yahoo Finance. Always do your own research.
        </Text>
      </AppShell.Footer>

      <GlossaryModal opened={glossaryOpened} onClose={closeGlossary} />
    </AppShell>
  );
}
