export const mockUser = {
  id: 'usr_enox_01',
  name: 'Alex Vance',
  email: 'alex.vance@enox.dev',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=face',
  role: 'Staff Principal Engineer',
  workspace: 'ENOX Core Systems',
};

export const initialProjects = [
  {
    id: 'proj-sentinel-iq',
    name: 'SentinelIQ',
    description: 'Autonomous AI Threat Intelligence & Real-Time Incident Orchestration Engine',
    category: 'AI Security',
    language: 'TypeScript / Python',
    framework: 'FastAPI / Next.js',
    repoUrl: 'github.com/enox-enterprise/sentinel-iq',
    defaultBranch: 'main',
    stars: 1420,
    forks: 184,
    buildStatus: 'failed',
    testStatus: 'failed',
    securityStatus: 'critical',
    coverage: 84.6,
    lastDeployment: {
      id: 'dep-9041',
      status: 'failed',
      timestamp: '14 minutes ago',
      version: 'v2.8.4-rc2',
      environment: 'production',
    },
  },
  {
    id: 'proj-cipher-x',
    name: 'CIPHER_X',
    description: 'Post-Quantum Zero-Trust Cryptographic Identity & Microsegmentation Platform',
    category: 'Cybersecurity',
    language: 'Rust / C++',
    framework: 'Tokio / WASM',
    repoUrl: 'github.com/enox-enterprise/cipher-x',
    defaultBranch: 'main',
    stars: 3890,
    forks: 412,
    buildStatus: 'passing',
    testStatus: 'passing',
    securityStatus: 'healthy',
    coverage: 98.2,
    lastDeployment: {
      id: 'dep-9039',
      status: 'success',
      timestamp: '2 hours ago',
      version: 'v4.1.0',
      environment: 'production',
    },
  },
  {
    id: 'proj-cricpilot',
    name: 'CricPilot',
    description: 'Autonomous Real-Time Fantasy Sports Modeling & Low-Latency Event Processing Engine',
    category: 'High-Throughput Analytics',
    language: 'Go',
    framework: 'Gin / Apache Kafka',
    repoUrl: 'github.com/enox-enterprise/cricpilot',
    defaultBranch: 'main',
    stars: 840,
    forks: 92,
    buildStatus: 'passing',
    testStatus: 'passing',
    securityStatus: 'healthy',
    coverage: 91.5,
    lastDeployment: {
      id: 'dep-9030',
      status: 'success',
      timestamp: '5 hours ago',
      version: 'v1.12.0',
      environment: 'production',
    },
  },
  {
    id: 'proj-payment-service',
    name: 'Payment Service',
    description: 'Global PCI-DSS Level 1 Multi-Rail Payment Routing & Settlement Gateway',
    category: 'Fintech Infrastructure',
    language: 'Java / Kotlin',
    framework: 'Spring Boot 3',
    repoUrl: 'github.com/enox-enterprise/payment-service',
    defaultBranch: 'main',
    stars: 620,
    forks: 58,
    buildStatus: 'passing',
    testStatus: 'passing',
    securityStatus: 'healthy',
    coverage: 94.8,
    lastDeployment: {
      id: 'dep-9018',
      status: 'success',
      timestamp: '1 day ago',
      version: 'v3.5.2',
      environment: 'production',
    },
  },
  {
    id: 'proj-auth-service',
    name: 'Authentication Service',
    description: 'Distributed OAuth 2.1 / OIDC Zero-Knowledge Auth & Session Broker',
    category: 'Core Platform',
    language: 'TypeScript',
    framework: 'Node.js / Fastify',
    repoUrl: 'github.com/enox-enterprise/auth-service',
    defaultBranch: 'main',
    stars: 1105,
    forks: 147,
    buildStatus: 'passing',
    testStatus: 'passing',
    securityStatus: 'healthy',
    coverage: 92.4,
    lastDeployment: {
      id: 'dep-8992',
      status: 'success',
      timestamp: '2 days ago',
      version: 'v2.1.0',
      environment: 'production',
    },
  },
];

