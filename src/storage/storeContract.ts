import type { DogProfile, PottyRecord } from '../types';

export interface PottyTrackerStore {
  initialize(): Promise<void>;
  loadRecords(): Promise<PottyRecord[]>;
  upsertRecord(record: PottyRecord): Promise<void>;
  deleteRecord(recordId: string): Promise<void>;
  replaceRecords(records: PottyRecord[]): Promise<void>;
  loadProfile(): Promise<DogProfile>;
  saveProfile(profile: DogProfile): Promise<void>;
}
