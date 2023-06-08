
## Description

Bibliothèque Numérique Server API

## Installation

```bash
$ npm install
```

## Migration

```bash
# Running migrations
$ npm run typeorm:migration:run
$ npm run typeorm migration:run -- -d src/db/app-data-source.ts

# Create a migration
$ npm run typeorm:migration:create -n Dossier
$ mv 1668775846269-Dossier.ts src/db/migrations

# Generating migrations
$ npm run typeorm:migration:generate
```

## Running the app

```bash
# set environment
$ exoprt DS_API_URL=....
$ exoprt DS_API_TOKEN=....
# Or use .env
cp .env-example .env


# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
### Running in container docker
```bash
# set environment
$ exoprt DS_API_URL=....
$ exoprt DS_API_TOKEN=....
# Or use .env
cp .env-example .env

# up development
$ docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```
## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Swagger

```text
http://localhost:3000/swagger
```
