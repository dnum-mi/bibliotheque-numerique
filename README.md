# Bibliothéque Numérique

## Contexte

La solution Bibliothèque Numérique proposée s’appuie sur et complète les outils de gestion de téléprocédures SVE (ministère de l’intérieur) et [Démarches-Simplifiées](https://www.demarches-simplifiees.fr/) (DINUM) afin de permettre, suite à la phase d’instruction de démarches de déclaration, l’interaction multi-acteurs autour de ces données, afin d’en tirer des analyses et actions légales éventuelles.

Dans cette solution est incorporé un système de référence des fondations de dotations et d'entreprises, RNF.

## Installation

### Prérequis

#### Les outils à installer

- [Nodejs](https://nodejs.org/en/download/) *- environnement d'exécution javascript/typescript*
- [Pnpm](https://pnpm.io/installation) *- gestionnaire de paquets et workspaces pour javascript*
- [Docker](https://docs.docker.com/get-docker/) *- moteur d'exécution de conteneur*

#### Les APIs externes pour les tests

- Avoir un compte administrateur sur une instance de Démarches-Simplifiées
- Avoir un token pour l'api RNA ([Documentation](https://entreprise.api.gouv.fr/developpeurs/openapi#tag/Informations-generales/paths/~1v4~1djepva~1api-association~1associations~1%7Bsiren_or_rna%7D/get))

### Lancer les applications

#### Architecture

Les outils et les serveurs sont lancé sous forme de conteneurs Docker

##### Les serveurs

- [Postgres](https://www.postgresql.org/) *- Le systeme de base de données relationnel*
- [Redis](https://redis.io/) *- Pour le systeme de Queue*
- [Minio](https://min.io/) *- Pour le systeme de stockage de fichiers S3*
- [mailhog](https://github.com/mailhog/MailHog) *- un faux server SMTP pour récuper les e-mails*

Vous aurez besoin de configurer (Access keys et Buckets) de Minio avant de lancer les applications.

```bash
# Lancer les containeurs Minio
pnpm run docker:s3:up
```

##### Les outils

- [pgAdmin](https://www.pgadmin.org/) *- Outil d'administration de base données*
- [Adminer](https://www.adminer.org/) *- Outil d'administration de base données léger*
- [bull-board](https://github.com/felixmosh/bull-board) *- Outil de suivi de jobs et queues*

#### En local

##### Construction global

``` bash
# cloner le projet
git clone  https://github.com/dnum-mi/bibliotheque_numerique.git

cd bibliotheque_numerique

# installation des packages
pnpm install

# génération des entités de rnf
pnpm generate-rnf

#construction
pnpm build

```

##### Lancer Bibliothéque Numérique

###### Server

```bash
# Mettre à jours les variables d'environnement de Biblithéque Numérique
cp apps/server/.env-example apps/server/.env
```

Complétez vos vairables d'environnements dans du fichier `.env` pour Biblithéque Numérqure  ([voir doc des variables d'environnement](./apps/server/variables_env.md))

```bash
# Lancer les containeurs Postgres, redis, mailhog et Minio, si ce n'est pas fait
pnpm run docker:simple-dev

# initialisation de la base de données de bibliothéques Numérique
pnpm migration:run

# Lancer le server api en mode developpement
pnpm dev:server
```

```bash
# lancer le server worker de synchronisation des demarches et des ogranismes dans un autre terminal
pnpm dev:dws
```

```bash
# lancer le server worker de synchronisation des fichiers dans un autre terminal
pnpm dev:dwf
```

Vous pouvez pré-rempli la base de données avec le jeu de données présent dans ce répertoire [dumps](dumps/) dont les opérations pré-remplissage sont décrits dans [ici](docs/Server/database/README.md)

###### Client

A partir de la racine du projet

```bash
# Lancer le client en mode developpement
pnpm dev:client
```

##### Lancer RNF

###### Server

```bash
# Mettre à jours les variables d'environnement de RNF
cp apps/rnf-server/.env-example apps/rnf-server/.env
```

Complétez vos vairables d'environnements dans du fichier `.env` pour RNF ([voir doc des variables d'environnement](./apps/rnf-server/variables_env.md))

Lancer les génération de code des entités si n'a pas été fait

```bash
# Génerer les entités de RNF
pnpm generate-rnf
```

```bash
# Lancer les containeurs Postgres, redis, mailhog et Minio, si ce n'est pas fait
pnpm run docker:simple-dev
```

```bash
# initialisation de la base de données de RNF
pnpm rnf-migration:run

# Lancer le serveur en mode developpement
pnpm dev:rnf-server
```

###### Client

```bash
# Lancer le client en mode developpement
pnpm dev:rnf-client
```
