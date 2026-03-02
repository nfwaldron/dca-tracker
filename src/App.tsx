import { useEffect, useRef, useMemo, useState } from 'react';
import { COLOR_CARD, COLOR_BORDER } from './components/ui/colors';
import { Routes, Route, NavLink, Navigate, Link, useNavigate } from 'react-router-dom';
import {
  AppShell,
  Box,
  Group,
  Text,
  Badge,
  Button,
  ActionIcon,
  Stack,
  Loader,
  Center,
  useMantineColorScheme,
  useComputedColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useClerk, UserButton } from '@clerk/clerk-react';
import {
  BsQuestionCircle,
  BsBarChartLine,
  BsBriefcase,
  BsSliders,
  BsBook,
  BsSun,
  BsMoon,
} from 'react-icons/bs';
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
import { ClerkGuestBanner } from './components/ClerkGuestBanner';

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
  color: isActive ? 'var(--accent)' : 'var(--muted)',
  textDecoration: 'none',
  fontWeight: isActive ? 600 : 400,
  fontSize: '0.875rem',
  padding: '0 0.5rem',
  height: 56,
  display: 'inline-flex',
  alignItems: 'center',
  whiteSpace: 'nowrap' as const,
  borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
  transition: 'color 0.15s, border-color 0.15s',
});

// Mobile bottom-tab nav links (icons + label, Google-style)
const BOTTOM_NAV_LINKS = [
  { to: '/planner',   label: 'Planner',   icon: BsBarChartLine },
  { to: '/portfolio', label: 'Portfolio', icon: BsBriefcase    },
  { to: '/manage',    label: 'Manage',    icon: BsSliders      },
  { to: '/guide',     label: 'Guide',     icon: BsBook         },
];

// ── Theme toggle ───────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme('dark');
  const isDark = colorScheme === 'dark';
  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      size="lg"
      onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <BsSun size={16} /> : <BsMoon size={16} />}
    </ActionIcon>
  );
}

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

// ── Pure helpers ───────────────────────────────────────────────────────────────

const fmtTime = (d: Date | null) =>
  d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

const formatAgo = (d: Date | null): string => {
  if (!d) return '—';
  const mins = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  return `${Math.floor(mins / 60)} hr ago`;
};

// ── Main app shell ─────────────────────────────────────────────────────────────

function AppContent() {
  const { userId } = useAppAuth();
  const isGuest = !userId;

  const { state, dispatch, loaded } = useStore();
  const [glossaryOpened, { open: openGlossary, close: closeGlossary }] = useDisclosure(false);
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

  // Re-render every minute so the "X min ago" timestamp stays current
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

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
        footer={{ height: { base: 64, sm: 48 } }}
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
            {/* Left: logo + desktop nav links */}
            <Group gap={0} style={{ height: '100%', overflow: 'hidden', flexShrink: 1, minWidth: 0 }}>
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
            <Group gap="xs" style={{ flexShrink: 0 }}>
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
              <ThemeToggle />
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
          style={{ background: COLOR_CARD, borderTop: `1px solid ${COLOR_BORDER}` }}
        >
          {/* Mobile: Google-style bottom tab bar */}
          <Box
            hiddenFrom="sm"
            style={{ display: 'flex', height: '100%', alignItems: 'stretch' }}
          >
            {BOTTOM_NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  textDecoration: 'none',
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                  fontSize: '0.62rem',
                  fontWeight: isActive ? 600 : 400,
                  padding: '6px 4px',
                  transition: 'color 0.15s',
                })}
              >
                <Icon size={22} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
          </Box>

          {/* Desktop: disclaimer */}
          <Box
            visibleFrom="sm"
            style={{
              display: 'flex',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 1.5rem',
            }}
          >
            <Text size="xs" c="dimmed">
              For informational purposes only — not financial advice. Data via Yahoo Finance. Always do your own research.
            </Text>
          </Box>
        </AppShell.Footer>

        <GlossaryModal opened={glossaryOpened} onClose={closeGlossary} />
        <WelcomeModal />
      </AppShell>
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
