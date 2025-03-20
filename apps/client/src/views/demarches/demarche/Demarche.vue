<script lang="ts" setup>
import type { IDemarche } from '@biblio-num/shared'

import type { DsfrTabItemProps } from '@gouvminint/vue-dsfr'

import { useDemarcheStore, useUserStore } from '@/stores'
import GroupInstructeurs from '@/views/demarches/demarche/information/DemarcheGrpInstructeurs.vue'
import DemarcheService from '@/views/demarches/demarche/information/DemarcheService.vue'
import DemarcheInformations from '@/views/demarches/demarche/information/DemarcheInformations.vue'
import DemarcheConfigurations from '@/views/demarches/demarche/configuration/DemarcheConfigurations.vue'
import LayoutList from '@/components/Layout/LayoutList.vue'
import DemarcheDossiers from '@/views/demarches/demarche/dossiers/DemarcheDossiers.vue'
import DemarcheOptions from '@/views/demarches/demarche/options/DemarcheOptions.vue'

const props = defineProps<{ demarcheId: string; customDisplayId?: string }>()

const route = useRoute()
const router = useRouter()
const demarcheStore = useDemarcheStore()
const userStore = useUserStore()

const demarche = computed<IDemarche | undefined>(() => demarcheStore.currentDemarche)

onMounted(async () => {
  if (props.demarcheId) {
    await demarcheStore.getDemarche(Number(props.demarcheId))
  }
})

//#region Tab management */
const tabTitles = computed<(DsfrTabItemProps & { title: string })[]>(() => [
  {
    panelId: 'pan-1',
    tabId: 'tab-1',
    title: 'Dossiers',
  },
  {
    panelId: 'pan-2',
    tabId: 'tab-2',
    title: 'Information',
  },
  ...(userStore.CanConfigureDemarche(Number(props.demarcheId))
    ? [
        {
          title: 'Configuration',
          panelId: 'pan-3',
          tabId: 'tab-3',
        },
        { title: 'Option', panelId: 'pan-4', tabId: 'tab-4' },
      ]
    : []),
])
const selectedTabIndex = ref(0)

function selectTab (idx: number) {
  selectedTabIndex.value = idx
  router.push({ ...route, hash: `#${tabTitles.value[idx].title}` })
}

onMounted(() => {
  // The optional chaining operator is here for component testing, where route is nullish
  if (route?.hash.slice(1).length) {
    selectTab(tabTitles.value.findIndex((tabTitle) => route.hash.slice(1) === tabTitle.title) || 0)
  }
})
//#endregion */
</script>

<template>
  <LayoutList
    v-if="demarche"
    class="fr-pb-2w"
    :title="`${demarche.title} - N°${demarche.dsDataJson?.number || ''}`"
    title-bg-color="var(--artwork-minor-blue-france)"
    title-icon=""
  >
    <DsfrTabs
      v-model="selectedTabIndex"
      tab-list-name="tabs-dossier"
      :tab-titles="tabTitles"
      class="fr-pt-5w"
      @select-tab="selectTab"
    >
      <!-- Dossiers -->
      <DsfrTabContent
        panel-id="pan-1"
        class="small-padding-tab"
        tab-id="tab-1"
        :selected="selectedTabIndex === 0"
      >
        <DemarcheDossiers
          v-if="selectedTabIndex === 0"
          id="demarche-dossiers"
          :custom-display-id="customDisplayId"
        />
      </DsfrTabContent>

      <!-- Informations -->
      <DsfrTabContent
        panel-id="pan-2"
        tab-id="tab-2"
        :selected="selectedTabIndex === 1"
      >
        <template v-if="selectedTabIndex === 1">
          <DemarcheInformations class="fr-pt-3w" />
          <DemarcheService class="fr-pt-5w" />
          <GroupInstructeurs class="fr-pt-5w" />
        </template>
      </DsfrTabContent>

      <!-- Configurations -->
      <DsfrTabContent
        v-if="userStore.CanConfigureDemarche(Number(props.demarcheId))"
        panel-id="pan-3"
        tab-id="tab-3"
        :selected="selectedTabIndex === 2"
      >
        <template v-if="selectedTabIndex === 2">
          <KeepAlive>
            <DemarcheConfigurations />
          </KeepAlive>
        </template>
      </DsfrTabContent>

      <!-- Options -->
      <DsfrTabContent
        v-if="userStore.CanConfigureDemarche(Number(props.demarcheId))"
        panel-id="pan-4"
        tab-id="tab-4"
        :selected="selectedTabIndex === 3"
      >
        <template v-if="selectedTabIndex === 3">
          <KeepAlive>
            <DemarcheOptions />
          </KeepAlive>
        </template>
      </DsfrTabContent>
    </DsfrTabs>
  </LayoutList>
</template>

<style scoped>
.fr-tabs__panel {
  padding: 2rem;
}

.small-padding-tab {
  padding: 5px !important;
}
</style>
