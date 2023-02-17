<script lang="ts" setup>
import { useRoute } from 'vue-router'

import { computed, onMounted, ref } from 'vue'
import { useDossierStore } from '@/stores/dossier'
import DossierInformations from './DossierInformations.vue'
import DossierDemande from './DossierDemande.vue'
import DossierAnnotations from './DossierAnnotations.vue'
import DossierMessages from './DossierMessages.vue'

const dossierStore = useDossierStore()
const dossierDS = computed<object>(() => dossierStore?.dossier?.dossierDS?.dataJson || {})

const tabTitles = [
  {
    title: 'Demande',
  },
  {
    title: 'Annotations privé',
  },
  // {
  //   title: 'Avis externes',
  // },
  {
    title: 'Messagerie',
  },
  // {
  //   title: 'Personnes impliquées',
  // },
]
const selectedTabIndex = ref(0)
function selectTab (idx:number) {
  selectedTabIndex.value = idx
}

onMounted(async () => {
  // const { id } = useRoute().params
  const params = useRoute()?.params
  const id = Number(params.id)
  if (id) {
    await dossierStore.getDossier(id)
  }
})

</script>

<template>
  <div class="fr-container">
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

      <DsfrTabContent
        panel-id="tab-content-1"
        tab-id="tab-1"
        :selected="(selectedTabIndex === 1)"
      >
        <DossierAnnotations :datas="dossierDS" />
      </DsfrTabContent>

      <DsfrTabContent
        panel-id="tab-content-2"
        tab-id="tab-2"
        :selected="(selectedTabIndex === 2)"
      >
        <DossierMessages :datas="dossierDS" />
      </DsfrTabContent>
    </DsfrTabs>
  </div>
</template>

<style scoped>

</style>