export const mockRepositoryTree = {
  'proj-sentinel-iq': [
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      path: 'src',
      children: [
        {
          id: 'src/services',
          name: 'services',
          type: 'folder',
          path: 'src/services',
          children: [
            {
              id: 'src/services/incidentOrchestrator.ts',
              name: 'incidentOrchestrator.ts',
              type: 'file',
              path: 'src/services/incidentOrchestrator.ts',
              language: 'typescript',
              size: '4.8 KB',
              content: `import { Logger } from '../utils/logger';
import { RedisCluster } from '../infra/redis';
import { TelemetryDispatcher } from '../telemetry/dispatcher';

export interface IncidentPayload {
  incidentId: string;
  severity: 'P0' | 'P1' | 'P2';
  source: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

export class IncidentOrchestrator {
  private redis: RedisCluster;
  private logger = new Logger('IncidentOrchestrator');
  private dispatcher: TelemetryDispatcher;

  constructor(redis: RedisCluster, dispatcher: TelemetryDispatcher) {
    this.redis = redis;
    this.dispatcher = dispatcher;
  }

  /**
   * Dispatches triage workers with distributed locking.
   * BUG: Async acquireLock timeout race condition caused unhandled rejection during failover!
   */
  public async processIncident(incident: IncidentPayload): Promise<boolean> {
    this.logger.info(\`Ingesting incident \${incident.incidentId} [\${incident.severity}]\`);

    // Deadlock vulnerability: lockToken acquired without safe null coalescing & proper lease release
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
    }
  }
}
`,
            },
            {
              id: 'src/services/threatAnalyzer.py',
              name: 'threatAnalyzer.py',
              type: 'file',
              path: 'src/services/threatAnalyzer.py',
              language: 'python',
              size: '6.2 KB',
              content: `import numpy as np
import torch
import logging
from typing import List, Dict, Any

logger = logging.getLogger("ThreatAnalyzer")

class ThreatModelInference:
    def __init__(self, weights_path: str, confidence_threshold: float = 0.88):
        self.weights_path = weights_path
        self.threshold = confidence_threshold
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Loaded ThreatModel on device: {self.device}")

    def evaluate_vector(self, signal_vector: List[float]) -> Dict[str, Any]:
        tensor_in = torch.tensor([signal_vector], dtype=torch.float32).to(self.device)
        with torch.no_grad():
            raw_logits = torch.sigmoid(tensor_in * 1.42)
            anomaly_score = float(torch.max(raw_logits).cpu().item())
        
        is_threat = anomaly_score >= self.threshold
        return {
            "is_anomaly": is_threat,
            "anomaly_score": round(anomaly_score, 4),
            "threat_classification": "APT_BEACON" if is_threat else "BENIGN_TELEMETRY"
        }
`,
            },
            {
              id: 'src/services/authMiddleware.ts',
              name: 'authMiddleware.ts',
              type: 'file',
              path: 'src/services/authMiddleware.ts',
              language: 'typescript',
              size: '3.1 KB',
              content: `import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken } from '../utils/crypto';

export function authenticateSession(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing bearer token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const claims = verifyJwtToken(token);
    (req as any).user = claims;
    next();
  } catch (err: any) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token', code: 'TOKEN_INVALID' });
  }
}
`,
            },
          ],
        },
        {
          id: 'src/infra',
          name: 'infra',
          type: 'folder',
          path: 'src/infra',
          children: [
            {
              id: 'src/infra/redis.ts',
              name: 'redis.ts',
              type: 'file',
              path: 'src/infra/redis.ts',
              language: 'typescript',
              size: '2.4 KB',
              content: `export class RedisCluster {
  public async acquireLock(key: string, ttlMs: number): Promise<boolean> {
    return true;
  }
  public async releaseLock(key: string): Promise<void> {}
  public async set(key: string, val: string): Promise<void> {}
}
`,
            },
          ],
        },
      ],
    },
    {
      id: 'docker-compose.yml',
      name: 'docker-compose.yml',
      type: 'file',
      path: 'docker-compose.yml',
      language: 'yaml',
      size: '1.4 KB',
      content: `version: '3.8'
services:
  sentinel-api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - REDIS_CLUSTER_URL=redis://cluster.sentinel.internal:6379
  redis-master:
    image: redis:7-alpine
    ports:
      - "6379:6379"
`,
    },
    {
      id: 'README.md',
      name: 'README.md',
      type: 'file',
      path: 'README.md',
      language: 'markdown',
      size: '3.2 KB',
      content: `# SentinelIQ Platform

Autonomous AI Threat Intelligence & Real-Time Incident Orchestration Engine.

## Architecture
- Ingestion Pipeline: High-speed Kafka consumer
- Incident Orchestrator: Distributed state machine with Redis locking
- Anomaly Detection: PyTorch deep neural models evaluating anomalous telemetry vectors
`,
    },
  ],
};

export const mockCodeMetrics = {
  'proj-sentinel-iq': {
    quality: 82,
    maintainability: 79,
    complexity: 68,
    security: 71,
  },
  'proj-cipher-x': {
    quality: 98,
    maintainability: 96,
    complexity: 42,
    security: 99,
  },
};

export const mockCodeFindings = {
  'proj-sentinel-iq': [
    {
      id: 'find-01',
      severity: 'critical',
      file: 'src/services/incidentOrchestrator.ts',
      line: 38,
      rule: 'CONCURRENCY_UNHANDLED_DEADLOCK',
      explanation: 'Lock acquisition timeout causes uncaught Promise rejection when cluster redis node is under failover, causing pod crash loop in production.',
      suggestedFix: 'Implement exponential backoff retry with jitter and wrap release in try-catch with timeout cancellation token.',
    },
    {
      id: 'find-02',
      severity: 'high',
      file: 'src/services/authMiddleware.ts',
      line: 14,
      rule: 'CRYPTO_TIMING_ATTACK_RISK',
      explanation: 'Signature verification does not use constant-time comparison for session HMAC token validation.',
      suggestedFix: 'Use crypto.timingSafeEqual() instead of triple equals comparisons.',
    },
    {
      id: 'find-03',
      severity: 'medium',
      file: 'src/services/threatAnalyzer.py',
      line: 18,
      rule: 'RESOURCE_LEAK_TENSOR_GRAPH',
      explanation: 'Tensor allocation inside inference loop without torch.inference_mode() causes CUDA VRAM fragmentation.',
      suggestedFix: 'Use with torch.inference_mode() decorator for zero-overhead inference execution.',
    },
    {
      id: 'find-04',
      severity: 'low',
      file: 'docker-compose.yml',
      line: 6,
      rule: 'CONTAINER_ROOT_USER',
      explanation: 'Service container defaults to root execution without explicit non-root user specification.',
      suggestedFix: 'Add "user: 10001:10001" security context.',
    },
  ],
};

