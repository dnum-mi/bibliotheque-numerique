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

## Serveur

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
