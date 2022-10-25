<script lang="ts" setup>
import DisplayLabelsValues from '@/components/DisplayLabelsValues.vue'
import { DemarcheStateMapping } from '@/utils/demarche-mapping'
import type { KeyDemarcheStateMapping } from '@/types/typesDemarche'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
    datas?: object
  }>(), {
  datas: () => ({}),
})

const title = 'Informations'

const DateTimeToStringFn = (value:any) => {
  return value
    ? (new Date(value)).toLocaleString()
    : ''
}

const labelsDate = [
  {
    text: 'Date de création',
    value: 'dateCreation',
    parseFn: DateTimeToStringFn,
  },
  {
    text: 'Date de dépublication',
    value: 'dateDepublication',
    parseFn: DateTimeToStringFn,
  },
  {
    text: 'Date de derniére modification',
    value: 'dateDerniereModification',
    parseFn: DateTimeToStringFn,
  },

  {
    text: 'Date de fermeture',
    value: 'dateFermeture',
    parseFn: DateTimeToStringFn,
  },
  {
    text: 'Date de publication',
    value: 'datePublication',
    parseFn: DateTimeToStringFn,
  },
]

const DossierDeclarativeState2Fr = {
  en_instruction: 'En instruction',
  accepte: 'Accepté',
}

const etat = computed(() => props.datas?.state ? DemarcheStateMapping[props.datas?.state as KeyDemarcheStateMapping] : '')
type TypeDossierDeclarativeState2Fr = keyof typeof DossierDeclarativeState2Fr
const declarative = computed(() => props.datas?.declarative ? DossierDeclarativeState2Fr[props.datas?.declarative as TypeDossierDeclarativeState2Fr] : '')

</script>

<template>
  <h3> {{ title }} </h3>

  <div
    v-if="datas"
    data-cy="cy-demarche-description"
    class="fr-container fr-pb-3v"
  >
    <div class="fr-grid-row">
      <div
        class="fr-col-12 "
      >
        <label
          for="demarche-description"
          class="fr-text--bold "
        > Description :</label> <span
          id="demarche-description"
          class="fr-text"
        > {{ datas.description }}</span>
      </div>
      <div
        class="fr-col-6"
      >
        <label
          for="demarche-state"
          class="fr-text--bold "
        > Etat :</label> <span
          id="demarche-state"
          class="fr-text"
        > {{ etat }}</span>
      </div>
      <div
        class="fr-col-6"
      >
        <label
          for="demarche-declarative"
          class="fr-text--bold "
        >  Déclarative :</label> <span
          id="demarche-declarative"
          class="fr-text"
        > {{ declarative }}</span>
      </div>
    </div>
  </div>

  <DisplayLabelsValues
    :title="title"
    prefix-id="demarche-description"
    :datas="datas"
    :labels="labelsDate"
    class="fr-pb-3v"
  />
</template>
