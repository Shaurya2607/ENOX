import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { deploymentService } from '../../services/deploymentService';
import { notificationService } from '../../services/notificationService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  Rocket,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Play,
  Terminal,
  Clock,
  GitCommit,
  GitBranch,
  Server,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export const DeploymentsPage = () => {
  const navigate = useNavigate();
  const { isFixApplied, isDeployed, setDeployed } = useAppStore();

  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDeployment, setActiveDeployment] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);

  useEffect(() => {
    async function loadData() {
      const data = await deploymentService.getDeployments();
      setDeployments(data);
      setActiveDeployment(data[0]);
      setLoading(false);
    }
    loadData();
  }, [isDeployed]);

  // Trigger deployment with animated stage progression
  const handleTriggerDeploy = async () => {
    setIsDeploying(true);
    toast.info('Starting production canary deployment pipeline...');

    const newDep = await deploymentService.triggerDeployment('SentinelIQ', (idx, name, status) => {
      setActiveDeployment((prev) => {
        if (!prev) return prev;
        const stages = [...prev.stages];
        stages[idx] = { ...stages[idx], status };
        return { ...prev, stages };
      });
    });

    setDeployments([newDep, ...deployments]);
    setActiveDeployment(newDep);
    setDeployed(true);
    setIsDeploying(false);

    await notificationService.recordActivity({
      user: 'ENOX Autonomous Agent',
      action: 'Canary deployment v2.8.5-stable verified and healthy at 100% traffic',
      category: 'deployment',
      project: 'SentinelIQ',
      status: 'success',
      details: 'All 6 delivery pipeline stages verified. Zero 502 Bad Gateways.',
    });

    await notificationService.addNotification({
      title: 'Production Canary Deployed (v2.8.5)',
      message: 'SentinelIQ rollout complete across 14 clusters with 0 errors.',
      category: 'Deployments',
      severity: 'success',
      link: '/monitoring',
    });

    toast.success('Production deployment completed! Cluster healthy.');
  };

  const handleRollback = async (depId) => {
    setIsRollingBack(true);
    toast.warning('Rolling back canary to previous stable release digest...');
    const rollbackDep = await deploymentService.rollbackDeployment(depId);
    setDeployments([rollbackDep, ...deployments]);
    setActiveDeployment(rollbackDep);
    setDeployed(false);
    setIsRollingBack(false);
    toast.success('Rollback completed. Prior stable version active.');
  };

  const handleViewLogs = (dep) => {
    setSelectedLogs([
      `[03:00:12] Ingress canary gate opened at 10% traffic in us-east-1`,
      `[03:00:15] Health probe status check: 200 OK across all pods`,
      `[03:00:20] Lock contention metric: 0ms queue latency`,
      `[03:00:28] Scaled canary from 10% to 100% production traffic`,
      `[03:00:35] Zero HTTP 5xx errors recorded over 12,000 requests`,
    ]);
    setLogsModalOpen(true);
  };

  if (loading || !activeDeployment) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading Deployments...</div>;
  }

  const isLive = activeDeployment.status === 'success';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-enox-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Continuous Delivery & Canary Pipeline
              <Badge variant={isLive ? 'success' : 'danger'} size="sm">
                {isLive ? 'Production Healthy' : 'Canary Rollback Required'}
              </Badge>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Multi-stage autonomous pipeline orchestrator with real-time canary gate analysis and instant rollbacks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleRollback(activeDeployment.id)}
            loading={isRollingBack}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Rollback
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleTriggerDeploy}
            loading={isDeploying}
            icon={<Rocket className="w-3.5 h-3.5" />}
          >
            Trigger Canary Deploy
          </Button>
        </div>
      </div>

      {/* Production Status Command Card */}
      <Card className="p-6 bg-slate-950/60 border-indigo-900/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-enox-border">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Active Production Deployment &bull; us-east-1
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white">{activeDeployment.version}</h2>
              <Badge variant={isLive ? 'success' : 'danger'} dot size="sm">
                {activeDeployment.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <GitCommit className="w-3 h-3 text-indigo-400" />
                {activeDeployment.commit}
              </span>
              <span>&bull;</span>
              <span>Author: {activeDeployment.author}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewLogs(activeDeployment)}
              icon={<Terminal className="w-3.5 h-3.5 text-slate-400" />}
            >
              View Ingress Logs
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/monitoring')}
              icon={<ArrowRight className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Cluster Monitoring
            </Button>
          </div>
        </div>

        {/* 6-Stage Delivery Pipeline Animation */}
        <div className="pt-5 space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Pipeline Execution Stages (Build &rarr; Canary Rollout &rarr; Health Probe)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-center text-xs">
            {activeDeployment.stages.map((stage, idx) => {
              const isRunning = stage.status === 'running';
              const isSuccess = stage.status === 'success';
              const isFailed = stage.status === 'failed';

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex flex-col justify-between transition ${
                    isRunning
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 animate-pulse'
                      : isSuccess
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : isFailed
                      ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                      : 'bg-slate-900/60 border-enox-border text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono opacity-60">Stage {idx + 1}</span>
                    {isRunning ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    ) : isSuccess ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-700" />
                    )}
                  </div>

                  <span className="font-semibold text-[11px] line-clamp-2">{stage.name}</span>
                  <span className="text-[10px] font-mono mt-2 block opacity-70">
                    {stage.duration || '0s'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Deployment History Table */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-100 mb-4">Historical Rollouts & Canary Runs</h3>

        <div className="space-y-2.5">
          {deployments.map((dep) => (
            <div
              key={dep.id}
              onClick={() => setActiveDeployment(dep)}
              className="p-3 rounded-lg bg-slate-900/60 border border-enox-border hover:border-slate-700 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-slate-200">{dep.version}</span>
                  <Badge variant={dep.status === 'success' ? 'success' : 'danger'} size="sm">
                    {dep.status.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] text-slate-500 font-mono">{dep.project}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate">{dep.commit}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {dep.timestamp}
                </span>
                <Button variant="ghost" size="xs" onClick={() => handleViewLogs(dep)}>
                  Logs
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Logs Modal */}
      <Modal
        isOpen={logsModalOpen}
        onClose={() => setLogsModalOpen(false)}
        title="Ingress Traffic & Canary Health Probe Logs"
        description="Streamed from us-east-1 production Kubernetes ingress pods."
      >
        <div className="p-3 rounded-lg bg-slate-950 border border-enox-border font-mono text-xs text-cyan-300 space-y-1.5 max-h-60 overflow-y-auto">
          {selectedLogs.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
        <div className="flex justify-end pt-3">
          <Button variant="primary" size="sm" onClick={() => setLogsModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};
