'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cpu,
  Table2,
  Dumbbell,
  Code,
  Menu,
  User,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface MobileBottomNavProps {
  onOpenDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenDrawer }) => {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

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

  const quickNav = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'GATE', href: '/gate', icon: Cpu },
    { name: 'Matrix', href: '/revision-matrix', icon: Table2 },
    { name: 'Fitness', href: '/fitness', icon: Dumbbell },
    { name: 'Projects', href: '/projects', icon: Code },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 px-1 py-1.5 shadow-2xl">
      <div className="flex items-center justify-between max-w-md mx-auto px-1">
        {quickNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-blue-400 scale-110' : 'text-zinc-400'}`} />
              <span className="text-[9px] sm:text-[10px] mt-0.5 font-medium">{item.name}</span>
            </Link>
          );
        })}

        {/* Dedicated Account / Sign In Tab */}
        <Link
          href={userEmail ? '/achievements' : '/login'}
          className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition-all ${
            pathname === '/login'
              ? 'text-blue-400 font-bold'
              : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          <User className={`w-4 h-4 sm:w-5 sm:h-5 ${pathname === '/login' ? 'text-blue-400 scale-110' : 'text-amber-400'}`} />
          <span className="text-[9px] sm:text-[10px] mt-0.5 font-bold truncate max-w-[45px]">
            {userEmail ? 'Account' : 'Sign In'}
          </span>
        </Link>

        {/* More Menu Drawer Trigger */}
        <button
          onClick={onOpenDrawer}
          className="flex flex-col items-center py-1 px-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          <span className="text-[9px] sm:text-[10px] mt-0.5 font-medium text-purple-400">More</span>
        </button>
      </div>
    </nav>
  );
};
