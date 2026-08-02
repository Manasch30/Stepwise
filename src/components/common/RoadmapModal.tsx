'use client';

import React, { useState, useEffect } from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import { X, Calendar, Sparkles } from 'lucide-react';

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMonth?: string;
  defaultWeek?: number;
}

export function RoadmapModal({
  isOpen,
  onClose,
  defaultMonth = 'August 2026',
  defaultWeek = 1,
}: RoadmapModalProps) {
  const { addRoadmapGoal } = useStepwiseStore();

  const [month, setMonth] = useState(defaultMonth);
  const [weekNumber, setWeekNumber] = useState<number>(defaultWeek);
  const [goal, setGoal] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    setMonth(defaultMonth);
    setWeekNumber(defaultWeek);
    setGoal('');
    setPriority('high');
  }, [defaultMonth, defaultWeek, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    addRoadmapGoal({
      month,
      week_number: Number(weekNumber),
      goal: goal.trim(),
      priority,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 rounded-3xl glass-panel border border-white/20 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Add Weekly Roadmap Goal</h3>
              <p className="text-xs text-zinc-400">Add a goal directly under a week group</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Target Month
              </label>
              <input
                type="text"
                required
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="e.g. August 2026"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Week Group
              </label>
              <select
                value={weekNumber}
                onChange={(e) => setWeekNumber(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value={1}>Week 1</option>
                <option value={2}>Week 2</option>
                <option value={3}>Week 3</option>
                <option value={4}>Week 4</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
              Goal / Task Title
            </label>
            <input
              type="text"
              required
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. DBMS Relational Algebra & Normalization"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-purple-500/20 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Add Weekly Goal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
