'use client';

import React from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Clock,
  Zap,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function AnalyticsPage() {
  const { lectureLogs, subjects, japaneseResources, deleteLectureLog } = useStepwiseStore();

  // Helper to format Date string as YYYY-MM-DD
  const formatDateStr = (date: Date) => date.toISOString().split('T')[0];

  // Map of date string -> total study hours logged
  const dailyHoursMap: Record<string, { gate: number; japanese: number; total: number }> = {};

  lectureLogs.forEach((log) => {
    const d = log.date;
    if (!dailyHoursMap[d]) {
      dailyHoursMap[d] = { gate: 0, japanese: 0, total: 0 };
    }
    const sub = subjects.find((s) => s.id === log.subject_id);
    if (sub?.track === 'Japanese') {
      dailyHoursMap[d].japanese += log.hours;
    } else {
      dailyHoursMap[d].gate += log.hours;
    }
    dailyHoursMap[d].total += log.hours;
  });

  // Generate 91 days (13 weeks) for Heatmap Grid
  const today = new Date();
  const heatmapDays = Array.from({ length: 91 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (90 - i));
    const dateStr = formatDateStr(d);
    const dayData = dailyHoursMap[dateStr] || { gate: 0, japanese: 0, total: 0 };

    let intensity = 0;
    if (dayData.total > 0 && dayData.total < 2) intensity = 1;
    else if (dayData.total >= 2 && dayData.total < 4) intensity = 2;
    else if (dayData.total >= 4 && dayData.total < 6) intensity = 3;
    else if (dayData.total >= 6) intensity = 4;

    return {
      dateStr,
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: dayData.total,
      intensity,
    };
  });

  // Calculate Weekly Data for Mon-Sun of current week
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDayIndex = (today.getDay() + 6) % 7; // Mon=0, Sun=6
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDayIndex);

  const weeklyData = daysOfWeek.map((dayName, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = formatDateStr(d);
    const data = dailyHoursMap[dateStr] || { gate: 0, japanese: 0, total: 0 };
    return {
      day: dayName,
      hours: data.total,
      gate: data.gate,
      japanese: data.japanese,
    };
  });

  // Rolling Average Daily Hours over last 7 days
  const last7DaysTotal = heatmapDays.slice(-7).reduce((acc, d) => acc + d.hours, 0);
  const avgDailyHours = Number((last7DaysTotal / 7).toFixed(1));

  // Velocity prediction
  const remainingGateHours = subjects.reduce((acc, s) => acc + (s.hours_target - s.hours_completed), 0);
  
  let estimatedCompletionDate = 'December 2026';
  let daysToComplete: number | string = 'N/A';

  if (avgDailyHours > 0) {
    const days = Math.ceil(remainingGateHours / avgDailyHours);
    daysToComplete = days;
    estimatedCompletionDate = new Date(Date.now() + days * 86400000).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          Analytics & Insights
          <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">
            Derived Data
          </span>
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          GitHub-style contribution heatmap and automated study velocity prediction.
        </p>
      </div>

      {/* GitHub Style Heatmap Card */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-extrabold text-white">Study Contribution Heatmap</h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Last 90 Days</span>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-rows-7 grid-flow-col gap-1.5 w-max">
            {heatmapDays.map((day, i) => {
              const colorClass =
                day.intensity === 0
                  ? 'bg-zinc-900 border border-white/5'
                  : day.intensity === 1
                  ? 'bg-emerald-950 border border-emerald-800'
                  : day.intensity === 2
                  ? 'bg-emerald-700'
                  : day.intensity === 3
                  ? 'bg-emerald-500'
                  : 'bg-emerald-400 shadow-md shadow-emerald-500/50';

              return (
                <div
                  key={i}
                  title={`${day.displayDate}: ${day.hours > 0 ? `${day.hours} hrs logged` : 'No study logged'}`}
                  className={`w-3.5 h-3.5 rounded-sm ${colorClass} transition-all hover:scale-125 cursor-pointer`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono pt-2 border-t border-white/5">
          <span>Less study</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-900 border border-white/5" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-950" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-700" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
          </div>
          <span>More study</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Study Trend */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Weekly Study Hours Breakdown
            </h3>
            <span className="text-xs text-blue-400 font-mono font-bold">
              Avg {avgDailyHours} hrs/day
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181825',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="gate" name="GATE CS/DA" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="japanese" name="Japanese" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goal Prediction Engine */}
        <div className="p-6 rounded-3xl glass-card border border-purple-500/20 bg-purple-950/10 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              Velocity Prediction Engine
            </div>
            <h3 className="text-xl font-black text-white mt-2">GATE Completion Target</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Derived dynamically based on rolling 7-day study velocity ({avgDailyHours} hrs/day).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-2">
            <div className="text-[10px] text-zinc-400 uppercase font-bold">Estimated Completion</div>
            <div className="text-2xl font-extrabold text-purple-300">{estimatedCompletionDate}</div>
            <div className="text-[11px] text-zinc-400">
              {avgDailyHours > 0 ? `${daysToComplete} days remaining` : 'Log sessions to calculate velocity'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-2">
            <div className="text-[10px] text-zinc-400 uppercase font-bold">Remaining Target Hours</div>
            <div className="text-xl font-bold text-white">{remainingGateHours} Hours</div>
          </div>
        </div>
      </div>

      {/* Logged Study Sessions History & Deletion */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Logged Study Session History
          </h3>
          <span className="text-xs text-zinc-400 font-mono">
            {lectureLogs.length} total logged sessions
          </span>
        </div>

        {lectureLogs.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs font-mono">
            No study sessions logged yet. Log hours from GATE CS/DA to see history.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lectureLogs.slice(0, 12).map((log) => {
              const sub = subjects.find((s) => s.id === log.subject_id);
              const subTitle = sub ? sub.title : log.subject_id;
              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/5 flex items-center justify-between hover:border-white/20 transition-all group"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-extrabold text-white truncate max-w-[200px]">
                      {subTitle}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                      <span className="text-emerald-400 font-bold">+{log.hours} hrs</span>
                      <span>•</span>
                      <span>{log.date}</span>
                    </div>
                    {log.remarks && (
                      <div className="text-[11px] text-zinc-400 italic truncate max-w-[200px]">
                        &quot;{log.remarks}&quot;
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteLectureLog(log.id)}
                    title="Delete session & deduct XP"
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all opacity-80 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
