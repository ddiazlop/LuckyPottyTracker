import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { DogProfile, PottyRecord } from '../types';
import { DEFAULT_PROFILE } from './defaults';
import type { PottyTrackerStore } from './storeContract';

const DATABASE_NAME = 'pawspot';
const DATABASE_VERSION = 1;
const RECORDS_STORE_NAME = 'records';
const RECORDS_TIMESTAMP_INDEX_NAME = 'byTimestamp';
const PROFILE_STORE_NAME = 'profile';
const META_STORE_NAME = 'meta';

const UNSUPPORTED_BROWSER_MESSAGE = 'This browser blocks the offline database, so Paws & Pots cannot keep your data.';

interface StoredMetaEntry {
  key: string;
  value: unknown;
}

interface PottyTrackerDatabaseSchema extends DBSchema {
  records: {
    key: string;
    value: PottyRecord;
    indexes: {
      byTimestamp: number;
    };
  };
  profile: {
    key: string;
    value: DogProfile;
  };
  meta: {
    key: string;
    value: StoredMetaEntry;
  };
}

type PottyTrackerDatabase = IDBPDatabase<PottyTrackerDatabaseSchema>;

let sharedDatabaseOpeningPromise: Promise<PottyTrackerDatabase> | null = null;

function createPottyTrackerDatabase(): Promise<PottyTrackerDatabase> {
  return openDB<PottyTrackerDatabaseSchema>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database) {
      const recordsStore = database.createObjectStore(RECORDS_STORE_NAME, { keyPath: 'id' });
      recordsStore.createIndex(RECORDS_TIMESTAMP_INDEX_NAME, 'timestamp');
      database.createObjectStore(PROFILE_STORE_NAME, { keyPath: 'id' });
      database.createObjectStore(META_STORE_NAME, { keyPath: 'key' });
    },
    terminated() {
      sharedDatabaseOpeningPromise = null;
    },
  });
}

function getPottyTrackerDatabase(): Promise<PottyTrackerDatabase> {
  if (!sharedDatabaseOpeningPromise) {
    sharedDatabaseOpeningPromise = createPottyTrackerDatabase().catch((openingError: unknown) => {
      sharedDatabaseOpeningPromise = null;
      throw openingError;
    });
  }
  return sharedDatabaseOpeningPromise;
}

export class BrowserIndexedDbStore implements PottyTrackerStore {
  async initialize(): Promise<void> {
    try {
      await getPottyTrackerDatabase();
    } catch {
      throw new Error(UNSUPPORTED_BROWSER_MESSAGE);
    }
  }

  async loadRecords(): Promise<PottyRecord[]> {
    const database = await getPottyTrackerDatabase();
    const storedRecordsNewestFirst = await database.getAllFromIndex(RECORDS_STORE_NAME, RECORDS_TIMESTAMP_INDEX_NAME);
    return storedRecordsNewestFirst.reverse();
  }

  async upsertRecord(record: PottyRecord): Promise<void> {
    const database = await getPottyTrackerDatabase();
    await database.put(RECORDS_STORE_NAME, record);
  }

  async deleteRecord(recordId: string): Promise<void> {
    const database = await getPottyTrackerDatabase();
    await database.delete(RECORDS_STORE_NAME, recordId);
  }

  async replaceRecords(records: PottyRecord[]): Promise<void> {
    const database = await getPottyTrackerDatabase();
    const recordsTransaction = database.transaction(RECORDS_STORE_NAME, 'readwrite');
    const recordsStore = recordsTransaction.store;
    await Promise.all([recordsStore.clear(), ...records.map((record) => recordsStore.put(record))]);
    await recordsTransaction.done;
  }

  async loadProfile(): Promise<DogProfile> {
    const database = await getPottyTrackerDatabase();
    const storedProfiles = await database.getAll(PROFILE_STORE_NAME);
    return storedProfiles.length > 0 ? storedProfiles[0] : { ...DEFAULT_PROFILE };
  }

  async saveProfile(profile: DogProfile): Promise<void> {
    const database = await getPottyTrackerDatabase();
    await database.put(PROFILE_STORE_NAME, profile);
  }
}
