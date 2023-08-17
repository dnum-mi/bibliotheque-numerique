<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref, watch, type Ref } from 'vue'
import { useStorage } from '@vueuse/core'

import { useDemarcheStore } from '@/stores/demarche'
import { useUserStore } from '@/stores'
import GroupInstructeurs from '@/views/demarches/DemarcheGrpInstructeurs.vue'
import DemarcheService from '@/views/demarches/DemarcheService.vue'
import DemarcheInformations from '@/views/demarches/DemarcheInformations.vue'
import DemarcheConfigurations from '@/views/demarches/DemarcheConfigurations.vue'
import BiblioNumDataTableAgGrid from '@/components/BiblioNumDataTableAgGrid.vue'
import LayoutList from '@/components/LayoutList.vue'

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

const filterLabelGroups = {
  create: {
    title: 'Enregistrement du filtre actuel',
    button: 'Enregistrer',
    input: 'Nommer le filtre actuel',
    icon: 'ri-save-line',
    submitFn (filters) {
      userFilters.value = { ...userFilters.value, [currentFilterName.value]: filters }
    },
  },
  update: {
    title: 'Modification du filtre actuel',
    button: 'Enregistrer',
    input: 'Renommer le filtre actuel',
    icon: 'ri-edit-line',
    submitFn () {
      userFilters.value = Object.fromEntries(
        Object.entries(userFilters.value)
          .map(([key, value]) => ([key === userFilter.value ? currentFilterName.value : key, value])),
      )
      userFilter.value = currentFilterName.value
    },
  },
  delete: {
    title: 'Supprimer le filtre actuel',
    button: 'Supprimer',
    input: 'Supprimer le filtre actuel',
    icon: 'ri-delete-bin-line',
    submitFn () {
      userFilters.value = Object.fromEntries(Object.entries(userFilters.value).filter(([key]) => (key !== userFilter.value)))
      userFilter.value = undefined
    },
  },
} as const
type FilterModalType = keyof typeof filterLabelGroups
const modalOrigin = ref()
const userFilter = ref()
const currentFilterName = ref()
const filterModalType: Ref<FilterModalType> = ref('create')
const filterModalOpen = ref(false)
const closeFilterModal = () => { filterModalOpen.value = false }
const userFilters = useStorage('dossiers-filters', {})
const bnDemarchesGrid = ref()

const filterLabelGroup = computed(() => filterLabelGroups[filterModalType.value])

const openFilterModal = (modalType) => {
  filterModalOpen.value = true
  filterModalType.value = modalType
  currentFilterName.value = modalType === 'create' ? '' : userFilter.value
}

const saveCurrentFilter = () => {
  const filters = bnDemarchesGrid.value.getCurrentFilter()
  filterLabelGroup.value.submitFn(filters)
  filterModalOpen.value = false
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

const selectedTabIndex = ref(0)
function selectTab (idx: number) {
  selectedTabIndex.value = idx
  router.push({ ...route, hash: '#' + tabTitles.value[idx].title })
}
onMounted(() => {
  // The optional chaining operator is here for component testing, where route is nullish
  if (route?.hash.slice(1).length) {
    selectTab(tabTitles.value.findIndex(tabTitle => route.hash.slice(1) === tabTitle.title) || 0)
  }
})
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
      :key="selectedTabIndex"
      tab-list-name="tabs-dossier"
      :tab-titles="tabTitles"
      :initial-selected-index="selectedTabIndex"
      class="fr-pt-5w"
      @select-tab="selectTab"
    >
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
      >
        <div :style="{paddingBottom: '2rem'}">
          <div
            class="flex  justify-end  h-24"
          >
            <DsfrSelect
              v-if="Object.keys(userFilters).length"
              v-model="userFilter"
              label="Filtres personnalisés"
              default-unselected-text="Sélectionner un filtre"
              :options="Object.entries(userFilters).map(([value]) => ({value, text: value}))"
            />

            <div class="fr-mx-2v  fr-mt-2v  flex  justify-center  items-center  gap-2">
              <DsfrButton
                ref="modalOrigin"
                :disabled="!userFilter"
                type="submit"
                @click="userFilter = undefined"
              >
                <VIcon name="ri-filter-off-line" />
              </DsfrButton>
              <DsfrButton
                ref="modalOrigin"
                :disabled="!userFilter"
                type="submit"
                @click="openFilterModal('update')"
              >
                <VIcon name="ri-edit-line" />
              </DsfrButton>
              <DsfrButton
                ref="modalOrigin"
                :disabled="!userFilter"
                type="submit"
                @click="openFilterModal('delete')"
              >
                <VIcon name="ri-delete-bin-line" />
              </DsfrButton>
            </div>
            <div class="fr-mx-2v  fr-mt-2v  flex  justify-center  items-center">
              <DsfrButton
                ref="modalOrigin"
                type="submit"
                @click="openFilterModal('create')"
              >
                Enregistrer le filtre actuel
                <VIcon name="ri-save-line" />
              </DsfrButton>
            </div>
          </div>
          <BiblioNumDataTableAgGrid
            ref="bnDemarchesGrid"
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
  <DsfrModal
    :opened="filterModalOpen"
    :title="filterLabelGroup.title"
    :origin="$refs.modalOrigin"
    @close="closeFilterModal"
  >
    <form
      class="flex  items-end  gap-4"
      @submit.prevent="saveCurrentFilter()"
    >
      <div class="flex-basis-[34%]  flex-grow">
        <DsfrInput
          v-model="currentFilterName"
          type="text"
          :label="filterLabelGroup.input"
          label-visible
          placeholder="> 15 300€"
          :readonly="filterModalType === 'delete'"
        />
      </div>
      <div class="flex  items-end">
        <DsfrButton
          type="submit"
          :label="filterLabelGroup.button"
          :icon="{ name: filterLabelGroup.icon }"
          icon-right
          :disabled="!currentFilterName"
        />
      </div>
    </form>
  </DsfrModal>
</template>

<style scoped>
.fr-tabs__panel {
  padding: 0;
}
</style>
