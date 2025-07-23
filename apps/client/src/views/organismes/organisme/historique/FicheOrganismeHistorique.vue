<script setup lang="ts">
import { dateToStringFr } from '@/utils'
import { EOrganismeIdType, type OrganismeIdType } from '@/stores'
import { foundationFields } from './mapping-fields/foundationFields'
import { associationFields } from './mapping-fields/associationFields'
import PersonListComparator from './components/PersonListComparator.vue'
import type { ISiafRnaOutput, ISiafRnfHistoryOutput, ISiafRnfOutput, ISiafRnaHistoryOutput } from '@biblio-num/shared'
import EmptyState from './components/EmptyState.vue'
import FieldDisplay from './components/FieldDisplay.vue'

const props = defineProps<{
  entityType: OrganismeIdType
  actual: ISiafRnfOutput | ISiafRnaOutput
  history: ISiafRnaHistoryOutput[] | ISiafRnfHistoryOutput[]
}>()

const selectedVersionNumber = ref<number | null>(null)

const fieldDefinitions = computed(() => {
  return props.entityType === EOrganismeIdType.Rna ? associationFields : foundationFields
})

const selectedVersion = computed<ISiafRnaHistoryOutput | ISiafRnfHistoryOutput | null>(() => {
  if (selectedVersionNumber.value === null) {
    return null
  }
  return props.history.find((v: any) => v.version === selectedVersionNumber.value) ?? null
})

const versionOptions = computed(() => {
  return props.history.map((v) => ({
    value: v.version,
    text: `${dateToStringFr(v.updatedAt!)} (Version ${v.version})`,
  }))
})

const selectedEntityVersion = computed(() => {
  return props.entityType === EOrganismeIdType.Rna
    ? (selectedVersion.value as ISiafRnaHistoryOutput).association
    : (selectedVersion.value as ISiafRnfHistoryOutput).foundation
})

const comparisonData = computed(() => {
  if (!selectedEntityVersion.value) {
    return null
  }
  const previous = selectedEntityVersion.value

  return fieldDefinitions.value.map((item) => {
    if (item.type === 'header') {
      return item
    }

    const currentValue = item.accessor?.(props.actual as any)
    const previousValue = item.accessor?.(previous as any)
    return {
      type: 'field',
      key: item.key,
      label: item.label,
      currentValue,
      previousValue,
      hasChanged: JSON.stringify(currentValue) !== JSON.stringify(previousValue),
    }
  })
})
</script>

<template>
  <div class="flex flex-col gap-4 py-4 w-full">
    <EmptyState
      v-if="props.history.length < 1"
      :entity-type="entityType"
    />
    <div v-else>
      <div class="flex items-center justify-between px-4 py-2">
        <DsfrSelect
          class="w-full"
          label="Comparer la version actuelle avec la version :"
          default-unselected-text="Sélectionner une version"
          border-bottom
          :options="versionOptions"
          :model-value="selectedVersionNumber"
          @update:model-value="(newValue) => (selectedVersionNumber = Number(newValue))"
        />
        <div
          v-if="selectedVersion"
          class="flex flex-col"
        >
          <span class="text-xs font-bold mb-2">Légende</span>
          <div class="flex items-center justify-center gap-4">
            <span class="legend-border legend--modified">
              <i>Donnée modifiée</i>
            </span>
            <span class="legend-border legend--added">
              <i>Donnée ajoutée</i>
            </span>
            <span class="legend-border legend--removed">
              <i>Donnée supprimée</i>
            </span>
          </div>
        </div>
      </div>
      <div
        v-if="selectedVersion"
        class="flex flex-col gap-4 bg-white px-6 py-2"
      >
        <div class="simple-fields-grid">
          <h3 class="grid-header">
            Version actuelle - {{ dateToStringFr(actual.updatedAt) }}
          </h3>
          <h3 class="grid-header">
            Version sélectionnée - {{ dateToStringFr(selectedVersion.updatedAt) }} (v{{ selectedVersion.version }})
          </h3>

          <template
            v-for="(item, index) in comparisonData"
            :key="index"
          >
            <div
              v-if="item.type === 'header'"
              class="section-header"
            >
              {{ item.label }}
            </div>
            <template v-else-if="item.type === 'field' && 'currentValue' in item && 'previousValue' in item && 'hasChanged' in item">
              <FieldDisplay
                :label="item.label"
                :value="item.currentValue!"
                :other-value="item.previousValue"
                :has-changed="item.hasChanged"
              />
              <FieldDisplay
                :label="item.label"
                :value="item.previousValue!"
                :other-value="item.currentValue"
                :has-changed="item.hasChanged"
              />
            </template>
          </template>
        </div>

        <div class="flex flex-col">
          <template v-if="entityType === EOrganismeIdType.Rnf">
            <div class="section-header">
              Liste des Personnes
            </div>
            <PersonListComparator
              title="Personnes"
              :current-persons="(actual as ISiafRnfOutput).persons || []"
              :previous-persons="(selectedEntityVersion as ISiafRnfOutput).persons || []"
            />
          </template>
        </div>
      </div>

      <div
        v-else
        class="text-center py-16 px-4 bg-gray-100 rounded-lg"
      >
        <p class="m-0 text-gray-600">
          Sélectionnez une version pour démarrer la comparaison.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.simple-fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1rem;
}

.grid-header {
  grid-column: span 1;
  font-weight: 600;
  font-size: 1.125rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--grey-925-125);
}

.section-header {
  grid-column: 1 / -1;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-active-blue-france);
  margin-top: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--blue-france-950-100);
}

.section-header:first-of-type {
  margin-top: 0;
}

.legend-border {
  font-size: 0.75rem;
  border-left: 4px solid transparent;
  transition:
    background-color 0.2s ease-in-out,
    border-color 0.2s ease-in-out;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
}

.legend--added {
  border-left-color: var(--success-425-625-active);
  background-color: var(--success-975-75);
}

.legend--removed {
  border-left-color: var(--red-marianne-425-625);
  background-color: var(--red-marianne-975-75);
}

.legend--modified {
  border-left-color: var(--yellow-tournesol-925-125-active);
  background-color: var(--yellow-tournesol-975-75);
}
</style>
