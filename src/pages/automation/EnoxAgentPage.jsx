import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '../../store';
import { aiService } from '../../services/aiService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ENOXCore } from '../../components/ui/ENOXCore';
import { AgentExecutionCard } from '../../components/ui/AgentExecutionCard';
import {
  Bot,
  Send,
  Sparkles,
  Play,
  RotateCcw,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  ArrowRight,
  Shield,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export const EnoxAgentPage = () => {
  const {
    enoxStatus,
    setEnoxStatus,
    parallelAgents,
    updateAgent,
    resetAgents,
    setFixApplied,
    setPrCreated,
  } = useAppStore();

  // Primary parallel execution state
  const [isRunningParallel, setIsRunningParallel] = useState(false);

  // Document understanding
  const [documents, setDocuments] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Chat interface
  const [messages, setMessages] = useState([
    {
      id: 'm-1',
      sender: 'enox',
      timestamp: '02:48',
      text: `Hello Alex! I am the **ENOX Autonomous Orchestrator**. 

I have automatically ingested the canary failure telemetry from **SentinelIQ** (Incident \`ISSUE-9421\`).
You can:
- Click **"Launch Parallel Triage"** to dispatch the **Debugger**, **Tester**, and **Security** agents concurrently.
- Ask questions about the indexed system architecture documents below.`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Execution Stages List
  const [stages, setStages] = useState([
    { id: 1, name: 'Understanding Repository Context', agent: 'Context Synthesizer', duration: '1.2s', status: 'completed', logs: ['Loaded 14 repository files', 'Parsed package dependencies', 'Identified Redis locking pattern'] },
    { id: 2, name: 'Parallel Triage (Debugger, Tester, Security)', agent: 'ENOX Core Multi-Agent', duration: '2.8s', status: 'idle', logs: ['Waiting for dispatch'] },
    { id: 3, name: 'Planning Semantic Solution', agent: 'Architecture Planner', duration: '1.4s', status: 'idle', logs: ['Synthesizing exponential backoff retry jitter'] },
    { id: 4, name: 'Generating & Applying Fix', agent: 'Code Synthesizer', duration: '1.8s', status: 'idle', logs: ['Generated patch for incidentOrchestrator.ts:38', 'Committed 4a19b80e'] },
    { id: 5, name: 'Running Regression Tests (148 specs)', agent: 'Test Harness Runner', duration: '2.4s', status: 'idle', logs: ['Running Vitest & PyTest suites'] },
    { id: 6, name: 'Preparing Automated Code Review (PR-428)', agent: 'Review Sentinel', duration: '1.5s', status: 'idle', logs: ['Generated PR diff and security validation'] },
    { id: 7, name: 'Canary Deployment Validation', agent: 'Canary Gatekeeper', duration: '3.1s', status: 'idle', logs: ['Canary rollout to 100% traffic in us-east-1'] },
  ]);
  const [expandedStage, setExpandedStage] = useState(null);

  useEffect(() => {
    async function loadDocs() {
      const data = await aiService.getDocuments();
      setDocuments(data);
      setSelectedDocIds(data.map((d) => d.id));
    }
    loadDocs();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // CRITICAL REQUIREMENT: RUN PARALLEL AGENTS CONCURRENTLY
  const handleLaunchParallelAgents = async () => {
    setIsRunningParallel(true);
    setEnoxStatus('executing');
    toast.info('Dispatching 3-way parallel agent orchestration: Debugger, Tester, Security active!');

    // Add chat notification
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        sender: 'enox',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `🚀 **Dispatched 3-Way Parallel Agent Execution**:
- 🐞 **Debugger**: Isolating lock contention race condition in \`incidentOrchestrator.ts\`
- 🧪 **Tester**: Executing concurrency & failover regression specs
- 🛡️ **Security**: Scanning AST for Denial-of-Service starvation vulnerabilities

All 3 subagents are running concurrently.`,
      },
    ]);

    // Update Stage 2 in timeline to running
    setStages((prev) =>
      prev.map((s) => (s.id === 2 ? { ...s, status: 'running', logs: ['Spawning parallel workers...'] } : s))
    );

    // Run AIService parallel runner (which immediately sets all 3 to RUNNING)
    await aiService.runParallelAgents((update) => {
      updateAgent(update.agentName, {
        status: update.status,
        progress: update.progress,
        message: update.message,
      });

      // Update stage logs as updates stream
      setStages((prev) =>
        prev.map((s) => {
          if (s.id === 2) {
            return {
              ...s,
              logs: [...s.logs, `[${update.agentName.toUpperCase()}] ${update.message}`],
            };
          }
          return s;
        })
      );
    });

    // Mark stages 2, 3, 4, 5, 6 as completed sequentially
    setStages((prev) =>
      prev.map((s) => ({ ...s, status: 'completed' }))
    );

    setFixApplied(true);
    setPrCreated(true);
    setIsRunningParallel(false);
    setEnoxStatus('success');

    toast.success('Parallel agents completed! Root cause resolved and candidate PR-428 prepared.');

    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now() + 1}`,
        sender: 'enox',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `✅ **Parallel Triage Complete!**
1. **Debugger**: Root cause isolated (Lock contention timeout race). Candidate patch generated.
2. **Tester**: Verified 2 failing unit tests reproduce the deadlock under concurrency.
3. **Security**: Audit affirm: Zero unhandled starvation vulnerabilities in patched code.
4. **Code Review**: PR-428 generated with +28 lines, -9 lines.

You can now click **"Open Monaco Diff"** in the Debugging workspace or inspect **PR-428** in Code Review.`,
      },
    ]);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: `m-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setChatLoading(true);

    try {
      const response = await aiService.queryProjectWithDocs(inputText, selectedDocIds);
      const enoxMsg = {
        id: `m-${Date.now() + 1}`,
        sender: 'enox',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: response,
      };
      setMessages((prev) => [...prev, enoxMsg]);
    } catch (err) {
      toast.error('Failed to query ENOX context');
    } finally {
      setChatLoading(false);
    }
  };

  const handleUploadDoc = async () => {
    setIsUploadingDoc(true);
    await new Promise((r) => setTimeout(r, 800));
    const newDoc = await aiService.indexDocument(
      `incident-postmortem-${Date.now().toString().slice(-4)}.log`,
      'logs',
      'Canary pod recovery postmortem log'
    );
    setDocuments([newDoc, ...documents]);
    setSelectedDocIds([...selectedDocIds, newDoc.id]);
    setIsUploadingDoc(false);
    toast.success(`Indexed ${newDoc.name} into repository semantic memory!`);
  };

  const toggleDocSelection = (id) => {
    if (selectedDocIds.includes(id)) {
      setSelectedDocIds(selectedDocIds.filter((docId) => docId !== id));
    } else {
      setSelectedDocIds([...selectedDocIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-enox-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              ENOX Autonomous Agent Workspace
              <Badge variant="purple" size="sm">Multi-Agent Swarm</Badge>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            True parallel subagent orchestration, AST contextual reasoning, and real-time document indexing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={resetAgents}
            disabled={isRunningParallel}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Swarm
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleLaunchParallelAgents}
            loading={isRunningParallel}
            icon={<Play className="w-3.5 h-3.5" />}
          >
            Launch Parallel Triage
          </Button>
        </div>
      </div>

      {/* CRITICAL VISIBLE PARALLEL AGENT EXECUTION SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-200">
              Parallel Agent Swarm &bull; Concurrent Execution Grid
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Debugger &bull; Tester &bull; Security run simultaneously
          </span>
        </div>

        {/* 3 Concurrent Agents (Debugger, Tester, Security) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <AgentExecutionCard
            id="debugger"
            name="Debugger Agent"
            role="AST Race & Stack Trace Decompiler"
            status={parallelAgents.debugger.status}
            progress={parallelAgents.debugger.progress}
            message={parallelAgents.debugger.message}
            details="Target: src/services/incidentOrchestrator.ts:38"
          />

          <AgentExecutionCard
            id="tester"
            name="Tester Agent"
            role="Regression & Concurrency Test Runner"
            status={parallelAgents.tester.status}
            progress={parallelAgents.tester.progress}
            message={parallelAgents.tester.message}
            details="Target: tests/unit/orchestrator.test.ts"
          />

          <AgentExecutionCard
            id="security"
            name="Security Sentinel"
            role="CVE & Deadlock Vulnerability Auditor"
            status={parallelAgents.security.status}
            progress={parallelAgents.security.progress}
            message={parallelAgents.security.message}
            details="Target: CVE-2026-9812 / SOC2 Spec"
          />
        </div>

        {/* Subsequent Pipeline Stages: Review & Deployment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <AgentExecutionCard
            id="review"
            name="Review Agent"
            role="Automated PR Quality & Diff Gate"
            status={parallelAgents.review.status}
            progress={parallelAgents.review.progress}
            message={parallelAgents.review.message}
            details="Target: PR-428 Semantic Verification"
          />

          <AgentExecutionCard
            id="deployment"
            name="Deployment Orchestrator"
            role="Canary Traffic Gate & Rollout Probe"
            status={parallelAgents.deployment.status}
            progress={parallelAgents.deployment.progress}
            message={parallelAgents.deployment.message}
            details="Target: production-us-east-1 canary pod"
          />
        </div>
      </div>

      {/* Main Grid: Interactive Chat on Left (7 cols), Stages & Documents on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Real Interactive Chat Interface */}
        <div className="lg:col-span-7 flex flex-col h-[560px] bg-enox-card border border-enox-border rounded-xl overflow-hidden">
          {/* Chat Header */}
          <div className="px-4 py-3 bg-slate-950/80 border-b border-enox-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ENOXCore status={enoxStatus} size="sm" showLabel={false} />
              <div>
                <span className="text-xs font-bold text-white block">
                  ENOX Autonomous Dialogue
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Context: SentinelIQ &bull; {selectedDocIds.length} indexed documents active
                </span>
              </div>
            </div>
            <Badge variant="purple" size="sm">Claude / Gemini 3.8 Core</Badge>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => {
              const isEnox = m.sender === 'enox';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 ${isEnox ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isEnox
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/60'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                    }`}
                  >
                    {isEnox ? <Bot className="w-4 h-4" /> : 'AV'}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                      isEnox
                        ? 'bg-slate-950 border border-enox-border text-slate-200 shadow-sm'
                        : 'bg-indigo-600 text-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-[10px] opacity-60">
                      <span>{isEnox ? 'ENOX Supervisor' : 'Alex Vance'}</span>
                      <span className="font-mono">{m.timestamp}</span>
                    </div>

                    <div className="prose prose-invert prose-xs max-w-none">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })}
            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 p-2 font-mono">
                <ENOXCore status="thinking" size="sm" showLabel={false} />
                <span>ENOX is synthesizing document context and codebase AST...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-950/80 border-t border-enox-border flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask ENOX about this project, architecture guidelines, or debug steps..."
              className="flex-1 bg-enox-bg border border-enox-border rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={chatLoading}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Send
            </Button>
          </form>
        </div>

        {/* Right Column: Execution Stages & Document Understanding */}
        <div className="lg:col-span-5 space-y-4">
          {/* Execution Stages Stepper */}
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider mb-3 flex items-center justify-between">
              <span>Autonomous Execution Stages</span>
              <Badge variant="outline" size="sm">7 Stages</Badge>
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {stages.map((st) => {
                const isExpanded = expandedStage === st.id;
                const isDone = st.status === 'completed';
                const isRunning = st.status === 'running';

                return (
                  <div
                    key={st.id}
                    onClick={() => setExpandedStage(isExpanded ? null : st.id)}
                    className="p-2.5 rounded-lg bg-slate-950 border border-enox-border cursor-pointer hover:border-slate-700 transition text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                            isDone
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : isRunning
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 animate-pulse'
                              : 'bg-slate-900 text-slate-500 border border-slate-800'
                          }`}
                        >
                          {isDone ? <Check className="w-3 h-3" /> : st.id}
                        </span>
                        <span className="font-medium text-slate-200 truncate">{st.name}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-slate-500">{st.duration}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-indigo-300 space-y-1">
                        <div>Agent: <span className="text-slate-300">{st.agent}</span></div>
                        <div className="text-slate-400">
                          {st.logs.map((log, i) => (
                            <div key={i}>&bull; {log}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Document Understanding Section */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider">
                  Document Understanding & Index
                </h3>
                <p className="text-[11px] text-slate-400">
                  Semantic context ingested for multi-turn synthesis
                </p>
              </div>
              <Button
                variant="secondary"
                size="xs"
                onClick={handleUploadDoc}
                loading={isUploadingDoc}
                icon={<Upload className="w-3 h-3" />}
              >
                Index Doc
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {documents.map((doc) => {
                const isSelected = selectedDocIds.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDocSelection(doc.id)}
                    className={`p-2 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-950 border-indigo-500/80 text-slate-100'
                        : 'bg-slate-900/60 border-enox-border text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold block truncate">{doc.name}</span>
                        <span className="text-[10px] text-slate-500">{doc.size} &bull; {doc.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="success" size="sm">
                        <span className="text-[10px] font-mono">Indexed</span>
                      </Badge>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-700 bg-slate-900 text-indigo-600"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
