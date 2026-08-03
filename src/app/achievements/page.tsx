'use client';

import React, { useMemo } from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import { Trophy, Zap, Award, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AchievementsPage() {
  const userStats = useStepwiseStore((s) => s.userStats);
  const achievements = useStepwiseStore((s) => s.achievements);

  const xpRules = useMemo(
    () => [
      { action: '1 Study Hour', xp: '+10 XP' },
      { action: 'Complete PDF / Book', xp: '+40 XP' },
      { action: 'Gym Workout Session', xp: '+25 XP' },
      { action: 'Weekly Reflection Review', xp: '+75 XP' },
      { action: 'Finish Entire Subject', xp: '+300 XP' },
      { action: 'Finish Major Goal Track', xp: '+1000 XP' },
    ],
    []
  );

  const unlockedCount = useMemo(
    () => (achievements || []).filter((a) => a.unlocked).length,
    [achievements]
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          XP System & Achievements
          <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase">
            Gamified Progression
          </span>
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          Every action logged in STEPWISE awards XP and unlocks persistent achievements.
        </p>
      </div>

      {/* User Level Card */}
      <div className="p-6 rounded-3xl glass-panel border border-amber-500/20 bg-gradient-to-r from-amber-950/20 via-zinc-900 to-zinc-950 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-zinc-950 shadow-xl shadow-amber-500/30">
              <Trophy className="w-8 h-8 fill-current" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Active Level</div>
              <h3 className="text-3xl font-black text-white">Level {userStats.level} Scholar</h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{userStats.xp} Total XP Accumulated</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Theme Unlocked: Glass Midnight</span>
          </div>
        </div>
      </div>

      {/* XP Earning Rules */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          XP Rewards Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {xpRules.map((rule) => (
            <div key={rule.action} className="p-3.5 rounded-2xl glass-card border border-white/5 space-y-1">
              <div className="text-xs text-zinc-400 font-semibold">{rule.action}</div>
              <div className="text-lg font-black text-amber-400 font-mono">{rule.xp}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Badges Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          Trophy Cabinet ({unlockedCount} / {achievements.length} Unlocked)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-5 rounded-3xl border transition-all flex items-start justify-between ${
                ach.unlocked
                  ? 'glass-card border-amber-500/30 bg-amber-950/10'
                  : 'bg-zinc-900/40 border-white/5 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {ach.unlocked ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      UNLOCKED (+{ach.xp} XP)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      LOCKED ({ach.xp} XP)
                    </span>
                  )}
                </div>
                <h4 className="text-base font-extrabold text-white">{ach.title}</h4>
                <p className="text-xs text-zinc-400">{ach.description}</p>
              </div>

              {ach.unlocked ? (
                <CheckCircle2 className="w-6 h-6 text-amber-400 shrink-0" />
              ) : (
                <Lock className="w-5 h-5 text-zinc-600 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
