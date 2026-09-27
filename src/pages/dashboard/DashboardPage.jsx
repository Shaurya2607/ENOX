import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import {
  projectService,
  issueService,
  testingService,
  securityService,
  deploymentService,
  aiService,
  notificationService,
} from '../../services';
import { MetricCard } from '../../components/ui/MetricCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ENOXCore } from '../../components/ui/ENOXCore';
import {
  FolderGit2,
  AlertCircle,
  CheckSquare,
  Rocket,
  ShieldCheck,
  Cpu,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Play,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { enoxStatus, isFixApplied, isDeployed, isIssueResolved } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [testSuite, setTestSuite] = useState(null);
  const [securityReport, setSecurityReport] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [aiTasks, setAiTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [expandedActivity, setExpandedActivity] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadDashboardData() {
      try {
        const [p, i, t, s, d, a, act] = await Promise.all([
          projectService.getProjects(),
          issueService.getIssues(),
          testingService.getTestSuite(),
          securityService.getSecurityReport(),
          deploymentService.getDeployments(),
          aiService.getAITasks(),
          notificationService.getActivities(),
        ]);
        if (mounted) {
          setProjects(p);
          setIssues(i);
          setTestSuite(t);
          setSecurityReport(s);
          setDeployments(d);
          setAiTasks(a);
          setActivities(act);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    }
    loadDashboardData();
    return () => { mounted = false; };
  }, [isFixApplied, isDeployed, isIssueResolved]);

  // Radar metrics for project health
  const healthData = [
    { subject: 'Build Stability', value: isFixApplied ? 98 : 72 },
    { subject: 'Test Reliability', value: isFixApplied ? 96 : 84 },
    { subject: 'Security Posture', value: isFixApplied ? 96 : 68 },
    { subject: 'Code Coverage', value: isFixApplied ? 92 : 85 },
    { subject: 'Delivery Velocity', value: isDeployed ? 95 : 78 },
  ];

  // Productivity trend data (Before vs After ENOX)
  const productivityData = [
    { metric: 'Incident MTTR (mins)', before: 180, after: 14 },
    { metric: 'Root Cause Isolation (mins)', before: 45, after: 2 },
    { metric: 'Regression Test Turnaround (s)', before: 240, after: 28 },
    { metric: 'Patch Release Lead Time (mins)', before: 120, after: 8 },
  ];

  const openIssuesCount = isFixApplied || isIssueResolved ? 0 : issues.filter((i) => i.status === 'Open').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-enox-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white">Engineering Command Center</h1>
            <Badge variant="purple" size="sm">Workspace Live</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Real-time telemetry, automated triage, and autonomous agent orchestration across 5 core services.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/agent')}
            icon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
          >
            ENOX Agent Console
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/debugging')}
            icon={<Play className="w-3.5 h-3.5" />}
          >
            Launch P0 Debugger
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <MetricCard
          title="Active Projects"
          value={projects.length || 5}
          subtitle="All clusters synced"
          icon={<FolderGit2 className="w-4 h-4 text-cyan-400" />}
          loading={loading}
          onClick={() => navigate('/projects')}
        />
        <MetricCard
          title="Open Issues"
          value={openIssuesCount}
          subtitle={openIssuesCount > 0 ? '1 P0 Canary Block' : 'Zero blocking issues'}
          status={openIssuesCount > 0 ? 'critical' : 'success'}
          trend={openIssuesCount === 0 ? { value: 'Resolved', positive: true } : { value: 'P0 Spike', positive: false }}
          icon={<AlertCircle className="w-4 h-4 text-rose-400" />}
          loading={loading}
          onClick={() => navigate('/issues')}
        />
        <MetricCard
          title="Unit Tests"
          value={testSuite ? `${testSuite.passed}/${testSuite.total}` : '146/148'}
          subtitle={isFixApplied ? '100% Passing' : '2 Failing under load'}
          status={isFixApplied ? 'success' : 'warning'}
          icon={<CheckSquare className="w-4 h-4 text-emerald-400" />}
          loading={loading}
          onClick={() => navigate('/testing')}
        />
        <MetricCard
          title="Deployments"
          value={deployments.length || 3}
          subtitle={isDeployed ? 'Canary v2.8.5 Live' : 'Rollback active'}
          status={isDeployed ? 'success' : 'warning'}
          icon={<Rocket className="w-4 h-4 text-violet-400" />}
          loading={loading}
          onClick={() => navigate('/deployments')}
        />
        <MetricCard
          title="Security Score"
          value={securityReport ? `${securityReport.score}/100` : '68/100'}
          subtitle={isFixApplied ? 'SOC2 & FIPS Clean' : '1 Deadlock CVE'}
          status={isFixApplied ? 'success' : 'critical'}
          icon={<ShieldCheck className="w-4 h-4 text-indigo-400" />}
          loading={loading}
          onClick={() => navigate('/security')}
        />
        <MetricCard
          title="AI Tasks"
          value={aiTasks.length || 4}
          subtitle="3 Parallel Active"
          trend={{ value: '+410% Speed', positive: true }}
          icon={<Cpu className="w-4 h-4 text-amber-400" />}
          loading={loading}
          onClick={() => navigate('/ai-tasks')}
        />
      </div>

      {/* Main Grid: Project Health Radar + Autonomy Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Project Health Radar Chart */}
        <Card className="lg:col-span-1 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Platform Health Posture</h3>
              <p className="text-[11px] text-slate-400">Multi-dimensional health index</p>
            </div>
            <Badge variant={isFixApplied ? 'success' : 'warning'} size="sm">
              {isFixApplied ? 'Optimal (96%)' : 'Degraded (79%)'}
            </Badge>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={healthData} outerRadius="75%">
                <PolarGrid stroke="#1f2d45" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis stroke="#1f2d45" angle={30} domain={[0, 100]} />
                <Radar
                  name="Health Score"
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-enox-border/60 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/60 p-2 rounded border border-enox-border">
              <span className="text-slate-400 text-[10px] block">Build Health</span>
              <span className="font-semibold text-slate-200">{isFixApplied ? 'Passing (98%)' : 'Canary Failed'}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded border border-enox-border">
              <span className="text-slate-400 text-[10px] block">Test Suite</span>
              <span className="font-semibold text-slate-200">{isFixApplied ? '148 Passed' : '2 Failed'}</span>
            </div>
          </div>
        </Card>

        {/* ENOX Autonomy & Orchestration Live Status */}
        <Card className="lg:col-span-2 p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <ENOXCore status={enoxStatus} size="md" />
              <div>
                <h3 className="text-sm font-semibold text-slate-100">ENOX Autonomous Engine</h3>
                <p className="text-xs text-slate-400">
                  Real-time autonomous triage, parallel worker supervision, and self-healing pipeline
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/agent')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
            >
              Open Agent
            </Button>
          </div>

          {/* Autonomy Execution Stage */}
          <div className="my-4 p-4 rounded-xl bg-slate-950/60 border border-enox-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Current Stage:{' '}
                <span className="font-mono text-cyan-300">
                  {isDeployed
                    ? '7/7 - Canary Rollout Completed & Healthy'
                    : isFixApplied
                    ? '5/7 - Verification Test Suite Passing (148/148)'
                    : '2/7 - Parallel Triage: Debugger, Tester, Security Active'}
                </span>
              </span>
              <Badge variant={isDeployed ? 'success' : 'purple'} size="sm">
                {isDeployed ? 'Autonomous Success' : 'Active Parallel Agents'}
              </Badge>
            </div>

            {/* Stepped execution visual */}
            <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-mono">
              <div className="p-2 rounded bg-indigo-950/60 border border-indigo-700/60 text-indigo-300">
                1. Context Sync
              </div>
              <div className={`p-2 rounded border ${isFixApplied ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300' : 'bg-cyan-950/60 border-cyan-500 text-cyan-200 animate-pulse'}`}>
                2. Parallel Triage
              </div>
              <div className={`p-2 rounded border ${isFixApplied ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                3. Semantic Fix
              </div>
              <div className={`p-2 rounded border ${isFixApplied ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                4. Code Review
              </div>
              <div className={`p-2 rounded border ${isDeployed ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                5. Canary Deploy
              </div>
            </div>
          </div>

          {/* Active Agents Summary */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-enox-border flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">DEBUGGER AGENT</span>
                <span className="font-semibold text-slate-200">{isFixApplied ? 'Patch Committed' : 'AST Race Isolated'}</span>
              </div>
              <Badge variant={isFixApplied ? 'success' : 'info'} size="sm">{isFixApplied ? 'Done' : '90%'}</Badge>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-enox-border flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">TESTER AGENT</span>
                <span className="font-semibold text-slate-200">{isFixApplied ? '148/148 Passed' : 'Failover Ingest'}</span>
              </div>
              <Badge variant={isFixApplied ? 'success' : 'info'} size="sm">{isFixApplied ? 'Done' : '85%'}</Badge>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-enox-border flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">SECURITY SENTINEL</span>
                <span className="font-semibold text-slate-200">{isFixApplied ? 'Clean 96%' : 'Lock Starvation'}</span>
              </div>
              <Badge variant={isFixApplied ? 'success' : 'info'} size="sm">{isFixApplied ? 'Done' : '95%'}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Critical Issues & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Critical Issues List */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Critical Incidents & Issues</h3>
              <p className="text-xs text-slate-400">Click any issue to inspect root cause & trigger fix</p>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/issues')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
            >
              All Issues
            </Button>
          </div>

          <div className="space-y-2.5">
            {issues.slice(0, 3).map((issue) => {
              const isResolved = (issue.id === 'ISSUE-9421' && isFixApplied) || issue.status === 'Resolved';
              return (
                <div
                  key={issue.id}
                  onClick={() => {
                    if (issue.id === 'ISSUE-9421') {
                      navigate('/debugging');
                    } else {
                      navigate('/issues');
                    }
                  }}
                  className="p-3 rounded-lg bg-slate-900/80 border border-enox-border hover:border-indigo-500/50 hover:bg-slate-800/80 cursor-pointer transition flex items-start justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-semibold text-indigo-400">
                        {issue.id}
                      </span>
                      <span className="text-xs font-medium text-slate-200 truncate group-hover:text-indigo-300 transition">
                        {issue.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {issue.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge
                      variant={isResolved ? 'success' : issue.severity === 'High' ? 'danger' : 'warning'}
                      size="sm"
                    >
                      {isResolved ? 'Resolved' : issue.severity}
                    </Badge>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {issue.createdAt}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Expandable Live Activity Timeline */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Live Activity & Audit Timeline</h3>
              <p className="text-xs text-slate-400">Click any action to inspect execution details</p>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/activity')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
            >
              Full Log
            </Button>
          </div>

          <div className="space-y-2">
            {activities.slice(0, 4).map((act) => {
              const isExpanded = expandedActivity === act.id;
              return (
                <div
                  key={act.id}
                  onClick={() => setExpandedActivity(isExpanded ? null : act.id)}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-enox-border hover:border-slate-700 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${act.status === 'error' ? 'bg-rose-400' : act.status === 'success' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                      <span className="font-semibold text-slate-200 truncate">{act.action}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">{act.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                    <span>Project: <strong className="text-slate-300 font-normal">{act.project}</strong></span>
                    <span className="capitalize text-slate-500">{act.category}</span>
                  </div>

                  {isExpanded && act.details && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-indigo-300 bg-slate-950/60 p-2 rounded">
                      {act.details}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Productivity Benchmark: Before vs After (Sample / Demo Metrics) */}
      <Card className="p-5 border-indigo-950/60 bg-gradient-to-r from-enox-card to-slate-900/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">SDLC Acceleration Benchmarks</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative turnaround speeds with autonomous multi-agent triage
            </p>
          </div>
          {/* CRITICAL LABEL REQUIRED BY PHASE 4 */}
          <Badge variant="purple" size="sm">
            Sample / Demo Metrics
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {productivityData.map((item) => (
            <div key={item.metric} className="p-3 rounded-lg bg-slate-950/60 border border-enox-border">
              <span className="text-[11px] text-slate-400 block mb-2">{item.metric}</span>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 line-through block font-mono">
                    {item.before}
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {item.after}
                  </span>
                </div>
                <Badge variant="success" size="sm">
                  -{Math.round(((item.before - item.after) / item.before) * 100)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
