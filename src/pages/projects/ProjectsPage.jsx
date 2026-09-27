import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { projectService } from '../../services/projectService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { GithubIcon } from '../../components/common/Icons';
import {
  FolderGit2,
  Search,
  Plus,
  GitBranch,
  Star,
  GitFork,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Filter,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const { setSelectedProjectId, isFixApplied } = useAppStore();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // New project form state
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectLang, setNewProjectLang] = useState('TypeScript');
  const [newProjectCat, setNewProjectCat] = useState('Microservice');
  const [importUrl, setImportUrl] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      const data = await projectService.getProjects();
      setProjects(data);
      setLoading(false);
    }
    fetchProjects();
  }, [isFixApplied]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.language.toLowerCase().includes(search.toLowerCase());
    if (selectedFilter === 'All') return matchesSearch;
    if (selectedFilter === 'Failing') return matchesSearch && p.buildStatus === 'failed';
    if (selectedFilter === 'Passing') return matchesSearch && p.buildStatus === 'passing';
    return matchesSearch;
  });

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      toast.error('Project name is required');
      return;
    }
    setActionLoading(true);
    try {
      const created = await projectService.createProject({
        name: newProjectName,
        description: newProjectDesc,
        language: newProjectLang,
        category: newProjectCat,
      });
      setProjects([created, ...projects]);
      toast.success(`Project ${created.name} provisioned successfully!`);
      setIsCreateOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
    } catch (err) {
      toast.error('Failed to create project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleImportRepo = async (e) => {
    e.preventDefault();
    if (!importUrl.trim()) {
      toast.error('Repository URL is required');
      return;
    }
    setActionLoading(true);
    try {
      const imported = await projectService.importRepository(importUrl);
      setProjects([imported, ...projects]);
      toast.success(`Imported repository from ${importUrl}`);
      setIsImportOpen(false);
      setImportUrl('');
    } catch (err) {
      toast.error('Failed to import repository');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConnectGithub = async () => {
    setActionLoading(true);
    const res = await projectService.connectGitHub();
    setActionLoading(false);
    toast.success(`Connected to GitHub Organization: @${res.username}`);
  };

  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    navigate('/repository');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-enox-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Project Repositories
            <Badge variant="purple" size="sm">{projects.length} Registered</Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise microservices, neural engines, and cryptographic platforms with continuous ENOX integration.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleConnectGithub}
            icon={<GithubIcon className="w-3.5 h-3.5 text-white" />}
          >
            Connect GitHub
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsImportOpen(true)}
            icon={<GitBranch className="w-3.5 h-3.5 text-indigo-400" />}
          >
            Import Repo
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Project
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-enox-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, language, or stack..."
            className="w-full bg-enox-bg border border-enox-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-400">Filter:</span>
          {['All', 'Passing', 'Failing'].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`px-2.5 py-1 rounded text-xs transition ${
                selectedFilter === f
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const isFailing = project.buildStatus === 'failed';
          return (
            <Card
              key={project.id}
              hover
              onClick={() => handleSelectProject(project.id)}
              className="flex flex-col justify-between p-5 relative group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-indigo-400">
                      <FolderGit2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition">
                        {project.name}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-500">
                        {project.framework}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={isFailing ? 'danger' : 'success'}
                    dot
                    size="sm"
                  >
                    {project.buildStatus.toUpperCase()}
                  </Badge>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mt-2 mb-4 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-enox-border/60">
                {/* Status indicators */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  <div className="bg-slate-900/80 p-1.5 rounded border border-enox-border">
                    <span className="text-slate-500 block">TESTS</span>
                    <span className={project.testStatus === 'passing' ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                      {project.testStatus}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-1.5 rounded border border-enox-border">
                    <span className="text-slate-500 block">SECURITY</span>
                    <span className={project.securityStatus === 'healthy' ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                      {project.securityStatus}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-1.5 rounded border border-enox-border">
                    <span className="text-slate-500 block">COVERAGE</span>
                    <span className="text-cyan-400 font-semibold">
                      {project.coverage}%
                    </span>
                  </div>
                </div>

                {/* Footer details */}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-slate-400 truncate max-w-[160px]">
                    {project.lastDeployment.version} ({project.lastDeployment.timestamp})
                  </span>
                  <span className="text-indigo-400 flex items-center gap-1 font-medium group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* CREATE PROJECT MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Project Repository"
        description="Provision a new production-ready microservice with automated CI/CD and ENOX autonomous monitoring."
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Project Name</label>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="e.g. Identity Gateway"
              className="w-full bg-enox-bg border border-enox-border rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <textarea
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              rows={3}
              placeholder="Service purpose, SLAs, and architecture summary..."
              className="w-full bg-enox-bg border border-enox-border rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Primary Language</label>
              <select
                value={newProjectLang}
                onChange={(e) => setNewProjectLang(e.target.value)}
                className="w-full bg-enox-bg border border-enox-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="TypeScript">TypeScript</option>
                <option value="Python">Python</option>
                <option value="Rust">Rust</option>
                <option value="Go">Go</option>
                <option value="Java">Java</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={newProjectCat}
                onChange={(e) => setNewProjectCat(e.target.value)}
                className="w-full bg-enox-bg border border-enox-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Backend Service">Backend Service</option>
                <option value="AI Engine">AI Engine</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Fintech">Fintech</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-enox-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={actionLoading}>
              Provision Repository
            </Button>
          </div>
        </form>
      </Modal>

      {/* IMPORT REPO MODAL */}
      <Modal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Import Remote Git Repository"
        description="Connect an existing GitHub, GitLab, or Bitbucket repository for autonomous AST analysis."
      >
        <form onSubmit={handleImportRepo} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Repository HTTPS URL</label>
            <input
              type="text"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://github.com/organization/repo-name.git"
              className="w-full bg-enox-bg border border-enox-border rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-enox-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsImportOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={actionLoading}>
              Clone & Index
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
