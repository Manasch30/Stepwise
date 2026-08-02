'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cpu,
  Table2,
  Dumbbell,
  Code,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenDrawer }) => {
  const pathname = usePathname();

  const quickNav = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'GATE', href: '/gate', icon: Cpu },
    { name: 'Matrix', href: '/revision-matrix', icon: Table2 },
    { name: 'Fitness', href: '/fitness', icon: Dumbbell },
    { name: 'Projects', href: '/projects', icon: Code },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-zinc-950/90 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {quickNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400 scale-110' : 'text-zinc-400'}`} />
              <span className="text-[10px] mt-0.5 font-medium">{item.name}</span>
            </Link>
          );
        })}

        {/* More Menu Drawer Trigger */}
        <button
          onClick={onOpenDrawer}
          className="flex flex-col items-center py-1 px-2 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all"
        >
          <Menu className="w-5 h-5 text-purple-400" />
          <span className="text-[10px] mt-0.5 font-medium text-purple-400">More</span>
        </button>
      </div>
    </nav>
  );
};
