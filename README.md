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

La stack choisie pour le Serveur (API RESTfull) :

- Node.js
- TypeScript
- NestJS
- S3
- PostgreSQL

Pour les tests :

- Jest (bientôt Vitest) pour le harnais de test
- Mailhog pour le mock d’un serveur SMTP
- supertest pour les tests "end-to-end" (attention, ne pas confondre les tests "end-to-end" NestJS et les test End-to-end avec Cypress)

### Récupérer un token pour l’API de Démarche Simplifiée (DS)

Aller sur le site de DS (IP privée, demander à l’équipe).

### Configurer les variables d’environment

1. Copier le contenu de `server/.env-example` et le coller dans un fichier `server/.env`
2. Créer un token pour l’API de Démarche Simplifiée (DS)
3. Remplir toutes les variables d’environment

### Lancer la base de données PostgreSQL

Le plus simple est de lancer le serveur de base de données en lançant le conteneur par le docker-compose `server/docker-compose.yml`.

Ce docker-compose avec le profile `simple-dev` lance le serveur de base de données et une interface web d’administration **adminer** accessible à <http://localhost:8010>.

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

## Conventions à respecter

### Conventions de nommage

#### Noms de branche git

Le nom de branche doit être formé de la façon suivante :

`<feat|fix|tech|docs|refacto>_#<ticket_github>/<description-en-kebab-case>`

Exemples :

- `feat_#353/worker-logs`
- `refacto_#360/reorganize-backend`

#### Message de validation (*commit*)

Les messages de validation git doivent respecter les conventions de [Commits Conventionnels](https://www.conventionalcommits.org/fr/v1.0.0/).

les messages de commit sont acceptés en anglais ou en français.

#### Noms de dossiers et fichiers

Les noms des dossiers et des fichiers doivent impérativement être écrits en [kebab-case](https://www.freecodecamp.org/news/snake-case-vs-camel-case-vs-pascal-case-vs-kebab-case-whats-the-difference/) avec une seule exception : les noms de dossiers et de fichiers de composants Vue et des fichiers s’y afférents (fichiers de tests unitaires et de tests end-to-end, par exemple).

##### Front

Les noms de composants Vue doivent impérativement être formés d’au moins 2 mots, avec une seule exception : le composant `App.vue`.

Exemple :

```
├── src
│   ├── App.vue
│   ├── components
│   │   ├── BadgeTypeOrganisme.vue
│   │   ├── BiblioNumDataTable.cy.ts
│   │   ├── BiblioNumDataTable.vue
│   │   ├── BiblioNumDataTableAgGrid.cy.ts
│   │   ├── BiblioNumDataTableAgGrid.vue
│   ├── stores
│   │   ├── index.ts
│   │   ├── role.ts
│   │   └── user.ts
```

##### Back

les noms des modules et fichiers associés de NestJS doivent respecter la convention du framework. Les noms sont au singulier: CatModule, CatService, CatController etc.
La structure est la suivante :

```
├── src
│   ├── modules
│   │   ├── cat
│   │   │   ├── controllers
│   │   │   │   ├── cat.controller.ts
│   │   │   │   ├── cat.controller.spec.ts
│   │   │   ├── providers
│   │   │   │   ├── cat.service.ts
│   │   │   │   ├── cat.service.spec.ts
│   │   │   ├── entity
│   │   │   │   ├── cat.entity.ts
│   │   │   ├── cat.module.ts

```

#### Noms de variables

- variable booléenne : doit commencer par `is` (rarement `has`, `should` ou `can`) et être en `camelCase`  comme `isReallyTrue`
- variable date : doit être préfixée par `Date` ou `At` et être en `camelCase`  comme `startDate` ou `lastModifiedAt`
- variable array : doit être être au `pluriel`. Exemple: `cats: Array<Cat>`
- fonction constructeur et classe : `PascalCase`
- autre variable ou fonction : `camelCase`
- constante : `SCREAMING_SNAKE_CASE`

Les noms de variables et de fonctions (méthodes aussi) doivent être explicites, et donc potentiellement très long... Jusqu’à une certaine limite.

Les noms de variable d’un seul caractères doivent être proscrits, sauf dans de (très très) rares cas, comme la fonction d’identité (`x => x`) ou des fonctions fléchées extrêmement simples.

Les **noms de variable doivent être au maximum en anglais**, et **peuvent être en français dans certains cas** si la traduction prête à confusion ou trop difficile (`demarche` ou `dossier`) ou si c’est un mot réservé (`affaire` peut rester `affaire` pour ne pas utiliser `case` qui est un mot réservé du langage JavaScript - et donc TypeScript).

#### Noms des endpoints

le nom des **endpoints** doivent correspondres à la ressource au pluriel, et les quatres endpoint classiques doivent être:

- POST /cats (pour créer un cat)
- GET /cats (pour récupérer un tableaux de cats)
- GET /cats/:id (pour récupérer un cat)
- PATCH-PUT /cats/:id (pour modifier un cat)
- DELETE /cats/:id (pour effacer un cat)

## Développer sur le projet

### Lancer les apps en dev

#### Avec le minimum de conteneurs

Le script du package.json `dev` lance le minimum de conteneurs :

- Le serveur de base de données
- Le serveur Mailhog
- Le serveur S3

Et ensuite sont lancés les applications `server` et `client`.

Lancer à la racine du projet :

```console
pnpm run dev
```

#### Avec le serveur dans un conteneur

Le script du package.json `docker:dev` lance les mêmes conteneurs ainsi qu’un autre : un conteneur avec le serveur. Si le développeur souhaite développer dans un docker.

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

## Utilisation de `api.http` depuis IntelliJ

Depuis Webstorm ou un autre IDE de JetBrains, regarder la [documentation officielle](https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html).
