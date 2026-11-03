import { PottyRecord, PottyStatistics, TimeOfDayDistribution } from '../types';

export interface DailyPottyTrend {
  dateKey: string;
  dayName: string;
  shortDate: string;
  isToday: boolean;
  pees: number;
  poops: number;
  meals: number;
  accidents: number;
  total: number;
}

export function calculateStatistics(records: PottyRecord[], targetIntervalHours: number = 4): PottyStatistics {
  const totalRecords = records.length;
  if (totalRecords === 0) {
    return {
      totalRecords: 0,
      totalPees: 0,
      totalPoops: 0,
      totalMeals: 0,
      totalAccidents: 0,
      outdoorSuccessRate: 100,
      avgPeesPerDay: 0,
      avgPoopsPerDay: 0,
      avgMealsPerDay: 0,
      avgHoldTimeHours: targetIntervalHours,
      avgMinutesToPoopAfterMeal: null,
      lastPeeTimestamp: null,
      lastPoopTimestamp: null,
      lastMealTimestamp: null,
      timeOfDayData: initEmpty24Hours(),
      timeOfDayBuckets: { morning: 0, afternoon: 0, evening: 0, night: 0 },
      predictedNextPottyTimestamp: null,
    };
  }

  let totalPees = 0;
  let totalPoops = 0;
  let totalMeals = 0;
  let totalAccidents = 0;
  let lastPeeTimestamp: number | null = null;
  let lastPoopTimestamp: number | null = null;
  let lastMealTimestamp: number | null = null;

  // Initialize 24-hour distribution
  const hourlyData = initEmpty24Hours();

  const timeOfDayBuckets = {
    morning: 0,   // 6 to 11
    afternoon: 0, // 12 to 16
    evening: 0,   // 17 to 21
    night: 0,     // 22 to 5
  };

  const datesSeen = new Set<string>();

  // Sort records by timestamp ascending for hold-time intervals and meal correlation
  const sortedRecords = [...records].sort((a, b) => a.timestamp - b.timestamp);

  const holdIntervalsHours: number[] = [];

  for (let i = 0; i < sortedRecords.length; i++) {
    const record = sortedRecords[i];
    const dateObj = new Date(record.timestamp);
    const hour = dateObj.getHours();
    const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
    datesSeen.add(dateKey);

    const isPee = record.type === 'pee' || record.type === 'both';
    const isPoop = record.type === 'poop' || record.type === 'both';
    const isMeal = record.type === 'meal';

    if (isPee) {
      totalPees++;
      hourlyData[hour].peecount++;
      if (!lastPeeTimestamp || record.timestamp > lastPeeTimestamp) {
        lastPeeTimestamp = record.timestamp;
      }
    }
    if (isPoop) {
      totalPoops++;
      hourlyData[hour].poopcount++;
      if (!lastPoopTimestamp || record.timestamp > lastPoopTimestamp) {
        lastPoopTimestamp = record.timestamp;
      }
    }
    if (isMeal) {
      totalMeals++;
      hourlyData[hour].mealcount++;
      if (!lastMealTimestamp || record.timestamp > lastMealTimestamp) {
        lastMealTimestamp = record.timestamp;
      }
    }

    hourlyData[hour].total++;

    if (record.isAccident) {
      totalAccidents++;
    }

    // Bucket counts
    if (hour >= 6 && hour < 12) {
      timeOfDayBuckets.morning++;
    } else if (hour >= 12 && hour < 17) {
      timeOfDayBuckets.afternoon++;
    } else if (hour >= 17 && hour < 22) {
      timeOfDayBuckets.evening++;
    } else {
      timeOfDayBuckets.night++;
    }

    // Interval between consecutive potty events on the same calendar day (daytime hold)
    if (i > 0 && !isMeal) {
      const previousRecord = sortedRecords[i - 1];
      if (previousRecord.type !== 'meal') {
        const diffHours = (record.timestamp - previousRecord.timestamp) / (1000 * 60 * 60);
        if (diffHours >= 0.5 && diffHours <= 8) {
          holdIntervalsHours.push(diffHours);
        }
      }
    }
  }

  // Calculate meal-to-poop correlation (time in minutes)
  const mealToPoopDelaysMinutes: number[] = [];
  const mealRecords = sortedRecords.filter((l) => l.type === 'meal');
  const poopRecords = sortedRecords.filter((l) => l.type === 'poop' || l.type === 'both');

  for (const meal of mealRecords) {
    // Find the next poop after this meal within 3 hours (180 mins)
    const nextPoop = poopRecords.find(
      (p) => p.timestamp > meal.timestamp && (p.timestamp - meal.timestamp) <= 180 * 60 * 1000
    );
    if (nextPoop) {
      const delayMins = Math.round((nextPoop.timestamp - meal.timestamp) / (60 * 1000));
      mealToPoopDelaysMinutes.push(delayMins);
    }
  }

  const avgMinutesToPoopAfterMeal =
    mealToPoopDelaysMinutes.length > 0
      ? Math.round(
          mealToPoopDelaysMinutes.reduce((sum, val) => sum + val, 0) /
            mealToPoopDelaysMinutes.length
        )
      : null;

  const daysCount = Math.max(1, datesSeen.size);
  const avgPeesPerDay = Number((totalPees / daysCount).toFixed(1));
  const avgPoopsPerDay = Number((totalPoops / daysCount).toFixed(1));
  const avgMealsPerDay = Number((totalMeals / daysCount).toFixed(1));

  // Success rate accounts for potty events only (excluding meals)
  const pottyTotal = totalPees + totalPoops;
  const outdoorSuccessRate = pottyTotal > 0
    ? Math.max(0, Math.round(((pottyTotal - totalAccidents) / pottyTotal) * 100))
    : 100;

  const avgHoldTimeHours = holdIntervalsHours.length > 0
    ? Number((holdIntervalsHours.reduce((sum, val) => sum + val, 0) / holdIntervalsHours.length).toFixed(1))
    : targetIntervalHours;

  const mostRecentPottyTimestamp = Math.max(lastPeeTimestamp || 0, lastPoopTimestamp || 0);
  const predictedNextPottyTimestamp = mostRecentPottyTimestamp > 0
    ? mostRecentPottyTimestamp + avgHoldTimeHours * 3600 * 1000
    : null;

  return {
    totalRecords,
    totalPees,
    totalPoops,
    totalMeals,
    totalAccidents,
    outdoorSuccessRate,
    avgPeesPerDay,
    avgPoopsPerDay,
    avgMealsPerDay,
    avgHoldTimeHours,
    avgMinutesToPoopAfterMeal,
    lastPeeTimestamp,
    lastPoopTimestamp,
    lastMealTimestamp,
    timeOfDayData: hourlyData,
    timeOfDayBuckets,
    predictedNextPottyTimestamp,
  };
}

