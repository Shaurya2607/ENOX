import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  fixedTestSuite,
  initialTestSuite,
  fixedSecurityReport,
  initialSecurityReport,

  mockUser,
  initialProjects,
  mockRepositoryTree,
  mockIssues,
  mockDebugContext,
  mockEnoxAnalysis,
  mockPullRequest,
  mockAITasks,
  mockIndexedDocuments,
  mockWorkflows,
  mockDeployments,
  mockMonitoringMetrics,
  initialActivities,
  initialNotifications
} from './data/mockData.js';

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

const dataDir =
  path.join(__dirname, 'data');

fs.mkdirSync(
  dataDir,
  {
    recursive: true
  }
);

const databasePath =
  process.env.ENOX_DB_PATH ||
  path.join(
    dataDir,
    'enox.sqlite'
  );

const sqlite =
  new Database(databasePath);

sqlite.pragma(
  'journal_mode = WAL'
);

sqlite.pragma(
  'foreign_keys = ON'
);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS enox_state (
    key TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );
`);

const clone = (value) =>
  JSON.parse(
    JSON.stringify(value)
  );

/* =========================================================
   INDEXED DOCUMENTS
   ========================================================= */

const indexedDocuments =
  clone(
    mockIndexedDocuments
  );

/* =========================================================
   INITIAL DATABASE STATE
   ========================================================= */

function createInitialState() {
  return {
    users: [
      {
        ...clone(mockUser),

        passwordHash: null
      }
    ],

    projects:
      clone(initialProjects),

    repositoryTrees:
      clone(mockRepositoryTree),

    issues:
      clone(mockIssues),

    // The flat incident-debugging context (error message, stack trace, logs,
    // recent commits) shown on the Debugging page. Kept separate from
    // `indexedDocuments`, which is what ENOX's AI chat uses as its context.
    debugContext:
      clone(mockDebugContext),

    enoxAnalysis:
      clone(mockEnoxAnalysis),

    appliedFixes: {},

    pullRequest:
      clone(mockPullRequest),

    aiTasks:
      clone(mockAITasks),

    indexedDocuments:
      clone(indexedDocuments),

    testSuite:
      clone(initialTestSuite),

    securityReport:
      clone(initialSecurityReport),

    workflows:
      clone(mockWorkflows),

    deployments:
      clone(mockDeployments),

    monitoringMetrics:
      clone(mockMonitoringMetrics),

    notifications:
      clone(initialNotifications),

    activities:
      clone(initialActivities)
  };
}

/* =========================================================
   READ STATE
   ========================================================= */

function readState() {
  const rows =
    sqlite
      .prepare(
        'SELECT key, data FROM enox_state'
      )
      .all();

  const state = {};

  for (const row of rows) {
    try {
      state[row.key] =
        JSON.parse(
          row.data
        );
    } catch {
      state[row.key] = null;
    }
  }

  return state;
}

/* =========================================================
   WRITE STATE
   ========================================================= */

function writeState(
  key,
  value
) {
  sqlite
    .prepare(`
      INSERT INTO enox_state (key, data)
      VALUES (?, ?)
      ON CONFLICT(key)
      DO UPDATE SET
        data = excluded.data
    `)
    .run(
      key,
      JSON.stringify(value)
    );
}

/* =========================================================
   SEED DATABASE
   ========================================================= */

function seedIfEmpty() {
  const row =
    sqlite
      .prepare(
        'SELECT COUNT(*) AS count FROM enox_state'
      )
      .get();

  if (
    row.count > 0
  ) {
    return;
  }

  const initialState =
    createInitialState();

  const insert =
    sqlite.prepare(`
      INSERT INTO enox_state (
        key,
        data
      )
      VALUES (?, ?)
    `);

  const transaction =
    sqlite.transaction(
      (state) => {
        for (
          const [
            key,
            value
          ] of Object.entries(
            state
          )
        ) {
          insert.run(
            key,
            JSON.stringify(
              value
            )
          );
        }
      }
    );

  transaction(
    initialState
  );
}

seedIfEmpty();

/* =========================================================
   LOAD STATE
   ========================================================= */

let state =
  readState();

/* =========================================================
   PERSISTENT PROXY
   ========================================================= */

function createPersistentProxy(
  value,
  save
) {
  if (
    value === null ||
    value === undefined ||
    typeof value !== 'object'
  ) {
    return value;
  }

  return new Proxy(
    value,
    {
      get(
        target,
        property,
        receiver
      ) {
        const result =
          Reflect.get(
            target,
            property,
            receiver
          );

        if (
          result !== null &&
          typeof result ===
            'object'
        ) {
          return createPersistentProxy(
            result,
            save
          );
        }

        return result;
      },

      set(
        target,
        property,
        newValue,
        receiver
      ) {
        const result =
          Reflect.set(
            target,
            property,
            newValue,
            receiver
          );

        save();

        return result;
      },

      deleteProperty(
        target,
        property
      ) {
        const result =
          Reflect.deleteProperty(
            target,
            property
          );

        save();

        return result;
      }
    }
  );
}

/* =========================================================
   DOMAIN PROXY
   ========================================================= */

function createDomainProxy(
  key
) {
  return createPersistentProxy(
    state[key],
    () => {
      writeState(
        key,
        state[key]
      );
    }
  );
}

/* =========================================================
   DATABASE PROXIES
   ========================================================= */

// `db` is itself a Proxy (not a plain object). Domain values are wrapped in a
// `createDomainProxy`, which auto-saves any *nested* mutation
// (e.g. `db.issues[0].status = 'Resolved'`, `db.users.push(user)`).
// But a *top-level* reassignment (e.g. `db.testSuite = nextSuite`) replaces
// the whole value and previously skipped that proxy entirely, so it was
// silently never written to SQLite — the change looked like it "saved"
// in-memory for the life of the process, then vanished on restart.
// Wrapping `db` itself in a Proxy closes that gap: every top-level
// `db.key = value` assignment is persisted immediately and the new value is
// re-wrapped in a fresh domain proxy so its own nested mutations keep saving too.
export const db = new Proxy(
  {},
  {
    set(target, key, value, receiver) {
      state[key] = value;
      writeState(key, value);
      return Reflect.set(
        target,
        key,
        createDomainProxy(key),
        receiver
      );
    },
  }
);

function rebuildDbProxies() {
  for (
    const key of Object.keys(
      state
    )
  ) {
    // Goes through the `db` Proxy's `set` trap above, which persists the
    // value and wraps it in a domain proxy.
    db[key] =
      state[key];
  }
}

rebuildDbProxies();

/* =========================================================
   RESET DATABASE
   ========================================================= */

export function resetDb() {
  const freshState =
    createInitialState();

  const clear =
    sqlite.prepare(
      'DELETE FROM enox_state'
    );

  const insert =
    sqlite.prepare(`
      INSERT INTO enox_state (
        key,
        data
      )
      VALUES (?, ?)
    `);

  const transaction =
    sqlite.transaction(
      () => {
        clear.run();

        for (
          const [
            key,
            value
          ] of Object.entries(
            freshState
          )
        ) {
          insert.run(
            key,
            JSON.stringify(
              value
            )
          );
        }
      }
    );

  transaction();

  state =
    readState();

  rebuildDbProxies();
}

/* =========================================================
   DATABASE ACCESS
   ========================================================= */

export function getDatabase() {
  return sqlite;
}

export function getDatabasePath() {
  return databasePath;
}

/* =========================================================
   TEST / SECURITY EXPORTS
   ========================================================= */

export {
  fixedTestSuite,
  initialTestSuite,
  fixedSecurityReport,
  initialSecurityReport
};