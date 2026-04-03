<script setup lang="ts">
import { getJobPositionWeight, jobPositionArray } from '@biblio-num/shared'
import type { ILegalEntity } from '@biblio-num/shared'
import { dateToStringFr } from '@/utils/date-to-string'
import { firstUpperCase } from '@/utils/first-upper-case'
import DataTableClientSide from '@/components/datatable/client-side/DataTableClientSide.vue'
import type { HeaderDataTable } from '@/shared/types'
import PersonExitBadge from './PersonExitBadge.vue'
import { getRepresentativeLabel, hasLegalEntity } from './legal-entity.utils'
import type { IPersonTableRow, IPersonView } from './members.type'
import PersonIsFounderBadge from './PersonIsFounderBadge.vue'

const props = defineProps<{
  activePersons: IPersonView[]
  formerPersons: IPersonView[]
}>()

const baseHeaders: HeaderDataTable[] = [
  { field: 'id', text: 'Id', type: 'hidden' },
  {
    field: 'isFounder',
    text: 'Fondateur',
    renderer: markRaw(PersonIsFounderBadge),
    filterable: true,
    filter: 'agBooleanColumnFilter',
    filterParams: {
      values: ['true', 'false'],
      valueFormatter: (params: { value: string }) => (params.value === 'true' ? 'Oui' : 'Non'),
    },
  },
  { field: 'fullName', text: 'Nom Prénom' },
  {
    field: 'jobPosition',
    text: 'Fonction',
    filterable: true,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: [...jobPositionArray],
    },
  },
  {
    field: 'entryAt',
    text: 'Date d\'entrée',
    valueFormatter: (params: { value: string }) => params.value ? dateToStringFr(params.value) : '-',
    filterable: true,
    filter: 'agMultiColumnFilter',
    type: 'date',
  },
  {
    field: 'exitAt',
    text: 'Date de sortie',
    renderer: markRaw(PersonExitBadge),
    filterable: true,
    filter: 'agMultiColumnFilter',
    type: 'date',
  },
  {
    field: '_raw',
    text: 'Représentant',
    valueFormatter: (params: { value: IPersonTableRow }) => getRepresentativeLabel(params.value),
  },
  {
    field: 'legalEntity',
    text: 'Type de personne morale représentée',
    valueFormatter: (params: { value: ILegalEntity }) => params.value?.type || '-',
  },
]

const mapForTable = (persons: IPersonView[]): IPersonTableRow[] => {
  return persons.map(person => ({
    ...person,
    fullName: `${person.lastName.toUpperCase()} ${firstUpperCase(person.firstName)}`,
    _raw: person,
    authorized: true,
    cursor: person.id,
  }))
}

const activeRows = computed(() => {
  return mapForTable(props.activePersons)
    .sort((a, b) => getJobPositionWeight(a.jobPosition) - getJobPositionWeight(b.jobPosition))
})

const formerRows = computed(() => {
  return mapForTable(props.formerPersons)
})

const createHeaders = (data: IPersonTableRow[]) => {
  let h = [...baseHeaders]
  if (!hasLegalEntity(data)) {
    h = h.filter(col => col.field !== 'legalEntity')
  }
  return h
}

const currentHeaders = computed(() => createHeaders(activeRows.value))
const formerHeaders = computed(() => createHeaders(formerRows.value))
</script>

<template>
  <div class="flex flex-col gap-y-8">
    <section v-if="activeRows.length">
      <DataTableClientSide
        title="Liste synthétique actuelle"
        :headers="currentHeaders"
        :rows-data="activeRows"
        :pagination-page-size="20"
      />
    </section>

    <section>
      <DataTableClientSide
        title="Liste synthétique historique"
        :headers="formerHeaders"
        :rows-data="formerRows"
        :pagination-page-size="20"
      />
    </section>
  </div>
</template>
