import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Input, NativeSelect } from '@mantine/core';

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

