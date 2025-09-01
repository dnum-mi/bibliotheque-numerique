import type { ColDef } from 'ag-grid-community'
import OrganismeBadgesRenderer from '@/components/Badges/organisme/OrganismeBadgesRenderer.vue'
import { organismeTypes, dOrganismeTypeDictionary, mapOrganismeFieldHeader } from '@biblio-num/shared'
import type { OrganismeTypeKey } from '@biblio-num/shared'

const baseColDef: ColDef = {
  filter: 'agTextColumnFilter',
  menuTabs: ['filterMenuTab'],
  autoHeight: true,
}

const startYear = 2020 // should correcpond to the configuration  DDC_FIRST_CONTROL_YEAR
const years = Array.from({ length: new Date().getFullYear() - startYear + 1 }, (_, i) => startYear + i)

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
      valueFormatter: ({ value }: { value: OrganismeTypeKey }) => dOrganismeTypeDictionary[value],
    },
    valueFormatter: ({ value }: { value: OrganismeTypeKey }) => dOrganismeTypeDictionary[value],
    menuTabs: ['filterMenuTab'],
    width: 100,
  },
  {
    ...baseColDef,
    headerName: mapOrganismeFieldHeader.idRna,
    field: 'idRna',
    width: 200,
  },
  {
    ...baseColDef,
    headerName: mapOrganismeFieldHeader.idRnf,
    field: 'idRnf',
    width: 200,
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
  {
    ...baseColDef,
    headerName: mapOrganismeFieldHeader.missingDeclarationYears,
    filter: 'customNumbersFilter',
    filterParams: {
      numbers: years,
    },
    valueFormatter: ({ value }: { value: number[] }) => value.join(' - '),
    cellStyle: { color: 'red', 'font-weight': 'bolder' },
    field: 'missingDeclarationYears',
  },
]
