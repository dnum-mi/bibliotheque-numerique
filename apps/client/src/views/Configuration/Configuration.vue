<script setup lang="ts">
import type { DsfrTabItemProps } from '@gouvminint/vue-dsfr'
import LayoutList from '@/components/Layout/LayoutList.vue'
import Synchronization from './Tools/Synchronization.vue'
import BnConfiguration from '@/views/Configuration/Tools/BnConfiguration.vue'

const route = useRoute()
const router = useRouter()
const props = defineProps<{ demarcheId: string, customDisplayId?: string }>()

const tabTitles: (DsfrTabItemProps & { title: string })[] = [
  {
    panelId: 'pan-1',
    tabId: 'tab-1',
    title: 'Synchronization',
  },
  {
    panelId: 'pan-2',
    tabId: 'tab-2',
    title: 'BnConfigurations',
  },
]
const selectedTabIndex = ref(0)

function selectTab (idx: number) {
  selectedTabIndex.value = idx
  router.push({ ...route, hash: '#' + tabTitles[idx].title })
}

</script>
<template>
  <LayoutList
    title="Configuration"
    title-bg-color="var(--warning-425-625)"
    title-icon="fr-icon-settings-5-line"
  >
    <DsfrTabs
      :key="selectedTabIndex"
      tab-list-name="tabConfig"
      :tab-titles="tabTitles"
      :initial-selected-index="selectedTabIndex"
      class="fr-pt-5w"
      @select-tab="selectTab"
    >
      <DsfrTabContent
        panel-id="pan-1"
        tab-id="tab-1"
        :selected="selectedTabIndex === 0"
      >
        <Synchronization
          v-if="selectedTabIndex === 0"
          id="synchronization"
          :custom-display-id="customDisplayId"
        />
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="pan-2"
        tab-id="tab-2"
        :selected="selectedTabIndex === 1"
      >
        <BnConfiguration
          v-if="selectedTabIndex === 1"
          id="bn-configuration"
          :custom-display-id="customDisplayId"
        />
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
