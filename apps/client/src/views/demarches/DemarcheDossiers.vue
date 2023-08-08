<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'

import { computed, onMounted, ref, watch } from 'vue'
import { useDemarcheStore } from '@/stores/demarche'
import { useUserStore } from '@/stores'
import GroupInstructeurs from '@/views/demarches/DemarcheGrpInstructeurs.vue'
import DemarcheService from '@/views/demarches/DemarcheService.vue'
import DemarcheInformations from '@/views/demarches/DemarcheInformations.vue'
import DemarcheConfigurations from '@/views/demarches/DemarcheConfigurations.vue'
import BiblioNumDataTableAgGrid from '@/components/BiblioNumDataTableAgGrid.vue'
import LayoutList from '@/components/LayoutList.vue'
import type { DsfrTabItemProps } from '@gouvminint/vue-dsfr/types/components/DsfrTabs/DsfrTabItem.vue'

const route = useRoute()
const router = useRouter()
const demarcheStore = useDemarcheStore()
const userStore = useUserStore()

const title = computed<string>(() => demarcheStore.demarche?.title || '')
const number = computed<string>(() => demarcheStore.demarche?.dsDataJson?.number || '')
const demarche = computed<object>(() => demarcheStore.demarche || {})
const headerDossiers = computed<object[]>(() => demarcheStore.hearderListDossier || [])
const rowDatas = computed(() => demarcheStore.rowDatasDossiers || [])

const getIdDemarche = () => {
  const params = route?.params
  return Number(params.id)
}
onMounted(async () => {
  const id = getIdDemarche()
  if (id) {
    await demarcheStore.getDemarche(id)
    await demarcheStore.getDossiers(id)
    await demarcheStore.loadInstructionTimes()

    await demarcheStore.getDemarcheConfigurations()

    await demarcheStore.loadHeaderDossiers()
    await demarcheStore.loadRowDatas()
  }
})

watch(() => demarcheStore.demarcheConfigurations, async (newValue) => {
  const id = getIdDemarche()
  if (id) {
    await demarcheStore.getDemarche(id)
    await demarcheStore.loadHeaderDossiers()
    await demarcheStore.loadRowDatas()
  }
}, { deep: true })

const onSelect = (e) => {
  router.push({ name: 'Dossiers', params: { id: e[0].idBiblioNum } })
}

const tabTitles = computed(() => ([
  {
    title: 'Dossiers',
  },
  {
    title: 'Information',
  },
  ...(userStore.canManageRoles ? [{ title: 'Configuration' }] : []),
]))

const initialSelectedIndex = 0
const selectedTabIndex = ref(0)
function selectTab (idx:number) {
  selectedTabIndex.value = idx
}
</script>

<template>
  <LayoutList>
    <template #title>
      <div class="bn-list-search bn-list-search-dossier">
        <h6 class="bn-list-search-title-dossier fr-p-1w fr-m-0">
          {{ title }} - N° {{ number }}
        </h6>
      </div>
    </template>

    <DsfrTabs
      tab-list-name="tabs-dossier"
      :tab-titles="tabTitles"
      :initial-selected-index="initialSelectedIndex"
      class="fr-pt-5w"
      @select-tab="selectTab"
    >
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
      >
        <div :style="{paddingBottom: '2rem'}">
          <BiblioNumDataTableAgGrid
            :headers="headerDossiers"
            :row-data="rowDatas"
            :floating-filter="true"
            row-selection="single"
            :pagination="true"
            :pagination-page-size="20"
            @selection-changed="onSelect"
          />
        </div>
      </DsfrTabContent>

      <DsfrTabContent
        panel-id="tab-content-1"
        tab-id="tab-1"
        :selected="selectedTabIndex === 1"
      >
        <DemarcheInformations
          class="fr-pt-3w"
        />
        <DemarcheService
          class="fr-pt-5w"
        />
        <GroupInstructeurs
          class="fr-pt-5w"
        />
      </DsfrTabContent>
      <DsfrTabContent
        v-if="userStore.canManageRoles"
        panel-id="tab-content-2"
        tab-id="tab-2"
        :selected="selectedTabIndex === 2"
      >
        <DemarcheConfigurations
          :data-json="demarche?.dsDataJson"
          class="fr-pt-3w"
        />
      </DsfrTabContent>
    </DsfrTabs>
  </LayoutList>
</template>

<style scoped>
  .fr-tabs__panel {
    padding: 0;
  }
</style>
