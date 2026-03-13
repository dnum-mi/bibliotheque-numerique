# DEV Best Practices

## About

Documentation de l'équipe SIAF sur les best practices, règles et syntax à utiliser pour les équieps de development

## 1. Git

### Branch naming

Les branches doivent suivre la convention :

```
<ticket-id>/<type>/<short-description>
```

Exemples :

```
1234/feat/add-user-search
1234/fix/login-error
1234/chore/update-dependencies
```

Types autorisés :

- `feat` : nouvelle fonctionnalité
- `fix` : correction de bug
- `chore` : maintenance technique (dépendances, refactor sans impact fonctionnel, tooling…)

Règles :

- le nom de la branche est en **anglais**
- les mots sont séparés par `-` (kebab-case)
- la description doit être **courte et claire**


kebabcase: salade-tomate-oignong
camel case: saladeTomateOignon
snake case: salade_tomate_oignon
//TODO: ajouter la regle parenthese pour plusieur chapitre d'une meme feat

---

## 2. Javascript / Typescript

Ce chapitre définit les règles de nommage et les bonnes pratiques à respecter dans le code Javascript / Typescript du projet.

L'objectif est d'assurer :

- une lisibilité immédiate du code
- une cohérence entre tous les développeurs
- une compréhension rapide des types manipulés

---

### Nomenclature

#### Variables

Les variables doivent être nommées de manière explicite.

##### Boolean

Les booléens doivent être préfixés pour indiquer clairement leur nature.

Exemples :

```
isUserActive
isToto
hasPermission
doesTotoExist
```

---

##### Dates

Les dates doivent se terminer par `At`.

```
createdAt
updatedAt
deletedAt
totoAt
```

---

##### Tableaux

Les tableaux doivent être au pluriel.

```
users
totos
books
```

---

##### Tableaux d'identifiants

Un tableau contenant uniquement des identifiants doit se terminer par `Ids`.

```
userIds
totoIds
bookIds
```

---

##### Tableaux d'identifiants liés

Si les identifiants concernent une relation avec un autre objet :

```
totoCarIds
userRoleIds
bookAuthorIds
```

Structure :

```
objet + relation + Ids
```

---

##### Tableaux de propriétés spécifiques

Exemple :

```
totoBookAuthorNames
```

Structure :

```
objet + relation + propriété
```

---

#### Types

Les types doivent être préfixés pour être identifiables immédiatement.

```
iToto      -> interface
eToto      -> enum
tToto      -> type
Toto       -> class
```

Exemples :

```
interface iUser
enum eUserRole
type tUserPayload
class User
```

---

#### Fonctions

Le nom d'une fonction doit indiquer clairement ce qu'elle retourne.

##### Fonctions retournant un boolean

Préfixes recommandés :

```
is
does
has
can
```

Exemples :

```
isUserAdmin()
doesTotoExist()
hasPermission()
```

---

##### Getters

Les fonctions retournant une donnée doivent commencer par `get` ou `find`.

```
getUser()
getTotoIds()
getUserPermissions()
findUserCar()
```

---

#### Fonctions privées

Les fonctions privées doivent commencer par `_`.

Exemples :

```
private _computeUserScore()
private _validateInput()
private _buildPayload()
```

Cela permet d'identifier immédiatement les fonctions internes à une classe.

---

### Mutation des objets

Javascript manipule les objets par référence. Une mutation peut donc produire des effets de bord difficiles à détecter.

La mutation directe doit être évitée autant que possible.

#### Mauvaise pratique

```javascript
user.name = "Toto"
user.age = 30
```

---

#### Bonne pratique

Créer un nouvel objet :

```javascript
const updatedUser = {
  ...user,
  name: "Toto",
  age: 30
}
```

---

#### Principe

Toujours privilégier :

```
immutabilité > mutation
```

---

### Ne pas modifier les objets source

Les fonctions ne doivent pas modifier les objets reçus en paramètre.

Une fonction doit être **pure autant que possible** :

- elle reçoit des données
- elle retourne un nouveau résultat
- elle ne modifie pas les objets existants

#### Mauvaise pratique

```javascript
function modifySourceObject(user) {
  user.name = "Toto"
  return user
}
```

Ce type de code modifie directement l'objet passé en paramètre et peut produire des effets de bord difficiles à détecter.

---

#### Bonne pratique

Créer un nouvel objet :

```javascript
function updateUserName(user, name) {
  return {
    ...user,
    name
  }
}
```

Cette approche permet :

