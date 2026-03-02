import { useEffect, useRef, useMemo, useState } from 'react';
import { COLOR_CARD, COLOR_BORDER, MC_BLUE_4, MC_BLUE_LIGHT, MC_DIMMED, MC_TEXT } from './components/ui/colors';
import { Routes, Route, NavLink, Navigate, Link, useNavigate } from 'react-router-dom';
import {
  AppShell,
  Box,
  Group,
  Text,
  Anchor,
  Badge,
  Button,
  CloseButton,
  Burger,
  Drawer,
  Stack,
  Loader,
  Center,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useClerk, UserButton } from '@clerk/clerk-react';
import { BsQuestionCircle } from 'react-icons/bs';
import { useStore } from './store';
import { useAppAuth } from './store/AuthProvider';
import { usePrices } from './hooks/usePrices';
import { IconRefresh } from './components/icons';
import DcaPlanner from './pages/DcaPlanner';
import Portfolio from './pages/Portfolio';
import Manage from './pages/Manage';
import StrategyGuide from './pages/StrategyGuide';
import { GlossaryModal } from './components/GlossaryModal';
import { WelcomeModal } from './components/WelcomeModal';
import { Logo } from './components/ui/Logo';
import { ShareView } from './pages/ShareView';
import { LandingPage } from './components/LandingPage';

// Read once — share token is stable for the lifetime of the page load
const SHARE_TOKEN = new URLSearchParams(window.location.search).get('share');

// Whether Clerk is configured — compile-time constant based on env var
const CLERK_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const NAV_LINKS = [
  { to: '/planner', label: 'DCA Planner' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/manage', label: 'Manage' },
  { to: '/guide', label: 'Strategy guide' },
] as const;

// Desktop: horizontal nav link with underline indicator
const desktopNavStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? MC_BLUE_4 : MC_DIMMED,
  textDecoration: 'none',
  fontWeight: isActive ? 600 : 400,
  fontSize: '0.875rem',
  padding: '0 0.5rem',
  height: 56,
  display: 'inline-flex',
  alignItems: 'center',
  whiteSpace: 'nowrap' as const,
  borderBottom: isActive ? `2px solid ${MC_BLUE_4}` : '2px solid transparent',
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
  color: isActive ? MC_BLUE_4 : MC_TEXT,
  background: isActive ? MC_BLUE_LIGHT : 'transparent',
  transition: 'background 0.15s, color 0.15s',
});

// ── Clerk-specific sub-components ─────────────────────────────────────────────
// Only ever rendered when CLERK_ENABLED is true, so ClerkProvider is always
// present — safe to call useClerk() unconditionally inside them.

function ClerkHeaderControls({ isGuest }: { isGuest: boolean }) {
  const { openSignIn } = useClerk();
  if (isGuest) {
    return (
      <Button size="sm" variant="light" onClick={() => openSignIn()}>
        Sign in
      </Button>
    );
  }
  return <UserButton />;
}

function ClerkGuestBanner() {
  const { openSignIn } = useClerk();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <Box
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: MC_BLUE_LIGHT,
        borderBottom: `1px solid ${COLOR_BORDER}`,
        padding: '7px 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text size="xs" style={{ flex: 1, textAlign: 'center' }}>
        You&apos;re in guest mode — data saves to this browser only.{' '}
        <Anchor
          component="button"
          size="xs"
          fw={600}
          onClick={() => openSignIn()}
        >
          Sign in to sync across devices →
        </Anchor>
      </Text>
      <CloseButton
        size="xs"
        onClick={() => setDismissed(true)}
        title="Dismiss"
        style={{ flexShrink: 0 }}
      />
    </Box>
  );
}

// ── Main app shell ─────────────────────────────────────────────────────────────