export const mockIssues = [
  {
    id: 'ISSUE-9421',
    title: 'Production deployment failed.',
    description: 'Deployment pipeline failed during canary release stage. Canary health checks detected 502 Bad Gateway responses and Kubernetes Pod CrashLoopBackOff in the sentinel-api service following commit 3f8a92.',
    status: 'Open',
    severity: 'High',
    assignee: 'Alex Vance',
    assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=face',
    labels: ['P0-Incident', 'Canary-Failure', 'Production', 'Deadlock'],
    project: 'proj-sentinel-iq',
    createdAt: '18 minutes ago',
    affectedFiles: [
      'src/services/incidentOrchestrator.ts',
      'src/infra/redis.ts',
    ],
    comments: [
      {
        id: 'c-1',
        author: 'PagerDuty Bot',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop',
        text: 'ALERT: Service sentinel-api in us-east-1 pod crash rate exceeded threshold (98.4%). Canary rolled back automatically.',
        timestamp: '17 minutes ago',
      },
      {
        id: 'c-2',
        author: 'DevOps Lead',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face',
        text: 'Stack trace points to Redis lock acquisition deadlock in incidentOrchestrator.ts. ENOX Agent should be dispatched immediately.',
        timestamp: '12 minutes ago',
      },
    ],
  },
  {
    id: 'ISSUE-8812',
    title: 'High memory consumption in ThreatModel inference worker',
    description: 'During peak ingest spikes (>50k ev/s), GPU memory usage plateaus at 98% with frequent OOM kills.',
    status: 'In Progress',
    severity: 'Medium',
    assignee: 'Elena Rostova',
    assigneeAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop&crop=face',
    labels: ['Performance', 'CUDA', 'Optimization'],
    project: 'proj-sentinel-iq',
    createdAt: '2 days ago',
    affectedFiles: ['src/services/threatAnalyzer.py'],
    comments: [],
  },
  {
    id: 'ISSUE-7210',
    title: 'Upgrade OpenSSL native bindings for Post-Quantum algorithms',
    description: 'Need to update Kyber768 and Dilithium3 crypto primitives to compliant NIST FIPS 203/204 specs.',
    status: 'Resolved',
    severity: 'Low',
    assignee: 'Marcus Chen',
    assigneeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=face',
    labels: ['Cryptography', 'Quantum', 'Dependencies'],
    project: 'proj-cipher-x',
    createdAt: '4 days ago',
    affectedFiles: ['src/crypto/dilithium.rs'],
    comments: [],
  },
  {
    id: 'ISSUE-6502',
    title: 'Database connection pool exhaustion during flash sales',
    description: 'HikariCP pool limit of 100 connections hit during simultaneous multi-rail settlement reconciliations.',
    status: 'Closed',
    severity: 'High',
    assignee: 'Sarah Jenkins',
    assigneeAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop&crop=face',
    labels: ['Database', 'Postgres', 'Fintech'],
    project: 'proj-payment-service',
    createdAt: '1 week ago',
    affectedFiles: ['src/main/resources/application.yml'],
    comments: [],
  },
];

export const mockDebugContext = {
  project: 'SentinelIQ (proj-sentinel-iq)',
  branch: 'main (commit 3f8a92e)',
  recentCommits: [
    '3f8a92e - feat(orchestrator): add distributed redis lock for high-throughput incident dispatch',
    '81bc091 - fix(telemetry): update kafka ack timeout from 200ms to 500ms',
    'a94d211 - chore(deps): upgrade redis client to 7.2.4',
  ],
  changedFiles: [
    'src/services/incidentOrchestrator.ts',
    'src/infra/redis.ts',
  ],
  environment: 'production-us-east-1 (Kubernetes 1.30)',
  errorMessage: 'Error: LockContentionError: Unable to acquire cluster lock for inc-98124 [UnhandledPromiseRejection: Lock acquisition timeout without lease release]',
  stackTrace: `Error: LockContentionError: Unable to acquire cluster lock for inc-98124
    at IncidentOrchestrator.processIncident (/app/dist/services/incidentOrchestrator.js:41:15)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async CanaryWorker.handleEvent (/app/dist/workers/canaryWorker.js:88:9)
    at async ClusterEventBus.dispatch (/app/dist/events/bus.js:142:13)`,
  logs: `2026-09-27T02:48:11.102Z [INFO]  [IncidentOrchestrator] Ingesting incident inc-98124 [P0]
2026-09-27T02:48:11.104Z [DEBUG] [RedisCluster] Trying to acquire lock: lock:incident:inc-98124 ttl=5000ms
2026-09-27T02:48:16.105Z [WARN]  [IncidentOrchestrator] Failed to acquire lock for incident: inc-98124
2026-09-27T02:48:16.108Z [FATAL] [NodeRuntime] Uncaught LockContentionError: Unable to acquire cluster lock
2026-09-27T02:48:16.110Z [ERROR] [K8sLiveness] Pod sentinel-api-7b8f9c-9x2l failed liveness probe, restarting...`,
};

export const mockEnoxAnalysis = {
  'ISSUE-9421': {
    rootCause: 'Race condition & missing lease retry in Distributed Lock pattern. When acquireLock times out under load, an unhandled rejection is thrown without releasing stale keys or providing failover retry mechanisms.',
    affectedFiles: ['src/services/incidentOrchestrator.ts', 'src/infra/redis.ts'],
    confidence: 96.8,
    recommendedFix: 'Refactor lock acquisition with exponential backoff retry jitter, wrap execution in guaranteed defensive lock-release with abort signal, and implement non-blocking fallback queuing.',
    explanation: 'The current implementation throws a synchronous LockContentionError on timeout. Under high concurrency spikes, subsequent cluster queries fail into CrashLoopBackOff. The fix implements an adaptive Redlock retry loop with graceful fallback queuing and automatic lease expiration.',
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
  },
};