- d'éviter les effets de bord
- de rendre le code plus prévisible
- de faciliter le debugging


---

## 3. NestJS

Ce chapitre décrit les conventions utilisées dans les projets NestJS de l'équipe.

L'objectif est d'avoir une architecture cohérente, lisible et facilement navigable dans tous les modules.

//TODO: architecture de repertoire (#shared)

---

### Organisation par module

Le code est organisé **par module fonctionnel**.

Chaque module représente un domaine métier.

Exemples :

- `users`
- `cars`
- `demarches`

---

### Structure d'un module

À l'intérieur d'un module, le code est organisé dans les dossiers suivants :

```
controllers/
providers/
objects/
```

---

### Dossier objects

Le dossier `objects` contient les structures de données du module :

```
types/
dtos/
sub-object/cars
```

les entités sont à la racine. Type contient les interfaces, types, enums.
dtos contient les class DTO.

---

### DTO

On évite au maximum de réécrire les DTO.

Les DTO doivent être générés à partir des entités avec `PickType` de `@nestjs/mapped-types`.

`OmitType` doit être évité.

Raison :

Si un champ est ajouté dans l'entité, un DTO basé sur `OmitType` changera automatiquement et pourra exposer des données non souhaitées.

Avec `PickType`, seuls les champs explicitement sélectionnés sont exposés.

---

### Définition des clés utilisées par PickType

La liste des clés utilisées dans `PickType` doit être stockée dans une constante dans le même fichier.

Exemple :

```typescript
export const carDtoKeys = [
  'id',
  'name',
  'brand'
] as const satisfies (keyof CarEntity)[]
```

Cela permet :

- de réutiliser ces clés dans les services
- de les utiliser dans les sélections de base de données
- d'éviter les divergences entre DTO et requêtes

---

### Controllers

Les controllers sont **nommés au pluriel**.

Exemples :

```
CarsController
UsersController
DemarchesController
```

Les routes respectent la convention REST :

```
GET /cars
GET /cars/:id
DELETE /cars/:id
PATCH /cars/:id
```

---

### Sous-controllers

Lorsqu'une ressource dépend d'une autre ressource, on crée un sous-controller.

Exemple :

```
demarches/:id/dossiers
```

Dans ce cas :

- un interceptor est appliqué au controller
- cet interceptor récupère la ressource parente
- la ressource est injectée dans la requête

Un décorateur permet ensuite d'y accéder facilement.

Exemple :

```
@CurrentDemarche()
```

---

### DTO partagés avec le front

Dans les projets RAF et BN :

Les DTO implémentent des interfaces définies dans une bibliothèque partagée.

Exemple :

```
iSmallTotoDto
```

Cela permet :

- au front de connaître exactement le type retourné par l'API
- de garantir la cohérence entre backend et frontend

Les DTO qui sont **strictement internes au backend** peuvent être exclus de cette règle.

---

### Gestion des erreurs

Les `try/catch` doivent être évités au maximum.

Pour les erreurs HTTP attendues, on utilise des **interceptors dédiés**.

Chaque type d'erreur attendu doit avoir son interceptor spécifique qui transforme l'erreur métier en erreur HTTP.

---

### Logging

Le `LoggerService` doit être injecté dans chaque controller et provider.

Le contexte du logger doit être défini avec le nom de la classe dans le constructeur:

```typescript
this.logger.setContext(this.constructor.name)
```

Chaque fonction importante doit commencer par un log :

```typescript
this.logger.verbose('nomDeLaFonction')
```

//TODO: on peut automatiser ça?

Cela permet :

- de suivre facilement l'exécution du code
- de faciliter le debug
- de comprendre rapidement le parcours d'une requête

---

## 4. Vue.js

Ce chapitre définit les conventions utilisées pour l'organisation du code Vue dans les projets front.

L'objectif est de garantir :

- une architecture claire
- un layout cohérent dans toute l'application
- un code maintenable
- le respect des règles d'accessibilité

Ces règles doivent être respectées dans toutes les nouvelles fonctionnalités et progressivement lors des refactors.

---

### Architecture générale

Structure recommandée du projet :

```
src/

layouts/
views/
components/
stores/
styles/
```

Responsabilités :

- `layouts/` : structure des pages
- `views/` : vues associées aux routes
- `components/` : composants réutilisables
- `stores/` : gestion des données avec Pinia
- `styles/` : styles globaux et variables

---

### Gestion des données

Toutes les données applicatives doivent être centralisées dans des **stores Pinia**.

