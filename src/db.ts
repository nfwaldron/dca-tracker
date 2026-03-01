import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Holding, PriceRow, DcaBucket } from './types';

interface PriceRecord extends PriceRow {
  ticker: string;
}

interface SettingRecord {
  key: string;
  value: number | string;
}

class DcaDatabase extends Dexie {
  holdings!: Table<Holding, string>;
  prices!: Table<PriceRecord, string>;
  settings!: Table<SettingRecord, string>;
  buckets!: Table<DcaBucket, string>;

  constructor() {
    super('dca-tracker');
    this.version(1).stores({
      holdings: 'id',
      prices: 'ticker',
      settings: 'key',
    });
    this.version(2).stores({
      holdings: 'id',
      prices: 'ticker',
      settings: 'key',
      buckets: 'id',
    });
    // v3: migrate holdings from { shares: { robinhood, moomoo }, avgCost: { robinhood, moomoo } }
    //     to { positions: BrokerPosition[] }
    this.version(3)
      .stores({
        holdings: 'id',
        prices: 'ticker',
        settings: 'key',
        buckets: 'id',
      })
      .upgrade(async tx => {
        const holdings = await tx.table('holdings').toArray();
        for (const h of holdings) {
          if (h.positions) continue; // already migrated
          const positions: Array<{ broker: string; shares: number; avgCost: number }> = [];
          if ((h.shares?.robinhood ?? 0) > 0) {
            positions.push({
              broker: 'Robinhood',
              shares: h.shares.robinhood,
              avgCost: h.avgCost?.robinhood ?? 0,
            });
          }
          if ((h.shares?.moomoo ?? 0) > 0) {
            positions.push({
              broker: 'Moomoo',
              shares: h.shares.moomoo,
              avgCost: h.avgCost?.moomoo ?? 0,
            });
          }
          await tx
            .table('holdings')
            .put({ ...h, positions, shares: undefined, avgCost: undefined });
        }
      });
  }
}

export const db = new DcaDatabase();
