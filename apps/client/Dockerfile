FROM docker.io/node:20.11.0 as base

RUN npm config set proxy "$http_proxy" && \
    npm config set https-proxy "$https_proxy" && \
    npm config set noproxy "$no_proxy"

WORKDIR /app

RUN npm i -g turbo pnpm

RUN chown node:node /app
USER node

COPY . .
RUN turbo prune --scope=@biblio-num/client --docker

FROM docker.io/node:20.11.0 AS builder

RUN npm config set proxy "$http_proxy" && \
    npm config set https-proxy "$https_proxy" && \
    npm config set noproxy "$no_proxy"

WORKDIR /app

RUN npm i -g pnpm

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=base /app/out/json/ .
COPY --from=base /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=base /app/out/full/ .
RUN npm run build:client

FROM bitnami/nginx:latest as production

COPY --from=builder /app/apps/client/dist /app
COPY --from=base /app/docker/nginx/bn-rnf.conf /opt/bitnami/nginx/conf/server_blocks/bn.conf
COPY --from=base /app/apps/client/entrypoint.sh /entrypoint.sh

USER root
RUN chmod 774 /app/assets

ENTRYPOINT ["/entrypoint.sh"]
USER 1001
