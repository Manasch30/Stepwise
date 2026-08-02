'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cpu,
  Table2,
  Languages,
  Dumbbell,
  Code,
  BarChart3,
  MapPin,
  Trophy,
  X,
  Zap,
  Flame,
  Layers,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import { createClient } from '@/lib/supabase/client';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { userStats, getOverallProgress } = useStepwiseStore();
  const overallProgress = getOverallProgress();
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
    onClose();
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, badge: null, color: 'text-blue-400' },
    { name: 'GATE CS & DA', href: '/gate', icon: Cpu, badge: 'Dual Track', color: 'text-indigo-400' },
    { name: 'Revision Matrix', href: '/revision-matrix', icon: Table2, badge: 'Checklist', color: 'text-emerald-400' },
    { name: 'Japanese (N5-N3)', href: '/japanese', icon: Languages, badge: 'Media', color: 'text-rose-400' },
    { name: 'Fitness & Strength', href: '/fitness', icon: Dumbbell, badge: 'PR Logs', color: 'text-amber-400' },
    { name: 'Projects & Lab', href: '/projects', icon: Code, badge: 'Stack', color: 'text-cyan-400' },
    { name: 'Analytics & Heatmap', href: '/analytics', icon: BarChart3, badge: 'Derived', color: 'text-purple-400' },
    { name: 'Roadmap', href: '/roadmap', icon: MapPin, badge: 'Timeline', color: 'text-yellow-400' },
    { name: 'Achievements', href: '/achievements', icon: Trophy, badge: 'XP Tree', color: 'text-pink-400' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Animated Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Animated Sliding Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-4/5 max-w-xs h-full bg-zinc-950/95 border-r border-white/10 p-5 flex flex-col justify-between z-10 shadow-2xl overflow-y-auto"
          >
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-white tracking-wider">
                      STEPWISE OS
                    </h2>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                      Navigation Menu
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Account / Auth Card */}
              <div className="p-3 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Lvl {userStats.level} ({userStats.xp} XP)</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
                    <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                    <span>{userStats.streak}d</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  {userEmail ? (
                    <>
                      <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[170px]" title={userEmail}>
                        {userEmail}
                      </span>
                      <button
                        onClick={handleSignOut}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Out</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Sign In / Register</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 px-2 mb-2">
                  System Modules
                </p>
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-inner'
                          : 'text-zinc-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : item.color}`} />
                        <span>{item.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="text-[9px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-white/10 font-mono">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Footer Progress Metric */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-400">Overall System</span>
                <span className="text-blue-400 font-mono">{overallProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
