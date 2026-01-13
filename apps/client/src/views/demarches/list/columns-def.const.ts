import type { BNColDef } from '@/components/datatable/server-side/bn-col-def.interface'
import { dateToStringFr } from '@/utils'
import OrganismeBadgesRenderer from '@/components/Badges/organisme/OrganismeBadgesRenderer.vue'
import { organismeTypes } from '@biblio-num/shared'

const baseColDef: BNColDef = {
  filter: 'agTextColumnFilter',
  menuTabs: ['filterMenuTab'],
  autoHeight: true,
}

export const demarcheColumnDefs: BNColDef[] = [
  {
    ...baseColDef,
    headerName: 'id',
    field: 'id',
    hide: true,
  },
  {
    ...baseColDef,
    headerName: 'N° Démarche DS',
    field: 'dsId',
    type: 'number',
    width: 200,
    filter: 'agNumberColumnFilter',
  },
  {
    ...baseColDef,
    headerName: 'Types',
    field: 'types',
    filter: 'agSetColumnFilter',
    filterParams: {
      values: organismeTypes,
      cellRenderer: OrganismeBadgesRenderer,
      targetFilterType: 'strings',
    },
    cellRenderer: OrganismeBadgesRenderer,
    width: 200,
  },
  {
    ...baseColDef,
    headerName: 'Libellé de la démarche',
    field: 'title',
    type: 'text',
    width: 600,
  },
  {
    ...baseColDef,
    headerName: 'Créé le',
    field: 'dsCreatedAt',
    valueFormatter: ({ value }: { value: Date }) => dateToStringFr(value),
    type: 'date',
    filter: 'agDateColumnFilter',
    width: 200,
  },
  {
    ...baseColDef,
    headerName: 'Publié le',
    field: 'dsPublishedAt',
    valueFormatter: ({ value }: { value: Date }) => dateToStringFr(value),
    type: 'date',
    filter: 'agDateColumnFilter',
    width: 200,
  },
]
