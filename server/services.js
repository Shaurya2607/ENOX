import 'dotenv/config';
import bcrypt from 'bcryptjs';

import {
  db,
  fixedTestSuite,
  initialTestSuite,
  fixedSecurityReport,
  initialSecurityReport,
} from './db.js';

import { signToken } from './middleware/auth.js';

/* =========================================================
   GROQ (via plain fetch — no extra SDK dependency required)
   ========================================================= */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const hasGroq = () => Boolean(process.env.GROQ_API_KEY);

async function callGroq({ system, user, maxTokens = 2000, temperature = 0.2 }) {
  if (!hasGroq()) {
    const err = new Error('Groq AI is not configured. Add GROQ_API_KEY to server/.env and restart the server.');
    err.code = 'NO_GROQ_KEY';
    throw err;
  }

  let response;
  try {
    response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });
  } catch (networkErr) {
    throw new Error(`Could not reach Groq API: ${networkErr.message}`);
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Groq authentication failed. Check GROQ_API_KEY in server/.env.');
    }
    if (response.status === 429) {
      throw new Error('Groq rate limit reached. Please try again shortly.');
    }
    const bodyText = await response.text().catch(() => '');
    throw new Error(`Groq AI request failed (${response.status}): ${bodyText || 'Unknown error'}`);
  }

  const data = await response.json();
  const answer = data?.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error('Groq returned an empty response.');
  }

  return answer;
}

/* =========================================================
   HELPERS
   ========================================================= */

const clone = (value) => JSON.parse(JSON.stringify(value));

const stripUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const findById = (items, id) => items?.find((item) => String(item.id) === String(id));

const createId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findFileInTree(nodes, targetPath) {
  for (const node of nodes || []) {
    if (node.path === targetPath) return node;
    if (node.children) {
      const found = findFileInTree(node.children, targetPath);
      if (found) return found;
    }
  }
  return null;
}

/* =========================================================
   AUTH SERVICE
   ========================================================= */

export const authService = {
  async login({ email, password, provider } = {}) {
    if (provider === 'github' || provider === 'google') {
      const existing = db.users?.[0];
      const socialUser = {
        ...(existing || {}),
        id: existing?.id || 'user-001',
        name: provider === 'github' ? 'GitHub Developer' : 'Google Cloud Engineer',
        email: provider === 'github' ? 'developer@github.com' : 'engineer@gmail.com',
        provider,
      };

      if (db.users?.length) db.users[0] = socialUser;

      return { user: stripUser(socialUser), token: signToken(socialUser) };
    }

    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid developer email address.');
    }

    const user = db.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (user?.passwordHash) {
      const valid = await bcrypt.compare(password || '', user.passwordHash);
      if (!valid) {
        throw new Error('Authentication failed: Invalid email or password.');
      }
      return { user: stripUser(user), token: signToken(user) };
    }

    const authenticatedUser = user || {
      ...(db.users?.[0] || {}),
      id: db.users?.[0]?.id || 'user-001',
    };

    authenticatedUser.email = email;
    authenticatedUser.name =
      authenticatedUser.name || email.split('@')[0].replace(/[._-]/g, ' ');

    if (db.users?.length && !user) {
      db.users[0] = authenticatedUser;
    }

    return { user: stripUser(authenticatedUser), token: signToken(authenticatedUser) };
  },

  async register({ name, email, password } = {}) {
    if (!name || !email || !email.includes('@')) {
      throw new Error('Name and valid email are required.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const existing = db.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const user = {
      ...(db.users?.[0] || {}),
      id: createId('user'),
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      provider: 'local',
    };

    db.users.push(user);

    return { user: stripUser(user), token: signToken(user) };
  },

  async forgotPassword(email) {
    // Deliberately generic response so we never leak whether an account exists.
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    return {
      message: 'If an account exists for that email, password reset instructions have been sent.',
    };
  },

  async getCurrentUser(userId) {
    const user = findById(db.users, userId) || db.users?.[0] || null;
    return stripUser(user);
  },
};

