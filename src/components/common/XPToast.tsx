'use client';

import React, { useEffect } from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const XPToast: React.FC = () => {
  const { activeToast, dismissToast } = useStepwiseStore();

  useEffect(() => {
    if (activeToast) {
      // Trigger subtle confetti burst
      try {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.8, x: 0.85 },
          colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
        });
      } catch {
        // ignore if window issue
      }

      const timer = setTimeout(() => {
        dismissToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [activeToast, dismissToast]);

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-2xl glass-panel border border-amber-500/30 bg-zinc-950/90 shadow-2xl shadow-amber-500/20 max-w-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-zinc-950 shrink-0 shadow-lg shadow-amber-500/40">
            <Zap className="w-6 h-6 fill-current animate-bounce" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <h4 className="text-xs font-extrabold text-amber-400 truncate">
              {activeToast.title}
            </h4>
            <p className="text-xs text-zinc-300 font-medium truncate">
              {activeToast.message}
            </p>
          </div>
          <button
            onClick={dismissToast}
            className="p-1 text-zinc-500 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
