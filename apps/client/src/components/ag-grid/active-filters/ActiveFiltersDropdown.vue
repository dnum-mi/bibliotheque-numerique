<script lang="ts" setup>
import { dateToStringFr } from '@/utils'
import type { Condition, DisplayActiveFilter } from './activeFilters.type'
import type { BNColDef } from '../server-side/bn-col-def.interface'

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
  (e: 'requestClearAll'): void
  (e: 'dropdownOpened'): void
  (e: 'dropdownClosed'): void
}>()

const isOpen = ref(false)
const dropdownContainerRef = ref<HTMLElement | null>(null)
const dropdownContentId = computed(() => `dropdown-content-${props.dropdownIdSuffix}`)

const filterTypeTranslations: Record<string, string> = {
  contains: 'contient',
  notContains: 'ne contient pas',
  equals: 'égal à',
  notEqual: 'différent de',
  startsWith: 'commence par',
  endsWith: 'finit par',
  blank: 'est vide',
  notBlank: 'n\'est pas vide',
  lessThan: 'inférieur à',
  lessThanOrEqual: 'inférieur ou égal à',
  greaterThan: 'supérieur à',
  greaterThanOrEqual: 'supérieur ou égal à',
  inRange: 'entre',
  set: 'contient un de',
  numbers: 'est un de',
  strings: 'est un de',
}
const operatorTranslations: Record<string, string> = { AND: 'ET', OR: 'OU' }
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

//#region 📍--- Help functions for formatting filter descriptions ---📍
/**
 * Formats a single condition object
 */
function formatSingleCondition (condition: Condition, parentFilterType: DisplayActiveFilter['filterType']): string {
  const type = condition.type || ''
  const translatedType = filterTypeTranslations[type] || type
  let valuePart = ''

  if (parentFilterType === 'date' || condition.filterType === 'date') {
    if (condition.type === 'inRange') {
      const dateFrom = dateToStringFr(condition.dateFrom)
      const dateTo = dateToStringFr(condition.dateTo)
      valuePart = ` "${dateFrom}" et "${dateTo}"`
    } else if (condition.dateFrom && condition.type !== 'blank' && condition.type !== 'notBlank') {
      valuePart = ` "${dateToStringFr(condition.dateFrom)}"`
    }
  } else {
    if (condition.type === 'inRange') {
      valuePart = ` "${condition.filter}" et "${condition.filterTo}"`
    } else if (condition.filter && condition.type !== 'blank' && condition.type !== 'notBlank') {
      valuePart = ` "${condition.filter}"`
    }
  }
  return `${translatedType}${valuePart}`
}

/** Formats a filter with an operator (AND/OR) and two conditions (condition1, condition2) or an array of conditions */
function formatOperatorFilterDescription (filter: DisplayActiveFilter): string {
  const conditionsToFormat: Condition[] = []
  if (filter.condition1 && filter.condition2) {
    conditionsToFormat.push(filter.condition1, filter.condition2)
  } else if (Array.isArray(filter.conditions)) {
    conditionsToFormat.push(...filter.conditions)
  }

  if (conditionsToFormat.length > 0) {
    const translatedOperator = operatorTranslations[filter.operator!] || filter.operator!
    return conditionsToFormat.map((cond) => formatSingleCondition(cond, filter.filterType)).join(` ${translatedOperator} `)
  }
  return '[Conditions d\'opérateur non valides]'
}

/** Formats a Set Filter */
function formatSetFilterDescription (filter: DisplayActiveFilter): string {
  let displayValues = filter.values!.map(String)
  const translations = props.setFilterValueTranslations[filter.colId]
  if (translations) {
    displayValues = displayValues.map((val) => translations[val] || val)
  }

  const maxDisplayValues = 5
  let displayText: string
  if (displayValues.length > maxDisplayValues) {
    const firstValues = displayValues.slice(0, maxDisplayValues).join(', ')
    const remainingCount = displayValues.length - maxDisplayValues
    displayText = `${firstValues}, ...(${remainingCount} autres)`
  } else {
    displayText = displayValues.join(', ')
  }
  return `${filterTypeTranslations.set} [${displayText}]`
}

