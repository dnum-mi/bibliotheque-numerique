## Variables d'environnement

### API

| Nom | Valeur par défaut | Description | Obligatoire |
|----|------------------|-------------|------------ |
| PORT | `3000` | Le port d'écoute de l'application | Oui
| http_proxy | | Le proxy pour communiquer avec les API extérieures | Non
| PROTOCOL |`http` | Le protocole de transfert utilisé | Oui
| APP_FRONT_URL | `<http://localhost:8080>` | L'URL de base de la bibliothèque numérique insérée dans les courriels | Oui
| RUN_ENV | `development` | L'environnement d'exécution de l'application. Les valeurs possibles sont "staging", "preproduction", "production" ou "development" | Oui
| CREATE_MISSING_MANDATORY_CONFIGURATIONS | true | Si la valeur est `true`, la table de configuration est complété par les variables et les valeurs par défaut

La variable `TYPEORM_FORCE_SYNCHRONIZE` n'est utilisée que pour forcer la synchronisation du schéma de la base de données et des entités si elle est définie sur `true`.

```
TYPEORM_FORCE_SYNCHRONIZE = false
```

## JWT

| Nom | Valeur | Description | Obligatoire
|-----|--------|------------ |-------------
| AUTH_JWT_SECRET| `"test"` | Secret pour décrypter les jetons JWT | Oui
| JWT_URL_EXPIRE_IN |  `15m` | Durée de validité du jeton pour la validation d'e-mail et la réinitialisation de mot de passe | Oui
| JWT_URL_SECRET |  `abcd` | Secret du jeton pour la validation d'e-mail et la réinitialisation de mot de passe | Oui
| AUTH_JWT_EXPIRE_IN |  `1h` | Durée de validité du jeton pour la connexion
| AUTH_JWT_REFRESH_EXPIRE_IN |  `7d` | Durée de validité du jeton de refresh pour la connexion

## Administrateur technique

Les variables ci-dessous permettent à l'application de créer un administrateur technique s'il n'existe pas déjà.

| Nom | Valeur | Description | Obligatoire
|-----|--------|------------ |------------
| DEFAULT_SUDO_EMAIL | `"<admin@localhost.com>"`  | Adresse courriel de l'administrateur technique | Oui
| DEFAULT_SUDO_HASHED_PASSWORD | `"$2a$10$17i0T.bBP7/ AMGa.XVfWN.Ekn1MAaxrfyxN/Ai7Eb2I6TLFBjHf8e"` | Mot de passe hashé valant `password` | Oui
| DEFAULT_SUDO_FORCE_UPSERT | `true` | Si `true`, l'administrateur est recréé à chaque redémarrage de l'application | Oui

### Enregistrement des logs

Les variables ci-dessous sont utilisées pour activer ou désactiver les niveaux de log de l'application.

| Nom | Valeur | Description
|-----|--------|------------
| LOG_LEVEL_LOG | `true` | Activation des logs
| LOG_LEVEL_ERROR | `true` | Activation des logs d'erreur
| LOG_LEVEL_WARN | `true` | Activation des logs d'avertissement
| LOG_LEVEL_DEBUG | `true` | Activation des logs de débogage
| LOG_LEVEL_VERBOSE | `true` | Activation des logs verbeux
| LOG_TO_FILE | `true` | Écriture des logs dans des fichiers

### Base de données

Les variables ci-dessous sont utilisées par l'application pour se connecter à la base de données.

| Nom | Valeur par défaut | Description | Obligatoire
|-----|-------------------|-------------|------------
| POSTGRES_HOST | `localhost` | L'adresse du serveur de la base de données PostgreSQL. | oui
| POSTGRES_PORT | `5432` | Le port sur lequel le serveur PostgreSQL écoute les connexions. | oui
| POSTGRES_USERNAME | `user` | Le nom d'utilisateur utilisé pour se connecter à la base de données PostgreSQL. | oui
| POSTGRES_PASSWORD | `password` | Le mot de passe utilisé pour se connecter à la base de données PostgreSQL. | oui
| POSTGRES_DB | `biblio-num` | Le nom de la base de données PostgreSQL à laquelle se connecter. | oui
| POSTGRES_SCHEMA | `public` | Le nom du schéma à utiliser dans la base de données PostgreSQL | non

### Redis

| Nom | Valeur | Description | Obligatoire
|-----|--------|------------ |------------
| REDIS_HOST | `localhost` | L'adresse du serveur Redis. | oui
| REDIS_PORT | `6379` | Le port sur lequel le serveur Redis écoute les connexions. | oui
| REDIS_PASSWORD | `redis` | Le mot de passe utilisé pour se connecter au serveur Redis, s'il est configuré pour l'authentification. | oui
| REDIS_INDEX | `0` | L'index de la base de données Redis à utiliser. | oui
| REDIS_MAX_RETRY_PER_REQUEST_COUNT | `5` | Le nombre maximum de tentatives de connexion à Redis par requête. | oui
| REDIS_MAX_LOADING_RETRY | `20` | La durée maximale pendant laquelle Bull va réessayer de charger des jobs en cas d'échec de connexion à Redis. | oui

