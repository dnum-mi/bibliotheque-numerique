## Variables d'environnement

### API

| Nom | Valeur par défaut | Description | Obligatoire |
|----|------------------|-------------|------------ |
| PORT | `3001` | Le port d'écoute de l'application | oui
| FOUNDATION_TITLE_SIMILARITY_SCORE | `0.8` | taux similute dans la recherche d'une fondation par son nom | oui
| ADMIN_TOKEN | `"password"` | token pour se connecter à l'api RNF | oui

## LOGS

### Enregistrement des logs

Les variables ci-dessous sont utilisées pour activer ou désactiver les niveaux de log de l'application.

| Nom | Valeur | Description
|-----|--------|------------
| LOG_LEVEL_LOG | `true` | Activation des logs
| LOG_LEVEL_ERROR | `true` | Activation des logs d'erreur
| LOG_LEVEL_WARN | `true` | Activation des logs d'avertissement
| LOG_LEVEL_DEBUG | `true` | Activation des logs de débogage
| LOG_LEVEL_VERBOSE | `true` | Activation des logs verbeux

## DATABASE

| Nom | Valeur par défaut | Description | Obligatoire
|-----|-------------------|-------------|------------
| DATABASE_HOST | `"localhost"` | L'adresse du serveur de la base de données PostgreSQL. | oui
| DATABASE_PORT | `"5432"` | Le port sur lequel le serveur PostgreSQL écoute les connexions. | oui
| DATABASE_NAME | `"rnf"` | Le nom de la base de données PostgreSQL à laquelle se connecter. | oui
| DATABASE_USER | `"user"` | Le nom d'utilisateur utilisé pour se connecter à la base de données PostgreSQL. | oui
| DATABASE_PASSWORD | `"password"` | Le mot de passe utilisé pour se connecter à la base de données PostgreSQL. | oui
| DATABASE_URL | `"postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}?schema=public"` | L'Uri de connexion de la base de donnée

## Démarches Simplifiées

| Nom | Valeur | Description | Obligatoire
|-----|--------|------------ |------------
| DS_API_HOST | `"host"` | L'adresse de démarche-simplifiées
| DS_API_URL | `"https://${DS_API_HOST}/api/v2/graphql"` | URL de l'API de démarches simplifiées | oui
| DS_API_TOKEN | "token" | Votre token administrateur dans démarches simplifiées | oui

## Autres

La variable `NODE_TLS_REJECT_UNAUTHORIZED` est utilisée pour désactiver la vérification stricte du certificat SSL/TLS. Lorsque cette variable est définie sur `0`, cela permet à Node.js de se connecter à des serveurs avec des certificats SSL/TLS invalides ou auto-signés. Cela peut être utile lors du développement ou du débogage, mais il est important de ne pas l'utiliser en production, car cela peut exposer l'application à des vulnérabilités de sécurité.

```
NODE_TLS_REJECT_UNAUTHORIZED=0
```

## Service de stockage S3

| Nom | Valeur | Description | Obligatoire
|-----|--------|------------ |------------
|ACCESS_KEY_ID|  | Clé fournie par le serveur de stockage S3 | oui
|SECRET_ACCESS_KEY|  | Clé fournie par le serveur de stockage S3 | oui
|AWS_S3_REGION| `fr-paris-1` | Région choisie dans le serveur de stockage S3 | oui
|AWS_DEFAULT_S3_BUCKET| `super-bucket` | Nom du bucket défini dans le serveur de stockage S3 | oui
|AWS_DEFAULT_S3_URL| `<http://127.0.0.1:9000>` | URL de l'API du serveur de stockage S3 | oui
