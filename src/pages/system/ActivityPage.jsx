import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  History,
  Search,
  Filter,
  Bot,
  User,
  GitCommit,
  GitPullRequest,
  ShieldCheck,
  Rocket,
  GitFork,
  Clock,
} from 'lucide-react';

export const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadActivities() {
      const data = await notificationService.getActivities(selectedCategory);
      setActivities(data);
    }
    loadActivities();
  }, [selectedCategory]);

  const filtered = activities.filter(
    (a) =>
      a.action.toLowerCase().includes(search.toLowerCase()) ||
      a.user.toLowerCase().includes(search.toLowerCase()) ||
      a.project.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'ai':
        return <Bot className="w-4 h-4 text-cyan-400" />;
      case 'commit':
        return <GitCommit className="w-4 h-4 text-indigo-400" />;
      case 'review':
        return <GitPullRequest className="w-4 h-4 text-purple-400" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'deployment':
        return <Rocket className="w-4 h-4 text-amber-400" />;
      case 'workflow':
        return <GitFork className="w-4 h-4 text-rose-400" />;
      default:
        return <User className="w-4 h-4 text-slate-400" />;
    }
  };

  const categories = ['All', 'AI', 'Developer', 'Deployment', 'Commit', 'Review', 'Security'];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-enox-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Audit Trail & Activity Stream
            <Badge variant="purple" size="sm">{activities.length} Recorded</Badge>
          </h1>
          <p className="text-xs text-slate-400">
            Immutable platform audit log recording human commits, AI remediations, and automated deployments.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-enox-border">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity by action, user, or project..."
            className="w-full bg-enox-bg border border-enox-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs transition ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Card */}
      <Card className="p-5">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {filtered.map((item) => (
            <div key={item.id} className="relative group">
              {/* Dot */}
              <div className="absolute -left-6 top-1 p-1 rounded-full bg-slate-950 border border-slate-700">
                {getCategoryIcon(item.category)}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-enox-border hover:border-slate-700 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-200">
                      {item.user}
                    </span>
                    <Badge variant="outline" size="sm" className="capitalize">
                      {item.category}
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Project: {item.project}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-sans mb-1">
                  {item.action}
                </p>

                {item.details && (
                  <div className="mt-2 text-[11px] font-mono text-indigo-300 bg-slate-900/80 p-2 rounded border border-slate-800">
                    {item.details}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