### Jobs Bull

| Nom | Valeur | Description  | Obligatoire
|-----|--------|------------- |------------
| BULL_JOB_REMOVE_ON_FAIL | `5000` | Le nombre maximum de jobs échoués à conserver dans la file d'attente Bull. | oui
| BULL_JOB_REMOVE_ON_SUCCESS | `1000` | Le nombre maximum de jobs réussis à conserver dans la file d'attente Bull. | oui
| BULL_JOB_RETRY_ATTEMPTS | `3` | Le nombre maximum de tentatives de réessai pour un job en cas d'échec. | oui
| BULL_JOB_RETRY_DELAY | `10000` | La durée d'attente avant le prochain réessai du job après un échec, en millisecondes. | oui
| BULL_JOB_RETRY_DELAY_TYPE | `exponential` | Le type de retard d'attente entre les réessais de job, avec les valeurs possibles "fixed" (fixe) ou "exponential" (exponentiel). | oui

## Tâches planifiées (Cronjobs)

| Nom | Valeur | Description  | Obligatoire
|-----|--------|------------- |------------
| CRON_SKIP_INITIALIZATION | `true` | Si cette valeur est définie sur `true`, les valeurs des crontabs ne seront pas  ouiréinitialisées. |
| CRON_SYNC_ALL_DEMARCHE | `*1****` | Cron pour la mise à jour des démarches et des dossiers.| oui
| CRON_SYNC_RNF_ORGANISME | `*1****` | Cron pour la mise à jour des fondations.| oui
| CRON_SYNC_RNA_ORGANISME | `*1****` | Cron pour la mise à jour des associations.| oui
| CRON_COMPUTE_TIME_TRACKING | `*1****` | Cron pour la mise à jour des délais d'instruction et des états d'instruction.| oui
| CRON_COMPUTE_ORGANISME_DDC | `*2***` | Cron pour la mise à jour des années manquantes et des états de dépôts de comptes. | oui

## Service de stockage S3

[Lien des descriptions](../../docs/Server/Storage_S3_Local/File_Storage.md)

| Nom | Valeur | Description | Obligatoire
|-----|--------|------------ |------------
|ACCESS_KEY_ID|  | Clé fournie par le serveur de stockage S3 | oui
|SECRET_ACCESS_KEY|  | Clé fournie par le serveur de stockage S3 | oui
|AWS_S3_REGION| `fr-paris-1` | Région choisie dans le serveur de stockage S3 | oui
|AWS_DEFAULT_S3_BUCKET| `super-bucket` | Nom du bucket défini dans le serveur de stockage S3 | oui
|AWS_DEFAULT_S3_URL| `<http://127.0.0.1:9000>` | URL de l'API du serveur de stockage S3 | oui
|FILE_DRIVER| `s3` | Indique où les fichiers téléchargés doivent être enregistrés : localement (`local`) ou dans le cloud S3 (`s3`) | non utilisé

## Autres

La variable `NODE_TLS_REJECT_UNAUTHORIZED` est utilisée pour désactiver la vérification stricte du certificat SSL/TLS. Lorsque cette variable est définie sur `0`, cela permet à Node.js de se connecter à des serveurs avec des certificats SSL/TLS invalides ou auto-signés. Cela peut être utile lors du développement ou du débogage, mais il est important de ne pas l'utiliser en production, car cela peut exposer l'application à des vulnérabilités de sécurité.

```
NODE_TLS_REJECT_UNAUTHORIZED=0
```

## SMTP

| Nom | Valeur | Description | Obligatoire
|-----|--------|------------ |------------
| SMTP_SERVER | `localhost` | L'adresse du serveur SMTP | oui
| SMTP_PORT | `1025` | Le port du serveur SMTP | oui
| MAIL_FROM | `<noreply@interieur.gouv.fr>` | L'adresse courriel de l'expéditeur | oui
| SMTP_USER | | identifiant de l'utilisateur du serveur SMTP | non
| SMTP_PWD | | mot de passe de l'utilisateur du serveur SMTP | non

## Démarches Simplifiées

| Nom | Valeur | Description | Obligatoire
|-----|--------|------------ |------------
| DS_API_URL | `<https://demarche-simplifiees.fr/api/v2/graphql>` | URL de l'API de démarches simplifiées | oui
| DS_API_TOKEN | | Votre token administrateur dans démarches simplifiées | oui

## API RNA

| Nom | Valeur | Description | Obligatoire
|-----|--------|------------ |------------
| RNA_API_URL |  | URL de l'API RNA | oui
| RNA_API_TOKEN |  | Le token de l'API RNA | oui
| RNA_RECIPIENT |  | Le SIRET de l’administration destinatrice des données | oui

## API RNF

| Nom | Valeur | Description| Obligatoire
|-----|--------|------------|------------
| RNF_API_URL | | URL de l'API RNF | oui

## Autres

La variable d'environnement `AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE` est utilisée pour supprimer les messages de maintenance du SDK AWS JavaScript.

```
AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE=1
```
