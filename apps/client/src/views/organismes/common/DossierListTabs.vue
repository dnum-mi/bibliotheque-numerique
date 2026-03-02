<script lang="ts" setup>
import apiClient from '@/api/api-client'
import type { RowDataType } from '@/components/datatable/client-side/DataTableClientSide.vue'
import useToaster from '@/composables/use-toaster'
import { routeNames } from '@/router/route-names'
import type { HeaderDataTable } from '@/shared/types'
import { canAccessDemarche, FieldType, FormatFunctionRef } from '@biblio-num/shared'
import type { IOrganismeDossier, IRole, organismeCategoryKey } from '@biblio-num/shared'
import StatusBadgesRenderer from '@/components/Badges/status/StatusBadgesRenderer.vue'
import { getDataTableFilterFromFieldType } from '@/components/datatable/server-side/filters.utils'
import type { ISetFilterParams } from '@/components/datatable/server-side/data-table-types'

type IAuthorizeOrganismeDossier = IOrganismeDossier & RowDataType
const props = defineProps<{
  role?: IRole;
  organismeId: string;
  organismeType: organismeCategoryKey;
}>()

const headers: HeaderDataTable[] = [
  {
    field: 'id',
    text: 'Id',
    type: 'hidden',
  },
  {
    field: 'source',
    text: 'Source',
    renderer: markRaw(StatusBadgesRenderer),
    filterable: true,
    ...(getDataTableFilterFromFieldType(FieldType.enum, FormatFunctionRef.status) as {
      filter: string;
      filterParams: ISetFilterParams;
    }),
    filter: 'agSetColumnFilter',
    width: 150,
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
      filter: string;
      filterParams: ISetFilterParams;
    }),
    filter: 'agSetColumnFilter',
  },
  {
    field: 'dateDepot',
    text: 'Date de dépôt',
    valueFormatter: (params: { value: string }) => params.value
      ? new Intl.DateTimeFormat('fr').format(new Date(params.value))
      : '',
    filter: 'agMultiColumnFilter',
    filterable: true,
    width: 150,
  },
  {
    field: 'dateDecision',
    text: 'Date de décision',
    valueFormatter: (params: { value: string }) => params.value
      ? new Intl.DateTimeFormat('fr').format(new Date(params.value))
      : '',
    filter: 'agMultiColumnFilter',
    filterable: true,
    width: 150,
  },
  {
    field: 'datePublication',
    text: 'Date de publication',
    valueFormatter: (params: { value: string }) => params.value
      ? new Intl.DateTimeFormat('fr').format(new Date(params.value))
      : '',
    filter: 'agMultiColumnFilter',
    filterable: true,
    width: 150,
  },
]

const router = useRouter()
const toaster = useToaster()
const rowsdata = ref<IAuthorizeOrganismeDossier[]>([])

const updateListeDossiers = async () => {
  try {
    const dossiers = await apiClient.hubListDossiers(props.organismeType, props.organismeId)
    rowsdata.value = dossiers.map((r) => {
      const row = r as IAuthorizeOrganismeDossier
      if (props.role) {
        row.authorized = canAccessDemarche(Number(row.id), props.role)
      } else {
        row.authorized = false
      }
      if (row.authorized) {
        row.cursor = 'pointer'
      } else {
        row.cursor = 'not-allowed'
      }
      row.dateDepot = row.dateDepot ? new Date(row.dateDepot).toISOString() : null
      return row
    })
  } catch (error) {
    console.warn(error)
    toaster.addErrorMessage({ description: 'Impossible de récupérer la liste des dossiers de cet organisme' })
  }
}

watch(() => props.organismeId, updateListeDossiers, { immediate: true })

const rowClick = (data: unknown) => {
  const d = data as IAuthorizeOrganismeDossier
  if (d.isClickable) {
    if (d.authorized) {
      router.push({ name: routeNames.DOSSIERS, params: { id: d.id } })
      return
    }
    toaster.addErrorMessage({ description: 'Accés non autorisé' })
  }
}
</script>

<template>
  <div class="fr-p-3v">
    <DataTableClientSide
      :headers="headers"
      :rows-data="rowsdata"
      data-key="id"
      :pagination-page-size="20"
      @row-click="rowClick"
    />
  </div>
</template>
