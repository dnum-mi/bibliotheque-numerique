<script lang="ts" setup>
import { computed, ref, type Ref } from 'vue'

export type SmallFilter = {
  id: number
  name: string
  totals: string []
};

export type TotalsAllowed = {
  id: string,
  columnLabel: string,
}

const props = withDefaults(defineProps<{
  filters?: SmallFilter[],
  paginationChanged?: boolean
  selectedFilter?: SmallFilter | null,
  totalsAllowed?: TotalsAllowed[]
}>(), {
  filters: () => [],
  selectedFilter: null,
  totalsAllowed: () => [],
})

const defaultTotalOption = { text: 'Veuillez choisir une colonne', value: undefined, disabled: true }
const noTotalOption = { text: 'Aucun total', value: 'Aucun total' }
const totalsAllowedOptions = computed(() => [
  defaultTotalOption,
  noTotalOption,
  ...props.totalsAllowed.map(({ id, columnLabel }) => ({ text: columnLabel, value: id })),
])

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (event: 'selectFilter', filterId: number | null) : void
  (event: 'createFilter', filter: { filterName?: string, totals?: string }) : void
  (event: 'updateFilterName', filter: { filterName?: string, totals?: string }) : void
  (event: 'updateFilter') : void
  (event: 'deleteFilter') : void
}>()

const filterLabelGroups = {
  create: {
    title: 'Créer un nouveau filtre personnalisé',
    button: 'Enregistrer',
    input: 'Nommer le filtre personnalisé',
    icon: 'ri-save-line',
    totals: 'Sélectionner la colonne pour le total numéraire',
    submitFn () {
      emit('createFilter', { filterName: inputFilterName.value, totals: inputFilterTotals.value })
    },
  },
  update: {
    title: 'Renommer le filtre actuel',
    button: 'Enregistrer',
    input: 'Renommer le filtre personnalisé',
    icon: 'ri-edit-line',
    totals: 'Sélectionner la colonne pour le total numéraire',
    submitFn () {
      emit('updateFilterName', { filterName: inputFilterName.value, totals: inputFilterTotals.value })
    },
  },
  delete: {
    title: 'Supprimer le filtre actuel',
    button: 'Supprimer',
    icon: 'ri-delete-bin-line',
    totals: 'Sélectionner la colonne pour le total numéraire',
    submitFn () {
      emit('deleteFilter')
    },
  },
} as const

type FilterModalType = keyof typeof filterLabelGroups;
const modalOrigin = ref()
const inputFilterName: Ref<string> = ref('')
const filterModalType: Ref<FilterModalType> = ref('create')
const inputFilterTotals: Ref<string | undefined> = ref(undefined)
const filterModalOpen = ref(false)

const closeFilterModal = () => {
  filterModalOpen.value = false
}
const filterLabelGroup = computed(() => filterLabelGroups[filterModalType.value])
const openFilterModal = (modalType: FilterModalType) => {
  filterModalOpen.value = true
  filterModalType.value = modalType
  inputFilterName.value = modalType === 'create' ? '' : (props.selectedFilter?.name || '')
  inputFilterTotals.value = modalType === 'create' ? undefined : (props.selectedFilter?.totals[0] || '')
}
const saveCurrentFilter = () => {
  filterLabelGroup.value.submitFn()
  filterModalOpen.value = false
}
const resetAgGridFilters = () => {
  emit('selectFilter', null)
}

const defaultOption = { text: 'Aucun filtre sélectionné', value: null }
const filterList = computed(() => [defaultOption, ...props.filters.map(({ id, name }) => ({ text: name, value: id }))])

const onSelectFilterChange = ($event: string) => {
  emit('selectFilter', +$event)
}

const createOrUpdate = () => {
  if (props.selectedFilter) {
    emit('updateFilter')
  } else {
    openFilterModal('create')
  }
}
</script>

<template>
  <div class="flex justify-end h-24">
    <DsfrSelect
      :model-value="selectedFilter?.id"
      label="Sélectionner un filtre"
      default-unselected-text="Aucun filtre sélectionné"
      :options="filterList"
      @update:model-value="onSelectFilterChange($event)"
    />
    <div class="fr-mx-2v fr-mt-2v flex justify-center items-center gap-2">
      <DsfrButton
        ref="modalOrigin"
        :disabled="!selectedFilter"
        type="submit"
        @click="resetAgGridFilters()"
      >
        <VIcon name="ri-filter-off-line" />
      </DsfrButton>
      <DsfrButton
        ref="modalOrigin"
        :disabled="!selectedFilter"
        type="submit"
        @click="openFilterModal('update')"
      >
        <VIcon name="ri-edit-line" />
      </DsfrButton>
      <DsfrButton
        ref="modalOrigin"
        :disabled="!selectedFilter"
        type="submit"
        @click="openFilterModal('delete')"
      >
        <VIcon name="ri-delete-bin-line" />
      </DsfrButton>
    </div>
    <div class="fr-mx-2v  fr-mt-2v  flex  justify-center  items-center  gap-2">
      <DsfrButton
        :ref="modalOrigin"
        type="submit"
        :disabled="!!selectedFilter && !paginationChanged"
        @click="createOrUpdate()"
      >
        {{ !!selectedFilter ? 'Mettre à jour le filtre personnalisé' : 'Créer un nouveau filtre personnalisé' }}
        <VIcon name="ri-save-line" />
      </DsfrButton>
    </div>
  </div>
  <DsfrModal
    :opened="filterModalOpen"
    :title="filterLabelGroup.title"
    :origin="$refs.modalOrigin"
    @close="closeFilterModal"
  >
    <form
      class="flex flex-col gap-8"
      @submit.prevent="saveCurrentFilter()"
    >
      <div class="flex flex-col m-4">
        <DsfrInput
          v-model="inputFilterName"
          type="text"
          :label="filterLabelGroup.input"
          label-visible
          class="mb-4"
          placeholder="Mon filtre personnalisé"
          :readonly="filterModalType === 'delete'"
        />

        <DsfrSelect
          v-if="filterModalType !== 'delete'"
          v-model="inputFilterTotals"
          :label="filterLabelGroup.totals"
          :options="totalsAllowedOptions"
        />
      </div>
      <div class="flex justify-end">
        <DsfrButton
          type="submit"
          :label="filterLabelGroup.button"
          :icon="{ name: filterLabelGroup.icon }"
          icon-right
          :disabled="!inputFilterName"
        />
      </div>
    </form>
  </DsfrModal>
</template>
