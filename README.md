---
title: Guide du développeur pour bibliothèque-numérique
description: Guide pour le nouvel arrivant détaillant les étapes nécessaires pour pouvoir travailler sur le projet
author: Stanislas Ormières
date: "2023-04-04T11:27:12.089Z"
type: documentation
tags:
  - documentation
  - dev
  - npm
  - docker
keywords: ['']
---

# Projet biblio-num

Ceci est la documentation du développeur.

## Workspaces

Le projet est construit avec des [workspaces pnpm](https://pnpm.io/workspaces).

[Turborepo](https://turbo.build/repo) a été utilisé pour gérer les workspaces pnpm plus facilement.

## Premiers pas pour travailler sur la partie serveur

### Stack

La stack choisie pour le Server :

- Node.js
- TypeScript
- NestJS
- S3
- PostgreSQL

Pour les tests :

- Jest (bientôt Vitest) pour le harnais de test
- Mailhog pour le mock d’un serveur SMTP

### Récupérer un token pour l’API de Démarche Simplifiée (DS)

Aller sur le site de DS (IP privée, demander à l’équipe).

### Configurer les variables d’environment

1. Copier le contenu de `server/.env-example` et le coller dans un fichier `server/.env`
2. Créer un token pour l’API de Démarche Simplifiée (DS)
3. Remplir toutes les variables d’environment

### Lancer la base de données PostgreSQL

Le plus simple est de lancer le serveur en lançant le conteneur par le docker-compose `server/docker-compose.yml`.

Ce docker-compose lance le serveur de base de données et une interface web d’administration **adminer** accessible à <http://localhost:8010>.

Pour ce faire, lancer le script npm `dev:docker` :

```console
npm run dev:docker
```

### Lancer le(s) script(s) de création de données initiales

Il faut maintenant le script d’initialisation des données :

```console
npm run typeorm:migration:init
```

Ce script est l’équivalent de ces deux scripts :

```console
npm run typeorm:migration:run
```

(Pour créer toutes les structures de données)

et

```console
npm run db:create-default-admin
```

(Pour créer le compte admin par défaut)

## Développer sur le projet

### Lancer les apps en dev

#### Avec le minimum de conteneurs

Le script du package.json `dev` lance le minimum de conteneurs :

- Le serveur de base de données
- Le serveur Mailhog
- Le serveur S3

Et ensuite sont lancés les applications `server` et `client`.

#### Avec le serveur dans un conteneur

Le script du package.json `docker:dev` lance les mêmes conteneurs ainsi qu’un autre : un conteneur avec le serveur

#### Les conteneurs additionnels

Le script `docker:adminer` lance un conteneur avec [adminer](https://www.adminer.org/), qui écoute sur le port **`8010`**.

Le script `docker:pgadmin` lance un conteneur avec [pgadmin](https://www.pgadmin.org/), qui écoute sur le port **`3010`**.

### Lancer les tests

Le script **`test`** à la racine du projet lance les tests de tous les workspaces qui possèdent un script **`test`** dans le **`package.json`** (a priori tous, donc).

```console
pnpm run test
```

### Lancer le lint

Le script **`lint`** à la racine du projet lance la vérification statique du code de tous les workspaces qui possèdent un script **`lint`** dans le **`package.json`** (a priori tous, donc).

```console
pnpm run lint
```

#### Lancer les lint, tests et build du serveur uniquement

Chaque workspace a normalement son lot de script `lint`, `test` et `build`, qui doivent être lancés depuis leur dossier.

Pour le serveur et le client, il est possible de les lancer depuis la racine avec les scripts suivants :

- Client

```console
pnpm run lint:client
```

```console
pnpm run test:client
```

```console
pnpm run build:client
```

- Serveur

```console
pnpm run lint:server
```

```console
pnpm run test:server
```

```console
pnpm run build:server
```


## Configuration de REST Client (extension VSCode)

Installer l’extension [REST client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

Ajouter ces lignes dans vos settings :

```json
  "rest-client.environmentVariables": {
    "local": {
        "baseUrl": "http://localhost:3000",
        "adminUser": "admin@example.com", // Doit correspondre à l’admin que vous avez créé
        "adminPassword": "53CR37P455" // Doit correspondre au mot de passe de ce même utilisateur
    }
  },
```

Vous pouvez désormais interroger l’API du serveur en utilisant dans VSCode le fichier `/apps/server/api.http`.
