FROM docker.io/node:22.13.1 as base

RUN npm config set proxy "$http_proxy" && \
    npm config set https-proxy "$https_proxy" && \
    npm config set noproxy "$no_proxy"

WORKDIR /app

RUN npm i -g turbo@2.3.4

RUN chown node:root /app
USER node

COPY . .
RUN turbo prune --scope=@biblio-num/server --docker


FROM docker.io/node:22.13.1 AS builder

RUN npm config set proxy "$http_proxy" && \
    npm config set https-proxy "$https_proxy" && \
    npm config set noproxy "$no_proxy"

WORKDIR /app

RUN npm i -g pnpm@9.15.4

RUN chown node:root /app
USER node

# First install the dependencies (as they change less often)
COPY --from=base --chown=node:root /app/out/json/ .
COPY --from=base --chown=node:root /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=base --chown=node:root /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=base --chown=node:root /app/apps/server/vendor/xlsx-0.20.3.tgz ./apps/server/vendor/xlsx-0.20.3.tgz
RUN pnpm install --frozen-lockfile
RUN rm -r ./apps/server/vendor

COPY --from=base --chown=node:root /app/out/full/ .
RUN pnpm run build:server

CMD ["pnpm", "run", "dev:server-in-docker"]


FROM docker.io/node:22.13.1 as production

RUN set +o nounset && \
    npm config set proxy "$http_proxy" && \
    npm config set https-proxy "$https_proxy" && \
    npm config set noproxy "$no_proxy";

WORKDIR /app

RUN npm i -g pnpm@9.15.4

COPY --from=base /app/out/json/ .
COPY --from=base /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=base /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=base /app/apps/server/vendor/xlsx-0.20.3.tgz ./apps/server/vendor/xlsx-0.20.3.tgz

ENV CI=true
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --production
RUN rm -r ./apps/server/vendor

# Turbo needs this directory, even with --no-cache...
RUN mkdir -p /app/node_modules/.cache/turbo/
RUN mkdir -p /app/.turbo/cache
COPY --from=builder /app/turbo.json .
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps ./apps

CMD ["pnpm", "run", "start:server"]
