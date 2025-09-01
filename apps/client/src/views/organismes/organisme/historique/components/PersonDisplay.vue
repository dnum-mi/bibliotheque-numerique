<script setup lang="ts">
import { dateToStringFr } from '@/utils'
import type { Person } from '@biblio-num/shared'
import { roleDictionary } from '@biblio-num/shared'

const props = defineProps<{
  person: Person | null | undefined
}>()

const fullName = computed(() => {
  if (!props.person) {
    return ''
  }
  return `${props.person.civility || ''} ${props.person.firstName} ${props.person.lastName}`
})

const role = computed(() => {
  if (!props.person || !props.person.role) {
    return ''
  }
  return roleDictionary[props.person.role as keyof typeof roleDictionary] || props.person.role
})
</script>

<template>
  <div
    v-if="person"
    class="w-full overflow-hidden p-3"
  >
    <div class="flex justify-between items-center gap-1">
      <h3 class="fr-text--md fr-text--bold mb-1!">
        {{ fullName }}
      </h3>
      <DsfrBadge
        v-if="person.isFounder"
        label="Fondateur"
        no-icon
        small
        type="info"
      />
    </div>

    <div class="details-grid">
      <div
        v-if="person.jobPosition"
        class="flex flex-col"
      >
        <span class="bn-fiche-sub-title--label uppercase">Poste</span>
        <span class="fr-text--bold fr-text--sm mb-1!">{{ person.jobPosition }}</span>
      </div>
      <div
        v-if="person.profession"
        class="flex flex-col"
      >
        <span class="bn-fiche-sub-title--label uppercase">Profession</span>
        <span class="fr-text--bold fr-text--sm mb-1!">{{ person.profession }}</span>
      </div>
      <div
        v-if="person.role"
        class="flex flex-col"
      >
        <span class="bn-fiche-sub-title--label uppercase">Rôle</span>
        <span class="fr-text--bold fr-text--sm mb-1!">{{ role }}</span>
      </div>
      <div
        v-if="person.entryDate"
        class="flex flex-col"
      >
        <span class="bn-fiche-sub-title--label uppercase">Date d'entrée</span>
        <span class="fr-text--bold fr-text--sm mb-1!">{{ dateToStringFr(person.entryDate) }}</span>
      </div>
      <div
        v-if="person.exitDate"
        class="flex flex-col"
      >
        <span class="bn-fiche-sub-title--label uppercase">Date de sortie</span>
        <span class="fr-text--bold fr-text--sm mb-1!">{{ dateToStringFr(person.exitDate) }}</span>
      </div>
      <div
        v-if="person.nationality"
        class="flex flex-col"
      >
        <span class="bn-fiche-sub-title--label uppercase">Nationalité</span>
        <span class="fr-text--bold fr-text--sm mb-1!">{{ person.nationality }}</span>
      </div>
      <div
        v-if="person.bornAt"
        class="flex flex-col"
      >
        <span class="bn-fiche-sub-title--label uppercase">Né(e) le</span>
        <span class="fr-text--bold fr-text--sm mb-1!">{{ dateToStringFr(person.bornAt) }} à {{ person.bornPlace || 'N/A' }}</span>
      </div>
      <div
        v-if="person.address.dsStringValue"
        class="flex flex-col"
      >
        <span class="bn-fiche-sub-title--label uppercase">Adresse</span>
        <span class="fr-text--bold fr-text--sm mb-1!">{{ person.address.dsStringValue }}</span>
      </div>
      <div
        v-if="person.residenceCountry"
        class="flex flex-col"
      >
        <span class="bn-fiche-sub-title--label uppercase">Pays de résidence</span>
        <span class="fr-text--bold fr-text--sm mb-1!">{{ person.residenceCountry }}</span>
      </div>
    </div>
  </div>

  <div
    v-else
    class="person-placeholder"
  >
    <span class="fr-text--sm fr-text--italic">Aucune information sur la personne</span>
  </div>
</template>

<style scoped>
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.1rem;
  padding: 0.5rem;
}
</style>
