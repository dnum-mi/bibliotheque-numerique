# Guide de contribution — Bibliothèque Numérique

Merci de l'intérêt que vous portez au projet **Bibliothèque Numérique** !
Ce document décrit les règles et bonnes pratiques à suivre pour contribuer au dépôt [`dnum-mi/bibliotheque-numerique`](https://github.com/dnum-mi/bibliotheque-numerique).

---

## Table des matières

1. [Code de conduite](#1-code-de-conduite)
2. [Prérequis](#2-prérequis)
3. [Configurer l'environnement de développement](#3-configurer-lenvironnement-de-développement)
4. [Structure du dépôt](#4-structure-du-dépôt)
5. [Flux de contribution (Git Flow)](#5-flux-de-contribution-git-flow)
6. [Convention de nommage des branches](#6-convention-de-nommage-des-branches)
7. [Convention de messages de commit](#7-convention-de-messages-de-commit)
8. [Ouvrir une Pull Request](#8-ouvrir-une-pull-request)
9. [Signaler un bug ou proposer une fonctionnalité](#9-signaler-un-bug-ou-proposer-une-fonctionnalité)
10. [Standards de code](#10-standards-de-code)
11. [Tests](#11-tests)
12. [Versionnage et releases](#12-versionnage-et-releases)
13. [Contact](#13-contact)

---

## 1. Code de conduite

Ce projet est régi par la licence **Apache 2.0**.
Tout contributeur s'engage à respecter un environnement de travail bienveillant, inclusif et professionnel.

---

## 2. Prérequis

Avant de contribuer, assurez-vous d'avoir installé les outils suivants :

| Outil | Usage | Lien |
|---|---|---|
| **Docker** | Exécution des services (tous modes) | [docs.docker.com](https://docs.docker.com/get-docker/) |
| **Node.js** | Environnement d'exécution (développement) | [nodejs.org](https://nodejs.org/en/download/) |
| **pnpm** | Gestionnaire de paquets & workspaces | [pnpm.io](https://pnpm.io/installation) |
| **Turbo** | Outil de monorepo | [turbo.build](https://turbo.build/repo/docs) |
| **Git** | Gestion de versions | [git-scm.com](https://git-scm.com/) |

Vous aurez également besoin d'un **jeton d'authentification pour l'API Démarche-Numérique** :
→ [Générer un jeton d'accès](https://doc.demarches-simplifiees.fr/api-graphql/jeton-dauthentification)

---

## 3. Configurer l'environnement de développement

### Étape 1 — Forker le dépôt

Sur GitHub, rendez-vous sur [`dnum-mi/bibliotheque-numerique`](https://github.com/dnum-mi/bibliotheque-numerique) et cliquez sur **Fork** pour créer une copie du dépôt sur votre compte personnel.

### Étape 2 — Cloner votre fork en local

```bash
# Cloner votre fork (remplacer <votre-pseudo> par votre identifiant GitHub)
git clone https://github.com/<votre-pseudo>/bibliotheque-numerique.git
cd bibliotheque-numerique

# Ajouter le dépôt officiel BN comme remote "upstream"
# Cela vous permettra de rester synchronisé avec les évolutions du projet
git remote add upstream https://github.com/dnum-mi/bibliotheque-numerique.git

# Vérifier vos remotes
git remote -v
# origin    https://github.com/<votre-pseudo>/bibliotheque-numerique.git (fetch/push)
# upstream  https://github.com/dnum-mi/bibliotheque-numerique.git (fetch/push)
```

### Étape 3 — Installer les dépendances

```bash
pnpm install
```

### Étape 4 — Lancer en mode développement

> 📄 Consulter [`docs/Developpement/development.md`](./docs/Developpement/development.md) pour le détail complet du lancement en mode développement.

---

## 4. Structure du dépôt

```
bibliotheque-numerique/
├── apps/              # Applications (frontend Vue, backend NestJS, etc.)
├── packages/shared/   # Code partagé entre les apps (monorepo)
├── docs/              # Documentation technique
│   ├── Architecture.md
│   ├── Developpement/
│   ├── Pagination des Dossiers/
│   ├── Structure du Code/
│   └── Synchronisation/
├── docker/            # Fichiers Docker et docker-compose
├── ci/                # Configuration CI/CD
├── bin/               # Scripts de démarrage
└── patches/           # Patches de paquets tiers
```

---

## 5. Flux de contribution

Le workflow repose sur le modèle **Fork & Pull Request** :

```
dnum-mi/bibliotheque-numerique (dépôt officiel BN)
        ↑ Pull Request
<votre-pseudo>/bibliotheque-numerique (votre fork GitHub)
        └── 42/feature/ma-fonctionnalite  ← votre branche de travail
```

### Étapes complètes

```
1. Forker le dépôt BN sur votre compte GitHub (bouton "Fork")
2. Cloner votre fork en local
3. Créer une branche à partir de main (voir convention section 6)
4. Développer et commiter sur cette branche
5. Pousser la branche sur votre fork GitHub
6. Ouvrir une Pull Request depuis votre fork → dnum-mi/bibliotheque-numerique
```

**Règles :**

- Ne **jamais** commiter directement sur `main`.
- Tout le développement se fait sur **votre fork**, dans une branche dédiée.
- Mettre à jour sa branche depuis `upstream/main` avant d'ouvrir une PR :

```bash
git fetch upstream
git rebase upstream/main
```

---

## 6. Convention de nommage des branches

```
<numéro-issue>/<type>/<description-courte-en-kebab-case>
```

| Segment | Description |
|---|---|
| `<numéro-issue>` | Numéro de l'issue GitHub associée (obligatoire) |
| `<type>` | Nature du changement (voir tableau ci-dessous) |
| `<description>` | Résumé court en kebab-case (minuscules, tirets) |

### Types de branches

| Type | Usage |
|---|---|
| `feature` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `chore` | Tâche technique (config, dépendances…) |
| `docs` | Documentation uniquement |
| `refactor` | Refactorisation sans changement fonctionnel |
| `test` | Ajout ou modification de tests |

### Exemples

```
42/feature/ajout-export-pdf
17/fix/correction-pagination-dossiers
8/docs/mise-a-jour-readme
103/chore/upgrade-turbo-v2
56/refactor/restructuration-service-auth
```

### Créer et pousser une branche

```bash
# Se synchroniser avec le dépôt officiel avant de créer une branche
git fetch upstream
git checkout -b 42/feature/ajout-export-pdf upstream/main

# ... développement ...

# Pousser sur votre fork (origin)
git push origin 42/feature/ajout-export-pdf
```

---

## 7. Convention de messages de commit

Ce projet utilise **Conventional Commits** (enforced par `commitlint` + `husky`).
Tout commit non conforme sera **rejeté automatiquement**.

### Format

```
<type>(<scope optionnel>): <description courte en minuscules>

[corps optionnel]

[footer optionnel — ex: BREAKING CHANGE: ...]
```

### Types autorisés

| Type | Description |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Modification de documentation uniquement |
| `style` | Formatage, espaces (pas de changement logique) |
| `refactor` | Refactorisation sans ajout de fonctionnalité ni correction |
| `test` | Ajout ou modification de tests |
| `chore` | Maintenance, configuration, dépendances |
| `perf` | Amélioration de performance |
| `ci` | Modification de la configuration CI/CD |
| `revert` | Annulation d'un commit précédent |

### Exemples

```bash
# ✅ Correct
git commit -m "feat(auth): ajout de la connexion via SSO"
git commit -m "fix(pagination): correction du calcul de l'offset"
git commit -m "docs: mise à jour du guide de contribution"
git commit -m "chore: mise à jour de turbo vers la v2"

# ❌ Incorrect (sera rejeté par commitlint)
git commit -m "fix bug"
git commit -m "WIP"
git commit -m "Mise à jour"
```

---

## 8. Ouvrir une Pull Request

Une fois votre développement terminé sur votre fork, ouvrez une Pull Request vers le dépôt officiel BN.

### Procédure

1. **S'assurer que les tests passent** localement avant d'ouvrir la PR.
2. **Se synchroniser** avec `upstream/main` pour éviter les conflits :
   ```bash
   git fetch upstream
   git rebase upstream/main
   git push origin 42/feature/ajout-export-pdf --force-with-lease
   ```
3. Sur GitHub, aller sur votre fork `<votre-pseudo>/bibliotheque-numerique`.
4. Cliquer sur **"Compare & pull request"** pour ouvrir une PR vers `dnum-mi/bibliotheque-numerique` (branche `main`).
5. **Remplir la description de la PR** en précisant :
   - Le numéro de ticket et le contexte
   - Les changements effectués
   - Les étapes pour tester
   - Les éventuels impacts (breaking changes, migrations de BDD…)
6. **Lier le ticket** via `Closes #<numéro>` dans la description.
7. Attendre la revue d'au moins **un mainteneur** avant le merge.

> ⚠️ Ne **jamais** ouvrir de PR directement depuis `main` de votre fork. Utilisez toujours une branche dédiée.

### Checklist avant soumission

- [ ] La branche respecte la convention de nommage (`<numéro-issue>/<type>/<description>`)
- [ ] Le code respecte les standards du projet (linting, formatting)
- [ ] Les tests existants passent (`pnpm test`)
- [ ] De nouveaux tests ont été ajoutés si nécessaire
- [ ] La documentation a été mise à jour le cas échéant
- [ ] Les messages de commit respectent la convention Conventional Commits
- [ ] La branche est à jour par rapport à `upstream/main`

---

## 9. Signaler un bug ou proposer une fonctionnalité

### Signaler un bug

Ouvrez une **Issue** GitHub en utilisant le label `bug` et en incluant :

- La version ou le commit concerné
- Les étapes pour reproduire le problème
- Le comportement observé vs. le comportement attendu
- Les logs ou captures d'écran pertinents
- L'environnement (OS, version Node, version Docker…)

### Proposer une fonctionnalité

Ouvrez une **Issue** avec le label `enhancement` en décrivant :

- Le besoin fonctionnel ou le cas d'usage
- La solution envisagée
- Les alternatives considérées

---

## 10. Standards de code

### Formatage

Le projet utilise **Prettier** (configuration dans `.prettierrc`).
Le formatage est appliqué automatiquement via les hooks `husky` au commit.

Pour formater manuellement :
```bash
pnpm format
```

### Linting

```bash
pnpm lint
```

### Éditeur recommandé

Le dossier `.vscode/` contient des recommandations d'extensions et de paramètres pour **Visual Studio Code**.
Installez les extensions recommandées pour bénéficier du formatage automatique à la sauvegarde.

---

## 11. Tests

```bash
# Lancer tous les tests du monorepo
pnpm test

# Lancer les tests d'une app spécifique
pnpm --filter <nom-de-l-app> test
```

Toute nouvelle fonctionnalité ou correction de bug doit être accompagnée des tests correspondants.

---

## 12. Versionnage et releases

Ce projet utilise **Release Please** pour la gestion automatisée des versions et du `CHANGELOG.md`.
Le versionnage suit les principes du **Semantic Versioning (SemVer)** :

| Type de commit | Impact sur la version |
|---|---|
| `fix` | Patch `x.x.+1` |
| `feat` | Mineure `x.+1.0` |
| `BREAKING CHANGE` (footer) | Majeure `+1.0.0` |

Les releases sont générées automatiquement à partir des messages de commit — d'où l'importance de respecter la convention.

---

## 13. Contact

Pour toute question sur le projet ou la procédure de contribution :

- Ouvrez une **Issue** sur le dépôt GitHub
- Consultez la documentation dans le dossier [`docs/`](./docs/)

---
