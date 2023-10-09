
<script setup lang="ts">
import StatisticsCard from './StatisticsCards.vue'
import LayoutList from '@/components/Layout/LayoutList.vue'
</script>

<template>
  <LayoutList>
    <template #title>
      <div class="bn-list-search bn-list-search-profile">
        <span
          class="fr-icon-table-fill fr-p-1w"
          aria-hidden="true"
        />
        <h6 class="bn-list-search-title-profile fr-p-1w fr-m-0">
          Statistiques
        </h6>
      </div>
    </template>
    <div class="cards  fr-container">
      <StatisticsCard />
    </div>
  </LayoutList>
</template>

<style scoped>
.cards {
  @apply flex  gap-4  flex-wrap  justify-between  my-4  max-w-[12];
}
</style>
