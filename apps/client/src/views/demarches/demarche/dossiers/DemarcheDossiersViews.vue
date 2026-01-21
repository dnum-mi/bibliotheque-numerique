<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useEventListener } from '@vueuse/core'
import type { ViewWithErrors } from '@/views/demarches/demarche/dossiers/view-with-errors.type.ts'

//#region 📍------ Types ------ 📍
export type TotalsAllowed = {
  id: string
  columnLabel: string
}

type CreateSourceMode = 'current' | 'fromView'
//#endregion

//#region 📍------ Props & Emits ------ 📍
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
  (event: 'createView', view: { viewName?: string; totals?: string[]; baseViewId?: number | null }): void
  (event: 'updateView', view: { viewId: number; viewName?: string; totals?: string[] }): void
  (event: 'saveView'): void
  (event: 'deleteView'): void
}>()
//#endregion

//#region 📍------ State ------ 📍
const createSourceMode = ref<CreateSourceMode>('current')
const baseViewId = ref<string | null>(null)

const inputViewName = ref('')
const inputViewTotals = ref<string[]>([])
const viewModalOpen = ref(false)

const isDropdownOpen = ref(false)
//#endregion

//#region 📍------ Computed: View & UI ------ 📍
const currentView = computed(() => props.selectedView)

const operationSucceeded = computed(() => props.operationSuccess)

const isDirty = computed(() => !!props.paginationChanged && !!currentView.value)
const isOnView = computed(() => !!currentView.value)

const mainButtonLabel = computed(() => (!isOnView.value ? 'Créer une vue' : 'Sauvegarder'))
const mainButtonIcon = computed(() => (!isOnView.value ? 'ri-add-line' : 'ri-save-line'))

const mainButtonTitle = computed(() => {
  if (!isOnView.value) {
    return 'Créer une vue à partir du tableau actuel'
  }
  if (!props.paginationChanged) {
    return 'Aucun changement à sauvegarder'
  }
  return 'Vous avez fait des changements dans votre tableau, voulez-vous les sauvegarder sur la vue ?'
})

const defaultTotalOption = { text: 'Veuillez choisir une colonne', value: undefined, disabled: true }
const noTotalOption = { text: 'Aucun total', value: 'Aucun total' }

const defaultOption = { text: 'Aucune vue sélectionnée', value: null }
const filterList = computed(() => [defaultOption, ...props.views.map(({ id, name }) => ({ text: name, value: id }))])

const selectedLabel = computed(() => currentView.value?.name ?? defaultOption.text)

const editingViewId = ref<number | null>(null)

const editingView = computed(() => {
  if (editingViewId.value == null) { return null }
  return props.views.find(v => v.id === editingViewId.value) ?? null
})

const modalView = computed(() => editingView.value ?? currentView.value)
const modalViewId = computed<number | null>(() => modalView.value?.id ?? null)

const hydrateModalInputsFromView = (v: ViewWithErrors | null) => {
  inputViewName.value = v?.name ?? ''
  inputViewTotals.value = Array.isArray(v?.totals) ? [...v.totals] : []
}

const modalTitle = computed(() => {
  if (viewModalType.value === 'update') {
    return `Modifier la vue ${modalView.value?.name ?? ''}`.trim()
  }
  return filterLabelGroup.value.title
})

const totalsAllowedOptionsForModalView = computed(() => {
  const allowed = props.totalsAllowed ?? []
  const viewColumns = modalView.value?.columns ?? []

  const viewColumnSet = new Set(viewColumns)

  const filtered = allowed.filter((c) => viewColumnSet.has(c.id))

  return [
    defaultTotalOption,
    noTotalOption,
    ...filtered.map(({ id, columnLabel }) => ({ text: columnLabel, value: id })),
  ]
})
//#endregion

//#region 📍------ Modals ------ 📍
const normalizeTotalsForModalView = () => {
  const viewColumns = modalView.value?.columns ?? []
  const viewColumnSet = new Set(viewColumns)

  for (let i = 0; i < 2; i += 1) {
    const v = inputViewTotals.value[i]
    if (!v) {
      continue
    }
    if (v === noTotalOption.value) {
      continue
    }
    if (!viewColumnSet.has(v)) {
      inputViewTotals.value[i] = noTotalOption.value
    }
  }
}

