# ─── Build Stage ───────────────────────────────────────────
FROM oven/bun:1 AS builder

WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Generate Prisma client
COPY prisma ./prisma
RUN bunx prisma generate

# Build source
COPY tsconfig.json ./
COPY src ./src
RUN bun run build

# ─── Production Stage ──────────────────────────────────────
FROM oven/bun:1-slim AS runner

WORKDIR /app

# Install production dependencies only
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start server
ENV NODE_ENV=production
CMD ["sh", "-c", "bun run migrate:deploy && bun run start"]
