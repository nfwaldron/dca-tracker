import { useState } from 'react';
import { Center, Stack, Text, Button } from '@mantine/core';
import { SignIn } from '@clerk/clerk-react';
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
            <Text size="sm" c="dimmed" ta="center" maw={320}>
              Plan your bi-weekly investments, monitor double-down triggers,
              and see exactly how your budget allocates each pay period.
            </Text>
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
