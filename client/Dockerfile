FROM node:lts as development

WORKDIR /app

RUN chown node:node /app
USER node

COPY --chown=node:node package*.json ./
RUN npm i --legacy-peer-deps

CMD [ "npm", "run", "dev" ]
