import type { ColDef } from 'ag-grid-community'
import OrganismeBadgesRenderer from '@/components/Badges/organisme/OrganismeBadgesRenderer.vue'
import {
  organismeTypes,
  dOrganismeTypeDictionary,
  mapOrganismeFieldHeader,
  type OrganismeTypeKey,
} from '@biblio-num/shared'
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
    headerName: mapOrganismeFieldHeader.title,
    field: 'title',
    width: 350,
  },
  {
    headerName: mapOrganismeFieldHeader.type,
    field: 'type',
    cellRenderer: OrganismeBadgesRenderer,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: organismeTypes,
    },
    valueFormatter: ({ value }: { value: OrganismeTypeKey}) => dOrganismeTypeDictionary[value],
    menuTabs: ['filterMenuTab'],
    width: 150,
  },
  {
    ...baseColDef,
    headerName: mapOrganismeFieldHeader.idRna,
    field: 'idRna',
    width: 150,
  },
  {
    ...baseColDef,
    headerName: mapOrganismeFieldHeader.idRnf,
    field: 'idRnf',
    width: 150,
  },
  {
    ...baseColDef,
    headerName: mapOrganismeFieldHeader.addressCityName,
    field: 'addressCityName',
  },
  {
    ...baseColDef,
    headerName: mapOrganismeFieldHeader.addressPostalCode,
    field: 'addressPostalCode',
    width: 150,
  },
  {
    ...baseColDef,
    headerName: mapOrganismeFieldHeader.email,
    field: 'email',
  },
  {
    ...baseColDef,
    headerName: mapOrganismeFieldHeader.phoneNumber,
    field: 'phoneNumber',
  },
]
