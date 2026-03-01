/** Colour for each holding category — used in badges and charts */
export const CAT_HEX: Record<string, string> = {
  core: '#3b82f6',
  extra: '#8b5cf6',
  wishlist: '#475569',
};

/** Canonical sort order for categories */
export const CAT_ORDER = ['core', 'extra', 'wishlist'] as const;
