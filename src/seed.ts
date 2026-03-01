import type { Holding, PriceRow } from './types';

export const SEED_ROLES: string[] = [
  'Landlord',
  'Building Materials',
  'Power Grid',
  'Roads',
  'Foremen',
  'Operating System',
  'Security Guards',
  'Crypto Mining',
  'MarTech',
  'Search & AI',
  'Chip Litho',
  'Foundry',
  'Nuclear Power',
];

// 52-week highs as of 2026-03-01 (used to pre-populate before first API refresh)
const Z: PriceRow = {
  price: 0,
  ma200: 0,
  h52: 0,
  dailyChange: 0,
  dailyChangePct: 0,
  yearChangePct: 0,
};
export const SEED_PRICES: Record<string, PriceRow> = {
  AMZN:  { ...Z, h52: 258.60 },
  ANET:  { ...Z, h52: 164.94 },
  ASML:  { ...Z, h52: 1547.22 },
  BE:    { ...Z, h52: 180.90 },
  BITF:  { ...Z, h52: 6.60 },
  BMNR:  { ...Z, h52: 161.00 },
  CEG:   { ...Z, h52: 412.70 },
  DDOG:  { ...Z, h52: 201.69 },
  GOOGL: { ...Z, h52: 349.00 },
  NVDA:  { ...Z, h52: 212.19 },
  PLTR:  { ...Z, h52: 207.52 },
  TSM:   { ...Z, h52: 390.21 },
  VRT:   { ...Z, h52: 264.86 },
  ZETA:  { ...Z, h52: 24.90 },
  ZS:    { ...Z, h52: 336.99 },
};

export const SEED_HOLDINGS: Holding[] = [];
