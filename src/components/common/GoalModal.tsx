'use client';

import React, { useState, useEffect } from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import { Goal } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Save, Plus, Trash2 } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoal?: Goal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, editingGoal }) => {
  const { addGoal, updateGoal, deleteGoal } = useStepwiseStore();

  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('100');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('Target');
  const [status, setStatus] = useState<'active' | 'completed' | 'paused'>('active');
  const [deadline, setDeadline] = useState('2027-02-01');

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setTarget(String(editingGoal.target));
      setColor(editingGoal.color || '#3b82f6');
      setIcon(editingGoal.icon || 'Target');
      setStatus(editingGoal.status);
      setDeadline(editingGoal.deadline || '2027-02-01');
    } else {
      setTitle('');
      setTarget('100');
      setColor('#3b82f6');
      setIcon('Target');
      setStatus('active');
      setDeadline('2027-02-01');
    }
  }, [editingGoal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title,
        target: parseFloat(target) || 100,
        color,
        icon,
        status,
        deadline,
      });
    } else {
      addGoal({
        title,
        type: title.toLowerCase().replace(/\s+/g, '_'),
        target: parseFloat(target) || 100,
        color,
        icon,
        status,
        deadline,
        xp: 500,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (editingGoal && confirm(`Delete goal "${editingGoal.title}"?`)) {
      deleteGoal(editingGoal.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md glass-panel rounded-3xl border border-white/10 p-6 space-y-5 relative shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-extrabold text-base">
              <Target className="w-5 h-5 text-blue-400" />
              <span>{editingGoal ? 'Edit System Goal' : 'Create Custom Goal'}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Goal Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Machine Learning Specialization"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Units / Hours</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-zinc-400">{color}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                />
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              {editingGoal && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all"
                  title="Delete Goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-xs text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {editingGoal ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingGoal ? 'Save Goal Changes' : 'Create Goal'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
