import { create } from 'zustand';

const initialParallelState = {
  debugger: { status: 'IDLE', progress: 0, message: 'Standing by for incident dispatch' },
  tester: { status: 'IDLE', progress: 0, message: 'Unit & concurrency test runner idle' },
  security: { status: 'IDLE', progress: 0, message: 'CVE and static vulnerability scanner idle' },
  review: { status: 'IDLE', progress: 0, message: 'Automated PR review engine waiting' },
  deployment: { status: 'IDLE', progress: 0, message: 'Canary pipeline orchestrator waiting' },
};

export const useAppStore = create((set) => ({
  user: null,
  // Always require a fresh login on app start (no persisted session),
  // so the app boots to /auth every time rather than the dashboard.
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),

  // Persistent sidebar state from localStorage
  sidebarCollapsed: (() => {
    try {
      return localStorage.getItem('enox_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  })(),
  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarCollapsed;
      try {
        localStorage.setItem('enox_sidebar_collapsed', String(next));
      } catch {}
      return { sidebarCollapsed: next };
    }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  selectedProjectId: 'proj-sentinel-iq',
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),

  enoxStatus: 'idle',
  setEnoxStatus: (status) => set({ enoxStatus: status }),

  // End-To-End Autonomous Workflow Progression States
  isFixApplied: false,
  setFixApplied: (applied) => set({ isFixApplied: applied }),

  isPrCreated: false,
  setPrCreated: (created) => set({ isPrCreated: created }),

  isDeployed: false,
  setDeployed: (deployed) => set({ isDeployed: deployed }),

  isIssueResolved: false,
  setIssueResolved: (resolved) => set({ isIssueResolved: resolved }),

  parallelAgents: initialParallelState,
  updateAgent: (agent, updates) =>
    set((state) => ({
      parallelAgents: {
        ...state.parallelAgents,
        [agent]: {
          ...state.parallelAgents[agent],
          ...updates,
        },
      },
    })),
  resetAgents: () => set({ parallelAgents: initialParallelState, enoxStatus: 'idle' }),

  unreadCount: 2,
  decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  clearUnread: () => set({ unreadCount: 0 }),
}));
