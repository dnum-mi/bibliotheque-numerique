<script lang="ts" setup>
import { watch, computed, ref } from 'vue'
import type { ViewWithErrors } from '@/views/demarches/demarche/dossiers/view-with-errors.type.ts'
import { useEventListener } from '@vueuse/core'

export type TotalsAllowed = {
  id: string
  columnLabel: string
}

const props = withDefaults(
  defineProps<{
    views: ViewWithErrors[]
    paginationChanged?: boolean
    selectedView?: ViewWithErrors | null
    totalsAllowed?: TotalsAllowed[]
    operationSuccess?: boolean
  }>(),
  {
    views: () => [],
    selectedView: null,
    totalsAllowed: () => [],
  },
)

const emit = defineEmits<{
  (event: 'selectView', viewId: number | null): void
  (event: 'reselectView', viewId: number): void
  (event: 'createView', view: { viewName?: string; totals?: string[] }): void
  (event: 'updateViewName', view: { viewName?: string; totals?: string[] }): void
  (event: 'updateView'): void
  (event: 'deleteView'): void
}>()

const defaultTotalOption = { text: 'Veuillez choisir une colonne', value: undefined, disabled: true }
const noTotalOption = { text: 'Aucun total', value: 'Aucun total' }
const totalsAllowedOptions = computed(() => [
  defaultTotalOption,
  noTotalOption,
  ...props.totalsAllowed.map(({ id, columnLabel }) => ({ text: columnLabel, value: id })),
])

const currentView = computed(() => props.selectedView)

type ViewModalType = keyof typeof viewLabelGroups
const inputViewName = ref('')
const viewModalType = ref<ViewModalType>('create')
const inputViewTotals = ref<string[]>([])
const viewModalOpen = ref(false)
const operationSucceeded = computed(() => props.operationSuccess)

const viewLabelGroups = {
  duplicate: {
    title: `Dupliquer la vue ${currentView.value?.name}`,
    button: 'Enregistrer',
    input: 'Nommer la nouvelle vue',
    icon: 'ri-save-line',
    submitFn () {
      emit('createView', { viewName: inputViewName.value, totals: inputViewTotals.value })
    },
  },
  create: {
    title: 'Créer une nouvelle vue personnalisée',
    button: 'Enregistrer',
    input: 'Nommer la vue personnalisée',
    icon: 'ri-save-line',
    submitFn () {
      emit('createView', { viewName: inputViewName.value, totals: inputViewTotals.value })
    },
  },
  update: {
    title: 'Renommer la vue actuelle',
    button: 'Enregistrer',
    input: 'Renommer la vue personnalisée',
    icon: 'ri-edit-line',
    submitFn () {
      emit('updateViewName', { viewName: inputViewName.value, totals: inputViewTotals.value })
    },
  },
  delete: {
    title: 'Supprimer la vue actuelle',
    button: 'Supprimer',
    icon: 'ri-delete-bin-line',
    input: 'Supprimer la vue personnalisée',
    submitFn () {
      emit('deleteView')
    },
  },
  warning: {
    title: 'Erreur : vue obsolète',
    button: 'Ok',
    icon: 'ri-file-warning-fill',
    input: 'Vue obsolète',
    submitFn () {
      emit('deleteView')
    },
  },
} as const

const closeFilterModal = () => {
  viewModalOpen.value = false
}
watch(operationSucceeded, (success: boolean) => {
  if (success) {
    viewModalOpen.value = false
    closeFilterModal()
  }
})

const filterLabelGroup = computed(() => viewLabelGroups[viewModalType.value])
const openViewModal = (modalType: ViewModalType) => {
  viewModalOpen.value = true
  viewModalType.value = modalType
  if (modalType === 'duplicate') {
    inputViewName.value = `${currentView.value?.name} (copie)`
  } else {
    inputViewName.value = modalType === 'create' ? '' : currentView.value?.name || ''
  }
  inputViewTotals.value = modalType === 'create' ? [] : currentView.value?.totals ?? []
}
const saveCurrentFilter = () => {
  filterLabelGroup.value.submitFn()
  closeFilterModal()
}

