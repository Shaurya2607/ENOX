import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { authService } from '../../services/authService';
import { ENOXCore } from '../ui/ENOXCore';
import {
  Search,
  Bell,
  ChevronDown,
  Layers,
  User,
  Settings,
  LogOut,
  Check,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const Topbar = () => {
  const {
    user,
    logout,
    enoxStatus,
    setCommandPaletteOpen,
    unreadCount,
    clearUnread,
    selectedProjectId,
    setSelectedProjectId,
  } = useAppStore();

  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navigate = useNavigate();
  const workspaceRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const workspaces = [
    { id: 'ws-1', name: 'ENOX Core Systems', role: 'Enterprise Admin', active: true },
    { id: 'ws-2', name: 'Cyber Intelligence Cluster', role: 'Security Ops', active: false },
    { id: 'ws-3', name: 'Fintech Payments Rail', role: 'PCI Compliance', active: false },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (workspaceRef.current && !workspaceRef.current.contains(e.target)) setWorkspaceOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-enox-surface/90 backdrop-blur border-b border-enox-border sticky top-0 z-30 px-4 flex items-center justify-between gap-4">
      {/* Left: Quick Search / Command Palette trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-enox-bg/80 border border-enox-border text-slate-400 hover:text-slate-200 hover:border-enox-borderLight transition text-xs shadow-inner"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search or jump to...</span>
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Center: Live ENOX Autonomy Status indicator */}
      <div className="hidden md:flex items-center">
        <div
          onClick={() => navigate('/agent')}
          className="cursor-pointer hover:bg-slate-800/40 px-3 py-1 rounded-full border border-enox-border/60 transition"
        >
          <ENOXCore status={enoxStatus} size="sm" showLabel={true} />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Workspace Switcher */}
        <div className="relative" ref={workspaceRef}>
          <button
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/70 text-xs text-slate-300 border border-transparent hover:border-slate-700 transition"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline font-medium">ENOX Core Systems</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {workspaceOpen && (
            <div className="absolute right-0 mt-1 w-60 bg-enox-surface border border-enox-border rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-enox-border">
                Workspaces
              </div>
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => setWorkspaceOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-800/80 cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{ws.name}</div>
                    <div className="text-[10px] text-slate-400">{ws.role}</div>
                  </div>
                  {ws.active && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon Button */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              if (unreadCount > 0) clearUnread();
            }}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border border-transparent hover:border-slate-700 transition"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-1 w-80 bg-enox-surface border border-enox-border rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-enox-border mb-2">
                <span className="text-xs font-semibold text-slate-200">Alerts & Notifications</span>
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate('/notifications');
                  }}
                  className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                >
                  View all <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate('/debugging');
                  }}
                  className="p-2 rounded bg-rose-950/30 border border-rose-900/60 cursor-pointer hover:bg-rose-900/40"
                >
                  <div className="font-semibold text-rose-300">Canary Deployment Failure</div>
                  <div className="text-[11px] text-slate-400">SentinelIQ pod crash loop in us-east-1</div>
                </div>
                <div
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate('/issues');
                  }}
                  className="p-2 rounded bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:bg-slate-800"
                >
                  <div className="font-semibold text-slate-200">P0 Incident: ISSUE-9421</div>
                  <div className="text-[11px] text-slate-400">Production deployment failed. Assignee: Alex Vance</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800/70 border border-transparent hover:border-slate-700 transition"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=face'}
              alt={user?.name || 'User'}
              className="w-7 h-7 rounded-full object-cover border border-indigo-500/60"
            />
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-enox-surface border border-enox-border rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-enox-border">
                <div className="font-semibold text-xs text-slate-100">{user?.name || 'Alex Vance'}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email || 'alex.vance@enox.dev'}</div>
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <Shield className="w-3 h-3" /> Staff Principal
                </div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/80 text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" /> Settings
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    authService.logout();
                    logout();
                    navigate('/auth');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/40 text-left"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
