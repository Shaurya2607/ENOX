import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppLayout } from './layouts/AppLayout';

import { AuthPage } from './pages/auth/AuthPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { RepositoryPage } from './pages/repository/RepositoryPage';
import { CodeIntelligencePage } from './pages/code-intelligence/CodeIntelligencePage';
import { IssuesPage } from './pages/issues/IssuesPage';
import { DebuggingPage } from './pages/debugging/DebuggingPage';
import { CodeReviewPage } from './pages/quality/CodeReviewPage';
import { TestingPage } from './pages/quality/TestingPage';
import { SecurityPage } from './pages/quality/SecurityPage';
import { WorkflowsPage } from './pages/automation/WorkflowsPage';
import { AITasksPage } from './pages/automation/AITasksPage';
import { EnoxAgentPage } from './pages/automation/EnoxAgentPage';
import { DeploymentsPage } from './pages/delivery/DeploymentsPage';
import { MonitoringPage } from './pages/delivery/MonitoringPage';
import { ActivityPage } from './pages/system/ActivityPage';
import { NotificationsPage } from './pages/system/NotificationsPage';
import { SettingsPage } from './pages/system/SettingsPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAppStore();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected Application Routes under AppLayout Shell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Overview */}
            <Route index element={<DashboardPage />} />

            {/* Development */}
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="repository" element={<RepositoryPage />} />
            <Route path="code-intelligence" element={<CodeIntelligencePage />} />
            <Route path="issues" element={<IssuesPage />} />
            <Route path="debugging" element={<DebuggingPage />} />

            {/* Quality */}
            <Route path="code-review" element={<CodeReviewPage />} />
            <Route path="testing" element={<TestingPage />} />
            <Route path="security" element={<SecurityPage />} />

            {/* Automation */}
            <Route path="workflows" element={<WorkflowsPage />} />
            <Route path="ai-tasks" element={<AITasksPage />} />
            <Route path="agent" element={<EnoxAgentPage />} />

            {/* Delivery */}
            <Route path="deployments" element={<DeploymentsPage />} />
            <Route path="monitoring" element={<MonitoringPage />} />

            {/* System */}
            <Route path="activity" element={<ActivityPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
