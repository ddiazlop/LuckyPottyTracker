import { DogProfile, PottyLocation, PottyLog, PottyStatistics } from '../types';

export interface AICoachData {
  summary: string;
  keyPattern: string;
  tips: string[];
  recommendedNextStep: string;
  statusMood: 'excellent' | 'steady' | 'needs_attention';
  source: 'offline_heuristic';
}

function formatClockTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * 100% Client-Side Offline Heuristic AI Coach
 * Computes canine behavioral insights, digestion schedules, and life-stage specific
 * guidance (Puppy vs. Adult vs. Senior) directly on-device without external APIs.
 */
export function generateOfflineCoachInsights(
  dog: DogProfile,
  logs: PottyLog[],
  stats: PottyStatistics,
  locationCounts: Record<PottyLocation, number>
): AICoachData {
  const stage = dog.lifeStage || (dog.isPuppy ? 'puppy' : 'adult');

  // Empty state if no logs have been recorded yet
  if (logs.length === 0 || stats.totalLogs === 0) {
    let emptyTips: string[];
    let emptySummary: string;

    if (stage === 'puppy') {
      emptySummary = `Welcome to ${dog.name}'s puppy training tracker! Logging feeds and potty events early unlocks accurate digestive pattern detection.`;
      emptyTips = [
        `Take puppies out every 1.5–2.5 hours, immediately upon waking, and right after active play.`,
        `Reward outdoor elimination with praise and a high-value treat within 2 seconds of finishing.`,
        `Log meal times to detect ${dog.name}'s natural gastrocolic reflex window.`,
      ];
    } else if (stage === 'senior') {
      emptySummary = `Welcome to ${dog.name}'s senior routine tracker! Monitoring bathroom intervals helps ensure mobility comfort and early health awareness.`;
      emptyTips = [
        `Senior dogs have reduced bladder elasticity; offer gentle relief breaks every 2.5–3.5 hours.`,
        `Keep paths to ${dog.name}'s relief spot slip-free to prevent joint stress and anxiety.`,
        `Tracking pee frequency helps your vet catch early signs of kidney or urinary tract changes.`,
      ];
    } else {
      emptySummary = `Welcome to ${dog.name}'s potty tracker! Log ${dog.name}'s first pee, poop, or meal to unlock personalized holding timelines and behavioral insights.`;
      emptyTips = [
        `Establish consistent morning, midday, and evening outing windows for predictable habits.`,
        `Mark outdoor elimination with praise and a favorite cue word on every outing.`,
        `Log meal times to track the natural correlation between feeding and elimination motility.`,
      ];
    }

    return {
      source: 'offline_heuristic',
      summary: emptySummary,
      keyPattern: `Awaiting initial logs to discover ${dog.name}'s natural biological rhythm.`,
      tips: emptyTips,
      recommendedNextStep: `Take ${dog.name} out for a walk or terrace break to begin your streak!`,
      statusMood: 'steady',
    };
  }

  // 1. Identify favorite outdoor location
  const outdoorLocations: PottyLocation[] = ['Walk', 'Terrace', 'Park'];
  let topOutdoorLocation: PottyLocation = 'Walk';
  let topOutdoorCount = -1;

  for (const loc of outdoorLocations) {
    const count = locationCounts[loc] || 0;
    if (count > topOutdoorCount) {
      topOutdoorCount = count;
      topOutdoorLocation = loc;
    }
  }

  // 2. Identify peak daypart
  const buckets = stats.timeOfDayBuckets;
  const dayparts: { name: string; count: number }[] = [
    { name: 'Morning', count: buckets.morning },
    { name: 'Afternoon', count: buckets.afternoon },
    { name: 'Evening', count: buckets.evening },
    { name: 'Night', count: buckets.night },
  ];
  dayparts.sort((a, b) => b.count - a.count);
  const peakDaypart = dayparts[0].count > 0 ? dayparts[0].name : 'Daytime';

  // 3. Status assessment
  const successRate = stats.outdoorSuccessRate;
  const statusMood: 'excellent' | 'steady' | 'needs_attention' =
    successRate >= 90 && stats.totalLogs >= 3
      ? 'excellent'
      : successRate >= 75
      ? 'steady'
      : 'needs_attention';

  // 4. Generate behavioral summary based on life stage
  let summary = '';
  if (stage === 'puppy') {
    if (statusMood === 'excellent') {
      summary = `${dog.name} is making stellar puppy potty progress with a ${successRate}% clean outdoor record! Day holding averages ${stats.avgHoldTimeHours}h${
        stats.avgMinutesToPoopAfterMeal ? `, and bowel movements predictably follow meals by ~${stats.avgMinutesToPoopAfterMeal}m` : ''
      }.`;
    } else if (statusMood === 'steady') {
      summary = `${dog.name} is developing good puppy habits with a ${successRate}% outdoor record. Average hold duration is currently ${stats.avgHoldTimeHours} hours${
        stats.avgMinutesToPoopAfterMeal ? `, and elimination is tied ~${stats.avgMinutesToPoopAfterMeal}m post-meal` : ''
      }.`;
    } else {
      summary = `${dog.name} has recorded ${stats.totalAccidents} indoor incident${
        stats.totalAccidents > 1 ? 's' : ''
      } (${successRate}% outdoor rate). Young puppy bladders have short hold thresholds—tightening intervals to ~${Math.max(
        1.5,
        Number((stats.avgHoldTimeHours * 0.75).toFixed(1))
      )}h will build confidence.`;
    }
  } else if (stage === 'senior') {
    if (statusMood === 'excellent') {
      summary = `${dog.name} is enjoying a comfortable, reliable senior routine with a ${successRate}% clean outdoor record! Holding comfortably around ${stats.avgHoldTimeHours} hours between gentle outings.`;
    } else if (statusMood === 'steady') {
      summary = `${dog.name} is doing well with an outdoor success rate of ${successRate}%. Holding intervals average ${stats.avgHoldTimeHours} hours—frequent, easy access to relief spots keeps senior dogs relaxed.`;
    } else {
      summary = `${dog.name} has recorded ${stats.totalAccidents} indoor incident${
        stats.totalAccidents > 1 ? 's' : ''
      }. Senior accidents often stem from natural muscle weakening or joint stiffness; offering breaks every ~${Math.max(
        2,
        Number((stats.avgHoldTimeHours * 0.8).toFixed(1))
      )}h relieves urgency stress.`;
    }
  } else {
    // Adult
    if (statusMood === 'excellent') {
      summary = `${dog.name} is maintaining a dependable adult routine with a ${successRate}% clean outdoor success rate. Average holding interval is ${stats.avgHoldTimeHours} hours${
        stats.avgMinutesToPoopAfterMeal ? `, with elimination occurring ~${stats.avgMinutesToPoopAfterMeal}m after meals` : ''
      }.`;
    } else if (statusMood === 'steady') {
      summary = `${dog.name} shows good progress with a ${successRate}% outdoor record. Average hold duration is currently ${stats.avgHoldTimeHours} hours${
        stats.avgMinutesToPoopAfterMeal ? `, and elimination is tied ~${stats.avgMinutesToPoopAfterMeal}m post-meal` : ''
      }.`;
    } else {
      summary = `${dog.name} has recorded ${stats.totalAccidents} indoor incident${
        stats.totalAccidents > 1 ? 's' : ''
      } (${successRate}% outdoor rate). Tightening outing intervals to ~${Math.max(
        2,
        Number((stats.avgHoldTimeHours * 0.8).toFixed(1))
      )}h will quickly reinforce outdoor confidence.`;
    }
  }

  // 5. Generate key pattern
  let keyPattern = '';
  if (stats.avgMinutesToPoopAfterMeal) {
    keyPattern = `Noticeable gastrocolic reflex: ${dog.name} consistently needs to poop ~${stats.avgMinutesToPoopAfterMeal} minutes after meals. Outings on ${topOutdoorLocation} are most frequent during ${peakDaypart}.`;
  } else if (topOutdoorCount > 0) {
    keyPattern = `Preferred bathroom spot is ${topOutdoorLocation} (${topOutdoorCount} recorded events), with highest activity during ${peakDaypart} outings.`;
  } else {
    keyPattern = `Activity is distributed across the day, with peak elimination recorded during ${peakDaypart} hours.`;
  }

  // 6. Action tips tailored to life stage and tracking state
  const tips: string[] = [];

  // Tip 1: Digestion and feeding motility
  if (stage === 'puppy') {
    tips.push(
      stats.avgMinutesToPoopAfterMeal
        ? `Puppies digest quickly: schedule an outing ~${stats.avgMinutesToPoopAfterMeal}m after each meal to capture their natural digestive rhythm.`
        : `Take ${dog.name} out 15–30 minutes after eating, as puppy digestion naturally triggers rapid bowel motility.`
    );
  } else if (stage === 'senior') {
    tips.push(
      stats.avgMinutesToPoopAfterMeal
        ? `Digestion runs on a steady tempo: schedule an unhurried outing ~${stats.avgMinutesToPoopAfterMeal}m after feeding.`
        : `Take ${dog.name} on a gentle stroll 30–45 minutes after eating to aid senior digestion and stimulate bowel regularity.`
    );
  } else {
    tips.push(
      stats.avgMinutesToPoopAfterMeal
        ? `Schedule an outing ~${stats.avgMinutesToPoopAfterMeal} minutes after each meal to align with ${dog.name}'s natural gastrocolic reflex.`
        : `Take ${dog.name} out 25–40 minutes after eating to catch natural post-meal digestive motility.`
    );
  }

  // Tip 2: Reinforcement, mobility, and accident handling
  if (stage === 'puppy') {
    tips.push(
      stats.totalAccidents > 0
        ? `If ${dog.name} sniffs or circles indoors, gently scoop them up to ${topOutdoorLocation} and reward immediate outdoor relief within 2 seconds.`
        : `Keep rewarding elimination on ${topOutdoorLocation} with enthusiastic praise and high-value treats within 2 seconds of finishing.`
    );
  } else if (stage === 'senior') {
    tips.push(
      stats.totalAccidents > 0
        ? `Never scold senior accidents—ensure easy traction (rugs/runners) to the door and consider an indoor relief pad for nighttime urgency.`
        : `Gentle encouragement and even, non-slip footing on ${topOutdoorLocation} help ${dog.name} eliminate comfortably without joint strain.`
    );
  } else {
    tips.push(
      stats.totalAccidents > 0
        ? `If ${dog.name} sniffs or circles indoors, gently redirect them to ${topOutdoorLocation} and reward outdoor elimination within 2 seconds.`
        : `Keep pairing your verbal cue right as ${dog.name} eliminates on ${topOutdoorLocation} to solidify positive association.`
    );
  }

  // Tip 3: Holding capacity & life stage biological limits
  if (stage === 'puppy') {
    tips.push(
      `Puppy bladders are still maturing; avoid exceeding ${Math.min(
        dog.targetIntervalHours,
        3
      )}h between breaks during active waking hours.`
    );
  } else if (stage === 'senior') {
    tips.push(
      `Senior bladders lose muscle tone; aim for breaks every ${Math.min(
        dog.targetIntervalHours,
        4
      )}h and ensure constant fresh water access.`
    );
  } else {
    tips.push(
      stats.avgHoldTimeHours >= dog.targetIntervalHours
        ? `${dog.name} comfortably meets your ${dog.targetIntervalHours}h holding goal! Stick to these set walk times to maintain predictability.`
        : `Proactively take ${dog.name} out slightly before the ${stats.avgHoldTimeHours}h mark to preempt sudden urgency.`
    );
  }

  // 7. Recommended Next Step
  let recommendedNextStep = '';
  const now = Date.now();

  // If a meal occurred recently (< 90 minutes ago) and we know post-meal poop duration
  if (
    stats.lastMealTimestamp &&
    stats.avgMinutesToPoopAfterMeal &&
    now - stats.lastMealTimestamp < 90 * 60 * 1000
  ) {
    const dueTimestamp = stats.lastMealTimestamp + stats.avgMinutesToPoopAfterMeal * 60 * 1000;
    if (dueTimestamp > now) {
      recommendedNextStep = `Post-meal window: plan an outing around ${formatClockTime(
        dueTimestamp
      )} for ${dog.name}'s digestive routine.`;
    } else {
      recommendedNextStep = `Meal was logged recently—take ${dog.name} out now for their expected post-meal elimination!`;
    }
  } else if (stats.predictedNextPottyTimestamp) {
    recommendedNextStep = `Plan next potty break around ${formatClockTime(
      stats.predictedNextPottyTimestamp
    )} based on the ${stats.avgHoldTimeHours}h rhythm.`;
  } else {
    const defaultHours = stage === 'puppy' ? 2 : stage === 'senior' ? 3 : Math.round(dog.targetIntervalHours);
    recommendedNextStep = `Plan an outing within the next ${defaultHours} hours.`;
  }

  return {
    source: 'offline_heuristic',
    summary,
    keyPattern,
    tips,
    recommendedNextStep,
    statusMood,
  };
}
