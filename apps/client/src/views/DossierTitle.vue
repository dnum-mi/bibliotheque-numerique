<script lang="ts" setup>

import { computed } from 'vue'

const props = withDefaults(defineProps<{
  datas?: object
}>(), {
  datas: () => ({}),
})

const orgRef = computed(() => 'W0000000000')
const orgName = computed(() => 'Association à mettre')
const orgType = computed(() => 'CULTES')
const procedureName = computed(() => 'Titire de la procedure')
const idDossier = computed(() => props.datas.number || '')
</script>

<template>
  <div class="fr-container fr-mb-4v">
    <div class="fr-grid-row bn-fiche-title">
      <span class="fr-text--bold bn-fiche-title--text"> {{ orgRef }} - </span>
      <span class="bn-fiche-title--text">{{ orgName }}</span>
    </div>
    <div class="fr-grid-row bn-fiche-title">
      <span class="fr-text--bold bn-fiche-title--text-sm fr-badge fr-badge--new fr-badge--no-icon fr-badge--sm">{{ orgType }}</span>
      <span class="fr-text--bold bn-fiche-title--text-sm"> N°DS - {{ idDossier }}</span>
      <span class="bn-fiche-title--text-sm"> - {{ procedureName }}</span>
    </div>
  </div>
</template>

<style scoped>
.fr-container {
  padding: 0;
}
.bn-fiche-title {
  display: block;
}
</style>
