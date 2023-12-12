FROM node:20.10.0 as dev-base

WORKDIR /app
RUN chown node:root /app


FROM dev-base as base

RUN npm config set proxy "$http_proxy" && \
    npm config set https-proxy "$https_proxy" && \
    npm config set noproxy "$no_proxy"

RUN npm i -g turbo

USER node
COPY . .
RUN turbo prune --scope=@biblio-num/rnf-server --docker


FROM dev-base AS builder

RUN npm config set proxy "$http_proxy" && \
    npm config set https-proxy "$https_proxy" && \
    npm config set noproxy "$no_proxy"

RUN npm i -g pnpm
USER node

# First install the dependencies (as they change less often)
COPY --from=base --chown=node:root /app/out/json/ .
COPY --from=base --chown=node:root /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=base --chown=node:root /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile
COPY --from=base --chown=node:root /app/out/full/ .
# RUN cd apps/rnf-server && pnpx prisma generate
RUN pnpm run generate-rnf
RUN pnpm run build:rnf-server

CMD ["pnpm", "run", "dev:rnf-server-in-docker"]


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
COPY --from=builder /app/apps ./apps
RUN pnpm run generate-rnf

CMD ["pnpm", "run", "start:rnf-server"]
