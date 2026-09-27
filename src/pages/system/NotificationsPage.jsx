import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { notificationService } from '../../services/notificationService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Bell,
  Check,
  CheckCheck,
  Filter,
  ArrowRight,
  Clock,
  ShieldCheck,
  Rocket,
  Bug,
  Cpu,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { unreadCount, clearUnread } = useAppStore();

  const [notifications, setNotifications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function loadNotifs() {
      const data = await notificationService.getNotifications(selectedCategory);
      setNotifications(data);
    }
    loadNotifs();
  }, [selectedCategory]);

  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    toast.success('Notification marked as read');
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    clearUnread();
    toast.success('All notifications marked as read');
  };

  const categories = ['All', 'AI', 'Builds', 'Tests', 'Security', 'Deployments', 'Reviews'];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-enox-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Notification Center & Alerts
            {unreadCount > 0 && (
              <Badge variant="danger" size="sm">{unreadCount} Unread</Badge>
            )}
          </h1>
          <p className="text-xs text-slate-400">
            Real-time critical alerts, autonomous triage results, and delivery pipeline updates.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleMarkAllRead}
          icon={<CheckCheck className="w-3.5 h-3.5 text-indigo-400" />}
        >
          Mark All as Read
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-xl border border-enox-border overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <Card className="p-4 space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              n.read
                ? 'bg-slate-950/40 border-enox-border opacity-70'
                : 'bg-slate-900/80 border-indigo-900/80 ring-1 ring-indigo-500/20'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                )}
                <Badge variant={n.severity === 'error' ? 'danger' : n.severity === 'warning' ? 'warning' : 'info'} size="sm">
                  {n.category}
                </Badge>
                <h4 className="text-xs font-bold text-slate-100 truncate">{n.title}</h4>
              </div>

              <p className="text-xs text-slate-300 font-sans pl-4 sm:pl-0">{n.message}</p>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block pl-4 sm:pl-0">
                {n.timestamp}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {n.link && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => navigate(n.link)}
                  icon={<ArrowRight className="w-3 h-3 text-indigo-400" />}
                >
                  View
                </Button>
              )}
              {!n.read && (
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => handleMarkAsRead(n.id)}
                  icon={<Check className="w-3 h-3 text-emerald-400" />}
                >
                  Read
                </Button>
              )}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};
