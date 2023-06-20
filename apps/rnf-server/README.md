# Référenciel national des Fondations (RNF)

## About

Cette application a pour but de référencer la création des foundations (faite sur Démarche simplifiés) et de leur attribuer un numéro unique afin de pouvoir retrouver les informations correspondantes si demandées.

## Numéro RNF

### About

Un numéro RNF pour une fondation est déterminé comme ceci:

```
  <Numéro département sur trois charactère> - <type de fondation> - <numéro id sur 6 chars> - <clef de luhn sur 2 char>
```

### Exemple

Exemple:

```typescript
const fondationToto = {
  departement: 57,
  id: 42,
  type: 'FRUP'
}
```

```typescript
  const totoRnf = "057-FRUP-000042-03"
```

### Algorithm de Luhn

Les deux derniers chars utilise l'algorithm de Luhn avec une clef de 2 décimale pour coder le numéro RNF.
CF : <https://fr.wikipedia.org/wiki/Formule_de_Luhn>

# Documentation technique

## Table des matières

1. [Installation](#installation)
2. [Effectuer une nouvelle migration](#migration)
3. [Codage avec Prisma Generate](#codage-avec-prisma-generate)
4. [Test unitaire](#test-unitaire)
5. [Test end-to-end](#test-end-to-end)
6. [Documentation de l'API](#documentation)

## <a name="installation"></a> Installation

### Prérequis

1. Node.js v14.15.0 ou plus
2. [pnpm](https://pnpm.io/installation) install
3. PostgreSQL

### Étapes

1. Clonez le repo : `git clone https://lien-vers-votre-repo.git`
2. Accédez au dossier du projet : `cd nom-du-projet/apps/rnf-api`
3. Installez les dépendances du projet : `pnpm install`
4. Copiez le fichier `.env.exemple` dans un nouveau fichier `.env`
5. Modifiez le fichier `.env` avec vos informations de connexion à la base de données PostgreSQL
6. Lancez la synchronisation de la base de données avec Prisma Migrate : `pnpx prisma migrate dev`

## <a name="migration"></a> Effectuer une nouvelle migration

### Prérequis

1. Un modèle Prisma défini dans `prisma/schema.prisma`

### Étapes

1. Créez une migration avec la commande : `pnpx prisma migrate dev --name nom_de_la_migration`

- Prisma Migrate va générer un dossier de migration SQL dans `prisma/migrations`
- Vous pouvez vérifier le fichier SQL pour vous assurer qu'il correspond à vos attentes

2. Appliquez la migration à votre base de données avec la commande : `pnpx prisma migrate dev`

- Cette commande mettra à jour la base de données pour correspondre à votre modèle Prisma
- Si vous êtes en production, utilisez plutôt `pnpx prisma migrate deploy`

## <a name="codage-avec-prisma-generate"></a> Codage avec Prisma Generate

### Migration

1. Après avoir effectué une migration ou une modification de votre modèle Prisma, exécutez la commande `pnpx prisma generate`

- Cela générera le client Prisma dans `node_modules/@prisma/client`

2. Vous pouvez maintenant utiliser le client Prisma dans votre code pour interagir avec votre base de données

- Par exemple : `import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient();`

### Sync without migration

il est aussi possible de syncroniser directement le schema prisma avec la base de donnée pendant le prototyping sans effectuer une migration à chaque fois.
Pour cela, utiliser la commande:

```shell
  pnpx prisma db push --preview-feature
```

### Exemple d'utilisation du client Prisma

Si vous avec un user qui ressemble à ça dans votre schéma:

```prisma
model User {
  name: String
  email: String
}
```

Après le generate, vous pourrez accéder au sous-ensemble **prisma.user**:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const newUser = await prisma.user.create({
        data: {
            name: "Alice",
            email: "alice@prisma.io",
        },
    });

    console.log(`Created new user: ${newUser.name} (ID: ${newUser.id})`);
}
```

## <a name="test-end-to-end"></a> Test End-to-end

L'api est testée en e2e pour chaque des controllers. Nous moquons seulement DsService afin de ne pas dépender d'une API extérieure lors des test. Cf fondation.e2e-spec.ts
Pour les lancer, executer:

```shell
pnpm run test:e2e
```

## <a name="test-unitaire"></a> Test Unitaire

L'application est testée unitairement pour tout ce qui est considéré comme "complex". Nous ne testons pas tous les service et controller qui sont triviaux. Par exemple, les utilitaires de nombres et de génération de l'algorithme de luhn sont testés.
Pour les lancer, executer:

```shell
pnpm run test
```

## <a name="documentation"></a> Documentation de l'API

Il est possible de voir les routes et la documentation de l'api sur

```text
http://localhost:3001/swagger
```

Vous pouvez utiliser cette documentation pour tester l'api directement depuis votre navigateur.
