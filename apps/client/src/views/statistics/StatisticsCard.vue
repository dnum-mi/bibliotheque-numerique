<script lang="ts" setup>
import type { IView, IViewStat } from '@biblio-num/shared'

import { formatCurrency, frenchFormatNumber } from '@/utils/french-number'
import apiClient from '@/api/api-client'
import OrganismeBadge from '@/components/Badges/organisme/OrganismeBadge.vue'

const props = defineProps<{
  viewId: number
  displayInfo: IView
  lazyLoad?: boolean
}>()

const emit = defineEmits(['delete'])

const card = ref<IViewStat>()
const errorGetFilter = ref<string>()

const isFinancement = (title: string) => {
  return title.toLowerCase().includes('financement')
}

const onDelete = () => {
  emit('delete', card.value?.view)
}

const loaded = ref(false)
const loading = ref(false)
const load = async () => {
  if (props.viewId) {
    loading.value = true
    card.value = await apiClient.getViewStats(props.viewId)
    loading.value = false
    loaded.value = true
  }
}

defineExpose({
  load,
})
onMounted(() => {
  if (props.viewId && !props.lazyLoad) {
    load()
  }
})
</script>

<template>
  <div class="w-full">
    <div v-if="errorGetFilter">
      {{ errorGetFilter }}
    </div>
    <div
      v-else
      class="flex flex-col gap-4"
    >
      <!-- HEADER -->
      <div class="flex flex-col gap-2 justify-between">
        <div class="flex flex-row gap-2">
          <OrganismeBadge
            v-for="demarcheType of card?.demarche.types"
            :key="demarcheType"
            :type="demarcheType"
          />
        </div>
        <p
          v-if="loading"
          class="w-full flex justify-center align-center"
        >
          <em> Chargement de&nbsp; </em>
          <strong>{{ displayInfo.name }}</strong>...
        </p>
        <p
          v-else
          class="uppercase m-0 text-sm text-gray-400 fr-text--bold"
        >
          [N° DS: <span class="text-gray-700">{{ card?.demarche.dsId }}</span>] {{ card?.demarche.title }}
        </p>
      </div>
      <!-- TITLE -->
      <div class="flex flex-row justify-between">
        <span class="fr-text--bold bn-title"> {{ card?.view.name }}</span>
        <button
          v-if="card?.view"
          type="button"
          class="fr-icon-delete-line fr-text-default--warning"
          aria-hidden="true"
          title="Supprimer le filtre personnalisé (attention, cette action est irréversible)"
          @click.prevent="onDelete"
        />
      </div>
      <!-- CONTENT -->
      <div class="bn-stat-content">
        <div class="bn-stat-filters">
          <ul class="bn-stat-list">
            <li
              v-for="filter of card?.view.filters"
              :key="filter.label"
              class="bn-stat-item"
            >
              <p class="bn-stat-k">
                {{ filter.label }}
              </p>

              <template v-if="filter.label === 'Status'">
                <div class="bn-stat-chips">
                  <!-- @vue-ignore TODO: corriger le type -->
                  <status-badge
                    v-for="f of filter.value.split(',')"
                    :key="f"
                    :status="f.trim()"
                    :is-small="true"
                  />
                </div>
              </template>

              <p
                v-else
                class="bn-stat-v"
              >
                {{ filter.value }}
              </p>
            </li>
          </ul>
        </div>

        <div class="bn-stat-totals">
          <ul class="bn-stat-list">
            <li
              v-for="total of card?.totals"
              :key="total.label"
              class="bn-stat-item"
            >
              <p class="bn-stat-k">
                {{ total.label }}
              </p>
              <p class="bn-stat-total">
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
            params: { demarcheId: card?.demarche.id },
            query: { viewId: card?.view.id },
          }"
        >
          Visualiser la liste
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style>
.bn-stat-content {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 16px;
  align-items: start;
}

@media (max-width: 1100px) {
  .bn-stat-content {
    grid-template-columns: 1fr;
  }
}

.bn-stat-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.bn-stat-item {
  min-width: 0;
}

.bn-stat-k {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #6b7280; /* gray-500 */
  font-weight: 700;
}

.bn-stat-v {
  margin: 2px 0 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bn-stat-total {
  margin: 2px 0 0;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.1;
}

.bn-stat-chips {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.bn-title {
  font-size: 25px;
}

@media screen and (max-height: 780px) {
  .bn-title {
    font-size: 20px;
  }

  .bn-stat-total {
    font-size: 14px;
  }
}
</style>
