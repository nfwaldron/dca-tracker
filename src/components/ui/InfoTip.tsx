import { Tooltip } from '@mantine/core';
import { BsInfoCircle } from 'react-icons/bs';

export function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip
      label={text}
      withArrow
      multiline
      w={260}
      position="top"
      styles={{
        tooltip: {
          fontSize: '0.75rem',
          lineHeight: 1.5,
          fontWeight: 400,
          textTransform: 'none',
          letterSpacing: 0,
        },
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          color: 'var(--muted)',
          cursor: 'default',
          position: 'relative',
          top: '1px',
          marginLeft: 4,
          flexShrink: 0,
          userSelect: 'none',
          fontSize: '0.82rem',
        }}
        onMouseDown={e => e.preventDefault()}
      >
        <BsInfoCircle />
      </span>
    </Tooltip>
  );
}
