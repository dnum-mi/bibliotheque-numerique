# rnf-client

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm run dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

Pour le code de dev :

```sh
pnpm run test:e2e:dev
```

Pour le code de prod :

```sh
pnpm run build
pnpm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm run lint
```
