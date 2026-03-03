# ADR --- Stratégie de gestion des dépendances et du health

Date : 2026-03-05\
Statut : Accepté

------------------------------------------------------------------------

# Contexte

Le système **RAF** dépend de plusieurs services externes nécessaires à
son fonctionnement :

-   **PostgreSQL** --- base de données principale
-   **Redis** --- infrastructure utilisée par Bull pour la gestion des
    files de jobs
-   **DS API** --- API Démarches Simplifiées
-   **HUB API** --- service externe fournissant des informations sur les
    organismes
-   **S3** --- stockage des fichiers

Le système est composé de plusieurs applications déployées
indépendamment :

-   **API** : expose les endpoints HTTP utilisés par les clients
-   **Workers** : exécutent les jobs asynchrones

Toutes ces applications n'utilisent pas ces services avec le même niveau
de criticité.

En cas d'indisponibilité d'un service externe, le système doit adopter
un comportement clair et prévisible afin de garantir :

-   la stabilité du système
-   un comportement déterministe en cas d'incident
-   une reprise correcte lorsque la dépendance redevient disponible
-   une visibilité claire via les endpoints de health

Pour répondre à ces objectifs, l'équipe a mis en place une stratégie
unifiée de gestion des dépendances.

------------------------------------------------------------------------

# Décision

Chaque service externe est modélisé comme une **dépendance du système**.

Une dépendance expose une méthode `check()` permettant de vérifier son
état.

Chaque application définit ensuite une **politique de dépendance**
indiquant si la dépendance est **critique ou non** pour cette
application.

Cette politique est injectée au démarrage de l'application.

Un **Dependency Supervisor** central est chargé de :

1.  vérifier l'état des dépendances au démarrage
2.  attendre que les dépendances critiques soient disponibles
3.  surveiller régulièrement les dépendances
4.  arrêter l'application si une dépendance critique devient
    indisponible

Ce mécanisme garantit un comportement cohérent pour toutes les
applications.

------------------------------------------------------------------------

# Types de dépendances

Deux types de dépendances sont définis.

## Dépendance critique

Si une dépendance critique devient indisponible :

-   l'application est arrêtée volontairement (`process.exit`)
-   Kubernetes redémarre automatiquement le pod

Ce comportement permet :

-   d'éviter des états incohérents
-   d'éviter des erreurs silencieuses
-   de garantir une reprise propre lorsque la dépendance revient

------------------------------------------------------------------------

## Dépendance non critique

Si une dépendance non critique devient indisponible :

-   l'application continue de fonctionner
-   certaines fonctionnalités deviennent indisponibles
-   l'état dégradé est exposé via l'endpoint `/health`

------------------------------------------------------------------------

# Implémentation technique

La gestion des dépendances repose sur les éléments suivants :

### Dépendances

Chaque service externe est implémenté sous forme d'une classe :

-   `RedisDependency`
-   `DsDependency`
-   `HubDependency`
-   `S3Dependency`

Chaque dépendance expose :

    check(): Promise<DependencyStatus>

------------------------------------------------------------------------

### Dependency Supervisor

Le `DependencySupervisorService` :

-   attend les dépendances critiques au démarrage
-   vérifie régulièrement l'état des dépendances
-   arrête l'application si une dépendance critique devient indisponible

Ce mécanisme est partagé par toutes les applications.

------------------------------------------------------------------------

### Politique de dépendance

Chaque application définit sa propre politique :

    Record<string, boolean>

où la valeur indique si la dépendance est critique.

Exemple :

    {
      redis: true,
      ds: true,
      hub: false,
      s3: false
    }

Cette politique est injectée dans le `HealthModule` au démarrage.

------------------------------------------------------------------------

# Politique actuelle des dépendances

La politique suivante a été décidée par l'équipe le **5 mars 2026**.

------------------------------------------------------------------------

# Matrice de criticité

  -------------------------------------------------------------------------
Dépendance            API        Workers          Conséquence
  --------------------- ---------- ---------------- -----------------------
PostgreSQL            Critique   Critique         L'application s'arrête

Redis                 Non        Critique         L'API continue ; les
critique                    workers s'arrêtent

HUB                   Non        Non critique     L'application continue
critique                    avec fonctionnalités
limitées

DS                    Non        Critique         L'API continue ; les
critique                    workers s'arrêtent

S3                    Non        Non critique     L'application continue
critique
  -------------------------------------------------------------------------

------------------------------------------------------------------------

# Endpoint de health

Toutes les applications exposent un endpoint :

    GET /health

Cet endpoint retourne l'état des dépendances.

Exemple :

``` json
{
  "status": "degraded",
  "timestamp": "2026-03-05T10:15:00Z",
  "dependencies": {
    "redis": { "status": "down" },
    "ds": { "status": "up" },
    "hub": { "status": "up" },
    "s3": { "status": "up" }
  },
  "info": {
    "version": "1.3.0",
    "environment": "production"
  }
}
```

Le rôle du endpoint `/health` est uniquement **informatif** :

-   il expose l'état des dépendances
-   il n'influence pas directement le comportement de l'application

La décision d'arrêter l'application est prise exclusivement par le
**Dependency Supervisor**.

------------------------------------------------------------------------

# Conséquences

Cette architecture apporte plusieurs avantages :

-   comportement cohérent entre toutes les applications
-   surveillance centralisée des dépendances
-   arrêt automatique des workers en cas de panne critique
-   meilleure observabilité via `/health`
-   architecture simple et extensible pour de nouvelles dépendances

Elle permet également d'ajouter facilement de nouvelles dépendances sans
modifier l'architecture globale.
