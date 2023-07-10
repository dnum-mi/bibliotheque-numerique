<script lang="ts" setup>

import { computed } from 'vue'

const props = withDefaults(defineProps<{
  datas?: object
}>(), {
  datas: () => ({}),
})

const orgRef = computed(() => props.datas?.organisme?.id || '')
const orgName = computed(() => props.datas?.organisme?.title || '')
const orgType = computed(() => props.datas?.demarche?.typeOrganisme || '')
const procedureName = computed(() => props.datas?.demarche?.title || '')
const idDossier = computed(() => props.datas?.dossierDS?.dataJson.number || '')
</script>

<template>
  <div class="fr-container fr-mb-4v">
    <div
      v-if="orgName"
      class="fr-grid-row bn-fiche-title"
    >
      <span class="fr-text--bold bn-fiche-title--text"> {{ orgRef }} - </span>
      <span class="bn-fiche-title--text">{{ orgName }}</span>
    </div>
    <div class="fr-grid-row bn-fiche-title">
      <span
        v-if="orgType"
        class="fr-text--bold bn-fiche-title--text-sm fr-badge fr-badge--new fr-badge--no-icon fr-badge--sm"
      >{{ orgType }}</span>
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
