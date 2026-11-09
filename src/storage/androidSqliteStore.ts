import type { SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import type { DogLifeStage, DogProfile, PottyLocation, PottyRecord, PottyType } from '../types';
import { DEFAULT_PROFILE } from './defaults';
import type { PottyTrackerStore } from './storeContract';

const DATABASE_NAME = 'pawspot';
const DATABASE_VERSION = 1;

const UNSUPPORTED_ANDROID_MESSAGE = 'The Android offline database could not be opened, so Paws & Pots cannot keep your data.';

const RECORD_UPSERT_STATEMENT =
  'INSERT OR REPLACE INTO records (id, dogId, type, timestamp, isAccident, location, notes) VALUES (?, ?, ?, ?, ?, ?, ?)';

const PROFILE_UPSERT_STATEMENT =
  'INSERT OR REPLACE INTO profile (id, name, breed, lifeStage, isPuppy, avatarUrl, targetIntervalHours) VALUES (?, ?, ?, ?, ?, ?, ?)';

const CREATE_SCHEMA_STATEMENTS = `
  CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY NOT NULL,
    dogId TEXT NOT NULL,
    type TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    isAccident INTEGER NOT NULL,
    location TEXT NOT NULL,
    notes TEXT
  );
  CREATE INDEX IF NOT EXISTS records_by_timestamp ON records (timestamp);
  CREATE TABLE IF NOT EXISTS profile (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    breed TEXT NOT NULL,
    lifeStage TEXT NOT NULL,
    isPuppy INTEGER NOT NULL,
    avatarUrl TEXT NOT NULL,
    targetIntervalHours REAL NOT NULL
  );
`;

interface StoredRecordRow {
  id: string;
  dogId: string;
  type: PottyType;
  timestamp: number;
  isAccident: number;
  location: PottyLocation;
  notes: string | null;
}

interface StoredProfileRow {
  id: string;
  name: string;
  breed: string;
  lifeStage: DogLifeStage;
  isPuppy: number;
  avatarUrl: string;
  targetIntervalHours: number;
}

let sharedDatabaseConnectionPromise: Promise<SQLiteDBConnection> | null = null;

async function openPottyTrackerDatabase(): Promise<SQLiteDBConnection> {
  const { CapacitorSQLite, SQLiteConnection } = await import('@capacitor-community/sqlite');
  const connectionManager: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);

  const existingConnection = await connectionManager.isConnection(DATABASE_NAME, false);

  const databaseConnection = existingConnection.result
    ? await connectionManager.retrieveConnection(DATABASE_NAME, false)
    : await connectionManager.createConnection(DATABASE_NAME, false, 'no-encryption', DATABASE_VERSION, false);

  const isDatabaseOpen = await databaseConnection.isDBOpen();
  if (!isDatabaseOpen.result) {
    await databaseConnection.open();
  }

  await databaseConnection.execute(CREATE_SCHEMA_STATEMENTS);

  return databaseConnection;
}

function getPottyTrackerDatabase(): Promise<SQLiteDBConnection> {
  if (!sharedDatabaseConnectionPromise) {
    sharedDatabaseConnectionPromise = openPottyTrackerDatabase().catch((openingError: unknown) => {
      sharedDatabaseConnectionPromise = null;
      throw openingError;
    });
  }
  return sharedDatabaseConnectionPromise;
}

function recordToStatementValues(record: PottyRecord): unknown[] {
  return [
    record.id,
    record.dogId,
    record.type,
    record.timestamp,
    record.isAccident ? 1 : 0,
    record.location,
    record.notes ?? null,
  ];
}

function profileToStatementValues(profile: DogProfile): unknown[] {
  return [
    profile.id,
    profile.name,
    profile.breed,
    profile.lifeStage,
    profile.isPuppy ? 1 : 0,
    profile.avatarUrl,
    profile.targetIntervalHours,
  ];
}

function mapStoredRecordRow(storedRecordRow: StoredRecordRow): PottyRecord {
  return {
    id: storedRecordRow.id,
    dogId: storedRecordRow.dogId,
    type: storedRecordRow.type,
    timestamp: Number(storedRecordRow.timestamp),
    isAccident: Boolean(storedRecordRow.isAccident),
    location: storedRecordRow.location,
    ...(storedRecordRow.notes === null || storedRecordRow.notes === undefined ? {} : { notes: storedRecordRow.notes }),
  };
}

function mapStoredProfileRow(storedProfileRow: StoredProfileRow): DogProfile {
  return {
    id: storedProfileRow.id,
    name: storedProfileRow.name,
    breed: storedProfileRow.breed,
    lifeStage: storedProfileRow.lifeStage,
    isPuppy: Boolean(storedProfileRow.isPuppy),
    avatarUrl: storedProfileRow.avatarUrl,
    targetIntervalHours: Number(storedProfileRow.targetIntervalHours),
  };
}

export class AndroidSqliteStore implements PottyTrackerStore {
  async initialize(): Promise<void> {
    try {
      await getPottyTrackerDatabase();
    } catch {
      throw new Error(UNSUPPORTED_ANDROID_MESSAGE);
    }
  }

  async loadRecords(): Promise<PottyRecord[]> {
    const databaseConnection = await getPottyTrackerDatabase();
    const storedRecordRows = await databaseConnection.query('SELECT * FROM records ORDER BY timestamp DESC');
    return (storedRecordRows.values ?? []).map((storedRecordRow) => mapStoredRecordRow(storedRecordRow as StoredRecordRow));
  }

  async upsertRecord(record: PottyRecord): Promise<void> {
    const databaseConnection = await getPottyTrackerDatabase();
    await databaseConnection.run(RECORD_UPSERT_STATEMENT, recordToStatementValues(record));
  }

  async deleteRecord(recordId: string): Promise<void> {
    const databaseConnection = await getPottyTrackerDatabase();
    await databaseConnection.run('DELETE FROM records WHERE id = ?', [recordId]);
  }

  async replaceRecords(records: PottyRecord[]): Promise<void> {
    const databaseConnection = await getPottyTrackerDatabase();
    const replacementStatements = [
      { statement: 'DELETE FROM records' },
      ...records.map((record) => ({ statement: RECORD_UPSERT_STATEMENT, values: recordToStatementValues(record) })),
    ];
    await databaseConnection.executeSet(replacementStatements, true);
  }

  async loadProfile(): Promise<DogProfile> {
    const databaseConnection = await getPottyTrackerDatabase();
    const storedProfileRows = await databaseConnection.query('SELECT * FROM profile LIMIT 1');
    const storedProfileRow = storedProfileRows.values?.[0];
    return storedProfileRow ? mapStoredProfileRow(storedProfileRow as StoredProfileRow) : { ...DEFAULT_PROFILE };
  }

  async saveProfile(profile: DogProfile): Promise<void> {
    const databaseConnection = await getPottyTrackerDatabase();
    await databaseConnection.run(PROFILE_UPSERT_STATEMENT, profileToStatementValues(profile));
  }
}
