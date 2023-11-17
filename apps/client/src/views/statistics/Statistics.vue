
<script setup lang="ts">
import StatisticsCard from './StatisticsCards.vue'
import LayoutList from '@/components/Layout/LayoutList.vue'
</script>

<template>
  <LayoutList
    title="Statistiques"
    title-bg-color="var(--red-marianne-850-200)"
    title-icon="fr-icon-table-fill"
  >
    <div class="cards  fr-container">
      <StatisticsCard />
    </div>
  </LayoutList>
</template>

<style scoped>
</style>
