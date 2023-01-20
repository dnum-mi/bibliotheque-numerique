FROM node:lts as development

WORKDIR /app

RUN chown node:node /app
USER node

COPY --chown=node:node package*.json ./
RUN npm i

CMD [ "npm", "start" ]

# Build
###
FROM development as build

COPY --chown=node:node . ./

RUN npm ci
RUN npm run build

# Production
###
FROM bitnami/node as production

WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm ci --production
COPY --from=build /app/dist /app/dist

CMD ["npm","run","start:prod"]