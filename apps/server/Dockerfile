FROM node:lts as development

WORKDIR /app

RUN chown node:node /app
USER node

COPY --chown=node:node package*.json ./
RUN npm i -g pnpm
RUN pnpm i

CMD [ "pnpm", "start" ]

# Build
###
FROM development as build

COPY --chown=node:node . ./

RUN pnpm i --frozen-lockfile
RUN pnpm run build:server

# Production
###
FROM bitnami/node as production

WORKDIR /app

COPY package*.json ./
RUN pnpm i --frozen-lockfile --production
COPY --from=build /app/dist /app/dist

CMD ["pnpm","run","start:prod"]