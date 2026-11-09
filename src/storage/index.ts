import { Capacitor } from '@capacitor/core';
import { AndroidSqliteStore } from './androidSqliteStore';
import { BrowserIndexedDbStore } from './browserIndexedDbStore';
import type { PottyTrackerStore } from './storeContract';

let sharedPottyTrackerStore: PottyTrackerStore | null = null;

export function getPottyTrackerStore(): PottyTrackerStore {
  if (!sharedPottyTrackerStore) {
    sharedPottyTrackerStore = Capacitor.getPlatform() === 'android' ? new AndroidSqliteStore() : new BrowserIndexedDbStore();
  }
  return sharedPottyTrackerStore;
}
