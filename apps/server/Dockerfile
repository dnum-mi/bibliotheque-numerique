FROM node:lts as base

WORKDIR /app

RUN npm i -g turbo

RUN chown node:node /app
USER node

COPY . .
RUN turbo prune --scope=@biblio-num/server --docker


FROM node:lts AS builder

WORKDIR /app

RUN npm i -g pnpm

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=base /app/out/json/ .
COPY --from=base /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=base /app/out/full/ .

CMD ["pnpm", "run", "dev:server-in-docker"]