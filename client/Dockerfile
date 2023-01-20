# Developement
###
FROM node:lts as dev

WORKDIR /app

RUN chown node:node /app
USER node

COPY --chown=node:node package*.json ./
RUN npm i

CMD [ "npm", "run", "dev" ]

# Build
###
FROM dev as build

COPY --chown=node:node . ./

RUN npm ci
RUN npm run build

# PROD
###
# FROM nginx:stable as prod
FROM bitnami/nginx:latest as production

COPY --from=build /app/dist /app/

USER 1001
