import type { ReactNode } from 'react';
import { Badge } from '@mantine/core';

type BadgeProps = { children?: ReactNode; style?: React.CSSProperties; title?: string };

export function BadgeGreen({ children, style, title }: BadgeProps) {
  return <Badge color="green" variant="light" radius="xl" style={style} title={title}>{children}</Badge>;
}

export function BadgeRed({ children, style, title }: BadgeProps) {
  return <Badge color="red" variant="light" radius="xl" style={style} title={title}>{children}</Badge>;
}

export function BadgeGray({ children, style, title }: BadgeProps) {
  return <Badge color="gray" variant="light" radius="xl" style={style} title={title}>{children}</Badge>;
}

export function BadgeBlue({ children, style, title }: BadgeProps) {
  return <Badge color="blue" variant="light" radius="xl" style={style} title={title}>{children}</Badge>;
}

export function BadgePurple({ children, style, title }: BadgeProps) {
  return <Badge color="violet" variant="light" radius="xl" style={style} title={title}>{children}</Badge>;
}

export function CategoryBadge({ children, $hex, style, title }: BadgeProps & { $hex: string }) {
  return (
    <Badge
      radius="xl"
      variant="light"
      title={title}
      style={{
        background: $hex + '33',
        color: $hex,
        border: 'none',
        ...style,
      }}
    >
      {children}
    </Badge>
  );
}