/* =========================================================
   PROJECT SERVICE
   ========================================================= */

export const projectService = {
  async getProjects() {
    return db.projects || [];
  },

  async getProject(id) {
    return findById(db.projects, id) || null;
  },

  async createProject(data = {}) {
    const project = {
      id: data.id || createId('project'),
      name: data.name || 'Untitled Project',
      description: data.description || '',
      status: data.status || 'active',
      buildStatus: 'passing',
      testStatus: 'passing',
      securityStatus: 'healthy',
      coverage: 0,
      stars: 0,
      forks: 0,
      ...data,
    };

    db.projects.push(project);
    return project;
  },

  async updateProject(id, data = {}) {
    const index = db.projects.findIndex((p) => String(p.id) === String(id));
    if (index < 0) throw new Error('Project not found.');
    db.projects[index] = { ...db.projects[index], ...data };
    return db.projects[index];
  },

  async importRepository(repoUrl) {
    if (!repoUrl || !repoUrl.trim()) {
      throw new Error('Please provide a repository URL to import.');
    }

    const name = repoUrl.split('/').filter(Boolean).pop()?.replace(/\.git$/, '') || 'Imported Project';

    const project = {
      id: createId('project'),
      name,
      description: `Imported from ${repoUrl}`,
      category: 'Imported',
      language: 'Unknown',
      framework: 'Unknown',
      repoUrl,
      defaultBranch: 'main',
      stars: 0,
      forks: 0,
      buildStatus: 'pending',
      testStatus: 'pending',
      securityStatus: 'unknown',
      coverage: 0,
      lastDeployment: null,
    };

    db.projects.push(project);
    db.repositoryTrees[project.id] = [];

    return project;
  },

  async connectGitHub() {
    return {
      connected: true,
      provider: 'github',
      account: 'github-developer',
      message: 'GitHub account connected successfully.',
    };
  },
};

/* =========================================================
   REPOSITORY SERVICE
   ========================================================= */

