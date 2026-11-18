import React from 'react';
import { CalendarDays } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { DailyPottyTrend } from '@/utils/stats';
import { Card } from '@/components/ui/card';

interface WeeklyActivityChartCardProps {
  dailyTrends: DailyPottyTrend[];
}

export const WeeklyActivityChartCard: React.FC<WeeklyActivityChartCardProps> = ({
  dailyTrends,
}) => {
  const totalEventsInWeek = dailyTrends.reduce((sum, dayTrend) => sum + dayTrend.total, 0);
  const todayTrend = dailyTrends.find((dayTrend) => dayTrend.isToday);

  return (
    <Card className="gap-0 p-4">
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

      <div className="w-full h-52 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyTrends} margin={{ top: 8, right: 8, left: -20, bottom: 4 }}>
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
                if (!active || !payload || !payload.length) return null;

                const dayTrend = payload[0].payload as DailyPottyTrend;

                return (
                  <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-lg border border-slate-800">
                    <p className="font-bold text-slate-100">
                      {dayTrend.dayName} · {dayTrend.shortDate}
                    </p>
                    <div className="space-y-0.5 mt-1 text-[11px] tabular-nums">
                      <p className="text-amber-400">💧 {dayTrend.pees} Pees</p>
                      <p className="text-amber-200">💩 {dayTrend.poops} Poops</p>
                      {dayTrend.meals > 0 && (
                        <p className="text-emerald-400">🥣 {dayTrend.meals} Meals</p>
                      )}
                      {dayTrend.accidents > 0 && (
                        <p className="text-rose-400">⚠️ {dayTrend.accidents} Indoors (Accident)</p>
                      )}
                      <p className="text-slate-400 font-semibold border-t border-slate-800 pt-0.5 mt-0.5">
                        Total: {dayTrend.total} events
                      </p>
                    </div>
                  </div>
                );
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

      <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100 text-center">
        <div className="p-2 rounded-xl bg-slate-50">
          <span className="text-[10px] text-slate-500 block">7-Day Total</span>
          <span className="text-xs font-bold text-slate-800 tabular-nums">
            {totalEventsInWeek} events
          </span>
        </div>
        <div className="p-2 rounded-xl bg-slate-50">
          <span className="text-[10px] text-slate-500 block">Daily Average</span>
          <span className="text-xs font-bold text-slate-800 tabular-nums">
            {(totalEventsInWeek / 7).toFixed(1)} / day
          </span>
        </div>
        <div className="p-2 rounded-xl bg-slate-50">
          <span className="text-[10px] text-slate-500 block">Today&apos;s Records</span>
          <span className="text-xs font-bold text-slate-800 tabular-nums">
            {todayTrend?.total ?? 0} events
          </span>
        </div>
      </div>
    </Card>
  );
};
