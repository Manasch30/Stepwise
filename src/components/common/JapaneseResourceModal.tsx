'use client';

import React, { useState, useEffect } from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import { JapaneseResource } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Languages, Save, Plus, Trash2 } from 'lucide-react';

interface JapaneseResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingResource?: JapaneseResource | null;
}

export const JapaneseResourceModal: React.FC<JapaneseResourceModalProps> = ({
  isOpen,
  onClose,
  editingResource,
}) => {
  const { addJapaneseResource, updateJapaneseResource, deleteJapaneseResource } = useStepwiseStore();

  const [level, setLevel] = useState('N3');
  const [resourceType, setResourceType] = useState('PDF');
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('20');
  const [completed, setCompleted] = useState('0');

  useEffect(() => {
    if (editingResource) {
      setLevel(editingResource.level);
      setResourceType(editingResource.resource_type);
      setTitle(editingResource.title);
      setTarget(String(editingResource.target));
      setCompleted(String(editingResource.completed));
    } else {
      setLevel('N3');
      setResourceType('PDF');
      setTitle('');
      setTarget('20');
      setCompleted('0');
    }
  }, [editingResource, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingResource) {
      updateJapaneseResource(editingResource.id, {
        level,
        resource_type: resourceType,
        title: title.trim(),
        target: parseFloat(target) || 20,
        completed: Math.min(parseFloat(target) || 20, parseFloat(completed) || 0),
      });
    } else {
      addJapaneseResource({
        level,
        resource_type: resourceType,
        title: title.trim(),
        target: parseFloat(target) || 20,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (editingResource && confirm(`Delete resource "${editingResource.title}"?`)) {
      deleteJapaneseResource(editingResource.id);
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
              <Languages className="w-5 h-5 text-pink-400" />
              <span>{editingResource ? 'Edit Resource & Target Goal' : 'Add Japanese Resource'}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">JLPT Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                >
                  <option value="N5">N5 (Beginner)</option>
                  <option value="N4">N4 (Elementary)</option>
                  <option value="N3">N3 (Intermediate)</option>
                  <option value="N2">N2 (Pre-Advanced)</option>
                  <option value="N1">N1 (Advanced)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Resource Type</label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                >
                  <option value="PDF">Grammar PDF</option>
                  <option value="Grammar">Grammar Book</option>
                  <option value="Reading">Reading / Novel</option>
                  <option value="Listening">Listening / Podcast</option>
                  <option value="Media">Media / Anime / Drama</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Resource Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="e.g. Sou Matome N3 Grammar PDF"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Goal (Units/Pages/Hrs)</label>
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
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Completed So Far</label>
                <input
                  type="number"
                  min="0"
                  value={completed}
                  onChange={(e) => setCompleted(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                />
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              {editingResource && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all"
                  title="Delete Resource"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 font-bold text-xs text-white shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2"
              >
                {editingResource ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingResource ? 'Save Resource Target' : 'Add Resource'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
