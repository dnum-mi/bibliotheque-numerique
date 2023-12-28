<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { ICustomFilter } from '@biblio-num/shared'

import { useCustomFilterStore } from '@/stores/custom-filters'
import StatisticCard from './StatisticsCard.vue'
import { useDemarcheStore } from '@/stores'

const customFilterStore = useCustomFilterStore()

const customFilters = computed(() => customFilterStore.customFilters || [])
const customFilterToDelete = ref()
const showModal = (customFilter: ICustomFilter) => {
  customFilterToDelete.value = customFilter
}

const deleteFilter = (id: number) => {
  customFilterStore.deleteCustomFilter(id)
  customFilterToDelete.value = undefined
}

const cardsEl = ref<HTMLElement>()
const cardRefs = ref<Record<number, HTMLElement & { load:() => Promise<void>}>>({})

onMounted(async () => {
  await customFilterStore.getCustomFilters()

  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.30,
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('data-stat-id')
        cardRefs.value[id]?.load()
        obs.unobserve(entry.target)
      }
    })
  }, options)

  for (const card of cardsEl.value?.querySelectorAll('.card')) {
    if (card instanceof HTMLElement) {
      observer.observe(card)
    }
  }
})

const setRef = (el: HTMLElement & { load:() => Promise<void>}, id: number) => {
  if (el) {
    cardRefs.value[id] = el
  }
}

type DisplaysByDemarche = Record<number, {id: number; label: string, displays: {id: number; label: string}[]}>
const demarcheStore = useDemarcheStore()
const displaysByDemarche = ref<DisplaysByDemarche>({})
demarcheStore.getDemarches()
const updateDemarcheList = () => {
  displaysByDemarche.value = customFilters.value.reduce((acc, curr) => {
    const id = curr.demarcheId
    acc[id] ??= {
      id,
      label: demarcheStore.demarches.find((demarche) => id === demarche.id)?.title ?? 'Sans titre',
      displays: [] as unknown as DisplaysByDemarche[number]['displays'],
    }
    acc[id].displays.push({ id: curr.id, label: curr.name })
    return acc
  }, {} as DisplaysByDemarche)
}
watchEffect(updateDemarcheList)
const selectedDemarches = useStorage<string[]>('selected-dem-stat', [])
const selectedCustomFilters = computed(() => selectedDemarches.value.map((id) => displaysByDemarche.value[id].displays).flat())

const updateSelectedDemarches = ($event: string, demarcheId: string): void => {
  selectedDemarches.value = $event
    ? [...selectedDemarches.value, demarcheId]
    : selectedDemarches.value.filter((id) => id !== demarcheId)
}
</script>

<template>
  <header flex>
    <p>Charger les stats de :</p>
    <DsfrCheckbox
      v-for="(displaysInDemarche, demarcheId) in displaysByDemarche"
      :key="demarcheId"
      small
      :model-value="selectedDemarches.includes(demarcheId)"
      :label="displaysInDemarche.label"
      @update:model-value="updateSelectedDemarches($event, demarcheId)"
    />
  </header>
  <div
    ref="cardsEl"
    class="grid-container"
  >
    <div
      v-for="customFilter of selectedCustomFilters"
      :key="customFilter.id"
    >
      <StatisticCard
        :ref="el => setRef(el, customFilter.id)"
        :data-stat-id="customFilter.id"
        :filter-id="customFilter.id"
        :display-info="customFilter"
        load-immediately
        class="fr-p-3w w-full h-full fr-card--shadow card"
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
