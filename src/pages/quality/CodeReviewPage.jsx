import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { aiService } from '../../services/aiService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CodeViewer } from '../../components/ui/CodeViewer';
import {
  GitPullRequest,
  CheckCircle,
  ShieldCheck,
  Zap,
  Sparkles,
  GitBranch,
  FileCode,
  ArrowRight,
  Check,
  X,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

export const CodeReviewPage = () => {
  const navigate = useNavigate();
  const { isFixApplied, isPrCreated, setPrCreated } = useAppStore();

  const [pr, setPr] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('diff'); // 'diff' | 'ai' | 'security' | 'performance'
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    async function loadPR() {
      const data = await aiService.getPullRequest('PR-428');
      setPr(data);
      if (data.changedFiles && data.changedFiles.length > 0) {
        setSelectedFile(data.changedFiles[0]);
      }
    }
    loadPR();
  }, []);

  const handleAcceptFinding = async (findingId) => {
    await aiService.acceptSuggestion(findingId);
    setPr((prev) => ({
      ...prev,
      findings: prev.findings.filter((f) => f.id !== findingId),
    }));
    toast.success('Suggestion accepted and applied to pull request!');
  };

  const handleRejectFinding = (findingId) => {
    setPr((prev) => ({
      ...prev,
      findings: prev.findings.filter((f) => f.id !== findingId),
    }));
    toast.info('Suggestion dismissed');
  };

  const handleMergePR = async () => {
    setLoadingAction(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoadingAction(false);
    setPrCreated(true);
    setPr((prev) => ({ ...prev, status: 'merged' }));
    toast.success('Pull Request PR-428 merged into main!');
  };

  if (!pr) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading Code Review...</div>;
  }

  return (
    <div className="space-y-5">
      {/* PR Header Banner */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-enox-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-mono text-sm font-bold text-indigo-400">{pr.id}</span>
            <Badge variant={pr.status === 'merged' ? 'purple' : 'success'} size="sm">
              {pr.status === 'merged' ? 'MERGED' : 'OPEN'}
            </Badge>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              {pr.branch} &rarr; {pr.targetBranch}
            </span>
          </div>

          <h1 className="text-lg font-bold text-white tracking-tight">
            {pr.title}
          </h1>

          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
            <span>Author: <strong className="text-slate-200">{pr.author}</strong></span>
            <span>&bull;</span>
            <span className="text-emerald-400 font-mono font-medium">+{pr.additions} lines</span>
            <span>&bull;</span>
            <span className="text-rose-400 font-mono font-medium">-{pr.deletions} lines</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/testing')}
            icon={<ArrowRight className="w-3.5 h-3.5 text-indigo-400" />}
          >
            Run Tests
          </Button>
          {pr.status !== 'merged' && (
            <Button
              variant="primary"
              size="sm"
              loading={loadingAction}
              onClick={handleMergePR}
              icon={<CheckCircle className="w-3.5 h-3.5" />}
            >
              Approve & Merge PR
            </Button>
          )}
        </div>
      </div>

      {/* Tri-Review Cards: AI Review, Security Review, Performance Review */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-3.5 bg-slate-950/60 border-indigo-900/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI Code Review
            </span>
            <Badge variant="purple" size="sm">Optimal</Badge>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-3">
            {pr.aiReviewSummary}
          </p>
        </Card>

        <Card className="p-3.5 bg-slate-950/60 border-emerald-900/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Security Audit
            </span>
            <Badge variant="success" size="sm">Passed</Badge>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-3">
            {pr.securityReviewSummary}
          </p>
        </Card>

        <Card className="p-3.5 bg-slate-950/60 border-cyan-900/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Performance Impact
            </span>
            <Badge variant="info" size="sm">+412% req/s</Badge>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-3">
            {pr.performanceReviewSummary}
          </p>
        </Card>
      </div>

      {/* Automated Inline Findings */}
      {pr.findings && pr.findings.length > 0 && (
        <Card className="p-4 bg-indigo-950/20 border-indigo-800/60">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-cyan-400" />
              Automated Code Suggestions & Lint Annotations ({pr.findings.length})
            </h3>
          </div>

          <div className="space-y-2">
            {pr.findings.map((f) => (
              <div
                key={f.id}
                className="p-3 rounded-lg bg-slate-950 border border-enox-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] text-indigo-400">
                      {f.file}:{f.line}
                    </span>
                    <Badge variant={f.severity === 'high' ? 'danger' : 'info'} size="sm">
                      {f.severity}
                    </Badge>
                  </div>
                  <p className="text-slate-300 mb-1">{f.explanation}</p>
                  {f.suggestedFix && (
                    <code className="text-[11px] font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded">
                      {f.suggestedFix}
                    </code>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleRejectFinding(f.id)}
                    icon={<X className="w-3.5 h-3.5 text-rose-400" />}
                  >
                    Dismiss
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => handleAcceptFinding(f.id)}
                    icon={<Check className="w-3.5 h-3.5 text-emerald-400" />}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Changed Files Tabs & Monaco Diff Viewer */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
              Changed File: {selectedFile?.filename}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Split Mode &bull; Monaco Engine
          </span>
        </div>

        {selectedFile && (
          <CodeViewer
            isDiff={true}
            originalValue={selectedFile.originalCode}
            value={selectedFile.modifiedCode}
            language={selectedFile.language || 'typescript'}
            height="380px"
          />
        )}
      </Card>
    </div>
  );
};
