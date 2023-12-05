<script setup lang="ts">
import LayoutList from '@/components/Layout/LayoutList.vue'
import Synchronization from './Tools/Synchronization.vue'
import LogViewsWorker from './Tools/LogViewsWorker.vue'

</script>
<template>
  <LayoutList
    title="Configuration"
    title-bg-color="var(--warning-425-625)"
    title-icon="fr-icon-settings-5-line"
  >
    <div class="fr-callout">
      <Synchronization />
    </div>
    <div class="fr-callout">
      <LogViewsWorker />
    </div>
  </LayoutList>
</template>
