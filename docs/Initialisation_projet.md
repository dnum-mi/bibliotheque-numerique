# Biblio-num


---
## La creation du client


### Initialisation avec Vue-DSfr
```
npm init vue-dsfr
```
Output:
```
Need to install the following packages:
create-vue-dsfr@1.3.1
Ok to proceed? (y) y
✔ Nom du projet: … biblio-num-client
✔ Liste disponible : › Vue 3
✔ Select a variant: › vue3-ts

Scaffolding project in /Users/pf/workspace/github/LAB-MI/biblio-num/biblio-num-client...

Done. Now run:
```


### Renommer la répertoire du client
```
mv biblio-num-client client
```


### Initialisation client
```
cd client
npm install --legacy-peer-deps
```


### Lancer le client
```
npm run dev
```
Output:
```
> biblio-num-client@0.0.0 dev
> vite

vite v2.9.15 dev server running at:

> Local: http://localhost:3000/
> Network: use `--host` to expose

ready in 571ms.
```


---

## La creation du serveur


### Initialisation avec NestJS
```
npm i -g @nestjs/cli
nest new server
```
Output:
```
⚡  We will scaffold your app in a few seconds..

CREATE server/.eslintrc.js (665 bytes)
CREATE server/.prettierrc (51 bytes)
CREATE server/README.md (3340 bytes)
CREATE server/nest-cli.json (118 bytes)
CREATE server/package.json (1991 bytes)
CREATE server/tsconfig.build.json (97 bytes)
CREATE server/tsconfig.json (546 bytes)
CREATE server/src/app.controller.spec.ts (617 bytes)
CREATE server/src/app.controller.ts (274 bytes)
CREATE server/src/app.module.ts (249 bytes)
CREATE server/src/app.service.ts (142 bytes)
CREATE server/src/main.ts (208 bytes)
CREATE server/test/app.e2e-spec.ts (630 bytes)
CREATE server/test/jest-e2e.json (183 bytes)

? Which package manager would you ❤️  to use? npm
✔ Installation in progress... ☕

🚀  Successfully created project server
👉  Get started with the following commands:
```


### Lancer le serveur
```
$ cd server
$ npm run start
```

Attention la base de données doit être lancer. Vérifier si les variables dans src/app.module.ts soit correct pour permettre la connection à la BDD.

### Lancer le serveur avec Docker
```
$ cd server
$ npm run docker:dev
```
#### Si besoin d'attacher les logs
```
$ npm run docker:logs
```
Pour les logs de la bases de données :
```
$ npm run docker:logs:db
```
### Lancer le script pour récupérer les démarches
```
$ cd server
$ npm run sync:demarches
```
