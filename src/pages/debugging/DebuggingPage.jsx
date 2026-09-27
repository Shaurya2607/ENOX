import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { debuggingService } from '../../services/debuggingService';
import { notificationService } from '../../services/notificationService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CodeViewer } from '../../components/ui/CodeViewer';
import { ENOXCore } from '../../components/ui/ENOXCore';
import {
  Bug,
  Sparkles,
  Wand2,
  CheckCircle2,
  ArrowRight,
  GitCommit,
  GitBranch,
  Server,
  FileCode,
  Terminal,
  Loader2,
  RefreshCw,
  HelpCircle,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export const DebuggingPage = () => {
  const navigate = useNavigate();
  const { isFixApplied, setFixApplied, setEnoxStatus } = useAppStore();

  const [context, setContext] = useState(null);
  const [loadingContext, setLoadingContext] = useState(true);

  // Editable error inputs
  const [errorMessage, setErrorMessage] = useState('');
  const [stackTrace, setStackTrace] = useState('');
  const [logs, setLogs] = useState('');

  // Execution states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysis, setAnalysis] = useState(null);

  // Fix generation states
  const [isGeneratingFix, setIsGeneratingFix] = useState(false);
  const [fixResult, setFixResult] = useState(null);
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(isFixApplied);

  // Ask ENOX input
  const [enoxQuery, setEnoxQuery] = useState('');
  const [enoxAnswer, setEnoxAnswer] = useState('');
  const [askingEnox, setAskingEnox] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await debuggingService.getDebugContext('ISSUE-9421');
        setContext(data);
        setErrorMessage(data.errorMessage);
        setStackTrace(data.stackTrace);
        setLogs(data.logs);
        setLoadingContext(false);

        // Preload analysis for immediate presentation
        const initialAnalysis = await debuggingService.analyzeError(data);
        setAnalysis(initialAnalysis);

        // Preload fix result
        const fix = await debuggingService.generateFix('ISSUE-9421');
        setFixResult(fix);
      } catch (err) {
        setLoadingContext(false);
        toast.error(err?.message || 'Failed to load debugging workspace context.');
      }
    }
    loadData();
  }, []);

  // Run stepped analysis
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setEnoxStatus('analyzing');

    const steps = [
      'Analyzing stack trace & frames...',
      'Decompiling affected symbols in incidentOrchestrator.ts...',
      'Inspecting recent commits and PR changes...',
      'Synthesizing root cause and confidence model...',
    ];

    try {
      for (const step of steps) {
        setAnalysisStep(step);
        await new Promise((r) => setTimeout(r, 450));
      }

      const res = await debuggingService.analyzeError({ errorMessage, stackTrace, logs });
      setAnalysis(res);
      toast.success('ENOX Root Cause Analysis confirmed (96.8% confidence)');
    } catch (err) {
      toast.error(err?.message || 'ENOX analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setEnoxStatus('idle');
    }
  };

  // Generate fix action
  const handleGenerateFix = async () => {
    setIsGeneratingFix(true);
    setEnoxStatus('thinking');

    try {
      await new Promise((r) => setTimeout(r, 900));
      const fix = await debuggingService.generateFix('ISSUE-9421');
      setFixResult(fix);
      toast.success('Candidate patch diff generated with exponential backoff jitter!');
    } catch (err) {
      toast.error(err?.message || 'ENOX fix generation failed. Please try again.');
    } finally {
      setIsGeneratingFix(false);
      setEnoxStatus('idle');
    }
  };

  // Apply fix action
  const handleApplyFix = async () => {
    setIsApplyingFix(true);
    setEnoxStatus('executing');

    try {
      const res = await debuggingService.applyFix('ISSUE-9421');
      setFixApplied(true);
      setAppliedSuccess(true);
      setEnoxStatus('success');

      // Record activity and notification
      await notificationService.recordActivity({
        user: 'Alex Vance',
        action: 'Applied ENOX automated patch for ISSUE-9421',
        category: 'ai',
        project: 'SentinelIQ',
        status: 'success',
        details: 'Committed 4a19b80e with adaptive lock retry jitter and non-blocking fallback.',
      });

      await notificationService.addNotification({
        title: 'Fix Applied: ISSUE-9421 Resolved',
        message: 'Adaptive retry jitter patch committed to branch enox/fix-issue-9421-lock-contention.',
        category: 'AI',
        severity: 'success',
        link: '/code-review',
      });

      toast.success(res.message);
    } catch (err) {
      setEnoxStatus('idle');
      toast.error(err?.message || 'Failed to apply fix. Please try again.');
    } finally {
      setIsApplyingFix(false);
    }
  };

  const handleAskEnox = async (e) => {
    e?.preventDefault();
    if (!enoxQuery.trim()) return;
    setAskingEnox(true);
    try {
      const ans = await debuggingService.askEnox(enoxQuery);
      setEnoxAnswer(ans);
    } catch (err) {
      toast.error(err?.message || 'ENOX AI failed to respond. Please try again.');
    } finally {
      // Always clear the loading state, even on failure, so the Ask button
      // never gets stuck spinning/"buffering" forever.
      setAskingEnox(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-enox-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Autonomous Debugging Workspace
              <Badge variant={appliedSuccess ? 'success' : 'danger'} size="sm">
                {appliedSuccess ? 'Fix Applied' : 'P0 Canary Incident Active'}
              </Badge>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Signature workspace: Telemetry error decompilation, AST root cause attribution, and interactive Monaco diff patch generator.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRunAnalysis}
            loading={isAnalyzing}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Re-Analyze Error
          </Button>
          {!appliedSuccess ? (
            <Button
              variant="primary"
              size="sm"
              loading={isApplyingFix}
              onClick={handleApplyFix}
              icon={<Wand2 className="w-3.5 h-3.5" />}
            >
              Apply Fix
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/testing')}
              icon={<ArrowRight className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Proceed to Test Suite
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Column (Inputs & Context), Right Column (Analysis & Diff) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Error Inputs & Operational Context (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Operational Context Card */}
          <Card className="p-4 bg-slate-950/40">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-slate-400 mb-3 flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              Runtime & Deployment Context
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-enox-border/60">
                <span className="text-slate-500">Service Project:</span>
                <span className="font-semibold text-slate-200">SentinelIQ (proj-sentinel-iq)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-enox-border/60">
                <span className="text-slate-500">Target Branch:</span>
                <span className="font-mono text-indigo-300 flex items-center gap-1">
                  <GitBranch className="w-3 h-3" /> main (commit 3f8a92e)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-enox-border/60">
                <span className="text-slate-500">Cluster Pod:</span>
                <span className="font-mono text-rose-300">sentinel-api-7b8f9c-9x2l</span>
              </div>
              <div className="flex justify-between py-1 border-b border-enox-border/60">
                <span className="text-slate-500">Environment:</span>
                <span className="text-slate-200 font-mono">production-us-east-1 (K8s 1.30)</span>
              </div>

              {/* Recent Commits */}
              <div className="pt-2">
                <span className="text-slate-500 text-[11px] block mb-1.5">Recent Commits on Branch:</span>
                <div className="space-y-1">
                  {context?.recentCommits.map((c, i) => (
                    <div key={i} className="text-[10px] font-mono text-slate-400 truncate bg-slate-900/60 p-1.5 rounded border border-slate-800">
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Error Message Input */}
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-rose-400" />
              Captured Error Message
            </h3>
            <textarea
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-enox-border rounded-lg p-2.5 text-xs text-rose-300 font-mono focus:outline-none focus:border-indigo-500"
            />
          </Card>

          {/* Stack Trace Input */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Bug className="w-3.5 h-3.5 text-amber-400" />
                Raw Stack Trace
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Node.js V8 Frames</span>
            </div>
            <textarea
              value={stackTrace}
              onChange={(e) => setStackTrace(e.target.value)}
              rows={6}
              className="w-full bg-slate-950 border border-enox-border rounded-lg p-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
            />
          </Card>

          {/* Cluster Telemetry Logs */}
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Ingress & Container Logs
            </h3>
            <textarea
              value={logs}
              onChange={(e) => setLogs(e.target.value)}
              rows={5}
              className="w-full bg-slate-950 border border-enox-border rounded-lg p-2.5 text-xs text-slate-400 font-mono focus:outline-none focus:border-indigo-500"
            />
          </Card>
        </div>

        {/* RIGHT COLUMN: ENOX Analysis & Monaco Before/After Diff (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Analysis Card */}
          <Card className="p-5 border-indigo-900/60 bg-gradient-to-r from-enox-card to-slate-900/70">
            {isAnalyzing ? (
              <div className="py-10 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
                <div className="font-mono text-xs text-cyan-300 animate-pulse">{analysisStep}</div>
                <p className="text-[11px] text-slate-500">Autonomous AST reasoning in progress...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-enox-border">
                  <div className="flex items-center gap-3">
                    <ENOXCore status={appliedSuccess ? 'success' : 'analyzing'} size="md" showLabel={false} />
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        ENOX Root Cause Attributed
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Distributed Lock Contention Timeout & Unhandled Rejection
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold font-mono text-emerald-400">
                      {analysis.confidence}%
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Confidence</span>
                  </div>
                </div>

                {/* Root Cause Details */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-1">
                    Identified Root Cause:
                  </h4>
                  <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-lg border border-enox-border leading-relaxed font-sans">
                    {analysis.rootCause}
                  </p>
                </div>

                {/* Affected Files */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-1.5">
                    Attributed Files:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(analysis.affectedFiles || []).map((file) => (
                      <span
                        key={file}
                        className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-indigo-300 flex items-center gap-1.5"
                      >
                        <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                        {file}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Fix */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-1">
                    Recommended Fix Strategy:
                  </h4>
                  <p className="text-xs text-slate-300 bg-indigo-950/30 border border-indigo-800/60 p-3 rounded-lg leading-relaxed">
                    {analysis.recommendedFix}
                  </p>
                </div>

                {/* Fix Generation CTA Button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">
                    {appliedSuccess ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> Patch applied to buffer and committed (4a19b80e)
                      </span>
                    ) : (
                      'Review the Monaco split diff below before committing fix.'
                    )}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={handleGenerateFix}
                      loading={isGeneratingFix}
                      icon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                    >
                      Regenerate
                    </Button>
                    {!appliedSuccess && (
                      <Button
                        variant="primary"
                        size="xs"
                        loading={isApplyingFix}
                        onClick={handleApplyFix}
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Apply Fix to Repo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </Card>

          {/* SIGNATURE MONACO BEFORE / AFTER CODE DIFF */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  Code Diff: src/services/incidentOrchestrator.ts
                </h3>
                <p className="text-[11px] text-slate-400">
                  Left: Original Failing Lock &bull; Right: ENOX Adaptive Retry with Jitter
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  +28 lines
                </span>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                  -9 lines
                </span>
              </div>
            </div>

            {/* Monaco Diff Editor */}
            {fixResult && (
              <CodeViewer
                isDiff={true}
                originalValue={fixResult.originalCode}
                value={fixResult.fixedCode}
                language="typescript"
                height="340px"
              />
            )}
          </Card>

          {/* Ask ENOX about this error */}
          <Card className="p-4 bg-slate-950/40">
            <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              Ask ENOX About This Incident
            </h3>

            <form onSubmit={handleAskEnox} className="flex gap-2 mb-3">
              <input
                type="text"
                value={enoxQuery}
                onChange={(e) => setEnoxQuery(e.target.value)}
                placeholder="e.g. Why did the canary pod crash instead of failing gracefully?"
                className="flex-1 bg-enox-bg border border-enox-border rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                loading={askingEnox}
              >
                Ask
              </Button>
            </form>

            {enoxAnswer && (
              <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/60 text-xs text-slate-200 leading-relaxed animate-in fade-in">
                {enoxAnswer}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
