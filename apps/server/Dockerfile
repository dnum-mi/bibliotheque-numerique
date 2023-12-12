FROM node:20.10.0 as base

RUN npm config set proxy "$http_proxy" && \
    npm config set https-proxy "$https_proxy" && \
    npm config set noproxy "$no_proxy"

WORKDIR /app

RUN npm i -g turbo

RUN chown node:root /app
USER node

COPY . .
RUN turbo prune --scope=@biblio-num/server --docker


FROM node:20.10.0 AS builder

RUN npm config set proxy "$http_proxy" && \
    npm config set https-proxy "$https_proxy" && \
    npm config set noproxy "$no_proxy"

WORKDIR /app

RUN npm i -g pnpm

RUN chown node:root /app
USER node

# First install the dependencies (as they change less often)
COPY --from=base --chown=node:root /app/out/json/ .
COPY --from=base --chown=node:root /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=base --chown=node:root /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile
COPY --from=base --chown=node:root /app/out/full/ .
RUN pnpm run build:server

CMD ["pnpm", "run", "dev:server-in-docker"]


FROM bitnami/node:20.10.0 as production

RUN npm config set proxy "$http_proxy" && \
    npm config set https-proxy "$https_proxy" && \
    npm config set noproxy "$no_proxy"

WORKDIR /app

RUN npm i -g pnpm


COPY --from=base /app/out/json/ .
COPY --from=base /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=base /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
ENV CI=true
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --production
# Turbo needs this directory, even with --no-cache...
RUN mkdir -p /app/node_modules/.cache/turbo/
COPY --from=builder /app/turbo.json .
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps ./apps

CMD ["pnpm", "run", "start:server"]