export const repositoryService = {
  async getRepository(projectId) {
    if (projectId && db.repositoryTrees?.[projectId]) {
      return db.repositoryTrees[projectId];
    }
    // Fall back to the first available tree so the UI always has something to show.
    const firstKey = Object.keys(db.repositoryTrees || {})[0];
    return firstKey ? db.repositoryTrees[firstKey] : [];
  },

  async getFile(projectId, filePath) {
    if (!filePath) throw new Error('A file path is required.');
    const tree = await this.getRepository(projectId);
    const file = findFileInTree(tree, filePath);
    if (!file) throw new Error(`File not found: ${filePath}`);
    return file;
  },

  async explainFile(filePath, content) {
    if (!filePath) throw new Error('A file path is required.');

    if (!hasGroq()) {
      const ext = filePath.split('.').pop();
      const lineCount = (content || '').split('\n').length;
      return (
        `This is a ${ext} file with roughly ${lineCount} lines. ` +
        `ENOX AI explanations require a GROQ_API_KEY to be configured in server/.env — ` +
        `once that's set, this panel will return a full natural-language walkthrough of ${filePath}.`
      );
    }

    return callGroq({
      system:
        'You are ENOX, a senior software engineer. Explain the given source file clearly and concisely for another engineer.',
      user: `Explain what this file does.\n\nFILE: ${filePath}\n\nCONTENT:\n${content?.slice(0, 12000) || '(empty file)'}`,
      maxTokens: 1200,
    });
  },

  async reviewFile(filePath, content) {
    if (!filePath) throw new Error('A file path is required.');
    const src = content || '';

    // Deterministic static-analysis heuristics so this works even without an AI key.
    const findings = [];
    if (/console\.log\(/.test(src)) findings.push('Remove leftover console.log statements before shipping to production.');
    if (/\bTODO\b|\bFIXME\b/.test(src)) findings.push('Resolve outstanding TODO/FIXME markers.');
    if (/\bvar\s+/.test(src)) findings.push('Replace legacy `var` declarations with `const`/`let`.');
    if (/(password|secret|apikey|api_key)\s*=\s*['"][^'"]+['"]/i.test(src)) {
      findings.push('Possible hardcoded credential detected — move secrets to environment configuration.');
    }
    if (/catch\s*\([^)]*\)\s*{\s*}/.test(src)) findings.push('Empty catch block swallows errors silently — add logging or rethrow.');
    if (src.split('\n').some((line) => line.length > 140)) findings.push('Some lines exceed 140 characters — consider reformatting for readability.');
    if (!/\n$/.test(src) && src.length > 0) findings.push('File is missing a trailing newline.');

    let score = Math.max(60, 100 - findings.length * 8);

    if (hasGroq()) {
      try {
        const aiText = await callGroq({
          system:
            'You are ENOX, a senior code reviewer. Given a source file, respond with ONLY a JSON object of the shape {"score": number 0-100, "suggestions": string[]}. No prose, no markdown fences.',
          user: `FILE: ${filePath}\n\nCONTENT:\n${src.slice(0, 12000) || '(empty file)'}`,
          maxTokens: 1200,
        });
        const cleaned = aiText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && Array.isArray(parsed.suggestions)) {
          return {
            score: typeof parsed.score === 'number' ? parsed.score : score,
            suggestions: parsed.suggestions.length ? parsed.suggestions : findings.length ? findings : ['No issues found — code looks clean.'],
          };
        }
      } catch {
        // Fall through to heuristic result below.
      }
    }

    return {
      score,
      suggestions: findings.length ? findings : ['No issues found by static analysis — code looks clean.'],
    };
  },

  async modifyFileWithAI(filePath, instruction) {
    if (!filePath) throw new Error('A file path is required.');
    if (!instruction || !instruction.trim()) throw new Error('Please describe the change you want ENOX to make.');

    if (!hasGroq()) {
      throw new Error('ENOX AI code modification requires a GROQ_API_KEY. Add it to server/.env and restart the server.');
    }

    return callGroq({
      system:
        'You are ENOX, an autonomous coding agent. Given a file and an instruction, respond with ONLY the modified code snippet needed to satisfy the instruction — no prose, no markdown fences.',
      user: `FILE: ${filePath}\n\nINSTRUCTION: ${instruction}`,
      maxTokens: 1500,
    });
  },
};

/* =========================================================
   ISSUE SERVICE
   ========================================================= */

export const issueService = {
  async getIssues(projectId) {
    const issues = db.issues || [];
    if (!projectId) return issues;
    return issues.filter((issue) => issue.project === projectId);
  },

  async getIssue(id) {
    return findById(db.issues, id) || null;
  },

  async updateIssue(id, data = {}) {
    const index = db.issues.findIndex((i) => String(i.id) === String(id));
    if (index < 0) throw new Error('Issue not found.');
    db.issues[index] = { ...db.issues[index], ...data };
    return db.issues[index];
  },

  async addComment(issueId, text, author = 'Alex Vance') {
    if (!text || !text.trim()) throw new Error('Comment text is required.');

    const issue = findById(db.issues, issueId);
    if (!issue) throw new Error('Issue not found.');

    const comment = {
      id: createId('comment'),
      author,
      text: text.trim(),
      timestamp: 'Just now',
    };

    issue.comments = [...(issue.comments || []), comment];
    return comment;
  },

  async resolveIssue(id) {
    const issue = findById(db.issues, id);
    if (!issue) throw new Error('Issue not found.');
    issue.status = 'Resolved';
    return issue;
  },
};

/* =========================================================
   DEBUGGING / ENOX SERVICE
   ========================================================= */

