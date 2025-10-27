<script setup lang="ts">
import type { siafV2 } from '@biblio-num/shared'
import { dateToStringFr } from '@/utils'

const props = defineProps<{ persons: siafV2.IPerson[] }>()

const personsByRoles = computed<siafV2.IPerson[]>(() =>
  [...props.persons].sort((a, b) => {
    if (a.isFounder !== b.isFounder) {
      return Number(b.isFounder) - Number(a.isFounder)
    }
    return a.lastName.localeCompare(b.lastName)
  }),
)
</script>

<template>
  <div class="divide-y">
    <div
      v-for="person in personsByRoles"
      :key="person._id"
      class="p-4"
    >
      <div class="flex items-center justify-start gap-4 fr-mb-4w fr-background-alt--grey fr-py-3v fr-px-2w">
        <h3 class="fr-text--md fr-text--bold mb-0!">
          {{ `${person.civility || ''} ${person.firstName} ${person.lastName}` }}
        </h3>
        <DsfrBadge
          v-if="person.isFounder"
          label="Fondateur"
          no-icon
          small
          type="info"
        />
      </div>
      <div class="w-full fr-px-4v text-sm">
        <div class="grid-8-cols grid">
          <div class="grid-8-cols__large flex-col">
            <div class="flex-1 m-0! fr-text--xs fr-text--light">Adresse</div>
            <div class="flex-1">
              <span class="fr-text--bold"> {{ person.address?.oneLine }} {{ person.residenceCountry?.toUpperCase() }} </span>
            </div>
          </div>
          <div class="grid-8-cols__medium">
            <div class="flex-1 m-0! fr-text--xs fr-text--light">Naissance</div>
            <div class="flex-1 fr-text--bold">
              Né(e) le {{ dateToStringFr(person.bornAt) }} {{ person.bornPlace ?? `à ${person.bornPlace}: ''` }}
            </div>
          </div>

          <div class="flex-1/8 flex-col">
            <div class="flex-1 m-0! fr-text--xs fr-text--light">Nationalité</div>
            <div class="flex-1 fr-text--bold">
              {{ person.nationality }}
            </div>
          </div>
          <div class="grid-8-cols__medium flex-col">
            <div class="flex-1 m-0! fr-text--xs fr-text--light">Qualité de la personne déclarée</div>
            <div class="flex-1 fr-text--bold">
              <template v-if="person.jobPosition">
                {{ person.jobPosition }}
              </template>
              <em v-else>Non renseigné</em>
            </div>
          </div>
          <div class="grid-8-cols__large flex-col">
            <div class="flex-1 m-0! fr-text--xs fr-text--light">Fonction</div>
            <div class="flex-1 fr-text--bold">
              <template v-if="person.profession">
                {{ person.profession }}
              </template>
              <em v-else>Non renseigné</em>
            </div>
          </div>
          <div class="grid-8-cols__medium flex-col">
            <div class="flex-1 m-0! fr-text--xs fr-text--light">Date d’entrée dans l’administration</div>
            <div class="flex-1 fr-text--bold">
              {{ dateToStringFr(person.entryAt) }}
            </div>
          </div>
          <div class="flex-1/8 flex-col">
            <div class="flex-1 m-0! fr-text--xs fr-text--light">Date de sortie</div>
            <div class="flex-1 fr-text--bold">
              {{ dateToStringFr(person.exitAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.divide-y > :not(:last-child) {
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-color: rgb(243 244 246);
}

h3 {
  font: 1em sans-serif;
}
.grid-8-cols {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 1rem;
}

.grid-8-cols__medium {
  grid-column: span 2;
}

.grid-8-cols__large {
  grid-column: span 3;
}
</style>
