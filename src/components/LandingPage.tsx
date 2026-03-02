import { useState } from 'react';
import { Center, Stack, Text, Button, Anchor, Group, Divider, Paper } from '@mantine/core';
import { SignIn } from '@clerk/clerk-react';
import { SiYoutube, SiPatreon } from 'react-icons/si';
import { Logo } from './ui/Logo';

export function LandingPage({ onGuest }: { onGuest: () => void }) {
  const [showSignIn, setShowSignIn] = useState(false);

  if (showSignIn) {
    return (
      <Center h="100vh">
        <SignIn routing="hash" />
      </Center>
    );
  }

  return (
    <Center h="100vh" style={{ padding: '0 1.5rem' }}>
      <Stack align="center" gap="xl" style={{ maxWidth: 420, width: '100%' }}>
        <Stack align="center" gap="md">
          <Logo size={52} />
          <Stack align="center" gap={6}>
            <Text fw={700} size="1.75rem" ta="center" style={{ letterSpacing: '-0.02em' }}>
              DCA Tracker
            </Text>
            <Text size="sm" ta="center" maw={320}>
              Plan your bi-weekly investments, monitor double-down triggers,
              and see exactly how your budget allocates each pay period.
            </Text>
            <Divider w={200} my={8} />
            <Paper withBorder radius="md" p="sm" style={{ width: '100%', maxWidth: 320 }}>
              <Stack gap={6} align="center">
                <Text size="sm" ta="center" style={{ lineHeight: 1.4 }}>
                  Built around{' '}
                  <Text component="span" fw={600}>Tom Nash</Text>
                  's Enhanced DCA + Double Down strategy
                </Text>
                <Group gap="sm" justify="center">
                  <Anchor
                    href="https://www.youtube.com/@TomNashTV"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <SiYoutube size={15} color="#ff0000" />
                    YouTube
                  </Anchor>
                  <Text size="sm" c="dimmed">·</Text>
                  <Anchor
                    href="https://www.patreon.com/cw/tomnash"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <SiPatreon size={14} color="#ff424d" />
                    Patreon
                  </Anchor>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        </Stack>

        <Stack gap="sm" style={{ width: '100%', maxWidth: 320 }}>
          <Button size="md" fullWidth onClick={() => setShowSignIn(true)}>
            Sign in / Create free account
          </Button>
          <Button variant="subtle" color="gray" size="sm" fullWidth onClick={onGuest}>
            Try without an account →
          </Button>
        </Stack>

        <Text size="xs" c="dimmed" ta="center">
          Free to use · No credit card · Data syncs across devices when you sign up
        </Text>
      </Stack>
    </Center>
  );
}
