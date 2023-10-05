import type { ColDef } from 'ag-grid-community'
import OrganismeBadgesRenderer from '@/components/Badges/OrganismeBadgesRenderer.vue'

const baseColDef: ColDef = {
  filter: 'agTextColumnFilter',
  menuTabs: ['filterMenuTab'],
  autoHeight: true,
}

export const listOrganismeColumnDef: ColDef[] = [
  {
    ...baseColDef,
    headerName: 'id',
    field: 'id',
    hide: true,
  },
  {
    ...baseColDef,
    headerName: 'Titre',
    field: 'title',
    width: 350,
  },
  {
    headerName: 'Type',
    field: 'type',
    cellRenderer: OrganismeBadgesRenderer,
    filter: 'agTextColumnFilter',
    menuTabs: ['filterMenuTab'],
    width: 150,
  },
  {
    ...baseColDef,
    headerName: 'N° RNA',
    field: 'idRna',
    width: 150,
  },
  {
    ...baseColDef,
    headerName: 'N° RNF',
    field: 'idRnf',
    width: 150,
  },
  {
    ...baseColDef,
    headerName: 'Ville',
    field: 'addressCityName',
  },
  {
    ...baseColDef,
    headerName: 'Code postal',
    field: 'addressPostalCode',
    width: 150,
  },
  {
    ...baseColDef,
    headerName: 'Email',
    field: 'email',
  },
  {
    ...baseColDef,
    headerName: 'Téléphone',
    field: 'phoneNumber',
  },
]
