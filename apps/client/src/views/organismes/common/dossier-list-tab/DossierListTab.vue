<script lang="ts" setup>
import apiClient from '@/api/api-client'
import type { RowDataType } from '@/components/datatable/client-side/DataTableClientSide.vue'
import useToaster from '@/composables/use-toaster'
import { routeNames } from '@/router/route-names'
import { canAccessDemarche } from '@biblio-num/shared'
import type { IOrganismeDossier, IRole, organismeCategoryKey } from '@biblio-num/shared'
import { dossierListHeaders } from './table-headers.const'

type IAuthorizeOrganismeDossier = IOrganismeDossier & RowDataType
const props = defineProps<{
  role?: IRole;
  organismeId: string;
  organismeType: organismeCategoryKey;
}>()

const router = useRouter()
const toaster = useToaster()
const rowsdata = ref<IAuthorizeOrganismeDossier[]>([])

const updateListeDossiers = async () => {
  try {
    const dossiers = await apiClient.hubListDossiers(props.organismeType, props.organismeId)
    rowsdata.value = dossiers.map((r) => {
      const row = r as IAuthorizeOrganismeDossier
      row.authorized = row.isClickable && props.role ? canAccessDemarche(Number(row.id), props.role) : false
      row.cursor = row.authorized ? 'pointer' : 'not-allowed'
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
      :headers="dossierListHeaders"
      :rows-data="rowsdata"
      data-key="id"
      :pagination-page-size="20"
      @row-click="rowClick"
    />
  </div>
</template>
