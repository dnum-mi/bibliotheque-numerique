FROM docker.io/node:20.10.0 as base

RUN npm config set proxy "$http_proxy" && \
    npm config set https-proxy "$https_proxy" && \
    npm config set noproxy "$no_proxy"

WORKDIR /app

RUN npm i -g turbo@2.0.11 pnpm@8.12.1

RUN chown node:node /app
USER node

COPY . .
RUN turbo prune --scope=@biblio-num/rnf-client --docker

FROM docker.io/node:20.10.0 AS builder

RUN npm config set proxy "$http_proxy" && \
    npm config set https-proxy "$https_proxy" && \
    npm config set noproxy "$no_proxy"

WORKDIR /app

RUN npm i -g pnpm@8.12.1

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=base /app/out/json/ .
COPY --from=base /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=base /app/out/full/ .
RUN npm run build:rnf-client

FROM bitnami/nginx:latest as production

COPY --from=builder /app/apps/rnf-client/dist /app
COPY --from=base /app/docker/nginx/bn-rnf.conf /opt/bitnami/nginx/conf/server_blocks/rnf.conf

USER 1001
