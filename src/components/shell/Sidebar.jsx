import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store';
import {
  LayoutDashboard,
  FolderGit2,
  FileCode2,
  Sparkles,
  AlertCircle,
  Bug,
  GitPullRequest,
  CheckSquare,
  ShieldAlert,
  GitFork,
  Cpu,
  Bot,
  Rocket,
  Activity,
  History,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar, unreadCount, isFixApplied, isDeployed } = useAppStore();
  const location = useLocation();

  const navigationGroups = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Development',
      items: [
        { name: 'Projects', path: '/projects', icon: FolderGit2, badge: '5' },
        { name: 'Repository Explorer', path: '/repository', icon: FileCode2 },
        { name: 'Code Intelligence', path: '/code-intelligence', icon: Sparkles },
        { name: 'Issues', path: '/issues', icon: AlertCircle, badge: isFixApplied ? '0' : '1', badgeType: isFixApplied ? 'success' : 'danger' },
        { name: 'Debugging', path: '/debugging', icon: Bug, badge: isFixApplied ? 'Fixed' : 'P0', badgeType: isFixApplied ? 'success' : 'danger' },
      ],
    },
    {
      group: 'Quality',
      items: [
        { name: 'Code Review', path: '/code-review', icon: GitPullRequest, badge: 'PR-428' },
        { name: 'Testing', path: '/testing', icon: CheckSquare, badge: isFixApplied ? '148/148' : '146/148', badgeType: isFixApplied ? 'success' : 'warning' },
        { name: 'Security', path: '/security', icon: ShieldAlert, badge: isFixApplied ? '96%' : '68%', badgeType: isFixApplied ? 'success' : 'danger' },
      ],
    },
    {
      group: 'Automation',
      items: [
        { name: 'Workflows', path: '/workflows', icon: GitFork },
        { name: 'AI Tasks', path: '/ai-tasks', icon: Cpu, badge: 'Active' },
        { name: 'ENOX Agent', path: '/agent', icon: Bot, pulse: true },
      ],
    },
    {
      group: 'Delivery',
      items: [
        { name: 'Deployments', path: '/deployments', icon: Rocket, badge: isDeployed ? 'Live' : 'Rollback', badgeType: isDeployed ? 'success' : 'danger' },
        { name: 'Monitoring', path: '/monitoring', icon: Activity },
      ],
    },
    {
      group: 'System',
      items: [
        { name: 'Activity', path: '/activity', icon: History },
        { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount > 0 ? String(unreadCount) : null, badgeType: 'info' },
        { name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'h-screen bg-enox-surface border-r border-enox-border sticky top-0 z-40 flex flex-col transition-all duration-200 select-none shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-enox-border">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img src="/logo.svg" alt="ENOX" className="w-7 h-7 rounded-md shrink-0 shadow-sm" />
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white text-base leading-none">
                ENOX
              </span>
              <span className="text-[10px] font-mono text-indigo-400 font-semibold tracking-wider">
                CORE PLATFORM
              </span>
            </div>
          </div>
        )}

        {sidebarCollapsed && (
          <div className="mx-auto">
            <img src="/logo.svg" alt="ENOX" className="w-7 h-7 rounded-md" />
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navigationGroups.map((group) => (
          <div key={group.group}>
            {!sidebarCollapsed && (
              <div className="px-2 mb-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                {group.group}
              </div>
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={sidebarCollapsed ? item.name : undefined}
                    className={cn(
                      'flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 group relative',
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-transform duration-150',
                        isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200',
                        item.pulse && 'animate-pulse text-cyan-400'
                      )}
                    />

                    {!sidebarCollapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}

                    {!sidebarCollapsed && item.badge && (
                      <span
                        className={cn(
                          'text-[10px] font-mono px-1.5 py-0.2 rounded-full border shrink-0',
                          item.badgeType === 'danger' && 'bg-rose-950/60 text-rose-300 border-rose-800/80',
                          item.badgeType === 'success' && 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80',
                          item.badgeType === 'warning' && 'bg-amber-950/60 text-amber-300 border-amber-800/80',
                          (!item.badgeType || item.badgeType === 'info') && 'bg-slate-800 text-slate-300 border-slate-700'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-2.5 border-t border-enox-border bg-slate-950/40">
        {!sidebarCollapsed ? (
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-mono">v1.0.0-PROD</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SLA 99.999%
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};
