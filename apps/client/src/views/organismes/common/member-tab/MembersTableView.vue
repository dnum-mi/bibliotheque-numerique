<script setup lang="ts">
import { getJobPositionWeight, jobPositionArray } from '@biblio-num/shared'
import type { ILegalEntity, IPerson } from '@biblio-num/shared'
import { dateToStringFr } from '@/utils/date-to-string'
import { firstUpperCase } from '@/utils/first-upper-case'
import DataTableClientSide from '@/components/datatable/client-side/DataTableClientSide.vue'
import type { RowDataType } from '@/components/datatable/client-side/DataTableClientSide.vue'
import type { HeaderDataTable } from '@/shared/types'
import PersonStatutBadge from './PersonStatutBadge.vue'
import PersonExitBadge from './PersonExitBadge.vue'
import { getRepresentativeLabel, hasLegalEntity } from './legal-entity.utils'

export type IPersonWithAuthorizeOption = IPerson & RowDataType

export interface IPersonExtended extends IPerson {
  fullName?: string
}

const props = defineProps<{
  persons: IPersonExtended[]
}>()

const baseHeaders: HeaderDataTable[] = [
  { field: 'id', text: 'Id', type: 'hidden' },
  { field: 'isFounder', text: 'Statut', renderer: markRaw(PersonStatutBadge) },
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
    valueFormatter: (params: { value: IPersonExtended }) => getRepresentativeLabel(params.value),
  },
  {
    field: 'legalEntity',
    text: 'Type de personne morale représentée',
    valueFormatter: (params: { value: ILegalEntity }) => params.value?.type || '-',
  },
]

const rowsData = computed<IPersonWithAuthorizeOption[]>(() => {
  return (props.persons || []).map((person) => ({
    ...person,
    fullName: `${person.lastName.toUpperCase()} ${firstUpperCase(person.firstName)}`,
    _raw: person,
    authorized: true,
    cursor: person.id,
  }
  ))
})

const currentPeople = computed(() => {
  const dateNow = new Date()
  return rowsData.value
    .filter(person => {
      if (!person.exitAt) {
        return true
      }

      return new Date(person.exitAt) > dateNow
    })
    .sort((a, b) => getJobPositionWeight(a.jobPosition) - getJobPositionWeight(b.jobPosition))
},
)

const formerPeople = computed(() => {
  const dateNow = new Date()
  return rowsData.value
    .filter(person => {
      if (!person.exitAt) {
        return false
      }

      return new Date(person.exitAt) <= dateNow
    })
    .sort((a, b) => new Date(b.exitAt!).getTime() - new Date(a.exitAt!).getTime())
},
)

const createHeaders = (data: IPersonWithAuthorizeOption[]) => {
  let h = [...baseHeaders]
  if (!hasLegalEntity(data)) {
    h = h.filter(col => col.field !== 'legalEntity')
  }
  return h
}

const currentHeaders = computed(() => createHeaders(currentPeople.value))
const formerHeaders = computed(() => createHeaders(formerPeople.value))
</script>

<template>
  <div class="flex flex-col gap-y-8">
    <section v-if="currentPeople.length">
      <DataTableClientSide
        title="Liste synthétique actuelle"
        :headers="currentHeaders"
        :rows-data="currentPeople"
        :pagination-page-size="20"
      />
    </section>

    <section>
      <DataTableClientSide
        title="Liste synthétique historique"
        :headers="formerHeaders"
        :rows-data="formerPeople"
        :pagination-page-size="20"
      />
    </section>
  </div>
</template>
