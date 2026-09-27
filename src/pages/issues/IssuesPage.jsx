import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { issueService } from '../../services/issueService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  AlertCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileCode,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

export const IssuesPage = () => {
  const navigate = useNavigate();
  const { isFixApplied, isIssueResolved, setIssueResolved } = useAppStore();

  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    async function loadIssues() {
      const data = await issueService.getIssues();
      const updated = data.map((i) => {
        if (i.id === 'ISSUE-9421' && (isFixApplied || isIssueResolved)) {
          return { ...i, status: 'Resolved' };
        }
        return i;
      });
      setIssues(updated);
      setSelectedIssue(updated[0]);
    }
    loadIssues();
  }, [isFixApplied, isIssueResolved]);

  const filteredIssues = issues.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase()) ||
      i.id.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity = severityFilter === 'All' || i.severity === severityFilter;
    const matchesStatus = statusFilter === 'All' || i.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedIssue) return;
    setCommentLoading(true);
    try {
      const added = await issueService.addComment(selectedIssue.id, newComment);
      setSelectedIssue({
        ...selectedIssue,
        comments: [...selectedIssue.comments, added],
      });
      setNewComment('');
      toast.success('Comment posted to issue thread');
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleResolveIssue = async (id) => {
    await issueService.resolveIssue(id);
    setIssueResolved(true);
    setIssues((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Resolved' } : item))
    );
    if (selectedIssue?.id === id) {
      setSelectedIssue({ ...selectedIssue, status: 'Resolved' });
    }
    toast.success(`Issue ${id} marked as Resolved!`);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-enox-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Incident & Issue Tracker
            <Badge variant="purple" size="sm">Triage Active</Badge>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time telemetry triage with one-click ENOX autonomous root cause resolution
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/debugging')}
          icon={<Bot className="w-3.5 h-3.5" />}
        >
          Investigate with ENOX
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-enox-border">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues by ID, title, or label..."
            className="w-full bg-enox-bg border border-enox-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span>Severity:</span>
            {['All', 'High', 'Medium', 'Low'].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-2 py-0.5 rounded text-[11px] transition ${
                  severityFilter === s
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span>Status:</span>
            {['All', 'Open', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded text-[11px] transition ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Split view: Issue list on Left, Issue Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Issues List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[75vh] overflow-y-auto pr-1">
          {filteredIssues.map((issue) => {
            const isSelected = selectedIssue?.id === issue.id;
            const isResolved = issue.status === 'Resolved';
            return (
              <Card
                key={issue.id}
                hover
                onClick={() => setSelectedIssue(issue)}
                className={`p-4 transition cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-enox-cardHover ring-1 ring-indigo-500/40'
                    : 'border-enox-border bg-enox-card hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-indigo-400">
                    {issue.id}
                  </span>
                  <Badge
                    variant={isResolved ? 'success' : issue.severity === 'High' ? 'danger' : 'warning'}
                    size="sm"
                  >
                    {isResolved ? 'Resolved' : issue.severity}
                  </Badge>
                </div>

                <h3 className="text-xs font-semibold text-slate-100 line-clamp-1 mb-1">
                  {issue.title}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                  {issue.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{issue.assignee}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> {issue.comments?.length || 0}
                    </span>
                    <span>{issue.createdAt}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Issue Details View */}
        <div className="lg:col-span-7">
          {selectedIssue ? (
            <Card className="p-6 space-y-5">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-enox-border">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-indigo-400">
                      {selectedIssue.id}
                    </span>
                    <Badge
                      variant={selectedIssue.status === 'Resolved' ? 'success' : selectedIssue.severity === 'High' ? 'danger' : 'warning'}
                      size="sm"
                    >
                      {selectedIssue.status}
                    </Badge>
                    <span className="text-xs text-slate-500 font-mono">
                      Project: {selectedIssue.project}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white">
                    {selectedIssue.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {selectedIssue.status !== 'Resolved' && (
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => handleResolveIssue(selectedIssue.id)}
                      icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    >
                      Resolve
                    </Button>
                  )}
                  {/* CRITICAL DEMO ACTION: Investigate with ENOX */}
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => navigate('/debugging')}
                    icon={<Bot className="w-3.5 h-3.5" />}
                  >
                    Investigate with ENOX
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-2">
                  Incident Description
                </h4>
                <div className="p-3.5 rounded-lg bg-slate-950 border border-enox-border text-xs text-slate-200 leading-relaxed font-sans">
                  {selectedIssue.description}
                </div>
              </div>

              {/* Affected Files */}
              {selectedIssue.affectedFiles && selectedIssue.affectedFiles.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-2">
                    Affected Repository Files
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIssue.affectedFiles.map((file) => (
                      <span
                        key={file}
                        onClick={() => navigate('/repository')}
                        className="px-2.5 py-1 rounded bg-slate-900 border border-enox-border text-xs font-mono text-indigo-300 hover:border-indigo-500 cursor-pointer transition flex items-center gap-1.5"
                      >
                        <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ENOX Automated Analysis Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-slate-900/60 border border-indigo-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-white">
                      ENOX Autonomous Root Cause Assessment
                    </span>
                  </div>
                  <Badge variant="purple" size="sm">96.8% Confidence</Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Distributed Lock acquisition timeout under high canary traffic spikes triggers synchronous LockContentionError, leading to Pod CrashLoopBackOff.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-cyan-300">
                    Fix pattern: Exponential backoff jitter + fallback queue
                  </span>
                  <button
                    onClick={() => navigate('/debugging')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
                  >
                    Open in Debugger <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Comments & Activity Stream */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-2">
                  Incident Log & Comments
                </h4>
                <div className="space-y-2.5 max-h-48 overflow-y-auto mb-3">
                  {selectedIssue.comments?.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-slate-900/60 border border-enox-border text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-200">{c.author}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{c.timestamp}</span>
                      </div>
                      <p className="text-slate-300 font-sans">{c.text}</p>
                    </div>
                  ))}
                </div>

                {/* Add Comment input */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add comment or operational note to this incident..."
                    className="flex-1 bg-enox-bg border border-enox-border rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    loading={commentLoading}
                    icon={<Send className="w-3.5 h-3.5" />}
                  >
                    Post
                  </Button>
                </form>
              </div>
            </Card>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
              Select an issue to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
