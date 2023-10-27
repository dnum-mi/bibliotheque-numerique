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
  displays?: SmallFilter[],
  paginationChanged?: boolean
  selectedDisplay?: SmallFilter | null,
  totalsAllowed?: TotalsAllowed[]
}>(), {
  displays: () => [],
  selectedDisplay: null,
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
  (event: 'selectDisplay', filterId: number | null) : void
  (event: 'createDisplay', filter: { filterName?: string, totals?: string }) : void
  (event: 'updateDisplayName', filter: { filterName?: string, totals?: string }) : void
  (event: 'updateDisplay') : void
  (event: 'deleteDisplay') : void
}>()

const filterLabelGroups = {
  duplicate: {
    title: `Dupliquer l’affichage ${props.selectedDisplay?.name}`,
    button: 'Enregistrer',
    input: 'Nommer le nouvel affichage',
    icon: 'ri-save-line',
    totals: 'Sélectionner la colonne pour le total numéraire',
    submitFn () {
      emit('createDisplay', { filterName: inputFilterName.value, totals: inputFilterTotals.value })
    },
  },
  create: {
    title: 'Créer un nouvel affichage personnalisé',
    button: 'Enregistrer',
    input: 'Nommer l’affichage personnalisé',
    icon: 'ri-save-line',
    totals: 'Sélectionner la colonne pour le total numéraire',
    submitFn () {
      emit('createDisplay', { filterName: inputFilterName.value, totals: inputFilterTotals.value })
    },
  },
  update: {
    title: 'Renommer l’affichage actuel',
    button: 'Enregistrer',
    input: 'Renommer l’affichage personnalisé',
    icon: 'ri-edit-line',
    totals: 'Sélectionner la colonne pour le total numéraire',
    submitFn () {
      emit('updateDisplayName', { filterName: inputFilterName.value, totals: inputFilterTotals.value })
    },
  },
  delete: {
    title: 'Supprimer l’affichage actuel',
    button: 'Supprimer',
    icon: 'ri-delete-bin-line',
    input: 'Supprimer l’affichage personnalisé',
    totals: 'Sélectionner la colonne pour le total numéraire',
    submitFn () {
      emit('deleteDisplay')
    },
  },
} as const

type FilterModalType = keyof typeof filterLabelGroups;
const inputFilterName: Ref<string> = ref('')
const filterModalType: Ref<FilterModalType> = ref('create')
const inputFilterTotals: Ref<string | undefined> = ref(undefined)
const filterModalOpen = ref(false)

const closeFilterModal = () => {
  filterModalOpen.value = false
}
const filterLabelGroup = computed(() => filterLabelGroups[filterModalType.value])
const openDisplayModal = (modalType: FilterModalType) => {
  console.log('openDisplayModal', modalType)
  filterModalOpen.value = true
  filterModalType.value = modalType
  if (modalType === 'duplicate') {
    inputFilterName.value = `${props.selectedDisplay?.name} (copie)`
  } else {
    inputFilterName.value = modalType === 'create' ? '' : (props.selectedDisplay?.name || '')
  }
  inputFilterTotals.value = modalType === 'create' ? undefined : (props.selectedDisplay?.totals?.[0] ?? '')
}
const saveCurrentFilter = () => {
  filterLabelGroup.value.submitFn()
  filterModalOpen.value = false
}
const resetAgGridFilters = () => {
  emit('selectDisplay', null)
}

const defaultOption = { text: 'Aucun filtre sélectionné', value: null }
const filterList = computed(() => [defaultOption, ...props.displays.map(({ id, name }) => ({ text: name, value: id }))])

const onSelectFilterChange = ($event: string) => {
  if ($event === defaultOption.text) {
    resetAgGridFilters()
    return
  }
  emit('selectDisplay', +$event)
}

const update = () => {
  if (props.selectedDisplay) {
    emit('updateDisplay')
  }
}
</script>

<template>
  <div class="flex justify-end h-24">
    <DsfrSelect
      :model-value="selectedDisplay?.id"
      label="Sélectionner un affichage"
      default-unselected-text="Aucun affichage sélectionné"
      :options="filterList"
      @update:model-value="onSelectFilterChange($event)"
    />
    <div class="fr-mx-2v fr-mt-2v flex justify-center items-center gap-2">
      <DsfrButton
        type="submit"
        :title="selectedDisplay ? `Dupliquer l’affichage ${selectedDisplay.name}` : 'Créer un nouvel affichage personnalisé'"
        @click="openDisplayModal(selectedDisplay ? 'duplicate' : 'create')"
      >
        <VIcon :name="selectedDisplay ? 'ri-file-copy-line' : 'ri-add-line'" />
      </DsfrButton>
      <DsfrButton
        type="submit"
        :disabled="!selectedDisplay || !paginationChanged"
        title="Mettre à jour l’affichage personnalisé"
        @click="update()"
      >
        <VIcon name="ri-save-line" />
      </DsfrButton>
      <DsfrButton
        :disabled="!selectedDisplay"
        type="submit"
        title="Renommer l’affichage ou changer la colonne du total numéraire"
        @click="openDisplayModal('update')"
      >
        <VIcon name="ri-edit-line" />
      </DsfrButton>
      <DsfrButton
        :disabled="!selectedDisplay"
        type="submit"
        title="supprimer l’affichage personnalisé"
        class="fr-error-bg"
        @click="openDisplayModal('delete')"
      >
        <VIcon name="ri-delete-bin-line" />
      </DsfrButton>
    </div>
  </div>
  <DsfrModal
    :opened="filterModalOpen"
    :title="filterLabelGroup.title"
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
          :class="{'fr-error-bg': filterModalType === 'delete'}"
          :label="filterLabelGroup.button"
          :icon="{ name: filterLabelGroup.icon }"
          icon-right
          :disabled="!inputFilterName"
        />
      </div>
    </form>
  </DsfrModal>
</template>

<style scoped>
.fr-error-bg:not(:disabled) {
  background-color: var(--border-plain-error);
  color: #fff;

}

.fr-error-bg:not(:disabled)&:hover {
  background-color: var(--border-flat-error);
}
</style>
