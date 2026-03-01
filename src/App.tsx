import { useEffect, useRef, useMemo } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import {
  AppShell,
  Box,
  Group,
  Text,
  Badge,
  Button,
  Burger,
  Drawer,
  Stack,
  Loader,
  Center,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { SignedIn, SignedOut, SignIn, UserButton } from '@clerk/clerk-react';
import { BsQuestionCircle } from 'react-icons/bs';
import { useStore } from './store';
import { usePrices } from './hooks/usePrices';
import { IconRefresh } from './components/icons';
import DcaPlanner from './pages/DcaPlanner';
import Portfolio from './pages/Portfolio';
import Manage from './pages/Manage';
import StrategyGuide from './pages/StrategyGuide';
import { GlossaryModal } from './components/ui/GlossaryModal';
import { ShareView } from './pages/ShareView';

// Read once — share token is stable for the lifetime of the page load
const SHARE_TOKEN = new URLSearchParams(window.location.search).get('share');

const NAV_LINKS = [
  { to: '/planner', label: 'DCA Planner' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/manage', label: 'Manage' },
  { to: '/guide', label: 'Strategy Guide' },
] as const;

// Desktop: horizontal nav link with underline indicator
const desktopNavStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? 'var(--mantine-color-blue-4)' : 'var(--mantine-color-dimmed)',
  textDecoration: 'none',
  fontWeight: isActive ? 600 : 400,
  fontSize: '0.875rem',
  padding: '0 0.5rem',
  height: 56,
  display: 'inline-flex',
  alignItems: 'center',
  whiteSpace: 'nowrap' as const,
  borderBottom: isActive ? '2px solid var(--mantine-color-blue-4)' : '2px solid transparent',
  transition: 'color 0.15s, border-color 0.15s',
});

// Mobile drawer: full-width vertical link
const drawerNavStyle = ({ isActive }: { isActive: boolean }) => ({
  display: 'block',
  padding: '0.75rem 1rem',
  borderRadius: 8,
  textDecoration: 'none',
  fontWeight: isActive ? 600 : 400,
  fontSize: '1rem',
  color: isActive ? 'var(--mantine-color-blue-4)' : 'var(--mantine-color-text)',
  background: isActive ? 'var(--mantine-color-blue-light)' : 'transparent',
  transition: 'background 0.15s, color 0.15s',
});

function AppContent() {
  const { state, dispatch, loaded } = useStore();
  const [glossaryOpened, { open: openGlossary, close: closeGlossary }] = useDisclosure(false);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const navigate = useNavigate();

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
    <>
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
            padding: '0 0.75rem',
          }}
        >
          <Group justify="space-between" w="100%" style={{ height: '100%' }}>
            {/* Left: hamburger (mobile) + logo + nav links (desktop) */}
            <Group gap={0} style={{ height: '100%', overflow: 'hidden', flexShrink: 1, minWidth: 0 }}>
              {/* Hamburger — mobile/tablet only */}
              <Box hiddenFrom="sm" mr="sm">
                <Burger
                  opened={drawerOpened}
                  onClick={drawerOpened ? closeDrawer : openDrawer}
                  size="sm"
                  color="var(--mantine-color-dimmed)"
                />
              </Box>

              <Text fw={700} size="lg" style={{ letterSpacing: '-0.02em', paddingRight: '1.25rem', whiteSpace: 'nowrap' }}>
                DCA Tracker
              </Text>

              {/* Horizontal nav — desktop only */}
              <Box visibleFrom="sm" style={{ height: '100%' }}>
                <nav className="app-nav" style={{ display: 'flex', height: '100%', overflowX: 'auto', gap: '0.25rem' }}>
                  {NAV_LINKS.map(({ to, label }) => (
                    <NavLink key={to} to={to} style={desktopNavStyle}>
                      {label}
                    </NavLink>
                  ))}
                </nav>
              </Box>
            </Group>

            {/* Right controls */}
            <Group gap="sm" style={{ flexShrink: 0 }}>
              {error && (
                <Badge color="red" variant="light" title={error}>
                  ⚠ Price fetch failed
                </Badge>
              )}
              {lastUpdated && !error && (
                <Box visibleFrom="sm">
                  <Text size="xs" c="dimmed">Prices: {fmtTime(lastUpdated)}</Text>
                </Box>
              )}
              <Button
                variant="subtle"
                color="gray"
                size="sm"
                onClick={openGlossary}
                leftSection={<BsQuestionCircle />}
              >
                <Box visibleFrom="sm">Glossary</Box>
              </Button>
              <Button
                variant="subtle"
                color="gray"
                size="sm"
                onClick={refresh}
                disabled={loading}
                leftSection={<IconRefresh spinning={loading} />}
              >
                <Box visibleFrom="sm">{loading ? 'Fetching…' : 'Refresh Prices'}</Box>
              </Button>
              <UserButton />
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          <div style={{ height: '100%', overflow: 'auto', paddingBottom: 40 }}>
            <Routes>
              <Route index element={<Navigate to="/planner" replace />} />
              <Route path="/planner" element={<DcaPlanner onNavigateToManage={() => navigate('/manage')} />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/manage" element={<Manage />} />
              <Route path="/guide" element={<StrategyGuide />} />
              <Route path="*" element={<Navigate to="/planner" replace />} />
            </Routes>
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

      {/* Mobile side-nav drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="xs"
        padding="md"
        title={
          <Text fw={700} size="lg" style={{ letterSpacing: '-0.02em' }}>
            DCA Tracker
          </Text>
        }
        styles={{
          content: { background: 'var(--card)' },
          header: { background: 'var(--card)', borderBottom: '1px solid var(--border)' },
        }}
      >
        <Stack gap={4} mt="sm">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} style={drawerNavStyle} onClick={closeDrawer}>
              {label}
            </NavLink>
          ))}
        </Stack>
      </Drawer>
    </>
  );
}

export default function App() {
  if (SHARE_TOKEN) return <ShareView token={SHARE_TOKEN} />;

  return (
    <>
      <SignedOut>
        <Center h="100vh">
          <SignIn routing="hash" />
        </Center>
      </SignedOut>
      <SignedIn>
        <AppContent />
      </SignedIn>
    </>
  );
}
