import type { ReactNode, CSSProperties } from 'react';
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Alert,
  Center,
  Loader,
  Stack,
  Box,
} from '@mantine/core';
import { BsExclamationTriangle } from 'react-icons/bs';

// Main content wrapper for tab pages
export function TabContent({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <Container maw={1400} py="lg" px="lg" style={{ animation: 'fadeIn 0.2s ease', ...style }}>
      {children}
    </Container>
  );
}

// Uppercase section label
export function SectionTitle({
  children,
  style,
}: {
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <Title
      order={5}
      tt="uppercase"
      c="dimmed"
      style={{ letterSpacing: '0.06em', marginBottom: '0.35rem', ...style }}
    >
      {children}
    </Title>
  );
}

// Secondary descriptive text under section titles
export function SectionDesc({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <Text size="xs" c="dimmed" mb="sm" style={{ lineHeight: 1.5, opacity: 0.85, ...style }}>
      {children}
    </Text>
  );
}

// Auto-fit card grid
export function CardsGrid({ children }: { children?: ReactNode }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} mb="lg">
      {children}
    </SimpleGrid>
  );
}

// Amber warning banner
export function AlertBanner({ children }: { children?: ReactNode }) {
  return (
    <Alert
      color="yellow"
      variant="light"
      icon={<BsExclamationTriangle />}
      mb="md"
    >
      {children}
    </Alert>
  );
}

// Spacing wrapper around charts
export function ChartSection({ children }: { children?: ReactNode }) {
  return <Box mt="lg" mb="xl">{children}</Box>;
}

// Inline muted text span
export function Muted({
  children,
  as: _as,
  style,
}: {
  children?: ReactNode;
  as?: string;
  style?: CSSProperties;
}) {
  return (
    <Text c="dimmed" style={style}>
      {children}
    </Text>
  );
}

// Full-height loading screen
export function LoadingScreen({ children }: { children?: ReactNode }) {
  return (
    <Center h="100vh">
      <Stack align="center" gap="sm" c="dimmed">
        {children}
      </Stack>
    </Center>
  );
}

// Animated spinner
export function LoadingSpinner() {
  return <Loader size="md" />;
}
