export type PottyType = 'pee' | 'poop' | 'both' | 'meal';

export type PottyLocation = 'Walk' | 'Terrace' | 'Park' | 'Indoors';

export interface PottyLog {
  id: string;
  dogId: string;
  type: PottyType;
  timestamp: number; // Unix timestamp in ms
  isAccident: boolean;
  location: PottyLocation;
  notes?: string;
}

export interface DogProfile {
  id: string;
  name: string;
  breed: string;
  isPuppy: boolean;
  avatarUrl: string;
  targetIntervalHours: number; // e.g. 3.5 hours between outings
}

export interface TimeOfDayDistribution {
  hour: number; // 0 to 23
  label: string; // "8 AM", "12 PM", etc.
  peecount: number;
  poopcount: number;
  mealcount: number;
  total: number;
}

export interface PottyStatistics {
  totalLogs: number;
  totalPees: number;
  totalPoops: number;
  totalMeals: number;
  totalAccidents: number;
  outdoorSuccessRate: number; // percentage 0-100
  avgPeesPerDay: number;
  avgPoopsPerDay: number;
  avgMealsPerDay: number;
  avgHoldTimeHours: number;
  avgMinutesToPoopAfterMeal: number | null; // correlation between meal and next poop
  lastPeeTimestamp: number | null;
  lastPoopTimestamp: number | null;
  lastMealTimestamp: number | null;
  timeOfDayData: TimeOfDayDistribution[];
  timeOfDayBuckets: {
    morning: number; // 6:00 - 11:59
    afternoon: number; // 12:00 - 16:59
    evening: number; // 17:00 - 21:59
    night: number; // 22:00 - 5:59
  };
  predictedNextPottyTimestamp: number | null;
}