type ViewModalType = keyof typeof viewLabelGroups

const viewModalType = ref<ViewModalType>('create')

const viewLabelGroups = {
  create: {
    title: 'Créer une nouvelle vue',
    button: 'Enregistrer',
    input: 'Nom de la vue',
    icon: 'ri-save-line',
  },
  update: {
    title: 'Renommer la vue actuelle',
    button: 'Enregistrer',
    input: 'Nom de la vue',
    icon: 'ri-edit-line',
  },
  warning: {
    title: 'Erreur : vue obsolète',
    button: 'Ok',
    icon: 'ri-file-warning-fill',
    input: 'Vue obsolète',
  },
} as const

const filterLabelGroup = computed(() => viewLabelGroups[viewModalType.value])

const closeFilterModal = () => {
  viewModalOpen.value = false
  editingViewId.value = null
}

watch(operationSucceeded, (success) => {
  if (success) {
    closeFilterModal()
  }
})

const openViewModal = (modalType: ViewModalType) => {
  viewModalOpen.value = true
  viewModalType.value = modalType

  if (modalType === 'create') {
    inputViewName.value = ''
    inputViewTotals.value = []
    createSourceMode.value = 'current'
    baseViewId.value = null
    editingViewId.value = null
    return
  }

  if (modalType === 'update') {
    hydrateModalInputsFromView(modalView.value)
    normalizeTotalsForModalView()
    return
  }

  if (modalType === 'warning') {
    hydrateModalInputsFromView(modalView.value)
  }
}

const saveCurrentFilter = () => {
  if (viewModalType.value === 'create') {
    const parsedBaseViewId = (() => {
      if (createSourceMode.value !== 'fromView') {
        return null
      }
      if (baseViewId.value == null) {
        return null
      }
      const n = Number.parseInt(baseViewId.value, 10)
      return Number.isFinite(n) ? n : null
    })()

    emit('createView', {
      viewName: inputViewName.value,
      totals: inputViewTotals.value,
      baseViewId: parsedBaseViewId,
    })
    closeFilterModal()
    return
  }

  if (viewModalType.value === 'update') {
    const viewId = modalViewId.value
    if (viewId == null) {
      return
    }
    emit('updateView', { viewId, viewName: inputViewName.value, totals: inputViewTotals.value })
    closeFilterModal()
  }
}
//#endregion

//#region 📍------ Dropdown behaviors ------ 📍
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

const onClickEditView = (viewId: number, e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()

  editingViewId.value = viewId
  closeDropdown()

  nextTick(() => openViewModal('update'))
}

const dropdownRef = useTemplateRef('dropdownRef')

useEventListener(document, 'click', (event: MouseEvent) => {
  if (!isDropdownOpen.value) {
    return
  }
  if (!dropdownRef.value) {
    return
  }
  if (!dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
})

useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDropdown()
  }
})
//#endregion

//#region 📍------ Main action ------ 📍
const onMainAction = () => {
  if (!isOnView.value) {
    openViewModal('create')
    return
  }
  if (props.paginationChanged) {
    emit('saveView')
  }
}

