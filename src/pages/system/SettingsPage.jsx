import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import {
  Settings,
  User,
  Bot,
  GitBranch,
  Rocket,
  ShieldCheck,
  Bell,
  Key,
  Save,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export const SettingsPage = () => {
  const { user, setUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  // Form states
  const [workspaceName, setWorkspaceName] = useState('ENOX Core Systems');
  const [timezone, setTimezone] = useState('UTC-05:00 (Eastern Time)');
  const [theme, setTheme] = useState('dark');

  // AI settings
  const [aiEnabled, setAiEnabled] = useState(true);
  const [model, setModel] = useState('gemini-3.8-flash-high');
  const [autonomyLevel, setAutonomyLevel] = useState('Semi-Autonomous');
  const [maxParallelAgents, setMaxParallelAgents] = useState(3);
  const [contextWindow, setContextWindow] = useState('1M Tokens');

  // Git & CI/CD
  const [gitProvider, setGitProvider] = useState('GitHub');
  const [ciProvider, setCiProvider] = useState('GitHub Actions');

  // Masked API keys (rule 13: masked placeholders only, NEVER real keys)
  const [apiKey] = useState('enox_live_••••••••••••••••••••••••••••3f8a');
  const [webhookUrl, setWebhookUrl] = useState('https://api.enox.dev/v1/webhooks/cluster-us-east-1');

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings className="w-3.5 h-3.5" /> },
    { id: 'account', label: 'Account', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'ai', label: 'ENOX / AI Swarm', icon: <Bot className="w-3.5 h-3.5" /> },
    { id: 'git', label: 'Git & CI/CD', icon: <GitBranch className="w-3.5 h-3.5" /> },
    { id: 'security', label: 'Security & SAST', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'api', label: 'API & Integrations', icon: <Key className="w-3.5 h-3.5" /> },
  ];

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success('Platform preferences saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-enox-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Platform Settings & Autonomy Configuration
          </h1>
          <p className="text-xs text-slate-400">
            Manage workspace configuration, LLM reasoning parameters, security policies, and integrations.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          loading={saving}
          onClick={handleSave}
          icon={<Save className="w-3.5 h-3.5" />}
        >
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* GENERAL TAB */}
      {activeTab === 'general' && (
        <Card className="p-6 space-y-4 max-w-2xl">
          <h3 className="text-sm font-semibold text-white">General Workspace Parameters</h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Workspace Name</label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full bg-enox-bg border border-enox-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Timezone</label>
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-enox-bg border border-enox-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Visual Theme</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-4 py-2 rounded-lg border text-xs font-medium ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300'
                    : 'border-slate-800 text-slate-400'
                }`}
              >
                Dark Professional (Developer Default)
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ACCOUNT TAB */}
      {activeTab === 'account' && (
        <Card className="p-6 space-y-4 max-w-2xl">
          <h3 className="text-sm font-semibold text-white">User Account & Role</h3>

          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=face'}
              alt="Avatar"
              className="w-14 h-14 rounded-full border border-indigo-500/80 object-cover"
            />
            <div>
              <h4 className="text-sm font-bold text-white">{user?.name}</h4>
              <p className="text-xs text-slate-400">{user?.role} &bull; Enterprise Admin</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={user?.name || ''}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="w-full bg-enox-bg border border-enox-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="w-full bg-enox-bg border border-enox-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </Card>
      )}

      {/* ENOX / AI SWARM TAB */}
      {activeTab === 'ai' && (
        <Card className="p-6 space-y-5 max-w-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-enox-border">
            <div>
              <h3 className="text-sm font-semibold text-white">ENOX Autonomous Engine</h3>
              <p className="text-xs text-slate-400">Configure autonomy boundaries and parallel subagents</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={() => setAiEnabled(!aiEnabled)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Reasoning Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-enox-bg border border-enox-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="gemini-3.8-flash-high">Gemini 3.8 Flash (High Autonomy)</option>
              <option value="claude-3-7-sonnet">Claude 3.7 Sonnet (Thinking Mode)</option>
              <option value="gpt-4o-code">GPT-4o Developer Edition</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Autonomy Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Assisted', 'Confirm Actions', 'Semi-Autonomous', 'Autonomous'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setAutonomyLevel(lvl)}
                  className={`p-2.5 rounded-lg border text-xs text-center transition ${
                    autonomyLevel === lvl
                      ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300 font-semibold'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Max Parallel Agents
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={maxParallelAgents}
                onChange={(e) => setMaxParallelAgents(Number(e.target.value))}
                className="w-full bg-enox-bg border border-enox-border rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Context Window Size
              </label>
              <input
                type="text"
                value={contextWindow}
                onChange={(e) => setContextWindow(e.target.value)}
                className="w-full bg-enox-bg border border-enox-border rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </Card>
      )}

      {/* GIT INTEGRATIONS TAB */}
      {activeTab === 'git' && (
        <Card className="p-6 space-y-4 max-w-2xl">
          <h3 className="text-sm font-semibold text-white">Git Version Control & CI/CD</h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Git Provider</label>
            <div className="grid grid-cols-3 gap-3">
              {['GitHub', 'GitLab', 'Bitbucket'].map((provider) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => setGitProvider(provider)}
                  className={`p-3 rounded-lg border text-xs text-center font-medium ${
                    gitProvider === provider
                      ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400'
                  }`}
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Connected Organization</label>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-enox-border">
              <span className="font-mono text-xs text-slate-200">@enox-enterprise-org</span>
              <Badge variant="success" size="sm">Connected</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* SECURITY TAB */}
      {activeTab === 'security' && (
        <Card className="p-6 space-y-4 max-w-2xl">
          <h3 className="text-sm font-semibold text-white">Security & Zero-Trust Policies</h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-enox-border cursor-pointer">
              <div>
                <span className="font-semibold text-slate-200 block">Automated Secret Scanning</span>
                <span className="text-[11px] text-slate-400">Scan pull requests for hardcoded tokens before merge</span>
              </div>
              <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-indigo-600" />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-enox-border cursor-pointer">
              <div>
                <span className="font-semibold text-slate-200 block">Post-Quantum Dilithium Validation</span>
                <span className="text-[11px] text-slate-400">Verify NIST FIPS 203/204 compliance for cryptographic routines</span>
              </div>
              <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-indigo-600" />
            </label>
          </div>
        </Card>
      )}

      {/* API & INTEGRATIONS TAB */}
      {activeTab === 'api' && (
        <Card className="p-6 space-y-4 max-w-2xl">
          <h3 className="text-sm font-semibold text-white">API Credentials & Webhooks</h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Production API Key (Masked Placeholder)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="flex-1 bg-slate-950 border border-enox-border rounded-lg px-3 py-2 text-xs text-slate-400 font-mono"
              />
              <Button variant="secondary" size="sm" onClick={() => toast.info('Key rotation initiated')}>
                Rotate
              </Button>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">
              Never share secret credentials in client-side code.
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Ingress Webhook Endpoint</label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-enox-bg border border-enox-border rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </Card>
      )}
    </div>
  );
};
