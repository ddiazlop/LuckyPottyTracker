import type { DogProfile } from '../types';
import { DEFAULT_PROFILE } from './defaults';
import { generateSampleRecords } from './sampleRecords';
import type { PottyTrackerStore } from './storeContract';

function isSampleDataSeedingEnabled(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_SEED_SAMPLE_DATA === 'true';
}

export async function seedSampleDataWhenEnabled(
  store: PottyTrackerStore,
  isSeedingEnabled: boolean = isSampleDataSeedingEnabled()
): Promise<void> {
  if (!isSeedingEnabled) return;

  const alreadyStoredRecords = await store.loadRecords();
  if (alreadyStoredRecords.length > 0) return;

  const sampleProfile: DogProfile = { ...DEFAULT_PROFILE };
  await store.saveProfile(sampleProfile);
  await store.replaceRecords(generateSampleRecords(sampleProfile.id));
}
