FROM docker.io/node:24.13.0 AS base

RUN npm config set proxy "$http_proxy" && \
    npm config set https-proxy "$https_proxy" && \
    npm config set noproxy "$no_proxy"

WORKDIR /app
RUN chown node:node /app

FROM base AS copy-source
RUN npm i -g turbo@2.3.4 pnpm@9.15.4

USER node

COPY . .
RUN turbo prune --scope=@biblio-num/client --docker

FROM base AS builder

RUN npm i -g pnpm@9.15.4

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=copy-source /app/out/json/ .
COPY --from=copy-source /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=copy-source /app/out/full/ .
RUN npm run build:client

FROM public.ecr.aws/bitnami/nginx:latest as production

COPY --from=builder /app/apps/client/dist /app
COPY --from=copy-source /app/docker/nginx/bn.conf /opt/bitnami/nginx/conf/server_blocks/bn.conf
COPY --from=copy-source /app/apps/client/entrypoint.sh /entrypoint.sh

USER root
RUN chmod 774 /app/assets

ENTRYPOINT ["/entrypoint.sh"]
USER 1001
