import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  mockUser,
  initialProjects,
  mockRepositoryTree,
  mockIssues,
  mockDebugContext,
  mockEnoxAnalysis,
  mockPullRequest,
  initialTestSuite,
  mockAITasks,
  mockIndexedDocuments,
  initialSecurityReport,
  mockWorkflows,
  mockDeployments,
  mockMonitoringMetrics,
  initialActivities,
  initialNotifications,
} from '../data/mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverDir = path.resolve(__dirname, '..');
const dataDir = path.join(serverDir, 'data');

fs.mkdirSync(dataDir, { recursive: true });

const databasePath =
  process.env.ENOX_DB_PATH ||
  path.join(dataDir, 'enox.sqlite');

const sqlite = new Database(databasePath);

sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS enox_state (
    key TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );
`);

const clone = (value) =>
  JSON.parse(JSON.stringify(value));

const seed = {
  users: [
    {
      ...clone(mockUser),
      passwordHash: null
    }
  ],

  projects: clone(initialProjects),

  repositoryTrees: clone(mockRepositoryTree),

  issues: clone(mockIssues),

  debugContext: clone(mockDebugContext),

  enoxAnalysis: clone(mockEnoxAnalysis),

  appliedFixes: {},

  pullRequest: clone(mockPullRequest),

  aiTasks: clone(mockAITasks),

  indexedDocuments: clone(mockIndexedDocuments),

  testSuite: clone(initialTestSuite),

  securityReport: clone(initialSecurityReport),

  workflows: clone(mockWorkflows),

  deployments: clone(mockDeployments),

  monitoringMetrics: clone(mockMonitoringMetrics),

  notifications: clone(initialNotifications),

  activities: clone(initialActivities)
};

const insert = sqlite.prepare(`
  INSERT INTO enox_state (key, data)
  VALUES (?, ?)
  ON CONFLICT(key)
  DO UPDATE SET data = excluded.data
`);

const transaction = sqlite.transaction((state) => {
  for (const [key, value] of Object.entries(state)) {
    insert.run(key, JSON.stringify(value));
  }
});

transaction(seed);

sqlite.close();

console.log('======================================');
console.log(' ENOX SQLite database seeded');
console.log('======================================');
console.log(`Database: ${databasePath}`);
console.log('Seeded domains:');
console.log('- users');
console.log('- projects');
console.log('- repositoryTrees');
console.log('- issues');
console.log('- debugContext');
console.log('- enoxAnalysis');
console.log('- appliedFixes');
console.log('- pullRequest');
console.log('- aiTasks');
console.log('- indexedDocuments');
console.log('- testSuite');
console.log('- securityReport');
console.log('- workflows');
console.log('- deployments');
console.log('- monitoringMetrics');
console.log('- notifications');
console.log('- activities');
console.log('======================================');