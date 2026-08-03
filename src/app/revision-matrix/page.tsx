'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import { RevisionCheckpoints } from '@/types';
import {
  Table2,
  Search,
  Plus,
  CheckSquare,
  Square,
  Sparkles,
  BookOpen,
  Brain,
  Calculator,
  Trash2,
} from 'lucide-react';

export default function RevisionMatrixPage() {
  const revisionMatrix = useStepwiseStore((s) => s.revisionMatrix);
  const toggleRevisionCheckpoint = useStepwiseStore((s) => s.toggleRevisionCheckpoint);
  const addRevisionChapter = useStepwiseStore((s) => s.addRevisionChapter);
  const deleteRevisionChapter = useStepwiseStore((s) => s.deleteRevisionChapter);

  const [activeCategory, setActiveCategory] = useState<
    'gate_cs' | 'gate_da' | 'general_aptitude'
  >('gate_cs');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');

  // Add Chapter Form Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newChapter, setNewChapter] = useState('');

  // Column definitions matching user's uploaded tracker images
  const standardColumns: { key: keyof RevisionCheckpoints; label: string }[] = useMemo(
    () => [
      { key: 'rev1', label: 'REV 1' },
      { key: 'rev2', label: 'REV 2' },
      { key: 'rev3', label: 'REV 3' },
      { key: 'short_notes', label: 'ST NT' },
      { key: 'dpp', label: 'DPP' },
      { key: 'weekly_test', label: 'WT' },
      { key: 'pyq1', label: 'PYQ 1' },
      { key: 'pyq2', label: 'PYQ 2' },
      { key: 'topic_test', label: 'TWT' },
      { key: 'subject_test', label: 'SWT' },
    ],
    []
  );

  const aptitudeColumns: { key: keyof RevisionCheckpoints; label: string }[] = useMemo(
    () => [
      { key: 'class_problems', label: 'CLASS PROBS' },
      { key: 'dpp', label: 'DPPS' },
      { key: 'weekly_test', label: 'WEEKLY TEST' },
      { key: 'cat_lv1', label: 'CAT LV 1' },
      { key: 'cat_lv2', label: 'CAT LV 2' },
      { key: 'mock_test', label: 'MOCK TEST' },
    ],
    []
  );

  const currentColumns =
    activeCategory === 'general_aptitude' ? aptitudeColumns : standardColumns;

  // Memoize all matrix filtering, grouping, and tallies
  const {
    categoryItems,
    availableSubjects,
    subjectsMap,
    totalChapters,
    totalClearedCheckpoints,
    totalPossibleCheckpoints,
    totalPyqCleared,
    categoryProgressPercent,
  } = useMemo(() => {
    const catItems = (revisionMatrix || []).filter(
      (item) => item.category === activeCategory
    );

    const availSubs = Array.from(
      new Set(catItems.map((item) => item.subject))
    );

    const q = searchQuery.toLowerCase().trim();
    const filtered = catItems.filter((item) => {
      const matchesSearch =
        !q ||
        item.chapter.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q);

      const matchesSubject =
        selectedSubjectFilter === 'ALL' || item.subject === selectedSubjectFilter;

      return matchesSearch && matchesSubject;
    });

    const sMap: Record<string, typeof filtered> = {};
    filtered.forEach((item) => {
      if (!sMap[item.subject]) sMap[item.subject] = [];
      sMap[item.subject].push(item);
    });

    const totChapters = catItems.length;
    let possible = 0;
    let cleared = 0;
    let pyq = 0;

    catItems.forEach((item) => {
      currentColumns.forEach((col) => {
        possible++;
        if (item.checkpoints?.[col.key]) {
          cleared++;
          if (col.key === 'pyq1' || col.key === 'pyq2') pyq++;
        }
      });
    });

    const progPercent =
      possible > 0 ? Math.round((cleared / possible) * 100) : 0;

    return {
      categoryItems: catItems,
      availableSubjects: availSubs,
      subjectsMap: sMap,
      totalChapters: totChapters,
      totalClearedCheckpoints: cleared,
      totalPossibleCheckpoints: possible,
      totalPyqCleared: pyq,
      categoryProgressPercent: progPercent,
    };
  }, [revisionMatrix, activeCategory, searchQuery, selectedSubjectFilter, currentColumns]);

  const handleToggle = useCallback(
    (chapterId: string, checkpointKey: keyof RevisionCheckpoints) => {
      toggleRevisionCheckpoint(chapterId, checkpointKey);
    },
    [toggleRevisionCheckpoint]
  );

  const handleDelete = useCallback(
    (chapterId: string) => {
      deleteRevisionChapter(chapterId);
    },
    [deleteRevisionChapter]
  );

  const handleAddChapterSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!newSubject.trim() || !newChapter.trim()) return;

      addRevisionChapter(activeCategory, newSubject.trim(), newChapter.trim());
      setNewSubject('');
      setNewChapter('');
      setIsAddModalOpen(false);
    },
    [activeCategory, newSubject, newChapter, addRevisionChapter]
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Category Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Syllabus Revision & PYQ Matrix
            <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">
              Revision Tracker
            </span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Track Revisions (REV 1–3), PYQs, Short Notes, DPPs, and Topic/Subject Tests for every chapter.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-blue-500/20 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Chapter</span>
        </button>
      </div>

      {/* Track Selector Category Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
        <button
          onClick={() => {
            setActiveCategory('gate_cs');
            setSelectedSubjectFilter('ALL');
          }}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
            activeCategory === 'gate_cs'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>GATE Computer Science (CS)</span>
        </button>

        <button
          onClick={() => {
            setActiveCategory('gate_da');
            setSelectedSubjectFilter('ALL');
          }}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
            activeCategory === 'gate_da'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>GATE Data Science & AI (DA/AI)</span>
        </button>

        <button
          onClick={() => {
            setActiveCategory('general_aptitude');
            setSelectedSubjectFilter('ALL');
          }}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
            activeCategory === 'general_aptitude'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/30'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>General Aptitude</span>
        </button>
      </div>

      {/* Summary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Total Chapters
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{totalChapters}</span>
            <span className="text-xs text-zinc-500 font-mono">In Active Track</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Checkpoints Cleared
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">
              {totalClearedCheckpoints} / {totalPossibleCheckpoints}
            </span>
            <span className="text-xs font-extrabold text-emerald-400 font-mono">
              {categoryProgressPercent}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${categoryProgressPercent}%` }}
            />
          </div>
        </div>

        {activeCategory !== 'general_aptitude' ? (
          <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              PYQs Completed
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-blue-400">{totalPyqCleared}</span>
              <span className="text-xs text-zinc-500 font-mono">PYQ 1 & 2 Sets</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Mock Tests Completed
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-400">
                {
                  categoryItems.filter((i) => i.checkpoints.mock_test)
                    .length
                }
              </span>
              <span className="text-xs text-zinc-500 font-mono">Aptitude Mocks</span>
            </div>
          </div>
        )}

        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Checkpoint XP Bonus
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-400">
              +{totalClearedCheckpoints * 5} XP
            </span>
            <span className="text-xs text-purple-400 font-mono">+5 XP / Box</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search chapter or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={selectedSubjectFilter}
          onChange={(e) => setSelectedSubjectFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Subjects ({availableSubjects.length})</option>
          {availableSubjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>

      {/* Subject Revision Tables */}
      <div className="space-y-6">
        {Object.keys(subjectsMap).length === 0 ? (
          <div className="p-8 rounded-3xl glass-panel border border-white/10 text-center space-y-2">
            <Table2 className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-bold text-zinc-400">No chapters found</p>
            <p className="text-xs text-zinc-500">
              Try adjusting your search query or filter selection.
            </p>
          </div>
        ) : (
          Object.entries(subjectsMap).map(([subjectName, chapters]) => {
            // Subject progress
            let subCleared = 0;
            const subTotal = chapters.length * currentColumns.length;

            chapters.forEach((ch) => {
              currentColumns.forEach((col) => {
                if (ch.checkpoints[col.key]) subCleared++;
              });
            });

            const subPercent =
              subTotal > 0 ? Math.round((subCleared / subTotal) * 100) : 0;

            return (
              <div
                key={subjectName}
                className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4 overflow-hidden"
              >
                {/* Subject Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                      {subjectName}
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      {chapters.length} Chapters • {subCleared}/{subTotal} Checkpoints Cleared ({subPercent}%)
                    </p>
                  </div>

                  <div className="w-full sm:w-48 h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${subPercent}%` }}
                    />
                  </div>
                </div>

                {/* Table for Chapters and Columns */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                        <th className="py-3 px-3 min-w-[220px]">CHAPTERS</th>
                        {currentColumns.map((col) => (
                          <th
                            key={col.key}
                            className="py-3 px-2 text-center min-w-[65px]"
                          >
                            {col.label}
                          </th>
                        ))}
                        <th className="py-3 px-2 text-center w-10">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {chapters.map((ch) => (
                        <tr
                          key={ch.id}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="py-3 px-3 font-semibold text-zinc-200">
                            {ch.chapter}
                          </td>

                          {currentColumns.map((col) => {
                            const isChecked = !!ch.checkpoints[col.key];
                            return (
                              <td
                                key={col.key}
                                className="py-2.5 px-2 text-center"
                              >
                                <button
                                  onClick={() =>
                                    handleToggle(ch.id, col.key)
                                  }
                                  className={`p-1.5 rounded-lg border transition-all inline-flex items-center justify-center ${
                                    isChecked
                                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                                      : 'bg-zinc-900/60 text-zinc-600 border-white/5 hover:border-white/20 hover:text-zinc-400'
                                  }`}
                                  title={`${col.label} - ${ch.chapter}`}
                                >
                                  {isChecked ? (
                                    <CheckSquare className="w-4 h-4" />
                                  ) : (
                                    <Square className="w-4 h-4" />
                                  )}
                                </button>
                              </td>
                            );
                          })}

                          <td className="py-2.5 px-2 text-center">
                            <button
                              onClick={() => handleDelete(ch.id)}
                              className="p-1 rounded text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete Chapter"
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
            );
          })
        )}
      </div>

      {/* Add Chapter Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md p-6 rounded-3xl glass-panel border border-white/20 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Add Revision Chapter</h3>
                  <p className="text-xs text-zinc-400">Add a new chapter to your matrix</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddChapterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. COMPUTER NETWORKS, MACHINE LEARNING"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Chapter Title
                </label>
                <input
                  type="text"
                  required
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  placeholder="e.g. TCP/IP Socket Programming"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Add Chapter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
