# Bibliothéque Numérique

## Contexte

La solution Bibliothèque Numérique proposée s’appuie sur et complète les outils de gestion de téléprocédures SVE (ministère de l’intérieur) et [Démarche-Numérique](https://demarche.numerique.gouv.fr/) (DINUM) afin de permettre, suite à la phase d’instruction de démarches de déclaration, l’interaction multi-acteurs autour de ces données, afin d’en tirer des analyses et actions légales éventuelles.

Dans cette solution est incorporé un système de référence des fondations et des associations, RAF.

## Installation

### Prérequis

#### 1. Les outils à installer

Dans tous les modes d'installation, il est nécessaire d'avoir les outils suivants installés sur votre machine:

- [Docker](https://docs.docker.com/get-docker/) *- moteur d'exécution de conteneur*

##### En mode développement uniquement, il est nécessaire d'avoir les outils suivants installés sur votre machine:

- [Nodejs](https://nodejs.org/en/download/) *- environnement d'exécution javascript/typescript*
- [Pnpm](https://pnpm.io/installation) *- gestionnaire de paquets et workspaces pour javascript*
- [turbo](https://turbo.build/repo/docs) *- Outil de monorepo*

#### 2. Les APIs et services externes utilisés

- Avoir un jeton d'authentification pour l'api [Démarche-Numérique](https://doc.demarches-simplifiees.fr/api-graphql/jeton-dauthentification)

### Lancer les applications

#### 1. Architecture

Les outils et les services sont lancé sous forme de conteneurs Docker

* ##### Les services utilisés

  - [Postgres](https://www.postgresql.org/) *- Le systeme de base de données relationnel*
  - [Redis](https://redis.io/) *- Pour le systeme de Queue*
  - [Minio](https://min.io/) *- Pour le systeme de stockage de fichiers S3*
  - [mailhog](https://github.com/mailhog/MailHog) *- un faux server SMTP pour récuper les e-mails*

* ##### Les outils d'administration

  - [pgAdmin](https://www.pgadmin.org/) *- Outil d'administration de base données*
  - [Adminer](https://www.adminer.org/) *- Outil d'administration de base données léger*
  - [bull-board](https://github.com/felixmosh/bull-board) *- Outil de suivi de jobs et queues*

#### 2. Lancer en mode simple avec les conteneurs Docker

```bash
git clone https://github.com/dnum-mi/bibliotheque-numerique.git

cd bibliotheque_numerique

bin/start.sh
```

Naviguez ensuite vers [http://localhost:8088](http://localhost:8088) pour accéder à l'application.

Un compte administrateur est créé par défaut avec les identifiants suivants:
- Email: `admin@localhost.com`
- Mot de passe: `password`


#### 3. Lancer en mode développement

La page [DEVELOPMENT](docs/Developpement/development.md) explique comment lancer la Bibliothèque Numérique en mode développement.

## Documentation du Code

Certains chapitres de la Bibliothèque Numérique peuvent être difficiles à comprendre. C’est pourquoi des documents spécifiques ont été rédigés sur ces sujets.
L’ensemble des documents techniques est répertorié dans [docs/](docs) :

### Dossier *`Pagination des Dossiers`* :

Ce dossier contient un fichier Markdown qui explique la pagination des dossiers, accompagné d'un fichier Excel avec de fausses données pour illustrer les exemples de code présents.

### Dossier *`Structure du Code`* :

Contient un fichier Markdown expliquant la structure du backend. Ce document devrait être le premier lu par un nouveau développeur cherchant à se familiariser avec le backend.

### Dossier *`Synchronisation`* :

Contient un fichier Markdown expliquant la synchronisation des données entre Bnum et DS. Ce dossier inclut également un sous-dossier *`Code`* qui explique le système de codes de synchronisation.
