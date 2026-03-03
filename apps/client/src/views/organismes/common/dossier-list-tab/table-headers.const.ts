import type { HeaderDataTable } from '@/shared/types'
import StatusBadgesRenderer from '@/components/Badges/status/StatusBadgesRenderer.vue'
import { getDataTableFilterFromFieldType } from '@/components/datatable/server-side/filters.utils'
import { FieldType, FormatFunctionRef } from '@biblio-num/shared'
import type { ISetFilterParams } from '@/components/datatable/server-side/data-table-types'
import { dateToStringFr } from '@/utils'

const makeDateColumn = ({ field, text }: Pick<HeaderDataTable, 'field' | 'text'>): HeaderDataTable => ({
  field,
  text,
  valueFormatter: (params: { value: Date }) => dateToStringFr(params.value),
  filter: 'agMultiColumnFilter',
  filterable: true,
})

export const dossierListHeaders: HeaderDataTable[] = [
  {
    field: 'id',
    text: 'Id',
    type: 'hidden',
  },
  {
    field: 'source',
    text: 'Source',
    valueFormatter: (params: { value: string }) => params.value.toUpperCase(),
    filterable: true,
  },
  {
    field: 'demarche',
    text: 'Demarche',
  },
  {
    field: 'statut',
    text: 'Statut',
    renderer: markRaw(StatusBadgesRenderer),
    filterable: true,
    ...(getDataTableFilterFromFieldType(FieldType.enum, FormatFunctionRef.status) as {
      filter: string
      filterParams: ISetFilterParams
    }),
    filter: 'agSetColumnFilter',
  },
  makeDateColumn({ field: 'dateDepot', text: 'Date de dépôt' }),
  makeDateColumn({ field: 'dateDecision', text: 'Date de décision' }),
  makeDateColumn({ field: 'datePublication', text: 'Date de publication' }),
]
