<script lang="ts" setup>
import { dateToStringFr } from '@/utils'

const props = withDefaults(defineProps<{
    datas?: object
  }>(), {
  datas: () => ({}),
})

const title = 'DemandeurDossier'
const fieldsDemandeur = [
  {
    label: 'Civilité',
    value: props.datas.civilite.toUpperCase(),
  },
  {
    label: 'Nom',
    value: props.datas.nom.toUpperCase(),
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
    class="fr-container"
  >
    <div class="fr-grid-row">
      <div
        v-for="{label, value} in fieldsDemandeur"
        :key="label"
        class="fr-col-3"
      >
        <label class="fr-text--bold bn-text--shadow"> {{ label }} </label>
        <div class="fr-text bn-text--shadow fr-mt-4v">
          {{ value }}
        </div>
      </div>
    </div>
  </div>
</template>
@/utils/date-to-string
