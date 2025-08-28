
## Description

Bibliothèque Numérique Server API

## Installation

```bash
npm install
```

## Migration

```bash
# Running old-migrations
$ npm run migration:run

# Generating a migration
$ npm run migration:generate database/migrations/TheNameOfMyMigration
```

## Running the app

```bash
# set environment
$ export DS_API_URL=....
$ export DS_API_TOKEN=....
# Or use .env
cp .env-example .env


# development
$ npm run start

# watch mode
$ npm run dev

# production mode
$ npm run start:prod
```

### Running in container docker

```bash
# set environment
$ export DS_API_URL=....
$ export DS_API_TOKEN=....
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

## S3 minio

Afin de pouvoir utiliser minio en local il faut:

- démarrer le docker minio
- aller sur le docker minio localhost:9000
- utiliser les identifiants (qui se trouve dans le fichier docker-compose, chapitre minio)
- identifiant ET password: ``s3_biblio-num_minio``
- créer une nouvelle API key
- mettre les deux clefs privée et publiques dans l'env
- créer un bucket (du même nom que l'env)
- redémarrer le serveur.
