import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Matches our existing dark slate CSS variables
const darkSlate: MantineColorsTuple = [
  '#f1f5f9', // 0 - lightest (--text)
  '#e2e8f0', // 1
  '#cbd5e1', // 2
  '#94a3b8', // 3 - (--muted)
  '#64748b', // 4
  '#475569', // 5
  '#334155', // 6 - (--border)
  '#1e293b', // 7 - (--card)
  '#0f172a', // 8 - (--bg)
  '#0a1020', // 9 - darkest
];

export const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
  colors: {
    dark: darkSlate,
  },
  defaultRadius: 'md',
  fontSizes: {
    xs: '0.72rem',
    sm: '0.8rem',
    md: '0.875rem',
    lg: '1rem',
    xl: '1.125rem',
  },
  components: {
    Modal: {
      defaultProps: {
        overlayProps: { blur: 3 },
        radius: 'md',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
    NumberInput: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});
