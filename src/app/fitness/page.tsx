'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import {
  Trophy,
  Footprints,
  Flame,
  TrendingUp,
  Apple,
  Trash2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function FitnessPage() {
  const dailyFitnessLogs = useStepwiseStore((s) => s.dailyFitnessLogs);
  const prRecords = useStepwiseStore((s) => s.prRecords);
  const logDailyFitness = useStepwiseStore((s) => s.logDailyFitness);
  const deleteDailyFitnessLog = useStepwiseStore((s) => s.deleteDailyFitnessLog);
  const addPRRecord = useStepwiseStore((s) => s.addPRRecord);
  const deletePRRecord = useStepwiseStore((s) => s.deletePRRecord);

  // Daily Logging Form State
  const [stepsInput, setStepsInput] = useState('10000');
  const [caloriesInput, setCaloriesInput] = useState('2400');
  const [proteinInput, setProteinInput] = useState('160');

  // PR Add Modal State
  const [isPRModalOpen, setIsPRModalOpen] = useState(false);
  const [prExercise, setPrExercise] = useState('Bench Press');
  const [prWeight, setPrWeight] = useState('');
  const [prReps, setPrReps] = useState('1');
  const [prNotes, setPrNotes] = useState('');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayLog = useMemo(() => {
    return (
      (dailyFitnessLogs || []).find((log) => log.date === todayStr) ||
      (dailyFitnessLogs || [])[0] || {
        steps: 10000,
        calories: 2400,
        protein: 160,
      }
    );
  }, [dailyFitnessLogs, todayStr]);

  const handleDailyFitnessSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const steps = parseInt(stepsInput, 10) || 0;
      const calories = parseInt(caloriesInput, 10) || 0;
      const protein = parseInt(proteinInput, 10) || 0;

      logDailyFitness({ steps, calories, protein });
    },
    [stepsInput, caloriesInput, proteinInput, logDailyFitness]
  );

  const handlePRSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!prExercise.trim() || !prWeight) return;

      addPRRecord({
        exercise: prExercise.trim(),
        weight_kg: parseFloat(prWeight),
        reps: parseInt(prReps, 10) || 1,
        notes: prNotes,
      });

      setPrWeight('');
      setPrNotes('');
      setIsPRModalOpen(false);
    },
    [prExercise, prWeight, prReps, prNotes, addPRRecord]
  );

  const handleDeleteFitnessLog = useCallback(
    (id: string) => {
      deleteDailyFitnessLog(id);
    },
    [deleteDailyFitnessLog]
  );

  const handleDeletePR = useCallback(
    (id: string) => {
      deletePRRecord(id);
    },
    [deletePRRecord]
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Fitness & Strength Operating System
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
              Daily & PR Tracker
            </span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Log daily steps, calories, and protein intake. Record Personal Records (PRs) whenever you hit a breakthrough.
          </p>
        </div>

        {/* Separate PR Button */}
        <button
          onClick={() => setIsPRModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all self-start md:self-auto"
        >
          <Trophy className="w-4 h-4 fill-black" />
          <span>+ Add New PR (+50 XP)</span>
        </button>
      </div>

      {/* Daily Metrics Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl glass-card border border-blue-500/20 bg-blue-950/10 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-blue-400">
            <span>Daily Steps</span>
            <Footprints className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white">
            {todayLog.steps.toLocaleString()}{' '}
            <span className="text-xs font-normal text-zinc-400">steps</span>
          </div>
          <p className="text-[10px] text-zinc-400">Target: 10,000 steps/day</p>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-orange-500/20 bg-orange-950/10 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-orange-400">
            <span>Calorie Intake</span>
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white">
            {todayLog.calories.toLocaleString()}{' '}
            <span className="text-xs font-normal text-zinc-400">kcal</span>
          </div>
          <p className="text-[10px] text-zinc-400">Target: 2,400 kcal/day</p>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-emerald-500/20 bg-emerald-950/10 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
            <span>Protein Intake</span>
            <Apple className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white">
            {todayLog.protein}{' '}
            <span className="text-xs font-normal text-zinc-400">grams</span>
          </div>
          <p className="text-[10px] text-zinc-400">Target: 160g protein/day</p>
        </div>
      </div>

      {/* Everyday Fitness Log Form Card */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Everyday Fitness Logging (Steps, Calories & Protein)
          </h3>
          <span className="text-xs font-mono text-zinc-400">Earn +25 XP</span>
        </div>

        <form onSubmit={handleDailyFitnessSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Steps Count
            </label>
            <input
              type="number"
              required
              min="0"
              value={stepsInput}
              onChange={(e) => setStepsInput(e.target.value)}
              placeholder="e.g. 10000"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Calories (kcal)
            </label>
            <input
              type="number"
              required
              min="0"
              value={caloriesInput}
              onChange={(e) => setCaloriesInput(e.target.value)}
              placeholder="e.g. 2400"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Protein Intake (g)
            </label>
            <input
              type="number"
              required
              min="0"
              value={proteinInput}
              onChange={(e) => setProteinInput(e.target.value)}
              placeholder="e.g. 160"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Log Everyday Stats</span>
            </button>
          </div>
        </form>
      </div>

      {/* PR Showcase Section (Personal Records) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Personal Records (PR Board)
          </h3>
          <span className="text-xs text-zinc-400 font-mono">
            {prRecords.length} Personal Bests Recorded
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {prRecords.map((pr) => (
            <div
              key={pr.id}
              className="p-5 rounded-3xl glass-card border border-amber-500/20 bg-amber-950/10 space-y-3 relative group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                    {pr.exercise}
                  </span>
                  <div className="text-2xl font-black text-white mt-0.5">
                    {pr.weight_kg} <span className="text-xs font-normal text-zinc-400">kg</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeletePR(pr.id)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete PR"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-white/5">
                <span>{pr.reps} Rep{pr.reps > 1 ? 's' : ''}</span>
                <span className="font-mono text-zinc-500">{pr.date}</span>
              </div>

              {pr.notes && (
                <p className="text-[10px] text-amber-300/80 italic font-mono">
                  &quot;{pr.notes}&quot;
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Fitness History Table */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Daily Steps, Calories & Protein History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 uppercase font-mono">
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Steps</th>
                <th className="py-3 px-2">Calories</th>
                <th className="py-3 px-2">Protein</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {dailyFitnessLogs.map((log) => (
                <tr key={log.id} className="text-zinc-200 font-mono hover:bg-white/5 group">
                  <td className="py-3 px-2 font-bold text-white">{log.date}</td>
                  <td className="py-3 px-2 text-blue-400">{log.steps.toLocaleString()} steps</td>
                  <td className="py-3 px-2 text-orange-400">{log.calories} kcal</td>
                  <td className="py-3 px-2 text-emerald-400 font-bold">{log.protein} g</td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => handleDeleteFitnessLog(log.id)}
                      title="Delete log entry & deduct XP"
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-80 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New PR Modal */}
      {isPRModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md p-6 rounded-3xl glass-panel border border-white/20 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Record Personal Record (PR)</h3>
                  <p className="text-xs text-zinc-400">Log a new weight or rep milestone (+50 XP)</p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePRSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Exercise Name
                </label>
                <select
                  value={prExercise}
                  onChange={(e) => setPrExercise(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500 mb-2"
                >
                  <option value="Bench Press">Bench Press</option>
                  <option value="Barbell Squat">Barbell Squat</option>
                  <option value="Deadlift">Deadlift</option>
                  <option value="Overhead Press">Overhead Press</option>
                  <option value="Incline Dumbbell Press">Incline Dumbbell Press</option>
                  <option value="Weighted Pull-ups">Weighted Pull-ups</option>
                  <option value="Barbell Row">Barbell Row</option>
                  <option value="Custom Exercise">Custom Exercise</option>
                </select>

                {prExercise === 'Custom Exercise' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter exercise title..."
                    onChange={(e) => setPrExercise(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={prWeight}
                    onChange={(e) => setPrWeight(e.target.value)}
                    placeholder="e.g. 90"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Reps
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={prReps}
                    onChange={(e) => setPrReps(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Notes / Milestone (Optional)
                </label>
                <input
                  type="text"
                  value={prNotes}
                  onChange={(e) => setPrNotes(e.target.value)}
                  placeholder="e.g. Hit clean 1RM depth!"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPRModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4 fill-black" />
                  <span>Record PR (+50 XP)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