function initEmpty24Hours(): TimeOfDayDistribution[] {
  const result: TimeOfDayDistribution[] = [];
  for (let h = 0; h < 24; h++) {
    const label = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
    result.push({
      hour: h,
      label,
      peecount: 0,
      poopcount: 0,
      mealcount: 0,
      total: 0,
    });
  }
  return result;
}

export function getDailyTrendsLast7Days(records: PottyRecord[], referenceTimeMs: number = Date.now()): DailyPottyTrend[] {
  const trends: DailyPottyTrend[] = [];
  const refDate = new Date(referenceTimeMs);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const startOfDay = d.getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

    const dayRecords = records.filter((l) => l.timestamp >= startOfDay && l.timestamp <= endOfDay);
    const pees = dayRecords.filter((l) => l.type === 'pee' || l.type === 'both').length;
    const poops = dayRecords.filter((l) => l.type === 'poop' || l.type === 'both').length;
    const meals = dayRecords.filter((l) => l.type === 'meal').length;
    const accidents = dayRecords.filter((l) => l.isAccident).length;

    const dayName = i === 0 ? 'Today' : d.toLocaleDateString([], { weekday: 'short' });
    const shortDate = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

    trends.push({
      dateKey,
      dayName,
      shortDate,
      isToday: i === 0,
      pees,
      poops,
      meals,
      accidents,
      total: dayRecords.length,
    });
  }

  return trends;
}

export function formatTimeAgo(timestampMs: number | null, nowMs: number = Date.now()): string {
  if (!timestampMs) return 'Never recorded';
  const diffMs = Math.max(0, nowMs - timestampMs);
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) {
    const remainingMins = diffMinutes % 60;
    return remainingMins > 0 ? `${diffHours}h ${remainingMins}m ago` : `${diffHours}h ago`;
  }
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

export function formatClockTime(timestampMs: number): string {
  const date = new Date(timestampMs);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatDateLabel(timestampMs: number): string {
  const date = new Date(timestampMs);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}
