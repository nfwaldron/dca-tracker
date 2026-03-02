import { useState } from 'react';
import { Box, Text, Anchor, CloseButton } from '@mantine/core';
import { useClerk } from '@clerk/clerk-react';
import { MC_BLUE_LIGHT, COLOR_BORDER } from './ui/colors';

export function ClerkGuestBanner() {
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
