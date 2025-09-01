# Projet utilisant Vite, Vue 3 et VueDsfr

## Faire tourner le projet

### Installer les dépendances

```
npm install
```

### Lancer le projet en mode développement

```
npm run dev
```

## Générer le code de production

```
npm run build
```

## Voir l'application avec le code de production

```
npm run preview
```

## Déployer le code de production

Déployer le contenu du dossier `dist` après avoir généré le code de production.

### Vérifier la syntaxe et le formattage avec [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Exécuter les tests

### Exécuter les tests unitaires avec [Vitest](https://vitest.dev/)

```
npm run test:unit
```
### Exécuter les tests de composants avec [Cypress](https://www.cypress.io/)

#### Avec une interface graphique
```
npm run test:ct
```

#### Sans interface graphique (pour la CI)

```
npm run test:ct:ci
```

### Exécuter les tests de bout en bout avec [Cypress](https://www.cypress.io/)

#### Avec une interface graphique

```
npm run test:e2e
```

#### Avec une interface graphique

```
npm run test:e2e:ci
```
