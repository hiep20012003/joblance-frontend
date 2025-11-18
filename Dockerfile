# syntax=docker/dockerfile:1.5
# =========================================
# Stage 0: Base
# =========================================
FROM node:20-bullseye AS base
WORKDIR /app

# =========================================
# Stage 1: Dependencies
# =========================================
FROM base AS deps
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && corepack prepare pnpm@latest --activate && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# =========================================
# Stage 2: Builder
# =========================================
FROM base AS builder
WORKDIR /app

# Copy node_modules từ stage deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Tắt telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# === Cách mới: mount secrets → ghi vào .env.local → build → xóa file ===
RUN --mount=type=secret,id=NEXT_PUBLIC_BASE_URL \
    --mount=type=secret,id=NEXT_PUBLIC_SOCKET_URL \
    --mount=type=secret,id=NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY \
    \
    # Tạo file .env.local từ các secret (chỉ tồn tại trong layer này)
    echo "NEXT_PUBLIC_BASE_URL=$(cat /run/secrets/NEXT_PUBLIC_BASE_URL)" > .env.local && \
    echo "NEXT_PUBLIC_SOCKET_URL=$(cat /run/secrets/NEXT_PUBLIC_SOCKET_URL)" >> .env.local && \
    echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$(cat /run/secrets/NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)" >> .env.local && \
    \
    # In ra để debug (có thể bỏ dòng này trong production)
    echo "=== .env.local content ===" && cat .env.local && echo "==========================" && \
    \
    # Chạy build → Next.js sẽ tự động load .env.local
    if [ -f yarn.lock ]; then yarn build; \
    elif [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi && \
    \
    # QUAN TRỌNG: Xóa sạch file .env.local ngay sau khi build xong
    rm -f .env.local .env.*

# =========================================
# Stage 3: Runner (production image sạch, không có secret nào)
# =========================================
FROM node:20-bullseye-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Tạo user non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy những thứ cần thiết từ builder
COPY --from=builder /app/public ./public

# Standalone mode của Next.js 12.2+
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]