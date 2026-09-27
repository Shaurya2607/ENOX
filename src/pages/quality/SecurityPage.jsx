import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { securityService } from '../../services/securityService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Package,
  Wand2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export const SecurityPage = () => {
  const navigate = useNavigate();
  const { isFixApplied, setFixApplied } = useAppStore();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [explainContent, setExplainContent] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadSecurity() {
      const data = await securityService.getSecurityReport();
      setReport(data);
      setLoading(false);
    }
    loadSecurity();
  }, [isFixApplied]);

  const handleRunScan = async () => {
    setIsScanning(true);
    toast.info('Triggering SAST, SCA, and AST secret scanner...');
    const result = await securityService.runSecurityScan();
    setReport(result);
    setIsScanning(false);
    toast.success('Security scan complete!');
  };

  const handleFixWithEnox = async (finding) => {
    setActionLoading(true);
    const res = await securityService.fixFinding(finding.id);
    setActionLoading(false);
    setReport({ ...report });
    toast.success(res.message);
  };

  const handleIgnore = async (finding) => {
    await securityService.ignoreFinding(finding.id);
    setReport({ ...report });
    toast.info(`Finding ${finding.id} suppressed for this cycle`);
  };

  const handleExplain = async (finding) => {
    setSelectedFinding(finding);
    const exp = await securityService.explainFinding(finding);
    setExplainContent(exp);
    setExplainModalOpen(true);
  };

  if (loading || !report) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading Security Audit...</div>;
  }

  const categoryIcons = {
    vulnerability: <ShieldAlert className="w-4 h-4 text-rose-400" />,
    dependency: <Package className="w-4 h-4 text-amber-400" />,
    secret: <Lock className="w-4 h-4 text-rose-400" />,
    outdated: <AlertTriangle className="w-4 h-4 text-cyan-400" />,
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-enox-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Security & SAST Posture Center
              <Badge variant={report.score >= 90 ? 'success' : 'danger'} size="sm">
                Score: {report.score}/100
              </Badge>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Automated static application security testing (SAST), software composition (SCA), and secret leakage audit.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRunScan}
            loading={isScanning}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Run Security Scan
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/debugging')}
            icon={<Wand2 className="w-3.5 h-3.5" />}
          >
            Remediate with ENOX
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <Card className="p-3.5 bg-slate-950/40">
          <span className="text-[11px] text-slate-400 block mb-1">Overall Security Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">{report.score}</span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
        </Card>

        <Card className="p-3.5 bg-slate-950/40 border-rose-900/60">
          <span className="text-[11px] text-slate-400 block mb-1">Critical Severity</span>
          <span className="text-2xl font-bold font-mono text-rose-400">{report.critical}</span>
        </Card>

        <Card className="p-3.5 bg-slate-950/40 border-amber-900/60">
          <span className="text-[11px] text-slate-400 block mb-1">High Severity</span>
          <span className="text-2xl font-bold font-mono text-amber-400">{report.high}</span>
        </Card>

        <Card className="p-3.5 bg-slate-950/40">
          <span className="text-[11px] text-slate-400 block mb-1">Medium Severity</span>
          <span className="text-2xl font-bold font-mono text-cyan-400">{report.medium}</span>
        </Card>

        <Card className="p-3.5 bg-slate-950/40">
          <span className="text-[11px] text-slate-400 block mb-1">Low Severity</span>
          <span className="text-2xl font-bold font-mono text-slate-300">{report.low}</span>
        </Card>
      </div>

      {/* Security Findings List */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Vulnerabilities & Risk Findings</h3>
            <p className="text-xs text-slate-400">
              Remediate surface vulnerabilities with autonomous ENOX patch synthesis
            </p>
          </div>
          <Badge variant="purple" size="sm">{report.findings.length} Discovered</Badge>
        </div>

        <div className="space-y-3">
          {report.findings.map((f) => {
            const isResolved = f.status === 'resolved';
            const isIgnored = f.status === 'ignored';

            return (
              <div
                key={f.id}
                className={`p-4 rounded-xl border transition ${
                  isResolved
                    ? 'bg-slate-950/30 border-emerald-900/50 opacity-80'
                    : f.severity === 'Critical'
                    ? 'bg-rose-950/20 border-rose-800/80 hover:bg-rose-950/30'
                    : 'bg-slate-900/60 border-enox-border hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                      {categoryIcons[f.category]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                        {f.title}
                        {f.cve && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {f.cve}
                          </span>
                        )}
                      </h4>
                      <span className="text-[11px] font-mono text-indigo-400">{f.fileOrPackage}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={isResolved ? 'success' : f.severity === 'Critical' ? 'danger' : f.severity === 'High' ? 'warning' : 'info'}
                      size="sm"
                    >
                      {isResolved ? 'RESOLVED' : isIgnored ? 'IGNORED' : f.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-2 leading-relaxed font-sans">
                  {f.explanation}
                </p>

                <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400 mb-3">
                  <strong className="text-indigo-400 font-medium">Remediation: </strong>
                  {f.remediation}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleExplain(f)}
                    icon={<Sparkles className="w-3 h-3 text-indigo-400" />}
                  >
                    Explain
                  </Button>
                  {!isResolved && !isIgnored && (
                    <>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleIgnore(f)}
                        icon={<EyeOff className="w-3 h-3 text-slate-500" />}
                      >
                        Ignore
                      </Button>
                      <Button
                        variant="primary"
                        size="xs"
                        loading={actionLoading}
                        onClick={() => handleFixWithEnox(f)}
                        icon={<Wand2 className="w-3 h-3" />}
                      >
                        Fix with ENOX
                      </Button>
                    </>
                  )}
                  {isResolved && (
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Patch Applied
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* EXPLAIN MODAL */}
      <Modal
        isOpen={explainModalOpen}
        onClose={() => setExplainModalOpen(false)}
        title={`Vulnerability Diagnostics: ${selectedFinding?.title}`}
        description="Detailed threat analysis and zero-trust remediation guidance."
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-slate-950 border border-enox-border text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
            {explainContent}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setExplainModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setExplainModalOpen(false);
                handleFixWithEnox(selectedFinding);
              }}
            >
              Apply Remediation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
