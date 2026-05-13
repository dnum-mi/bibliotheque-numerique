<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { IView } from '@biblio-num/shared'

import { useViewStore } from '@/stores/views.ts'
import StatisticCard from './StatisticsCard.vue'
import { useDemarcheStore } from '@/stores'

const viewStore = useViewStore()

const views = computed(() => viewStore.views || [])
const viewToDelete = ref()
const showModal = (view: IView) => {
  viewToDelete.value = view
}

const deleteView = (id: number) => {
  viewStore.deleteView(id)
  viewToDelete.value = undefined
}

onMounted(async () => {
  await viewStore.getViews()
})

type DisplaysByDemarche = Record<number, { id: number; label: string; displays: { id: number; label: string }[] }>
const demarcheStore = useDemarcheStore()
const displaysByDemarche = ref<DisplaysByDemarche>({})
const updateDemarcheList = () => {
  displaysByDemarche.value = views.value.reduce((acc, curr) => {
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
  selectedDemarches.value = $event ? [...selectedDemarches.value, demarcheId] : selectedDemarches.value.filter((id) => id !== demarcheId)
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
        Vous n’avez pas encore créé de vue personnalisée.
      </p>

      <em class="fr-text--md"> (Une "tuile" par vue personnalisée pourra être affichée ici avec ses statistiques) </em>
    </div>
  </div>
  <div
    v-else
    class="statistics-layout"
  >
    <aside class="statistics-sidebar">
      <header class="statistics-header">
        <p class="statistics-header__title">
          Charger les statistiques des démarches suivantes&nbsp;:
        </p>
        <!-- @vue-ignore TODO: corriger le type -->
        <DsfrCheckbox
          v-for="(displaysInDemarche, demarcheId) in displaysByDemarche"
          :key="demarcheId"
          small
          :model-value="selectedDemarches.includes(demarcheId)"
          :label="displaysInDemarche.label"
          @update:model-value="updateSelectedDemarches($event, demarcheId)"
        />
      </header>
    </aside>

    <section class="statistics-content">
      <div class="grid-container">
        <div
          v-for="view of selectedCustomFilters"
          :key="view.id"
        >
          <!-- @vue-ignore TODO: corriger le type -->
          <StatisticCard
            :data-stat-id="view.id"
            :view-id="view.id"
            :display-info="view"
            load-immediately
            class="fr-p-3w w-full h-full fr-card--shadow card"
            @delete="showModal"
          />
        </div>
      </div>

      <template v-if="viewToDelete">
        <DsfrModal
          :opened="!!viewToDelete"
          :title="`Supprimer la vue ${viewToDelete?.name}`"
          @close="viewToDelete = undefined"
        >
          <p>Êtes-vous sûr·e de vouloir supprimer cette vue ?</p>

          <div class="flex gap-2 justify-end">
            <DsfrButton
              class="alert"
              @click="deleteView(viewToDelete.id)"
            >
              Supprimer <span class="fr-icon-delete-line" />
            </DsfrButton>
            <DsfrButton @click="viewToDelete = undefined">
              Annuler
            </DsfrButton>
          </div>
        </DsfrModal>
      </template>
    </section>
  </div>
</template>

<style scoped>
.statistics-layout {
  display: grid;
  grid-template-columns: 284px 1fr;
  gap: 12px;
  align-items: start;
}

.statistics-sidebar {
  position: sticky;
  top: 12px;
  align-self: start;
  max-height: calc(100vh - 24px);
  overflow: auto;
}

.statistics-header {
  z-index: 2;
  padding: 12px;
  background: var(--grey-950-100);
  border: 1px solid var(--grey-925-125);
  border-radius: 8px;
  font-size: smaller;
}

.statistics-header__title {
  margin: 0 0 8px 0;
}

.statistics-content {
  min-width: 0;
}

.alert {
  --hover: var(--error-425-625);
  --active: var(--error-425-625);
  --background-action-high-blue-france: var(--error-425-625);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  align-items: stretch;
}

@media screen and (max-height: 780px) {
  .statistics-layout {
    grid-template-columns: 240px 1fr;
    gap: 10px;
  }

  .statistics-header {
    padding: 10px;
    font-size: 0.85rem;
  }

  .statistics-header__title {
    margin-bottom: 6px;
  }

  .grid-container {
    gap: 10px;
  }

  :deep(.card.fr-p-3w) {
    padding: 0.75rem !important;
  }

  /* Réduction de la taille des checkbox DSFR dans la sidebar stats */
  .statistics-header :deep(.fr-checkbox-group) {
    margin-bottom: 4px;
  }

  .statistics-header :deep(.fr-label) {
    font-size: 0.875rem; /* ~14px */
    line-height: 1.2;
  }

  .statistics-header :deep(.fr-checkbox-group input + label::before) {
    transform: scale(0.9);
  }
}
</style>
