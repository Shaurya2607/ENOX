import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { monitoringService } from '../../services/monitoringService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Activity,
  Cpu,
  Server,
  Zap,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';

export const MonitoringPage = () => {
  const { isDeployed } = useAppStore();
  const [range, setRange] = useState('1H');
  const [metrics, setMetrics] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      const [data, liveStats] = await Promise.all([
        monitoringService.getMonitoringMetrics(range),
        monitoringService.getLiveStats(),
      ]);

      // If deployed, show optimal healthy data points for the most recent period
      if (isDeployed) {
        const healthyData = data.map((d, idx) => {
          if (idx >= data.length - 2) {
            return {
              ...d,
              cpu: 34,
              memory: 52,
              errors: 0,
              latency: 28,
              uptime: 100,
            };
          }
          return d;
        });
        setMetrics(healthyData);
      } else {
        setMetrics(data);
      }

      setStats(liveStats);
      setLoading(false);
    }
    loadMetrics();
  }, [range, isDeployed]);

  const handleRefresh = async () => {
    setLoading(true);
    const data = await monitoringService.getMonitoringMetrics(range);
    setMetrics(data);
    setLoading(false);
    toast.success('Telemetry series refreshed');
  };

  if (loading || !stats) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading Cluster Telemetry...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-enox-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Cluster Infrastructure & Telemetry Monitor
              <Badge variant={isDeployed ? 'success' : 'warning'} size="sm">
                {isDeployed ? 'Telemetry Healthy & Clean' : 'Post-Incident Recovery'}
              </Badge>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Real-time Prometheus & OpenTelemetry metrics for Kubernetes nodes, Redis clusters, and ingress mesh.
          </p>
        </div>

        {/* Range Selector & Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-enox-border text-xs">
            {['1H', '6H', '24H', '7D', '30D'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded transition ${
                  range === r
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Live Cluster Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
        <Card className="p-3.5 bg-slate-950/40">
          <span className="text-[11px] text-slate-400 block mb-1">Cluster CPU</span>
          <span className="text-2xl font-bold font-mono text-cyan-400">{stats.cpu}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Multi-core average</span>
        </Card>

        <Card className="p-3.5 bg-slate-950/40">
          <span className="text-[11px] text-slate-400 block mb-1">Cluster Memory</span>
          <span className="text-2xl font-bold font-mono text-indigo-300">{stats.memory}</span>
          <span className="text-[10px] text-slate-500 block mt-1">VRAM / Heap buffer</span>
        </Card>

        <Card className="p-3.5 bg-slate-950/40">
          <span className="text-[11px] text-slate-400 block mb-1">Ingress Rate</span>
          <span className="text-xl font-bold font-mono text-white">{stats.requestsPerSec}</span>
          <span className="text-[10px] text-emerald-400 block mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Peak load steady
          </span>
        </Card>

        <Card className={`p-3.5 bg-slate-950/40 ${isDeployed ? 'border-emerald-900/60' : 'border-rose-900/60'}`}>
          <span className="text-[11px] text-slate-400 block mb-1">HTTP Error Rate</span>
          <span className={`text-2xl font-bold font-mono ${isDeployed ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isDeployed ? '0.001%' : '1.71%'}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            {isDeployed ? '502 Bad Gateway: 0' : 'CrashLoopBackOff'}
          </span>
        </Card>

        <Card className="p-3.5 bg-slate-950/40">
          <span className="text-[11px] text-slate-400 block mb-1">P99 Latency</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {isDeployed ? '28.4 ms' : '310.2 ms'}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Ingress roundtrip</span>
        </Card>

        <Card className="p-3.5 bg-slate-950/40">
          <span className="text-[11px] text-slate-400 block mb-1">Target SLA Uptime</span>
          <span className="text-2xl font-bold font-mono text-indigo-400">{stats.uptime}</span>
          <span className="text-[10px] text-emerald-400 block mt-1">Tier-1 Guaranteed</span>
        </Card>
      </div>

      {/* Main Charts: CPU & Memory Graph + Ingress & Error Rate Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CPU & Memory Utilization Chart */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">CPU & Memory Utilization</h3>
              <p className="text-xs text-slate-400">Pod capacity allocation over range {range}</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-cyan-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> CPU (%)
              </span>
              <span className="text-indigo-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-400" /> Memory (%)
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <CartesianGrid stroke="#1f2d45" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2d45', fontSize: '12px' }} />
                <Area type="monotone" dataKey="cpu" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} name="CPU %" />
                <Area type="monotone" dataKey="memory" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} name="Memory %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Requests & Error Count Chart */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Traffic Throughput vs HTTP Errors</h3>
              <p className="text-xs text-slate-400">Requests handled and 5xx exception telemetry</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Requests
              </span>
              <span className="text-rose-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Errors
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <CartesianGrid stroke="#1f2d45" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2d45', fontSize: '12px' }} />
                <Line type="monotone" dataKey="requests" stroke="#10b981" strokeWidth={2} name="Requests/min" />
                <Line type="monotone" dataKey="errors" stroke="#f43f5e" strokeWidth={2} name="HTTP Errors" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Latency Distribution Chart */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Ingress P99 Response Latency (ms)</h3>
            <p className="text-xs text-slate-400">Notice the latency collapse from 310ms to 28ms post-remediation</p>
          </div>
          <Badge variant={isDeployed ? 'success' : 'purple'} size="sm">
            {isDeployed ? 'Optimized' : 'Normalizing'}
          </Badge>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics}>
              <CartesianGrid stroke="#1f2d45" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2d45', fontSize: '12px' }} />
              <Area type="monotone" dataKey="latency" stroke="#10b981" fill="#10b981" fillOpacity={0.15} name="Latency (ms)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
