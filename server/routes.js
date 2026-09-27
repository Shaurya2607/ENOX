import { Router } from 'express';
import {
  authService, projectService, repositoryService, issueService,
  debuggingService, testingService, securityService, workflowService,
  aiService, deploymentService, monitoringService, notificationService,
} from './services.js';

const router = Router();

const ok = (res, data) => res.json(data);
const fail = (res, err) => {
  console.error(err);
  res.status(err.status || 400).json({ error: err.message || 'Request failed' });
};

// Wraps an async route handler so any thrown/rejected error becomes a JSON
// error response instead of Express's default HTML error page.
const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    fail(res, err);
  }
};

// Sets up a Server-Sent Events stream and gives you an `emit(event)` function.
// Used for every endpoint that used to take a progress callback in the browser.
function sse(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  return {
    emit: (data) => res.write(`data: ${JSON.stringify(data)}\n\n`),
    end: () => res.end(),
  };
}

// ---------------- AUTH ----------------
router.post('/auth/login', handle(async (req, res) => ok(res, await authService.login(req.body))));
router.post('/auth/register', handle(async (req, res) => ok(res, await authService.register(req.body))));
router.post('/auth/forgot-password', handle(async (req, res) => ok(res, await authService.forgotPassword(req.body?.email))));
router.get('/auth/me', handle(async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  ok(res, await authService.getCurrentUser(req.user.sub));
}));

// ---------------- PROJECTS ----------------
router.get('/projects', handle(async (req, res) => ok(res, await projectService.getProjects())));
router.get('/projects/:id', handle(async (req, res) => ok(res, await projectService.getProject(req.params.id))));
router.post('/projects', handle(async (req, res) => ok(res, await projectService.createProject(req.body))));
router.patch('/projects/:id', handle(async (req, res) => ok(res, await projectService.updateProject(req.params.id, req.body))));
router.post('/projects/import', handle(async (req, res) => ok(res, await projectService.importRepository(req.body?.repoUrl))));
router.post('/projects/connect-github', handle(async (_req, res) => ok(res, await projectService.connectGitHub())));

// ---------------- REPOSITORY ----------------
router.get('/repository/:projectId', handle(async (req, res) => ok(res, await repositoryService.getRepository(req.params.projectId))));
router.get('/repository/:projectId/file', handle(async (req, res) => ok(res, await repositoryService.getFile(req.params.projectId, req.query.path))));
router.post('/repository/explain', handle(async (req, res) => ok(res, await repositoryService.explainFile(req.body?.filePath, req.body?.content))));
router.post('/repository/review', handle(async (req, res) => ok(res, await repositoryService.reviewFile(req.body?.filePath, req.body?.content))));
router.post('/repository/modify', handle(async (req, res) => ok(res, await repositoryService.modifyFileWithAI(req.body?.filePath, req.body?.instruction))));

// ---------------- ISSUES ----------------
router.get('/issues', handle(async (req, res) => ok(res, await issueService.getIssues(req.query.project))));
router.get('/issues/:id', handle(async (req, res) => ok(res, await issueService.getIssue(req.params.id))));
router.patch('/issues/:id', handle(async (req, res) => ok(res, await issueService.updateIssue(req.params.id, req.body))));
router.post('/issues/:id/comments', handle(async (req, res) => ok(res, await issueService.addComment(req.params.id, req.body?.text, req.body?.author))));
router.post('/issues/:id/resolve', handle(async (req, res) => ok(res, await issueService.resolveIssue(req.params.id))));

// ---------------- DEBUGGING ----------------
router.get('/debugging/context', handle(async (req, res) => ok(res, await debuggingService.getDebugContext(req.query.issueId))));
router.post('/debugging/analyze', handle(async (req, res) => ok(res, await debuggingService.analyzeError(req.body))));
router.post('/debugging/generate-fix', handle(async (req, res) => ok(res, await debuggingService.generateFix(req.body?.issueId))));
router.post('/debugging/apply-fix', handle(async (req, res) => ok(res, await debuggingService.applyFix(req.body?.issueId))));
router.get('/debugging/fix-applied', handle(async (req, res) => ok(res, { applied: await debuggingService.isFixApplied(req.query.issueId) })));
router.get('/debugging/ask', (req, res) => {
  res.json({
    success: true,
    endpoint: '/api/debugging/ask',
    method: 'POST',
    status: 'ENOX AI online',
    message: 'Use POST with { "question": "..." } to query ENOX.',
  });
});
router.post('/debugging/ask', handle(async (req, res) => {
  const question = req.body?.question || req.body?.message || req.body?.prompt;

  if (!question || !String(question).trim()) {
    return res.status(400).json({ success: false, error: 'Question is required' });
  }

  try {
    const answer = await debuggingService.askEnox(String(question).trim());
    return res.status(200).json({
      success: true,
      answer,
      response: answer,
      message: answer,
      data: { answer },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'ENOX AI failed',
      answer: '',
      response: '',
    });
  }
}));

// ---------------- TESTING ----------------
router.get('/testing/suite', handle(async (req, res) => ok(res, await testingService.getTestSuite(req.query.projectId))));
router.get('/testing/run', async (req, res) => {
  const { emit, end } = sse(res);
  try {
    const result = await testingService.runTests(req.query.projectId, (count, total, testName) => emit({ type: 'progress', count, total, testName }));
    emit({ type: 'done', done: true, result });
  } catch (e) {
    emit({ type: 'error', done: true, message: e.message });
  }
  end();
});
router.get('/testing/run-failed', async (req, res) => {
  const { emit, end } = sse(res);
  try {
    const result = await testingService.runFailedTests(req.query.projectId, (count, total, testName) => emit({ type: 'progress', count, total, testName }));
    emit({ type: 'done', done: true, result });
  } catch (e) {
    emit({ type: 'error', done: true, message: e.message });
  }
  end();
});
router.post('/testing/generate', handle(async (req, res) => ok(res, await testingService.generateTests(req.body?.filePath))));