export const debuggingService = {
  async getDebugContext() {
    return db.debugContext || {};
  },

  async analyzeError(context = {}) {
    return {
      issueId: context.issueId || 'ISSUE-9421',
      status: 'ANALYZED',
      confidence: 96.8,
      rootCause:
        'Race condition & missing lease retry in Distributed Lock pattern. When acquireLock times out under load, an unhandled rejection is thrown without releasing stale keys or providing failover retry mechanisms.',
      affectedFiles: ['src/services/incidentOrchestrator.ts', 'src/infra/redis.ts'],
      recommendedFix:
        'Refactor lock acquisition with exponential backoff retry jitter, wrap execution in guaranteed defensive lock-release with abort signal, and implement non-blocking fallback queuing.',
      // Kept alongside affectedFiles/recommendedFix (rather than replacing them) so any
      // other consumer of this endpoint that expects the old evidence/recommendations
      // shape keeps working too.
      evidence: [
        'Failed to acquire lock for incident inc-98124.',
        'LockContentionError: Unable to acquire cluster lock.',
        'Kubernetes Pod CrashLoopBackOff: exit code 1.',
      ],
      recommendations: [
        'Use bounded lock retries.',
        'Apply 50-200ms retry jitter.',
        'Respect the 3000ms lock lease.',
        'Route failed incidents to the secondary dead-letter Kafka topic after three attempts.',
      ],
    };
  },

  async generateFix(issueId) {
    return {
      issueId: issueId || 'ISSUE-9421',
      status: 'FIX_READY',
      title: 'Harden Redis distributed lock acquisition',
      summary: 'Introduce bounded retries, exponential backoff, jitter and Kafka fallback handling.',
      originalCode: `    // Deadlock vulnerability: lockToken acquired without safe null coalescing & proper lease release
    const lockKey = \`lock:incident:\${incident.incidentId}\`;
    const lockAcquired = await this.redis.acquireLock(lockKey, 5000);

    if (!lockAcquired) {
      this.logger.warn(\`Failed to acquire lock for incident: \${incident.incidentId}\`);
      throw new Error(\`LockContentionError: Unable to acquire cluster lock for \${incident.incidentId}\`);
    }

    try {
      await this.dispatcher.broadcastIncidentTriage(incident);
      await this.redis.set(\`incident:status:\${incident.incidentId}\`, 'TRIAGING');
      return true;
    } finally {
      await this.redis.releaseLock(lockKey);
    }`,
      fixedCode: `    // ENOX AI Automated Resolution: Adaptive retry with jitter and non-blocking fallback
    const lockKey = \`lock:incident:\${incident.incidentId}\`;
    const maxRetries = 3;
    let lockAcquired = false;
    let attempt = 0;

    while (!lockAcquired && attempt < maxRetries) {
      attempt++;
      lockAcquired = await this.redis.acquireLock(lockKey, 3000);
      if (!lockAcquired) {
        const jitter = Math.floor(Math.random() * 150) + 50 * attempt;
        await new Promise((resolve) => setTimeout(resolve, jitter));
      }
    }

    if (!lockAcquired) {
      this.logger.warn(\`Lock busy for \${incident.incidentId}, routing to high-priority fallback queue\`);
      await this.dispatcher.enqueueFallbackTriage(incident);
      return false;
    }

    try {
      await this.dispatcher.broadcastIncidentTriage(incident);
      await this.redis.set(\`incident:status:\${incident.incidentId}\`, 'TRIAGING');
      return true;
    } catch (err) {
      this.logger.error(\`Incident processing error for \${incident.incidentId}\`, err);
      throw err;
    } finally {
      await this.redis.releaseLock(lockKey).catch((e) => {
        this.logger.warn(\`Suppressed non-fatal lock release error: \${e.message}\`);
      });
    }`,
      changes: [
        { file: 'IncidentOrchestrator', change: 'Add bounded Redis lock retries with 50-200ms jitter.' },
        { file: 'IncidentOrchestrator', change: 'Route failed lock attempts to the secondary Kafka dead-letter topic.' },
      ],
      validation: [
        'Run unit tests.',
        'Run concurrency tests.',
        'Run SAST.',
        'Simulate Redis lock contention.',
        'Verify Kafka fallback.',
      ],
    };
  },

  async applyFix(issueId) {
    const fix = {
      id: createId('fix'),
      issueId: issueId || 'ISSUE-9421',
      status: 'APPLIED',
      appliedAt: new Date().toISOString(),
    };

    db.appliedFixes[fix.id] = fix;

    const issue = findById(db.issues, fix.issueId);
    if (issue) issue.status = 'Resolved';

    return fix;
  },

  async isFixApplied(issueId) {
    return Object.values(db.appliedFixes || {}).some(
      (fix) => String(fix.issueId) === String(issueId)
    );
  },

  async askEnox(question) {
    if (!question || !question.trim()) {
      throw new Error('Please provide a question for ENOX.');
    }

    const documents = db.indexedDocuments || db.debugContext || [];
    const docList = Array.isArray(documents) ? documents : [];

    const context = docList
      .map((doc) => `\nDOCUMENT: ${doc.name}\nTYPE: ${doc.type}\nSTATUS: ${doc.status}\n\nSUMMARY:\n${doc.summary}\n\nCONTENT:\n${doc.content}\n`)
      .join('\n------------------------------\n\n');

    const prompt = `
You are ENOX, an autonomous software engineering and debugging assistant.

You are answering a developer using indexed repository documentation and production evidence.

==============================
INDEXED CONTEXT
==============================

${context}

==============================
DEVELOPER QUESTION
==============================

${question}

==============================
RESPONSE RULES
==============================

Analyze the supplied evidence.
Do not invent files, logs, test results, APIs, metrics or runtime behavior.
Clearly distinguish documented evidence from assumptions.
Give a practical engineering response.

Structure the response as:

## Root Cause
## Evidence
## Impact
## Recommended Fix
## Validation
## Risks

Use code blocks when code is useful. Be concise but technically useful.
`;

    return callGroq({
      system: 'You are ENOX, a senior software debugging, architecture, security and DevOps assistant.',
      user: prompt,
      maxTokens: 4000,
    });
  },
};

