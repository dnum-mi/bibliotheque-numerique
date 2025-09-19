# Structure du Code Serveur

## Technologies Utilisées

L'application est développée avec **NestJS** et s'efforce de respecter les conventions de NestJS autant que possible. Voici une liste des technologies et bibliothèques utilisées :

- **TypeORM** : ORM pour la gestion d'une base de données SQL.
- **Swagger** : Utilisé pour la documentation de l'API.
- **Express-validator** : Utilisé pour la validation des requêtes.
- **Passport** : Employé pour l'authentification.
- **Bull** : Utilisé pour la gestion du système de files d'attente.
- **Redis et redis-client** : Utilisés pour les files d'attente et les tâches planifiées (cron jobs).
- **AWS-SDK** : Employé pour le service de stockage de fichiers (S3).
- **XLSX** : Librairie pour lire et écrire des fichiers XLSX.
- **ds-api-client** : Utilisé pour communiquer avec l'API de Démarche Simplifiée (voir la documentation du dossier de synchronisation pour plus d'informations).
- **Jest** : Utilisé pour les tests unitaires et d'intégration.
- **Supertest** : Employé pour les tests e2e et d'intégration.

## Structure des Dossiers

### Dossier `database`

Ce dossier contient les informations de connexion et les configurations de TypeORM. Il est géré par TypeORM et ne devrait être modifié que si le développeur souhaite changer une migration générée par TypeORM. Les configurations sont utilisées dans les différentes applications NestJS ainsi que dans les tests e2e.

### Dossier `test`

Le dossier `test` comprend les tests e2e ou d'intégration de l'application. Les tests unitaires se trouvent dans le même dossier que le code source correspondant.

- **Dossier `fixture`** : Contient l'ensemble des fixtures utilisées au début des tests e2e.
- **Dossier `mock`** : Contient tous les mocks et données pour les services et API externes utilisés dans différents scénarios de test. Généralement, un fichier e2e correspond à un contrôleur.
- **Dossier `unit`**: Contient les fausses données nécessaire au fonctionnement de certain test unitaires.

### Dossier `src`

Contient le code source de l'application.

#### Dossier `app`
Le dossier `app` contient les trois applications NestJS de Biblionum :
- **api** : L'application principale, une API RESTful appelée par le front-end. Ce dossier contient uniquement le module et le fichier `main.ts`.
- **worker-file** : Gère les files d'attente pour les tâches de synchronisation des fichiers. Contient tous les processeurs qui lui sont reliés.
- **worker-sync** : Gère les files d'attente pour les tâches de synchronisation. Contient tous les processeurs qui lui sont reliés. Pour plus de détails sur la synchronisation, voir le dossier `Synchronisation`.

#### Dossier `config`
Contient toutes les configurations, organisées par catégories, provenant des variables d'environnement.

#### Dossier `modules`
Ce dossier est le cœur de l'application. Chaque module représente une partie importante de l'application et contient généralement les sous-dossiers suivants :
- **controller** : Contient les contrôleurs.
- **objects** : Contient les DTOs, types, énumérations, interfaces et entités.
- **providers** : Contient les services, utilitaires, décorateurs et autres fournisseurs (pipes, guards, interceptors).
- Un fichier module pour le module correspondant.

- Module `auth`
Contient le code nécessaire pour l'authentification et l'autorisation des utilisateurs.

- Module `cron`
Contient le code nécessaire pour ajouter les tâches cron dans la file d'attente Redis.

- Module `custom-filters`
Contient le code nécessaire pour les affichages personnalisés des utilisateurs.

- Module `dossier`
Gère les opérations sur les dossiers.

- Module `demarche`
Gère les opérations sur les démarches.

- Module `files`
Gère les opérations sur les fichiers.

- Module `health`
Contient le code permettant de retourner la santé du serveur.

- Module `instruction_time`
Gère les délais d'instruction. Voir la documentation correspondante pour comprendre le fonctionnement de cette fonctionnalité.

- Module `organismes`
Gère les opérations sur les organismes.

- Module `sendmail`
Module pour envoyer des emails avec les templates correspondants.

- Module `user`
Contient le code spécifique aux utilisateurs et à leurs rôles. Voir la documentation sur les rôles pour plus de détails.

#### Dossier `shared`
Le dossier `shared` regroupe l'ensemble du code réutilisé dans les autres modules, qui n'est pas spécifique à une donnée en particulier. Voici les sous-dossiers et modules qu'il contient :

- **Dossier `base-entity`** : Contient le code commun à toutes les entités de l'application.
- **Dossier `documentation`** : Contient le code utilisé pour générer la documentation Swagger.
- **Dossier `exceptions`** : Contient le code relatif à la gestion des erreurs de l'application.
- **Dossier `modules`** : Contient les modules partagés dans l'application :
  - **Module `als`** : Permet de stocker les logs en mémoire pour les récupérer ensuite, utilisé pour capturer les logs dans les jobs Redis.
  - **Module `bn-configurations`** : Gère les configurations de la base de données et les rend accessibles dans l'application comme des configurations classiques.
  - **Module `custom-bull`** : Branche la librairie Bull à Redis et ajoute des jobs avec un mécanisme anti-doublon.
  - **Module `ds-api`** : Utilise `ds-api-client` pour communiquer avec DS. Voir la documentation de `ds-api-client` pour plus d'informations.
  - **Module `logger`** : Module de log.
  - **Module `s3`** : Gère la connexion au service S3 et les fonctions de téléchargement et de téléversement de fichiers.
  - **Module `xlsx`** : Utilise la librairie XLSX pour écrire ou lire un fichier XLSX.
- **Dossier `pagination`** : Contient une fonction commune de pagination.
- **Dossier `pipe`** : Regroupe l'ensemble des pipes de l'application pour gérer la validation et le filtrage.
- **Dossier `types`** : Contient les types partagés dans l'application.
- **Dossier `utils`** : Contient les fonctions utilitaires partagées dans l'application.


