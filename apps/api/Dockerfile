# syntax=docker/dockerfile:1
FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
RUN apt-get update -y && apt-get install -y --no-install-recommends dumb-init openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /repo

# --- fetch: populate pnpm's content-addressable store from lockfile only ---
FROM base AS fetch
COPY pnpm-lock.yaml ./
RUN pnpm fetch

# --- build: install offline from the store, then compile ---
FROM base AS build
COPY --from=fetch /root/.local/share/pnpm/store /root/.local/share/pnpm/store
COPY . .
RUN pnpm install --offline --frozen-lockfile
RUN pnpm --filter @targets/api db:generate
RUN pnpm exec turbo run build --filter=@targets/api
RUN pnpm deploy --filter=@targets/api --prod /prod/api
# pnpm deploy resolves an isolated node_modules graph, so the Prisma client generated
# above (against the monorepo's graph) doesn't carry over — regenerate against it.
RUN cd /prod/api && node_modules/.bin/prisma generate

# --- runtime: pruned production install only ---
FROM node:22-slim AS runtime
RUN apt-get update -y && apt-get install -y --no-install-recommends dumb-init openssl && rm -rf /var/lib/apt/lists/*
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs fastify
WORKDIR /app
COPY --from=build --chown=fastify:nodejs /prod/api/dist ./dist
COPY --from=build --chown=fastify:nodejs /prod/api/node_modules ./node_modules
COPY --from=build --chown=fastify:nodejs /prod/api/prisma ./prisma
COPY --from=build --chown=fastify:nodejs /prod/api/package.json ./package.json

USER fastify
ENV NODE_ENV=production
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||4000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["dumb-init", "--", "node", "dist/server.js"]
