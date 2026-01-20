<script lang="ts" setup>
import { dateToStringFr } from '@/utils'
import type { Condition, DisplayActiveFilter } from './activeFilters.type'
import type { BNColDef } from '../server-side/bn-col-def.interface'
import { FilterOperator } from '@primevue/core'
import { ACTIVE_FILTERS_DISPLAY_LABELS } from '@/shared/constants/primevue.const'

const props = withDefaults(
  defineProps<{
    filters: DisplayActiveFilter[]
    columnDefinitions: BNColDef[]
    setFilterValueTranslations?: Record<string, Record<string, string>>
    quickFilterValueTranslations?: Record<string, string>
    dropdownIdSuffix?: string
    clearAllButtonLabel?: string
  }>(),
  {
    setFilterValueTranslations: () => ({}),
    quickFilterValueTranslations: () => ({}),
    dropdownIdSuffix: () => `${Math.random().toString(36).substring(7)}`,
    clearAllButtonLabel: () => 'Tout supprimer',
  },
)

const emit = defineEmits<{
  (e: 'requestRemoveFilter', colId: string): void
  (e: 'requestRemoveAll'): void
  (e: 'dropdownOpened'): void
  (e: 'dropdownClosed'): void
}>()

const isOpen = ref(false)
const dropdownContainerRef = ref<HTMLElement | null>(null)
const dropdownContentId = computed(() => `dropdown-content-${props.dropdownIdSuffix}`)

const filterTypeTranslations = ACTIVE_FILTERS_DISPLAY_LABELS

const operatorTranslations: Record<string, string> = {
  [FilterOperator.AND]: 'ET',
  [FilterOperator.OR]: 'OU',
  'AND': 'ET',
  'OR': 'OU',
}
const noFiltersMessage = 'Aucun filtre n\'est appliqué.'

const columnLabelMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  props.columnDefinitions.forEach((colDef) => {
    if (colDef.field && colDef.headerName) {
      map[colDef.field] = colDef.headerName
    }
  })
  return map
})

const triggerButtonText = computed(() => {
  return props.filters.length <= 1 ? 'Filtre' : 'Filtres'
})
const triggerButtonTitle = computed(() => {
  return `Afficher/masquer les filtres (${props.filters.length} appliqué${props.filters.length > 1 ? 's' : ''})`
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    emit('dropdownOpened')
  } else {
    emit('dropdownClosed')
  }
}
const closeDropdown = () => {
  if (isOpen.value) {
    isOpen.value = false
    emit('dropdownClosed')
  }
}
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownContainerRef.value && !dropdownContainerRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

//#region 📍--- Helper functions for formatting filter descriptions ---📍
const formatValue = (val: any): string => {
  if (val instanceof Date) {
    return dateToStringFr(val)
  }
  if (typeof val === 'string' && !Number.isNaN(Date.parse(val)) && val.includes('-')) {
    return dateToStringFr(new Date(val))
  }
  return String(val)
}

/**
 * Formats a single condition object
 */
function formatSingleCondition (condition: Condition): string {
  const type = condition.type || ''
  const translatedType = filterTypeTranslations[type] || type

  if (['blank', 'notBlank'].includes(type) || (condition.matchMode && ['blank', 'notBlank'].includes(condition.matchMode))) {
    return translatedType
  }

  if (condition.filter !== undefined && condition.filter !== null) {
    return `${translatedType} "${formatValue(condition.filter)}"`
  }

  return translatedType
}

/** Formats a filter with an operator (AND/OR) and two conditions (condition1, condition2) or an array of conditions */
function formatOperatorFilterDescription (filter: DisplayActiveFilter): string {
  const conditionsToFormat: Condition[] = []
  if (filter.condition1) {
    conditionsToFormat.push(filter.condition1)
  }
  if (filter.condition2) {
    conditionsToFormat.push(filter.condition2)
  }

  if (!conditionsToFormat.length) {
    return '[Conditions d\'opérateur non valides]'
  }

  const translatedOperator = operatorTranslations[filter.operator!] || 'ET'
  return conditionsToFormat
    .map((cond) => formatSingleCondition(cond))
    .join(` ${translatedOperator} `)
}

/** Formats a Set Filter */
function formatSetFilterDescription (filter: DisplayActiveFilter): string {
  let rawValues = filter.values || []

  if (
    rawValues.length > 0
    && typeof rawValues[0] === 'object'
    && rawValues[0] !== null
    && 'filter' in rawValues[0]
    && Array.isArray(rawValues[0].filter)
  ) {
    rawValues = rawValues.flatMap((item: any) => item.filter)
  }

  let displayValues = rawValues.map(val => {
    if (val && typeof val === 'object') {
      if ('name' in val) {
        return val.name
      }
      if ('label' in val) {
        return val.label
      }
    }
    return String(val)
  })

  const translations = props.setFilterValueTranslations[filter.colId]
  if (translations) {
    displayValues = displayValues.map((val) => translations[val] || val)
  }

  const maxDisplayValues = 5

  if (displayValues.length > maxDisplayValues) {
    const firstValues = displayValues.slice(0, maxDisplayValues).join(', ')
    const remainingCount = displayValues.length - maxDisplayValues
    return `${filterTypeTranslations.set} [${firstValues}, ...(${remainingCount} autres)]`
  }

  return `${filterTypeTranslations.set} [${displayValues.join(', ')}]`
}

