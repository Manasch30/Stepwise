'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import { Goal } from '@/types';
import { motion } from 'framer-motion';
import {
  Cpu,
  Languages,
  Flame,
  Clock,
  Activity,
  ArrowUpRight,
  Sparkles,
  Zap,
  Plus,
  Edit2,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { GoalModal } from '@/components/common/GoalModal';

export default function DashboardPage() {
  const userStats = useStepwiseStore((s) => s.userStats);
  const goals = useStepwiseStore((s) => s.goals);
  const subjects = useStepwiseStore((s) => s.subjects);
  const lectureLogs = useStepwiseStore((s) => s.lectureLogs);
  const recentEvents = useStepwiseStore((s) => s.recentEvents);
  const getOverallProgress = useStepwiseStore((s) => s.getOverallProgress);
  const getTrackProgress = useStepwiseStore((s) => s.getTrackProgress);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const { overallProgress, totalStudyHours, gateCsProgress, japaneseProgress } = useMemo(() => {
    const overall = getOverallProgress();
    const totalHours = (lectureLogs || []).reduce((acc, log) => acc + log.hours, 0);
    const csProg = getTrackProgress('GATE CS');
    const jpProg = getTrackProgress('Japanese');

    return {
      overallProgress: overall,
      totalStudyHours: totalHours,
      gateCsProgress: csProg,
      japaneseProgress: jpProg,
    };
  }, [lectureLogs, getOverallProgress, getTrackProgress]);

  const handleOpenNewGoal = useCallback(() => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  }, []);

  const handleOpenEditGoal = useCallback((goal: Goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Dashboard
            <Sparkles className="w-6 h-6 text-amber-400 animate-spin-slow" />
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Event-driven progression operating system. Everything derived from logged work.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenNewGoal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-blue-500/50 text-blue-400 text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Goal</span>
          </button>

          <div className="px-4 py-2 rounded-2xl glass-card border border-white/10 flex items-center gap-3">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <div>
              <div className="text-[10px] uppercase font-bold text-zinc-400">Current Streak</div>
              <div className="text-sm font-extrabold text-white">{userStats.streak} Days Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Progress */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-3xl glass-card border border-blue-500/20 bg-gradient-to-b from-blue-950/20 to-zinc-900/60 relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Overall System</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{overallProgress}%</div>
            <div className="w-full h-2 bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-400 mt-2">Weighted across GATE, Japanese & Projects</p>
          </div>
        </motion.div>

        {/* Study Hours Total */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-3xl glass-card border border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 to-zinc-900/60 relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Study Hours</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{totalStudyHours.toFixed(1)} hrs</div>
            <p className="text-[11px] text-indigo-300 font-medium mt-2">
              +{lectureLogs.length * 10} XP earned from study sessions
            </p>
          </div>
        </motion.div>

        {/* GATE CS Track */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-3xl glass-card border border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-zinc-900/60 relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">GATE CS 2027</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{gateCsProgress}%</div>
            <div className="w-full h-2 bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700"
                style={{ width: `${gateCsProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-400 mt-2">11 Core Subjects Tracked</p>
          </div>
        </motion.div>

        {/* Japanese N5-N3 */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-3xl glass-card border border-pink-500/20 bg-gradient-to-b from-pink-950/20 to-zinc-900/60 relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Japanese N5-N3</span>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Languages className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{japaneseProgress}%</div>
            <div className="w-full h-2 bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-700"
                style={{ width: `${japaneseProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-400 mt-2">Derived from completed resources</p>
          </div>
        </motion.div>
      </div>

      {/* Dynamic Managed Goals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Managed System & Custom Goals ({goals.length})
          </h3>
          <button
            onClick={handleOpenNewGoal}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Goal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="p-4 rounded-2xl glass-card border border-white/10 space-y-3 relative group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: goal.color || '#3b82f6' }}
                  />
                  <span className="text-xs font-extrabold text-white">{goal.title}</span>
                </div>
                <button
                  onClick={() => handleOpenEditGoal(goal)}
                  className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  title="Edit Goal"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Current: {goal.current}</span>
                  <span>Target: {goal.target}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, (goal.current / goal.target) * 100))}%`,
                      backgroundColor: goal.color || '#3b82f6',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mid Section: Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Active Subjects
            </h3>
            <Link
              href="/gate"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>View All GATE Tracks</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subjects.slice(0, 4).map((sub) => {
              const subProgress = sub.hours_target > 0 ? Math.round((sub.hours_completed / sub.hours_target) * 100) : 0;
              return (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl glass-card border border-white/10 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">
                      {sub.track}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-300">
                      {sub.checkpoint}% Checkpoint
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">{sub.title}</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                      <span>{sub.hours_completed} hrs done</span>
                      <span>Target: {sub.hours_target} hrs</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${subProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Stream */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
              Event Bus Stream
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live Feed
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {recentEvents.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-400">
                No events recorded yet. Click <strong>+ Log Session</strong> to fire an event!
              </div>
            ) : (
              recentEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-zinc-900/70 border border-white/5 space-y-1 hover:border-white/20 transition-all"
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-indigo-400 font-mono">{evt.type}</span>
                    <span className="text-amber-400 font-bold">+{evt.xpEarned} XP</span>
                  </div>
                  <p className="text-xs text-zinc-200 font-medium">{evt.description}</p>
                  <div className="text-[9px] text-zinc-400 font-mono">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Goal Edit/Create Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        editingGoal={editingGoal}
      />
    </div>
  );
}