Les stores sont situés dans :

```
stores/
```

Règles :

- les appels API doivent être réalisés dans les stores
- les composants ne doivent pas appeler directement l'API
- les stores sont responsables de la gestion de l'état

---

### Organisation des vues

//TODO: les class créé dans bn devrait être bn-my-class

Les vues doivent respecter la hiérarchie des routes et être organisées dans :

```
views/
```

Exemple :

```
views/
  mapper/
    MapperView.vue
```

Les vues servent uniquement à :

- charger les données
- orchestrer les composants
- afficher le contenu

Les vues **ne doivent pas contenir de CSS**.

---

### Sous-composants d'une vue

Si une vue contient des sous-composants spécifiques, ils doivent être placés dans un dossier `components` local.

Exemple :

```
views/
  mapper/
    MapperView.vue
    components/
      OngletConfiguration.vue
      OngletPreview.vue
      OngletHistory.vue
```

Cette organisation peut être répétée autant de fois que nécessaire.

---

### Composants réutilisables

Tous les composants réutilisables doivent être placés dans :

```
components/
```

Même si un composant ne contient qu'un seul fichier, il doit être placé dans son propre dossier.

---

### Layout de l'application

Les pages de l'application suivent une structure unique :

```
Header (toujours visible)
Context Banner (optionnel)
Page Content (scrollable)
Micro Footer (toujours visible)
```

Cette structure est implémentée dans les layouts.

Exemple de structure :

```
layouts/
  AppLayout.vue
  PageLayout.vue
```

Règle importante :

**Une vue ne définit jamais son layout.**

Le layout est responsable de la structure de la page.

---

### Gestion du scroll

Le scroll est géré uniquement par le layout.

Les pages ne doivent jamais gérer elles-mêmes le scroll.

Par défaut le contenu est scrollable.

Dans le cas des pages contenant une DataTable BN, le scroll de la page doit être désactivé afin d'éviter un double scroll.

Exemple :

```vue
<PageLayout :scrollable="false">
  <BnDataTable />
</PageLayout>
```

---

### Utilisation de DSFR

DSFR doit être utilisé pour l'apparence et les composants UI :

- boutons
- formulaires
- typographie
- couleurs

Les layouts de l'application ne doivent **pas dépendre de DSFR**, car DSFR est conçu pour des sites web et non pour des applications métier complexes.

---

### Organisation des styles

Les styles globaux doivent être centralisés dans :

```
styles/
```

Exemples :

```
styles/
  tokens.css
  layout.css
  typography.css
```

Les valeurs récurrentes doivent être définies sous forme de variables CSS.

Exemple :

```css
:root {
  --space-xs: 4px;
  --space-s: 8px;
  --space-m: 16px;
  --space-l: 24px;
}
```

Tous les espacements, tailles de police et dimensions doivent utiliser ces variables.

Les valeurs arbitraires dans les composants doivent être évitées.

---

### Responsive

L'application est optimisée pour des écrans d'environ **720px de hauteur**.

Les règles responsive doivent être définies **uniquement dans les fichiers globaux de styles**.

Les media queries sont interdites dans les composants.

Exemple :

```css
@media (max-height: 720px) {
  .page-content {
    padding: 8px;
  }
}
```

---

### CSS dans les composants

Il doit y avoir **très peu de CSS dans les composants**.

Les composants ne doivent pas définir :

- la structure de layout
- les espacements globaux
- les tailles typographiques

Ces règles doivent être définies dans `styles/`.

---

### Classes utilitaires

Les classes utilitaires (type Tailwind ou équivalent) doivent être utilisées avec modération.

Elles peuvent être utilisées dans les composants UI mais doivent être évitées dans les vues afin de préserver la cohérence du layout.

---

### Positionnement absolu

Le positionnement `absolute` doit être évité.

Il est autorisé uniquement pour :

- tooltips
- dropdowns
- overlays

---

### Accessibilité

Le HTML doit respecter les règles d'accessibilité.

Règles principales :

- respecter l'ordre des titres (`h1`, `h2`, `h3`, etc.)
- ne pas utiliser les balises de titre uniquement pour leur taille
- toutes les images doivent avoir un attribut `alt`
- les formulaires doivent utiliser correctement `label` et `for`

---

//TODO: conseillé wave => addon accessibilité


//TODO: combien de ces règles peut-on ajouter dans notre eslint

// fichier de mille ligne

//TODO: les erreurs doivent être en français
