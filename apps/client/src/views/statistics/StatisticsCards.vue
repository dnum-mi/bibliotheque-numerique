<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { SmallDemarcheOutputDto } from '@biblio-num/shared'

import { DsfrButton } from '@gouvminint/vue-dsfr'
import StatisticCard from './StatisticsCard.vue'

import { useCustomFilterStore } from '@/stores/custom-filters'

const customFilterStore = useCustomFilterStore()

const customFilters = computed(() => customFilterStore.customFilters || [])
const customFilterToDelete = ref()
const showModal = (customFilter) => {
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
  <div
    v-for="customFilter of customFilters"
    :key="customFilter.id"
    class="card fr-card half"
  >
    <StatisticCard
      v-if="customFilter.demarcheId"
      :filter-id="customFilter.id"
      :demarche-id="customFilter.demarcheId"
      @delete="showModal"
    />
  </div>
  <template v-if="customFilterToDelete">
    <DsfrModal
      :opened="customFilterToDelete"
      :title="`Supprimer le filtre personnalisé ${customFilterToDelete?.name}`"
      @close="customFilterToDelete = undefined"
    >
      <p>Êtes-vous sûr·e de vouloir supprimer ce filtre personnalisé ?</p>

      <div class="flex  gap-2  justify-end">
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
.card {
  padding: 2em;
  min-width: 600px;
}
.half {
  flex-basis: 48%;
  flex-grow: 0;
  flex-shrink: 0;
}
</style>