/** Formats a numbers filter */
function formatNumbersFilterDescription (filter: DisplayActiveFilter): string {
  const displayValues = (filter.filter as number[]).map(String).join(', ')
  return `${filterTypeTranslations.numbers} [${displayValues}]`
}

/** Formats a strings filter */
function formatStringsFilterDescription (filter: DisplayActiveFilter): string {
  const displayValues = (filter.filter as number[]).map(String).join(', ')
  return `${filterTypeTranslations.strings} [${displayValues}]`
}

/** Formats a Multi Filter */
function formatMultiFilterDescription (filter: DisplayActiveFilter): string {
  if (!Array.isArray(filter.filterModels) || filter.filterModels.length === 0) {
    return '[Filtre multiple vide ou malformé]'
  }

  const descriptions: string[] = []
  for (const subModel of filter.filterModels) {
    if (subModel) {
      const subDescription = getFilterDescriptionOnly(subModel as DisplayActiveFilter, filter.colId)

      if (
        subDescription
        && !subDescription.startsWith('[Filtre invalide]')
        && !subDescription.startsWith('[Filtre multiple')
        && !subDescription.startsWith('[Condition')
      ) {
        descriptions.push(subDescription)
      }
    }
  }

  if (descriptions.length === 0) {
    return '[Filtre multiple avec conditions non actives ou malformées]'
  }

  return descriptions.join(` ${operatorTranslations.AND || 'ET'} `)
}

/** Formats "value-only" filters */
function formatValueOnlyFilterDescription (filter: DisplayActiveFilter): string {
  const specificTranslation = props.quickFilterValueTranslations[filter.value as string]
  if (specificTranslation) {
    return specificTranslation
  }
  return String(filter.value)
}

/** Central Orchestrator */
function getFilterDescriptionOnly (filter: DisplayActiveFilter | null | undefined, forColId?: string): string {
  if (!filter) {
    return '[Filtre invalide]'
  }

  const colIdToUse = forColId || filter.colId
  const currentFilterWithCorrectColId: DisplayActiveFilter = { ...filter, colId: colIdToUse }

  if (currentFilterWithCorrectColId.filterType === 'set' && Array.isArray(currentFilterWithCorrectColId.values)) {
    return formatSetFilterDescription(currentFilterWithCorrectColId)
  }
  if (currentFilterWithCorrectColId.filterType === 'numbers' && Array.isArray(currentFilterWithCorrectColId.filter)) {
    return formatNumbersFilterDescription(currentFilterWithCorrectColId)
  }
  if (currentFilterWithCorrectColId.filterType === 'strings' && Array.isArray(currentFilterWithCorrectColId.filter)) {
    return formatStringsFilterDescription(currentFilterWithCorrectColId)
  }

  if (currentFilterWithCorrectColId.filterType === 'multi' && colIdToUse) {
    return formatMultiFilterDescription(currentFilterWithCorrectColId)
  }
  if (
    currentFilterWithCorrectColId.operator
    && (currentFilterWithCorrectColId.condition1 || Array.isArray(currentFilterWithCorrectColId.conditions))
  ) {
    return formatOperatorFilterDescription(currentFilterWithCorrectColId)
  }
  if (currentFilterWithCorrectColId.type) {
    return formatSingleCondition(currentFilterWithCorrectColId as unknown as Condition, currentFilterWithCorrectColId.filterType)
  }
  if (
    Object.prototype.hasOwnProperty.call(currentFilterWithCorrectColId, 'value')
    && !currentFilterWithCorrectColId.type
    && !currentFilterWithCorrectColId.filterType
    && !currentFilterWithCorrectColId.operator
  ) {
    return formatValueOnlyFilterDescription(currentFilterWithCorrectColId)
  }

  return `[Filtre ${currentFilterWithCorrectColId.filterType || 'inconnu'} non formaté]`
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
const handleClearAllFilters = () => {
  emit('requestClearAll')
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
          v-if="props.filters.length > 0"
          class="fr-mr-1v"
        >
          {{ props.filters.length }}
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
            v-if="props.filters.length > 0"
            class="fr-tag-list w-full"
          >
            <div
              v-for="filterItem in props.filters"
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
            @click="handleClearAllFilters"
          >
            {{ props.clearAllButtonLabel }}
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
