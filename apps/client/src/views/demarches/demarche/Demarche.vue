<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, type ComputedRef, onMounted, ref } from 'vue'
import type { IDemarche } from '@biblio-num/shared'
import { useDemarcheStore, useUserStore } from '@/stores'
import GroupInstructeurs from '@/views/demarches/demarche/information/DemarcheGrpInstructeurs.vue'
import DemarcheService from '@/views/demarches/demarche/information/DemarcheService.vue'
import DemarcheInformations from '@/views/demarches/demarche/information/DemarcheInformations.vue'
import DemarcheConfigurations from '@/views/demarches/demarche/configuration/DemarcheConfigurations.vue'
import LayoutList from '@/components/Layout/LayoutList.vue'
import type { DsfrTabItemProps } from '@gouvminint/vue-dsfr/types/components/DsfrTabs/DsfrTabItem.vue'
import DemarcheDossiers from '@/views/demarches/demarche/dossiers/DemarcheDossiers.vue'

const route = useRoute()
const router = useRouter()
const demarcheStore = useDemarcheStore()
const userStore = useUserStore()

const demarche = computed<IDemarche>(() => demarcheStore.currentDemarche || {})
const props = defineProps<{ id: string }>()

onMounted(async () => {
  if (props.id) {
    await demarcheStore.getDemarche(parseInt(props.id))
  }
})

/* #region Tab management */

const tabTitles: ComputedRef<(DsfrTabItemProps & { title: string })[]> = computed(() => [
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
  ...(userStore.canManageRoles ? [{ title: 'Configuration', panelId: 'pan-3', tabId: 'tab-3' }] : []),
])
const selectedTabIndex = ref(0)

function selectTab (idx: number) {
  selectedTabIndex.value = idx
  router.push({ ...route, hash: '#' + tabTitles.value[idx].title })
}

onMounted(() => {
  // The optional chaining operator is here for component testing, where route is nullish
  if (route?.hash.slice(1).length) {
    selectTab(tabTitles.value.findIndex((tabTitle) => route.hash.slice(1) === tabTitle.title) || 0)
  }
})
/* #endregion */
</script>

<template>
  <LayoutList class="fr-pb-2w">
    <template #title>
      <div class="bn-list-search bn-list-search-dossier">
        <h6 class="bn-list-search-title-dossier fr-p-1w fr-m-0">
          {{ demarche.title }} - N° {{ demarche.dsDataJson?.number || "" }}
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
      <!-- Dossiers -->
      <DsfrTabContent
        panel-id="pan-1"
        class="small-padding-tab"
        tab-id="tab-1"
        :selected="selectedTabIndex === 0"
      >
        <DemarcheDossiers
          v-if="selectedTabIndex === 0"
          demarche-id="demarche.id"
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
        v-if="userStore.canManageRoles"
        panel-id="pan-3"
        tab-id="tab-3"
        :selected="selectedTabIndex === 2"
      >
        <template v-if="selectedTabIndex === 2">
          <DemarcheConfigurations />
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
  padding:5px !important;
}
</style>