/** Central Orchestrator */
function getFilterDescriptionOnly (filter: DisplayActiveFilter): string {
  if (!filter) {
    return '[Filtre invalide]'
  }

  if ((filter.filterType === 'set' || filter.filterType === 'boolean') && Array.isArray(filter.values)) {
    return formatSetFilterDescription(filter)
  }

  if (filter.operator && (filter.condition1 || filter.condition2)) {
    return formatOperatorFilterDescription(filter)
  }

  if (filter.type) {
    return formatSingleCondition({ type: filter.type, filter: filter.filter, filterTo: (filter as any).filterTo })
  }

  if (filter.value !== undefined) {
    const specificTranslation = props.quickFilterValueTranslations[String(filter.value)]
    return specificTranslation || String(filter.value)
  }

  return `[Filtre ${filter.filterType || 'inconnu'}]`
}

/** Main formatting function */
const getFormattedFilterDisplay = (filter: DisplayActiveFilter): string => {
  if (!filter || !filter.colId) {
    return '[Filtre incorrect]'
  }
  const columnName = columnLabelMap.value[filter.colId] || filter.colId

  const description = getFilterDescriptionOnly(filter)

  return `${columnName} ${description}`
}
//#endregion

const handleRemoveFilter = (colId: string) => {
  emit('requestRemoveFilter', colId)
}
const handleRemoveAllFilters = () => {
  emit('requestRemoveAll')
  closeDropdown()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside, true)
})
</script>

<template>
  <div class="dropdown-wrapper">
    <div
      ref="dropdownContainerRef"
      class="dropdown"
      data-controller="dataController"
    >
      <DsfrButton
        id="active-filters-dropdown-trigger"
        :aria-controls="dropdownContentId"
        :aria-expanded="isOpen.toString()"
        aria-haspopup="true"
        data-menu-button-target="button"
        type="button"
        :title="triggerButtonTitle"
        secondary
        class="dropdown-button"
        @click="toggleDropdown"
      >
        <span
          v-if="filters.length > 0"
          class="fr-mr-1v"
        >
          {{ filters.length }}
        </span>
        <span>{{ triggerButtonText }}</span>
        <span
          aria-hidden="true"
          class="dropdown-icon fr-ml-2v"
        />
      </DsfrButton>
      <div
        v-show="isOpen"
        :id="dropdownContentId"
        aria-labelledby="dropdown-trigger-button"
        class="dropdown-content left-aligned fade-in-down"
        data-menu-button-target="menu"
        role="region"
        tabindex="-1"
      >
        <div class="flex flex-col p-4 gap-4">
          <div
            v-if="filters.length > 0"
            class="fr-tag-list w-full"
          >
            <div
              v-for="filterItem of filters"
              :key="filterItem.colId"
              class="fr-tag fr-tag--sm fr-tag--dismiss"
            >
              <div>
                {{ getFormattedFilterDisplay(filterItem) }}
                <button
                  class="fr-tag--dismiss"
                  title="supprimer"
                  @click="handleRemoveFilter(filterItem.colId)"
                />
              </div>
            </div>
          </div>
          <DsfrButton
            v-if="props.filters.length > 0"
            size="small"
            secondary
            @click="handleRemoveAllFilters"
          >
            {{ clearAllButtonLabel }}
          </DsfrButton>
          <div
            v-if="props.filters.length === 0"
            class="no-filters-text-dropdown"
          >
            {{ noFiltersMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dropdown-wrapper {
  display: inline-block;
}

.dropdown {
  display: inline-block;
  position: relative;
}
.dropdown-button {
  white-space: nowrap;
}

.dropdown .dropdown-button .dropdown-icon[aria-hidden='true']::after {
  content: '▾';
  display: inline-block;
  transition: transform 0.2s ease-in-out;
}

.dropdown .dropdown-button[aria-expanded='true'] .dropdown-icon[aria-hidden='true']::after {
  transform: rotate(180deg);
}

.dropdown-content.left-aligned {
  left: 0;
  right: unset;
}

.dropdown-content {
  box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 10px;
  position: absolute;
  right: 0;
  text-align: left;
  top: calc(100% + 5px);
  cursor: default;
  z-index: 11;
  border-width: 1px;
  border-style: solid;
  border-color: rgb(204, 204, 204);
  border-image: initial;
  background: rgb(255, 255, 255);
  list-style: none;
  min-width: 500px;
  width: auto;
}

.fade-in-down {
  animation-name: fade-in-down-animation;
  animation-fill-mode: forwards;
  animation-duration: 0.3s;
}

@keyframes fade-in-down-animation {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.fr-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
}
</style>