/* =========================================================
   TESTING SERVICE
   ========================================================= */

export const testingService = {
  async getTestSuite() {
    return db.testSuite || initialTestSuite;
  },

  async runTests(_projectId, onProgress) {
    const suite = db.testSuite || initialTestSuite;
    const tests = suite.tests || [];

    for (let i = 0; i < tests.length; i++) {
      onProgress?.(i + 1, tests.length, tests[i].name);
      await delay(120);
    }

    // If ENOX has applied a fix, the regression suite now reflects the healthy state.
    const fixApplied = Object.keys(db.appliedFixes || {}).length > 0;
    const nextSuite = clone(fixApplied ? fixedTestSuite : suite);
    db.testSuite = nextSuite;

    return nextSuite;
  },

  async runFailedTests(_projectId, onProgress) {
    const suite = db.testSuite || initialTestSuite;
    const failedTests = (suite.tests || []).filter((t) => t.status === 'failed');

    for (let i = 0; i < failedTests.length; i++) {
      onProgress?.(i + 1, failedTests.length || 1, failedTests[i].name);
      await delay(150);
    }

    const fixApplied = Object.keys(db.appliedFixes || {}).length > 0;
    const nextSuite = clone(fixApplied ? fixedTestSuite : suite);
    db.testSuite = nextSuite;

    return nextSuite;
  },

  async generateTests(filePath) {
    if (!filePath) throw new Error('A file path is required.');

    const baseName = filePath.split('/').pop();

    if (hasGroq()) {
      try {
        const aiText = await callGroq({
          system:
            'You are ENOX. Given a file path, respond with ONLY a JSON array of new unit test case names (strings), 2-4 items, no prose, no markdown fences.',
          user: `Generate boundary/unit test case names for: ${filePath}`,
          maxTokens: 400,
        });
        const cleaned = aiText.replace(/```json|```/g, '').trim();
        const names = JSON.parse(cleaned);
        if (Array.isArray(names) && names.length) {
          return names.map((name) => ({
            id: createId('test'),
            name,
            file: filePath,
            status: 'passed',
            durationMs: Math.floor(Math.random() * 200) + 20,
          }));
        }
      } catch {
        // fall through to heuristic generation
      }
    }

    return [
      { id: createId('test'), name: `${baseName} > handles null and undefined input gracefully`, file: filePath, status: 'passed', durationMs: 45 },
      { id: createId('test'), name: `${baseName} > respects concurrency boundaries under load`, file: filePath, status: 'passed', durationMs: 132 },
    ];
  },
};

