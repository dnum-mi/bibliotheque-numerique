<script lang="ts" setup>
import DisplayLabelsValues from '@/components/DisplayLabelsValues.vue'
import { DemarcheStateMapping } from '@/utils/demarche-mapping'
import type { KeyDemarcheStateMapping } from '@/types/typesDemarche'
import { computed } from 'vue'
import { dateTimeToStringFr } from '@/utils/dateToString'
import { stateToFr } from '@/utils/stateToString'

const props = withDefaults(defineProps<{
    dataJson?: object
  }>(), {
  dataJson: () => ({}),
})

const title = 'Informations'

const labelsDate = [
  {
    text: 'Date de création',
    value: 'dateCreation',
    parseFn: dateTimeToStringFr,
  },
  {
    text: 'Date de dépublication',
    value: 'dateDepublication',
    parseFn: dateTimeToStringFr,
  },
  {
    text: 'Date de derniére modification',
    value: 'dateDerniereModification',
    parseFn: dateTimeToStringFr,
  },

  {
    text: 'Date de fermeture',
    value: 'dateFermeture',
    parseFn: dateTimeToStringFr,
  },
  {
    text: 'Date de publication',
    value: 'datePublication',
    parseFn: dateTimeToStringFr,
  },
]

const etat = computed(() => props.dataJson?.state ? DemarcheStateMapping[props.dataJson?.state as KeyDemarcheStateMapping] : '')
const declarative = computed(() => stateToFr(props.dataJson?.declarative))

</script>

<template>
  <div class="fr-container">
    <h3> {{ title }} </h3>

    <div
      v-if="dataJson"
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
          > {{ dataJson?.description }}</span>
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
      :datas="dataJson"
      :labels="labelsDate"
      class="fr-pb-3v"
    />
  </div>
</template>
