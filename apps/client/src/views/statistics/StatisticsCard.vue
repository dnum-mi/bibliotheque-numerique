<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import type { ICustomFilterStat } from '@biblio-num/shared'

import { formatCurrency, frenchFormatNumber } from '@/utils/french-number'
import apiClient from '@/api/api-client'
import OrganismeBadge from '@/components/Badges/OrganismeBadge.vue'

const props = defineProps<{
  filterId: number;
}>()

const card = ref<ICustomFilterStat>()
const errorGetFilter = ref<string>()

const isFinancement = (title: string) => {
  return title.toLowerCase().includes('financement')
}

const emit = defineEmits(['delete'])
const onDelete = () => {
  emit('delete', card.value?.customFilter)
}

onMounted(async () => {
  if (props.filterId) {
    card.value = await apiClient.getCustomFilterStats(props.filterId)
  }
})
</script>

<template>
  <div class="w-full h-full">
    <div v-if="errorGetFilter">
      {{ errorGetFilter }}
    </div>
    <div
      v-else
      class="flex flex-col gap-8 w-full h-full"
    >
      <!-- HEADER -->
      <div class="flex flex-row gap-2 justify-between">
        <div class="flex gap-2">
          <OrganismeBadge
            v-for="type in card?.demarche.types"
            :key="type"
            :type="type"
          />
        </div>
        <p class="uppercase m-0 text-sm text-gray-400 fr-text--bold">
          [N° DS: <span class="text-gray-700">{{ card?.demarche.dsId }}</span>] {{ card?.demarche.title }}
        </p>
      </div>
      <!-- TITLE -->
      <div class="flex flex-row justify-between">
        <span class="fr-text--bold text-xl"> {{ card?.customFilter.name }}</span>
        <button
          type="button"
          class="fr-icon-delete-line fr-text-default--warning"
          aria-hidden="true"
          @click.prevent="onDelete"
        />
      </div>
      <!-- CONTENT -->
      <div class="flex flex-row justify-between">
        <div>
          <ul class="list-none flex flex-col gap-4">
            <li
              v-for="filter of card?.customFilter.filters"
              :key="filter.label"
            >
              <p class="uppercase m-0 text-sm text-gray-400 fr-text--bold">
                {{ filter.label }}
              </p>
              <p class="m-0 p-0 font-bold text-sm">
                {{ filter.value }}
              </p>
            </li>
          </ul>
        </div>

        <div class="w-1/3">
          <ul class="list-none pl-0 flex flex-col gap-4">
            <li
              v-for="total of card?.totals"
              :key="total.label"
            >
              <p class="uppercase m-0 text-sm text-gray-400 fr-text--bold">
                {{ total.label }}
              </p>
              <p class="text-4xl m-0">
                {{ isFinancement(total.label) ? formatCurrency(total.total) : frenchFormatNumber(total.total) }}
              </p>
            </li>
          </ul>
        </div>
      </div>
      <!-- FOOTER -->
      <div class="flex justify-end mt-4">
        <RouterLink
          v-if="card"
          class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
          :to="{
            name: 'DemarcheDossiers',
            params: { id: card?.demarche.id },
            query: { customFilter: card?.customFilter.id },
          }"
        >
          Visualiser la liste
        </RouterLink>
      </div>
    </div>
  </div>
</template>
