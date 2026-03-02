import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppAuth } from '../store/AuthProvider';
import {
  Modal,
  Stepper,
  Text,
  Title,
  List,
  Button,
  Group,
  Stack,
  ThemeIcon,
  Alert,
  Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { BsLightbulb, BsGrid3X3Gap, BsArrowDown } from 'react-icons/bs';
import { useStore } from '../store';

function welcomeKey(userId: string) {
  return `dca-welcome-seen-${userId}`;
}

const TOTAL_STEPS = 3;

export function WelcomeModal() {
  const { userId } = useAppAuth();
  const { state, dispatch, loaded } = useStore();
  const [opened, { open, close }] = useDisclosure(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loaded) return;
    if (state.holdings.length > 0) return;
    const key = welcomeKey(userId ?? 'guest');
    if (localStorage.getItem(key)) return;
    open();
  }, [loaded, userId, state.holdings.length, open]);

  function dismiss() {
    localStorage.setItem(welcomeKey(userId ?? 'guest'), 'true');
    close();
  }

  function handleStartFresh() {
    navigate('/manage');
    dismiss();
  }

  function loadTemplate() {
    fetch('/template.json')
      .then(r => r.json())
      .then(data => {
        dispatch({ type: 'LOAD_SNAPSHOT', payload: data });
        notifications.show({
          color: 'green',
          title: 'Example portfolio loaded',
          message: 'Prices will refresh automatically.',
          autoClose: 3000,
        });
        dismiss();
      })
      .catch(() =>
        notifications.show({ color: 'red', message: 'Could not load example portfolio.' })
      );
  }

  return (
    <Modal
      opened={opened}
      onClose={dismiss}
      title={<Text fw={700} size="lg" style={{ letterSpacing: '-0.01em' }}>Welcome to DCA Tracker</Text>}
      size="lg"
      closeOnClickOutside={false}
    >
      <Stepper active={step} size="sm" mb="xl" styles={{ stepLabel: { fontSize: '0.78rem' } }}>
        <Stepper.Step label="The concept" />
        <Stepper.Step label="Slot system" />
        <Stepper.Step label="Double-down" />
      </Stepper>

      {/* ── Step 0: The concept ─────────────────────────────────────────── */}
      {step === 0 && (
        <Stack gap="md">
          <Group gap="sm" align="flex-start">
            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
              <BsLightbulb size={16} />
            </ThemeIcon>
            <Box style={{ flex: 1 }}>
              <Title order={4} mb={4}>Track your DCA strategy</Title>
              <Text size="sm" c="dimmed">
                Dollar-cost averaging means investing a fixed amount on a regular schedule —
                regardless of price. Over time, you buy more shares when prices are low and
                fewer when they're high, naturally averaging your cost basis down.
              </Text>
            </Box>
          </Group>

          <Text size="sm">This app helps you:</Text>
          <List size="sm" spacing={6}>
            <List.Item>Track positions across <strong>multiple brokers</strong> with a single weighted average cost</List.Item>
            <List.Item>Plan exactly <strong>how much to buy</strong> each pay period without manual math</List.Item>
            <List.Item>Know at a glance <strong>which stocks are on sale</strong> and eligible for a larger purchase</List.Item>
          </List>

          <Text size="sm" mt="xs">Holdings have three categories:</Text>
          <List size="sm" spacing={6}>
            <List.Item><strong>Core</strong> — actively DCA'd; receives a budget allocation each period</List.Item>
            <List.Item><strong>Extra</strong> — held but not on a DCA schedule; tracked for P&amp;L only</List.Item>
            <List.Item><strong>Wishlist</strong> — stocks you're watching but haven't bought yet</List.Item>
          </List>
        </Stack>
      )}

      {/* ── Step 1: Slot system ─────────────────────────────────────────── */}
      {step === 1 && (
        <Stack gap="md">
          <Group gap="sm" align="flex-start">
            <ThemeIcon size="lg" radius="md" variant="light" color="violet">
              <BsGrid3X3Gap size={16} />
            </ThemeIcon>
            <Box style={{ flex: 1 }}>
              <Title order={4} mb={4}>Equal slots, automatic allocation</Title>
              <Text size="sm" c="dimmed">
                Your DCA budget is divided into equal "slots" — one per core holding.
                Every stock gets the same dollar amount automatically, so no single
                position gets over-weighted by accident.
              </Text>
            </Box>
          </Group>

          <List size="sm" spacing={6}>
            <List.Item>
              <strong>Example:</strong> $300 biweekly budget ÷ 6 core holdings = <strong>$50 per holding</strong> per pay period
            </List.Item>
            <List.Item>
              Add or remove core holdings and all allocations re-balance automatically
            </List.Item>
            <List.Item>
              <strong>Buckets</strong> let you pair 2+ stocks that share a single slot —
              useful when you want to rotate between similar plays without over-allocating
            </List.Item>
          </List>

          <Text size="sm" c="dimmed" mt="xs">
            Set your budget and pay frequency in the <strong>Manage</strong> tab.
            The DCA Planner shows your per-period allocation for every holding.
          </Text>
        </Stack>
      )}

      {/* ── Step 2: Double-down trigger ─────────────────────────────────── */}
      {step === 2 && (
        <Stack gap="md">
          <Group gap="sm" align="flex-start">
            <ThemeIcon size="lg" radius="md" variant="light" color="green">
              <BsArrowDown size={16} />
            </ThemeIcon>
            <Box style={{ flex: 1 }}>
              <Title order={4} mb={4}>Buy more when stocks dip</Title>
              <Text size="sm" c="dimmed">
                DCA is most powerful when you lean in during drawdowns. The trigger system
                identifies when a stock is meaningfully below its trend, so you know when
                to deploy extra capital.
              </Text>
            </Box>
          </Group>

          <Text size="sm">A stock <strong>triggers</strong> when either condition is met:</Text>
          <List size="sm" spacing={6}>
            <List.Item>Price is <strong>below its 200-day moving average</strong> — below the long-term trend</List.Item>
            <List.Item>Price is <strong>20% or more off its 52-week high</strong> — a meaningful drawdown from recent strength</List.Item>
          </List>

          <List size="sm" spacing={6} mt="xs">
            <List.Item>
              Set a separate <strong>Double-Down Budget</strong> in Manage — this funds triggered stocks
              on top of their regular slot
            </List.Item>
            <List.Item>
              Opt stocks in from the DCA Planner — they'll automatically receive extra
              allocation whenever they trigger
            </List.Item>
          </List>

          <Alert variant="light" color="blue" mt="sm">
            <Text size="sm" fw={600} mb={2}>Want the full picture?</Text>
            <Text size="sm" c="dimmed">
              The <strong>Strategy Guide</strong> tab covers Tom Nash's Enhanced DCA Strategy —
              why DCA works historically, how the double-down approach turns dips into
              opportunities, staying disciplined during volatility, and when to review and
              adjust your plan. Worth reading before your first purchase.
            </Text>
          </Alert>
        </Stack>
      )}

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <Group justify="space-between" mt="xl" wrap="wrap" gap="xs">
        <Button
          variant="subtle"
          color="gray"
          disabled={step === 0}
          onClick={() => setStep(s => s - 1)}
        >
          Back
        </Button>

        {step < TOTAL_STEPS - 1 ? (
          <Button onClick={() => setStep(s => s + 1)}>Next</Button>
        ) : (
          <Group gap="sm" wrap="wrap">
            <Button variant="default" onClick={handleStartFresh}>
              Start fresh
            </Button>
            <Button onClick={loadTemplate}>
              Load example portfolio
            </Button>
          </Group>
        )}
      </Group>
    </Modal>
  );
}
