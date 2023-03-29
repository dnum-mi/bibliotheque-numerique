<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'

import { computed, onMounted, ref, watch } from 'vue'
import { useDemarcheStore } from '@/stores/demarche'
import { useUserStore } from '@/stores'
import GroupInstructeurs from '@/views/DemarcheGrpInstructeurs.vue'
import DemarcheService from '@/views/DemarcheService.vue'
import DemarcheInformations from '@/views/DemarcheInformations.vue'
import DemarcheConfigurations from '@/views/DemarcheConfigurations.vue'
import BiblioNumDataTable from '@/components/BiblioNumDataTableAgGrid.vue'
import LayoutList from '@/components/LayoutList.vue'

const route = useRoute()
const router = useRouter()
const demarcheStore = useDemarcheStore()
const userStore = useUserStore()

const title = computed<string>(() => demarcheStore.demarche?.title || '')
const number = computed<string>(() => demarcheStore.demarche?.demarcheDS?.dataJson?.number || '')
const groupInstructeurs = computed<object[]>(() => demarcheStore.demarche?.demarcheDS?.dataJson?.groupeInstructeurs || [])
const service = computed<object>(() => demarcheStore.demarche?.demarcheDS?.dataJson?.service || {})
const demarche = computed<object>(() => demarcheStore.demarche || {})
const headerDossiers = computed<object[]>(() => demarcheStore.hearderListDossier || [])
const rowDatas = computed(() => demarcheStore.rowDatasDossiers || [])

onMounted(async () => {
  const params = route?.params
  const id = Number(params.id)
  if (id) {
    await demarcheStore.getDemarche(id)
    await demarcheStore.getDossiers(id)

    await demarcheStore.getDemarcheConfigurations()
    await demarcheStore.loadHeaderDossiers()
    await demarcheStore.loadRowDatas()
  }
})

watch(() => demarcheStore.demarcheConfigurations, async (newValue) => {
  await demarcheStore.loadHeaderDossiers()
  await demarcheStore.loadRowDatas()
}, { deep: true })

const onSelect = (e) => {
  router.push({ name: 'Dossier', params: { id: e[0].idBiblioNum } })
}

const tabTitles = [
  {
    title: 'Les dossiers',
  },
  {
    title: "L'information",
  },
]

if (userStore.canManageRoles) tabTitles.push({ title: 'La configuration' })

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
        <BiblioNumDataTable
          :headers="headerDossiers"
          :row-data="rowDatas"
          :floating-filter="true"
          row-selection="single"
          @selection-changed="onSelect"
        />
      </DsfrTabContent>

      <DsfrTabContent
        panel-id="tab-content-1"
        tab-id="tab-1"
        :selected="selectedTabIndex === 1"
      >
        <DemarcheInformations
          :data-json="demarche?.demarcheDS?.dataJson"
          class="fr-pt-3w"
        />
        <DemarcheService
          :service="service"
          class="fr-pt-5w"
        />
        <GroupInstructeurs
          :group-instructeurs="groupInstructeurs"
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
          :data-json="demarche?.demarcheDS?.dataJson"
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
