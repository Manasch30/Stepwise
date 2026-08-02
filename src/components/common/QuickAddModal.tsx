'use client';

import React, { useState } from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Dumbbell, Languages, Code, FileText, CheckCircle2 } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
  const {
    subjects,
    japaneseResources,
    projects,
    logLecture,
    logDailyFitness,
    completeJapaneseResource,
    updateProject,
    logWeeklyReview,
  } = useStepwiseStore();

  const [activeTab, setActiveTab] = useState<'study' | 'workout' | 'japanese' | 'project' | 'review'>('study');

  // Study Form State
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || 'cs_dbms');
  const [studyHours, setStudyHours] = useState('2.5');
  const [studyRemarks, setStudyRemarks] = useState('');

  // Workout Form State (Everyday Fitness)
  const [steps, setSteps] = useState('10000');
  const [calories, setCalories] = useState('2400');
  const [protein, setProtein] = useState('160');

  // Japanese Form State
  const [selectedJpResource, setSelectedJpResource] = useState(japaneseResources[0]?.id || '');
  const [jpDelta, setJpDelta] = useState('2');

  // Project Form State
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [projectProgress, setProjectProgress] = useState('50');

  // Weekly Review Form State
  const [reviewWeek, setReviewWeek] = useState('2026-W31');
  const [reviewHours, setReviewHours] = useState('28');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewReflection, setReviewReflection] = useState('Great progress on DBMS Relational Algebra & ML Gradient Descent.');

  const handleSubmitStudy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !studyHours) return;
    logLecture({
      subject_id: selectedSubject,
      hours: parseFloat(studyHours),
      remarks: studyRemarks || 'Study session logged via Stepwise Quick Add',
    });
    onClose();
  };

  const handleSubmitWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    logDailyFitness({
      steps: parseInt(steps, 10) || 10000,
      calories: parseInt(calories, 10) || 2400,
      protein: parseInt(protein, 10) || 160,
    });
    onClose();
  };

  const handleSubmitJapanese = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJpResource) return;
    completeJapaneseResource(selectedJpResource, parseInt(jpDelta) || 1);
    onClose();
  };

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    updateProject(selectedProject, parseInt(projectProgress) || 0);
    onClose();
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    logWeeklyReview({
      week: reviewWeek,
      study_hours: parseFloat(reviewHours) || 0,
      jp_hours: 8,
      gate_hours: 20,
      gym_sessions: 4,
      rating: parseInt(reviewRating) || 5,
      reflection: reviewReflection,
    });
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
          className="w-full max-w-lg glass-panel rounded-3xl border border-white/10 p-6 space-y-6 shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white">Log Action / Event</h3>
              <p className="text-xs text-zinc-400">Triggers real-time system event bus cascade</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Type Selector Tabs */}
          <div className="grid grid-cols-5 gap-1.5 p-1 bg-zinc-900/80 rounded-xl border border-white/5 text-[11px] font-semibold">
            <button
              onClick={() => setActiveTab('study')}
              className={`flex flex-col items-center py-2 rounded-lg transition-all ${
                activeTab === 'study' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 mb-1" />
              <span>Study</span>
            </button>

            <button
              onClick={() => setActiveTab('workout')}
              className={`flex flex-col items-center py-2 rounded-lg transition-all ${
                activeTab === 'workout' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Dumbbell className="w-4 h-4 mb-1" />
              <span>Workout</span>
            </button>

            <button
              onClick={() => setActiveTab('japanese')}
              className={`flex flex-col items-center py-2 rounded-lg transition-all ${
                activeTab === 'japanese' ? 'bg-pink-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Languages className="w-4 h-4 mb-1" />
              <span>Japanese</span>
            </button>

            <button
              onClick={() => setActiveTab('project')}
              className={`flex flex-col items-center py-2 rounded-lg transition-all ${
                activeTab === 'project' ? 'bg-amber-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Code className="w-4 h-4 mb-1" />
              <span>Project</span>
            </button>

            <button
              onClick={() => setActiveTab('review')}
              className={`flex flex-col items-center py-2 rounded-lg transition-all ${
                activeTab === 'review' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 mb-1" />
              <span>Review</span>
            </button>
          </div>

          {/* Form Content */}
          {activeTab === 'study' && (
            <form onSubmit={handleSubmitStudy} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Select Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      [{sub.track}] {sub.title} ({sub.hours_completed}/{sub.hours_target} hrs)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Study Hours Logged</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Remarks & Notes</label>
                <input
                  type="text"
                  value={studyRemarks}
                  onChange={(e) => setStudyRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Completed Relational Algebra queries & Normalization exercises"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-xs text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Log Study Event (+10 XP / hr)</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'workout' && (
            <form onSubmit={handleSubmitWorkout} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Daily Steps</label>
                  <input
                    type="number"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    placeholder="e.g. 10000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Calories (kcal)</label>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      placeholder="e.g. 2400"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Protein (g)</label>
                    <input
                      type="number"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      placeholder="e.g. 160"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-xs text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Log Fitness Event (+25 XP)</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'japanese' && (
            <form onSubmit={handleSubmitJapanese} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Resource</label>
                <select
                  value={selectedJpResource}
                  onChange={(e) => setSelectedJpResource(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                >
                  {japaneseResources.map((res) => (
                    <option key={res.id} value={res.id}>
                      [{res.level}] {res.title} ({res.completed}/{res.target})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Completed Units / Hours / Pages</label>
                <input
                  type="number"
                  value={jpDelta}
                  onChange={(e) => setJpDelta(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 font-bold text-xs text-white shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Log Japanese Progress (+40 XP)</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'project' && (
            <form onSubmit={handleSubmitProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Select Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (Current: {p.progress}%)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">New Completion %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={projectProgress}
                  onChange={(e) => setProjectProgress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 font-bold text-xs text-white shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Project (+20 XP)</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'review' && (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Week</label>
                  <input
                    type="text"
                    value={reviewWeek}
                    onChange={(e) => setReviewWeek(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Study Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={reviewHours}
                    onChange={(e) => setReviewHours(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Weekly Reflection Notes</label>
                <textarea
                  rows={3}
                  value={reviewReflection}
                  onChange={(e) => setReviewReflection(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs outline-none resize-none"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-xs text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Weekly Reflection (+75 XP)</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
