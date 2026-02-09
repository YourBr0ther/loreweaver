# ── Stage 1: Install dependencies (native platform) ─────────────────
FROM --platform=$BUILDPLATFORM node:20-alpine AS deps
RUN apk add --no-cache python3 make g++
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: Build the application (native platform) ────────────────
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 3: Native modules for target platform ─────────────────────
FROM node:20-alpine AS target-deps
RUN apk add --no-cache python3 make g++
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ── Stage 4: Production image (target platform) ─────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install Claude Code CLI globally
RUN npm install -g @anthropic-ai/claude-code

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output (JS is platform-agnostic)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Overlay native modules compiled for the target platform (better-sqlite3)
COPY --from=target-deps /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3

# Create data and input directories
RUN mkdir -p /app/data /app/input/processed \
    && chown -R nextjs:nodejs /app/data /app/input

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
