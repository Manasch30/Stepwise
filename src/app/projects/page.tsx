'use client';

import React, { useState } from 'react';
import { useStepwiseStore } from '@/store/useStepwiseStore';
import {
  Code,
  FolderGit2,
  Cpu,
  Plus,
  ExternalLink,
  Github,
  CheckCircle2,
  Trash2,
  Edit3,
  Layers,
  Sparkles,
  Zap,
  Terminal,
  Server,
  Layout,
  Brain,
  Wrench,
} from 'lucide-react';
import { ProjectItem, TechStackItem } from '@/types';

export default function ProjectsPage() {
  const {
    projects = [],
    techStack = [],
    updateProject,
    addProject,
    deleteProject,
    addTechStackItem,
    deleteTechStackItem,
  } = useStepwiseStore();

  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeTechStack = Array.isArray(techStack) ? techStack : [];

  // Category Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Add Project Modal State
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectItem['category']>('Web App');
  const [progress, setProgress] = useState('50');
  const [github, setGithub] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [status, setStatus] = useState<ProjectItem['status']>('in_progress');

  // Add Tech Stack Modal State
  const [isAddTechOpen, setIsAddTechOpen] = useState(false);
  const [techName, setTechName] = useState('');
  const [techCategory, setTechCategory] = useState<TechStackItem['category']>('Frontend & UI');
  const [proficiency, setProficiency] = useState<TechStackItem['proficiency']>('Proficient');
  const [techNotes, setTechNotes] = useState('');

  // Quick edit progress modal
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProgressValue, setEditProgressValue] = useState<number>(50);

  const categories = ['All', 'Web App', 'Desktop Tool', 'AI / ML', 'Systems', 'Other'];

  const filteredProjects = selectedCategory === 'All'
    ? safeProjects
    : safeProjects.filter((p) => (p.category || 'Web App') === selectedCategory);

  const activeProjectsCount = safeProjects.filter((p) => p.status === 'in_progress').length;
  const completedProjectsCount = safeProjects.filter((p) => p.status === 'completed').length;
  const avgProgress = safeProjects.length > 0
    ? Math.round(safeProjects.reduce((acc, p) => acc + (p.progress || 0), 0) / safeProjects.length)
    : 0;

  const handleAddProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const stack = techStackInput
      ? techStackInput.split(',').map((s) => s.trim()).filter(Boolean)
      : ['TypeScript'];

    addProject({
      title: title.trim(),
      description: description.trim(),
      category,
      progress: parseInt(progress, 10) || 0,
      github: github.trim() || undefined,
      tech_stack: stack,
      status,
    });

    setTitle('');
    setDescription('');
    setGithub('');
    setTechStackInput('');
    setIsAddProjectOpen(false);
  };

  const handleAddTechSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techName.trim()) return;

    addTechStackItem({
      name: techName.trim(),
      category: techCategory,
      proficiency,
      notes: techNotes.trim() || undefined,
    });

    setTechName('');
    setTechNotes('');
    setIsAddTechOpen(false);
  };

  const handleUpdateProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProjectId) return;
    updateProject(editingProjectId, editProgressValue);
    setEditingProjectId(null);
  };

  const getTechIcon = (cat: TechStackItem['category']) => {
    switch (cat) {
      case 'Frontend & UI': return <Layout className="w-4 h-4 text-blue-400" />;
      case 'Backend & Databases': return <Server className="w-4 h-4 text-emerald-400" />;
      case 'Systems & Low Level': return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'AI & Data Science': return <Brain className="w-4 h-4 text-purple-400" />;
      default: return <Wrench className="w-4 h-4 text-pink-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Projects & Tech Stack Showcase
            <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase">
              Lab & Stack
            </span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Miscellaneous project laboratory, engineering builds, and development technology stack matrix.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddTechOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 text-xs font-bold transition-all"
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>+ Add Tech Tool</span>
          </button>

          <button
            onClick={() => setIsAddProjectOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4 fill-black" />
            <span>+ Create Project (+30 XP)</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl glass-card border border-amber-500/20 bg-amber-950/10 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-amber-400">
            <span>Total Projects</span>
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white">{projects.length}</div>
          <p className="text-[10px] text-zinc-400">Active Build Suite</p>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-blue-500/20 bg-blue-950/10 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-blue-400">
            <span>In Development</span>
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white">{activeProjectsCount}</div>
          <p className="text-[10px] text-zinc-400">Active Sprint Builds</p>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-emerald-500/20 bg-emerald-950/10 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
            <span>Completed & Shipped</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white">{completedProjectsCount}</div>
          <p className="text-[10px] text-zinc-400">Production Released</p>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-purple-500/20 bg-purple-950/10 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-purple-400">
            <span>Average Progress</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white">{avgProgress}%</div>
          <p className="text-[10px] text-zinc-400">Completion Index</p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900/90 text-zinc-400 border border-white/5 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Project Showcase Board */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-amber-400" />
            Project Showcase & Lab Builds
          </h3>
          <span className="text-xs text-zinc-400 font-mono">
            {filteredProjects.length} Projects Displayed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="p-6 rounded-3xl glass-card border border-white/10 space-y-5 hover:border-amber-500/30 transition-all group relative"
            >
              {/* Top Row */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {project.category}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase border ${
                        project.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : project.status === 'in_progress'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-zinc-800 text-zinc-400 border-white/10'
                      }`}
                    >
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-lg font-extrabold text-white group-hover:text-amber-400 transition-colors">
                    {project.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingProjectId(project.id);
                      setEditProgressValue(project.progress);
                    }}
                    className="p-2 rounded-xl text-zinc-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
                    title="Update Progress"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {project.description}
                </p>
              )}

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(project.tech_stack || []).map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-semibold">Build Completion</span>
                  <span className="font-extrabold font-mono text-amber-400">
                    {project.progress || 0}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* Footer Links */}
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
                <span className="text-[10px] font-mono text-zinc-500">
                  Updated: {project.updated_at || 'Recently'}
                </span>

                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View Repository</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack Tracker & Matrix */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Development Stack Tracker & Tool Matrix
            </h3>
            <p className="text-xs text-zinc-400">
              Personal engineering toolkit and proficiency tracker across languages, frameworks & platforms.
            </p>
          </div>
          <button
            onClick={() => setIsAddTechOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold hover:bg-purple-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Tool</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeTechStack.map((tech) => (
            <div
              key={tech.id}
              className="p-4 rounded-2xl bg-zinc-900/80 border border-white/5 space-y-2 hover:border-purple-500/30 transition-all relative group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getTechIcon(tech.category)}
                  <h5 className="text-xs font-bold text-white">{tech.name}</h5>
                </div>

                <button
                  onClick={() => deleteTechStackItem(tech.id)}
                  className="text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                <span className="text-zinc-400 uppercase tracking-wider font-mono">{tech.category}</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                    tech.proficiency === 'Mastered'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : tech.proficiency === 'Proficient'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {tech.proficiency}
                </span>
              </div>

              {tech.notes && (
                <p className="text-[10px] text-zinc-400 italic pt-1">
                  "{tech.notes}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Project Modal */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg p-6 rounded-3xl glass-panel border border-white/20 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Create New Project</h3>
                  <p className="text-xs text-zinc-400">Add project to laboratory showcase (+30 XP)</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. FlashPDF Reader Engine"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of architecture & features..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProjectItem['category'])}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Web App">Web App</option>
                    <option value="Desktop Tool">Desktop Tool</option>
                    <option value="AI / ML">AI / ML</option>
                    <option value="Systems">Systems</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectItem['status'])}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Completion %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    GitHub URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Tech Stack (Comma-separated)
                </label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="e.g. Next.js 15, TypeScript, WebAudio API"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddProjectOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Code className="w-4 h-4" />
                  <span>Save Project (+30 XP)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Tech Tool Modal */}
      {isAddTechOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md p-6 rounded-3xl glass-panel border border-white/20 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Add Tech Tool / Language</h3>
                  <p className="text-xs text-zinc-400">Track development stack proficiency (+15 XP)</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddTechSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Tool / Language Name
                </label>
                <input
                  type="text"
                  required
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  placeholder="e.g. Rust / WebAssembly"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={techCategory}
                    onChange={(e) => setTechCategory(e.target.value as TechStackItem['category'])}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Frontend & UI">Frontend & UI</option>
                    <option value="Backend & Databases">Backend & Databases</option>
                    <option value="Systems & Low Level">Systems & Low Level</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="DevOps & Tooling">DevOps & Tooling</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Proficiency
                  </label>
                  <select
                    value={proficiency}
                    onChange={(e) => setProficiency(e.target.value as TechStackItem['proficiency'])}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Learning">Learning</option>
                    <option value="Proficient">Proficient</option>
                    <option value="Mastered">Mastered</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Usage Notes (Optional)
                </label>
                <input
                  type="text"
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  placeholder="e.g. Used for high-speed PDF parsing"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddTechOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-1.5"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Save Tool (+15 XP)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Progress Update Modal */}
      {editingProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm p-6 rounded-3xl glass-panel border border-white/20 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-base font-extrabold text-white">Update Progress %</h3>
              <button
                onClick={() => setEditingProjectId(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProgressSubmit} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-300 mb-2">
                  <span>Completion Percentage</span>
                  <span className="font-mono text-amber-400">{editProgressValue}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editProgressValue}
                  onChange={(e) => setEditProgressValue(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all"
              >
                Save Completion (+20 XP)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
