<script setup lang="ts">
import LayoutList from '@/components/Layout/LayoutList.vue'
import Synchronization from './Tools/Synchronization.vue'
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
  </LayoutList>
</template>
