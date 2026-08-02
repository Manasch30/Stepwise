'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cpu,
  Languages,
  Dumbbell,
  BarChart3,
  MapPin,
  Trophy,
  Table2,
  Code,
} from 'lucide-react';
import { useStepwiseStore } from '@/store/useStepwiseStore';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const getOverallProgress = useStepwiseStore((s) => s.getOverallProgress);
  const overallProgress = getOverallProgress();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, badge: null },
    { name: 'GATE CS & DA', href: '/gate', icon: Cpu, badge: 'Dual Track' },
    { name: 'Revision Matrix', href: '/revision-matrix', icon: Table2, badge: 'CS, DA & Apt' },
    { name: 'Japanese (N5-N3)', href: '/japanese', icon: Languages, badge: 'PDF & Media' },
    { name: 'Fitness & Strength', href: '/fitness', icon: Dumbbell, badge: 'PR Logs' },
    { name: 'Projects & Lab', href: '/projects', icon: Code, badge: 'Lab & Stack' },
    { name: 'Analytics & Heatmap', href: '/analytics', icon: BarChart3, badge: 'Derived' },
    { name: 'Roadmap', href: '/roadmap', icon: MapPin, badge: 'Timeline' },
    { name: 'Achievements', href: '/achievements', icon: Trophy, badge: 'XP Tree' },
  ];

  return (
    <aside className="w-64 hidden lg:block shrink-0 p-4 border-r border-white/10 glass-panel min-h-[calc(100vh-61px)]">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold shadow-inner'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Derived Progress Widget */}
        <div className="p-3.5 rounded-2xl glass-card border border-white/10 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-300">Overall System Progress</span>
            <span className="font-extrabold text-blue-400">{overallProgress}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400">
            ⚡ Derived automatically from logs. No manual percent edits.
          </p>
        </div>
      </div>
    </aside>
  );
};
