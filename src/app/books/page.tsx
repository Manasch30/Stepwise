'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  BookMarked,
  Library,
  Bookmark,
} from 'lucide-react';
import { Book } from '@/types';

export default function BooksPage() {
  const books = useStepwiseStore((s) => s.books);
  const addBook = useStepwiseStore((s) => s.addBook);
  const updateBookPages = useStepwiseStore((s) => s.updateBookPages);
  const deleteBook = useStepwiseStore((s) => s.deleteBook);

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Add Book Modal State
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Non-Fiction');
  const [totalPages, setTotalPages] = useState('250');
  const [initialPages, setInitialPages] = useState('0');
  const [notes, setNotes] = useState('');

  // Update Reading Progress Modal State
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [progressPageValue, setProgressPageValue] = useState<number>(0);

  const categories = useMemo(
    () => [
      'All',
      'Non-Fiction',
      'Fiction',
      'Technical / CS',
      'Self Improvement',
      'Manga / Light Novel',
      'Other',
    ],
    []
  );

  const { filteredBooks, totalBooks, currentlyReadingCount, completedBooksCount, totalPagesRead } = useMemo(() => {
    const list = Array.isArray(books) ? books : [];
    const filtered =
      selectedCategory === 'All'
        ? list
        : list.filter((b) => b.category === selectedCategory);

    const total = list.length;
    const reading = list.filter((b) => b.status === 'reading').length;
    const completed = list.filter((b) => b.status === 'completed').length;
    const pagesRead = list.reduce((acc, b) => acc + (b.completed_pages || 0), 0);

    return {
      filteredBooks: filtered,
      totalBooks: total,
      currentlyReadingCount: reading,
      completedBooksCount: completed,
      totalPagesRead: pagesRead,
    };
  }, [books, selectedCategory]);

  const handleAddBookSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;

      const total = parseInt(totalPages, 10) || 100;
      const completed = Math.min(total, parseInt(initialPages, 10) || 0);

      addBook({
        title: title.trim(),
        author: author.trim() || 'Unknown Author',
        category,
        total_pages: total,
        completed_pages: completed,
        status: completed >= total ? 'completed' : 'reading',
        notes: notes.trim() || undefined,
      });

      setTitle('');
      setAuthor('');
      setTotalPages('250');
      setInitialPages('0');
      setNotes('');
      setIsAddBookOpen(false);
    },
    [title, author, category, totalPages, initialPages, notes, addBook]
  );

  const handleUpdatePagesSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingBook) return;
      updateBookPages(editingBook.id, progressPageValue);
      setEditingBook(null);
    },
    [editingBook, progressPageValue, updateBookPages]
  );

  const handleDeleteBook = useCallback(
    (id: string) => {
      deleteBook(id);
    },
    [deleteBook]
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-6 md:p-8 border border-white/10 bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-blue-950/40">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Reading Tracker
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                +30 XP per Book
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Personal Library & Reading Vault
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Track your reading progress across technical books, non-fiction, novels & manga. Log page milestones to earn XP and level up your knowledge stack.
            </p>
          </div>

          <button
            onClick={() => setIsAddBookOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Book (+30 XP)</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl glass-card border border-emerald-500/20 bg-emerald-950/10 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
            <span>Total Books</span>
            <Library className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white">{totalBooks}</div>
          <p className="text-[10px] text-zinc-400">In Personal Library</p>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-blue-500/20 bg-blue-950/10 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-blue-400">
            <span>Currently Reading</span>
            <BookMarked className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white">{currentlyReadingCount}</div>
          <p className="text-[10px] text-zinc-400">Active Reading List</p>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-purple-500/20 bg-purple-950/10 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-purple-400">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white">{completedBooksCount}</div>
          <p className="text-[10px] text-zinc-400">Finished Books</p>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-amber-500/20 bg-amber-950/10 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-amber-400">
            <span>Total Pages Read</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white">{totalPagesRead.toLocaleString()}</div>
          <p className="text-[10px] text-zinc-400">Pages Completed</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-900/90 text-zinc-400 border border-white/5 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Book Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Book Shelf & Reading Progress
          </h3>
          <span className="text-xs text-zinc-400 font-mono">
            {filteredBooks.length} Books Displayed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => {
            const percent = Math.min(
              100,
              Math.round(((book.completed_pages || 0) / (book.total_pages || 1)) * 100)
            );
            const isFinished = percent >= 100;

            return (
              <div
                key={book.id}
                className="p-6 rounded-3xl glass-card border border-white/10 space-y-5 hover:border-emerald-500/30 transition-all group relative flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {book.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase border ${
                          isFinished
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : book.status === 'paused'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}
                      >
                        {isFinished ? 'Completed' : book.status}
                      </span>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 opacity-70 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                        title="Delete Book (-30 XP)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Author */}
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <Bookmark className="w-3 h-3 text-zinc-500" />
                      <span>{book.author || 'Unknown Author'}</span>
                    </p>
                  </div>

                  {book.notes && (
                    <p className="text-xs text-zinc-400/90 line-clamp-2 bg-zinc-900/60 p-2.5 rounded-xl border border-white/5 font-mono">
                      &quot;{book.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Progress Bar & Actions */}
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-400">Pages Read</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {book.completed_pages} / {book.total_pages} ({percent}%)
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFinished
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30'
                          : 'bg-gradient-to-r from-blue-500 to-emerald-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <button
                      onClick={() => {
                        setEditingBook(book);
                        setProgressPageValue(book.completed_pages || 0);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Update Page Log (+15 XP)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredBooks.length === 0 && (
            <div className="col-span-full p-12 rounded-3xl glass-card border border-white/10 text-center space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 w-fit mx-auto border border-emerald-500/20">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">No Books Added Yet</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Your book vault is empty. Add your current reading books to track pages and earn reading XP!
                </p>
              </div>
              <button
                onClick={() => setIsAddBookOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Your First Book</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Book Modal */}
      {isAddBookOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl glass-card border border-white/10 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                Add New Book
              </h3>
              <button
                onClick={() => setIsAddBookOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBookSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Atomic Habits / Designing Data-Intensive Applications"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Author</label>
                <input
                  type="text"
                  placeholder="e.g. James Clear / Martin Kleppmann"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Technical / CS">Technical / CS</option>
                    <option value="Self Improvement">Self Improvement</option>
                    <option value="Manga / Light Novel">Manga / Light Novel</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Total Pages</label>
                  <input
                    type="number"
                    min="1"
                    value={totalPages}
                    onChange={(e) => setTotalPages(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Initial Pages Read</label>
                <input
                  type="number"
                  min="0"
                  value={initialPages}
                  onChange={(e) => setInitialPages(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Personal Notes / Thoughts</label>
                <textarea
                  placeholder="Key learnings, thoughts or why you started reading..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBookOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-extrabold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  + Save Book (+30 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Reading Progress Modal */}
      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm p-6 rounded-3xl glass-card border border-white/10 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                Update Reading Progress
              </h3>
              <button
                onClick={() => setEditingBook(null)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdatePagesSubmit} className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">{editingBook.title}</p>
                <p className="text-[11px] text-zinc-400">Total Book Pages: {editingBook.total_pages}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Current Page Number</label>
                <input
                  type="number"
                  min="0"
                  max={editingBook.total_pages}
                  value={progressPageValue}
                  onChange={(e) => setProgressPageValue(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 text-black text-xs font-extrabold hover:bg-emerald-400 transition-all"
                >
                  Update (+15 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
