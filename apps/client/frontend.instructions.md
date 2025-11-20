# frontend.instructions.md

## 🎯 Objectif
Ces instructions concernent le **frontend** de l’application, développé en **Vue 3 + TypeScript** avec la **Composition API**.  
Le but est de produire un code clair, typé et cohérent, en suivant les conventions du projet.

---

## ⚙️ Vue 3 & Composition API

- Toujours utiliser `<script setup lang="ts">`.
- Importer les helpers directement depuis `vue` (`ref`, `computed`, `watch`, `onMounted`, etc.).
- Préférer les composables pour partager la logique réutilisable.
- Définir les props et emits avec `defineProps` / `defineEmits` **et** leurs types explicites.
- Ne pas utiliser `this` dans les composants.
- Les composants doivent être déclarés avec des noms explicites (`UserCard.vue`, `Navbar.vue`, etc.).
- Préférer les computed properties aux watchers quand c’est possible.
- Ne jamais muter directement les props, et utiliser `defineModel` si besoin

---

## 🧱 Structure et conventions

- Un composant = un fichier `.vue` dans `src/components/`.
- Les fichiers de pages (routes) vont dans `src/views/`.
- Les composables vont dans `src/composables/` et commencent par `use` (ex : `useUser.ts`).
- Les stores Pinia sont dans `src/stores/`, avec un nom clair et un type de retour.
- Les assets (images, icônes, styles) sont organisés sous `src/assets/`.

---

## 🧪 Tests

- Les tests des composants utilisent **Vitest + Vue Test Utils**.
- Les fichiers de tests se nomment `ComponentName.spec.ts`.
- Toujours tester :
  - Les props obligatoires.
  - Les événements émis (`emit`).
  - Les comportements principaux (rendu, interactions).

---

## 🧠 Bonnes pratiques UX/UI

- Ne jamais mélanger la logique métier dans les composants d’UI.
- Utiliser UnoCSS (avec le preset Tailwind CSS / windi) ou un système de design cohérent.
- Toujours penser responsive et accessibilité (ARIA).
- Préférer les composants atomiques à la duplication de code.
- Si un composant dépasse 200 lignes, envisager de le découper.

---

## 💬 Pour Copilot Chat

- Si l’utilisateur demande un nouveau composant, proposer un squelette complet :
  - `<script setup lang="ts">`
  - `<template>` minimal mais fonctionnel
  - Types explicites
- Si l’utilisateur demande une amélioration, suggérer une refactorisation via composables ou props mieux typées.
