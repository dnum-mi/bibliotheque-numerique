<script lang="ts" setup>
import DisplayLabelsValues from '@/components/DisplayLabelsValues.vue'
import { dateTimeToStringFr } from '@/utils/dateToString'
import { booleanToYesNo } from '@/utils/booleanToString'
import { stateToFr } from '@/utils/stateToString'

withDefaults(defineProps<{
    datas?: object
  }>(), {
  datas: () => ({}),
})

const title = 'Informations'

const labelsData = [
  // {
  //   text: 'Numero de dossier',
  //   value: 'number',
  // },
  {
    text: 'Archivé',
    value: 'archived',
    parseFn: booleanToYesNo,
  },
  {
    text: 'Etat',
    value: 'state',
    parseFn: stateToFr,
  },
]

const labelsDate = [
  {
    text: 'Date de derniére modification',
    value: 'dateDerniereModification',
    parseFn: dateTimeToStringFr,
  },
  {
    text: 'Date de dépot',
    value: 'dateDepot',
    parseFn: dateTimeToStringFr,
  },
  {
    text: 'Date de passage en construction',
    value: 'datePassageEnConstruction',
    parseFn: dateTimeToStringFr,
  },
  {
    text: 'Date de passage en instruction',
    value: 'datePassageEnInstruction',
    parseFn: dateTimeToStringFr,
  },
  {
    text: 'Date de traitement',
    value: 'dateTraitement',
    parseFn: dateTimeToStringFr,
  },
]

</script>

<template>
  <h3> {{ title }} </h3>
  <DisplayLabelsValues
    :title="title"
    prefix-id="dossier-description"
    :datas="datas"
    :labels="labelsData"
    class="fr-pb-3v"
  />

  <DisplayLabelsValues
    :title="title"
    prefix-id="dossier-description"
    :datas="datas"
    :labels="labelsDate"
    class="fr-pb-3v"
  />
</template>