/* =========================================================
   SECURITY SERVICE
   ========================================================= */

const SEVERITY_WEIGHT = { Critical: 20, High: 10, Medium: 5, Low: 2 };

function recomputeSecurityReport(report) {
  const active = report.findings.filter((f) => f.status === 'open');
  report.critical = active.filter((f) => f.severity === 'Critical').length;
  report.high = active.filter((f) => f.severity === 'High').length;
  report.medium = active.filter((f) => f.severity === 'Medium').length;
  report.low = active.filter((f) => f.severity === 'Low').length;

  const penalty = active.reduce((sum, f) => sum + (SEVERITY_WEIGHT[f.severity] || 0), 0);
  report.score = Math.max(0, Math.min(100, 100 - penalty));
  return report;
}

export const securityService = {
  async getSecurityReport() {
    return db.securityReport || initialSecurityReport;
  },

  async runSecurityScan() {
    // Re-run against current findings so freshly fixed/ignored items are reflected.
    const report = db.securityReport || clone(initialSecurityReport);
    db.securityReport = recomputeSecurityReport(clone(report));
    return db.securityReport;
  },

  async fixFinding(findingId) {
    const report = db.securityReport || initialSecurityReport;
    const finding = findById(report.findings, findingId);
    if (!finding) throw new Error('Finding not found.');

    finding.status = 'resolved';
    finding.explanation = `Resolved: ${finding.remediation || 'Applied by ENOX'}`;
    recomputeSecurityReport(report);

    return { success: true, message: `ENOX applied a fix for ${findingId}.`, report };
  },

  async ignoreFinding(findingId) {
    const report = db.securityReport || initialSecurityReport;
    const finding = findById(report.findings, findingId);
    if (!finding) throw new Error('Finding not found.');

    finding.status = 'ignored';
    recomputeSecurityReport(report);

    return { success: true };
  },

  async explainFinding(finding) {
    if (!finding) throw new Error('A finding is required.');

    if (!hasGroq()) {
      return (
        `${finding.title || 'This finding'} (${finding.severity || 'unknown severity'}): ` +
        `${finding.explanation || 'No further detail available.'} ` +
        `Recommended remediation: ${finding.remediation || 'See documentation.'} ` +
        `(Configure GROQ_API_KEY in server/.env for a full AI-generated explanation.)`
      );
    }

    return callGroq({
      system: 'You are ENOX, a senior application security engineer. Explain security findings clearly for a developer, including risk and remediation.',
      user: `Explain this security finding in plain language:\n\n${JSON.stringify(finding, null, 2)}`,
      maxTokens: 800,
    });
  },
};

/* =========================================================
   WORKFLOW SERVICE
   ========================================================= */

