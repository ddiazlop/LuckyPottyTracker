import { BrowserIndexedDbStore } from './browserIndexedDbStore';
import type { PottyTrackerStore } from './storeContract';

let sharedPottyTrackerStore: PottyTrackerStore | null = null;

export function getPottyTrackerStore(): PottyTrackerStore {
  if (!sharedPottyTrackerStore) {
    sharedPottyTrackerStore = new BrowserIndexedDbStore();
  }
  return sharedPottyTrackerStore;
}
