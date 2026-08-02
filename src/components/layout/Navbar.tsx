'use client';

import React, { useEffect, useState } from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import { Flame, Zap, Plus, RefreshCw, Layers, Menu, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface NavbarProps {
  onOpenQuickAdd: () => void;
  onOpenMobileDrawer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickAdd, onOpenMobileDrawer }) => {
  const { userStats, resetToDefaults } = useStepwiseStore();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUserEmail(session?.user?.email || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const xpForCurrentLevel = (userStats.level - 1) * 300;
  const xpForNextLevel = userStats.level * 300;
  const currentLevelProgress = Math.min(
    100,
    Math.max(0, ((userStats.xp - xpForCurrentLevel) / 300) * 100)
  );

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-3 md:px-8 py-2.5">
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-2">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {onOpenMobileDrawer && (
            <button
              onClick={onOpenMobileDrawer}
              className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white transition-colors"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-blue-400" />
            </button>
          )}

          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Layers className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base md:text-lg tracking-wider text-white flex items-center gap-1.5">
              STEPWISE
              <span className="hidden md:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v1.0 OS
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400 hidden md:block">Progression Tracker & Operating System</p>
          </div>
        </div>

        {/* Level, XP & Streak Counter */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {/* Streak Badge */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1 md:gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400"
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            <span className="text-xs font-bold whitespace-nowrap">
              {userStats.streak}<span className="hidden sm:inline"> Day Streak</span><span className="sm:hidden">d</span>
            </span>
          </motion.div>

          {/* Level & XP */}
          <div className="flex items-center gap-2 md:gap-3 bg-zinc-900/80 border border-white/10 px-2.5 md:px-3.5 py-1.5 rounded-xl">
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 whitespace-nowrap">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Lvl {userStats.level}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="hidden sm:block w-20 md:w-28 space-y-1">
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
            className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-xs shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all"
            title="Log Session"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline font-semibold">Log Session</span>
          </motion.button>

          {/* User Auth Profile & Sign Out */}
          {userEmail ? (
            <button
              onClick={handleSignOut}
              title={`Signed in as ${userEmail}. Click to Sign Out`}
              className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 text-xs font-bold hover:bg-white/5 transition-all"
            >
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Reset button helper */}
          <button
            onClick={() => {
              if (confirm('Reset to default seed logs?')) {
                resetToDefaults();
              }
            }}
            title="Reset data to defaults"
            className="hidden sm:block p-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