const deleteCurrentView = () => {
  emit('deleteView')
  closeFilterModal()
}
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
            <div class="bn-view-dropdown__row">
              <button
                type="button"
                class="bn-view-dropdown__pick"
                :aria-current="opt.value === (currentView?.id ?? null) ? 'true' : 'false'"
                @click="onPickOption(opt)"
              >
                <span class="bn-view-dropdown__text">{{ opt.text }}</span>
              </button>

              <button
                v-if="opt.value !== null"
                type="button"
                class="bn-view-dropdown__edit"
                title="Modifier la vue"
                @click="onClickEditView(opt.value, $event)"
              >
                <VIcon name="ri-edit-line" />
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="fr-mx-2v flex justify-center items-center gap-2">
      <DsfrButton
        id="main-view-action"
        type="button"
        :title="mainButtonTitle"
        :disabled="isOnView && !paginationChanged"
        :class="{ 'bn-view-save-pulse': isDirty }"
        @click="onMainAction"
      >
        <VIcon :name="mainButtonIcon" />
        {{ mainButtonLabel }}
      </DsfrButton>
    </div>
  </div>

  <DsfrModal
    :opened="viewModalOpen"
    :title="modalTitle"
    @close="closeFilterModal"
  >
    <form
      v-if="viewModalType !== 'warning'"
      class="bn-view-form"
      @submit.prevent="saveCurrentFilter()"
    >
      <div class="bn-view-form__body">
        <DsfrInput
          v-model="inputViewName"
          type="text"
          :label="filterLabelGroup.input"
          label-visible
          placeholder="Ma vue personnalisée"
        />

        <div
          v-if="viewModalType === 'create'"
          class="bn-view-section"
        >
          <div class="bn-view-section__title">
            Point de départ
          </div>

          <div class="bn-view-radio-stack">
            <DsfrRadioButton
              v-model="createSourceMode"
              name="createSourceMode"
              value="current"
              label="Partir du tableau actuel"
            />
            <DsfrRadioButton
              v-model="createSourceMode"
              name="createSourceMode"
              value="fromView"
              label="Partir d’une vue existante"
            />
          </div>

          <div
            v-if="createSourceMode === 'fromView'"
            class="bn-view-section__content"
          >
            <DsfrSelect
              v-model="baseViewId"
              label="Choisir la vue de départ"
              :options="[
                { text: 'Veuillez choisir une vue', value: null, disabled: true },
                ...views.map((v) => ({ text: v.name, value: String(v.id) })),
              ]"
            />
          </div>
        </div>

        <div class="bn-view-section">
          <div class="bn-view-section__title">
            Totaux
          </div>

          <div class="bn-view-totals-grid">
            <DsfrSelect
              v-model="inputViewTotals[0]"
              label="Total 1"
              :options="totalsAllowedOptionsForModalView"
            />
            <DsfrSelect
              v-model="inputViewTotals[1]"
              label="Total 2"
              :options="totalsAllowedOptionsForModalView"
            />
          </div>
        </div>
      </div>

      <div class="bn-view-form__footer">
        <DsfrButton
          v-if="viewModalType === 'update'"
          type="button"
          label="Supprimer"
          class="fr-error-bg"
          :icon="{ name: 'ri-delete-bin-line' }"
          icon-right
          @click="deleteCurrentView()"
        />

        <div class="bn-view-form__footer-right">
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
            :label="filterLabelGroup.button"
            :icon="{ name: filterLabelGroup.icon }"
            icon-right
            :disabled="!inputViewName"
          />
        </div>
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

:deep(.fr-label + .fr-select) {
  margin-top: 0 !important;
}

/* erreurs */
.fr-error-border:not(:disabled) {
  box-shadow: none;
  color: var(--border-plain-error);
}

.fr-error-bg:not(:disabled) {
  background-color: var(--border-plain-error);
  color: #fff;
}

/* --- Select sizing: stable --- */
.bn-view-select {
  position: relative;
  width: 240px;
  max-width: 240px;
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

/* --- Dropdown (row split: pick | edit) --- */
.bn-view-dropdown {
  position: absolute;
  left: 0;
  top: calc(100% - 1px);
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

.bn-view-dropdown__row {
  display: flex;
  align-items: stretch;
}

.bn-view-dropdown__pick {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  text-align: left;
  padding: 10px 12px;
  border: 0;
  background: transparent;
  cursor: pointer;
  min-width: 0;
}

.bn-view-dropdown__text {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bn-view-dropdown__edit {
  flex: 0 0 56px; /* zone cliquable confortable */
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  cursor: pointer;
  border-left: 1px solid var(--border-default-grey);
}

.bn-view-dropdown__pick:hover,
.bn-view-dropdown__edit:hover {
  background: var(--background-contrast-grey);
}

.bn-view-dropdown__pick[aria-current='true'] {
  font-weight: 600;
}

.bn-view-save-pulse {
  animation: bnPulse 1.2s ease-in-out infinite;
}

@keyframes bnPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

.bn-view-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bn-view-form__body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bn-view-section {
  padding: 12px;
  border: 1px solid var(--border-default-grey);
  border-radius: 8px;
  background: var(--background-default-grey);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bn-view-section__title {
  font-weight: 600;
}

.bn-view-radio-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bn-view-totals-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 720px) {
  .bn-view-totals-grid {
    grid-template-columns: 1fr;
  }
}

.bn-view-form__footer {
  padding: 0 16px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.bn-view-form__footer-right {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