export const mockPullRequest = {
  id: 'PR-428',
  title: 'fix(orchestrator): resolve lock contention deadlock and implement adaptive fallback',
  author: 'ENOX Autonomous Agent',
  authorAvatar: '/logo.svg',
  branch: 'enox/fix-issue-9421-lock-contention',
  targetBranch: 'main',
  additions: 28,
  deletions: 9,
  status: 'open',
  createdAt: 'Just now',
  aiReviewSummary: 'Verified: Fix introduces exponential backoff with random jitter (50ms - 200ms) over 3 retry cycles. Fallback queue routes high-load incidents gracefully. Zero race condition vulnerabilities detected.',
  securityReviewSummary: 'Security Audit Passed: No new surface vulnerabilities. Catch handler suppresses non-fatal lock release exceptions preventing pod crash cascades. PCI & SOC2 compliant.',
  performanceReviewSummary: 'Throughput Benchmark: Throughput under synthetic 25,000 req/s load test improved by 412% with zero 502 Bad Gateway responses.',
  findings: [
    {
      id: 'pr-find-1',
      severity: 'low',
      file: 'src/services/incidentOrchestrator.ts',
      line: 45,
      explanation: 'Consider parameterizing maxRetries via environment configuration for variable cluster topologies.',
      suggestedFix: 'const maxRetries = config.orchestrator.lockRetries || 3;',
    },
  ],
  changedFiles: [
    {
      filename: 'src/services/incidentOrchestrator.ts',
      additions: 28,
      deletions: 9,
      language: 'typescript',
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
      modifiedCode: `    // ENOX AI Automated Resolution: Adaptive retry with jitter and non-blocking fallback
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
    },
  ],
};

export const initialTestSuite = {
  total: 148,
  passed: 146,
  failed: 2,
  skipped: 0,
  coverage: 84.6,
  runtimeMs: 4120,
  history: [
    { timestamp: 'Run #401', passed: 148, failed: 0 },
    { timestamp: 'Run #402', passed: 148, failed: 0 },
    { timestamp: 'Run #403', passed: 147, failed: 1 },
    { timestamp: 'Run #404', passed: 146, failed: 2 },
  ],
  tests: [
    {
      id: 'test-1',
      name: 'IncidentOrchestrator > should acquire cluster lock under concurrency',
      file: 'tests/unit/orchestrator.test.ts',
      status: 'failed',
      durationMs: 5012,
      error: 'LockContentionError: Unable to acquire cluster lock for inc-98124',
      stackTrace: 'at IncidentOrchestrator.processIncident (tests/unit/orchestrator.test.ts:42)',
    },
    {
      id: 'test-2',
      name: 'IncidentOrchestrator > should handle redis failover during lock renewal',
      file: 'tests/unit/orchestrator.test.ts',
      status: 'failed',
      durationMs: 5002,
      error: 'UnhandledPromiseRejection: Redis cluster master unreachable',
      stackTrace: 'at RedisCluster.acquireLock (tests/unit/orchestrator.test.ts:79)',
    },
    {
      id: 'test-3',
      name: 'ThreatAnalyzer > evaluate_vector correctly classifies APT_BEACON',
      file: 'tests/unit/threatAnalyzer.test.py',
      status: 'passed',
      durationMs: 142,
    },
    {
      id: 'test-4',
      name: 'AuthMiddleware > rejects expired JWT tokens with 403',
      file: 'tests/unit/auth.test.ts',
      status: 'passed',
      durationMs: 38,
    },
    {
      id: 'test-5',
      name: 'TelemetryDispatcher > streams batch to Kafka with gzip compression',
      file: 'tests/integration/telemetry.test.ts',
      status: 'passed',
      durationMs: 890,
    },
    {
      id: 'test-6',
      name: 'RateLimiter > sliding window limits 10,000 req/min per IP',
      file: 'tests/unit/ratelimit.test.ts',
      status: 'passed',
      durationMs: 95,
    },
  ],
};

export const fixedTestSuite = {
  total: 148,
  passed: 148,
  failed: 0,
  skipped: 0,
  coverage: 92.4,
  runtimeMs: 2840,
  history: [
    { timestamp: 'Run #401', passed: 148, failed: 0 },
    { timestamp: 'Run #402', passed: 148, failed: 0 },
    { timestamp: 'Run #403', passed: 147, failed: 1 },
    { timestamp: 'Run #404', passed: 146, failed: 2 },
    { timestamp: 'Run #405 (Fixed)', passed: 148, failed: 0 },
  ],
  tests: [
    {
      id: 'test-1',
      name: 'IncidentOrchestrator > should acquire cluster lock under concurrency with adaptive retry',
      file: 'tests/unit/orchestrator.test.ts',
      status: 'passed',
      durationMs: 84,
    },
    {
      id: 'test-2',
      name: 'IncidentOrchestrator > should gracefully route to fallback queue on persistent lock busy',
      file: 'tests/unit/orchestrator.test.ts',
      status: 'passed',
      durationMs: 110,
    },
    {
      id: 'test-3',
      name: 'ThreatAnalyzer > evaluate_vector correctly classifies APT_BEACON',
      file: 'tests/unit/threatAnalyzer.test.py',
      status: 'passed',
      durationMs: 138,
    },
    {
      id: 'test-4',
      name: 'AuthMiddleware > rejects expired JWT tokens with 403',
      file: 'tests/unit/auth.test.ts',
      status: 'passed',
      durationMs: 35,
    },
    {
      id: 'test-5',
      name: 'TelemetryDispatcher > streams batch to Kafka with gzip compression',
      file: 'tests/integration/telemetry.test.ts',
      status: 'passed',
      durationMs: 820,
    },
    {
      id: 'test-6',
      name: 'RateLimiter > sliding window limits 10,000 req/min per IP',
      file: 'tests/unit/ratelimit.test.ts',
      status: 'passed',
      durationMs: 88,
    },
  ],
};

export const initialSecurityReport = {
  score: 68,
  critical: 1,
  high: 2,
  medium: 3,
  low: 2,
  findings: [
    {
      id: 'sec-01',
      severity: 'Critical',
      category: 'vulnerability',
      title: 'Distributed Lock Starvation Deadlock in Incident Queue',
      fileOrPackage: 'src/services/incidentOrchestrator.ts',
      explanation: 'Resource contention lock timeout causes crashloop in worker pods, leading to complete unresponsiveness to incident telemetry streams.',
      remediation: 'Apply ENOX patch with exponential backoff jitter and non-blocking fallback routing.',
      cve: 'CVE-2026-9812-CUSTOM',
      status: 'open',
    },
    {
      id: 'sec-02',
      severity: 'High',
      category: 'dependency',
      title: 'Prototype Pollution in lodash-es prior to 4.17.22',
      fileOrPackage: 'package.json -> lodash-es@4.17.21',
      explanation: 'Deep object merge utilities can be abused to inject prototype properties via unvalidated query parameters.',
      remediation: 'Upgrade lodash-es to ^4.17.22 or replace with native structuredClone / Object.assign.',
      cve: 'CVE-2025-2941',
      status: 'open',
    },
    {
      id: 'sec-03',
      severity: 'High',
      category: 'secret',
      title: 'Hardcoded Fallback JWT Secret in Test Environment Defaults',
      fileOrPackage: 'config/test.env.example',
      explanation: 'Default fallback secret key "jwt-dev-secret-unsafe" present in template configuration.',
      remediation: 'Enforce dynamic secret injection via HashiCorp Vault or AWS KMS.',
      status: 'open',
    },
    {
      id: 'sec-04',
      severity: 'Medium',
      category: 'outdated',
      title: 'Deprecated Redis driver connection pool settings',
      fileOrPackage: 'src/infra/redis.ts',
      explanation: 'Legacy connection pool retry mechanism is deprecated in ioredis v5+.',
      remediation: 'Update cluster configuration schema to use new reconnectOnError callback.',
      status: 'open',
    },
  ],
};

export const fixedSecurityReport = {
  score: 96,
  critical: 0,
  high: 0,
  medium: 1,
  low: 1,
  findings: [
    {
      id: 'sec-01',
      severity: 'Critical',
      category: 'vulnerability',
      title: 'Distributed Lock Starvation Deadlock in Incident Queue',
      fileOrPackage: 'src/services/incidentOrchestrator.ts',
      explanation: 'Resolved: Adaptive jitter retry implemented, pod crash loops mitigated.',
      remediation: 'Applied by ENOX',
      status: 'resolved',
    },
    {
      id: 'sec-02',
      severity: 'High',
      category: 'dependency',
      title: 'Prototype Pollution in lodash-es prior to 4.17.22',
      fileOrPackage: 'package.json -> lodash-es@4.17.22',
      explanation: 'Resolved: Upgraded to clean patched release.',
      remediation: 'Applied by ENOX',
      status: 'resolved',
    },
    {
      id: 'sec-03',
      severity: 'High',
      category: 'secret',
      title: 'Hardcoded Fallback JWT Secret in Test Environment Defaults',
      fileOrPackage: 'config/test.env.example',
      explanation: 'Resolved: Sanitized and replaced with KMS provider placeholder.',
      remediation: 'Applied by ENOX',
      status: 'resolved',
    },
    {
      id: 'sec-04',
      severity: 'Medium',
      category: 'outdated',
      title: 'Deprecated Redis driver connection pool settings',
      fileOrPackage: 'src/infra/redis.ts',
      explanation: 'Legacy connection pool retry mechanism is deprecated in ioredis v5+.',
      remediation: 'Scheduled for maintenance sprint.',
      status: 'open',
    },
  ],
};

export const mockWorkflows = [
  {
    id: 'wf-auto-fix-deploy',
    name: 'Autonomous Issue Remediation & Safe Deployment',
    description: 'Triggered when P0/P1 issue is detected: Analyzes root cause, generates candidate fix, runs parallel test & security scan, opens PR, and performs canary deployment.',
    status: 'idle',
    lastRun: '18 minutes ago',
    nodes: [
      { id: '1', type: 'input', data: { label: 'Issue Reported (P0/P1)' }, position: { x: 50, y: 150 } },
      { id: '2', type: 'default', data: { label: 'ENOX Root Cause Analysis' }, position: { x: 260, y: 150 } },
      { id: '3', type: 'default', data: { label: 'Generate Semantic Fix' }, position: { x: 490, y: 150 } },
      { id: '4', type: 'default', data: { label: 'Run Full Test Suite' }, position: { x: 720, y: 70 } },
      { id: '5', type: 'default', data: { label: 'Security & Dependency Scan' }, position: { x: 720, y: 230 } },
      { id: '6', type: 'default', data: { label: 'Create Pull Request & Review' }, position: { x: 950, y: 150 } },
      { id: '7', type: 'output', data: { label: 'Canary Deployment to Prod' }, position: { x: 1200, y: 150 } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e3-5', source: '3', target: '5', animated: true },
      { id: 'e4-6', source: '4', target: '6', animated: true },
      { id: 'e5-6', source: '5', target: '6', animated: true },
      { id: 'e6-7', source: '6', target: '7', animated: true },
    ],
  },
  {
    id: 'wf-failed-build-recovery',
    name: 'Automatic Failed Build Recovery',
    description: 'Build Failed -> Collect Logs -> ENOX Root Cause Analysis -> Generate Fix -> Run Tests -> Create PR.',
    status: 'idle',
    lastRun: '1 hour ago',
    nodes: [
      { id: 'b1', type: 'input', data: { label: 'Build Failed' }, position: { x: 50, y: 120 } },
      { id: 'b2', data: { label: 'Collect Logs & Telemetry' }, position: { x: 250, y: 120 } },
      { id: 'b3', data: { label: 'ENOX Root Cause Analysis' }, position: { x: 470, y: 120 } },
      { id: 'b4', data: { label: 'Generate Candidate Fix' }, position: { x: 690, y: 120 } },
      { id: 'b5', data: { label: 'Run Regression Tests' }, position: { x: 910, y: 120 } },
      { id: 'b6', type: 'output', data: { label: 'Create Automated PR' }, position: { x: 1130, y: 120 } },
    ],
    edges: [
      { id: 'eb1-2', source: 'b1', target: 'b2', animated: true },
      { id: 'eb2-3', source: 'b2', target: 'b3', animated: true },
      { id: 'eb3-4', source: 'b3', target: 'b4', animated: true },
      { id: 'eb4-5', source: 'b4', target: 'b5', animated: true },
      { id: 'eb5-6', source: 'b5', target: 'b6', animated: true },
    ],
  },
];

export const mockAITasks = [
  {
    id: 'task-ai-101',
    task: 'Investigate canary crash loop and generate fix for lock contention in SentinelIQ',
    agent: 'ENOX Core Orchestrator',
    project: 'SentinelIQ',
    status: 'Running',
    duration: '42s',
    result: 'Parallel agents active: Debugger (90%), Tester (85%), Security (95%)',
    timestamp: 'Just now',
    logs: [
      '[02:49:01] ENOX Orchestrator initialized context for SentinelIQ',
      '[02:49:02] Spawned Debugger agent for incidentOrchestrator.ts',
      '[02:49:02] Spawned Tester agent for unit test suite regression',
      '[02:49:02] Spawned Security agent for CVE and static concurrency analysis',
    ],
  },
  {
    id: 'task-ai-099',
    task: 'Automated Post-Quantum Dilithium cryptographic verification scan',
    agent: 'Security Sentinel',
    project: 'CIPHER_X',
    status: 'Completed',
    duration: '1m 18s',
    result: 'Zero vulnerabilities found. 100% NIST FIPS 204 compliance affirmed.',
    timestamp: '2 hours ago',
    logs: [
      'Loaded Rust source tree in WASM validator',
      'Audited Dilithium3 constant-time modular arithmetic',
      'Scan completed with zero deviations',
    ],
  },
  {
    id: 'task-ai-098',
    task: 'Optimize event dispatch batching throughput for Apache Kafka consumer',
    agent: 'Performance Optimizer',
    project: 'CricPilot',
    status: 'Completed',
    duration: '2m 45s',
    result: 'Throughput increased from 42,000 to 110,000 events/sec via memory-aligned ring buffers.',
    timestamp: '5 hours ago',
    logs: [
      'Analyzed Go garbage collection allocations',
      'Generated sync.Pool memory recycling pattern',
      'Ran synthetic benchmark: latency decreased by 62%',
    ],
  },
  {
    id: 'task-ai-097',
    task: 'Audit PCI-DSS token storage encryption against AES-256-GCM rotation requirements',
    agent: 'Compliance Auditor',
    project: 'Payment Service',
    status: 'Completed',
    duration: '54s',
    result: 'PCI-DSS 4.0 validation passed. Master key rotation scheduled for Day 90.',
    timestamp: '1 day ago',
  },
];

export const mockIndexedDocuments = [
  {
    id: 'doc-1',
    name: 'README.md',
    type: 'README',
    status: 'Indexed',
    size: '12.4 KB',
    lastUpdated: 'Today at 01:15',
    summary:
      'Repository architecture overview, service boundaries, docker setup, and development guidelines for SentinelIQ.',
    content: `# SentinelIQ Project Overview
SentinelIQ is an enterprise-grade AI threat detection platform. It handles streaming event ingestion through Apache Kafka and distributes incident dispatch workloads using a Redis cluster distributed lock.

Key components:
- IncidentOrchestrator: Manages distributed triage queues.
- ThreatAnalyzer: PyTorch neural model evaluator for telemetry anomaly classification.
- AuthMiddleware: JWT session validation with HMAC verification.`
  },

  {
    id: 'doc-2',
    name: 'Architecture_v3.pdf',
    type: 'architecture',
    status: 'Indexed',
    size: '2.8 MB',
    lastUpdated: 'Yesterday at 18:40',
    summary:
      'High-level cloud topology, Kubernetes deployment strategies, distributed lock semantics, and multi-region failover specifications.',
    content: `Architecture Specification:
- Distributed Locking: Redlock algorithm using 5 independent Redis instances. Lock lease duration standard is 3000ms with mandatory retry jitter of 50-200ms.
- Fallback Strategy: If lock acquisition fails after 3 attempts, incident must be routed to secondary dead-letter Kafka topic to prevent pod starvation.
- SLA Target: 99.999% uptime with 99th percentile response time below 120ms.`
  },

  {
    id: 'doc-3',
    name: 'openapi-spec.json',
    type: 'api_spec',
    status: 'Indexed',
    size: '64.1 KB',
    lastUpdated: '3 days ago',
    summary:
      'OpenAPI 3.1 schema for incident triage, telemetry ingest, model evaluation endpoints, and health probes.',
    content: `OpenAPI 3.1:
/api/v2/incidents:
  post:
    summary: Ingest triage incident
    responses:
      200: Incident accepted and queued
      429: Rate limited
      503: Lock acquisition busy / routed to fallback`
  },

  {
    id: 'doc-4',
    name: 'Security_Requirements.md',
    type: 'requirements',
    status: 'Indexed',
    size: '18.2 KB',
    lastUpdated: '1 week ago',
    summary:
      'SOC2 Type II, ISO 27001, and Zero-Trust cryptographic identity requirements.',
    content: `Security Policies:
- All secrets must be provisioned via runtime KMS; no static credentials.
- Concurrency locks must implement strict lease timeouts to prevent unhandled starvation attacks.
- All code changes must pass automated SAST and unit coverage > 90%.`
  },

  {
    id: 'doc-5',
    name: 'production-canary.log',
    type: 'logs',
    status: 'Indexed',
    size: '480 KB',
    lastUpdated: '14 minutes ago',
    summary:
      'Live incident log stream capturing the canary pod crash loop and Redis lock contention error.',
    content: `2026-09-27 02:48:11 [INFO] Ingesting incident inc-98124 [P0]
2026-09-27 02:48:16 [WARN] Failed to acquire lock for incident: inc-98124
2026-09-27 02:48:16 [FATAL] LockContentionError: Unable to acquire cluster lock
2026-09-27 02:48:16 [ERROR] Kubernetes Pod CrashLoopBackOff: exit code 1`
  }
];

export const mockDeployments = [
  {
    id: 'dep-9042',
    project: 'SentinelIQ',
    version: 'v2.8.5-stable',
    commit: '4a19b80 - ENOX automated fix for lock contention',
    author: 'ENOX Autonomous Agent',
    environment: 'production',
    status: 'success',
    timestamp: 'Just now',
    stages: [
      { name: 'Build Container Image', status: 'success', duration: '28s' },
      { name: 'Run Test Suite (148/148)', status: 'success', duration: '14s' },
      { name: 'Security & SAST Scan', status: 'success', duration: '8s' },
      { name: 'Canary Gate Approval', status: 'success', duration: '5s' },
      { name: 'Canary Rollout (10% -> 100%)', status: 'success', duration: '35s' },
      { name: 'Post-Deployment Health Probe', status: 'success', duration: '10s' },
    ],
  },
  {
    id: 'dep-9041',
    project: 'SentinelIQ',
    version: 'v2.8.4-rc2',
    commit: '3f8a92e - feat(orchestrator): add distributed redis lock',
    author: 'Alex Vance',
    environment: 'production',
    status: 'failed',
    timestamp: '25 minutes ago',
    stages: [
      { name: 'Build Container Image', status: 'success', duration: '31s' },
      { name: 'Run Test Suite', status: 'failed', duration: '18s' },
      { name: 'Security & SAST Scan', status: 'failed', duration: '12s' },
      { name: 'Canary Gate Approval', status: 'failed', duration: '0s' },
      { name: 'Canary Rollout', status: 'failed', duration: '0s' },
      { name: 'Post-Deployment Health Probe', status: 'failed', duration: '0s' },
    ],
  },
  {
    id: 'dep-9039',
    project: 'CIPHER_X',
    version: 'v4.1.0',
    commit: '8b7f12a - release: post-quantum kyber microsegmentation',
    author: 'Marcus Chen',
    environment: 'production',
    status: 'success',
    timestamp: '2 hours ago',
    stages: [
      { name: 'Build Container Image', status: 'success', duration: '45s' },
      { name: 'Run Test Suite', status: 'success', duration: '32s' },
      { name: 'Security & SAST Scan', status: 'success', duration: '19s' },
      { name: 'Canary Gate Approval', status: 'success', duration: '10s' },
      { name: 'Canary Rollout', status: 'success', duration: '40s' },
      { name: 'Post-Deployment Health Probe', status: 'success', duration: '15s' },
    ],
  },
];

export const mockMonitoringMetrics = {
  '1H': [
    { time: '02:00', cpu: 44, memory: 58, requests: 12400, errors: 4, latency: 42, uptime: 100 },
    { time: '02:15', cpu: 48, memory: 61, requests: 14800, errors: 8, latency: 45, uptime: 100 },
    { time: '02:30', cpu: 52, memory: 65, requests: 18200, errors: 12, latency: 48, uptime: 100 },
    { time: '02:45', cpu: 94, memory: 91, requests: 24500, errors: 420, latency: 310, uptime: 88 },
    { time: '03:00', cpu: 38, memory: 52, requests: 26100, errors: 0, latency: 29, uptime: 100 },
  ],
  '6H': [
    { time: '21:00', cpu: 32, memory: 48, requests: 9200, errors: 2, latency: 35, uptime: 100 },
    { time: '22:00', cpu: 36, memory: 50, requests: 10400, errors: 1, latency: 36, uptime: 100 },
    { time: '23:00', cpu: 40, memory: 54, requests: 11900, errors: 5, latency: 38, uptime: 100 },
    { time: '00:00', cpu: 41, memory: 56, requests: 13100, errors: 3, latency: 40, uptime: 100 },
    { time: '01:00', cpu: 45, memory: 59, requests: 15400, errors: 7, latency: 42, uptime: 100 },
    { time: '02:00', cpu: 82, memory: 86, requests: 22800, errors: 240, latency: 220, uptime: 92 },
    { time: '03:00', cpu: 35, memory: 51, requests: 27000, errors: 0, latency: 28, uptime: 100 },
  ],
  '24H': [
    { time: '04:00', cpu: 28, memory: 44, requests: 7500, errors: 1, latency: 32, uptime: 100 },
    { time: '08:00', cpu: 48, memory: 60, requests: 18400, errors: 6, latency: 44, uptime: 100 },
    { time: '12:00', cpu: 62, memory: 68, requests: 24200, errors: 14, latency: 52, uptime: 100 },
    { time: '16:00', cpu: 58, memory: 66, requests: 22100, errors: 9, latency: 49, uptime: 100 },
    { time: '20:00', cpu: 42, memory: 55, requests: 14600, errors: 4, latency: 39, uptime: 100 },
    { time: '00:00', cpu: 36, memory: 52, requests: 11200, errors: 3, latency: 37, uptime: 100 },
    { time: '03:00', cpu: 35, memory: 51, requests: 27000, errors: 0, latency: 28, uptime: 100 },
  ],
  '7D': [
    { time: 'Mon', cpu: 42, memory: 54, requests: 185000, errors: 42, latency: 41, uptime: 99.99 },
    { time: 'Tue', cpu: 45, memory: 58, requests: 210000, errors: 38, latency: 39, uptime: 100 },
    { time: 'Wed', cpu: 44, memory: 57, requests: 198000, errors: 51, latency: 42, uptime: 99.98 },
    { time: 'Thu', cpu: 48, memory: 62, requests: 234000, errors: 64, latency: 45, uptime: 99.95 },
    { time: 'Fri', cpu: 52, memory: 65, requests: 260000, errors: 48, latency: 44, uptime: 100 },
    { time: 'Sat', cpu: 38, memory: 50, requests: 140000, errors: 18, latency: 36, uptime: 100 },
    { time: 'Sun', cpu: 36, memory: 49, requests: 128000, errors: 12, latency: 34, uptime: 100 },
  ],
  '30D': [
    { time: 'W1', cpu: 40, memory: 52, requests: 1200000, errors: 210, latency: 40, uptime: 99.99 },
    { time: 'W2', cpu: 44, memory: 56, requests: 1380000, errors: 190, latency: 39, uptime: 100 },
    { time: 'W3', cpu: 47, memory: 60, requests: 1540000, errors: 320, latency: 43, uptime: 99.96 },
    { time: 'W4', cpu: 42, memory: 54, requests: 1460000, errors: 160, latency: 38, uptime: 99.99 },
  ],
};

export const initialActivities = [
  {
    id: 'act-01',
    timestamp: '2 minutes ago',
    user: 'Alex Vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=face',
    action: 'Dispatched ENOX Autonomous Debugging Agent for ISSUE-9421',
    category: 'ai',
    project: 'SentinelIQ',
    status: 'info',
    details: 'Initiated 3-way parallel agent execution: Debugger, Tester, and Security scanner.',
  },
  {
    id: 'act-02',
    timestamp: '15 minutes ago',
    user: 'GitHub CI/CD',
    action: 'Production canary release rolled back due to pod crash loop',
    category: 'deployment',
    project: 'SentinelIQ',
    status: 'error',
    details: 'Deployment dep-9041 aborted at 10% traffic canary gate.',
  },
  {
    id: 'act-03',
    timestamp: '25 minutes ago',
    user: 'Alex Vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=face',
    action: 'Pushed commit 3f8a92e to main',
    category: 'commit',
    project: 'SentinelIQ',
    status: 'warning',
    details: 'feat(orchestrator): add distributed redis lock for high-throughput incident dispatch',
  },
  {
    id: 'act-04',
    timestamp: '2 hours ago',
    user: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=face',
    action: 'Merged PR-422: Post-quantum Kyber microsegmentation v4.1.0',
    category: 'review',
    project: 'CIPHER_X',
    status: 'success',
  },
  {
    id: 'act-05',
    timestamp: '4 hours ago',
    user: 'ENOX Sentinel',
    action: 'Completed automated cryptographic audit with 0 findings',
    category: 'security',
    project: 'CIPHER_X',
    status: 'success',
  },
];

export const initialNotifications = [
  {
    id: 'notif-1',
    title: 'Canary Deployment Failure Alert',
    message: 'SentinelIQ production canary dep-9041 failed health checks. CrashLoopBackOff detected in us-east-1.',
    timestamp: '16 minutes ago',
    read: false,
    category: 'Deployments',
    severity: 'error',
    link: '/debugging',
  },
  {
    id: 'notif-2',
    title: 'P0 Incident Created: ISSUE-9421',
    message: 'Production deployment failed. PagerDuty auto-assigned issue to Alex Vance.',
    timestamp: '18 minutes ago',
    read: false,
    category: 'AI',
    severity: 'warning',
    link: '/issues',
  },
  {
    id: 'notif-3',
    title: 'CIPHER_X v4.1.0 Deployed Successfully',
    message: 'Multi-region production rollout completed across 14 clusters with 0 errors.',
    timestamp: '2 hours ago',
    read: true,
    category: 'Deployments',
    severity: 'success',
    link: '/deployments',
  },
  {
    id: 'notif-4',
    title: 'Security Scan Verified NIST FIPS 204',
    message: 'Post-Quantum verification suite finished with 100% compliance affirmation.',
    timestamp: '3 hours ago',
    read: true,
    category: 'Security',
    severity: 'info',
    link: '/security',
  },
];
