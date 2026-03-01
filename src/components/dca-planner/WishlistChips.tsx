import { Group, Box, Text, Paper } from '@mantine/core';
import { fmt$ } from '../../selectors';
import { SectionTitle, SectionDesc } from '../ui/Layout';
import type { EnrichedHolding } from '../../types';

export function WishlistChips({ holdings }: { holdings: EnrichedHolding[] }) {
  if (holdings.length === 0) return null;
  return (
    <Box mt="xl">
      <SectionTitle style={{ marginBottom: '0.35rem' }}>Watchlist</SectionTitle>
      <SectionDesc>
        Stocks you're watching but don't own yet. Add them in Manage with category "wishlist".
      </SectionDesc>
      <Group gap="sm" wrap="wrap">
        {holdings.map(h => (
          <Paper key={h.id} withBorder p="xs" radius="md">
            <Group gap="xs">
              <Text size="xs" fw={700}>{h.ticker}</Text>
              {h.price > 0 && (
                <Text size="xs" fw={600} c="green">{fmt$(h.price)}</Text>
              )}
              <Text size="xs" c="dimmed">{h.role}</Text>
            </Group>
          </Paper>
        ))}
      </Group>
    </Box>
  );
}
