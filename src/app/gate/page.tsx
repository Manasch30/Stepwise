'use client';

import React, { useState } from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import { Subject } from '@/types';
import { Cpu, Brain, Clock, Plus, CheckCircle, Edit2, BookOpen } from 'lucide-react';
import { QuickAddModal } from '@/components/common/QuickAddModal';
import { SubjectModal } from '@/components/common/SubjectModal';

export default function GatePage() {
  const { subjects, getTrackProgress } = useStepwiseStore();

  const [activeTrack, setActiveTrack] = useState<'GATE CS' | 'GATE DA'>('GATE CS');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const trackSubjects = subjects.filter((s) => s.track === activeTrack);
  const trackProgress = getTrackProgress(activeTrack);

  const totalTargetHours = trackSubjects.reduce((acc, s) => acc + s.hours_target, 0);
  const totalCompletedHours = trackSubjects.reduce((acc, s) => acc + s.hours_completed, 0);

  const handleOpenNewSubject = () => {
    setEditingSubject(null);
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setIsSubjectModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            GATE Engineering Tracks
            <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">
              2027 Syllabus
            </span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Checkpoints (20%, 40%, 60%, 80%, 100%) automatically calculate from logged study hours. Edit target goals anytime.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleOpenNewSubject}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-blue-500/50 text-blue-400 text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Study Session</span>
          </button>
        </div>
      </div>

      {/* Track Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTrack('GATE CS')}
          className={`p-5 rounded-3xl text-left border transition-all flex items-center justify-between ${
            activeTrack === 'GATE CS'
              ? 'glass-panel border-blue-500/40 bg-blue-950/20 shadow-xl shadow-blue-500/10'
              : 'glass-card border-white/5 opacity-60 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">GATE CS</h3>
              <p className="text-xs text-zinc-400">{getTrackProgress('GATE CS')}% Complete</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTrack('GATE DA')}
          className={`p-5 rounded-3xl text-left border transition-all flex items-center justify-between ${
            activeTrack === 'GATE DA'
              ? 'glass-panel border-purple-500/40 bg-purple-950/20 shadow-xl shadow-purple-500/10'
              : 'glass-card border-white/5 opacity-60 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">GATE DA & AI</h3>
              <p className="text-xs text-zinc-400">{getTrackProgress('GATE DA')}% Complete</p>
            </div>
          </div>
        </button>
      </div>

      {/* Track Velocity Card */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {activeTrack} Track Velocity
            </span>
            <h3 className="text-2xl font-black text-white mt-1">
              {totalCompletedHours.toFixed(1)} / {totalTargetHours} Hours Completed ({trackProgress}%)
            </h3>
          </div>
          <div className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
            <Clock className="w-4 h-4 text-blue-400" />
            Target Completion: December 2026
          </div>
        </div>

        <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-700"
            style={{ width: `${trackProgress}%` }}
          />
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trackSubjects.map((sub) => {
          const ratio = sub.hours_target > 0 ? Math.round((sub.hours_completed / sub.hours_target) * 100) : 0;
          return (
            <div
              key={sub.id}
              className="p-5 rounded-3xl glass-card border border-white/10 space-y-4 flex flex-col justify-between relative group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {sub.checkpoint}% Checkpoint
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {sub.status.replace('_', ' ')}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenEditSubject(sub)}
                  className="p-1.5 text-zinc-400 hover:text-blue-400 rounded-lg hover:bg-white/5 transition-colors"
                  title="Edit Subject Goal"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-white leading-snug">{sub.title}</h4>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-zinc-300">
                  <span>{sub.hours_completed} hrs done</span>
                  <span>{sub.hours_target} hrs target</span>
                </div>
                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, ratio)}%` }}
                  />
                </div>
              </div>

              {/* Checkpoint Indicators */}
              <div className="flex justify-between text-[9px] font-mono text-zinc-500 pt-1 border-t border-white/5">
                {[20, 40, 60, 80, 100].map((cp) => (
                  <span
                    key={cp}
                    className={sub.checkpoint >= cp ? 'text-blue-400 font-bold' : ''}
                  >
                    {cp}%
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        editingSubject={editingSubject}
        defaultTrack={activeTrack}
      />
    </div>
  );
}
