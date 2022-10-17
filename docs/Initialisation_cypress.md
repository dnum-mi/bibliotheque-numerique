# Cypress


---
## L'installaton cypress pour le client


### Initialisation cypress
Mis à jours eslint-config-standard-with-typescript
```
npm install eslint-config-standard-with-typescript@23.0.0
```
Output:
```
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@gouvminint/vue-dsfr@1.4.0',
npm WARN EBADENGINE   required: { node: '>=17.x.x', npm: '8.x.x' },
npm WARN EBADENGINE   current: { node: 'v16.17.0', npm: '8.15.0' }
npm WARN EBADENGINE }

added 11 packages, removed 9 packages, changed 5 packages, and audited 828 packages in 19s

128 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```
Installer cypress 10.10.0
```
npm install cypress@10.10.0 --save-dev
```
Output:
```
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@gouvminint/vue-dsfr@1.4.0',
npm WARN EBADENGINE   required: { node: '>=17.x.x', npm: '8.x.x' },
npm WARN EBADENGINE   current: { node: 'v16.17.0', npm: '8.15.0' }
npm WARN EBADENGINE }
(##################) ⠧ reify:cypress: timing reifyNode:node_modules/cypress/node_modules/semver Completed in 58ms

changed 3 packages, and audited 828 packages in 2m

128 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

```

### Lancer le cypress
```
npm run test:ct
# ou
npx cypress open
```

### Launchpad
https://docs.cypress.io/guides/getting-started/opening-the-app#The-Launchpad


### La configuration du cypress
https://docs.cypress.io/guides/getting-started/opening-the-app#Quick-Configuration