##### Construction global

``` bash
# cloner le projet
git clone  https://github.com/dnum-mi/bibliotheque-numerique.git

cd bibliotheque_numerique

# installation des packages
pnpm install

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

###### Client

A partir de la racine du projet

```bash
# Lancer le client en mode developpement
pnpm dev:client
```
