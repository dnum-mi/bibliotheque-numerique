<script lang="ts" setup>
import type { Demandeur, PersonnePhysique } from '@biblio-num/shared'

import { dateToStringFr } from '@/utils'

const props = withDefaults(
  defineProps<{
    datas?: (Demandeur & PersonnePhysique) | Record<string, never>
  }>(),
  {
    datas: () => ({}),
  },
)

const title = 'DemandeurDossier'
const fieldsDemandeur = [
  {
    label: 'Civilité',
    value: props.datas.civilite?.toUpperCase(),
  },
  {
    label: 'Nom',
    value: props.datas.nom?.toUpperCase(),
  },
  {
    label: 'Prénom',
    value: props.datas.prenom.toUpperCase(),
  },
  {
    label: 'Date de naissance',
    value: dateToStringFr(props.datas.dateDeNaissance),
  },
]
</script>

<template>
  <div
    :data-cy="`cy-${title}`"
    class="fr-px-4v"
  >
    <div class="fr-grid-col">
      <div
        v-for="{ label, value } in fieldsDemandeur"
        :key="label"
        class="fr-col-3"
      >
        <label
          :for="label"
          class="fr-text--sm bn-champ--text"
        >
          {{ label }}
        </label>
        <p class="fr-text--bold">
          {{ value }}
        </p>
      </div>
    </div>
  </div>
</template>
