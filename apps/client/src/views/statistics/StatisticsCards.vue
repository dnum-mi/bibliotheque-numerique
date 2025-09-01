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

onMounted(customFilterStore.getCustomFilters)

type DisplaysByDemarche = Record<number, { id: number; label: string, displays: { id: number; label: string }[] }>
const demarcheStore = useDemarcheStore()
const displaysByDemarche = ref<DisplaysByDemarche>({})
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
const selectedCustomFilters = computed(() => selectedDemarches.value.map((id) => displaysByDemarche.value[+id]?.displays ?? []).flat())

const updateSelectedDemarches = ($event: string, demarcheId: string): void => {
  selectedDemarches.value = $event
    ? [...selectedDemarches.value, demarcheId]
    : selectedDemarches.value.filter((id) => id !== demarcheId)
}

let statHeaderEl: HTMLElement, mainEl: HTMLElement, bannerEl: HTMLElement
const updateTopHeader = () => {
  if (mainEl && statHeaderEl && bannerEl) {
    statHeaderEl.style.top = `${Math.max(0, mainEl?.scrollTop - bannerEl.offsetHeight) ?? 0}px`
  }
}

onMounted(() => {
  demarcheStore.getDemarches()

  statHeaderEl = document.querySelector('.statistics-header') as HTMLElement
  mainEl = document.querySelector('main') as HTMLElement
  bannerEl = document.querySelector('.banner-height') as HTMLElement
  mainEl?.addEventListener('scroll', updateTopHeader)
})
onUnmounted(() => {
  mainEl?.removeEventListener('scroll', updateTopHeader)
})
</script>

<template>
  <div v-if="!displaysByDemarche || !Object.values(displaysByDemarche)?.length">
    <div class="text-center">
      <p class="fr-text--lg">
        Vous n’avez pas encore créé d’affichage personnalisé.
      </p>

      <em class="fr-text--md">
        (Une "tuile" par affichage personnalisé pourra être affichée ici avec ses statistiques)
      </em>
    </div>
  </div>
  <div
    v-else
    class="relative"
  >
    <header class="statistics-header">
      <p>Charger les statistiques des démarches suivantes :</p>
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
      class="grid-container"
    >
      <div
        v-for="customFilter of selectedCustomFilters"
        :key="customFilter.id"
      >
        <StatisticCard
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
        :opened="!!customFilterToDelete"
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
  </div>
</template>

<style scoped>
.statistics-header {
  position: absolute;
  top: 0;
  z-index: 1;
  right: 0;
  padding: 0.5rem;
  align-self: flex-start;
  overflow-y: auto;
  width: 284px;
  background-color: var(--grey-950-100);
  border: 1px solid var(--grey-925-125);
}
.alert {
  --hover: var(--error-425-625);
  --active: var(--error-425-625);
  --background-action-high-blue-france: var(--error-425-625);
}

.grid-container {
  width: calc(100% - 300px);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
</style>
