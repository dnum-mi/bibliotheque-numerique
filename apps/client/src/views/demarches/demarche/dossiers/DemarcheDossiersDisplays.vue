<script lang="ts" setup>
import { watch, computed, ref } from 'vue'
import type { CustomFilterWithErrors } from '@/views/demarches/demarche/dossiers/custom-filter-with-errors.type'
import type { ICustomFilterWithError } from '@biblio-num/shared/types/interfaces/custom-filters/custom-filters.interface'

export type TotalsAllowed = {
  id: string,
  columnLabel: string,
}

const props = withDefaults(defineProps<{
  displays?: CustomFilterWithErrors[],
  paginationChanged?: boolean
  selectedDisplay?: ICustomFilterWithError | null,
  totalsAllowed?: TotalsAllowed[]
  operationSuccess?: boolean
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

const currentDisplay = computed(() => props.selectedDisplay)
const filterLabelGroups = {
  duplicate: {
    title: `Dupliquer l’affichage ${currentDisplay.value?.name}`,
    button: 'Enregistrer',
    input: 'Nommer le nouvel affichage',
    icon: 'ri-save-line',
    submitFn () {
      emit('createDisplay', { filterName: inputFilterName.value, totals: inputFilterTotals.value })
    },
  },
  create: {
    title: 'Créer un nouvel affichage personnalisé',
    button: 'Enregistrer',
    input: 'Nommer l’affichage personnalisé',
    icon: 'ri-save-line',
    submitFn () {
      emit('createDisplay', { filterName: inputFilterName.value, totals: inputFilterTotals.value })
    },
  },
  update: {
    title: 'Renommer l’affichage actuel',
    button: 'Enregistrer',
    input: 'Renommer l’affichage personnalisé',
    icon: 'ri-edit-line',
    submitFn () {
      emit('updateDisplayName', { filterName: inputFilterName.value, totals: inputFilterTotals.value })
    },
  },
  delete: {
    title: 'Supprimer l’affichage actuel',
    button: 'Supprimer',
    icon: 'ri-delete-bin-line',
    input: 'Supprimer l’affichage personnalisé',
    submitFn () {
      emit('deleteDisplay')
    },
  },
  warning: {
    title: 'Erreur : affichage obsolète',
    button: 'Ok',
    icon: 'ri-file-warning-fill',
    input: 'Affichage obsolète',
    submitFn () {
      emit('deleteDisplay')
    },
  },
} as const

type FilterModalType = keyof typeof filterLabelGroups;
const inputFilterName = ref('')
const filterModalType = ref<FilterModalType>('create')
const inputFilterTotals = ref<string>()
const filterModalOpen = ref(false)
const operationSucceeded = computed(() => props.operationSuccess)

watch(operationSucceeded, (success: boolean) => {
  if (success) {
    filterModalOpen.value = false
    closeFilterModal()
  }
})

const closeFilterModal = () => {
  filterModalOpen.value = false
}
const filterLabelGroup = computed(() => filterLabelGroups[filterModalType.value])
const openDisplayModal = (modalType: FilterModalType) => {
  filterModalOpen.value = true
  filterModalType.value = modalType
  if (modalType === 'duplicate') {
    inputFilterName.value = `${currentDisplay.value?.name} (copie)`
  } else {
    inputFilterName.value = modalType === 'create' ? '' : (currentDisplay.value?.name || '')
  }
  inputFilterTotals.value = modalType === 'create' ? undefined : (currentDisplay.value?.totals?.[0] ?? '')
}
const saveCurrentFilter = () => {
  filterLabelGroup.value.submitFn()
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
  if (currentDisplay.value) {
    emit('updateDisplay')
  }
}
</script>

<template>
  <div class="flex justify-end items-center h-24">
    <DsfrButton
      v-if="selectedDisplay?.disabledColumns?.length"
      class="fr-mx-2v fr-mt-2v fr-error-border"
      type="submit"
      no-outline
      secondary
      title="Affichage obsolète, veuillez le mettre à jour"
      @click="openDisplayModal('warning')"
    >
      <VIcon
        scale="1.5"
        name="ri-file-warning-fill"
      />
    </DsfrButton>
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
      v-if="filterModalType !== 'warning'"
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
          :label="'Sélectionner la colonne pour le total numéraire'"
          :options="totalsAllowedOptions"
        />
      </div>
      <div class="flex  justify-end  gap-4">
        <DsfrButton
          type="button"
          label="Annuler"
          tertiary
          :icon="{ name: 'ri-arrow-go-back-line' }"
          icon-right
          @click="closeFilterModal()"
        />
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
    <div v-else>
      <p>
        Cette affichage est désormais <strong>obsolète</strong>. <br>
        Cela signifie qu'une ou plusieurs des colonnes utilisées dans cet affichage ont été supprimées par l'administrateur dans la configuration de la démarche.
        <br>
        Veuillez le supprimer, ou le mettre à jour.
      </p>
      <DsfrButton
        type="submit"
        :label="'Ok'"
        class="float-right mb-5"
        @click="closeFilterModal()"
      />
    </div>
  </DsfrModal>
</template>

<style scoped>
.fr-error-border:not(:disabled) {
  box-shadow: none;
  color: var(--border-plain-error);
}

.fr-error-bg:not(:disabled) {
  background-color: var(--border-plain-error);
  color: #fff;
}

.fr-error-bg:not(:disabled)&:hover {
  background-color: var(--border-flat-error);
}
</style>
