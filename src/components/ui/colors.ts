// ─── App semantic colors (CSS variables defined in index.css) ────────────────
export const COLOR_GAIN   = 'var(--green)';   // positive G/L, up prices
export const COLOR_LOSS   = 'var(--red)';     // negative G/L, down prices
export const COLOR_AMBER  = 'var(--amber)';   // funded double-down / warning
export const COLOR_MUTED  = 'var(--muted)';   // secondary / dimmed text
export const COLOR_CARD   = 'var(--card)';    // card / panel background
export const COLOR_BG     = 'var(--bg)';      // page background
export const COLOR_BORDER = 'var(--border)';  // dividers and borders
export const COLOR_TEXT   = 'var(--text)';    // primary text
export const COLOR_ACCENT = 'var(--accent)';  // primary accent (blue left-border)

// ─── Mantine color tokens ──────────────────────────────────────────────────────
export const MC_BLUE_4     = 'var(--mantine-color-blue-4)';     // active nav links
export const MC_BLUE_5     = 'var(--mantine-color-blue-5)';     // borders, icons, accents
export const MC_BLUE_LIGHT = 'var(--mantine-color-blue-light)'; // active nav background
export const MC_RED_5      = 'var(--mantine-color-red-5)';      // unfunded double-down / danger
export const MC_GREEN_5    = 'var(--mantine-color-green-5)';    // positive indicators
export const MC_TEAL_5     = 'var(--mantine-color-teal-5)';     // secondary accent
export const MC_ORANGE_5   = 'var(--mantine-color-orange-5)';   // tertiary accent
export const MC_VIOLET_5   = 'var(--mantine-color-violet-5)';   // quaternary accent
export const MC_DARK_4     = 'var(--mantine-color-dark-4)';     // neutral dot / inactive step
export const MC_DIMMED     = 'var(--mantine-color-dimmed)';     // secondary text (Mantine)
export const MC_TEXT       = 'var(--mantine-color-text)';       // primary text (Mantine)

// ─── Table structure colors (Table.styles.ts) ─────────────────────────────────
export const TABLE_HEADER_BG       = '#253347';   // thead background
export const TABLE_TOTAL_BG        = '#1a2740';   // tfoot / total-row background
export const TABLE_TRIGGERED_ROW   = '#ef444408'; // triggered row bg (red, low opacity)
export const TABLE_TRIGGERED_HOVER = '#ef44440f'; // triggered row hover
export const TABLE_ROW_HOVER       = '#ffffff08'; // normal row hover

// ─── Chart / tooltip colors (Recharts) ────────────────────────────────────────
export const CHART_TOOLTIP_BG     = '#1e293b'; // tooltip container background
export const CHART_TOOLTIP_BORDER = '#334155'; // tooltip container border
export const CHART_TOOLTIP_LABEL  = '#f1f5f9'; // tooltip label text
export const CHART_TOOLTIP_ITEM   = '#94a3b8'; // tooltip item value text
export const CHART_LEGEND_TEXT    = '#94a3b8'; // legend ticker name
export const CHART_LEGEND_PCT     = '#64748b'; // legend percentage text

// ─── Logo ─────────────────────────────────────────────────────────────────────
export const LOGO_BRAND_BLUE = '#1971c2'; // SVG tile background
