FROM node:lts as base

WORKDIR /app

RUN npm i -g turbo

RUN chown node:root /app
USER node

COPY . .
RUN turbo prune --scope=@biblio-num/server --docker


FROM node:lts AS builder

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


FROM bitnami/node:18.16.0 as production

WORKDIR /app

RUN npm i -g pnpm

COPY --from=base /app/out/json/ .
COPY --from=base /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=base /app/out/json/pnpm-workspace.yaml ./pnpm-workspace.yaml
ENV CI=true
RUN pnpm install --frozen-lockfile --production
COPY --from=builder /app/turbo.json .
COPY --from=builder /app/packages .
COPY --from=builder /app/apps .

CMD ["pnpm", "run", "start:server"]
