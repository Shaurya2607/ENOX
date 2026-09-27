import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { mockCodeMetrics, mockCodeFindings } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  Sparkles,
  ShieldAlert,
  Sliders,
  CheckCircle,
  FileCode,
  ArrowRight,
  Bot,
  Wand2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export const CodeIntelligencePage = () => {
  const navigate = useNavigate();
  const { selectedProjectId, isFixApplied, setFixApplied } = useAppStore();

  const [metrics, setMetrics] = useState(mockCodeMetrics['proj-sentinel-iq']);
  const [findings, setFindings] = useState(mockCodeFindings['proj-sentinel-iq'] || []);
  const [activeFinding, setActiveFinding] = useState(null);
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    if (isFixApplied) {
      setMetrics({
        quality: 94,
        maintainability: 92,
        complexity: 48,
        security: 96,
      });
      // Mark critical deadlock finding resolved
      setFindings((prev) =>
        prev.map((f) =>
          f.id === 'find-01' ? { ...f, resolved: true, explanation: 'RESOLVED by ENOX adaptive retry patch.' } : f
        )
      );
    }
  }, [isFixApplied]);

  const handleApplyFix = async (finding) => {
    setLoadingAction(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoadingAction(false);

    if (finding.id === 'find-01') {
      setFixApplied(true);
      toast.success('Lock contention fix applied! Concurrency deadlock eliminated.');
    } else {
      setFindings((prev) =>
        prev.map((f) => (f.id === finding.id ? { ...f, resolved: true } : f))
      );
      toast.success(`Resolved ${finding.rule}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-enox-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Code Intelligence & AST Diagnostics
            <Badge variant="purple" size="sm">Deep Syntactic Analysis</Badge>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time static concurrency inspection, cryptographic safety, and automated AST transforms
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/debugging')}
          icon={<Bot className="w-3.5 h-3.5" />}
        >
          Debug with ENOX
        </Button>
      </div>

      {/* Code Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-950/40">
          <span className="text-xs text-slate-400 block mb-1">Code Quality Index</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">{metrics.quality}%</span>
            <Badge variant="success" size="sm">A+ Grade</Badge>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${metrics.quality}%` }} />
          </div>
        </Card>

        <Card className="p-4 bg-slate-950/40">
          <span className="text-xs text-slate-400 block mb-1">Maintainability Rating</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-400">{metrics.maintainability}%</span>
            <Badge variant="purple" size="sm">High</Badge>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${metrics.maintainability}%` }} />
          </div>
        </Card>

        <Card className="p-4 bg-slate-950/40">
          <span className="text-xs text-slate-400 block mb-1">Cyclomatic Complexity</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-400">{metrics.complexity}</span>
            <Badge variant="warning" size="sm">Linearized</Badge>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: `${metrics.complexity}%` }} />
          </div>
        </Card>

        <Card className="p-4 bg-slate-950/40">
          <span className="text-xs text-slate-400 block mb-1">Security AST Posture</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-400">{metrics.security}%</span>
            <Badge variant="info" size="sm">FIPS Clean</Badge>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${metrics.security}%` }} />
          </div>
        </Card>
      </div>

      {/* Code Findings Section */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Syntactic & Concurrency Findings</h3>
            <p className="text-xs text-slate-400">
              Direct AST inspection flagged the following code paths requiring remediation
            </p>
          </div>
          <Badge variant="outline" size="sm">{findings.length} Flagged Points</Badge>
        </div>

        <div className="space-y-3">
          {findings.map((item) => {
            const isResolved = item.resolved;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition ${
                  isResolved
                    ? 'bg-slate-950/40 border-emerald-900/60 text-slate-400'
                    : item.severity === 'critical'
                    ? 'bg-rose-950/20 border-rose-800/80 hover:bg-rose-950/30'
                    : 'bg-slate-900/60 border-enox-border hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isResolved ? 'success' : item.severity === 'critical' ? 'danger' : item.severity === 'high' ? 'warning' : 'info'}
                      size="sm"
                    >
                      {isResolved ? 'RESOLVED' : item.severity.toUpperCase()}
                    </Badge>
                    <span className="font-mono text-xs font-semibold text-slate-200">
                      {item.rule}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-indigo-400 flex items-center gap-1">
                    <FileCode className="w-3.5 h-3.5" />
                    {item.file}:{item.line}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                  {item.explanation}
                </p>

                <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 font-mono mb-3">
                  <strong className="text-indigo-400 font-medium">Recommended Fix: </strong>
                  {item.suggestedFix}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setActiveFinding(item);
                      setIsExplainOpen(true);
                    }}
                    icon={<Sparkles className="w-3 h-3 text-indigo-400" />}
                  >
                    Explain
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => navigate('/debugging')}
                    icon={<Bot className="w-3 h-3 text-cyan-400" />}
                  >
                    Ask ENOX
                  </Button>
                  {!isResolved && (
                    <Button
                      variant="primary"
                      size="xs"
                      loading={loadingAction}
                      onClick={() => handleApplyFix(item)}
                      icon={<Wand2 className="w-3 h-3" />}
                    >
                      Apply Fix
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* EXPLAIN MODAL */}
      <Modal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        title={`ENOX Diagnostics: ${activeFinding?.rule}`}
        description="Comprehensive AST analysis and security remediation guidance."
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-slate-950 border border-enox-border text-xs text-slate-300 leading-relaxed font-sans">
            <h4 className="font-semibold text-white mb-1">Issue Impact Analysis:</h4>
            <p className="mb-3">{activeFinding?.explanation}</p>
            <h4 className="font-semibold text-white mb-1">Underlying Concurrency Risk:</h4>
            <p className="text-slate-400 mb-3">
              When lock contention occurs without exponential backoff jitter, parallel worker nodes encounter synchronization starvation. In Kubernetes clusters with liveness probes, this triggers immediate pod restarts and 502 cascades.
            </p>
            <h4 className="font-semibold text-white mb-1">Autonomous Resolution Path:</h4>
            <p className="text-emerald-300 font-mono text-[11px]">
              {activeFinding?.suggestedFix}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsExplainOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsExplainOpen(false);
                handleApplyFix(activeFinding);
              }}
            >
              Apply Fix Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
