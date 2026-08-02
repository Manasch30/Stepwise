'use client';

import React, { useState, useEffect } from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import { Subject } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Save, Plus, Trash2 } from 'lucide-react';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSubject?: Subject | null;
  defaultTrack?: 'GATE CS' | 'GATE DA';
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  editingSubject,
  defaultTrack = 'GATE CS',
}) => {
  const { addSubject, updateSubject, deleteSubject } = useStepwiseStore();

  const [title, setTitle] = useState('');
  const [track, setTrack] = useState<'GATE CS' | 'GATE DA' | 'Japanese' | 'Fitness'>(defaultTrack);
  const [hoursTarget, setHoursTarget] = useState('30');
  const [hoursCompleted, setHoursCompleted] = useState('0');

  useEffect(() => {
    if (editingSubject) {
      setTitle(editingSubject.title);
      setTrack(editingSubject.track);
      setHoursTarget(String(editingSubject.hours_target));
      setHoursCompleted(String(editingSubject.hours_completed));
    } else {
      setTitle('');
      setTrack(defaultTrack);
      setHoursTarget('30');
      setHoursCompleted('0');
    }
  }, [editingSubject, defaultTrack, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const goalId = track === 'GATE CS' ? 'gate_cs' : track === 'GATE DA' ? 'gate_da' : 'projects';

    if (editingSubject) {
      updateSubject(editingSubject.id, {
        title: title.trim(),
        track,
        goal_id: goalId as any,
        hours_target: parseFloat(hoursTarget) || 30,
        hours_completed: parseFloat(hoursCompleted) || 0,
      });
    } else {
      addSubject({
        title: title.trim(),
        track,
        goal_id: goalId as any,
        hours_target: parseFloat(hoursTarget) || 30,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (editingSubject && confirm(`Delete subject "${editingSubject.title}"?`)) {
      deleteSubject(editingSubject.id);
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
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>{editingSubject ? 'Edit Subject Target Goal' : 'Add New Subject'}</span>
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
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Track</label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
              >
                <option value="GATE CS">GATE CS (Computer Science)</option>
                <option value="GATE DA">GATE DA (Data Science & AI)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Subject Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Computer Architecture & Synthesis"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Hours Goal</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={hoursTarget}
                  onChange={(e) => setHoursTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Hours Completed</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={hoursCompleted}
                  onChange={(e) => setHoursCompleted(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                />
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              {editingSubject && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all"
                  title="Delete Subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-xs text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {editingSubject ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingSubject ? 'Save Subject Target' : 'Add Subject'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
