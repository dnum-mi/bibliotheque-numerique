<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { ICustomFilterStat } from '@biblio-num/shared'
import type { Ref } from 'vue'

import apiClient from '@/api/api-client'

const props = defineProps<{
  filterId: number,
  demarcheId: number
 }>()

const card:Ref<ICustomFilterStat|undefined> = ref()
const errorGetFilter:Ref<string | undefined> = ref()

const emit = defineEmits(['delete'])
const onDelete = () => {
  emit('delete', card.value?.customFilter)
}

onMounted(async () => {
  if (props.filterId) {
    card.value = await apiClient.getCustomFilterStats(props.filterId, props.demarcheId)
  }
})
</script>

<template>
  <div>
    <div v-if="errorGetFilter">
      {{ errorGetFilter }}
    </div>
    <div v-else>
      <div>
        <strong>N° DS: {{ card?.demarche.dsId }}</strong> - {{ card?.demarche.title }}
      </div>
      <div class="wrapper-title">
        <span class="fr-text--bold text-xl"> {{ card?.customFilter.name }}</span>
        <div>
          <button
            type="button"
            class="fr-icon-close-line"
            aria-hidden="true"
            @click.prevent="
              $event.target.parentElement.parentElement.parentElement.style.display = 'none'
            "
          />
          <button
            type="button"
            class="fr-icon-delete-line"
            aria-hidden="true"
            @click.prevent="onDelete"
          />
        </div>
      </div>
      <div class="flex  my-4">
        <div class="half">
          <ul class="list-none  m-0  p-0">
            <li
              v-for="filter of card?.customFilter.filters"
              :key="filter.label"
              class="my-2"
            >
              <p class="uppercase  my-1  p-0  text-sm  text-gray-500  text-sm">
                {{ filter.label }}
              </p>
              <p class="m-0  p-0  font-bold  text-sm">
                {{ filter.value }}
              </p>
            </li>
          </ul>
        </div>

        <div class="half">
          <ul class="list-none  m-0  p-0">
            <li
              v-for="total of card?.totals"
              :key="total.label"
            >
              <p class="uppercase  my-1  p-0  text-sm  text-gray-500  text-sm">
                {{ total.label }}
              </p>
              <p class="text-4xl">
                {{ total.total }}
              </p>
            </li>
          </ul>
        </div>
      </div>
      <div class="flex justify-end">
        <RouterLink
          v-if="card"
          class="fr-link  fr-icon-arrow-right-line  fr-link--icon-right"
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

<style scoped>
.wrapper-title {
  display: flex;
  margin-top: 1em;
  justify-content: space-between;
}

.half {
  flex-basis: 48%;
  flex-grow: 0;
  flex-shrink: 0;
}

</style>
