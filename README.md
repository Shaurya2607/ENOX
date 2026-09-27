# ENOX — Autonomous Developer Workflow Platform

## 📋 Basic Information

### Project Title
**ENOX — Autonomous Developer Workflow Platform**

### Short Description
An AI-powered developer platform that autonomously detects, analyzes, and fixes production bugs, reviews and tests code, scans for security issues, and manages deployments — end to end, from a single dashboard.

### Long Description
ENOX is a full-stack, AI-assisted software engineering platform that simulates (and can genuinely drive) an autonomous developer workflow across the entire software delivery lifecycle. It brings together project management, source repository browsing, AI code intelligence, issue tracking, incident debugging, code review, automated testing, security scanning, workflow automation, and deployment/monitoring into a single cohesive workspace.

At the center of the platform is **ENOX**, an AI agent (powered by Groq's LLM API) that can:
- Ingest a production incident (error message, stack trace, logs) and perform root-cause analysis with a confidence score.
- Generate a candidate code fix and present it as a Monaco-powered before/after diff.
- Apply the fix, commit it, and hand the change off to code review.
- Explain, review, and modify individual repository files on request.
- Answer free-form developer questions ("Ask ENOX") grounded in indexed repository documentation and incident evidence.
- Run parallel autonomous agents across debugging, testing, security, review, and deployment simultaneously.

**Core modules:**
| Area | Pages |
|---|---|
| Overview | Dashboard |
| Development | Projects, Repository, Code Intelligence, Issues, Debugging |
| Quality | Code Review, Testing, Security |
| Automation | Workflows, AI Tasks, ENOX Agent |
| Delivery | Deployments, Monitoring |
| System | Activity, Notifications, Settings |

**Architecture:**
- **Frontend** — React 19 + Vite SPA styled with Tailwind CSS, using React Router for navigation, Zustand for state, Monaco Editor for code/diff viewing, Recharts for metrics, and Sonner for toasts.
- **Backend** — Node.js + Express REST API with JWT-based authentication, server-sent events (SSE) for live progress streams (test runs, deployments, workflow execution, parallel agents), and a SQLite database (via `better-sqlite3`) that auto-persists every state change to disk.
- **AI layer** — Server-side integration with the Groq API (OpenAI-compatible chat completions) for root-cause analysis narration, file explanation/review/modification, and the "Ask ENOX" assistant.

### IBM Bob Usage Statement
> ⚠️ *Placeholder — I couldn't find any reference to "IBM Bob" in the codebase, so I don't have anything factual to state here. Let me know how (or whether) you used IBM Bob while building this project and I'll drop the exact statement in.*

### Technology & Category Tags
`React 19` `Vite` `Tailwind CSS` `Zustand` `React Router` `Monaco Editor` `Recharts` `Sonner` `Node.js` `Express` `better-sqlite3 (SQLite)` `JWT Auth` `Groq API (LLM)` `Server-Sent Events`

**Category:** Developer Tools · AI DevOps Platform · Full-Stack Web Application
