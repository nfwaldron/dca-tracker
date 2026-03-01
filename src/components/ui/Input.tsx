import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Input, NativeSelect } from '@mantine/core';
import styled from 'styled-components';

// InputCell — bare input, used inside table cells and small form fields
export function InputCell({
  style,
  ...rest
}: ComponentPropsWithoutRef<'input'>) {
  return (
    <Input
      size="xs"
      style={style}
      styles={{ input: { fontSize: '0.83rem' } }}
      {...(rest as object)}
    />
  );
}

// SelectCell — native select that accepts <option> children
export function SelectCell({
  children,
  style,
  ...rest
}: ComponentPropsWithoutRef<'select'> & { children?: ReactNode }) {
  return (
    <NativeSelect
      size="xs"
      style={style}
      styles={{ input: { fontSize: '0.83rem' } }}
      {...(rest as object)}
    >
      {children}
    </NativeSelect>
  );
}

// DollarWrap / DollarSign / DollarInput — kept as styled-components
// (used only in DcaPlanner, migrated separately)
export const DollarWrap = styled.div`
  display: flex;
  align-items: center;
`;

export const DollarSign = styled.span`
  background: var(--bg);
  border: 1px solid var(--border);
  border-right: none;
  border-radius: 6px 0 0 6px;
  padding: 0.4rem 0.6rem;
  color: var(--muted);
  font-size: 0.9rem;
`;

export const DollarInput = styled.input`
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: var(--font);
  outline: none;
  transition: border-color 0.15s;
  &:focus { border-color: var(--accent); }
  border-radius: 0 6px 6px 0;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.4rem 0.75rem;
`;
