import { DogProfile, PottyLog, PottyLocation } from '../types';

export const DEFAULT_AVATAR = '/images/dog_mascot_avatar_1792141800760.jpg';

export const DEFAULT_PROFILE: DogProfile = {
  id: 'dog-1',
  name: 'Lucky',
  breed: 'Golden Retriever',
  lifeStage: 'adult',
  isPuppy: false,
  avatarUrl: DEFAULT_AVATAR,
  targetIntervalHours: 4,
};

const LOGS_STORAGE_KEY = 'pawspot_logs_v2';
const PROFILE_STORAGE_KEY = 'pawspot_profile_v2';

export function getStoredProfile(): DogProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    if (parsed.name === 'Buster') {
      parsed.name = 'Lucky';
    }
    if (!parsed.avatarUrl || parsed.avatarUrl.startsWith('/src/assets/')) {
      parsed.avatarUrl = DEFAULT_AVATAR;
    }
    if (!parsed.lifeStage) {
      parsed.lifeStage = parsed.isPuppy ? 'puppy' : 'adult';
    }
    parsed.isPuppy = parsed.lifeStage === 'puppy';
    saveProfile(parsed);
    return parsed;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: DogProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function generateSampleLogs(dogId: string = 'dog-1'): PottyLog[] {
  const logs: PottyLog[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const schedule: { hour: number; minute: number; type: 'pee' | 'poop' | 'both' | 'meal'; location: PottyLocation }[] = [
    { hour: 7, minute: 0, type: 'meal', location: 'Indoors' },
    { hour: 7, minute: 35, type: 'both', location: 'Walk' },
    { hour: 11, minute: 40, type: 'pee', location: 'Terrace' },
    { hour: 15, minute: 20, type: 'pee', location: 'Park' },
    { hour: 18, minute: 0, type: 'meal', location: 'Indoors' },
    { hour: 18, minute: 45, type: 'both', location: 'Walk' },
    { hour: 22, minute: 15, type: 'pee', location: 'Terrace' },
  ];

  for (let daysAgo = 5; daysAgo >= 0; daysAgo--) {
    const targetDate = new Date(now - daysAgo * dayMs);

    for (const slot of schedule) {
      const entryDate = new Date(targetDate);
      entryDate.setHours(slot.hour, slot.minute + Math.floor(Math.random() * 25 - 12), 0, 0);

      if (entryDate.getTime() > now) continue;

      const isIndoorsAccident = daysAgo === 4 && slot.hour === 15;
      const actualLocation: PottyLocation = isIndoorsAccident ? 'Indoors' : slot.location;

      logs.push({
        id: `sample-${daysAgo}-${slot.hour}-${Math.random().toString(36).substring(2, 7)}`,
        dogId,
        type: slot.type,
        timestamp: entryDate.getTime(),
        isAccident: slot.type !== 'meal' && actualLocation === 'Indoors',
        location: actualLocation,
        notes: isIndoorsAccident ? 'Indoors accident while excited by doorbell' : slot.type === 'meal' ? (slot.hour < 12 ? 'Morning kibble' : 'Evening dinner') : undefined,
      });
    }
  }

  return logs.sort((a, b) => b.timestamp - a.timestamp);
}

export function getStoredLogs(): PottyLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!raw) {
      const initial = generateSampleLogs();
      saveLogs(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return parsed.map((item: any) => ({
      ...item,
      location: (item.location === 'walk' ? 'Walk' : item.location === 'park' ? 'Park' : item.location === 'indoors' || item.isAccident ? 'Indoors' : item.location || 'Walk') as PottyLocation,
      isAccident: item.type !== 'meal' && (item.location === 'indoors' || item.location === 'Indoors' || item.isAccident),
    }));
  } catch {
    return [];
  }
}

export function saveLogs(logs: PottyLog[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
}
