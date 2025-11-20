# copilot-instructions.md

## 🎯 Objectif

Ces instructions guident Copilot pour générer un code cohérent avec les conventions du projet.
Le projet utilise **Vue 3 (Composition API)**, **TypeScript strict**, **Fastify** côté serveur, et **ESM** comme module system.

---

## 🧱 Règles générales

- Toujours utiliser **TypeScript** (pas de JavaScript pur).
- Activer les **types stricts** : `strict: true` dans `tsconfig.json`.
- Ne jamais utiliser `any`, `as unknown`, ou les assertions de type non justifiées.
- Préférer les **types explicites** aux inférences implicites si cela améliore la lisibilité.
- Toujours suivre les conventions ESLint du projet : **Airbnb + Prettier**.
- Les imports doivent être **ESM** (`import` / `export`) — pas de `require`.
- Toujours penser en **code modulaire**, éviter les fonctions globales.
- Les noms de variables et fonctions doivent être clairs, descriptifs et en anglais.

---

## 🖼️ Frontend (Vue 3)

- Toujours utiliser la **Composition API** (`<script setup>`).
- Préférer les **composables** pour factoriser la logique (dans `src/composables/`).
- Respecter les conventions de nommage :
  - Composants : `PascalCase`
  - Props / emits : `camelCase`
- Tous les composants doivent être typés (`defineProps`, `defineEmits` avec interfaces ou `zod`).
- Utiliser `ref` et `computed` de manière déclarative et concise.
- Préférer **Pinia** pour le store global (si besoin).
- Les tests unitaires doivent être écrits avec **Vitest**.

### Exemple attendu

```ts
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCounterStore } from '@/stores/counter'

const count = ref(0)
const double = computed(() => count.value * 2)

const store = useCounterStore()

function increment() {
  count.value++
  store.logAction('increment')
}
</script>
```

---

## 🧪 Tests

- Utiliser **Vitest** pour les tests unitaires et d'intégration.
- Ne jamais mocker inutilement — préférer les doubles simples.
- Couvrir la logique critique, surtout les `utils` et `services`.

## 🧭 Documentation & commentaires

- Ajouter un JSDoc clair sur les fonctions publiques ou les utilitaires partagés.
- Expliquer le _pourquoi_ plus que le _comment_ dans les commentaires.
- Préférer les docblocks structurés à des commentaires inline dispersés.

## 🧠 Style et lisibilité

- Préférer la clarté au "clever code".
- Éviter les raccourcis ou la micro-optimisation prématurée.
- Toujours nommer les fonctions selon leur intention (`getUserProfile` plutôt que `fetchData`).

## 💬 Pour Copilot Chat

Quand l’utilisateur demande :

- "Explique ce code" → Fournir une explication pédagogique claire, sans jargon excessif.
- "Refactorise" → Proposer une version plus claire, typée et conforme aux règles ci-dessus.
- "Ajoute des tests" → Générer des tests Vitest minimalistes et lisibles.
- "Ajoute la doc" → Produire du JSDoc complet et concis.
