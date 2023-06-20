FROM node:lts as base

WORKDIR /app

RUN npm i -g turbo pnpm

RUN chown node:node /app
USER node

COPY . .
RUN turbo prune --scope=@biblio-num/client --docker

FROM node:lts as base_rnf

WORKDIR /app

RUN npm i -g turbo pnpm

RUN chown node:node /app
USER node

COPY . .
RUN turbo prune --scope=rnf-client --docker


FROM node:lts AS builder

WORKDIR /app

RUN npm i -g pnpm

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=base /app/out/json/ .
COPY --from=base /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=base /app/out/full/ .
RUN npm run build:client

FROM node:lts AS builder_rnf

WORKDIR /app

RUN npm i -g pnpm

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=base /app/out/json/ .
COPY --from=base /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=base /app/out/full/ .
RUN npm run build:rnf-client

# PROD
###
# FROM nginx:stable as prod
FROM bitnami/nginx:latest as production

COPY --from=builder /app/apps/client/dist /app
COPY --from=builder_rnf /app/apps/client/dist /app/rnf
COPY ./nginx/bn-rnf.conf /opt/bitnami/nginx/conf/server_blocks/bn-rnf.conf

USER 1001
