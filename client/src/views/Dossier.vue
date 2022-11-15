<script lang="ts" setup>
import { useRoute } from 'vue-router'

import { computed, onMounted, ref, watch } from 'vue'
import { useDossierStore } from '@/stores/dossier'

const dossierStore = useDossierStore()
const idDossier = ref(1)
const dossier = computed<string>(() => dossierStore.dossier || '')
const idD = computed<string>(() => dossierStore.dossier?.id || '')
const champsD = computed<string>(() => dossierStore.dossier?.champs || '')
const demandeurD = computed<string>(() => dossierStore.dossier?.demandeur || '')

watch(idDossier, async (value: number) => {
  await dossierStore.getDossier(value)
})

onMounted(async () => {
  // const { id } = useRoute().params
  const params = useRoute()?.params
  if (params && params.id) { idDossier.value = Number(params.id) }
  await dossierStore.getDossier(idDossier.value)
})

</script>

<template>
  <h1>Dossier</h1>

  {{ dossier }}
  Dossier ID: {{ idD }}

  <h2>
    Identité du demandeur:
  </h2>
  <div>
    {{ demandeurD }}
  </div>
  <h2>
    Formulaire
  </h2>
  <div>
    {{ champsD }}
  </div>
</template>

<style scoped>

</style>
