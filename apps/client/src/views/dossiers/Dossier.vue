<script lang="ts" setup>
import { useRoute } from 'vue-router'

import { computed, onMounted, ref } from 'vue'
import { useDossierStore } from '@/stores/dossier'
import LayoutFiche from '@/components/Layout/LayoutFiche.vue'
import DossierTitle from './DossierTitle.vue'
import DossierInformations from './DossierInformations.vue'
import DossierDemande from './DossierDemande.vue'
import DossierAnnotations from './DossierAnnotations.vue'
import DossierMessages from './DossierMessages.vue'

const dossierStore = useDossierStore()
const dossier = computed<object>(() => dossierStore?.dossier || {})
const dossierDS = computed<object>(() => dossierStore?.dossier?.dsDataJson || {})

const tabTitles = [
  {
    title: 'Demande',
  },
  {
    title: 'Annotations privées',
  },
  {
    title: 'Messagerie',
  },
]
const initialSelectedIndex = 0
const selectedTabIndex = ref(0)
function selectTab (idx:number) {
  selectedTabIndex.value = idx
}

onMounted(async () => {
  const params = useRoute()?.params
  const id = Number(params.id)
  if (id) {
    await dossierStore.getDossier(id)
  }
})
</script>

<template>
  <LayoutFiche>
    <template #title>
      <DossierTitle :datas="dossier" />
    </template>
    <template #sub-title>
      <DossierInformations :datas="dossierDS" />
    </template>

    <template #content>
      <DsfrTabs
        tab-list-name="tabs-dossier"
        :tab-titles="tabTitles"
        :initial-selected-index="initialSelectedIndex"
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
          :selected="selectedTabIndex === 1"
        >
          <DossierAnnotations :datas="dossierDS" />
        </DsfrTabContent>

        <DsfrTabContent
          panel-id="tab-content-2"
          tab-id="tab-2"
          :selected="selectedTabIndex === 2"
        >
          <DossierMessages :datas="dossierDS" />
        </DsfrTabContent>
      </DsfrTabs>
    </template>
  </LayoutFiche>
</template>
