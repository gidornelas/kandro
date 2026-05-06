# Changelog

## v1.0.0 — 2026-05-04 — Initial Release

### Scope

10 API modules, 45+ REST endpoints, Socket.io real-time events, LiveKit voice/video integration, Cloudflare R2 file storage.

### Modules

- **Auth** — Register, login, JWT access/refresh token rotation, profile, status updates
- **Workspaces** — CRUD workspaces, member invitation/removal
- **Channels** — CRUD channels with auto-column creation for boards
- **Messages** — Messages with cursor pagination (50/page), editing, deletion, reactions
- **Boards (Kanban)** — Columns, cards, subtasks, comments, labels, assignees with drag-and-drop move
- **Teams** — Teams with member management, granular permission system
- **Files** — Upload/download via Cloudflare R2, folder tree, team associations, presigned URLs
- **Voice** — LiveKit token generation, session management, participant tracking, webhook verification
- **Presence** — Online/offline/status tracking via Socket.io rooms
- **Activities** — Activity log for workspace events

### Database

- 22 Prisma models with proper relations, indexes, cascades, and constraints
- PostgreSQL via Prisma ORM with migration management
- Redis adapter for Socket.io horizontal scaling
- VoiceSession unique constraint for one-active-session-per-user
- Cursor-based pagination support for messages

### Security

- JWT Bearer authentication with configurable TTL (15m access, 7d refresh)
- bcrypt password hashing
- Helmet security headers via Fastify plugin
- CORS configuration
- Per-route rate limiting (login: 5/min, register: 3/min, refresh: 10/min)
- Zod input validation on all endpoints
- MIME type whitelist for file uploads (image/*, pdf, txt, json, zip)
- LiveKit webhook payload Zod validation
- Board label/assignee Zod schemas (replaced unsafe type assertions)

### Real-time (Socket.io)

- Room-based subscription model (workspace: and channel: rooms)
- Chat: send, update, delete, reaction toggle with broadcasts
- Board: card create/update/move/delete, column CRUD broadcasts
- Voice: join/leave/update/speaking participant events
- Presence: online/offline/status change events
- JWT authentication on socket connection

### Integrations

- **LiveKit** — Token generation for voice/video rooms, webhook event verification
- **Cloudflare R2** — Presigned URLs for secure upload/download, file tree management
- **Redis** — Socket.io adapter for multi-instance deployments (future)

### Infrastructure

- Multi-stage Dockerfile (bun build → slim production image)
- docker-compose.yml with PostgreSQL 16 + Redis 7
- Health check endpoint (`GET /api/health`)
- Swagger documentation at `/docs`
- Railway deployment configuration
- Seed script with mock data

### P1 Fixes (this release)

1. MIME type validation for file uploads (whitelist: image/*, pdf, txt, json, zip)
2. Zod schemas for board label/assignee endpoints (replaced type assertions)
3. VoiceSession unique constraint + transaction isolation for joinChannel
4. Per-route rate limiting on auth endpoints (login 5/min, register 3/min, refresh 10/min)
5. LiveKit webhook payload validation with Zod schema

### Known Risks (P2 — not addressed)

- Socket token is static after initial auth — no refresh mechanism after 15min JWT expiry
- R2 delete errors are silently swallowed (`.catch(() => {})`) — orphaned objects possible
- `jsonwebtoken` dynamically imported in socket-handlers on every connection
- docker-compose.yml missing app service — `docker compose up` doesn't build/run the app
- Board, team, file, voice service tests not yet implemented
- Integration tests use mock classes instead of `fastify.inject()`

### Quality Gates

- TypeScript: 0 errors
- ESLint: 0 errors, 0 warnings
- Tests: 44/44 passing across 9 test files
- Build: dist/ generated successfully
- Prisma migrations: applied
