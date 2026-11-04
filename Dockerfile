# syntax=docker/dockerfile:1.10

FROM node:24.22.1-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.34.3 --activate

FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM dependencies AS migration-runner
ENV NODE_ENV=production
COPY . .
CMD ["pnpm", "payload", "migrate"]

FROM base AS builder
ARG PAYLOAD_STORAGE=s3
ARG AWS_REGION
ARG S3_BUCKET
ARG S3_PREFIX
ARG S3_ENDPOINT
ARG ASSET_CDN_URL
ARG NEXT_PUBLIC_SITE_URL
ENV PAYLOAD_STORAGE=$PAYLOAD_STORAGE
ENV AWS_REGION=$AWS_REGION
ENV S3_BUCKET=$S3_BUCKET
ENV S3_PREFIX=$S3_PREFIX
ENV S3_ENDPOINT=$S3_ENDPOINT
ENV ASSET_CDN_URL=$ASSET_CDN_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN --mount=type=secret,id=DATABASE_URL \
    --mount=type=secret,id=PAYLOAD_SECRET \
    set -eu; \
    test -n "$AWS_REGION" || { echo "AWS_REGION is required." >&2; exit 1; }; \
    test -n "$S3_BUCKET" || { echo "S3_BUCKET is required." >&2; exit 1; }; \
    case "$NEXT_PUBLIC_SITE_URL" in https://*) ;; *) echo "NEXT_PUBLIC_SITE_URL must use HTTPS." >&2; exit 1 ;; esac; \
    case "$ASSET_CDN_URL" in https://*) ;; *) echo "ASSET_CDN_URL must use HTTPS." >&2; exit 1 ;; esac; \
    export DATABASE_URL="$(cat /run/secrets/DATABASE_URL)"; \
    export PAYLOAD_SECRET="$(cat /run/secrets/PAYLOAD_SECRET)"; \
    pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app/.next
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/healthz').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "server.js"]
