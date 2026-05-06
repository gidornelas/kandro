# Kandro

Kandro is a collaborative workspace platform with a modern frontend, a Fastify backend, realtime messaging, boards, files, direct messages, teams, and voice features.

## Project Structure

- `nexus/` — frontend app
- `nexus-backend/` — backend API
- `.github/workflows/` — CI and deploy automation

## Local Development

### Frontend

```bash
cd nexus
bun install
bun run dev
```

### Backend

```bash
cd nexus-backend
docker compose up -d
bun install
cp .env.example .env
cp .env.example .env.local
bun run generate
bun run migrate:dev --name init
bun run dev
```

Os containers locais expõem PostgreSQL em `localhost:5433` e Redis em `localhost:6380` por padrão para evitar conflito com serviços já rodando na máquina.

## Environment Files

- Frontend example: `nexus/.env.example`
- Backend examples:
  - `nexus-backend/.env.example`
  - `nexus-backend/.env.railway.example`

Use `nexus-backend/.env.local` for real local secrets. Do not commit real `.env` or `.env.local` files.

## Deploy

The backend includes Railway-ready configuration in:

- `nexus-backend/railway.json`
- `nexus-backend/Dockerfile`
- `nexus-backend/.env.railway.example`

## Tech Stack

- Frontend: React, Vite, Tauri
- Backend: Fastify, Prisma, PostgreSQL, Redis
- Realtime: Socket.IO
- Voice: LiveKit
