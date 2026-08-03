'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import { RoadmapModal } from '@/components/common/RoadmapModal';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  CheckSquare,
  Square,
  Trash2,
  Layers,
} from 'lucide-react';

export default function RoadmapPage() {
  const roadmap = useStepwiseStore((s) => s.roadmap);
  const addRoadmapGoal = useStepwiseStore((s) => s.addRoadmapGoal);
  const toggleRoadmapGoal = useStepwiseStore((s) => s.toggleRoadmapGoal);
  const deleteRoadmapGoal = useStepwiseStore((s) => s.deleteRoadmapGoal);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultMonth, setModalDefaultMonth] = useState('August 2026');
  const [modalDefaultWeek, setModalDefaultWeek] = useState(1);

  // Quick inline input state: `${month}_week${weekNum}` -> string
  const [quickInputs, setQuickInputs] = useState<Record<string, string>>({});

  const handleOpenModal = useCallback((month: string, weekNum: number) => {
    setModalDefaultMonth(month);
    setModalDefaultWeek(weekNum);
    setIsModalOpen(true);
  }, []);

  const handleAddQuickTask = useCallback((month: string, weekNum: number) => {
    const key = `${month}_week${weekNum}`;
    const text = quickInputs[key]?.trim();
    if (!text) return;

    addRoadmapGoal({
      month,
      week_number: weekNum,
      goal: text,
      priority: 'high',
    });

    setQuickInputs((prev) => ({ ...prev, [key]: '' }));
  }, [quickInputs, addRoadmapGoal]);

  const handleToggle = useCallback((id: string) => {
    toggleRoadmapGoal(id);
  }, [toggleRoadmapGoal]);

  const handleDelete = useCallback((id: string) => {
    deleteRoadmapGoal(id);
  }, [deleteRoadmapGoal]);

  // Extract unique months from store + defaults
  const allMonths = useMemo(() => {
    const uniqueMonths = Array.from(new Set((roadmap || []).map((r) => r.month)));
    const defaultMonths = [
      'August 2026',
      'September 2026',
      'October 2026',
      'November 2026',
      'December 2026',
    ];
    return Array.from(new Set([...defaultMonths, ...uniqueMonths]));
  }, [roadmap]);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Roadmap & Timeline
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold uppercase">
              4 Weekly Groups per Month
            </span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Every month contains 4 Weekly Groups (Week 1–4). Add tasks directly under any week!
          </p>
        </div>

        <button
          onClick={() => handleOpenModal('August 2026', 1)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-purple-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Weekly Goal</span>
        </button>
      </div>

      {/* Month Containers */}
      <div className="space-y-8">
        {allMonths.map((m) => {
          // All roadmap goals for this month
          const monthGoals = roadmap.filter((item) => item.month === m);
          const monthCompletedCount = monthGoals.filter((g) => g.completed).length;
          const monthProgressPercent =
            monthGoals.length > 0
              ? Math.round((monthCompletedCount / monthGoals.length) * 100)
              : 0;

          return (
            <div
              key={m}
              className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6 overflow-hidden relative"
            >
              {/* Month Header & Total Progress Bar */}
              <div className="space-y-3 border-b border-white/10 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">{m}</h3>
                      <p className="text-xs text-zinc-400 font-mono">
                        {monthGoals.length} Total Goals Across 4 Weeks
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-indigo-300">
                        {monthCompletedCount}/{monthGoals.length} Goals Done ({monthProgressPercent}%)
                      </span>
                    </div>
                    {monthProgressPercent === 100 && monthGoals.length > 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-indigo-400" />
                    )}
                  </div>
                </div>

                {/* Progress bar for Month */}
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${monthProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* 4 Weekly Groups Grid for the Month */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((weekNum) => {
                  const weekGoals = monthGoals.filter((g) => g.week_number === weekNum);
                  const weekCompletedCount = weekGoals.filter((g) => g.completed).length;
                  const inputKey = `${m}_week${weekNum}`;

                  return (
                    <div
                      key={weekNum}
                      className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-3 flex flex-col justify-between hover:border-white/20 transition-all"
                    >
                      {/* Week Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            Week {weekNum}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {weekCompletedCount}/{weekGoals.length} Done
                        </span>
                      </div>

                      {/* Goals List for this Week */}
                      <div className="space-y-2 min-h-[70px] max-h-[180px] overflow-y-auto pr-1">
                        {weekGoals.length === 0 ? (
                          <div className="text-[11px] text-zinc-500 italic py-2">
                            No goals added for Week {weekNum} yet.
                          </div>
                        ) : (
                          weekGoals.map((g) => (
                            <motion.div
                              key={g.id}
                              layout
                              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/70 border border-white/5 hover:border-white/20 transition-all group"
                            >
                              <button
                                onClick={() => handleToggle(g.id)}
                                className="flex items-center gap-2.5 text-left w-full mr-2"
                              >
                                {g.completed ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-zinc-400 shrink-0 group-hover:text-indigo-400" />
                                )}
                                <div className="space-y-0.5">
                                  <span
                                    className={`text-xs font-semibold block leading-tight ${
                                      g.completed
                                        ? 'line-through text-zinc-500'
                                        : 'text-zinc-200'
                                    }`}
                                  >
                                    {g.goal}
                                  </span>
                                  <span
                                    className={`text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded inline-block ${
                                      g.priority === 'high'
                                        ? 'text-rose-400 bg-rose-500/10'
                                        : 'text-amber-400 bg-amber-500/10'
                                    }`}
                                  >
                                    {g.priority}
                                  </span>
                                </div>
                              </button>

                              <button
                                onClick={() => handleDelete(g.id)}
                                className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                                title="Delete Goal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          ))
                        )}
                      </div>

                      {/* Add Goal Input for this Week */}
                      <div className="flex gap-1.5 pt-2 border-t border-white/5">
                        <input
                          type="text"
                          placeholder={`+ Add Week ${weekNum} goal...`}
                          value={quickInputs[inputKey] || ''}
                          onChange={(e) =>
                            setQuickInputs({
                              ...quickInputs,
                              [inputKey]: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddQuickTask(m, weekNum);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => handleAddQuickTask(m, weekNum)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Adding Weekly Roadmap Goals */}
      <RoadmapModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultMonth={modalDefaultMonth}
        defaultWeek={modalDefaultWeek}
      />
    </div>
  );
}
