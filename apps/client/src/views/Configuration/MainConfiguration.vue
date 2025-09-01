<script setup lang="ts">
import LayoutList from '@/components/Layout/LayoutList.vue'
import DsSynchronization from './Tools/DsSynchronization.vue'
import BnConfiguration from '@/views/Configuration/Tools/BnConfiguration.vue'

const currentConfigTab = ref<string | undefined>('synchronization')
</script>

<template>
  <LayoutList
    title="Configuration"
    title-bg-color="var(--warning-425-625)"
    title-icon="fr-icon-settings-5-line"
  >
    <BnTabsContainer
      v-model="currentConfigTab"
      default-tab-id="ds-synchronization"
    >
      <BnTab
        id="ds-synchronization"
        title="Synchronisation DS"
      >
        <DsSynchronization />
      </BnTab>
      <BnTab
        id="bn-configuration"
        title="Configuration BN"
      >
        <BnConfiguration />
      </BnTab>
    </BnTabsContainer>
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