function AppContent() {
  const { userId } = useAppAuth();
  const isGuest = !userId;

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

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const fmtTime = (d: Date | null) =>
    d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

  const formatAgo = (d: Date | null): string => {
    if (!d) return '—';
    const mins = Math.floor((Date.now() - d.getTime()) / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    return `${Math.floor(mins / 60)} hr ago`;
  };

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
        footer={{ height: 48 }}
        padding={0}
      >
        <AppShell.Header
          style={{
            background: COLOR_CARD,
            borderBottom: `1px solid ${COLOR_BORDER}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 0.75rem',
            overflow: 'hidden',
          }}
        >
          <Group justify="space-between" w="100%" wrap="nowrap" style={{ height: '100%' }}>
            {/* Left: hamburger (mobile) + logo + nav links (desktop) */}
            <Group gap={0} style={{ height: '100%', overflow: 'hidden', flexShrink: 1, minWidth: 0 }}>
              {/* Hamburger — mobile/tablet only */}
              <Box hiddenFrom="sm" mr="sm">
                <Burger
                  opened={drawerOpened}
                  onClick={drawerOpened ? closeDrawer : openDrawer}
                  size="sm"
                  color={MC_DIMMED}
                />
              </Box>

              <Link to="/planner" style={{ textDecoration: 'none' }}>
                <Logo />
              </Link>

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
                <Box visibleFrom="sm" title={`Fetched at ${fmtTime(lastUpdated)}`} style={{ cursor: 'default' }}>
                  <Text size="xs" c="dimmed">Prices: {formatAgo(lastUpdated)}</Text>
                </Box>
              )}
              <Box visibleFrom="xs">
                <Button
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={openGlossary}
                  leftSection={<BsQuestionCircle />}
                >
                  <Box visibleFrom="sm">Glossary</Box>
                </Button>
              </Box>
              <Button
                variant="subtle"
                color="gray"
                size="sm"
                onClick={refresh}
                disabled={loading}
                leftSection={<IconRefresh spinning={loading} />}
              >
                <Box visibleFrom="sm">{loading ? 'Fetching…' : 'Refresh prices'}</Box>
              </Button>
              {CLERK_ENABLED && <ClerkHeaderControls isGuest={isGuest} />}
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          <div style={{ height: '100%', overflow: 'auto', paddingBottom: 40 }}>
            {CLERK_ENABLED && isGuest && <ClerkGuestBanner />}
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
            background: COLOR_CARD,
            borderTop: `1px solid ${COLOR_BORDER}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 1.5rem',
          }}
        >
          <Text size="xs" c="dimmed">
            For informational purposes only — not financial advice. Data via Yahoo Finance. Always do your own research.
          </Text>
        </AppShell.Footer>

        <GlossaryModal opened={glossaryOpened} onClose={closeGlossary} />
        <WelcomeModal />
      </AppShell>

      {/* Mobile side-nav drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="xs"
        padding="md"
        title={
          <Link to="/planner" style={{ textDecoration: 'none' }} onClick={closeDrawer}>
            <Logo size={24} />
          </Link>
        }
        styles={{
          content: { background: COLOR_CARD },
          header: { background: COLOR_CARD, borderBottom: `1px solid ${COLOR_BORDER}` },
        }}
      >
        <Stack gap={4} mt="sm">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} style={drawerNavStyle} onClick={closeDrawer}>
              {label}
            </NavLink>
          ))}
          <Button
            variant="subtle"
            color="gray"
            justify="flex-start"
            fullWidth
            leftSection={<BsQuestionCircle />}
            onClick={() => { closeDrawer(); openGlossary(); }}
            style={{ marginTop: 4 }}
          >
            Glossary
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}

// ── Auth gate (only used when CLERK_ENABLED) ───────────────────────────────────

function AuthGate() {
  const { userId } = useAppAuth();
  const [guestMode, setGuestMode] = useState(
    () => localStorage.getItem('dca-guest-mode') === 'true',
  );

  if (userId || guestMode) return <AppContent />;

  return (
    <LandingPage
      onGuest={() => {
        localStorage.setItem('dca-guest-mode', 'true');
        setGuestMode(true);
      }}
    />
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────

export default function App() {
  if (SHARE_TOKEN) return <ShareView token={SHARE_TOKEN} />;
  // No Clerk key configured → skip landing page, always guest mode
  if (!CLERK_ENABLED) return <AppContent />;
  return <AuthGate />;
}
