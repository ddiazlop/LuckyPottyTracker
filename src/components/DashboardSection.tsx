import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Droplets,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Sun,
  Sunset,
  Moon,
  Sunrise,
  MapPin,
  Bot,
  RefreshCw,
  Lightbulb,
  CalendarDays,
  UtensilsCrossed,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { DogProfile, PottyLog, PottyStatistics, PottyLocation } from '../types';
import {
  calculateStatistics,
  formatClockTime,
  getDailyTrendsLast7Days,
  formatTimeAgo,
} from '../utils/stats';
import { haptics } from '../utils/haptics';

interface DashboardSectionProps {
  dog: DogProfile;
  logs: PottyLog[];
}

interface AICoachData {
  summary: string;
  keyPattern: string;
  tips: string[];
  recommendedNextStep: string;
  statusMood: 'excellent' | 'steady' | 'needs_attention';
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ dog, logs }) => {
  const [metricTab, setMetricTab] = useState<'all' | 'pee' | 'poop' | 'meal'>('all');
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  // AI Coach state
  const [coachData, setCoachData] = useState<AICoachData | null>(null);
  const [isCoachLoading, setIsCoachLoading] = useState<boolean>(false);

  const stats: PottyStatistics = calculateStatistics(logs, dog.targetIntervalHours);
  const dailyTrends = getDailyTrendsLast7Days(logs);

  // Location counts for Lucky
  const locationCounts: Record<PottyLocation, number> = {
    Walk: logs.filter((l) => l.location === 'Walk').length,
    Terrace: logs.filter((l) => l.location === 'Terrace').length,
    Park: logs.filter((l) => l.location === 'Park').length,
    Indoors: logs.filter((l) => l.location === 'Indoors' || l.isAccident).length,
  };

  // Find max value in hourly distribution for proper scaling
  const maxHourlyCount = Math.max(
    1,
    ...stats.timeOfDayData.map((d) => {
      if (metricTab === 'pee') return d.peecount;
      if (metricTab === 'poop') return d.poopcount;
      if (metricTab === 'meal') return d.mealcount;
      return d.total;
    })
  );

  const totalTimeOfDay =
    stats.timeOfDayBuckets.morning +
    stats.timeOfDayBuckets.afternoon +
    stats.timeOfDayBuckets.evening +
    stats.timeOfDayBuckets.night;

  // Fetch AI-assisted Potty Training Coach summary
  const fetchAICoach = useCallback(async () => {
    setIsCoachLoading(true);

    const lastPeeLog = logs.find((l) => l.type === 'pee' || l.type === 'both');
    const lastPoopLog = logs.find((l) => l.type === 'poop' || l.type === 'both');

    try {
      const res = await fetch('/api/ai/potty-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dogName: dog.name,
          breed: dog.breed,
          isPuppy: dog.isPuppy,
          targetIntervalHours: dog.targetIntervalHours,
          totalLogs: stats.totalLogs,
          totalPees: stats.totalPees,
          totalPoops: stats.totalPoops,
          totalMeals: stats.totalMeals,
          totalAccidents: stats.totalAccidents,
          outdoorSuccessRate: stats.outdoorSuccessRate,
          avgHoldTimeHours: stats.avgHoldTimeHours,
          avgMinutesToPoopAfterMeal: stats.avgMinutesToPoopAfterMeal,
          locationBreakdown: locationCounts,
          timeOfDayBuckets: stats.timeOfDayBuckets,
          lastPeeAgo: formatTimeAgo(lastPeeLog?.timestamp ?? null),
          lastPoopAgo: formatTimeAgo(lastPoopLog?.timestamp ?? null),
          lastMealAgo: formatTimeAgo(stats.lastMealTimestamp),
        }),
      });

      if (!res.ok) {
        throw new Error('Coach service temporarily unavailable');
      }

      const data = await res.json();
      if (data.success && data.insights) {
        setCoachData(data.insights);
      } else {
        throw new Error(data.error || 'Could not parse insights');
      }
    } catch {
      // Graceful local heuristic fallback
      setCoachData({
        summary: `${dog.name} has logged ${stats.totalLogs} events with an outdoor clean hold rate of ${stats.outdoorSuccessRate}%. Holding interval averages ${stats.avgHoldTimeHours} hours${
          stats.avgMinutesToPoopAfterMeal ? `, and elimination occurs ~${stats.avgMinutesToPoopAfterMeal}m after meals` : ''
        }.`,
        keyPattern: `${
          stats.avgMinutesToPoopAfterMeal
            ? `Post-meal gastrocolic reflex occurs consistently around ${stats.avgMinutesToPoopAfterMeal} minutes after feeding.`
            : `Outings on ${locationCounts.Walk >= locationCounts.Terrace ? 'Walks' : 'the Terrace'} show great consistency.`
        }`,
        tips: [
          stats.avgMinutesToPoopAfterMeal
            ? `Take ${dog.name} out around ${stats.avgMinutesToPoopAfterMeal}m after each meal to capture their natural digestive rhythm.`
            : `Proactively schedule an outing 30-45m after meals to support natural digestion.`,
          `Reward ${dog.name} with enthusiastic praise immediately when eliminating on Walks or Terrace.`,
          `Keep regular feeding schedules so morning and evening bowel movements stay predictable.`,
        ],
        recommendedNextStep: stats.predictedNextPottyTimestamp
          ? `Plan next outing around ${formatClockTime(stats.predictedNextPottyTimestamp)}.`
          : 'Plan an outing within the next 2-3 hours.',
        statusMood: stats.outdoorSuccessRate >= 90 ? 'excellent' : 'steady',
      });
    } finally {
      setIsCoachLoading(false);
    }
  }, [dog, logs, stats, locationCounts]);

  // Initial load of AI coach
  useEffect(() => {
    fetchAICoach();
  }, [dog.id, logs.length]); // Refresh when new logs arrive or dog changes

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-3 flex flex-col gap-4">
      {/* AI-ASSISTED COACH SECTION AT THE TOP */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-lg shadow-slate-900/20 border border-slate-800 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block leading-tight">
                AI Potty Coach
              </span>
              <span className="text-[10px] text-slate-400 block">Personalized for {dog.name}</span>
            </div>
          </div>

          <button
            onClick={() => {
              haptics.triggerTick();
              fetchAICoach();
            }}
            disabled={isCoachLoading}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/15 active:scale-95 disabled:opacity-50 text-slate-200 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-all"
            title="Refresh AI Analysis"
          >
            <RefreshCw className={`w-3 h-3 ${isCoachLoading ? 'animate-spin' : ''}`} />
            <span>{isCoachLoading ? 'Analyzing...' : 'Refresh'}</span>
          </button>
        </div>

        {isCoachLoading && !coachData ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2">
            <Bot className="w-8 h-8 text-amber-400 animate-pulse" />
            <p className="text-xs text-slate-300">Analyzing {dog.name}&apos;s feeding &amp; potty patterns...</p>
          </div>
        ) : coachData ? (
          <div className="space-y-3.5">
            <p className="text-sm font-medium text-slate-100 leading-relaxed">
              {coachData.summary}
            </p>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Pattern Spotted</span>
                </span>
                <p className="text-slate-200 text-[11px] leading-relaxed">{coachData.keyPattern}</p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Recommended Next Step</span>
                </span>
                <p className="text-amber-100 text-[11px] font-medium leading-relaxed">
                  {coachData.recommendedNextStep}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <span className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Coach Action Tips</span>
              </span>
              <div className="space-y-1.5">
                {coachData.tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-200 bg-white/5 p-2.5 rounded-xl border border-white/5"
                  >
                    <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] leading-snug">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* FEEDING & POTTY CORRELATION STATISTIC (EXPLICIT USER COMPARISON) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span className="text-base leading-none">🥣</span>
            <span>Feeding vs. Potty Correlation</span>
          </h3>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
            {stats.totalMeals} meals logged
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mb-3">
          Compares meal intake with digestion timing to pinpoint post-meal walk windows
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-900 block mb-0.5">
              Avg Poop Delay After Meal
            </span>
            <p className="text-2xl font-extrabold text-emerald-950 tabular-nums">
              {stats.avgMinutesToPoopAfterMeal ? `${stats.avgMinutesToPoopAfterMeal}m` : '—'}
            </p>
            <span className="text-[10px] text-emerald-700 block mt-0.5 font-medium leading-tight">
              {stats.avgMinutesToPoopAfterMeal
                ? `Lucky typically eliminates ~${stats.avgMinutesToPoopAfterMeal} mins after eating`
                : 'Needs at least 1 recorded meal & poop pair'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-700 block mb-0.5">
              Daily Feeding Pace
            </span>
            <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {stats.avgMealsPerDay}
            </p>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-medium leading-tight">
              meals / day recorded
            </span>
          </div>
        </div>

        {stats.lastMealTimestamp && (
          <div className="mt-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Last meal recorded:</span>
            <strong className="text-slate-900 tabular-nums">
              {formatTimeAgo(stats.lastMealTimestamp)} (at {formatClockTime(stats.lastMealTimestamp)})
            </strong>
          </div>
        )}
      </div>

      {/* 7-DAY POTTY & MEALS EVENTS BAR CHART (RECHARTS) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-amber-600" />
              <span>Last 7 Days Activity</span>
            </h3>
            <p className="text-[11px] text-slate-500">Compare meals against potty events</p>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 flex-wrap justify-end">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Pee</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-700" />
              <span>Poop</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Meal</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Indoors</span>
            </span>
          </div>
        </div>

        {/* Recharts Bar Chart Container */}
        <div className="w-full h-52 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dailyTrends}
              margin={{ top: 8, right: 8, left: -20, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="dayName"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-lg border border-slate-800">
                        <p className="font-bold text-slate-100">
                          {data.dayName} · {data.shortDate}
                        </p>
                        <div className="space-y-0.5 mt-1 text-[11px] tabular-nums">
                          <p className="text-amber-400">💧 {data.pees} Pees</p>
                          <p className="text-amber-200">💩 {data.poops} Poops</p>
                          {data.meals > 0 && (
                            <p className="text-emerald-400">🥣 {data.meals} Meals</p>
                          )}
                          {data.accidents > 0 && (
                            <p className="text-rose-400">⚠️ {data.accidents} Indoors (Accident)</p>
                          )}
                          <p className="text-slate-400 font-semibold border-t border-slate-800 pt-0.5 mt-0.5">
                            Total: {data.total} events
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="pees" name="Pee" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="poops" name="Poop" stackId="a" fill="#78350f" radius={[0, 0, 0, 0]} />
              <Bar dataKey="meals" name="Meals" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar
                dataKey="accidents"
                name="Indoors (Accident)"
                stackId="a"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 7-Day Quick Metric Strip */}
        <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100 text-center">
          <div className="p-2 rounded-xl bg-slate-50">
            <span className="text-[10px] text-slate-500 block">7-Day Total</span>
            <span className="text-xs font-bold text-slate-800 tabular-nums">
              {dailyTrends.reduce((sum, d) => sum + d.total, 0)} events
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50">
            <span className="text-[10px] text-slate-500 block">Daily Average</span>
            <span className="text-xs font-bold text-slate-800 tabular-nums">
              {(dailyTrends.reduce((sum, d) => sum + d.total, 0) / 7).toFixed(1)} / day
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50">
            <span className="text-[10px] text-slate-500 block">Today&apos;s Logs</span>
            <span className="text-xs font-bold text-slate-800 tabular-nums">
              {dailyTrends.find((d) => d.isToday)?.total ?? 0} events
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Pees / Day */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <Droplets className="w-3.5 h-3.5 text-amber-600" />
            <span>Avg Pees / Day</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {stats.avgPeesPerDay}
          </p>
          <span className="text-[11px] text-slate-500">
            {stats.totalPees} total recorded
          </span>
        </div>

        {/* Poops / Day */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <span className="text-xs">💩</span>
            <span>Avg Poops / Day</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {stats.avgPoopsPerDay}
          </p>
          <span className="text-[11px] text-slate-500">
            {stats.totalPoops} total recorded
          </span>
        </div>

        {/* Average Hold Interval */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Avg Hold Time</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {stats.avgHoldTimeHours}h
          </p>
          <span className="text-[11px] text-slate-500">
            Target: {dog.targetIntervalHours}h
          </span>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Outdoor Success</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {stats.outdoorSuccessRate}%
          </p>
          <span className="text-[11px] text-slate-500">
            {stats.totalAccidents > 0 ? `${stats.totalAccidents} indoor accidents` : 'Zero accidents!'}
          </span>
        </div>
      </div>

      {/* TIME OF DAY DISTRIBUTION (THE CORE STATISTIC) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>Time of Day Frequency</span>
            </h3>
            <p className="text-[11px] text-slate-500">Compare potty hours with feeding times</p>
          </div>

          {/* Filter segment tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'pee', label: 'Pee' },
                { id: 'poop', label: 'Poop' },
                { id: 'meal', label: 'Meal' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  haptics.triggerTick();
                  setMetricTab(tab.id);
                }}
                className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                  metricTab === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 24-Hour Histogram Chart */}
        <div className="pt-2">
          <div className="h-32 flex items-end gap-1 px-1 border-b border-slate-200">
            {stats.timeOfDayData.map((d) => {
              const count =
                metricTab === 'pee'
                  ? d.peecount
                  : metricTab === 'poop'
                  ? d.poopcount
                  : metricTab === 'meal'
                  ? d.mealcount
                  : d.total;
              const heightPct = count > 0 ? Math.max(12, Math.round((count / maxHourlyCount) * 100)) : 4;
              const isSelected = selectedHour === d.hour;

              return (
                <button
                  key={d.hour}
                  onClick={() => {
                    haptics.triggerTick();
                    setSelectedHour(isSelected ? null : d.hour);
                  }}
                  title={`${d.label}: ${d.peecount} pees, ${d.poopcount} poops, ${d.mealcount} meals`}
                  className="flex-1 flex flex-col items-center justify-end h-full group focus:outline-hidden"
                >
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-sm transition-all duration-200 ${
                      isSelected
                        ? 'bg-amber-600 ring-2 ring-amber-400'
                        : count > 0
                        ? metricTab === 'meal'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : metricTab === 'poop'
                          ? 'bg-stone-700 hover:bg-stone-800'
                          : 'bg-amber-500 hover:bg-amber-600'
                        : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Hour labels (Every 3 hours) */}
          <div className="flex justify-between text-[10px] text-slate-600 pt-1.5 px-0.5 tabular-nums font-medium">
            <span>12 AM</span>
            <span>3 AM</span>
            <span>6 AM</span>
            <span>9 AM</span>
            <span>12 PM</span>
            <span>3 PM</span>
            <span>6 PM</span>
            <span>9 PM</span>
          </div>

          {/* Interactive hour detail chip */}
          {selectedHour !== null && (
            <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs">
              <span className="font-bold text-amber-950">
                {stats.timeOfDayData[selectedHour].label} window
              </span>
              <div className="flex items-center gap-2.5 text-amber-900 font-semibold tabular-nums text-[11px]">
                <span>💧 {stats.timeOfDayData[selectedHour].peecount} pees</span>
                <span>💩 {stats.timeOfDayData[selectedHour].poopcount} poops</span>
                <span>🥣 {stats.timeOfDayData[selectedHour].mealcount} meals</span>
              </div>
            </div>
          )}
        </div>

        {/* 4-Period Day Part Breakdown */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100">
          <div className="text-center p-2 rounded-xl bg-slate-50">
            <Sunrise className="w-4 h-4 mx-auto text-amber-500 mb-1" />
            <span className="text-[11px] font-medium text-slate-500 block">Morning</span>
            <span className="text-xs font-bold text-slate-800 tabular-nums">
              {stats.timeOfDayBuckets.morning}
            </span>
            <span className="text-[10px] text-slate-600 block tabular-nums">
              {totalTimeOfDay > 0 ? Math.round((stats.timeOfDayBuckets.morning / totalTimeOfDay) * 100) : 0}%
            </span>
          </div>

          <div className="text-center p-2 rounded-xl bg-slate-50">
            <Sun className="w-4 h-4 mx-auto text-amber-600 mb-1" />
            <span className="text-[11px] font-medium text-slate-500 block">Afternoon</span>
            <span className="text-xs font-bold text-slate-800 tabular-nums">
              {stats.timeOfDayBuckets.afternoon}
            </span>
            <span className="text-[10px] text-slate-600 block tabular-nums">
              {totalTimeOfDay > 0 ? Math.round((stats.timeOfDayBuckets.afternoon / totalTimeOfDay) * 100) : 0}%
            </span>
          </div>

          <div className="text-center p-2 rounded-xl bg-slate-50">
            <Sunset className="w-4 h-4 mx-auto text-orange-600 mb-1" />
            <span className="text-[11px] font-medium text-slate-500 block">Evening</span>
            <span className="text-xs font-bold text-slate-800 tabular-nums">
              {stats.timeOfDayBuckets.evening}
            </span>
            <span className="text-[10px] text-slate-600 block tabular-nums">
              {totalTimeOfDay > 0 ? Math.round((stats.timeOfDayBuckets.evening / totalTimeOfDay) * 100) : 0}%
            </span>
          </div>

          <div className="text-center p-2 rounded-xl bg-slate-50">
            <Moon className="w-4 h-4 mx-auto text-indigo-500 mb-1" />
            <span className="text-[11px] font-medium text-slate-500 block">Night</span>
            <span className="text-xs font-bold text-slate-800 tabular-nums">
              {stats.timeOfDayBuckets.night}
            </span>
            <span className="text-[10px] text-slate-600 block tabular-nums">
              {totalTimeOfDay > 0 ? Math.round((stats.timeOfDayBuckets.night / totalTimeOfDay) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Location Breakdown (Walk, Terrace, Park, Indoors) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-1">
          <MapPin className="w-4 h-4 text-amber-600" />
          <span>Location Distribution</span>
        </h3>
        <p className="text-[11px] text-slate-500 mb-3">
          Breakdown across {logs.length} logged events for {dog.name}
        </p>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-100">
            <span className="text-xs font-bold text-amber-900 block">Walk</span>
            <span className="text-base font-extrabold text-amber-800 tabular-nums">
              {locationCounts.Walk}
            </span>
            <span className="text-[10px] text-amber-700 block mt-0.5 tabular-nums">
              {logs.length > 0 ? Math.round((locationCounts.Walk / logs.length) * 100) : 0}%
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-sky-50 border border-sky-100">
            <span className="text-xs font-bold text-sky-900 block">Terrace</span>
            <span className="text-base font-extrabold text-sky-800 tabular-nums">
              {locationCounts.Terrace}
            </span>
            <span className="text-[10px] text-sky-700 block mt-0.5 tabular-nums">
              {logs.length > 0 ? Math.round((locationCounts.Terrace / logs.length) * 100) : 0}%
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100">
            <span className="text-xs font-bold text-emerald-900 block">Park</span>
            <span className="text-base font-extrabold text-emerald-800 tabular-nums">
              {locationCounts.Park}
            </span>
            <span className="text-[10px] text-emerald-700 block mt-0.5 tabular-nums">
              {logs.length > 0 ? Math.round((locationCounts.Park / logs.length) * 100) : 0}%
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-100">
            <span className="text-xs font-bold text-rose-900 block">Indoors</span>
            <span className="text-base font-extrabold text-rose-800 tabular-nums">
              {locationCounts.Indoors}
            </span>
            <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
              Accidents
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
