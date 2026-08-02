'use client';

import React, { useState } from 'react';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { XPToast } from '@/components/common/XPToast';
import { QuickAddModal } from '@/components/common/QuickAddModal';
import { Plus } from 'lucide-react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <html lang="en" className="dark">
      <head>
        <title>STEPWISE | Progression Operating System</title>
        <meta name="description" content="A cross-platform productivity operating system for long-term learning." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#09090b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen selection:bg-blue-500 selection:text-white">
        <div className="flex flex-col min-h-screen">
          {/* Header Navbar */}
          <Navbar onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

          {/* Main App Body */}
          <div className="flex flex-1 max-w-7xl w-full mx-auto">
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* View Content Area */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>

        {/* Global Floating Action Button (+) */}
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="fixed bottom-6 left-6 z-40 lg:hidden w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Global Quick Add Modal */}
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
        />

        {/* Global XP Toast Notification */}
        <XPToast />
      </body>
    </html>
  );
}
