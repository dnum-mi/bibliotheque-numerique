<script setup lang="ts">
import StatisticCard from './StatisticsCard.vue'

import { useCustomFilterStore } from '@/stores/custom-filters'
import type { IFilter } from 'ag-grid-community'

const customFilterStore = useCustomFilterStore()

const customFilters = computed(() => customFilterStore.customFilters || [])
const customFilterToDelete = ref()
const showModal = (customFilter: IFilter) => {
  customFilterToDelete.value = customFilter
}

const deleteFilter = (id: number) => {
  customFilterStore.deleteCustomFilter(id)
  customFilterToDelete.value = undefined
}

onMounted(async () => {
  await customFilterStore.getCustomFilters()
})
</script>

<template>
  <div class="grid-container">
    <div
      v-for="customFilter of customFilters"
      :key="customFilter.id"
    >
      <StatisticCard
        v-if="customFilter.demarcheId"
        :filter-id="customFilter.id"
        class="fr-p-3w w-full h-full fr-card--shadow"
        @delete="showModal"
      />
    </div>
  </div>

  <template v-if="customFilterToDelete">
    <DsfrModal
      :opened="customFilterToDelete"
      :title="`Supprimer le filtre personnalisé ${customFilterToDelete?.name}`"
      @close="customFilterToDelete = undefined"
    >
      <p>Êtes-vous sûr·e de vouloir supprimer ce filtre personnalisé ?</p>

      <div class="flex gap-2 justify-end">
        <DsfrButton
          class="alert"
          @click="deleteFilter(customFilterToDelete.id)"
        >
          Supprimer <span class="fr-icon-delete-line" />
        </DsfrButton>
        <DsfrButton @click="customFilterToDelete = undefined">
          Annuler
        </DsfrButton>
      </div>
    </DsfrModal>
  </template>
</template>
<style scoped>
.alert {
  --hover: var(--error-425-625);
  --active: var(--error-425-625);
  --background-action-high-blue-france: var(--error-425-625);
}

.grid-container {
  margin-inline: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
</style>
