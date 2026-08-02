'use client';

import React, { useState } from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Languages, Plus } from 'lucide-react';

interface AddJapaneseResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddJapaneseResourceModal: React.FC<AddJapaneseResourceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addJapaneseResource } = useStepwiseStore();

  const [level, setLevel] = useState('N3');
  const [resourceType, setResourceType] = useState('PDF');
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('20');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addJapaneseResource({
      level,
      resource_type: resourceType,
      title: title.trim(),
      target: parseFloat(target) || 20,
    });
    setTitle('');
    onClose();
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
              <span>Add Japanese Resource</span>
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

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Units / Pages / Hours</label>
              <input
                type="number"
                required
                min="1"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                placeholder="e.g. 30"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 font-bold text-xs text-white shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Resource</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
