import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useAppStore } from '../../store';
import { workflowService } from '../../services/workflowService';
import { mockWorkflows } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  GitFork,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layers,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

export const WorkflowsPage = () => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('wf-auto-fix-deploy');
  const [workflows, setWorkflows] = useState(mockWorkflows);
  const activeWf = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];

  const [nodes, setNodes] = useState(activeWf.nodes);
  const [edges, setEdges] = useState(activeWf.edges);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeStepNodeId, setActiveStepNodeId] = useState(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const handleSelectWorkflow = (wfId) => {
    setSelectedWorkflowId(wfId);
    const target = workflows.find((w) => w.id === wfId);
    if (target) {
      setNodes(target.nodes);
      setEdges(target.edges);
      setActiveStepNodeId(null);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    toast.info(`Executing workflow: ${activeWf.name}`);

    // Animate through each node
    for (const node of nodes) {
      setActiveStepNodeId(node.id);
      // Highlight running node
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? {
                ...n,
                style: {
                  background: '#1e1b4b',
                  borderColor: '#06b6d4',
                  boxShadow: '0 0 16px rgba(6,182,212,0.5)',
                  color: '#fff',
                },
              }
            : n
        )
      );

      await new Promise((r) => setTimeout(r, 700));

      // Mark completed
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? {
                ...n,
                style: {
                  background: '#064e3b',
                  borderColor: '#10b981',
                  color: '#fff',
                },
              }
            : n
        )
      );
    }

    setIsExecuting(false);
    setActiveStepNodeId(null);
    toast.success('Workflow executed successfully! All stages validated.');
  };

  const handleReset = () => {
    const target = workflows.find((w) => w.id === selectedWorkflowId);
    if (target) {
      setNodes(target.nodes);
      setEdges(target.edges);
      setActiveStepNodeId(null);
      toast.info('Workflow nodes reset to default');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-enox-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Autonomous Workflow Studio
              <Badge variant="purple" size="sm">React Flow Canvas</Badge>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Visual orchestrator for self-healing pipelines, automated build recovery, and multi-agent DAGs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            disabled={isExecuting}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExecute}
            loading={isExecuting}
            icon={<Play className="w-3.5 h-3.5" />}
          >
            Execute Workflow
          </Button>
        </div>
      </div>

      {/* Workflow Selector Bar */}
      <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-enox-border overflow-x-auto">
        <span className="text-xs text-slate-400 font-semibold shrink-0">Workflow:</span>
        {workflows.map((wf) => {
          const isSelected = wf.id === selectedWorkflowId;
          return (
            <button
              key={wf.id}
              onClick={() => handleSelectWorkflow(wf.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                isSelected
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {wf.name}
            </button>
          );
        })}
      </div>

      {/* Description card */}
      <Card className="p-3.5 bg-slate-950/40 border-enox-border text-xs text-slate-300 flex items-center justify-between">
        <div>
          <strong className="text-indigo-400">Trigger & Pipeline Logic: </strong>
          {activeWf.description}
        </div>
        <Badge variant={isExecuting ? 'info' : 'outline'} size="sm">
          {isExecuting ? 'Executing Node...' : 'Ready'}
        </Badge>
      </Card>

      {/* React Flow Canvas Container */}
      <div className="w-full h-[520px] rounded-xl border border-enox-border overflow-hidden bg-slate-950 shadow-inner">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          className="dark"
        >
          <Background color="#1f2d45" gap={20} size={1} />
          <Controls className="bg-slate-900 border-slate-700 text-slate-300" />
        </ReactFlow>
      </div>
    </div>
  );
};
