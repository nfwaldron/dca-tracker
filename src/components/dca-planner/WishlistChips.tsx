import { Group, Box, Text, Paper, Badge } from '@mantine/core';
import { formatDollars } from '../../utils/format';
import { SectionTitle, SectionDesc } from '../ui/Layout';
import type { EnrichedHolding } from '../../types';

export function WishlistChips({ holdings }: { holdings: EnrichedHolding[] }) {
  if (holdings.length === 0) return null;
  return (
    <Box mt="xl">
      <SectionTitle style={{ marginBottom: '0.35rem' }}>Watchlist</SectionTitle>
      <SectionDesc>
        Stocks you're watching but don't own yet. An amber <strong>On sale</strong> badge means the
        stock is triggered — below its 200-day MA or 20%+ off its high.
      </SectionDesc>
      <Group gap="sm" wrap="wrap">
        {holdings.map(h => (
          <Paper key={h.id} withBorder p="xs" radius="md">
            <Group gap="xs" align="center">
              <Text size="xs" fw={700}>{h.ticker}</Text>
              {h.price > 0 && (
                <Text size="xs" fw={600}>{formatDollars(h.price)}</Text>
              )}
              {h.role && <Text size="xs" c="dimmed">{h.role}</Text>}
              {h.triggered && (
                <Badge size="xs" color="orange" variant="light">On sale</Badge>
              )}
            </Group>
          </Paper>
        ))}
      </Group>
    </Box>
  );
}
