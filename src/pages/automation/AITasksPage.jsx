import React, { useState, useEffect } from 'react';
import { aiService } from '../../services/aiService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal,
  ExternalLink,
  Search,
} from 'lucide-react';

export const AITasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadTasks() {
      const data = await aiService.getAITasks();
      setTasks(data);
      setLoading(false);
    }
    loadTasks();
  }, []);

  const filteredTasks = tasks.filter(
    (t) =>
      t.task.toLowerCase().includes(search.toLowerCase()) ||
      t.agent.toLowerCase().includes(search.toLowerCase()) ||
      t.project.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Running':
        return <Badge variant="info" dot>Running</Badge>;
      case 'Completed':
        return <Badge variant="success" dot>Completed</Badge>;
      case 'Waiting':
        return <Badge variant="warning">Waiting</Badge>;
      case 'Failed':
        return <Badge variant="danger">Failed</Badge>;
      case 'Queued':
      default:
        return <Badge variant="outline">Queued</Badge>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-enox-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Autonomous Agent Tasks & Execution Registry
            <Badge variant="purple" size="sm">{tasks.length} Tracked</Badge>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time audit registry of autonomous subagents, model reasoning tasks, and latency metrics.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search AI tasks by name, agent, or project..."
          className="w-full bg-enox-bg border border-enox-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Tasks Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-enox-border bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Task Description</th>
                <th className="py-3 px-4">Supervising Agent</th>
                <th className="py-3 px-4">Target Service</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-enox-border/60">
              {filteredTasks.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className="hover:bg-slate-800/50 cursor-pointer transition"
                >
                  <td className="py-3 px-4 max-w-xs">
                    <span className="font-semibold text-slate-200 line-clamp-1">
                      {t.task}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono truncate block">
                      {t.result}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-indigo-300">
                    {t.agent}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {t.project}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(t.status)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {t.duration}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {t.timestamp}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="xs">
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Task Execution Details Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={
          <span className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            Task Execution: {selectedTask?.id}
          </span>
        }
        description={selectedTask?.task}
      >
        {selectedTask && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-lg bg-slate-950 border border-enox-border font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">AGENT</span>
                <span className="text-indigo-400 font-semibold">{selectedTask.agent}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">DURATION</span>
                <span className="text-slate-200 font-semibold">{selectedTask.duration}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">PROJECT</span>
                <span className="text-cyan-400 font-semibold">{selectedTask.project}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-300 mb-1">Execution Outcome:</h4>
              <p className="p-3 rounded-lg bg-slate-950 border border-enox-border text-slate-200 leading-relaxed font-sans">
                {selectedTask.result}
              </p>
            </div>

            {selectedTask.logs && selectedTask.logs.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                  Agent Execution Trace Logs
                </h4>
                <div className="p-3 rounded-lg bg-slate-950 border border-enox-border font-mono text-[11px] text-cyan-300/90 space-y-1 max-h-40 overflow-y-auto">
                  {selectedTask.logs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
