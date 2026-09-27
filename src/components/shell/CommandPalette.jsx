import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import {
  Search,
  FolderGit2,
  FileCode2,
  AlertCircle,
  Cpu,
  Rocket,
  FileText,
  Sliders,
  CheckCircle,
  X,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const CommandPalette = () => {
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Search items across the entire platform
  const items = [
    // Projects
    { id: 'p1', title: 'SentinelIQ', category: 'Projects', subtitle: 'AI Threat Intelligence Platform', icon: <FolderGit2 className="w-4 h-4 text-cyan-400" />, path: '/projects' },
    { id: 'p2', title: 'CIPHER_X', category: 'Projects', subtitle: 'Zero-Trust Cryptographic Engine', icon: <FolderGit2 className="w-4 h-4 text-emerald-400" />, path: '/projects' },
    { id: 'p3', title: 'CricPilot', category: 'Projects', subtitle: 'Autonomous High-Throughput Engine', icon: <FolderGit2 className="w-4 h-4 text-amber-400" />, path: '/projects' },

    // Files
    { id: 'f1', title: 'incidentOrchestrator.ts', category: 'Files', subtitle: 'src/services/incidentOrchestrator.ts', icon: <FileCode2 className="w-4 h-4 text-blue-400" />, path: '/repository' },
    { id: 'f2', title: 'threatAnalyzer.py', category: 'Files', subtitle: 'src/services/threatAnalyzer.py', icon: <FileCode2 className="w-4 h-4 text-blue-400" />, path: '/repository' },
    { id: 'f3', title: 'redis.ts', category: 'Files', subtitle: 'src/infra/redis.ts', icon: <FileCode2 className="w-4 h-4 text-blue-400" />, path: '/repository' },

    // Issues
    { id: 'i1', title: 'ISSUE-9421: Production deployment failed.', category: 'Issues', subtitle: 'P0 Incident - Lock contention canary crash loop', icon: <AlertCircle className="w-4 h-4 text-rose-400" />, path: '/issues' },
    { id: 'i2', title: 'ISSUE-8812: High memory consumption in worker', category: 'Issues', subtitle: 'CUDA VRAM leak optimization', icon: <AlertCircle className="w-4 h-4 text-amber-400" />, path: '/issues' },

    // AI Tasks & Debugging
    { id: 'a1', title: 'Investigate canary crash loop with ENOX', category: 'AI Tasks', subtitle: '3-way parallel agent execution triage', icon: <Cpu className="w-4 h-4 text-indigo-400" />, path: '/agent' },
    { id: 'a2', title: 'Debugging Workspace', category: 'AI Tasks', subtitle: 'Signature AST diff analysis & fix generator', icon: <Cpu className="w-4 h-4 text-indigo-400" />, path: '/debugging' },

    // Deployments
    { id: 'd1', title: 'Deployment dep-9041 (Canary Rollback)', category: 'Deployments', subtitle: 'SentinelIQ v2.8.4-rc2 us-east-1', icon: <Rocket className="w-4 h-4 text-rose-400" />, path: '/deployments' },
    { id: 'd2', title: 'Deployment dep-9039 (Success)', category: 'Deployments', subtitle: 'CIPHER_X v4.1.0 Multi-Region', icon: <Rocket className="w-4 h-4 text-emerald-400" />, path: '/deployments' },

    // Documentation
    { id: 'doc1', title: 'Architecture_v3.pdf', category: 'Documentation', subtitle: 'Indexed: Distributed locking specs & failover', icon: <FileText className="w-4 h-4 text-slate-400" />, path: '/agent' },
    { id: 'doc2', title: 'README.md', category: 'Documentation', subtitle: 'Indexed: SentinelIQ Developer guide', icon: <FileText className="w-4 h-4 text-slate-400" />, path: '/agent' },

    // Navigation shortcuts
    { id: 'n1', title: 'Dashboard Command Center', category: 'Navigation', subtitle: 'KPIs, project health & autonomy', icon: <Sliders className="w-4 h-4 text-indigo-400" />, path: '/' },
    { id: 'n2', title: 'Code Review PR-428', category: 'Navigation', subtitle: 'Monaco Diff & automated security review', icon: <CheckCircle className="w-4 h-4 text-cyan-400" />, path: '/code-review' },
    { id: 'n3', title: 'Testing Suite & Regression', category: 'Navigation', subtitle: '148 unit & concurrency test specs', icon: <CheckCircle className="w-4 h-4 text-emerald-400" />, path: '/testing' },
    { id: 'n4', title: 'Workflows Studio', category: 'Navigation', subtitle: 'React Flow autonomous pipeline designer', icon: <Sliders className="w-4 h-4 text-purple-400" />, path: '/workflows' },
  ];

  // Filter items
  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard shortcut listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const handleSelect = (item) => {
    setCommandPaletteOpen(false);
    navigate(item.path);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      }
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={() => setCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-enox-surface border border-enox-border rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-enox-border bg-slate-900/60">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search projects, files, issues, AI tasks, deployments, docs... (↑↓ to select, Enter to open)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No matching assets or commands found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-100',
                    isSelected
                      ? 'bg-indigo-600/20 text-slate-100 border border-indigo-500/40'
                      : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded bg-slate-800 border border-slate-700 shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate text-slate-200">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-enox-border flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">↵</kbd> select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">esc</kbd> close
            </span>
          </div>
          <span className="font-mono text-indigo-400">ENOX QuickSwitch</span>
        </div>
      </div>
    </div>
  );
};