// ---------------- SECURITY ----------------
router.get('/security/report', handle(async (req, res) => ok(res, await securityService.getSecurityReport(req.query.projectId))));
router.post('/security/scan', handle(async (req, res) => ok(res, await securityService.runSecurityScan(req.body?.projectId))));
router.post('/security/fix/:findingId', handle(async (req, res) => ok(res, await securityService.fixFinding(req.params.findingId))));
router.post('/security/ignore/:findingId', handle(async (req, res) => { await securityService.ignoreFinding(req.params.findingId); ok(res, { success: true }); }));
router.post('/security/explain', handle(async (req, res) => ok(res, { explanation: await securityService.explainFinding(req.body?.finding) })));

// ---------------- WORKFLOWS ----------------
router.get('/workflows', handle(async (req, res) => ok(res, await workflowService.getWorkflows())));
router.get('/workflows/:id', handle(async (req, res) => ok(res, await workflowService.getWorkflow(req.params.id))));
router.post('/workflows', handle(async (req, res) => ok(res, await workflowService.saveWorkflow(req.body))));
router.get('/workflows/:id/execute', async (req, res) => {
  const { emit, end } = sse(res);
  try {
    await workflowService.executeWorkflow(req.params.id, (nodeId, status) => emit({ type: 'step', nodeId, status }));
    emit({ type: 'done', done: true });
  } catch (e) {
    emit({ type: 'error', done: true, message: e.message });
  }
  end();
});

// ---------------- AI ----------------
router.get('/ai/tasks', handle(async (_req, res) => ok(res, await aiService.getAITasks())));
router.get('/ai/tasks/:id', handle(async (req, res) => ok(res, await aiService.getAITask(req.params.id))));
router.get('/ai/documents', handle(async (_req, res) => ok(res, await aiService.getDocuments())));
router.post('/ai/documents', handle(async (req, res) => ok(res, await aiService.indexDocument(req.body?.name, req.body?.type, req.body?.content))));
router.get('/ai/pull-request', handle(async (req, res) => ok(res, await aiService.getPullRequest(req.query.id))));
router.post('/ai/pull-request', handle(async (req, res) => ok(res, await aiService.createPullRequest(req.body))));
router.post('/ai/accept-suggestion', handle(async (req, res) => { await aiService.acceptSuggestion(req.body?.findingId); ok(res, { success: true }); }));
router.post('/ai/query', handle(async (req, res) => {
  const question = req.body?.question || req.body?.message || req.body?.prompt;

  if (!question || !String(question).trim()) {
    return res.status(400).json({ success: false, error: 'Question is required' });
  }

  try {
    const answer = await debuggingService.askEnox(String(question).trim());
    return res.status(200).json({
      success: true,
      answer,
      response: answer,
      message: answer,
      data: { answer },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'ENOX AI failed',
      answer: '',
      response: '',
    });
  }
}));
router.get('/ai/run-parallel-agents', async (req, res) => {
  const { emit, end } = sse(res);
  try {
    await aiService.runParallelAgents((update) => emit({ type: 'update', ...update }));
    emit({ type: 'done', done: true });
  } catch (e) {
    emit({ type: 'error', done: true, message: e.message });
  }
  end();
});

// ---------------- DEPLOYMENTS ----------------
router.get('/deployments', handle(async (_req, res) => ok(res, await deploymentService.getDeployments())));
router.get('/deployments/latest', handle(async (req, res) => ok(res, await deploymentService.getLatestDeployment(req.query.projectId))));
router.get('/deployments/trigger', async (req, res) => {
  const { emit, end } = sse(res);
  try {
    const result = await deploymentService.triggerDeployment(req.query.project, (i, name, status) => emit({ type: 'stage', index: i, name, status }));
    emit({ type: 'done', done: true, result });
  } catch (e) {
    emit({ type: 'error', done: true, message: e.message });
  }
  end();
});
router.post('/deployments/:id/rollback', handle(async (req, res) => ok(res, await deploymentService.rollbackDeployment(req.params.id))));

// ---------------- MONITORING ----------------
router.get('/monitoring/metrics', handle(async (req, res) => ok(res, await monitoringService.getMonitoringMetrics(req.query.range))));
router.get('/monitoring/live', handle(async (_req, res) => ok(res, await monitoringService.getLiveStats())));

// ---------------- NOTIFICATIONS ----------------
router.get('/notifications', handle(async (req, res) => ok(res, await notificationService.getNotifications(req.query.category))));
router.post('/notifications/:id/read', handle(async (req, res) => { await notificationService.markAsRead(req.params.id); ok(res, { success: true }); }));
router.post('/notifications/read-all', handle(async (_req, res) => { await notificationService.markAllAsRead(); ok(res, { success: true }); }));
router.post('/notifications', handle(async (req, res) => ok(res, await notificationService.addNotification(req.body))));
router.get('/activities', handle(async (req, res) => ok(res, await notificationService.getActivities(req.query.category))));
router.post('/activities', handle(async (req, res) => ok(res, await notificationService.recordActivity(req.body))));

export default router;
