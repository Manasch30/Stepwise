'use client';

import React, { useState } from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import { JapaneseResource } from '@/types';
import { Languages, CheckCircle, Plus, Edit2, Trash2 } from 'lucide-react';
import { QuickAddModal } from '@/components/common/QuickAddModal';
import { JapaneseResourceModal } from '@/components/common/JapaneseResourceModal';

export default function JapanesePage() {
  const { japaneseResources, completeJapaneseResource, deleteJapaneseResource } = useStepwiseStore();
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1'>('ALL');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<JapaneseResource | null>(null);

  const filteredResources = selectedLevel === 'ALL'
    ? japaneseResources
    : japaneseResources.filter((r) => r.level === selectedLevel);

  const totalTarget = japaneseResources.reduce((acc, r) => acc + r.target, 0);
  const totalCompleted = japaneseResources.reduce((acc, r) => acc + r.completed, 0);
  const overallJpProgress = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;

  const handleOpenNewResource = () => {
    setEditingResource(null);
    setIsResourceModalOpen(true);
  };

  const handleOpenEditResource = (res: JapaneseResource) => {
    setEditingResource(res);
    setIsResourceModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Japanese Module
            <span className="text-xs px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-bold uppercase">
              N5 → N1
            </span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Track PDFs, novels, and immersion hours. Edit goals and targets anytime.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleOpenNewResource}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-pink-500/50 text-pink-400 text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-lg shadow-pink-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Progress</span>
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="p-6 rounded-3xl glass-panel border border-pink-500/20 bg-gradient-to-r from-pink-950/20 via-zinc-900 to-zinc-950 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Overall Japanese Progress</span>
            <div className="text-3xl font-black text-white mt-1">{overallJpProgress}%</div>
          </div>
          <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Languages className="w-6 h-6" />
          </div>
        </div>

        <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-700"
            style={{ width: `${overallJpProgress}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setSelectedLevel(lvl as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedLevel === lvl
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
                : 'glass-card text-zinc-400 hover:text-white'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Resources List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.length === 0 ? (
          <div className="col-span-2 text-center py-12 glass-panel rounded-3xl text-zinc-400 text-xs space-y-3">
            <p>No resources found for level {selectedLevel}.</p>
            <button
              onClick={handleOpenNewResource}
              className="px-4 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs"
            >
              Add First Resource
            </button>
          </div>
        ) : (
          filteredResources.map((res) => {
            const ratio = Math.round((res.completed / res.target) * 100);
            return (
              <div
                key={res.id}
                className="p-5 rounded-3xl glass-card border border-white/10 space-y-4 flex flex-col justify-between relative group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                      {res.level}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400">
                      {res.resource_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {res.finished && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" /> Finished
                      </span>
                    )}
                    <button
                      onClick={() => handleOpenEditResource(res)}
                      className="p-1.5 text-zinc-400 hover:text-pink-400 rounded-lg hover:bg-white/5 transition-colors"
                      title="Edit Goal / Target"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove resource "${res.title}"?`)) {
                          deleteJapaneseResource(res.id);
                        }
                      }}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Delete Resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-white">{res.title}</h3>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-zinc-300">
                    <span>{res.completed} / {res.target} units target</span>
                    <span>{ratio}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-500 transition-all duration-500"
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => completeJapaneseResource(res.id, 1)}
                  className="w-full py-2.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/40 text-pink-300 text-xs font-bold border border-pink-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log +1 Unit Progress (+15 XP)</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
      <JapaneseResourceModal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        editingResource={editingResource}
      />
    </div>
  );
}
