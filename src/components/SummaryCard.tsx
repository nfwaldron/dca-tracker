import { Paper, Text, Stack } from '@mantine/core';

export function SummaryCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap={4}>
        <Text size="xs" tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>
          {label}
        </Text>
        <Text size="xl" fw={700} lh={1.2} style={color ? { color } : undefined}>
          {value}
        </Text>
        {sub && (
          <Text size="xs" c="dimmed">
            {sub}
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
