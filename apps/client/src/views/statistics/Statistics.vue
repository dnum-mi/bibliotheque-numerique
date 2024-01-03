
<script setup lang="ts">
import StatisticsCards from './StatisticsCards.vue'
import LayoutList from '@/components/Layout/LayoutList.vue'
</script>

<template>
  <LayoutList
    title="Statistiques"
    title-bg-color="var(--red-marianne-850-200)"
    title-icon="fr-icon-table-fill"
  >
    <div class="cards  fr-m-5v">
      <StatisticsCards />
    </div>
  </LayoutList>
</template>