export const workflowService = {
  async getWorkflows() {
    return db.workflows || [];
  },

  async getWorkflow(id) {
    return findById(db.workflows, id) || null;
  },

  async saveWorkflow(workflow = {}) {
    const id = workflow.id || createId('workflow');
    const index = db.workflows.findIndex((w) => String(w.id) === String(id));

    const saved = {
      status: 'idle',
      lastRun: null,
      nodes: [],
      edges: [],
      ...workflow,
      id,
    };

    if (index >= 0) {
      db.workflows[index] = { ...db.workflows[index], ...saved };
    } else {
      db.workflows.push(saved);
    }

    return saved;
  },

  async executeWorkflow(id, onStepChange) {
    const workflow = findById(db.workflows, id);
    if (!workflow) throw new Error('Workflow not found.');

    workflow.status = 'running';

    for (const node of workflow.nodes || []) {
      onStepChange?.(node.id, 'running');
      await delay(300);
      onStepChange?.(node.id, 'completed');
    }

    workflow.status = 'idle';
    workflow.lastRun = 'Just now';

    return workflow;
  },
};

/* =========================================================
   AI SERVICE
   ========================================================= */

export const aiService = {
  async getAITasks() {
    return db.aiTasks || [];
  },

  async getAITask(id) {
    return findById(db.aiTasks, id) || null;
  },

  async getDocuments() {
    return db.indexedDocuments || [];
  },

  async indexDocument(name, type, content) {
    if (!name || !name.trim()) throw new Error('A document name is required.');

    const summary = (content || '').slice(0, 220) || 'No summary available.';

    const doc = {
      id: createId('doc'),
      name,
      type: type || 'document',
      status: 'Indexed',
      size: `${((content?.length || 0) / 1024).toFixed(1)} KB`,
      lastUpdated: 'Just now',
      summary,
      content: content || '',
    };

    db.indexedDocuments.push(doc);
    return doc;
  },

  async getPullRequest() {
    return db.pullRequest || null;
  },

  async createPullRequest(context = {}) {
    const pr = {
      ...(db.pullRequest || {}),
      ...context,
      id: context.id || db.pullRequest?.id || createId('pr'),
      createdAt: 'Just now',
      status: 'open',
    };

    db.pullRequest = pr;
    return pr;
  },

  async acceptSuggestion(findingId) {
    const pr = db.pullRequest;
    if (pr?.findings) {
      const finding = findById(pr.findings, findingId);
      if (finding) finding.accepted = true;
    }

    const report = db.securityReport;
    if (report?.findings) {
      const finding = findById(report.findings, findingId);
      if (finding) finding.accepted = true;
    }

    return { success: true };
  },

  async runParallelAgents(onUpdate) {
    const agents = [
      { agentName: 'debugger', label: 'Debugger', message: 'Isolating lock contention race condition in incidentOrchestrator.ts' },
      { agentName: 'tester', label: 'Tester', message: 'Executing concurrency & failover regression specs' },
      { agentName: 'security', label: 'Security', message: 'Scanning AST for denial-of-service starvation vulnerabilities' },
    ];

    for (const agent of agents) {
      onUpdate?.({ agentName: agent.agentName, status: 'RUNNING', progress: 0, message: `${agent.label} starting…` });
    }

    for (let progress = 25; progress <= 100; progress += 25) {
      await delay(280);
      for (const agent of agents) {
        onUpdate?.({
          agentName: agent.agentName,
          status: progress === 100 ? 'COMPLETED' : 'RUNNING',
          progress,
          message: progress === 100 ? `${agent.label} finished successfully.` : agent.message,
        });
      }
    }
  },
};

/* =========================================================
   DEPLOYMENT SERVICE
   ========================================================= */

const DEPLOYMENT_STAGES = [
  'Build Container Image',
  'Run Test Suite (148/148)',
  'Security & SAST Scan',
  'Canary Gate Approval',
  'Canary Rollout (10% -> 100%)',
  'Post-Deployment Health Probe',
];

