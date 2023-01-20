<script lang="ts" setup>
import DisplayLabelsValues from '@/components/DisplayLabelsValues.vue'

withDefaults(defineProps<{
    datas?: object
  }>(), {
  datas: () => ({}),
})

const title = 'DemandeurDossier'
const labelsDemandeur = [
  {
    text: 'Civilité',
    value: 'civilite',
  },
  {
    text: 'Date de naissance',
    value: 'dateDeNaissance',
  },
  {
    text: 'Nom',
    value: 'nom',
  },
  {
    text: 'Prénom',
    value: 'prenom',
  },

]

</script>
<template>
  <div class="fr-container">
    <DisplayLabelsValues
      :title="title"
      prefix-id="dossier-demandeur"
      :datas="datas"
      :labels="labelsDemandeur"
      class="fr-pb-3v"
    />
  </div>
</template>
