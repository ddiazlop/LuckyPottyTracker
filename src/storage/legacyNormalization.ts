import type { DogLifeStage, DogProfile, PottyRecord, PottyLocation } from '../types';
import { DEFAULT_AVATAR, DEFAULT_PROFILE } from './defaults';

const LEGACY_DOG_NAME = 'Buster';
const CURRENT_DOG_NAME = 'Lucky';
const LEGACY_ASSET_AVATAR_PREFIX = '/src/assets/';

const LOWER_CASE_LOCATION_ALIASES: Record<string, PottyLocation> = {
  walk: 'Walk',
  terrace: 'Terrace',
  park: 'Park',
  indoors: 'Indoors',
};

export function normalizeStoredProfile(storedProfileCandidate: unknown): DogProfile {
  if (!isRecord(storedProfileCandidate)) return { ...DEFAULT_PROFILE };

  const normalizedProfile = { ...DEFAULT_PROFILE, ...storedProfileCandidate } as DogProfile;
  const normalizedLifeStage = resolveLifeStage(storedProfileCandidate.lifeStage, storedProfileCandidate.isPuppy);

  const normalizedName = normalizedProfile.name === LEGACY_DOG_NAME ? CURRENT_DOG_NAME : normalizedProfile.name;

  const isStoredAvatarMissing = typeof normalizedProfile.avatarUrl !== 'string' || normalizedProfile.avatarUrl.length === 0;
  const normalizedAvatarUrl =
    isStoredAvatarMissing || normalizedProfile.avatarUrl.startsWith(LEGACY_ASSET_AVATAR_PREFIX)
      ? DEFAULT_AVATAR
      : normalizedProfile.avatarUrl;

  return {
    ...normalizedProfile,
    name: normalizedName,
    avatarUrl: normalizedAvatarUrl,
    lifeStage: normalizedLifeStage,
    isPuppy: normalizedLifeStage === 'puppy',
  };
}

export function normalizeStoredRecords(storedRecordsCandidate: unknown): PottyRecord[] {
  if (!Array.isArray(storedRecordsCandidate)) return [];
  return storedRecordsCandidate.filter(isRecord).map(normalizeStoredRecord);
}

function normalizeStoredRecord(storedRecord: Record<string, unknown>): PottyRecord {
  const isStoredIndoors = storedRecord.location === 'indoors' || storedRecord.location === 'Indoors';
  const isAccident = storedRecord.type !== 'meal' && (isStoredIndoors || Boolean(storedRecord.isAccident));

  return {
    ...(storedRecord as unknown as PottyRecord),
    location: resolvePottyLocation(storedRecord.location, isAccident),
    isAccident,
  };
}

function resolvePottyLocation(storedLocationValue: unknown, isAccident: boolean): PottyLocation {
  if (isAccident) return 'Indoors';

  if (typeof storedLocationValue === 'string') {
    const aliasedLocation = LOWER_CASE_LOCATION_ALIASES[storedLocationValue];
    if (aliasedLocation) return aliasedLocation;

    if (storedLocationValue === 'Walk' || storedLocationValue === 'Terrace' || storedLocationValue === 'Park' || storedLocationValue === 'Indoors') {
      return storedLocationValue;
    }
  }

  return 'Walk';
}

function resolveLifeStage(storedLifeStage: unknown, storedIsPuppy: unknown): DogLifeStage {
  if (storedLifeStage === 'puppy' || storedLifeStage === 'adult' || storedLifeStage === 'senior') {
    return storedLifeStage;
  }
  return storedIsPuppy === true ? 'puppy' : 'adult';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
