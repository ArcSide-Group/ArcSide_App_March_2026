# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package*.json ./

# Install ALL dependencies (dev + prod) needed for the build
RUN npm ci

# Copy the full source tree
COPY . .

# Build frontend (Vite → dist/public) and backend (esbuild → dist/index.js)
RUN npm run build

# ── Stage 2: Production runtime ───────────────────────────────────────────────
FROM node:20-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

# Copy dependency manifests and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled artefacts from the builder stage
COPY --from=builder /app/dist ./dist

# Cloud Run injects PORT at runtime; default 8080 documents the expected value
ENV PORT=8080
EXPOSE 8080

# Tighten file permissions
RUN addgroup -S arcside && adduser -S arcside -G arcside \
    && chown -R arcside:arcside /app
USER arcside

CMD ["node", "dist/index.js"]
