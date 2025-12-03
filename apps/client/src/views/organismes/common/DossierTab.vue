<script lang="ts" setup>
import type { ILeanDossierOutput, IRole } from '@biblio-num/shared'
import { canAccessDemarche } from '@biblio-num/shared'

import apiClient from '@/api/api-client.ts'
import { routeNames } from '@/router/route-names.ts'
import { getPrefecture } from '../../../utils'
import type { HeaderDataTable } from '@/shared/types'
import StatusBadgesRenderer from '@/components/Badges/status/StatusBadgesRenderer.vue'
import type { RowDataType } from '@/components/BiblioNumDataTable.vue'

type ILeanDossierOutputWithAuthorizeOption = ILeanDossierOutput & RowDataType
const props = defineProps<{
  role?: IRole;
  organismeId: string;
}>()

const router = useRouter()
const headers: HeaderDataTable[] = [
  {
    value: 'id',
    text: 'Id',
    type: 'hidden',
    filterable: false,
  },
  {
    value: 'demarcheId',
    text: 'Démarche',
    type: 'hidden',
    filterable: false,
  },
  {
    value: 'demarcheTitle',
    text: 'Libellé',
    filterable: false,
  },
  {
    value: 'prefecture',
    text: 'Service instructeur',
    valueFormatter: (params: { value: string }) => getPrefecture(params.value),
    filterable: false,
  },
  {
    value: 'state',
    text: 'État',
    renderer: StatusBadgesRenderer,
    filterable: false,
  },
  {
    value: 'dateDepot',
    text: 'Dépôt',
    valueFormatter: (params: { value: string }) => new Date(params.value).toLocaleDateString(),
    filter: 'agMultiColumnFilter',
    filterable: false,
  },
] as const

const rowsdata = ref<ILeanDossierOutputWithAuthorizeOption[]>([])

const toaster = useToaster()

const updateListeDossiers = async () => {
  try {
    rowsdata.value = (await apiClient.getOrganismeDossiers(props.organismeId)).map(r => {
      const row = r as ILeanDossierOutputWithAuthorizeOption
      row.authorized = canAccessDemarche(row.demarcheId, props.role)
      if (row.authorized) {
        row.cursor = 'pointer'
        // row.title = 'Cliquez pour accéder à ce dossier'
      } else {
        row.cursor = 'not-allowed'
        // row.title = 'Vous n’avez pas les droits d\'accès à cette démarche, ce dossier est donc inaccessible'
      }

      return row
    }).sort((a, b) => {
      const dateA = a?.dateDepot?.getTime()
      const dateB = b?.dateDepot?.getTime()
      return dateB - dateA
    })
  } catch (error) {
    console.warn(error)
    toaster.addErrorMessage({ description: 'Impossible de récupérer la liste des dossiers de cet organisme' })
  }
}

watch(() => props.organismeId, updateListeDossiers, { immediate: true })

const rowClick = (data: unknown) => {
  const d = data as ILeanDossierOutputWithAuthorizeOption
  if (d.authorized) {
    router.push({ name: routeNames.DOSSIERS, params: { id: d.id } })
    return
  }
  toaster.addErrorMessage({ description: 'Accés non autorisé' })
}
</script>

<template>
  <BiblioNumDataTable
    class="fr-text fr-text--bold bn-color-table w-full"
    :headers="headers"
    :rows-data="rowsdata"
    :pagination="false"
    @row-click="rowClick"
  />
</template>
