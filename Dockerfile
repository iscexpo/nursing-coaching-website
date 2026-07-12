# syntax=docker/dockerfile:1
FROM node:24-bullseye-slim AS base

WORKDIR /app
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm approve-builds --all && pnpm install --no-frozen-lockfile

COPY . .
RUN pnpm build

FROM node:24-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

EXPOSE 3000
CMD ["pnpm", "start"]
