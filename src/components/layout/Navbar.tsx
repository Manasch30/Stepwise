'use client';

import React from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import { Flame, Zap, Plus, RefreshCw, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavbarProps {
  onOpenQuickAdd: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickAdd }) => {
  const { userStats, resetToDefaults } = useStepwiseStore();

  const xpForCurrentLevel = (userStats.level - 1) * 300;
  const xpForNextLevel = userStats.level * 300;
  const currentLevelProgress = Math.min(
    100,
    Math.max(0, ((userStats.xp - xpForCurrentLevel) / 300) * 100)
  );

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 md:px-8 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wider text-white flex items-center gap-2">
              STEPWISE
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v1.0 OS
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400 hidden sm:block">Progression Tracker & Operating System</p>
          </div>
        </div>

        {/* Level, XP & Streak Counter */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Streak */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400"
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
            <span className="text-xs font-bold">{userStats.streak} Day Streak</span>
          </motion.div>

          {/* Level & XP */}
          <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/10 px-3.5 py-1.5 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Lvl {userStats.level}</span>
            </div>
            <div className="w-20 sm:w-28 space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>{userStats.xp} XP</span>
                <span>{xpForNextLevel}</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500 ease-out"
                  style={{ width: `${currentLevelProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Add Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-xs shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Log Session</span>
          </motion.button>

          {/* Reset button helper */}
          <button
            onClick={() => {
              if (confirm('Reset to default seed logs?')) {
                resetToDefaults();
              }
            }}
            title="Reset data to defaults"
            className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
