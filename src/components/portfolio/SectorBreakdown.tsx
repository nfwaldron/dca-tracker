import { Paper, Table, Text } from '@mantine/core';
import { formatDollars, formatPercent } from '../../utils/format';
import { SectionTitle } from '../ui/Layout';
import type { EnrichedHolding } from '../../types';

export function SectorBreakdown({
  holdings,
  totalValue,
}: {
  holdings: EnrichedHolding[];
  totalValue: number;
}) {
  if (holdings.length === 0 || totalValue === 0) return null;

  // Group holdings by sector
  const sectorMap = new Map<string, { tickers: string[]; value: number }>();
  for (const h of holdings) {
    const key = h.sector ?? 'Other';
    const entry = sectorMap.get(key) ?? { tickers: [], value: 0 };
    entry.tickers.push(h.ticker);
    entry.value += h.mktVal;
    sectorMap.set(key, entry);
  }

  // Sort by value descending, "Other" always last
  const rows = [...sectorMap.entries()].sort(([aKey, aVal], [bKey, bVal]) => {
    if (aKey === 'Other') return 1;
    if (bKey === 'Other') return -1;
    return bVal.value - aVal.value;
  });

  return (
    <Paper withBorder p="lg" radius="md" mb="lg">
      <SectionTitle>By Sector</SectionTitle>
      <Table horizontalSpacing="sm" verticalSpacing="xs" fz="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Sector</Table.Th>
            <Table.Th>Holdings</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>Market Value</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>% of Portfolio</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map(([sector, { tickers, value }]) => (
            <Table.Tr key={sector}>
              <Table.Td fw={600}>{sector}</Table.Td>
              <Table.Td>
                <Text size="xs" c="dimmed">
                  {tickers.join(', ')} ({tickers.length})
                </Text>
              </Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>{formatDollars(value)}</Table.Td>
              <Table.Td style={{ textAlign: 'right' }} c="dimmed">
                {formatPercent((value / totalValue) * 100)}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
