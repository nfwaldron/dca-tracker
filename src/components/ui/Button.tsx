import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Button } from '@mantine/core';

type BtnProps = ComponentPropsWithoutRef<'button'> & {
  $sm?: boolean;
  children?: ReactNode;
};

export function BtnPrimary({ $sm, children, style, ...rest }: BtnProps) {
  return (
    <Button size={$sm ? 'xs' : 'sm'} variant="filled" color="blue" style={style} {...(rest as object)}>
      {children}
    </Button>
  );
}

export function BtnSecondary({ $sm, children, style, ...rest }: BtnProps) {
  return (
    <Button size={$sm ? 'xs' : 'sm'} variant="default" style={style} {...(rest as object)}>
      {children}
    </Button>
  );
}

export function BtnGhost({ $sm, children, style, ...rest }: BtnProps) {
  return (
    <Button size={$sm ? 'xs' : 'sm'} variant="subtle" color="gray" style={style} {...(rest as object)}>
      {children}
    </Button>
  );
}

export function BtnDanger({ $sm, children, style, ...rest }: BtnProps) {
  return (
    <Button size={$sm ? 'xs' : 'sm'} variant="subtle" color="red" style={style} {...(rest as object)}>
      {children}
    </Button>
  );
}
