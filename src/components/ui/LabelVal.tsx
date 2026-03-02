import { Text } from '@mantine/core';
import type { ReactNode } from 'react';

/** Two-line label + value cell used in mobile accordion panels. */
export function LabelVal({
  label,
  value,
  bold,
  muted,
  color,
}: {
  label: string;
  value: ReactNode;
  bold?: boolean;
  muted?: boolean;
  color?: string;
}) {
  return (
    <div>
      <Text size="xs" c="dimmed">{label}</Text>
      <Text size="sm" fw={bold ? 600 : 400} c={muted ? 'dimmed' : undefined} style={{ color }}>
        {value}
      </Text>
    </div>
  );
}
