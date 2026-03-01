import { render, type RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import type { ReactElement } from 'react';

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider defaultColorScheme="dark">
      <Notifications />
      <ModalsProvider>{children}</ModalsProvider>
    </MantineProvider>
  );
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllProviders, ...options });

// re-export everything from RTL so tests only need one import
export * from '@testing-library/react';
export { customRender as render };
