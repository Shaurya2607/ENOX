import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { testingService } from '../../services/testingService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  CheckSquare,
  AlertCircle,
  Play,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  RotateCcw,
  Bug,
  FileCode,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { toast } from 'sonner';

export const TestingPage = () => {
  const navigate = useNavigate();
  const { isFixApplied } = useAppStore();

  const [suite, setSuite] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stepped execution states
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState({ current: 0, total: 148, testName: '' });

  useEffect(() => {
    async function loadTests() {
      const data = await testingService.getTestSuite();
      setSuite(data);
      setLoading(false);
    }
    loadTests();
  }, [isFixApplied]);

  // Run all tests with stepped progress animation
  const handleRunAllTests = async () => {
    setIsRunningTests(true);
    setTestProgress({ current: 0, total: 148, testName: 'Initializing worker test threads...' });

    const result = await testingService.runTests('proj-sentinel-iq', (curr, total, name) => {
      setTestProgress({ current: curr, total, testName: name });
    });

    setSuite(result);
    setIsRunningTests(false);
    if (result.failed === 0) {
      toast.success('Regression Suite Complete: All 148 test specs passing!');
    } else {
      toast.error(`Test Suite Finished: ${result.passed} passed, ${result.failed} failed`);
    }
  };

  // Run failed tests only
  const handleRunFailed = async () => {
    setIsRunningTests(true);
    const result = await testingService.runFailedTests('proj-sentinel-iq', (curr, total, name) => {
      setTestProgress({ current: curr, total, testName: name });
    });
    setSuite(result);
    setIsRunningTests(false);
    toast.success('Failed test specs re-evaluated');
  };

  // Generate tests with AI
  const handleGenerateTests = async () => {
    toast.info('Generating AI boundary tests for Redis distributed lock...');
    const generated = await testingService.generateTests('src/services/incidentOrchestrator.ts');
    setSuite((prev) => ({
      ...prev,
      total: prev.total + generated.length,
      passed: prev.passed + generated.length,
      tests: [...generated, ...prev.tests],
    }));
    toast.success(`Generated ${generated.length} new unit test specs!`);
  };

  // Analyze failure connects to Debugging workspace
  const handleAnalyzeFailure = (testCase) => {
    toast.info(`Passing failure context to Debugging workspace: ${testCase.name}`);
    navigate('/debugging');
  };

  if (loading || !suite) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading Test Suite...</div>;
  }

  const hasFailures = suite.failed > 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-enox-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Continuous Testing & Regression Engine
              <Badge variant={hasFailures ? 'danger' : 'success'} size="sm">
                {hasFailures ? `${suite.failed} Failing Specs` : '100% Passing'}
              </Badge>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Automated Vitest & PyTest harness running distributed concurrency regressions and canary health probes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {hasFailures && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRunFailed}
              loading={isRunningTests}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Run Failed Tests
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleGenerateTests}
            icon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
          >
            Generate Tests
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunAllTests}
            loading={isRunningTests}
            icon={<Play className="w-3.5 h-3.5" />}
          >
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Stepped Execution Progress Bar (When running) */}
      {isRunningTests && (
        <Card className="p-4 bg-indigo-950/30 border-cyan-500/60 animate-in fade-in">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-cyan-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              Executing Test Suite: {testProgress.testName}
            </span>
            <span className="font-mono text-cyan-200">
              {testProgress.current} / {testProgress.total} specs
            </span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${(testProgress.current / testProgress.total) * 100}%` }}
            />
          </div>
        </Card>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <Card className="p-3.5 bg-slate-950/40">
          <span className="text-[11px] text-slate-400 block mb-1">Total Test Specs</span>
          <span className="text-2xl font-bold font-mono text-white">{suite.total}</span>
        </Card>

        <Card className="p-3.5 bg-slate-950/40 border-emerald-900/60">
          <span className="text-[11px] text-slate-400 block mb-1">Passed Specs</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">{suite.passed}</span>
        </Card>

        <Card className="p-3.5 bg-slate-950/40 border-rose-900/60">
          <span className="text-[11px] text-slate-400 block mb-1">Failed Specs</span>
          <span className="text-2xl font-bold font-mono text-rose-400">{suite.failed}</span>
        </Card>

        <Card className="p-3.5 bg-slate-950/40">
          <span className="text-[11px] text-slate-400 block mb-1">Branch Coverage</span>
          <span className="text-2xl font-bold font-mono text-cyan-400">{suite.coverage}%</span>
        </Card>

        <Card className="p-3.5 bg-slate-950/40">
          <span className="text-[11px] text-slate-400 block mb-1">Runtime</span>
          <span className="text-2xl font-bold font-mono text-indigo-300">
            {(suite.runtimeMs / 1000).toFixed(2)}s
          </span>
        </Card>
      </div>

      {/* Test Suite History Bar Chart */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Regression Run History & Pass Rate</h3>
            <p className="text-xs text-slate-400">Execution stability across sequential CI/CD trigger cycles</p>
          </div>
          <Badge variant="purple" size="sm">Trend: Passing</Badge>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={suite.history}>
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[140, 150]} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2d45', fontSize: '12px' }} />
              <Bar dataKey="passed" fill="#10b981" radius={[4, 4, 0, 0]} name="Passed" />
              <Bar dataKey="failed" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Individual Test Cases List */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Test Execution Details</h3>
            <p className="text-xs text-slate-400">Detailed assertions and failure traces</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Showing {suite.tests.length} tests</span>
        </div>

        <div className="space-y-2.5">
          {suite.tests.map((test) => {
            const isFailed = test.status === 'failed';
            return (
              <div
                key={test.id}
                className={`p-3 rounded-lg border transition ${
                  isFailed
                    ? 'bg-rose-950/20 border-rose-800/80 hover:bg-rose-950/30'
                    : 'bg-slate-900/60 border-enox-border hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isFailed ? 'bg-rose-950 text-rose-400' : 'bg-emerald-950 text-emerald-400'
                      }`}
                    >
                      {isFailed ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {test.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {test.durationMs}ms
                    </span>
                    <Badge variant={isFailed ? 'danger' : 'success'} size="sm">
                      {test.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* If test failed, show stack trace and Analyze Failure button */}
                {isFailed && (
                  <div className="mt-3 pt-3 border-t border-rose-900/40 space-y-2">
                    <div className="text-[11px] font-mono text-rose-300 bg-slate-950 p-2.5 rounded border border-rose-900/60">
                      <strong>Error:</strong> {test.error}
                      <br />
                      <span className="text-slate-500">{test.stackTrace}</span>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() => handleAnalyzeFailure(test)}
                        icon={<Bug className="w-3.5 h-3.5" />}
                      >
                        Analyze Failure in Debugger
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