const defaultOption = { text: 'Aucune vue sélectionnée', value: null }
const filterList = computed(() => [defaultOption, ...props.views.map(({ id, name }) => ({ text: name, value: id }))])

const update = () => {
  if (currentView.value) { emit('updateView') }
}

//#region ------ VIEW "FAUX SELECT" (permet le reselect) ------
const isDropdownOpen = ref(false)

const selectedLabel = computed(() => currentView.value?.name ?? defaultOption.text)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const onPickOption = (opt: { text: string; value: number | null }) => {
  const nextId = opt.value
  const currentId = currentView.value?.id ?? null

  closeDropdown()

  if (nextId === null) {
    emit('selectView', null)
    return
  }

  if (nextId === currentId) {
    emit('reselectView', nextId)
    return
  }

  emit('selectView', nextId)
}

const dropdownRef = useTemplateRef('dropdownRef')

useEventListener(document, 'click', (event: MouseEvent) => {
  if (!isDropdownOpen.value) { return }
  if (!dropdownRef.value) { return }
  if (!dropdownRef.value.contains(event.target as Node)) { closeDropdown() }
})

useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape') { closeDropdown() }
})
//#endregion
</script>

<template>
  <div class="flex justify-end items-center fr-mx-2v">
    <DsfrButton
      v-if="selectedView?.disabledColumns?.length"
      class="fr-mx-2v fr-error-border"
      type="submit"
      no-outline
      secondary
      title="Vue obsolète, veuillez le mettre à jour"
      @click="openViewModal('warning')"
    >
      <VIcon
        scale="1.5"
        name="ri-file-warning-fill"
      />
    </DsfrButton>

    <!-- Faux select DSFR -->
    <div
      ref="dropdownRef"
      class="bn-view-select fr-select-group fr-mb-0!"
    >
      <button
        id="custom-view-select"
        class="bn-view-select__button fr-select"
        type="button"
        title="Sélectionner une vue"
        :aria-expanded="isDropdownOpen"
        aria-haspopup="listbox"
        @click="toggleDropdown"
      >
        <span class="bn-view-select__label">{{ selectedLabel }}</span>
      </button>

      <div
        v-if="isDropdownOpen"
        class="bn-view-dropdown"
        role="listbox"
        aria-label="Sélectionner une vue"
      >
        <ul class="bn-view-dropdown__list">
          <li
            v-for="opt in filterList"
            :key="String(opt.value)"
            class="bn-view-dropdown__item"
          >
            <button
              type="button"
              class="bn-view-dropdown__option"
              :aria-current="opt.value === (currentView?.id ?? null) ? 'true' : 'false'"
              @click="onPickOption(opt)"
            >
              <span class="bn-view-dropdown__text">{{ opt.text }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="fr-mx-2v flex justify-center items-center gap-2">
      <DsfrButton
        id="create-duplicate-filter-button"
        type="submit"
        :title="selectedView ? `Dupliquer la vue ${selectedView.name}` : 'Créer une nouvelle vue personnalisée'"
        @click="openViewModal(selectedView ? 'duplicate' : 'create')"
      >
        <VIcon :name="selectedView ? 'ri-file-copy-line' : 'ri-add-line'" />
      </DsfrButton>

      <DsfrButton
        id="update-filter-button"
        type="submit"
        :disabled="!selectedView || !paginationChanged"
        title="Mettre à jour la vue personnalisée"
        @click="update()"
      >
        <VIcon name="ri-save-line" />
      </DsfrButton>

      <DsfrButton
        id="rename-filter-button"
        :disabled="!selectedView"
        type="submit"
        title="Renommer la vue"
        @click="openViewModal('update')"
      >
        <VIcon name="ri-edit-line" />
      </DsfrButton>

      <DsfrButton
        id="delete-filter-button"
        :disabled="!selectedView"
        type="submit"
        title="Supprimer la vue personnalisée"
        class="fr-error-bg"
        @click="openViewModal('delete')"
      >
        <VIcon name="ri-delete-bin-line" />
      </DsfrButton>
    </div>
  </div>

  <DsfrModal
    :opened="viewModalOpen"
    :title="filterLabelGroup.title"
    @close="closeFilterModal"
  >
    <form
      v-if="viewModalType !== 'warning'"
      class="flex flex-col gap-8"
      @submit.prevent="saveCurrentFilter()"
    >
      <div class="flex flex-col m-4">
        <DsfrInput
          v-model="inputViewName"
          type="text"
          :label="filterLabelGroup.input"
          label-visible
          class="mb-4"
          placeholder="Ma vue personnalisée"
          :readonly="viewModalType === 'delete'"
        />

        <DsfrSelect
          v-if="viewModalType !== 'delete'"
          v-model="inputViewTotals[0]"
          label="Sélectionner la colonne pour le total numéraire"
          :options="totalsAllowedOptions"
        />

        <DsfrSelect
          v-if="viewModalType !== 'delete'"
          v-model="inputViewTotals[1]"
          label="Sélectionner la colonne pour le deuxième total numéraire"
          :options="totalsAllowedOptions"
        />
      </div>

      <div class="flex justify-end gap-4">
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
          :class="{ 'fr-error-bg': viewModalType === 'delete' }"
          :label="filterLabelGroup.button"
          :icon="{ name: filterLabelGroup.icon }"
          icon-right
          :disabled="!inputViewName"
        />
      </div>
    </form>

    <div v-else>
      <p>
        Cette vue est désormais <strong>obsolète</strong>.<br>
        Cela signifie qu'une ou plusieurs des colonnes utilisées dans cette vue ont été supprimées par l'administrateur dans la
        configuration de la démarche.<br>
        Veuillez la supprimer, ou la mettre à jour.
      </p>
      <DsfrButton
        type="submit"
        label="Ok"
        class="float-right mb-5"
        @click="closeFilterModal()"
      />
    </div>
  </DsfrModal>
</template>

<style scoped>
.fr-select-group:not(:last-child) {
  margin-bottom: 0 !important;
}

.fr-error-border:not(:disabled) {
  box-shadow: none;
  color: var(--border-plain-error);
}

.fr-error-bg:not(:disabled) {
  background-color: var(--border-plain-error);
  color: #fff;
}

.fr-error-bg:not(:disabled) &:hover {
  background-color: var(--border-flat-error);
}

:deep(.fr-label + .fr-select) {
  margin-top: 0 !important;
}

/* --- Select sizing: stable and small --- */
.bn-view-select {
  position: relative;
  width: 220px; /* taille stable (petit) */
  max-width: 220px;
}

.bn-view-select__button {
  width: 100%;
}

.bn-view-select__label {
  display: block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* --- Dropdown: collé + même largeur --- */
.bn-view-dropdown {
  position: absolute;
  left: 0;
  top: calc(100% - 1px); /* collé au bouton (petit overlap pour éviter un “gap”) */
  width: 100%;
  z-index: 50;
  background: var(--background-default-grey);
  border: 1px solid var(--border-default-grey);
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 320px;
  overflow: auto;
}

.bn-view-dropdown__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* --- Items: full row clickable + padding + breathing --- */
.bn-view-dropdown__item {
  width: 100%;
}

.bn-view-dropdown__option {
  width: 100%;
  display: flex;
  align-items: center;
  text-align: left;
  padding: 10px 12px; /* ça respire */
  border: 0;
  background: transparent;
  cursor: pointer;
}

.bn-view-dropdown__option:hover {
  background: var(--background-contrast-grey);
}

.bn-view-dropdown__text {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Option “active” (aria-current) */
.bn-view-dropdown__option[aria-current='true'] {
  font-weight: 600;
}
</style>
