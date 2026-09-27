import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { repositoryService } from '../../services/repositoryService';
import { CodeViewer } from '../../components/ui/CodeViewer';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Search,
  Sparkles,
  ShieldCheck,
  Wand2,
  ChevronRight,
  ChevronDown,
  Code2,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export const RepositoryPage = () => {
  const { selectedProjectId } = useAppStore();
  const [fileTree, setFileTree] = useState([]);
  const [openFolders, setOpenFolders] = useState({ src: true, 'src/services': true });
  const [selectedFile, setSelectedFile] = useState(null);
  const [openTabs, setOpenTabs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // AI Modal States
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [reviewResult, setReviewResult] = useState(null);
  const [modifyPrompt, setModifyPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadTree() {
      const tree = await repositoryService.getRepository(selectedProjectId);
      setFileTree(tree);

      // Default open incidentOrchestrator.ts
      const defaultFile = await repositoryService.getFile(selectedProjectId, 'src/services/incidentOrchestrator.ts');
      if (defaultFile) {
        setSelectedFile(defaultFile);
        setOpenTabs([defaultFile]);
      }
    }
    loadTree();
  }, [selectedProjectId]);

  const toggleFolder = (path) => {
    setOpenFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleSelectFile = (file) => {
    if (file.type === 'folder') {
      toggleFolder(file.path);
      return;
    }
    setSelectedFile(file);
    if (!openTabs.find((t) => t.path === file.path)) {
      setOpenTabs([...openTabs, file]);
    }
  };

  const handleCloseTab = (path, e) => {
    e.stopPropagation();
    const nextTabs = openTabs.filter((t) => t.path !== path);
    setOpenTabs(nextTabs);
    if (selectedFile?.path === path) {
      setSelectedFile(nextTabs[nextTabs.length - 1] || null);
    }
  };

  const handleAiExplain = async () => {
    if (!selectedFile) return;
    setIsExplainOpen(true);
    setAiLoading(true);
    try {
      const response = await repositoryService.explainFile(selectedFile.path, selectedFile.content || '');
      setAiResponse(response);
    } catch (err) {
      toast.error('Failed to generate AI explanation');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiReview = async () => {
    if (!selectedFile) return;
    setIsReviewOpen(true);
    setAiLoading(true);
    try {
      const res = await repositoryService.reviewFile(selectedFile.path, selectedFile.content || '');
      setReviewResult(res);
    } catch (err) {
      toast.error('Failed to generate AI review');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiModify = async () => {
    if (!selectedFile || !modifyPrompt.trim()) return;
    setAiLoading(true);
    try {
      const modified = await repositoryService.modifyFileWithAI(selectedFile.path, modifyPrompt);
      setSelectedFile({
        ...selectedFile,
        content: `// [Modified by ENOX AI]\n${selectedFile.content}\n\n// Added retry jitter:\n${modified}`,
      });
      toast.success('AI modifications applied to buffer!');
      setIsModifyOpen(false);
      setModifyPrompt('');
    } catch (err) {
      toast.error('Failed to modify file');
    } finally {
      setAiLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  // Render recursive file tree
  const renderTree = (nodes) => {
    return (
      <div className="space-y-0.5">
        {nodes.map((node) => {
          if (node.type === 'folder') {
            const isOpen = openFolders[node.path];
            return (
              <div key={node.path}>
                <div
                  onClick={() => toggleFolder(node.path)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-slate-300 hover:bg-slate-800/80 cursor-pointer font-medium select-none"
                >
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  {isOpen ? (
                    <FolderOpen className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Folder className="w-4 h-4 text-indigo-400" />
                  )}
                  <span>{node.name}</span>
                </div>
                {isOpen && node.children && (
                  <div className="pl-4 border-l border-slate-800 ml-3">
                    {renderTree(node.children)}
                  </div>
                )}
              </div>
            );
          }

          const isSelected = selectedFile?.path === node.path;
          return (
            <div
              key={node.path}
              onClick={() => handleSelectFile(node)}
              className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer select-none transition ${
                isSelected
                  ? 'bg-indigo-600/20 text-indigo-300 font-semibold border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{node.name}</span>
              </div>
              {node.size && (
                <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">
                  {node.size}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-enox-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Repository Explorer
            <Badge variant="purple" size="sm">main branch</Badge>
          </h1>
          <p className="text-xs text-slate-400">
            Monaco source inspection, AST syntax highlighting, and inline AI explanation
          </p>
        </div>

        {/* AI Action toolbar */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAiExplain}
            disabled={!selectedFile}
            icon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
          >
            AI Explain
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAiReview}
            disabled={!selectedFile}
            icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
          >
            AI Review
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModifyOpen(true)}
            disabled={!selectedFile}
            icon={<Wand2 className="w-3.5 h-3.5" />}
          >
            AI Modify
          </Button>
        </div>
      </div>

      {/* Main IDE Layout: File Tree on left, Monaco Editor on right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-14rem)] min-h-[500px]">
        {/* Left Column: File Tree */}
        <div className="lg:col-span-1 bg-enox-card border border-enox-border rounded-xl p-3 flex flex-col overflow-hidden">
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full bg-enox-bg border border-enox-border rounded-lg pl-8 pr-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {renderTree(fileTree)}
          </div>
        </div>

        {/* Right Column: Editor Workspace with Tabs */}
        <div className="lg:col-span-3 bg-enox-card border border-enox-border rounded-xl flex flex-col overflow-hidden">
          {/* Tabs bar */}
          <div className="flex items-center bg-slate-950/80 border-b border-enox-border px-2 overflow-x-auto">
            {openTabs.map((tab) => {
              const isActive = selectedFile?.path === tab.path;
              return (
                <div
                  key={tab.path}
                  onClick={() => setSelectedFile(tab)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs border-r border-enox-border cursor-pointer select-none transition ${
                    isActive
                      ? 'bg-enox-card text-indigo-300 font-semibold border-t-2 border-t-indigo-500'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{tab.name}</span>
                  <button
                    onClick={(e) => handleCloseTab(tab.path, e)}
                    className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-200"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 p-2 bg-slate-950">
            {selectedFile ? (
              <CodeViewer
                value={selectedFile.content || `// ${selectedFile.name}\n// File loaded successfully.`}
                language={selectedFile.language || 'typescript'}
                readOnly={false}
                height="100%"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Select a file from the repository tree to open in Monaco Editor.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI EXPLAIN MODAL */}
      <Modal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        title={
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            ENOX AI File Explanation: {selectedFile?.name}
          </span>
        }
        description="Deep contextual synthesis of code architecture, concurrency locks, and execution flow."
      >
        {aiLoading ? (
          <div className="py-8 text-center text-slate-400 text-xs font-mono">
            Synthesizing AST & distributed lock patterns...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-enox-border text-xs text-slate-200 font-sans whitespace-pre-line leading-relaxed">
              {aiResponse}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copyToClipboard(aiResponse)}
                icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? 'Copied' : 'Copy Explanation'}
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsExplainOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* AI REVIEW MODAL */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title="ENOX Automated Code Review"
        description="Static analysis, security patterns, and performance audit."
      >
        {aiLoading ? (
          <div className="py-8 text-center text-slate-400 text-xs font-mono">
            Running security & concurrency static analysis...
          </div>
        ) : reviewResult ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/60">
              <span className="text-xs font-semibold text-indigo-300">File Quality Index</span>
              <Badge variant="success" size="md">{reviewResult.score} / 100</Badge>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Automated Suggestions:</h4>
              <ul className="space-y-2">
                {reviewResult.suggestions.map((s, idx) => (
                  <li key={idx} className="p-2.5 rounded bg-slate-950 border border-enox-border text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-950 text-indigo-400 flex items-center justify-center text-[10px] shrink-0 font-mono mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setIsReviewOpen(false)}>
                Close Review
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* AI MODIFY MODAL */}
      <Modal
        isOpen={isModifyOpen}
        onClose={() => setIsModifyOpen(false)}
        title="AI Refactor & Modify File"
        description="Instruct ENOX to generate non-blocking async retries, patch deadlocks, or optimize memory."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Refactoring Instruction
            </label>
            <textarea
              value={modifyPrompt}
              onChange={(e) => setModifyPrompt(e.target.value)}
              placeholder="e.g. Implement adaptive exponential backoff retry jitter to prevent pod deadlock..."
              rows={3}
              className="w-full bg-enox-bg border border-enox-border rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsModifyOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={aiLoading}
              onClick={handleAiModify}
              icon={<Wand2 className="w-3.5 h-3.5" />}
            >
              Generate & Apply Refactor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
