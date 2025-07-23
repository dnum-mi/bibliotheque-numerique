<script setup lang="ts">
import { computed } from 'vue'
import PersonDisplay from './PersonDisplay.vue'
import type { Person } from '@biblio-num/shared'

const props = defineProps<{
  title: string
  currentPersons: Person[]
  previousPersons: Person[]
}>()

const personsDiff = computed(() => {
  const createPersonKey = (p: Person) => `${p.lastName}-${p.firstName}-${p.bornAt}`.toLowerCase()

  const allPersonsMap = new Map<string, { current?: Person; previous?: Person }>()

  for (const person of props.currentPersons) {
    const key = createPersonKey(person)
    allPersonsMap.set(key, { current: person })
  }

  for (const person of props.previousPersons) {
    const key = createPersonKey(person)
    const entry = allPersonsMap.get(key) || {}
    entry.previous = person
    allPersonsMap.set(key, entry)
  }

  const result = []
  for (const [key, { current, previous }] of allPersonsMap.entries()) {
    let status: 'added' | 'removed' | 'unchanged' | 'modified' = 'unchanged'

    if (current && !previous) {
      status = 'added'
    } else if (!current && previous) {
      status = 'removed'
    } else if (JSON.stringify(current) !== JSON.stringify(previous)) {
      status = 'modified'
    }

    result.push({
      key,
      person: current || previous,
      status,
    })
  }

  return result
})
</script>

<template>
  <div class="field-container">
    <label class="block uppercase fr-text--xs fr-text--bold mb-4!">{{ title }}</label>
    <div class="flex flex-col gap-2">
      <div
        v-for="item in personsDiff"
        :key="item.key"
        class="person-list-item"
        :class="`person--${item.status}`"
      >
        <PersonDisplay :person="item.person" />
      </div>
      <div
        v-if="personsDiff.length === 0"
        class="fr-text--sm fr-text--italic p-3"
      >
        Aucune personne dans les deux versions.
      </div>
    </div>
  </div>
</template>

<style scoped>
.field-container {
  grid-column: 1 / -1;
  padding: 0.75rem;
  border-top: 1px solid var(--grey-925-125);
}

.person-list-item {
  border-left: 4px solid transparent;
  transition:
    background-color 0.2s ease-in-out,
    border-color 0.2s ease-in-out;
  padding-left: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
}

.person--added {
  border-left-color: var(--success-425-625-active);
  background-color: var(--success-975-75);
}

.person--removed {
  border-left-color: var(--red-marianne-425-625);
  background-color: var(--red-marianne-975-75);
}

.person--modified {
  border-left-color: var(--yellow-tournesol-925-125-active);
  background-color: var(--yellow-tournesol-975-75);
}
</style>