export const deploymentService = {
  async getDeployments() {
    return db.deployments || [];
  },

  async getLatestDeployment(projectId) {
    const deployments = db.deployments || [];
    if (!projectId) return deployments[0] || null;
    return (
      deployments.find((d) => d.project?.toLowerCase() === String(projectId).toLowerCase()) ||
      deployments[0] ||
      null
    );
  },

  async triggerDeployment(project = 'SentinelIQ', onStage) {
    const stages = DEPLOYMENT_STAGES.map((name) => ({ name, status: 'pending', duration: '—' }));

    const deployment = {
      id: createId('dep'),
      project,
      version: `v${Math.floor(Math.random() * 3) + 2}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 9)}-stable`,
      commit: `${Math.random().toString(16).slice(2, 9)} - ENOX automated deployment`,
      author: 'ENOX Autonomous Agent',
      environment: 'production',
      status: 'running',
      timestamp: 'Just now',
      stages,
    };

    for (let i = 0; i < stages.length; i++) {
      onStage?.(i, stages[i].name, 'running');
      await delay(300);
      stages[i].status = 'success';
      stages[i].duration = `${Math.floor(Math.random() * 20) + 5}s`;
      onStage?.(i, stages[i].name, 'success');
    }

    deployment.status = 'success';
    db.deployments.unshift(deployment);

    return deployment;
  },

  async rollbackDeployment(id) {
    const deployment = findById(db.deployments, id);
    if (!deployment) throw new Error('Deployment not found.');

    const rollback = {
      ...clone(deployment),
      id: createId('dep'),
      status: 'rolled-back',
      timestamp: 'Just now',
      commit: `${deployment.commit} (rolled back)`,
      stages: deployment.stages.map((s) => ({ ...s, status: 'success' })),
    };

    db.deployments.unshift(rollback);
    return rollback;
  },
};

/* =========================================================
   MONITORING SERVICE
   ========================================================= */

export const monitoringService = {
  async getMonitoringMetrics(range = '1H') {
    return db.monitoringMetrics?.[range] || db.monitoringMetrics?.['1H'] || [];
  },

  async getLiveStats() {
    const latest = db.monitoringMetrics?.['1H']?.slice(-1)[0] || {
      cpu: 40, memory: 55, requests: 10000, errors: 0, latency: 35, uptime: 100,
    };

    const jitter = (value, spread) => Math.max(0, value + (Math.random() * spread * 2 - spread));

    return {
      timestamp: new Date().toISOString(),
      cpu: Math.round(jitter(latest.cpu, 4)),
      memory: Math.round(jitter(latest.memory, 4)),
      requests: Math.round(jitter(latest.requests, 500)),
      errors: Math.max(0, Math.round(jitter(latest.errors, 2))),
      latency: Math.round(jitter(latest.latency, 5)),
      uptime: latest.uptime,
    };
  },
};

/* =========================================================
   NOTIFICATION SERVICE
   ========================================================= */

export const notificationService = {
  async getNotifications(category) {
    const notifications = db.notifications || [];
    if (!category || category === 'All') return notifications;
    return notifications.filter((n) => n.category === category);
  },

  async markAsRead(id) {
    const notification = findById(db.notifications, id);
    if (notification) notification.read = true;
    return notification || { id, read: true };
  },

  async markAllAsRead() {
    for (const notification of db.notifications || []) {
      notification.read = true;
    }
    return { success: true };
  },

  async addNotification(item = {}) {
    const notification = {
      id: createId('notif'),
      title: item.title || 'Notification',
      message: item.message || '',
      timestamp: 'Just now',
      read: false,
      category: item.category || 'AI',
      severity: item.severity || 'info',
      link: item.link || null,
      ...item,
    };

    db.notifications.unshift(notification);
    return notification;
  },

  async getActivities(category) {
    const activities = db.activities || [];
    if (!category || category === 'All') return activities;
    return activities.filter((a) => a.category === category);
  },

  async recordActivity(activity = {}) {
    const entry = {
      id: createId('act'),
      timestamp: 'Just now',
      user: activity.user || 'System',
      action: activity.action || 'Performed an action',
      category: activity.category || 'system',
      project: activity.project || null,
      status: activity.status || 'info',
      details: activity.details || null,
      ...activity,
    };

    db.activities.unshift(entry);
    return entry;
  },
};
