<script lang="ts" setup>
import { useRoute } from 'vue-router'

import { computed, onMounted, ref, watch } from 'vue'
import { useDossierStore } from '@/stores/dossier'
import DossierInformations from './DossierInformations.vue'
import DossierDemande from './DossierDemande.vue'

const dossierStore = useDossierStore()
const idDossier = ref(1)

const dossier = computed<any>(() => { return dossierStore?.dossier || {} })
const dossierDS = computed<any>(() => dossierStore?.dossier?.dossierDS?.dataJson || {})
const idD = computed<string>(() => dossierStore?.dossier?.id || '')
const champsD = computed<string>(() => dossierStore?.dossier?.champs || '')
const demandeurD = computed<string>(() => dossierStore?.dossier?.demandeur || '')

const tabTitles = [
  {
    title: 'Demande',
  },
  // TODO: A confirmer
  // {
  //   title: 'Annotations privé',
  // },
  // {
  //   title: 'Avis externes',
  // },
  // {
  //   title: 'Messagerie',
  // },
  // {
  //   title: 'Personnes impliquées',
  // },
]
const selectedTabIndex = ref(0)
function selectTab (idx:number) {
  selectedTabIndex.value = idx
}
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
  <h1>Dossier {{ dossierDS.number }}</h1>

  <DossierInformations :datas="dossierDS" />

  <DsfrTabs
    tab-list-name="tabs-dossier"
    :tab-titles="tabTitles"
    initial-selected-index="0"
    @select-tab="selectTab"
  >
    <DsfrTabContent
      panel-id="tab-content-0"
      tab-id="tab-0"
      :selected="selectedTabIndex === 0"
    >
      <DossierDemande :datas="dossierDS" />
    </DsfrTabContent>
  </DsfrTabs>
</template>

<style scoped>

</style>
